import { NextResponse } from 'next/server';
import { requireAdminOrColaboradora } from '@/lib/auth';
import { db } from '@/lib/db';
import { parcerias } from '@/lib/db/schema';
import { eq, desc, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type ParceriaRow = {
  id: string;
  name: string;
  link: string | null;
  description: string | null;
  imagem: string | null; 
  createdAt: string;
};

export async function GET() {
  try {
    const rows = await db.select().from(parcerias).orderBy(asc(parcerias.name));
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('Erro GET /api/parcerias:', err);
    return NextResponse.json({ error: 'Erro ao carregar parcerias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();

    
    const name = body.name || body.nome;
    const description = body.description || body.info;
    const imagem = body.imagem || body.img;

    if (!name) {
      return NextResponse.json({ error: 'O nome do parceiro é obrigatório' }, { status: 400 });
    }

    const [inserted] = await db.insert(parcerias).values({
      name,
      link: body.link ?? null,
      description: description ?? null,
      imagem: imagem ?? null,
    }).returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (err: any) {
    console.error('Erro POST /api/parcerias:', err);
    return NextResponse.json({ error: 'Erro ao criar parceria' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    
    const name = body.name || body.nome;
    const description = body.description || body.info;
    const imagem = body.imagem || body.img;

    const updated = await db.update(parcerias)
      .set({
        name,
        link: body.link,
        description,
        imagem,
      })
      .where(eq(parcerias.id, id))
      .returning();

    if (!updated.length) return NextResponse.json({ error: 'Parceria não encontrada' }, { status: 404 });

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Erro PATCH /api/parcerias:', err);
    return NextResponse.json({ error: 'Erro ao atualizar parceria' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const result = await db.delete(parcerias)
      .where(eq(parcerias.id, id))
      .returning();

    if (!result.length) return NextResponse.json({ error: 'Parceria não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro DELETE /api/parcerias:', err);
    return NextResponse.json({ error: 'Erro ao remover parceria' }, { status: 500 });
  }
}