import { NextResponse } from 'next/server';
import { db, dbWrite, client } from '@/lib/db';
import { sorteiosParticipantes, sorteiosHistorico, sorteiosPremios, sorteiosConfig } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
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
        data_sorteio integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
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
        updated_at integer DEFAULT (cast(strftime('%s', 'now') as int)) NOT NULL
      )
    `);
  } catch (err) {
    console.error('Erro ao verificar/criar tabelas de sorteios:', err);
  }
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
    return NextResponse.json({ participantes, historico, premios, urnaAberta, roda: { status: urnaAberta ? 'ativa' : 'pausada' }, activeMesBase: mesAtualRef });
  } catch (error: any) {
    console.error("Erro interno GET sorteios:", error);
    return NextResponse.json({ error: 'Erro ao carregar dados', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const { action, payload } = await req.json();

    if (['salvarHistorico', 'addPremio', 'setUrnaStatus', 'removePremio'].includes(action)) {
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
        });
      }

      return NextResponse.json({ success: true, urnaAberta: payload.urnaAberta });
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
