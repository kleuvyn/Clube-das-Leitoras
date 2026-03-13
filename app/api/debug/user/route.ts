import { NextResponse } from 'next/server'
import postgres from 'postgres'

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
    const sql = postgres(process.env.DATABASE_URL)
    const rows = await sql`
      SELECT id, email, active, role, must_change_password, left(password,60) as pwd_head
      FROM public.colaboradoras
      WHERE email = ${email}
      LIMIT 1
    `
    await sql.end()
    return NextResponse.json({ user: rows[0] ?? null })
  } catch (error) {
    console.error('DB debug user error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
