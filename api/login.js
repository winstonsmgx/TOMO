import { json, handler, body } from "../lib/server/http.js";
import { checkPassword, authCookie, clearCookie } from "../lib/server/auth.js";

export const POST = handler(async (request) => {
  const { password } = await body(request, 10_000);
  if (!checkPassword(password)) return json({ error: "Sai mật khẩu" }, 401);
  return json({ ok: true }, 200, { "set-cookie": authCookie(request) });
}, { open: true });

export const DELETE = handler(async () => json({ ok: true }, 200, { "set-cookie": clearCookie() }), { open: true });
