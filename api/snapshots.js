/* Phiên dữ liệu lưu trên máy chủ, cả nhóm dùng chung.
   GET  /api/snapshots           → danh sách
   GET  /api/snapshots?id=...    → tải toàn bộ một phiên (JSON)
   POST {action:"save", name}    → lưu dữ liệu hiện tại thành một phiên
   POST {action:"restore", id}   → tự lưu dữ liệu hiện tại, rồi thay bằng phiên đã chọn
   POST {action:"delete", id} */
import { json, handler, body, who } from "../lib/server/http.js";
import { query, ensureSchema } from "../lib/server/db.js";
import { randomUUID } from "node:crypto";

async function saveCurrent(name, by) {
  const id = "S" + Date.now().toString(36) + randomUUID().slice(0, 6);
  const [r] = await query(
    `insert into snapshots (id, name, created_by, data)
     select $1, $2, $3, coalesce(jsonb_object_agg(key, value) filter (where value is not null), '{}'::jsonb) from kv
     returning id, name, created_at, created_by, octet_length(data::text) as bytes`,
    [id, String(name || "Phiên không tên").slice(0, 120), by]
  );
  return r;
}

export const GET = handler(async (request) => {
  await ensureSchema();
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const [r] = await query("select id, name, created_at, created_by, data from snapshots where id = $1", [id]);
    return r ? json(r, 200, { "content-disposition": `attachment; filename="examen-phien-${id}.json"` }) : json({ error: "Không tìm thấy phiên" }, 404);
  }
  const rows = await query(
    "select id, name, created_at, created_by, octet_length(data::text) as bytes from snapshots order by created_at desc limit 50"
  );
  return json({ rows });
});

export const POST = handler(async (request) => {
  await ensureSchema();
  const b = await body(request);
  const by = who(request);
  if (b.action === "save") {
    const r = await saveCurrent(b.name, by);
    await query("insert into audit (who, action, detail) values ($1, 'snapshot.save', $2::jsonb)", [by, JSON.stringify({ id: r.id, name: r.name })]);
    return json({ ok: true, snapshot: r });
  }
  if (b.action === "restore") {
    const [s] = await query("select id, name, data from snapshots where id = $1", [b.id]);
    if (!s) return json({ error: "Không tìm thấy phiên" }, 404);
    const auto = await saveCurrent(`Tự lưu trước khi mở "${s.name}"`, by);
    const keys = Object.keys(s.data);
    for (const k of keys) {
      await query(
        `insert into kv (key, value, version, seq, updated_at, updated_by) values ($1, $2::jsonb, 1, nextval('kv_seq'), now(), $3)
         on conflict (key) do update set value = excluded.value, version = kv.version + 1, seq = nextval('kv_seq'), updated_at = now(), updated_by = excluded.updated_by`,
        [k, JSON.stringify(s.data[k]), by]
      );
    }
    await query(
      `update kv set value = null, version = version + 1, seq = nextval('kv_seq'), updated_at = now(), updated_by = $2
       where value is not null and not (key = any($1::text[]))`, [keys, by]);
    await query("insert into audit (who, action, detail) values ($1, 'snapshot.restore', $2::jsonb)", [by, JSON.stringify({ id: s.id, name: s.name, autoSaved: auto.id })]);
    return json({ ok: true, restored: s.id, autoSaved: auto });
  }
  if (b.action === "delete") {
    await query("delete from snapshots where id = $1", [b.id]);
    await query("insert into audit (who, action, detail) values ($1, 'snapshot.delete', $2::jsonb)", [by, JSON.stringify({ id: b.id })]);
    return json({ ok: true });
  }
  return json({ error: "Thiếu action" }, 400);
});
