import { config } from 'dotenv';
config({ path: '.env' });
import { db } from './lib/db';
import { sorteiosParticipantes } from './lib/db/schema';

async function check() {
  const p = await db.select().from(sorteiosParticipantes);
  console.log(p.filter((x: any) => x.nome.toLowerCase().includes('andreia') || x.nome.toLowerCase().includes('andréia')));
}
check();
