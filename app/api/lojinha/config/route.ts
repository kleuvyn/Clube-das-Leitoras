import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { lojinhaConfig } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await db.select().from(lojinhaConfig).where(eq(lojinhaConfig.id, 1)).get();
    
    // Se não existir, retorna o padrão
    if (!config) {
      return NextResponse.json({ emBreve: true });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Erro ao buscar config da lojinha:', error);
    return NextResponse.json({ emBreve: true });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const { emBreve } = body;
    
    if (emBreve === undefined) {
      return NextResponse.json({ error: 'Campo emBreve é obrigatório' }, { status: 400 });
    }

    const existing = await db.select().from(lojinhaConfig).where(eq(lojinhaConfig.id, 1)).get();

    if (existing) {
      await dbWrite.update(lojinhaConfig)
        .set({ emBreve, updatedAt: new Date() })
        .where(eq(lojinhaConfig.id, 1));
    } else {
      await dbWrite.insert(lojinhaConfig)
        .values({ id: 1, emBreve, updatedAt: new Date() });
    }

    return NextResponse.json({ success: true, emBreve });
  } catch (error) {
    console.error('Erro ao salvar config da lojinha:', error);
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
  }
}
