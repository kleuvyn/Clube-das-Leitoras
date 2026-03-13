import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: DrizzleDb | undefined;
};

function getDb(): DrizzleDb {
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não encontrada no arquivo .env');
  }

  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    ssl: 'require',
    prepare: false,
  });

  const db = drizzle(client, { schema });
  globalForDb.db = db;
  return db;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop: string | symbol) {
    const instance = getDb();
    const value = (instance as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as Function).bind(instance) : value;
  },
});
