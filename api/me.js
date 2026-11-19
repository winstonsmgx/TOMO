/* Trạng thái máy chủ: có cần mật khẩu không, đã đăng nhập chưa, có DB và Claude API chưa */
import { json, handler } from "../lib/server/http.js";
import { isAuthed, needPassword } from "../lib/server/auth.js";
import { dbUrl } from "../lib/server/db.js";
import { aiReady, MODELS } from "../lib/server/anthropic.js";

export const GET = handler(async (request) => json({
  backend: true,
  needPassword: needPassword(),
  authed: isAuthed(request),
  db: !!dbUrl(),
  ai: aiReady(),
  models: aiReady() ? MODELS() : null
}), { open: true });
