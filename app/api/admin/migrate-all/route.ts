import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { livroDoMes, resenhas } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  async function run(nome: string, query: string) {
    try {
      await db.execute(sql.raw(query));
      results[nome] = 'ok';
    } catch (err: any) {
      results[nome] = `ERRO: ${err.message}`;
    }
  }

  
  await run('dicas.icon_name',      `ALTER TABLE dicas ADD COLUMN IF NOT EXISTS icon_name text DEFAULT 'BookOpen'`);
  await run('dicas.imagem',         `ALTER TABLE dicas ADD COLUMN IF NOT EXISTS imagem text`);
  await run('dicas.texto_completo', `ALTER TABLE dicas ADD COLUMN IF NOT EXISTS texto_completo text`);

  
  await run('livros.tipo', `ALTER TABLE livros ADD COLUMN IF NOT EXISTS tipo text DEFAULT 'clube'`);

  
  
  await run('livros.fix_candidatos', `
    UPDATE livros SET tipo = 'candidato'
    WHERE id IN (SELECT DISTINCT livro_id FROM votacoes)
    AND (tipo IS NULL OR tipo = 'clube')
  `);

  
  await run('encontros.valor',         `ALTER TABLE encontros ADD COLUMN IF NOT EXISTS valor text`);
  await run('encontros.telefone',      `ALTER TABLE encontros ADD COLUMN IF NOT EXISTS telefone text`);
  await run('encontros.link_inscricao',`ALTER TABLE encontros ADD COLUMN IF NOT EXISTS link_inscricao text`);

  
  await run('evento_confirmacoes', `
    CREATE TABLE IF NOT EXISTS evento_confirmacoes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      evento_id uuid NOT NULL REFERENCES encontros(id) ON DELETE CASCADE,
      usuario_email text NOT NULL,
      status text NOT NULL DEFAULT 'vou',
      created_at timestamp DEFAULT now(),
      UNIQUE(evento_id, usuario_email)
    )
  `);

  
  
  try {
    const livros = await db.select().from(livroDoMes);
    const resenhasExistentes = await db.select().from(resenhas);
    const livrosComResenha = new Set(resenhasExistentes.map(r => r.book).filter(Boolean));

    let criados = 0;
    for (const livro of livros) {
      if (!livro.livro) continue;
      if (livrosComResenha.has(livro.livro)) continue; 

      const mesAno = [livro.mes, livro.ano ? String(livro.ano) : ''].filter(Boolean).join('/');
      await db.insert(resenhas).values({
        title: `Resenha: ${livro.livro}`,
        book: livro.livro,
        author: livro.autora ?? null,
        content: livro.sinopse ?? '',
        rating: 5,
        imageUrl: livro.foto ?? null,
        publishedAt: mesAno || null,
      });
      criados++;
    }
    results['resenhas_retroativas'] = `ok (${criados} criadas)`;
  } catch (err: any) {
    results['resenhas_retroativas'] = `ERRO: ${err.message}`;
  }

  const temErro = Object.values(results).some(v => v.startsWith('ERRO'));
  return NextResponse.json({ ok: !temErro, results }, { status: temErro ? 500 : 200 });
}
