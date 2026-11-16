import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { generateKeyPairSync, verify } from 'node:crypto';
import { createApp } from '../server.js';
import MemoryDatabase from '../../../test-support/memory-mongo.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
const db = new MemoryDatabase();
let server;
let baseUrl;
let cookie = '';

before(async () => {
  const app = createApp({
    db,
    frontendUrl: 'http://localhost:5173',
    adminUsername: 'test-admin',
    adminPassword: 'a-test-password',
    sessionSecret: 'a-test-session-secret-with-at-least-32-characters',
    privateKey,
    publicKey,
    production: false,
  });
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function call(path, { method = 'GET', body, authenticated = true, origin } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return { response, result };
}

test('requires admin login and issues a signed license that can be extended', async () => {
  const unauthorized = await call('/api/licenses');
  assert.equal(unauthorized.response.status, 401);

  const denied = await call('/api/auth/login', {
    method: 'POST',
    body: { username: 'test-admin', password: 'wrong' },
    authenticated: false,
  });
  assert.equal(denied.response.status, 401);

  const login = await call('/api/auth/login', {
    method: 'POST',
    body: { username: 'test-admin', password: 'a-test-password' },
    authenticated: false,
  });
  assert.equal(login.response.status, 200);

  const create = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Example POS',
      email: 'owner@example.test',
      productType: 'POS',
      productName: 'Shop POS',
      monthlyPrice: 12000,
      currency: 'PKR',
      paidThrough: '2099-01-31',
      subscriptionMode: 'offline',
      refreshAfterDays: 25,
    },
  });
  assert.equal(create.response.status, 201);
  assert.match(create.result.apiKey, /^zgx_/);

  const check = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { licenseKey: create.result.apiKey },
  });
  assert.equal(check.response.status, 200);
  assert.equal(check.response.headers.get('access-control-allow-origin'), '*');
  assert.equal(check.result.status, 'active');
  assert.equal(check.result.offlineAllowed, true);
  assert.equal(check.result.refreshAfterDays, 25);
  assert.equal(check.result.paidThrough, '2099-01-31');
  assert.ok(Date.parse(check.result.offlineUntil) <= Date.now() + 30 * 24 * 60 * 60 * 1000 + 1000);

  const [header, payload, signature] = check.result.token.split('.');
  assert.ok(header);
  assert.equal(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, 'base64url')), true);
  assert.equal(JSON.parse(Buffer.from(payload, 'base64url').toString()).sub, create.result.license.id);

  const extend = await call(`/api/licenses/${create.result.license.id}/extend`, {
    method: 'POST',
    body: { months: 1 },
  });
  assert.equal(extend.response.status, 200);
  assert.equal(extend.result.license.paidThrough, '2099-02-28');

  const onlineOnly = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Online-only Client',
      productType: 'Web app',
      monthlyPrice: 0,
      currency: 'USD',
      paidThrough: '2099-01-31',
      subscriptionMode: 'online',
    },
  });
  assert.equal(onlineOnly.response.status, 201);
  assert.equal(onlineOnly.result.license.subscriptionMode, 'online');
  const onlineCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: onlineOnly.result.apiKey },
  });
  assert.equal(onlineCheck.response.status, 200);
  assert.equal(onlineCheck.result.offlineAllowed, false);
  assert.equal(onlineCheck.result.offlineUntil, null);
  assert.equal(onlineCheck.result.refreshAfterDays, 22);
  const onlineClaims = JSON.parse(Buffer.from(onlineCheck.result.token.split('.')[1], 'base64url').toString());
  assert.equal(onlineClaims.mode, 'online');
  assert.equal(onlineClaims.offlineAllowed, false);
  assert.ok(onlineClaims.exp * 1000 <= Date.now() + 5 * 60 * 1000 + 1000);
});

test('rejects invalid input and blocks disabled and expired client licenses', async () => {
  const invalid = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: '',
      email: '',
      productType: 'POS',
      productName: '',
      monthlyPrice: -1,
      currency: 'PKR',
      paidThrough: '2099-02-30',
      refreshAfterDays: 19,
    },
  });
  assert.equal(invalid.response.status, 400);

  const create = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Expired Client',
      productType: 'ERP',
      monthlyPrice: 0,
      currency: 'PKR',
      paidThrough: '2000-01-01',
    },
  });
  assert.equal(create.response.status, 201);
  const expired = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: create.result.apiKey },
  });
  assert.equal(expired.response.status, 403);
  assert.equal(expired.result.status, 'expired');

  const disabled = await call(`/api/licenses/${create.result.license.id}`, {
    method: 'PATCH',
    body: { active: false },
  });
  assert.equal(disabled.response.status, 200);
  const blocked = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { licenseKey: create.result.apiKey },
  });
  assert.equal(blocked.response.status, 403);
  assert.equal(blocked.result.status, 'disabled');
  assert.equal(blocked.response.headers.get('access-control-allow-origin'), '*');

  const publicKeyResponse = await call('/api/public-key', {
    authenticated: false,
    origin: 'https://client.example',
  });
  assert.equal(publicKeyResponse.response.status, 200);
  assert.equal(publicKeyResponse.response.headers.get('access-control-allow-origin'), '*');

  const foreignAdminLogin = await call('/api/auth/login', {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { username: 'test-admin', password: 'a-test-password' },
  });
  assert.equal(foreignAdminLogin.response.status, 403);
  assert.equal(foreignAdminLogin.response.headers.get('access-control-allow-origin'), null);
});

