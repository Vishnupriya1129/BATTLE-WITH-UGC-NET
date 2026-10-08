import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Did you create .env.local with the local Postgres connection string?"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __bwu_pool: Pool | undefined;
}

const pool =
  global.__bwu_pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    // This is the key line — disable SSL for local dev.
    // When we deploy, we'll set this conditionally.
    ssl: false,
  });

if (process.env.NODE_ENV !== "production") {
  global.__bwu_pool = pool;
}

/**
 * Tagged-template helper — mimics postgres.js's `sql\`...\`` syntax
 * so existing query call sites don't need to change.
 *
 * Usage:
 *   const rows = await sql`select * from subjects where code = ${code}`;
 */
export async function sql<T extends QueryResultRow = QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const text = strings.reduce(
    (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  const res: QueryResult<T> = await pool.query<T>(text, values as never[]);
  return res.rows;
}

/**
 * For queries that need a client (transactions, etc.).
 */
export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export { pool };
export default sql;