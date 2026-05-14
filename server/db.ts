import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

function getConnectionString(): string {
  const host = process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;

  // Prefer individual PG* vars when PGHOST is a real hostname (not the
  // dev-only internal alias "base" which is unreachable from production).
  if (host && host !== 'base' && database && user && password) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  // Fall back to DATABASE_URL, but only if it looks valid and its host is
  // not the dev-only "base" alias.
  const rawUrl = process.env.DATABASE_URL;
  if (rawUrl && !rawUrl.includes('${{') && rawUrl.startsWith('postgres')) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.hostname && parsed.hostname !== 'base') {
        return rawUrl;
      }
    } catch {
      // unparseable URL – fall through to error
    }
  }

  // Last resort: if PGHOST is "base" but DATABASE_URL is also bad, still
  // try the individual PG* vars so dev containers keep working.
  if (host && database && user && password) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  throw new Error(
    "No valid database connection could be built. Ensure PGHOST/PGUSER/PGPASSWORD/PGDATABASE are set or DATABASE_URL points to a reachable host.",
  );
}

const connectionString = getConnectionString();

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('sslmode=require') || connectionString.includes('ssl=true')
    ? { rejectUnauthorized: false }
    : undefined
});

export { pool };
export const db = drizzle(pool, { schema });
