import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
  writeClient: ReturnType<typeof createClient> | undefined;
};

const readUrl = process.env.DATABASE_URL!;
const readAuthToken = process.env.DATABASE_AUTH_TOKEN!;
const writeUrl = process.env.DATABASE_WRITE_URL ?? process.env.DATABASE_URL!;
const explicitWriteAuthToken = process.env.DATABASE_WRITE_AUTH_TOKEN;
const writeAuthToken = explicitWriteAuthToken ?? process.env.DATABASE_AUTH_TOKEN!;

function decodeJwtPayload(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function isReadOnlyLibsqlToken(token?: string) {
  const payload = token ? decodeJwtPayload(token) : null;
  if (!payload || typeof payload !== 'object') return false;
  return payload.a === 'ro' || payload.a === 'read' || payload.a === 'read_only';
}

const isExplicitWriteTokenMissing = !explicitWriteAuthToken && isReadOnlyLibsqlToken(process.env.DATABASE_AUTH_TOKEN);
if (isExplicitWriteTokenMissing) {
  console.error(
    '[lib/db] DATABASE_WRITE_AUTH_TOKEN is missing and DATABASE_AUTH_TOKEN appears to be a read-only Turso token. ' +
    'Write operations will fail until a write-capable token is configured.'
  );
}

// 1. Criamos o cliente do LibSQL (Turso)
export const client = globalForDb.client ?? createClient({
  url: readUrl,
  authToken: readAuthToken,
});

export const writeClient = globalForDb.writeClient ?? createClient({
  url: writeUrl,
  authToken: writeAuthToken,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
  globalForDb.writeClient = writeClient;
}

// 2. Iniciamos o Drizzle com o driver do Turso
export const db = drizzle(client, { schema });
export const dbWrite = drizzle(writeClient, { schema });

export function isWriteBlockedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as { code?: string; message?: string; cause?: unknown };

  if (err.code === 'BLOCKED') {
    return true;
  }

  if (typeof err.message === 'string' && err.message.includes('BLOCKED')) {
    return true;
  }

  if (err.cause && typeof err.cause === 'object') {
    const cause = err.cause as { code?: string; message?: string };
    if (cause.code === 'BLOCKED') {
      return true;
    }
    if (typeof cause.message === 'string' && cause.message.includes('BLOCKED')) {
      return true;
    }
  }

  return false;
}

export type DbClient = typeof db;