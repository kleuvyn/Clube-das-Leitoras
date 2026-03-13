import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encontros } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAdminOrColaboradora } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); 

    let query = db.select().from(encontros);
    
    
    if (tipo) {
      
      query = query.where(eq(encontros.tipo, tipo));
    }

    const allEncontros = await query.orderBy(desc(encontros.status), desc(encontros.data));
    return NextResponse.json(allEncontros, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar encontros:', error);
    return NextResponse.json({ error: 'Erro ao buscar encontros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const body = await request.json();
    
    const { 
      titulo, descricao, local, data, horaInicio, 
      linkMeet, videoUrl, status, tipo 
    } = body;

    if (!titulo || !data) {
      return NextResponse.json({ error: 'Título e data são obrigatórios' }, { status: 400 });
    }

    const slug = `${titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]/g, '-')}-${Date.now()}`;

    const inserted = await db.insert(encontros).values({
      titulo,
      descricao,
      local,
      data: new Date(data),
      horaInicio,
      
      linkMeet: linkMeet ?? null,    
      videoUrl: videoUrl ?? null,    
      status: status ?? 'ativo',      
      tipo: tipo ?? 'geral',          
      slug,
    }).returning();

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar encontro:', error);
    return NextResponse.json({ error: 'Erro ao criar encontro' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const updated = await db.update(encontros)
      .set({
        ...body,
        data: body.data ? new Date(body.data) : undefined,
      })
      .where(eq(encontros.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar encontro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminOrColaboradora();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await db.delete(encontros).where(eq(encontros.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}