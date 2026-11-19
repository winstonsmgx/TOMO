/* Tiện ích chung cho các API: trả JSON, đọc tên người dùng, bắt lỗi */
import { isAuthed } from "./auth.js";

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

export function who(request) {
  const raw = request.headers.get("x-examen-who") || "";
  try { return decodeURIComponent(raw).slice(0, 60) || "ẩn danh"; } catch { return "ẩn danh"; }
}

/* Bọc handler: kiểm tra đăng nhập (trừ khi open=true), trả lỗi dạng JSON */
export function handler(fn, { open = false } = {}) {
  return async (request) => {
    try {
      if (!open && !isAuthed(request)) return json({ error: "Cần đăng nhập", code: "auth" }, 401);
      return await fn(request);
    } catch (e) {
      console.error(e);
      return json({ error: e.message || "Lỗi máy chủ", code: e.code || "server" }, e.status || 500);
    }
  };
}

export async function body(request, limit = 4_000_000) {
  const text = await request.text();
  if (text.length > limit) { const e = new Error("Dữ liệu gửi lên quá lớn"); e.status = 413; throw e; }
  return text ? JSON.parse(text) : {};
}
