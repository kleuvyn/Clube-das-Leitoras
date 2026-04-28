import { NextResponse } from 'next/server';
import { db, client } from '@/lib/db';
import { rodaVozes, participantesRodaVozes } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

async function ensureRodaVozesSchema() {
  try {
    await client.execute(
      `CREATE TABLE IF NOT EXISTS roda_vozes (
        id text PRIMARY KEY,
        session_id text NOT NULL UNIQUE,
        titulo text DEFAULT 'Roda de Vozes',
        status text DEFAULT 'ativa',
        created_at integer DEFAULT (strftime('%s','now')),
        updated_at integer DEFAULT (strftime('%s','now'))
      )`
    );
    await client.execute(
      `CREATE TABLE IF NOT EXISTS participantes_roda_vozes (
        id text PRIMARY KEY,
        roda_id text NOT NULL REFERENCES roda_vozes(id) ON DELETE CASCADE,
        nome text NOT NULL,
        ordem integer NOT NULL,
        falou integer DEFAULT 0,
        tempo_utilizado integer DEFAULT 0,
        minutos_adicionais_usados integer DEFAULT 0,
        created_at integer DEFAULT (strftime('%s','now'))
      )`
    );
  } catch (error: any) {
    console.error('Erro ao garantir schema de roda_vozess:', error);
    throw error;
  }
}

/**
 * GET /api/roda-vozes
 * Retorna todos os participantes da roda de vozes ativa
 */
export async function GET() {
  try {
    await ensureRodaVozesSchema();

    // Buscar roda ativa
    const ativa = await db
      .select()
      .from(rodaVozes)
      .where(eq(rodaVozes.status, 'ativa'))
      .orderBy(desc(rodaVozes.createdAt))
      .limit(1);

    let roda = ativa[0];

    // Se não houver roda ativa, criar uma nova
    if (!roda) {
      const novaRoda = {
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        titulo: 'Roda de Vozes',
        status: 'ativa',
      };
      const insert = await db.insert(rodaVozes).values(novaRoda).returning();
      roda = insert[0];
    }

    // Buscar participantes da roda
    const participantes = await db
      .select()
      .from(participantesRodaVozes)
      .where(eq(participantesRodaVozes.rodaId, roda.id))
      .orderBy(participantesRodaVozes.ordem);

    return NextResponse.json({
      success: true,
      roda,
      participantes: participantes.map((p) => ({
        id: p.id,
        nome: p.nome,
        ordem: p.ordem,
        falou: Boolean(p.falou),
        tempoUtilizado: p.tempoUtilizado,
        minutosAdicionaisUsados: p.minutosAdicionaisUsados,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar roda de vozes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar participantes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/roda-vozes
 * Adiciona um novo participante à roda de vozes
 * Body: { nome: string }
 */
export async function POST(request: Request) {
  try {
    await ensureRodaVozesSchema();
    const body = await request.json();
    const { nome } = body;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar ou criar roda ativa
    const ativa = await db
      .select()
      .from(rodaVozes)
      .where(eq(rodaVozes.status, 'ativa'))
      .orderBy(desc(rodaVozes.createdAt))
      .limit(1);

    let roda = ativa[0];

    if (!roda) {
      const novaRoda = {
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        titulo: 'Roda de Vozes',
        status: 'ativa',
      };
      const insert = await db.insert(rodaVozes).values(novaRoda).returning();
      roda = insert[0];
    }

    // Contar participantes existentes para definir a ordem
    const countResult = await db
      .select()
      .from(participantesRodaVozes)
      .where(eq(participantesRodaVozes.rodaId, roda.id));

    const ordem = countResult.length + 1;

    // Adicionar participante
    const novoParticipante = {
      rodaId: roda.id,
      nome: nome.trim(),
      ordem,
      falou: false,
      tempoUtilizado: 0,
      minutosAdicionaisUsados: 0,
    };

    const result = await db
      .insert(participantesRodaVozes)
      .values(novoParticipante)
      .returning();

    const participante = result[0];

    return NextResponse.json({
      success: true,
      participante: {
        id: participante.id,
        nome: participante.nome,
        ordem: participante.ordem,
        falou: Boolean(participante.falou),
        tempoUtilizado: participante.tempoUtilizado,
        minutosAdicionaisUsados: participante.minutosAdicionaisUsados,
      },
    });
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao adicionar participante' },
      { status: 500 }
    );
  }
}
