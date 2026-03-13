import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não encontrada no arquivo .env');
  }

  const client = globalForDb.conn ?? postgres(connectionString);
  if (process.env.NODE_ENV !== 'production') globalForDb.conn = client;

  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop: string | symbol) {
    const instance = getDb();
    const value = (instance as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as Function).bind(instance) : value;
  },
});
