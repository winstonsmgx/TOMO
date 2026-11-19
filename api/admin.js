/* Bảng quản lí dữ liệu: các khoá, dung lượng, ai sửa lần cuối; lượt gọi Claude; nhật ký thay đổi */
import { json, handler } from "../lib/server/http.js";
import { query, ensureSchema } from "../lib/server/db.js";

export const GET = handler(async () => {
  await ensureSchema();
  const keys = await query(
    "select key, version, octet_length(value::text) as bytes, updated_at, updated_by, value is null as deleted from kv order by key"
  );
  const [ai] = await query(
    `select count(*)::int as calls,
            count(*) filter (where at > now() - interval '1 day')::int as calls_24h,
            count(*) filter (where not ok)::int as errors,
            coalesce(sum(input_tokens),0)::int as input_tokens,
            coalesce(sum(output_tokens),0)::int as output_tokens
     from ai_calls`
  );
  const aiLast = await query("select at, who, route, model, input_tokens, output_tokens, ms, ok, error from ai_calls order by at desc limit 15");
  const audit = await query("select at, who, action, keys from audit order by at desc limit 20");
  return json({ keys, ai, aiLast, audit });
});
