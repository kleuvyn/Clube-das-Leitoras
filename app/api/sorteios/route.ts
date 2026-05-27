import { NextResponse } from 'next/server';
import { db, dbWrite, client } from '@/lib/db';
import { sorteiosParticipantes, sorteiosHistorico, sorteiosPremios, sorteiosConfig } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getCurrentMonthReference } from '@/lib/utils';
import { requireAdmin } from '@/lib/auth';

async function ensureTableExists() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sorteios_participantes (
        id text PRIMARY KEY NOT NULL,
        nome text NOT NULL,
        mes_base text NOT NULL,
        created_at integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sorteios_historico (
        id text PRIMARY KEY NOT NULL,
        nome text NOT NULL,
        premio text NOT NULL,
        mes_base text NOT NULL,
        data_sorteio integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL,
        foto_url text
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sorteios_premios (
        id text PRIMARY KEY NOT NULL,
        premio text NOT NULL,
        mes_base text NOT NULL,
        created_at integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      )
    `);
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sorteios_config (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        mes_base text NOT NULL,
        urna_aberta integer NOT NULL DEFAULT 1,
        foto_url text,
        updated_at integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      )
    `);

    const configColumns = await client.execute("PRAGMA table_info('sorteios_config')");
    const hasFotoUrl = configColumns.rows.some((row: any) => row?.name === 'foto_url' || row?.[0] === 'foto_url');
    if (!hasFotoUrl) {
      await client.execute('ALTER TABLE sorteios_config ADD COLUMN foto_url text');
    }

    const historicoColumns = await client.execute("PRAGMA table_info('sorteios_historico')");
    const hasHistoricoFotoUrl = historicoColumns.rows.some((row: any) => row?.name === 'foto_url' || row?.[0] === 'foto_url');
    if (!hasHistoricoFotoUrl) {
      await client.execute('ALTER TABLE sorteios_historico ADD COLUMN foto_url text');
    }
  } catch (err) {
    console.error('Erro ao verificar/criar tabelas de sorteios:', err);
  }
}

function normalizeParticipantName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

async function getActiveSorteioMonthRef() {
  const currentMonthRef = getCurrentMonthReference();
  const currentConfigRows = await db
    .select()
    .from(sorteiosConfig)
    .where(eq(sorteiosConfig.mesBase, currentMonthRef))
    .orderBy(desc(sorteiosConfig.updatedAt))
    .limit(1);

  if (currentConfigRows.length > 0 && currentConfigRows[0].urnaAberta === 1) {
    return { mesBase: currentMonthRef, configRow: currentConfigRows[0] };
  }

  const openConfigRows = await db
    .select()
    .from(sorteiosConfig)
    .where(eq(sorteiosConfig.urnaAberta, 1))
    .orderBy(desc(sorteiosConfig.updatedAt))
    .limit(1);

  if (openConfigRows.length > 0) {
    return { mesBase: openConfigRows[0].mesBase, configRow: openConfigRows[0] };
  }

  return { mesBase: currentMonthRef, configRow: currentConfigRows[0] ?? null };
}

