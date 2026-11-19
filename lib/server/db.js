/* Kết nối Postgres.
   Trên Vercel: dùng driver HTTP của Neon (DATABASE_URL do Vercel Marketplace tự gắn).
   Chạy thử trên máy: đặt LOCAL_PG=1 để dùng driver pg với Postgres cài sẵn. */
import SCHEMA from "./schema.js";

let run = null;
export function dbUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || "";
}
async function connect() {
  const url = dbUrl();
  if (!url) { const e = new Error("Chưa cấu hình DATABASE_URL"); e.status = 503; e.code = "no_db"; throw e; }
  if (process.env.LOCAL_PG) {
    const { default: pg } = await import("pg");
    const pool = new pg.Pool({ connectionString: url, max: 4 });
    return async (text, params) => (await pool.query(text, params)).rows;
  }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  return (text, params) => sql.query(text, params);
}
export async function query(text, params = []) {
  if (!run) run = await connect();
  return run(text, params);
}

let ready = null;
/* Tạo bảng nếu chưa có. Driver HTTP của Neon chỉ chạy một câu lệnh mỗi lần nên tách theo dấu ; */
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const stmts = SCHEMA.split(/;\s*$/m).map(s => s.replace(/--.*$/gm, "").trim()).filter(Boolean);
      for (const s of stmts) await query(s);
    })().catch(e => { ready = null; throw e; });
  }
  return ready;
}
