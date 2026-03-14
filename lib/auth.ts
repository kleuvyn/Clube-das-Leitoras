import { cookies } from 'next/headers';
import { db } from './db';
import { colaboradoras } from './db/schema';
import { eq } from 'drizzle-orm';

type AuthError = { status: number; message: string };

export async function requireAdminOrColaboradora() {
  const cookieStore = await cookies();
  const token = cookieStore.get('clube-admin-token')?.value ?? cookieStore.get('clube-sessao')?.value;
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, tokenData.email));
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;
  if (user.role !== 'admin' && user.role !== 'colaboradora') throw { status: 403, message: 'Permissão insuficiente' } as AuthError;

  return user;
}

export async function requireMember() {
  const cookieStore = await cookies();
  const token = cookieStore.get('clube-admin-token')?.value ?? cookieStore.get('clube-sessao')?.value;
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, tokenData.email));
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;

  return user;
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('clube-admin-token')?.value ?? cookieStore.get('clube-sessao')?.value;
  if (!token) throw { status: 401, message: 'Não autorizado' } as AuthError;

  let tokenData: any;
  try {
    tokenData = typeof token === 'string' ? JSON.parse(token) : token;
  } catch {
    throw { status: 401, message: 'Token inválido' } as AuthError;
  }

  const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, tokenData.email));
  if (!user || user.active === false) throw { status: 401, message: 'Não autorizado' } as AuthError;
  if (user.role !== 'admin') throw { status: 403, message: 'Permissão insuficiente' } as AuthError;

  return user;
}

export default null;
