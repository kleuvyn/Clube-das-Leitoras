import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminProvider } from '@/lib/admin-context';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import AdminForbidden from './forbidden';
import { logAdminBlock } from '@/lib/admin-logger';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

    
    if (user.role !== 'admin' && user.role !== 'colaboradora') {
      
      try {
        logAdminBlock({ email: typeof userData?.email === 'string' ? userData.email : undefined, role: user.role, path: '/admin', reason: 'unauthorized_role' });
      } catch (e) {
        console.error('Erro ao gravar log de bloqueio:', e);
      }

      
      return <AdminForbidden />;
    }
  } catch (err) {
    redirect('/admin/login');
  }

  return (
    <AdminProvider>
      
      <AdminShell>
        {children}
      </AdminShell>
    </AdminProvider>
  );
}