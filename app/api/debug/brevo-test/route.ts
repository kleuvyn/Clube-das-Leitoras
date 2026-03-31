import { NextResponse } from 'next/server';
import { sendEmail, getFromAddressFallback } from '@/lib/email-client';

export async function POST(request: Request) {
  const token = request.headers.get('x-debug-token');
  const expected = process.env.DEBUG_BREVO_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({} as any));
  const testEmail = String(body?.to || process.env.DEBUG_TEST_EMAIL || '').trim();
  if (!testEmail) {
    return NextResponse.json({ ok: false, error: 'Missing test email (env DEBUG_TEST_EMAIL or body.to)' }, { status: 400 });
  }

  const from = process.env.BREVO_FROM || getFromAddressFallback();

  try {
    const res = await sendEmail({ from, to: testEmail, subject: 'Brevo debug: envio de teste', html: '<p>Teste de envio a partir do endpoint /api/debug/brevo-test</p>' });
    return NextResponse.json({ ok: true, result: res });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err), details: err?.details ?? null }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ ok: true, info: 'Use POST with header x-debug-token and JSON { "to": "you@exemplo.com" } or set DEBUG_TEST_EMAIL in env' });
}
