/* Mật khẩu chung cho cả nhóm thử. Không đặt APP_PASSWORD thì ai có link cũng vào được. */
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "examen_auth";
export const needPassword = () => !!process.env.APP_PASSWORD;

function token() {
  const secret = process.env.AUTH_SECRET || process.env.APP_PASSWORD || "dev";
  return createHmac("sha256", secret).update("examen:" + (process.env.APP_PASSWORD || "")).digest("base64url");
}
function readCookie(request, name) {
  const c = request.headers.get("cookie") || "";
  const m = c.split(/;\s*/).find(x => x.startsWith(name + "="));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
const same = (a, b) => { const A = Buffer.from(a), B = Buffer.from(b); return A.length === B.length && timingSafeEqual(A, B); };

export function isAuthed(request) {
  if (!needPassword()) return true;
  return same(readCookie(request, COOKIE), token());
}
export function checkPassword(pw) {
  return needPassword() ? same(String(pw || ""), process.env.APP_PASSWORD) : true;
}
export function authCookie(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${token()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
