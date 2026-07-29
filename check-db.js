const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function run() {
  const result = await client.execute("SELECT email, role, active FROM colaboradoras");
  console.log(result.rows);
  process.exit(0);
}

run();