test('defaults new clients to offline checks every 22 days', async () => {
  const login = await call('/api/auth/login', {
    method: 'POST',
    body: { username: 'test-admin', password: 'a-test-password' },
    authenticated: false,
  });
  assert.equal(login.response.status, 200);
  const result = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Default policy',
      productType: 'POS',
      monthlyPrice: 100,
      currency: 'PKR',
      paidThrough: '2099-01-31',
    },
  });
  assert.equal(result.response.status, 201);
  assert.equal(result.result.license.subscriptionMode, 'offline');
  assert.equal(result.result.license.refreshAfterDays, 22);
  assert.equal(result.result.license.passwordRecoveryEnabled, false);
});

test('supports optional computer locks, paid-through edits, and license key rotation', async () => {
  const created = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Device-bound Client',
      productType: 'POS',
      monthlyPrice: 100,
      currency: 'PKR',
      paidThrough: '2099-01-31',
    },
  });
  assert.equal(created.response.status, 201);
  const licenseId = created.result.license.id;
  const originalKey = created.result.apiKey;
  const fingerprint = 'a'.repeat(64);

  const unlockedCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey },
  });
  assert.equal(unlockedCheck.response.status, 200);

  const edited = await call(`/api/licenses/${licenseId}`, {
    method: 'PATCH',
    body: { paidThrough: '2099-06-15', computerFingerprint: fingerprint.toUpperCase() },
  });
  assert.equal(edited.response.status, 200);
  assert.equal(edited.result.license.paidThrough, '2099-06-15');
  assert.equal(edited.result.license.computerFingerprint, fingerprint);

  const missingFingerprint = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey },
  });
  assert.equal(missingFingerprint.response.status, 403);
  assert.equal(missingFingerprint.result.status, 'device_mismatch');

  const mismatchedFingerprint = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey, computerFingerprint: 'b'.repeat(64) },
  });
  assert.equal(mismatchedFingerprint.response.status, 403);

  const lockedCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey, computerFingerprint: fingerprint },
  });
  assert.equal(lockedCheck.response.status, 200);
  const claims = JSON.parse(Buffer.from(lockedCheck.result.token.split('.')[1], 'base64url').toString());
  assert.equal(claims.computerFingerprint, fingerprint);

  const invalidFingerprint = await call(`/api/licenses/${licenseId}`, {
    method: 'PATCH',
    body: { computerFingerprint: 'not-a-fingerprint' },
  });
  assert.equal(invalidFingerprint.response.status, 400);

  const unlocked = await call(`/api/licenses/${licenseId}`, {
    method: 'PATCH',
    body: { computerFingerprint: '' },
  });
  assert.equal(unlocked.response.status, 200);
  assert.equal(unlocked.result.license.computerFingerprint, null);
  const anyDeviceCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey },
  });
  assert.equal(anyDeviceCheck.response.status, 200);

  const rotated = await call(`/api/licenses/${licenseId}/rotate-key`, { method: 'POST' });
  assert.equal(rotated.response.status, 200);
  assert.match(rotated.result.apiKey, /^zgx_/);
  assert.notEqual(rotated.result.apiKey, originalKey);
  assert.equal(rotated.result.license.keyPrefix, rotated.result.apiKey.slice(0, 12));
  const oldKeyCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: originalKey },
  });
  assert.equal(oldKeyCheck.response.status, 404);
  const newKeyCheck = await call('/api/licenses/check', {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: rotated.result.apiKey },
  });
  assert.equal(newKeyCheck.response.status, 200);

  const notFound = await call('/api/licenses/missing/rotate-key', { method: 'POST' });
  assert.equal(notFound.response.status, 404);
});

