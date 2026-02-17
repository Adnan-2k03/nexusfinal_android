#!/usr/bin/env node
(async () => {
  try {
    const pg = await import('pg');
    const Client = pg.Client;
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('[migrate] Connected to DB, running ALTER TABLE...');
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash varchar");
    console.log('[migrate] ALTER TABLE complete');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('[migrate] Error:', err);
    process.exit(1);
  }
})();
