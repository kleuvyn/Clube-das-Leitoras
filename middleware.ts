import { type NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROUTE_PREFIX, CONVIDADA_PROTECTED_ROUTES } from '@/lib/access-config';

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirecionar /admin/login para /login
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTE_PREFIX);
  const isConvidadaProtectedRoute = CONVIDADA_PROTECTED_ROUTES.some((route) =>
    matchesRoute(pathname, route)
  );

  // Proteger rotas admin
  if (isAdminRoute) {
    const adminToken = request.cookies.get('clube-admin-token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger /nova-senha: precisa de sessão ativa
  if (pathname === '/nova-senha') {
    const adminToken = request.cookies.get('clube-admin-token')?.value;
    const convidadaToken = request.cookies.get('clube-sessao')?.value;
    if (!adminToken && !convidadaToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Proteger rotas privadas para convidada/admin
  if (isConvidadaProtectedRoute) {
    const adminToken = request.cookies.get('clube-admin-token')?.value;
    const convidadaToken = request.cookies.get('clube-sessao')?.value;
    if (!adminToken && !convidadaToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
