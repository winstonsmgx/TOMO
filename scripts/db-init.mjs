/* Tạo bảng trong Postgres: npm run db:init (cần DATABASE_URL). API cũng tự tạo bảng ở lần gọi đầu, nên bước này không bắt buộc. */
import { ensureSchema, query } from "../lib/server/db.js";
await ensureSchema();
const t = await query("select table_name from information_schema.tables where table_schema='public' order by 1");
console.log("Đã có bảng:", t.map(r => r.table_name).join(", "));
process.exit(0);
