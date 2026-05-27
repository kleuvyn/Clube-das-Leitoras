import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
  writeClient: ReturnType<typeof createClient> | undefined;
};

// Se não tiver variável nenhuma, o build precisa estourar informando exatamente o erro,
// ou a aplicação retornará "dummy.db" que gera "no such table".
const rawDatabaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  console.warn("⚠️ AVISO: Nenhuma variável TURSO_DATABASE_URL ou DATABASE_URL foi encontrada nas variáveis de ambiente! O build pode falhar se precisar consultar o banco de dados.");
}

function sanitizeUrl(rawUrl?: string): string {
  if (!rawUrl) return 'file:dummy.db';
  try {
    const url = new URL(rawUrl);
    url.searchParams.delete('channel_binding');
    url.searchParams.delete('sslmode');
    url.searchParams.delete('pgbouncer');
    url.searchParams.delete('connect_timeout');
    
    // Removido o teste com file:dummy.db para postgres,
    // garantindo que ele não mascare falhas que exigem os dados verdadeiros na geração de páginas estáticas.
    
    return url.toString();
  } catch {
    return rawUrl || 'file:dummy.db';
  }
}

const readUrl = sanitizeUrl(rawDatabaseUrl);
const readAuthToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN ?? '';
const writeUrl = sanitizeUrl(process.env.TURSO_WRITE_URL ?? process.env.DATABASE_WRITE_URL ?? process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL);

const explicitWriteAuthToken = process.env.TURSO_WRITE_AUTH_TOKEN ?? process.env.DATABASE_WRITE_AUTH_TOKEN;
const writeAuthToken = explicitWriteAuthToken ?? readAuthToken;

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