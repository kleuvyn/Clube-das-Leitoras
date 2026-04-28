import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof createClient> | undefined;
};

// 1. Criamos o cliente do LibSQL (Turso)
export const client = globalForDb.client ?? createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

// 2. Iniciamos o Drizzle com o driver do Turso
export const db = drizzle(client, { schema });

export type DbClient = typeof db;