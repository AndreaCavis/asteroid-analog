// src\server\utils\mongoDB.ts

import { MongoClient, ServerApiVersion, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const uri = `mongodb+srv://${process.env['MONGODB_USER']}:${process.env['MONGODB_PASSWORD']}@cluster0.nfxxv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

export async function connectToDB(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, options);

  await client.connect();

  // 🧪 Ensure connection is alive
  await client.db('admin').command({ ping: 1 });

  const db = client.db('asteroid-DB');

  // 🧠 Cache for reuse
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
