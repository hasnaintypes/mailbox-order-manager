import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

type PostgresClient = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as {
  __mailboxSql?: PostgresClient;
};

export const sqlClient =
  globalForDb.__mailboxSql ?? postgres(env.DATABASE_URL, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mailboxSql = sqlClient;
}

export const db = drizzle(sqlClient, { schema });
