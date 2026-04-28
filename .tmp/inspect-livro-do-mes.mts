import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../lib/db/schema';
const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client, { schema });
const rows = await db.select({
  id: schema.livroDoMes.id,
  mes: schema.livroDoMes.mes,
  num: schema.livroDoMes.num,
  ano: schema.livroDoMes.ano,
  livro: schema.livroDoMes.livro,
  autora: schema.livroDoMes.autora,
  foto: schema.livroDoMes.foto,
  sinopse: schema.livroDoMes.sinopse
}).from(schema.livroDoMes).limit(5);
for (const row of rows) {
  console.log(JSON.stringify({
    ...row,
    foto: row.foto ? (row.foto.slice(0, 60) + '...') : null
  }, null, 2));
}
