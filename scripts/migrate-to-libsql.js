#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

async function main() {
  const libsqlUrl = process.env.LIBSQL_URL || process.argv[2];
  if (!libsqlUrl) {
    console.error('Usage: LIBSQL_URL="libsql://..." node scripts/migrate-to-libsql.js');
    process.exit(1);
  }

  const dumpPath = path.resolve(process.cwd(), 'neon-backup.sql');
  if (!fs.existsSync(dumpPath)) {
    console.error('neon-backup.sql not found in project root');
    process.exit(1);
  }

  const sql = fs.readFileSync(dumpPath, 'utf8');

  // Extract INSERT statements (including multi-line, multiple VALUES blocks)
  const insertRegex = /INSERT INTO\s+([\w\.\"]+)\s*(\([^;]*?\))?\s+VALUES\s*\([\s\S]*?\);/gmi;
  const inserts = [];
  let m;
  while ((m = insertRegex.exec(sql)) !== null) {
    inserts.push(m[0]);
  }

  if (inserts.length === 0) {
    console.error('No INSERT statements found in neon-backup.sql');
    process.exit(1);
  }

  // Build simple CREATE TABLE statements based on columns in first insert per table.
  const tableCols = Object.create(null);
  const colListRegex = /INSERT INTO\s+([\w\.\"]+)\s*\(([^)]+)\)/i;
  for (const stmt of inserts) {
    const c = colListRegex.exec(stmt);
    if (c) {
      const table = c[1].replace(/\"/g, '');
      if (!tableCols[table]) {
        const cols = c[2].split(',').map(s => s.trim().replace(/\"/g, ''));
        tableCols[table] = cols;
      }
    }
  }

  const client = createClient({ url: libsqlUrl });

  try {
    console.log('Connecting to LibSQL...');
    // Test connection
    await client.execute('SELECT 1');

    // Create tables with simple TEXT columns where we have column lists
    for (const [table, cols] of Object.entries(tableCols)) {
      const safeName = table.includes('.') ? table.split('.').pop() : table;
      const colsDDL = cols.map(c => '"' + c + '" TEXT').join(', ');
      const createSQL = `CREATE TABLE IF NOT EXISTS "${safeName}" (${colsDDL});`;
      console.log('Creating table', safeName);
      try {
        await client.execute(createSQL);
      } catch (err) {
        console.error('Failed to create table', safeName, err.message || err);
      }
    }

    // Execute inserts in batches
    console.log(`Executing ${inserts.length} INSERT statements (this may take a while)`);
    for (let i = 0; i < inserts.length; i++) {
      const stmt = inserts[i];
      // Convert qualified table names "public"."table" to just "table" for LibSQL
      const converted = stmt.replace(/INSERT INTO\s+"?public"?\.?"?([\w]+)"?/gi, 'INSERT INTO "$1"');
      try {
        await client.execute(converted);
      } catch (err) {
        console.error(`Failed INSERT ${i + 1}/${inserts.length}:`, err.message || err);
      }
      if ((i + 1) % 100 === 0) console.log(`Processed ${i + 1}/${inserts.length} inserts`);
    }

    console.log('Migration finished. Please validate data and add missing indexes/constraints manually.');
  } finally {
    client.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