test('requires admin recovery enablement and consumes a one-time reset ticket', async () => {
  const created = await call('/api/licenses', {
    method: 'POST',
    body: {
      customerName: 'Password recovery client',
      productType: 'POS',
      monthlyPrice: 100,
      currency: 'PKR',
      paidThrough: '2099-12-31',
      computerFingerprint: 'c'.repeat(64),
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.result.license.passwordRecoveryEnabled, false);
  const locked = await call(`/api/licenses/${created.result.license.id}`, {
    method: 'PATCH',
    body: { computerFingerprint: 'c'.repeat(64) },
  });
  assert.equal(locked.response.status, 200);

  const recoveryPath = '/api/licenses/recovery/check';
  const denied = await call(recoveryPath, {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { licenseKey: created.result.apiKey, computerFingerprint: 'c'.repeat(64) },
  });
  assert.equal(denied.response.status, 403);
  assert.equal(denied.result.status, 'recovery_disabled');
  assert.equal(denied.response.headers.get('access-control-allow-origin'), '*');

  const enabled = await call(`/api/licenses/${created.result.license.id}`, {
    method: 'PATCH',
    body: { passwordRecoveryEnabled: true },
  });
  assert.equal(enabled.response.status, 200);
  assert.equal(enabled.result.license.passwordRecoveryEnabled, true);

  const wrongDevice = await call(recoveryPath, {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: created.result.apiKey, computerFingerprint: 'd'.repeat(64) },
  });
  assert.equal(wrongDevice.response.status, 403);
  assert.equal(wrongDevice.result.status, 'device_mismatch');

  const allowed = await call(recoveryPath, {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { licenseKey: created.result.apiKey, computerFingerprint: 'c'.repeat(64) },
  });
  assert.equal(allowed.response.status, 200);
  assert.equal(allowed.result.status, 'recovery_allowed');
  assert.equal(allowed.result.recoveryAllowed, true);
  assert.equal(allowed.result.recoveryScope, 'password-reset-only');
  assert.equal(allowed.response.headers.get('access-control-allow-origin'), '*');
  const [headerPart, payloadPart, signaturePart] = allowed.result.recoveryToken.split('.');
  assert.equal(verify(
    'RSA-SHA256',
    Buffer.from(`${headerPart}.${payloadPart}`),
    publicKey,
    Buffer.from(signaturePart, 'base64url'),
  ), true);
  const claims = JSON.parse(Buffer.from(payloadPart, 'base64url').toString());
  assert.equal(claims.purpose, 'password-recovery');
  assert.equal(claims.sub, created.result.license.id);
  assert.equal(claims.computerFingerprint, 'c'.repeat(64));
  assert.ok(claims.exp * 1000 <= Date.now() + 10 * 60 * 1000 + 1000);

  const completed = await call('/api/licenses/recovery/complete', {
    method: 'POST',
    authenticated: false,
    origin: 'https://client.example',
    body: { recoveryToken: allowed.result.recoveryToken },
  });
  assert.equal(completed.response.status, 200);
  assert.equal(completed.result.status, 'recovery_completed');
  assert.equal(completed.result.passwordRecoveryEnabled, false);
  assert.equal(completed.response.headers.get('access-control-allow-origin'), '*');

  const replay = await call('/api/licenses/recovery/complete', {
    method: 'POST',
    authenticated: false,
    body: { recoveryToken: allowed.result.recoveryToken },
  });
  assert.equal(replay.response.status, 409);

  const afterCompletion = await call(recoveryPath, {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: created.result.apiKey, computerFingerprint: 'c'.repeat(64) },
  });
  assert.equal(afterCompletion.response.status, 403);
  assert.equal(afterCompletion.result.status, 'recovery_disabled');

  const reenabled = await call(`/api/licenses/${created.result.license.id}`, {
    method: 'PATCH',
    body: { passwordRecoveryEnabled: true },
  });
  assert.equal(reenabled.response.status, 200);
  const ticket = await call(recoveryPath, {
    method: 'POST',
    authenticated: false,
    body: { licenseKey: created.result.apiKey, computerFingerprint: 'c'.repeat(64) },
  });
  assert.equal(ticket.response.status, 200);
  const disabled = await call(`/api/licenses/${created.result.license.id}`, {
    method: 'PATCH',
    body: { passwordRecoveryEnabled: false },
  });
  assert.equal(disabled.response.status, 200);
  const revokedTicket = await call('/api/licenses/recovery/complete', {
    method: 'POST',
    authenticated: false,
    body: { recoveryToken: ticket.result.recoveryToken },
  });
  assert.equal(revokedTicket.response.status, 409);
});

test('returns a clear JSON response when admin login attempts are rate limited', async () => {
  let limited;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    limited = await call('/api/auth/login', {
      method: 'POST',
      authenticated: false,
      body: { username: 'test-admin', password: 'wrong-password' },
    });
    if (limited.response.status === 429) break;
  }
  assert.equal(limited.response.status, 429);
  assert.match(limited.result.error, /Too many sign-in attempts/);
  assert.ok(limited.result.retryAfterSeconds > 0);
  assert.ok(Number(limited.response.headers.get('retry-after')) > 0);
});
