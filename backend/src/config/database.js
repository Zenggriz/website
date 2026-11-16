import { MongoClient } from 'mongodb';

export async function connectDatabase({
  uri = process.env.MONGODB_URI,
  databaseName = process.env.MONGODB_DB_NAME || 'zenggrix',
} = {}) {
  if (!uri) throw new Error('Configure MONGODB_URI in backend/.env.');
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db(databaseName);
  return { client, database };
}

export async function initializeDatabase(database) {
  const licenses = database.collection('licenses');
  await Promise.all([
    licenses.createIndex({ id: 1 }, { unique: true }),
    licenses.createIndex({ keyHash: 1 }, { unique: true }),
    licenses.createIndex({ createdAt: -1 }),
  ]);
}
