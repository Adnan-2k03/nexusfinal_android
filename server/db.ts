import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

function getConnectionString(): string {
  const rawUrl = process.env.DATABASE_URL;

  if (rawUrl && !rawUrl.includes('${{') && rawUrl.startsWith('postgres')) {
    return rawUrl;
  }

  const host = process.env.PGHOST;
  const database = process.env.PGDATABASE;
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;

  if (host && database && user && password) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
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
