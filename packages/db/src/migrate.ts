import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, closeDb } from "./client";
async function main() {
  await migrate(db(), {
    migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
  });
  await closeDb();
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
