import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { produtos } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = db.select().from(produtos).orderBy(desc(produtos.createdAt));

    const filters: any[] = [];
    if (category && category !== 'todos') {
      filters.push(eq(produtos.category, category));
    }
    if (activeOnly) {
      filters.push(eq(produtos.active, true));
    }

    if (filters.length > 0) {
      query = query.where(sql`${sql.join(filters, sql` AND `)}`) as any;
    }

    const data = await query;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const newProduct = await dbWrite.insert(produtos).values({
      name: body.name,
      description: body.description || '',
      price: Math.round(Number(body.price) * 100), // Converte para centavos
      imageUrl: body.imageUrl || null,
      category: body.category,
      badge: body.badge || null,
      stock: Number(body.stock || 0),
      active: body.active !== undefined ? body.active : true,
    }).returning();

    return NextResponse.json(newProduct[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    if (updates.price !== undefined) {
      updates.price = Math.round(Number(updates.price) * 100);
    }

    const updated = await dbWrite.update(produtos)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(produtos.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await dbWrite.delete(produtos).where(eq(produtos.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
