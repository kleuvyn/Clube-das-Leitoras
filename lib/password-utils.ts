import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { colaboradorasPasswordHistory, colaboradoras } from './db/schema';

export const TEMP_PASSWORD_VALIDITY_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_HISTORY_LIMIT = 5;

export function gerarSenhaTemporaria(): string {
  const palavras = ['livro', 'flor', 'cafe', 'rosa', 'lua', 'sol', 'brisa', 'afeto', 'laca', 'petal'];
  const i = crypto.randomInt(palavras.length);
  const j = crypto.randomInt(palavras.length);
  const num = 100 + crypto.randomInt(900);
  return `${palavras[i]}${palavras[j]}${num}`;
}

export async function isPasswordReused(password: string, hashes: string[]) {
  for (const hash of hashes) {
    if (!hash) continue;
    try {
      if (await bcrypt.compare(password, hash)) {
        return true;
      }
    } catch (err) {
      console.warn("Invalid hash encountered while comparing passwords", err);
    }
  }
  return false;
}

export async function generateUniqueTempPassword(existingHashes: string[]) {
  let attempt = 0;
  let password = gerarSenhaTemporaria();
  while (attempt < 10 && await isPasswordReused(password, existingHashes)) {
    password = gerarSenhaTemporaria();
    attempt += 1;
  }
  return password;
}

export async function insertPasswordHistory(userId: string, passwordHash: string, type: 'permanent' | 'temporary') {
  try {
    await db.insert(colaboradorasPasswordHistory).values({
      id: crypto.randomUUID(),
      colaboradoraId: userId,
      passwordHash,
      type,
    });
  } catch (error) {
    console.error('Failed to insert password history. Maybe table does not exist:', error);
  }
}

export async function getRecentPasswordHistory(userId: string, limit = PASSWORD_HISTORY_LIMIT) {
  try {
    const rows = await db
      .select({ passwordHash: colaboradorasPasswordHistory.passwordHash })
      .from(colaboradorasPasswordHistory)
      .where(eq(colaboradorasPasswordHistory.colaboradoraId, userId))
      .orderBy(desc(colaboradorasPasswordHistory.createdAt))
      .limit(limit);
    return rows.map(r => r.passwordHash);
  } catch (error) {
    console.error('Failed to fetch password history:', error);
    return [];
  }
}
