import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../lib/db/schema';
const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client, { schema });
const rows = await db.select({
  mes: schema.livroDoMes.mes,
  ano: schema.livroDoMes.ano,
  num: schema.livroDoMes.num,
  foto: schema.livroDoMes.foto,
  livro: schema.livroDoMes.livro
}).from(schema.livroDoMes).where(schema.livroDoMes.ano.equals(new Date().getFullYear()));
console.log('rows=' + rows.length);
for (const row of rows) {
  console.log([row.mes, row.ano, row.num, !!row.foto, row.livro].join(' | '));
}
const abril = rows.filter(row => String(row.mes || '').trim().toLowerCase() === 'abril');
console.log('abril_count=' + abril.length);
for (const row of abril) {
  console.log('abril row', [row.mes, row.ano, row.num, !!row.foto, row.livro].join(' | '));
}
