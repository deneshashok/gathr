import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const schemaPath = new URL('../supabase/migrations/20261022200846_gathr_initial_schema.sql', import.meta.url);
const schema = await fs.readFile(schemaPath, 'utf8');
const verification = `
  SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
    AND c.relname IN ('organiser_profiles','venues','events','source_runs')
  ORDER BY c.relname;
`;

async function main() {
  let rows;
  if (process.env.DATABASE_URL) {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      await client.query(schema);
      rows = (await client.query(verification)).rows;
    } finally {
      await client.end();
    }
  } else if (process.env.SUPABASE_ACCESS_TOKEN && process.env.SUPABASE_PROJECT_ID) {
    const ref = process.env.SUPABASE_PROJECT_ID;
    if (!/^[a-z0-9]{20}$/.test(ref)) throw Error('Invalid project reference');
    async function query(sql, readOnly = false) {
      const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql, read_only: readOnly }),
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) throw Error(`Supabase management query failed (HTTP ${response.status})`);
      return response.json();
    }
    await query(schema);
    rows = await query(verification, true);
  } else {
    console.error('Schema NOT applied: set DATABASE_URL, or SUPABASE_PROJECT_ID and SUPABASE_ACCESS_TOKEN, in .env.');
    console.error('Project API keys cannot create tables. SQL editor setup file: ' + fileURLToPath(schemaPath));
    process.exitCode = 1;
    return;
  }
  if (!Array.isArray(rows) || rows.length !== 4 || rows.some(row => !row.rls_enabled)) {
    throw Error('Post-install verification did not find all four protected tables');
  }
  console.table(rows);
  console.log('GATHR schema applied and verified. No sample or live records imported.');
}

try { await main(); }
catch {
  console.error('Schema installation/verification failed; success is not claimed. Check SQL permissions, connection and existing table compatibility. Credentials are not logged.');
  process.exitCode = 1;
}
