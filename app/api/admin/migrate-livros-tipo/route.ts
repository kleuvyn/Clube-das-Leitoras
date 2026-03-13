import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    await sql`ALTER TABLE livros ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'candidato'`;
    await sql`UPDATE livros SET tipo = 'curadoria' WHERE ano < 2026 AND (tipo IS NULL OR tipo = 'candidato')`;
    const rows = await sql`SELECT ano, tipo, COUNT(*) as total FROM livros GROUP BY ano, tipo ORDER BY ano DESC`;
    await sql.end();
    return NextResponse.json({ ok: true, resultado: rows }, { status: 200 });
  } catch (err: any) {
    await sql.end();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
