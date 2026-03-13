import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE encontros ADD COLUMN IF NOT EXISTS valor text`);
    await db.execute(sql`ALTER TABLE encontros ADD COLUMN IF NOT EXISTS telefone text`);
    await db.execute(sql`ALTER TABLE encontros ADD COLUMN IF NOT EXISTS link_inscricao text`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS evento_confirmacoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        evento_id uuid NOT NULL REFERENCES encontros(id) ON DELETE CASCADE,
        usuario_email text NOT NULL,
        status text NOT NULL DEFAULT 'vou',
        created_at timestamp DEFAULT now(),
        UNIQUE(evento_id, usuario_email)
      )
    `);
    return NextResponse.json({ ok: true, msg: 'Migration executada com sucesso.' });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
