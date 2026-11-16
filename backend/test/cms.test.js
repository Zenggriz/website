import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { generateKeyPairSync } from 'node:crypto';
import { createBackendApp } from '../src/server.js';
import MemoryDatabase from '../test-support/memory-mongo.js';

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
  const app = await createBackendApp({
    db,
    frontendUrl: 'http://localhost:5173',
    adminUsername: 'cms-admin',
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

async function call(path, { method = 'GET', body, authenticated = true, origin = 'http://localhost:5173' } = {}) {
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

test('serves public CMS content and requires admin login to publish valid edits', async () => {
  const publicContent = await call('/api/cms/content', {
    authenticated: false,
    origin: 'https://public-site.example',
  });
  assert.equal(publicContent.response.status, 200);
  assert.equal(publicContent.response.headers.get('access-control-allow-origin'), '*');
  assert.equal(publicContent.result.content.company.name, 'Zenggrix');

  const denied = await call('/api/cms/content', {
    method: 'PUT',
    authenticated: false,
    body: { content: publicContent.result.content },
  });
  assert.equal(denied.response.status, 401);

  const login = await call('/api/auth/login', {
    method: 'POST',
    authenticated: false,
    body: { username: 'cms-admin', password: 'a-test-password' },
  });
  assert.equal(login.response.status, 200);

  const changedContent = structuredClone(publicContent.result.content);
  changedContent.company.tagline = 'Content published live';
  const saved = await call('/api/cms/content', {
    method: 'PUT',
    body: { content: changedContent },
  });
  assert.equal(saved.response.status, 200);
  assert.equal(saved.result.content.company.tagline, 'Content published live');

  const refreshed = await call('/api/cms/content');
  assert.equal(refreshed.result.content.company.tagline, 'Content published live');
});

test('rejects invalid CMS content without replacing the last published version', async () => {
  const beforeSave = await call('/api/cms/content');
  const invalid = structuredClone(beforeSave.result.content);
  invalid.pages.about = { title: '' };
  const rejected = await call('/api/cms/content', {
    method: 'PUT',
    body: { content: invalid },
  });
  assert.equal(rejected.response.status, 400);

  const afterSave = await call('/api/cms/content');
  assert.equal(afterSave.result.content.company.tagline, 'Content published live');
});

test('allows development login and CMS saves from the localhost loopback alias', async () => {
  const origin = 'http://127.0.0.1:5173';
  const login = await call('/api/auth/login', {
    method: 'POST',
    authenticated: false,
    origin,
    body: { username: 'cms-admin', password: 'a-test-password' },
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.response.headers.get('access-control-allow-origin'), origin);
  assert.equal(login.response.headers.get('access-control-allow-credentials'), 'true');

  const session = await call('/api/auth/session', { origin });
  assert.equal(session.response.status, 200);

  const current = await call('/api/cms/content', { origin });
  const saved = await call('/api/cms/content', {
    method: 'PUT',
    origin,
    body: { content: current.result.content },
  });
  assert.equal(saved.response.status, 200);
  assert.equal(saved.response.headers.get('access-control-allow-origin'), origin);
});
