/* Dữ liệu dùng chung của prototype.
   GET  /api/state            → toàn bộ khoá
   GET  /api/state?since=123  → chỉ các khoá đổi sau mốc seq 123 (các máy hỏi lại vài giây một lần)
   POST /api/state {changes:{khoá: giá trị|null}, action, replaceAll}
        Ghi theo từng khoá, ai ghi sau thắng. replaceAll=true: khoá không có trong changes bị xoá (đặt lại / nhập file).
        action="init": chỉ ghi khi bảng còn trống (máy đầu tiên mở trang tạo dữ liệu mẫu). */
import { json, handler, body, who } from "../lib/server/http.js";
import { query, ensureSchema } from "../lib/server/db.js";

const KEY_RE = /^[A-Za-z][A-Za-z0-9_]{0,40}$/;

export const GET = handler(async (request) => {
  await ensureSchema();
  const since = Number(new URL(request.url).searchParams.get("since") || 0);
  const rows = await query(
    "select key, value, version, seq::text as seq, updated_at, updated_by from kv where seq > $1 order by seq",
    [since]
  );
  const [{ max }] = await query("select coalesce(max(seq),0)::text as max from kv");
  return json({ rows, cursor: Number(max) });
});

export const POST = handler(async (request) => {
  await ensureSchema();
  const b = await body(request);
  const changes = b.changes || {};
  const keys = Object.keys(changes);
  if (keys.some(k => !KEY_RE.test(k))) return json({ error: "Tên khoá không hợp lệ" }, 400);
  const by = who(request);

  if (b.action === "init") {
    const [{ n }] = await query("select count(*)::int as n from kv where value is not null");
    if (n > 0) return json({ skipped: true, reason: "Đã có dữ liệu" });
  }
  const out = {};
  for (const k of keys) {
    const v = changes[k] === undefined ? null : changes[k];
    const [r] = await query(
      `insert into kv (key, value, version, seq, updated_at, updated_by)
       values ($1, $2::jsonb, 1, nextval('kv_seq'), now(), $3)
       on conflict (key) do update set value = excluded.value, version = kv.version + 1,
         seq = nextval('kv_seq'), updated_at = now(), updated_by = excluded.updated_by
       returning version, seq::text as seq`,
      [k, JSON.stringify(v), by]
    );
    out[k] = { version: r.version, seq: Number(r.seq) };
  }
  let removed = [];
  if (b.replaceAll) {
    const rows = await query(
      `update kv set value = null, version = version + 1, seq = nextval('kv_seq'), updated_at = now(), updated_by = $2
       where value is not null and not (key = any($1::text[])) returning key`,
      [keys, by]
    );
    removed = rows.map(r => r.key);
  }
  await query("insert into audit (who, action, keys, detail) values ($1, $2, $3, $4::jsonb)",
    [by, b.action || "save", keys.concat(removed), JSON.stringify({ removed })]);
  const [{ max }] = await query("select coalesce(max(seq),0)::text as max from kv");
  return json({ ok: true, saved: out, removed, cursor: Number(max) });
});
