import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout realizado com sucesso' });

  response.cookies.set('clube-admin-token', '', { path: '/', expires: new Date(0) });
  response.cookies.set('clube-sessao', '', { path: '/', expires: new Date(0) });
  response.cookies.set('clube-user-email', '', { path: '/', expires: new Date(0) });
  response.cookies.set('clube-user-name', '', { path: '/', expires: new Date(0) });

  return response;
}