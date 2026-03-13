import { AdminProvider } from '@/lib/admin-context';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
