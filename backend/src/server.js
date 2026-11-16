import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import { createAdminAuth } from './config/admin-auth.js';
import { connectDatabase, initializeDatabase } from './config/database.js';
import { createApp as createLicenseApp } from './license-server/server.js';
import { createCmsRouter } from './xencrix-cms/cms.js';

export async function createBackendApp({
  db: suppliedDatabase,
  client: suppliedClient,
  frontendUrl = process.env.FRONTEND_URL,
  adminUsername = process.env.ADMIN_USERNAME,
  adminPassword = process.env.ADMIN_PASSWORD,
  sessionSecret = process.env.ADMIN_SESSION_SECRET,
  privateKey,
  publicKey,
  graceDays,
  production = process.env.NODE_ENV === 'production',
} = {}) {
  const missing = [
    ['FRONTEND_URL', frontendUrl],
    ['ADMIN_USERNAME', adminUsername],
    ['ADMIN_PASSWORD', adminPassword],
    ['ADMIN_SESSION_SECRET', sessionSecret],
    ['LICENSE_PRIVATE_KEY_B64', privateKey || process.env.LICENSE_PRIVATE_KEY_B64],
    ['LICENSE_PUBLIC_KEY_B64', publicKey || process.env.LICENSE_PUBLIC_KEY_B64],
  ].filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing ${missing.join(', ')} in backend/.env. Run "npm run setup" from the backend folder, then restart.`);
  }
  if (sessionSecret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET in backend/.env must be at least 32 characters. Run "npm run setup" to generate one.');
  }
  let db = suppliedDatabase;
  let client = suppliedClient;
  if (!db) {
    let connection;
    try {
      connection = await connectDatabase();
    } catch (error) {
      throw new Error(`Could not connect to MongoDB using MONGODB_URI in backend/.env. Start MongoDB or set a reachable MongoDB URI. ${error.message}`, { cause: error });
    }
    db = connection.database;
    client = connection.client;
  }
  await initializeDatabase(db);
  const licenseApp = createLicenseApp({
    db,
    frontendUrl,
    adminUsername,
    adminPassword,
    sessionSecret,
    ...(privateKey ? { privateKey } : {}),
    ...(publicKey ? { publicKey } : {}),
    ...(graceDays === undefined ? {} : { graceDays }),
    production,
  });
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api/cms', express.json({ limit: '512kb' }), createCmsRouter({
    db,
    requireAdmin: createAdminAuth({ username: adminUsername, sessionSecret }),
    frontendUrl,
    allowLoopbackAliases: !production,
  }));
  app.use('/', licenseApp);
  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  app.locals.database = db;
  app.locals.mongoClient = client;
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const start = async () => {
    const app = await createBackendApp();
    const port = Number(process.env.PORT || 8787);
    const server = app.listen(port, () => console.log(`Zenggrix backend connected to MongoDB and listening on port ${port}`));
    const shutdown = async () => {
      server.close(async () => {
        await app.locals.mongoClient?.close();
        process.exitCode = 0;
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  };
  start().catch((error) => {
    console.error('Unable to start Zenggrix backend:', error);
    process.exitCode = 1;
  });
}
