import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allLeitoras = await db
      .select({
        id: colaboradoras.id,
        email: colaboradoras.email,
        name: colaboradoras.name,
        avatarUrl: colaboradoras.avatarUrl,
        role: colaboradoras.role,
        active: colaboradoras.active,
        createdAt: colaboradoras.createdAt,
      })
      .from(colaboradoras)
      .orderBy(desc(colaboradoras.createdAt));
    
    return NextResponse.json(allLeitoras, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar leitoras:', error);
    return NextResponse.json({ error: 'Erro ao buscar leitoras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    
    try {
      await requireAdmin();
    } catch (err: any) {
      return NextResponse.json({ error: 'Apenas a administração pode criar contas' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role, imageUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'O e-mail é obrigatório' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const plainPassword = typeof password === 'string' && password.trim() ? password : 'clube2026';

    const [existing] = await db
      .select()
      .from(colaboradoras)
      .where(eq(colaboradoras.email, normalizedEmail));

    if (existing) {
      return NextResponse.json({ error: 'Esta leitora já possui cadastro' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const inserted = await db.insert(colaboradoras).values({
      email: normalizedEmail,
      password: hashedPassword,
      name: name ?? normalizedEmail.split('@')[0],
      role: role || 'leitora', 
      avatarUrl: imageUrl || null,
      active: true,
    }).returning();

    const { password: _, ...userWithoutPassword } = inserted[0];
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar leitora:', error);
    return NextResponse.json({ error: 'Erro ao processar cadastro' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (err: any) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, role, active, imageUrl } = body;
    
    if (!id) return NextResponse.json({ error: 'ID da leitora é necessário' }, { status: 400 });

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, id));
    if (!user) return NextResponse.json({ error: 'Usuária não encontrada' }, { status: 404 });

    await db.update(colaboradoras).set({
      name: name ?? user.name,
      role: role ?? user.role,
      active: typeof active === 'boolean' ? active : user.active,
      avatarUrl: imageUrl ?? user.avatarUrl,
    }).where(eq(colaboradoras.id, id));

    return NextResponse.json({ message: 'Perfil atualizado' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    return NextResponse.json({ error: 'Erro ao salvar alterações' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    try {
      await requireAdmin();
    } catch (err: any) {
      return NextResponse.json({ error: 'Operação não permitida' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, id));

    if (!user) return NextResponse.json({ error: 'Não encontrada' }, { status: 404 });

    
    if (user.role === 'admin' && user.email === 'clubedasleitorasbsb@gmail.com') {
      return NextResponse.json({ error: 'A conta mestre do clube não pode ser removida' }, { status: 403 });
    }

    await db.delete(colaboradoras).where(eq(colaboradoras.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir:', error);
    return NextResponse.json({ error: 'Falha na exclusão' }, { status: 500 });
  }
}