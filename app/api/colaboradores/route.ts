import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db, dbWrite } from '@/lib/db';
import { colaboradoras } from '@/lib/db/schema';
import { and, eq, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailSearch = searchParams.get('email')?.toLowerCase().trim() || '';
    const statusSearch = searchParams.get('status')?.toLowerCase().trim() || '';
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const offset = (page - 1) * limit;

    let leitorasQuery = db
      .select({
        id: colaboradoras.id,
        email: colaboradoras.email,
        name: colaboradoras.name,
        avatarUrl: colaboradoras.avatarUrl,
        role: colaboradoras.role,
        active: colaboradoras.active,
        status: colaboradoras.status,
        phone: colaboradoras.phone,
        birthdate: colaboradoras.birthdate,
        tempoClube: colaboradoras.tempoClube,
        enderecoCompleto: colaboradoras.enderecoCompleto,
        cartaMimo: colaboradoras.cartaMimo,
        enviosRealizados: colaboradoras.enviosRealizados,
        ultimaInteracao: colaboradoras.ultimaInteracao,
        gdprConsentido: colaboradoras.gdprConsentido,
        gdprConsentidoEm: colaboradoras.gdprConsentidoEm,
        gdprConsentimentoVersao: colaboradoras.gdprConsentimentoVersao,
        gdprConsentimentoFinalidade: colaboradoras.gdprConsentimentoFinalidade,
        createdAt: colaboradoras.createdAt,
      })
      .from(colaboradoras)
      .orderBy(desc(colaboradoras.createdAt));

    if (emailSearch) {
      leitorasQuery = leitorasQuery.where(sql`LOWER(${colaboradoras.email}) = ${emailSearch}`);
    }

    if (statusSearch && statusSearch !== 'todas') {
      leitorasQuery = leitorasQuery.where(sql`LOWER(${colaboradoras.status}) = ${statusSearch}`);
    }

    if (search) {
      const likePattern = `%${search}%`;
      leitorasQuery = leitorasQuery.where(sql`(lower(${colaboradoras.name}) LIKE ${likePattern} OR lower(${colaboradoras.email}) LIKE ${likePattern})`);
    }

    if (!emailSearch) {
      leitorasQuery = leitorasQuery.limit(limit).offset(offset);
    }

    const countFilters: any[] = [];
    if (emailSearch) countFilters.push(sql`LOWER(${colaboradoras.email}) = ${emailSearch}`);
    if (statusSearch && statusSearch !== 'todas') countFilters.push(sql`LOWER(${colaboradoras.status}) = ${statusSearch}`);
    if (search) {
      const likePattern = `%${search}%`;
      countFilters.push(sql`(lower(${colaboradoras.name}) LIKE ${likePattern} OR lower(${colaboradoras.email}) LIKE ${likePattern})`);
    }

    const countQuery = db.select({ count: sql<number>`cast(count(*) as integer)` }).from(colaboradoras);
    if (countFilters.length) {
      countQuery.where(and(...countFilters));
    }

    const [allLeitoras, countResult] = await Promise.all([
      leitorasQuery,
      countQuery,
    ]);
    
    const total = countResult[0]?.count || 0;
    const pages = emailSearch ? 1 : Math.ceil(total / limit);

    return NextResponse.json({
      data: allLeitoras,
      pagination: { page, limit, total, pages, hasMore: emailSearch ? false : page < pages }
    }, { status: 200 });
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

    const inserted = await dbWrite.insert(colaboradoras).values({
      email: normalizedEmail,
      password: hashedPassword,
      name: name ?? normalizedEmail.split('@')[0],
      role: role || 'leitora', 
      avatarUrl: imageUrl || null,
      active: true,
      gdprConsentido: true,
      gdprConsentidoEm: new Date(),
      gdprConsentimentoVersao: '1.0',
      gdprConsentimentoFinalidade: 'Cadastro pela administração',
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
    const { id, name, role, active, status, imageUrl } = body;
    
    if (!id) return NextResponse.json({ error: 'ID da leitora é necessário' }, { status: 400 });

    const [user] = await db.select().from(colaboradoras).where(eq(colaboradoras.id, id));
    if (!user) return NextResponse.json({ error: 'Usuária não encontrada' }, { status: 404 });

    let newStatus = user.status;
    let newActive = user.active;
    if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (['ativa', 'bloqueada', 'excluida'].includes(normalized)) {
        newStatus = normalized;
        newActive = normalized === 'ativa';
      }
    } else if (typeof active === 'boolean') {
      newActive = active;
      newStatus = active ? 'ativa' : user.status === 'excluida' ? 'excluida' : 'bloqueada';
    }

    await dbWrite.update(colaboradoras).set({
      name: name ?? user.name,
      role: role ?? user.role,
      active: newActive,
      status: newStatus,
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

    await dbWrite.delete(colaboradoras).where(eq(colaboradoras.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir:', error);
    return NextResponse.json({ error: 'Falha na exclusão' }, { status: 500 });
  }
}