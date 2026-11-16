import { generateKeyPairSync } from 'node:crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

console.log(`LICENSE_PRIVATE_KEY_B64=${Buffer.from(privateKey).toString('base64')}`);
console.log(`LICENSE_PUBLIC_KEY_B64=${Buffer.from(publicKey).toString('base64')}`);
