import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Ligação à base de dados.
 *
 * Em serverless cada invocação pode criar um cliente novo, por isso o
 * `max: 1` e o cache global em desenvolvimento evitam esgotar as ligações
 * do Neon, que no plano gratuito são poucas.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL não está definida. Copie .env.example para .env e preencha."
  );
}

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

const conn = globalForDb.conn ?? postgres(connectionString, { max: 1 });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, casing: "snake_case" });
export * as schema from "./schema";
