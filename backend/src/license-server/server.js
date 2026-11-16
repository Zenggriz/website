import { createHash, createHmac, randomBytes, sign, timingSafeEqual, verify } from 'node:crypto';
import { ADMIN_SESSION_COOKIE, createAdminAuth } from '../config/admin-auth.js';
import { isAllowedFrontendOrigin } from '../config/frontend-origin.js';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import 'dotenv/config';

const SESSION_COOKIE = ADMIN_SESSION_COOKIE;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const DEFAULT_GRACE_DAYS = 30;
const PRODUCTS = new Set(['POS', 'ERP', 'Web app', 'Desktop app', 'Other']);
const CURRENCIES = new Set(['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']);

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function dateIsValid(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function addMonths(dateOnly, count) {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + count, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

function serializeLicense(row) {
  return {
    id: row.id,
    customerName: row.customerName,
    email: row.email,
    productType: row.productType,
    productName: row.productName,
    monthlyPrice: row.monthlyPrice,
    currency: row.currency,
    paidThrough: row.paidThrough,
    active: Boolean(row.active),
    subscriptionMode: row.subscriptionMode,
    refreshAfterDays: row.refreshAfterDays,
    computerFingerprint: row.computerFingerprint || null,
    passwordRecoveryEnabled: Boolean(row.passwordRecoveryEnabled),
    keyPrefix: row.keyPrefix,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function sessionCookie(value, production, maxAge = SESSION_TTL_SECONDS) {
  return [
    `${SESSION_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(production ? ['Secure'] : []),
    `Max-Age=${maxAge}`,
  ].join('; ');
}

function createSession(username, secret) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    iat: issuedAt,
    exp: issuedAt + SESSION_TTL_SECONDS,
  })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function signedEntitlement(license, privateKey, graceDays) {
  const now = new Date();
  const paidThroughEnd = Date.parse(`${license.paidThrough}T23:59:59.999Z`);
  const graceMilliseconds = graceDays * 24 * 60 * 60 * 1000;
  const offlineAllowed = license.subscriptionMode === 'offline';
  const offlineUntil = offlineAllowed
    ? Math.min(paidThroughEnd + graceMilliseconds, now.valueOf() + graceMilliseconds)
    : now.valueOf() + 5 * 60 * 1000;
  const nextCheckAt = offlineAllowed
    ? now.valueOf() + license.refreshAfterDays * 24 * 60 * 60 * 1000
    : now.valueOf();
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'zenggrix-license-server',
    sub: license.id,
    customer: license.customerName,
    product: license.productName || license.productType,
    paidThrough: license.paidThrough,
    mode: license.subscriptionMode,
    offlineAllowed,
    computerFingerprint: license.computerFingerprint || null,
    refreshAfterDays: license.refreshAfterDays,
    nextCheckAt: new Date(nextCheckAt).toISOString(),
    iat: Math.floor(now.valueOf() / 1000),
    exp: Math.floor(offlineUntil / 1000),
  })).toString('base64url');
  const content = `${header}.${payload}`;
  const signature = sign('RSA-SHA256', Buffer.from(content), privateKey).toString('base64url');
  return {
    token: `${content}.${signature}`,
    offlineAllowed,
    offlineUntil: offlineAllowed ? new Date(offlineUntil).toISOString() : null,
    nextCheckAt: new Date(nextCheckAt).toISOString(),
    refreshAfterDays: license.refreshAfterDays,
  };
}

function signedRecoveryTicket(license, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'zenggrix-license-server',
    purpose: 'password-recovery',
    sub: license.id,
    computerFingerprint: license.computerFingerprint || null,
    iat: now,
    exp: now + 10 * 60,
    jti: randomBytes(16).toString('hex'),
  })).toString('base64url');
  const content = `${header}.${payload}`;
  const signature = sign('RSA-SHA256', Buffer.from(content), privateKey).toString('base64url');
  return { token: `${content}.${signature}`, expiresAt: new Date((now + 10 * 60) * 1000).toISOString(), challengeId: JSON.parse(Buffer.from(payload, 'base64url').toString()).jti };
}

function readRecoveryTicket(token, publicKey) {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const [headerPart, payloadPart, signaturePart, extra] = token.split('.');
  if (!headerPart || !payloadPart || !signaturePart || extra) return null;
  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    const signatureIsValid = verify(
      'RSA-SHA256',
      Buffer.from(`${headerPart}.${payloadPart}`),
      publicKey,
      Buffer.from(signaturePart, 'base64url'),
    );
    if (!signatureIsValid || header.alg !== 'RS256' || payload.iss !== 'zenggrix-license-server'
      || payload.purpose !== 'password-recovery' || typeof payload.sub !== 'string'
      || typeof payload.jti !== 'string' || !Number.isInteger(payload.exp)
      || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createApp({
  db,
  frontendUrl = process.env.FRONTEND_URL,
  adminUsername = process.env.ADMIN_USERNAME,
  adminPassword = process.env.ADMIN_PASSWORD,
  sessionSecret = process.env.ADMIN_SESSION_SECRET,
  privateKey = process.env.LICENSE_PRIVATE_KEY_B64
    ? Buffer.from(process.env.LICENSE_PRIVATE_KEY_B64, 'base64').toString('utf8')
    : '',
  publicKey = process.env.LICENSE_PUBLIC_KEY_B64
    ? Buffer.from(process.env.LICENSE_PUBLIC_KEY_B64, 'base64').toString('utf8')
    : '',
  graceDays = Number(process.env.OFFLINE_GRACE_DAYS || DEFAULT_GRACE_DAYS),
  production = process.env.NODE_ENV === 'production',
} = {}) {
  if (!db) throw new Error('A connected MongoDB database is required.');
  if (!frontendUrl || !adminUsername || !adminPassword || !sessionSecret || sessionSecret.length < 32 || !privateKey || !publicKey) {
    throw new Error('Backend config is incomplete. Set FRONTEND_URL, ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET, LICENSE_PRIVATE_KEY_B64, and LICENSE_PUBLIC_KEY_B64 in backend/.env; run "npm run setup".');
  }
  if (!Number.isInteger(graceDays) || graceDays < 1 || graceDays > 90) {
    throw new Error('OFFLINE_GRACE_DAYS must be a whole number from 1 to 90.');
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  const clientCors = cors({ origin: '*' });
  const adminCors = cors({
    origin(origin, callback) {
      if (isAllowedFrontendOrigin(origin, frontendUrl, !production)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  });
  app.use((request, response, next) => {
    if (request.path === '/api/public-key' || request.path.startsWith('/api/licenses/check')
      || request.path.startsWith('/api/licenses/recovery/')) {
      return clientCors(request, response, next);
    }
    return adminCors(request, response, next);
  });
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler(request, response) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(((request.rateLimit?.resetTime?.getTime() || Date.now() + 15 * 60 * 1000) - Date.now()) / 1000),
      );
      response.setHeader('Retry-After', String(retryAfterSeconds));
      return response.status(429).json({
        error: 'Too many sign-in attempts. Wait before trying again.',
        retryAfterSeconds,
      });
    },
  }));
  app.use('/api/licenses/check', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/licenses/recovery', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));

  const requireAdmin = createAdminAuth({ username: adminUsername, sessionSecret });

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

  app.get('/api/public-key', (_request, response) => {
    response.json({ algorithm: 'RS256', publicKey });
  });

  app.post('/api/auth/login', (request, response) => {
    const { username, password } = request.body || {};
    if (typeof username !== 'string' || typeof password !== 'string'
      || !safeEqual(username, adminUsername) || !safeEqual(password, adminPassword)) {
      return response.status(401).json({ error: 'Invalid username or password.' });
    }
    response.setHeader('Set-Cookie', sessionCookie(createSession(adminUsername, sessionSecret), production));
    return response.json({ authenticated: true });
  });

  app.get('/api/auth/session', requireAdmin, (_request, response) => response.json({ authenticated: true }));

  app.post('/api/auth/logout', (_request, response) => {
    response.setHeader('Set-Cookie', sessionCookie('', production, 0));
    return response.json({ authenticated: false });
  });

  app.get('/api/licenses', requireAdmin, async (_request, response) => {
    const rows = await db.collection('licenses').find({}).sort({ createdAt: -1 }).toArray();
    return response.json({ licenses: rows.map(serializeLicense) });
  });

  app.post('/api/licenses', requireAdmin, async (request, response) => {
    const body = request.body || {};
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const productType = body.productType;
    const productName = typeof body.productName === 'string' ? body.productName.trim() : '';
    const monthlyPrice = body.monthlyPrice;
    const currency = body.currency;
    const paidThrough = body.paidThrough;
    const subscriptionMode = body.subscriptionMode ?? 'offline';
    const refreshAfterDays = body.refreshAfterDays ?? 22;
    if (!customerName || customerName.length > 120 || email.length > 254
      || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      || !PRODUCTS.has(productType) || productName.length > 120
      || !Number.isFinite(monthlyPrice) || monthlyPrice < 0 || monthlyPrice > 1_000_000_000
      || !CURRENCIES.has(currency) || !dateIsValid(paidThrough)
      || !['online', 'offline'].includes(subscriptionMode)
      || !Number.isInteger(refreshAfterDays) || refreshAfterDays < 20 || refreshAfterDays > 25) {
      return response.status(400).json({ error: 'Enter valid client, product, rent, paid-through date, online/offline mode, and a 20–25 day check interval.' });
    }
    const id = randomBytes(16).toString('hex');
    const apiKey = `zgx_${randomBytes(32).toString('base64url')}`;
    const now = new Date().toISOString();
    const license = {
      id, customerName, email, productType, productName, monthlyPrice, currency, paidThrough,
      active: true, subscriptionMode, refreshAfterDays,
      passwordRecoveryEnabled: false,
      keyHash: createHash('sha256').update(apiKey).digest('hex'),
      keyPrefix: apiKey.slice(0, 12),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('licenses').insertOne(license);
    return response.status(201).json({ license: serializeLicense(license), apiKey });
  });

  app.post('/api/licenses/:id/extend', requireAdmin, async (request, response) => {
    const months = request.body?.months;
    if (!Number.isInteger(months) || months < 1 || months > 36) {
      return response.status(400).json({ error: 'Months must be a whole number from 1 to 36.' });
    }
    const collection = db.collection('licenses');
    const row = await collection.findOne({ id: request.params.id });
    if (!row) return response.status(404).json({ error: 'License not found.' });
    const today = new Date().toISOString().slice(0, 10);
    const startDate = row.paidThrough > today ? row.paidThrough : today;
    const paidThrough = addMonths(startDate, months);
    await collection.updateOne(
      { id: row.id, paidThrough: row.paidThrough },
      { $set: { paidThrough, updatedAt: new Date().toISOString() } },
    );
    const updated = await collection.findOne({ id: row.id });
    return response.json({ license: serializeLicense(updated) });
  });

  app.post('/api/licenses/:id/rotate-key', requireAdmin, async (request, response) => {
    const collection = db.collection('licenses');
    const existing = await collection.findOne({ id: request.params.id });
    if (!existing) return response.status(404).json({ error: 'License not found.' });
    const apiKey = `zgx_${randomBytes(32).toString('base64url')}`;
    await collection.updateOne(
      { id: existing.id },
      {
        $set: {
          keyHash: createHash('sha256').update(apiKey).digest('hex'),
          keyPrefix: apiKey.slice(0, 12),
          updatedAt: new Date().toISOString(),
        },
      },
    );
    const row = await collection.findOne({ id: existing.id });
    return response.json({ license: serializeLicense(row), apiKey });
  });

  app.patch('/api/licenses/:id', requireAdmin, async (request, response) => {
    const { active, subscriptionMode, refreshAfterDays, passwordRecoveryEnabled } = request.body || {};
    const paidThrough = request.body?.paidThrough;
    const fingerprintInput = request.body?.computerFingerprint;
    const computerFingerprint = typeof fingerprintInput === 'string' && fingerprintInput !== ''
      ? fingerprintInput.toLowerCase()
      : null;
    const hasUpdates = active !== undefined || subscriptionMode !== undefined
      || refreshAfterDays !== undefined || paidThrough !== undefined
      || fingerprintInput !== undefined || passwordRecoveryEnabled !== undefined;
    if (!hasUpdates) {
      return response.status(400).json({ error: 'Provide a license field to update.' });
    }
    if ((active !== undefined && typeof active !== 'boolean')
      || (subscriptionMode !== undefined && !['online', 'offline'].includes(subscriptionMode))
      || (refreshAfterDays !== undefined
        && (!Number.isInteger(refreshAfterDays) || refreshAfterDays < 20 || refreshAfterDays > 25))
      || (paidThrough !== undefined && !dateIsValid(paidThrough))
      || (passwordRecoveryEnabled !== undefined && typeof passwordRecoveryEnabled !== 'boolean')
      || (fingerprintInput !== undefined && fingerprintInput !== null && fingerprintInput !== ''
        && (typeof fingerprintInput !== 'string' || !/^[a-f\d]{64}$/i.test(fingerprintInput)))) {
      return response.status(400).json({ error: 'Provide valid license fields, a valid paid-through date, a boolean password recovery setting, and a 64-character hexadecimal computer fingerprint (or leave it blank/null to remove the lock).' });
    }
    const collection = db.collection('licenses');
    const existing = await collection.findOne({ id: request.params.id });
    if (!existing) return response.status(404).json({ error: 'License not found.' });
    const updates = {
      ...(active === undefined ? {} : { active }),
      ...(subscriptionMode === undefined ? {} : { subscriptionMode }),
      ...(refreshAfterDays === undefined ? {} : { refreshAfterDays }),
      ...(paidThrough === undefined ? {} : { paidThrough }),
      ...(fingerprintInput === undefined ? {} : { computerFingerprint }),
      ...(passwordRecoveryEnabled === undefined ? {} : {
        passwordRecoveryEnabled,
        recoveryChallengeId: null,
      }),
      updatedAt: new Date().toISOString(),
    };
    await collection.updateOne({ id: request.params.id }, { $set: updates });
    const row = await collection.findOne({ id: request.params.id });
    return response.json({ license: serializeLicense(row) });
  });

  app.post('/api/licenses/check', async (request, response) => {
    const apiKey = request.body?.licenseKey;
    if (typeof apiKey !== 'string' || apiKey.length < 20 || apiKey.length > 128) {
      return response.status(400).json({ error: 'A valid licenseKey is required.' });
    }
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const row = await db.collection('licenses').findOne({ keyHash });
    if (!row) return response.status(404).json({ status: 'invalid', error: 'License key was not found.' });
    if (!row.active) return response.status(403).json({ status: 'disabled', error: 'This license has been disabled.' });
    if (row.computerFingerprint) {
      const fingerprint = request.body?.computerFingerprint;
      if (typeof fingerprint !== 'string' || !/^[a-f\d]{64}$/i.test(fingerprint)
        || fingerprint.toLowerCase() !== row.computerFingerprint) {
        return response.status(403).json({ status: 'device_mismatch', error: 'This license is locked to a different computer.' });
      }
    }
    const today = new Date().toISOString().slice(0, 10);
    if (row.paidThrough < today) {
      return response.status(403).json({ status: 'expired', paidThrough: row.paidThrough, error: 'Subscription has expired.' });
    }
    const entitlement = signedEntitlement(serializeLicense(row), privateKey, graceDays);
    return response.json({
      status: 'active',
      paidThrough: row.paidThrough,
      checkedAt: new Date().toISOString(),
      ...entitlement,
    });
  });

  app.post('/api/licenses/recovery/check', async (request, response) => {
    const apiKey = request.body?.licenseKey;
    if (typeof apiKey !== 'string' || apiKey.length < 20 || apiKey.length > 128) {
      return response.status(400).json({ error: 'A valid licenseKey is required.' });
    }
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const collection = db.collection('licenses');
    const row = await collection.findOne({ keyHash });
    if (!row) return response.status(404).json({ status: 'invalid', error: 'License key was not found.' });
    if (!row.active) return response.status(403).json({ status: 'disabled', error: 'This license has been disabled.' });
    const today = new Date().toISOString().slice(0, 10);
    if (row.paidThrough < today) {
      return response.status(403).json({ status: 'expired', paidThrough: row.paidThrough, error: 'Subscription has expired.' });
    }
    if (row.computerFingerprint) {
      const fingerprint = request.body?.computerFingerprint;
      if (typeof fingerprint !== 'string' || !/^[a-f\d]{64}$/i.test(fingerprint)
        || fingerprint.toLowerCase() !== row.computerFingerprint) {
        return response.status(403).json({ status: 'device_mismatch', error: 'This license is locked to a different computer.' });
      }
    }
    if (!row.passwordRecoveryEnabled) {
      return response.status(403).json({ status: 'recovery_disabled', recoveryAllowed: false, error: 'Password recovery is not enabled for this license.' });
    }
    const ticket = signedRecoveryTicket(serializeLicense(row), privateKey);
    await collection.updateOne(
      { id: row.id, passwordRecoveryEnabled: true },
      { $set: { recoveryChallengeId: ticket.challengeId, updatedAt: new Date().toISOString() } },
    );
    return response.json({
      status: 'recovery_allowed',
      recoveryAllowed: true,
      recoveryToken: ticket.token,
      expiresAt: ticket.expiresAt,
      recoveryScope: 'password-reset-only',
    });
  });

  app.post('/api/licenses/recovery/complete', async (request, response) => {
    const ticket = readRecoveryTicket(request.body?.recoveryToken, publicKey);
    if (!ticket) {
      return response.status(401).json({ status: 'invalid_recovery_token', error: 'Recovery token is invalid or expired.' });
    }
    const result = await db.collection('licenses').updateOne(
      {
        id: ticket.sub,
        passwordRecoveryEnabled: true,
        recoveryChallengeId: ticket.jti,
      },
      {
        $set: {
          passwordRecoveryEnabled: false,
          recoveryChallengeId: null,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    if (!result.matchedCount) {
      return response.status(409).json({ status: 'recovery_not_pending', error: 'Recovery is no longer enabled or this token has already been used.' });
    }
    return response.json({ status: 'recovery_completed', passwordRecoveryEnabled: false });
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') {
      return response.status(400).json({ error: 'Request body must be valid JSON.' });
    }
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Request body is too large.' });
    }
    if (error?.message === 'Origin is not allowed by CORS.') {
      return response.status(403).json({ error: error.message });
    }
    console.error(error);
    return response.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}
