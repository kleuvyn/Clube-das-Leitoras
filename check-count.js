require('dotenv').config({ path: '.env' });
const { createClient } = require('@libsql/client');
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
async function run() {
  const res = await client.execute('SELECT mes_base, count(*) as c FROM sorteios_participantes GROUP BY mes_base');
  console.log(res.rows);
}
run();
