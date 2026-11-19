/* Cổng gọi Claude chung cho trình duyệt (TOMO soạn đề, đọc file đề, giải lại đáp án, trò chuyện…).
   POST {prompt, tier:"default"|"quick", images:[{media_type, data(base64)}]} → chữ trả về dần (text/plain). */
import { json, handler, body, who } from "../lib/server/http.js";
import { guard, streamText } from "../lib/server/anthropic.js";

const IMG_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export const POST = handler(async (request) => {
  await guard();
  const b = await body(request, 20_000_000);
  const prompt = String(b.prompt || "");
  if (!prompt || prompt.length > 60_000) return json({ error: "Prompt rỗng hoặc quá dài" }, 400);
  const images = (b.images || []).filter(im => IMG_TYPES.has(im.media_type) && typeof im.data === "string").slice(0, 20);
  const stream = await streamText({ prompt, images, tier: b.tier, who: who(request), route: "ai" });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
});
