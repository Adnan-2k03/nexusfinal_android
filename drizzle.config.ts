import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config();

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
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: getConnectionString(),
  },
});
