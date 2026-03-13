import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import AdminForbidden from '../forbidden';
import fs from 'fs';
import path from 'path';

export default async function AdminLogsPage() {
  let tokenValue: string | null = null;

  try {
    const cookieStore = await cookies();
    if (cookieStore && typeof (cookieStore as any).get === 'function') {
      tokenValue = (cookieStore as any).get('clube-admin-token')?.value ?? (cookieStore as any).get('clube-sessao')?.value ?? null;
    }
  } catch (err) {
    tokenValue = null;
  }

  if (!tokenValue) {
    redirect('/admin/login');
  }

  try {
    const userData = typeof tokenValue === 'string' ? JSON.parse(tokenValue) : tokenValue;
    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.email, userData.email));
    if (!user || !user.active) {
      redirect('/admin/login');
    }

    
    if (user.role !== 'admin') {
      return <AdminForbidden />;
    }

    const logPath = path.join(process.cwd(), 'logs', 'admin-access.log');
    if (!fs.existsSync(logPath)) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Logs de acesso</h1>
          <p className="text-sm text-gray-600">Arquivo de logs não encontrado.</p>
        </div>
      );
    }

    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.trim() === '' ? [] : content.trim().split('\n').slice(-500).reverse();

    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Logs de Acesso Admin</h1>
        <div className="bg-black text-white rounded p-4 overflow-auto max-h-[60vh]">
          <pre className="text-xs leading-tight">{lines.join('\n')}</pre>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Erro ao ler logs:', err);
    return (
      <div className="p-6">
        <p>Erro ao carregar logs.</p>
      </div>
    );
  }
}
