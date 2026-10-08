import { config } from "dotenv";
import { Pool } from "pg";
import { readFileSync } from "node:fs";

config({ path: ".env.local" });

console.log("=== ENV CHECK ===");
console.log("DATABASE_URL from process.env:");
console.log(JSON.stringify(process.env.DATABASE_URL));

console.log("\n=== .env.local RAW ===");
try {
  const raw = readFileSync(".env.local", "utf-8");
  console.log(JSON.stringify(raw));
} catch (e) {
  console.log("Could not read .env.local:", e);
}

console.log("\n=== CONNECT TEST ===");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 5000,
});

(async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("select current_user, current_database(), inet_server_addr()::text as server_ip");
    console.log("SUCCESS:", res.rows);
    client.release();
  } catch (err) {
    console.error("FAILED:", err);
  } finally {
    await pool.end();
  }
})();