import { type NextRequest, NextResponse } from 'next/server';
import { ADMIN_ROUTE_PREFIX, CONVIDADA_PROTECTED_ROUTES } from '@/lib/access-config';

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isAdminRoute = matchesRoute(pathname, ADMIN_ROUTE_PREFIX);
  const isConvidadaProtectedRoute = CONVIDADA_PROTECTED_ROUTES.some((route) =>
    matchesRoute(pathname, route)
  );

  if (isAdminRoute) {
    const adminToken = request.cookies.get('clube-admin-token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/nova-senha') {
    const convidadaToken = request.cookies.get('clube-sessao')?.value;
    if (!convidadaToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

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
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.webmanifest|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|woff|woff2|ttf|eot)$).*)',
  ],
};
