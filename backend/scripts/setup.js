import { randomBytes, generateKeyPairSync } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function setupEnvironment({ envPath = path.join(ROOT, '.env'), templatePath = path.join(ROOT, '.env.example') } = {}) {
  const existed = existsSync(envPath);
  let contents = existed ? readFileSync(envPath, 'utf8') : readFileSync(templatePath, 'utf8');
  const parsed = Object.fromEntries(
    contents.split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value]),
  );
  const updates = {};
  const username = parsed.ADMIN_USERNAME;
  const password = parsed.ADMIN_PASSWORD;
  const sessionSecret = parsed.ADMIN_SESSION_SECRET;
  if (!username || username.startsWith('replace-with-')) updates.ADMIN_USERNAME = 'admin';
  if (!password || password.startsWith('replace-with-')) updates.ADMIN_PASSWORD = randomBytes(24).toString('base64url');
  if (!sessionSecret || sessionSecret.startsWith('replace-with-') || sessionSecret.length < 32) {
    updates.ADMIN_SESSION_SECRET = randomBytes(48).toString('base64url');
  }

  const privateKey = parsed.LICENSE_PRIVATE_KEY_B64;
  const publicKey = parsed.LICENSE_PUBLIC_KEY_B64;
  if (!privateKey && !publicKey) {
    const pair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    updates.LICENSE_PRIVATE_KEY_B64 = Buffer.from(pair.privateKey).toString('base64');
    updates.LICENSE_PUBLIC_KEY_B64 = Buffer.from(pair.publicKey).toString('base64');
  } else if (!privateKey || !publicKey) {
    throw new Error('Only one license signing key is set in .env. Restore its matching key instead of generating a new pair.');
  }

  for (const [key, value] of Object.entries(updates)) {
    const line = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
    if (line.test(contents)) {
      contents = contents.replace(line, `${key}=${value}`);
    } else {
      contents = `${contents.trimEnd()}\n${key}=${value}\n`;
    }
  }

  writeFileSync(envPath, contents, { mode: 0o600 });
  chmodSync(envPath, 0o600);
  return { created: !existed, generatedUsername: updates.ADMIN_USERNAME === 'admin', generatedPassword: Boolean(updates.ADMIN_PASSWORD) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Usage: npm run setup');
    console.log('Creates backend/.env if needed and fills missing admin/session/signing secrets without overwriting configured values.');
  } else {
    try {
      const result = setupEnvironment();
      console.log(`Backend environment ${result.created ? 'created' : 'completed'} at backend/.env.`);
      console.log('Admin credentials and signing/session keys are saved in that local, gitignored file; do not share or commit it.');
      console.log('Check MONGODB_URI in backend/.env and ensure MongoDB is running before starting the API.');
    } catch (error) {
      console.error(`Backend setup failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
