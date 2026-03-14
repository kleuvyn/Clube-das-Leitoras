import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

// Altere aqui o email e a nova senha desejada
const ADMIN_EMAIL = 'b.kleuvyn@gmail.com';
const NOVA_SENHA = 'Outlander777@11';

async function run() {
  const sql = postgres(process.env.DATABASE_URL!);

  const hash = await bcrypt.hash(NOVA_SENHA, 12);

  const result = await sql`
    UPDATE colaboradoras
    SET password = ${hash},
        role = 'convidada',
        active = true,
        must_change_password = false
    WHERE LOWER(email) = LOWER(${ADMIN_EMAIL})
    RETURNING email, role, active
  `;

  if (result.length === 0) {
    console.error('❌ Nenhum usuário encontrado com esse email:', ADMIN_EMAIL);
  } else {
    console.log('✅ Senha e role atualizados com sucesso:');
    console.table(result);
    console.log(`\n📌 Nova senha: ${NOVA_SENHA}`);
  }

  await sql.end();
}

run().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
