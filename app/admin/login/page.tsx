'use client';

import { useAdmin } from '@/lib/admin-context';
import { AdminLogin } from '@/components/admin/admin-login';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  return <AdminLogin />;
}
