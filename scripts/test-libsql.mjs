import { createClient } from '@libsql/client';

(async () => {
  try {
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    const res = await client.execute({ sql: 'SELECT 1 as ok' });
    console.log('OK', res);
  } catch (err) {
    console.error('ERROR', err);
    process.exitCode = 1;
  }
})();
