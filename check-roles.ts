import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './lib/db';
import { colaboradoras } from './lib/db/schema';

async function checkRoles() {
  const users = await db.select({
    email: colaboradoras.email,
    role: colaboradoras.role,
    active: colaboradoras.active
  }).from(colaboradoras);
  
  console.log('USUÁRIOS CADASTRADOS:');
  console.table(users);
  process.exit(0);
}

checkRoles().catch(err => {
  console.error(err);
  process.exit(1);
});
