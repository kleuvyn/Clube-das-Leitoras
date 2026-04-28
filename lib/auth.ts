import { cookies } from 'next/headers';
import { db } from './db';
import { colaboradoras } from './db/schema';
import { sql } from 'drizzle-orm';

type AuthError = { status: number; message: string };

function parseCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, cookiePart) => {
    const [name, ...rest] = cookiePart.split('=');
    if (!name) return acc;
    acc[name.trim()] = decodeURIComponent(rest.join('=').trim());
    return acc;
  }, {});
}

async function getTokenFromCookieStore(request?: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('clube-admin-token')?.value ?? cookieStore.get('clube-sessao')?.value;
  if (token) return token;

  if (request) {
    const raw = request.headers.get('cookie');
    const parsed = parseCookieHeader(raw);
    return parsed['clube-admin-token'] ?? parsed['clube-sessao'];
  }

  return undefined;
}

export async function requireAdminOrColaboradora(request?: Request) {
  const token = await getTokenFromCookieStore(request);
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${tokenData.email})`);
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;
  if (user.role !== 'admin' && user.role !== 'colaboradora') throw { status: 403, message: 'Permissão insuficiente' } as AuthError;

  return user;
}

export async function requireMember(request?: Request) {
  const token = await getTokenFromCookieStore(request);
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${tokenData.email})`);
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;

  return user;
}

export async function requireAdmin(request?: Request) {
  const token = await getTokenFromCookieStore(request);
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(sql`LOWER(${colaboradoras.email}) = LOWER(${tokenData.email})`);
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;
  if (user.role !== 'admin') throw { status: 403, message: 'Permissão insuficiente' } as AuthError;

  return user;
}

export default null;
