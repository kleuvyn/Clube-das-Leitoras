import { NextResponse } from 'next/server';
import { db, client } from '@/lib/db';
import { sorteiosParticipantes, sorteiosHistorico, sorteiosPremios, sorteiosConfig } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

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

export async function GET() {
  try {
    await ensureTableExists();
    const mesAtualRef = new Date().toISOString().substring(0, 7);
    const participantes = await db.select().from(sorteiosParticipantes).orderBy(desc(sorteiosParticipantes.createdAt));
    const historico = await db.select().from(sorteiosHistorico).orderBy(desc(sorteiosHistorico.dataSorteio)).limit(20);
    const premios = await db.select().from(sorteiosPremios).orderBy(sorteiosPremios.createdAt);
    const configRows = await db.select().from(sorteiosConfig).where(eq(sorteiosConfig.mesBase, mesAtualRef)).orderBy(desc(sorteiosConfig.updatedAt)).limit(1);
    const urnaAberta = configRows.length > 0 ? configRows[0].urnaAberta === 1 : true;
    return NextResponse.json({ participantes, historico, premios, urnaAberta });
  } catch (error: any) {
    console.error("Erro interno GET sorteios:", error);
    return NextResponse.json({ error: 'Erro ao carregar dados', details: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTableExists();
    const { action, payload } = await req.json();

    if (action === 'addParticipante') {
      const result = await db.insert(sorteiosParticipantes).values({
        nome: payload.nome,
        mesBase: payload.mesBase,
      }).returning();
      return NextResponse.json(result[0]);
    }

    if (action === 'removeParticipante') {
      if (payload.id) {
        await db.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.id, payload.id));
      } else {
        await db.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.nome, payload.nome));
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'salvarHistorico') {
      const result = await db.insert(sorteiosHistorico).values({
        nome: payload.nome,
        premio: payload.premio,
        mesBase: payload.mesBase,
      }).returning();

      // Remove apenas o vencedor atual da urna, assim ele não pode ser sorteado novamente
      if (payload.id) {
        await db.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.id, payload.id));
      } else {
        await db.delete(sorteiosParticipantes).where(eq(sorteiosParticipantes.nome, payload.nome));
      }

      return NextResponse.json(result[0]);
    }

    if (action === 'addPremio') {
      const result = await db.insert(sorteiosPremios).values({
        premio: payload.premio,
        mesBase: payload.mesBase,
      }).returning();
      return NextResponse.json(result[0]);
    }

    if (action === 'setUrnaStatus') {
      const updated = await db.update(sorteiosConfig)
        .set({
          urnaAberta: payload.urnaAberta ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(sorteiosConfig.mesBase, payload.mesBase))
        .returning();

      if (!updated.length) {
        await db.insert(sorteiosConfig).values({
          mesBase: payload.mesBase,
          urnaAberta: payload.urnaAberta ? 1 : 0,
        });
      }

      return NextResponse.json({ success: true, urnaAberta: payload.urnaAberta });
    }

    if (action === 'removePremio') {
      await db.delete(sorteiosPremios).where(eq(sorteiosPremios.id, payload.id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro interno POST sorteios:', error);
    return NextResponse.json({ error: 'Erro ao salvar', details: error?.message }, { status: 500 });
  }
}