export async function GET() {
  try {
    await ensureTableExists();
    const { mesBase: mesAtualRef, configRow } = await getActiveSorteioMonthRef();
    const participantes = await db
      .select()
      .from(sorteiosParticipantes)
      .where(eq(sorteiosParticipantes.mesBase, mesAtualRef))
      .orderBy(desc(sorteiosParticipantes.createdAt));
    const historico = await db.select().from(sorteiosHistorico).orderBy(desc(sorteiosHistorico.dataSorteio)).limit(20);
    const premios = await db
      .select()
      .from(sorteiosPremios)
      .where(eq(sorteiosPremios.mesBase, mesAtualRef))
      .orderBy(sorteiosPremios.createdAt);
    const urnaAberta = configRow ? configRow.urnaAberta === 1 : true;
    return NextResponse.json({
      participantes,
      historico,
      premios,
      urnaAberta,
      roda: { status: urnaAberta ? 'ativa' : 'pausada' },
      activeMesBase: mesAtualRef,
      sorteioFotoUrl: configRow?.fotoUrl || null,
    });
  } catch (error: any) {
    console.error("Erro interno GET sorteios:", error);
    return NextResponse.json({ error: 'Erro ao carregar dados', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const { action, payload } = await req.json();

    if (['salvarHistorico', 'addPremio', 'setUrnaStatus', 'removePremio', 'setSorteioFoto'].includes(action)) {
      await requireAdmin();
    }

    const { mesBase: activeMesBase } = await getActiveSorteioMonthRef();

    if (action === 'addParticipante') {
      const configRows = await db
        .select()
        .from(sorteiosConfig)
        .where(eq(sorteiosConfig.mesBase, activeMesBase))
        .orderBy(desc(sorteiosConfig.updatedAt))
        .limit(1);
      const urnaAberta = configRows.length === 0 || configRows[0].urnaAberta === 1;
      if (!urnaAberta) {
        return NextResponse.json({ error: 'A urna está fechada para novos nomes.' }, { status: 403 });
      }

      const nomeNormalizado = normalizeParticipantName(payload.nome);
      const duplicate = await db
        .select()
        .from(sorteiosParticipantes)
        .where(eq(sorteiosParticipantes.mesBase, activeMesBase))
        .where(sql`LOWER(${sorteiosParticipantes.nome}) = ${nomeNormalizado}`)
        .limit(1);

      if (duplicate.length > 0) {
        return NextResponse.json({ error: 'Esse nome já está na urna deste mês.' }, { status: 409 });
      }

      const result = await dbWrite.insert(sorteiosParticipantes).values({
        nome: payload.nome,
        mesBase: activeMesBase,
      }).returning();
      return NextResponse.json(result[0]);
    }

    if (action === 'removeParticipante') {
      if (payload.id) {
        await dbWrite.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.id, payload.id));
      } else {
        await dbWrite.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.nome, payload.nome));
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'salvarHistorico') {
      const result = await dbWrite.insert(sorteiosHistorico).values({
        nome: payload.nome,
        premio: payload.premio,
        mesBase: activeMesBase,
        fotoUrl: configRow?.fotoUrl || null,
      }).returning();

      // Remove apenas o vencedor atual da urna, assim ele não pode ser sorteado novamente
      if (payload.id) {
        await dbWrite.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.id, payload.id));
      } else {
        await dbWrite.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.nome, payload.nome));
      }

      return NextResponse.json(result[0]);
    }

    if (action === 'addPremio') {
      const result = await dbWrite.insert(sorteiosPremios).values({
        premio: payload.premio,
        mesBase: activeMesBase,
      }).returning();
      return NextResponse.json(result[0]);
    }

    if (action === 'setUrnaStatus') {
      const updated = await dbWrite.update(sorteiosConfig)
        .set({
          urnaAberta: payload.urnaAberta ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(sorteiosConfig.mesBase, activeMesBase))
        .returning();

      if (!updated.length) {
        await dbWrite.insert(sorteiosConfig).values({
          mesBase: activeMesBase,
          urnaAberta: payload.urnaAberta ? 1 : 0,
          updatedAt: new Date(),
        });
      }

      return NextResponse.json({ success: true, urnaAberta: payload.urnaAberta });
    }

    if (action === 'setSorteioFoto') {
      const updated = await dbWrite.update(sorteiosConfig)
        .set({
          fotoUrl: payload.fotoUrl,
          updatedAt: new Date(),
        })
        .where(eq(sorteiosConfig.mesBase, activeMesBase))
        .returning();

      if (!updated.length) {
        await dbWrite.insert(sorteiosConfig).values({
          mesBase: activeMesBase,
          urnaAberta: 1,
          fotoUrl: payload.fotoUrl,
          updatedAt: new Date(),
        });
      }

      return NextResponse.json({ success: true, fotoUrl: payload.fotoUrl });
    }

    if (action === 'removePremio') {
      await dbWrite.delete(sorteiosPremios).where(eq(sorteiosPremios.id, payload.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro interno POST sorteios:', error);
    return NextResponse.json({ error: 'Erro ao salvar', details: error?.message }, { status: 500 });
  }
}
