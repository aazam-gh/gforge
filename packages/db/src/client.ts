import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | undefined;
export function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value)
    throw new Error("DATABASE_URL is required for persisted WorkerOS state");
  return value;
}
export function db() {
  pool ??= new Pool({ connectionString: databaseUrl(), max: 5 });
  return drizzle(pool, { schema });
}
export async function closeDb() {
  await pool?.end();
  pool = undefined;
}
