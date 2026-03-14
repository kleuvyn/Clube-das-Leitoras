import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora, requireAdmin, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { empreendedoras } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.select().from(empreendedoras).orderBy(asc(empreendedoras.name));
    
    
    const formattedRows = rows.map(row => ({
      id: row.id,
      negocio: row.name,         
      nome: row.feitoPor,        
      frase: row.frase,
      instagram: row.instagram,
      fotoUrl: row.logoUrl,
      categoria: row.categoria ?? null
    }));

    return NextResponse.json(formattedRows);
  } catch (err: any) {
    console.error('Erro GET /api/empreendedoras:', err);
    return NextResponse.json({ error: 'Erro ao buscar empreendedoras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    
    if (!body.negocio) {
      return NextResponse.json({ error: 'O nome do negócio é obrigatório' }, { status: 400 });
    }

    const [inserted] = await db.insert(empreendedoras).values({
      name: body.negocio,
      feitoPor: body.nome,
      frase: body.frase ?? null,
      categoria: body.categoria ?? null,
      instagram: body.instagram ?? null,
      logoUrl: body.fotoUrl ?? null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    console.error('Erro INSERT /api/empreendedoras:', err);
    return NextResponse.json({ error: 'Erro ao cadastrar' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const updated = await db.update(empreendedoras)
      .set({
        name: body.negocio,
        feitoPor: body.nome,
        frase: body.frase,
        categoria: body.categoria,
        instagram: body.instagram,
        logoUrl: body.fotoUrl,
      })
      .where(eq(empreendedoras.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    await db.delete(empreendedoras).where(eq(empreendedoras.id, id));
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}