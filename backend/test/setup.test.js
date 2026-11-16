import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import dotenv from 'dotenv';
import { setupEnvironment } from '../scripts/setup.js';

test('setup creates a private environment with usable secrets and is safe to rerun', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'zenggrix-backend-setup-'));
  const envPath = path.join(directory, '.env');
  const templatePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.example');
  try {
    const firstRun = setupEnvironment({ envPath, templatePath });
    const firstContents = readFileSync(envPath, 'utf8');
    const first = dotenv.parse(firstContents);
    assert.equal(firstRun.created, true);
    assert.equal(first.ADMIN_USERNAME, 'admin');
    assert.ok(first.ADMIN_PASSWORD.length >= 32);
    assert.ok(first.ADMIN_SESSION_SECRET.length >= 32);
    assert.ok(first.LICENSE_PRIVATE_KEY_B64.length > 0);
    assert.ok(first.LICENSE_PUBLIC_KEY_B64.length > 0);
    assert.equal(first.MONGODB_URI, 'mongodb://127.0.0.1:27017');
    assert.equal(statSync(envPath).mode & 0o777, 0o600);

    const secondRun = setupEnvironment({ envPath, templatePath });
    assert.equal(secondRun.created, false);
    assert.equal(readFileSync(envPath, 'utf8'), firstContents);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('setup preserves configured values and refuses to replace a partial signing key pair', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'zenggrix-backend-setup-'));
  const envPath = path.join(directory, '.env');
  const templatePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env.example');
  try {
    const partial = [
      'FRONTEND_URL=https://zenggrix.example',
      'ADMIN_USERNAME=custom-admin',
      'ADMIN_PASSWORD=custom-password',
      'ADMIN_SESSION_SECRET=0123456789abcdef0123456789abcdef',
      'LICENSE_PRIVATE_KEY_B64=existing-private-key',
      'LICENSE_PUBLIC_KEY_B64=',
      'MONGODB_URI=mongodb://db.example:27017',
    ].join('\n');
    writeFileSync(envPath, partial);

    assert.throws(
      () => setupEnvironment({ envPath, templatePath }),
      /Only one license signing key is set/,
    );
    assert.equal(readFileSync(envPath, 'utf8'), partial);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('help output does not create or alter an environment file', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'zenggrix-backend-help-'));
  const envPath = path.join(directory, '.env');
  const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/setup.js');
  try {
    const result = spawnSync(process.execPath, [scriptPath, '--help'], {
      cwd: directory,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage: npm run setup/);
    assert.equal(statSync(directory).isDirectory(), true);
    assert.throws(() => readFileSync(envPath));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
