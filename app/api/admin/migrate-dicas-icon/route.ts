import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`ALTER TABLE dicas ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'BookOpen'`);
    await db.execute(sql`ALTER TABLE dicas ADD COLUMN IF NOT EXISTS imagem text`);
    await db.execute(sql`ALTER TABLE dicas ADD COLUMN IF NOT EXISTS texto_completo text`);
    return NextResponse.json({ success: true, message: 'Colunas icon_name, imagem e texto_completo adicionadas com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
