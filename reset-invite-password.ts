import { db } from './lib/db';
import { colaboradoras } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  const targetEmail = 'b.kleuvyn@gmail.com';
  const newPassword = 'Clube2026!';

  const hashed = await bcrypt.hash(newPassword, 10);

  const result = await db
    .update(colaboradoras)
    .set({ password: hashed, mustChangePassword: true })
    .where(eq(colaboradoras.email, targetEmail))
    .returning({ email: colaboradoras.email, role: colaboradoras.role });

  console.log('Senha redefinida para:', result);
  console.log('Nova senha temporária:', newPassword);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
