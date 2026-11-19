/* Gọi Claude API ở phía máy chủ. Khoá ANTHROPIC_API_KEY không bao giờ gửi xuống trình duyệt.
   AI_MOCK=1: trả lời giả để chạy thử không tốn tiền (dùng khi phát triển). */
import { query } from "./db.js";

export const aiReady = () => !!(process.env.ANTHROPIC_API_KEY || process.env.AI_MOCK);
export const MODELS = () => ({
  default: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
  quick: process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-5-5"
});
const LIMIT_PER_HOUR = () => Number(process.env.AI_HOURLY_LIMIT || 300);

let client = null;
async function getClient() {
  if (!client) { const { default: Anthropic } = await import("@anthropic-ai/sdk"); client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
  return client;
}

export async function guard() {
  if (!aiReady()) { const e = new Error("Chưa cấu hình ANTHROPIC_API_KEY"); e.status = 503; e.code = "no_ai"; throw e; }
  try {
    const [{ n }] = await query("select count(*)::int as n from ai_calls where at > now() - interval '1 hour'");
    if (n >= LIMIT_PER_HOUR()) { const e = new Error(`Đã chạm giới hạn ${LIMIT_PER_HOUR()} lượt gọi AI mỗi giờ`); e.status = 429; e.code = "rate"; throw e; }
  } catch (e) { if (e.code === "rate") throw e; /* DB chưa sẵn sàng thì vẫn cho gọi */ }
}

async function logCall(row) {
  try {
    await query(
      "insert into ai_calls (who, route, model, input_tokens, output_tokens, ms, ok, error) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [row.who, row.route, row.model, row.input_tokens || 0, row.output_tokens || 0, row.ms, row.ok, row.error || null]
    );
  } catch (e) { console.error("log ai_calls", e.message); }
}

/* content: chuỗi, hoặc mảng block theo Messages API (text + image) */
function buildContent(prompt, images) {
  if (!images || !images.length) return prompt;
  return [
    ...images.map(im => ({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } })),
    { type: "text", text: prompt }
  ];
}

/* Gọi Claude và trả về ReadableStream chữ (để trình duyệt hiện dần). Ghi nhật ký khi xong. */
export async function streamText({ prompt, images, tier = "default", maxTokens = 8000, who, route }) {
  const model = MODELS()[tier === "quick" ? "quick" : "default"];
  const t0 = Date.now();
  const enc = new TextEncoder();
  if (process.env.AI_MOCK) {
    const text = mockAnswer(prompt);
    return new ReadableStream({
      async start(ctrl) {
        for (const part of text.match(/.{1,40}/gs) || []) { ctrl.enqueue(enc.encode(part)); await new Promise(r => setTimeout(r, 15)); }
        ctrl.close();
        await logCall({ who, route, model: "mock", ms: Date.now() - t0, ok: true });
      }
    });
  }
  const c = await getClient();
  const stream = c.messages.stream({ model, max_tokens: maxTokens, messages: [{ role: "user", content: buildContent(prompt, images) }] });
  return new ReadableStream({
    start(ctrl) {
      stream.on("text", d => ctrl.enqueue(enc.encode(d)));
      stream.finalMessage().then(async m => {
        ctrl.close();
        await logCall({ who, route, model, input_tokens: m.usage?.input_tokens, output_tokens: m.usage?.output_tokens, ms: Date.now() - t0, ok: true });
      }).catch(async e => {
        ctrl.enqueue(enc.encode(`\n[[AI_ERROR]] ${e.message}`)); ctrl.close();
        await logCall({ who, route, model, ms: Date.now() - t0, ok: false, error: String(e.message).slice(0, 500) });
      });
    },
    cancel() { stream.abort(); }
  });
}

/* Gọi Claude, chờ đủ câu trả lời (dùng cho API trả JSON). */
export async function completeText(opts) {
  const s = await streamText(opts);
  const r = s.getReader(); const dec = new TextDecoder(); let t = "";
  for (;;) { const { done, value } = await r.read(); if (done) break; t += dec.decode(value, { stream: true }); }
  if (t.includes("[[AI_ERROR]]")) { const e = new Error(t.split("[[AI_ERROR]]")[1].trim()); e.status = 502; e.code = "ai_error"; throw e; }
  return t;
}

export function parseJSON(t) {
  const m = t.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!m) { const e = new Error("AI không trả về JSON"); e.status = 502; e.code = "ai_parse"; throw e; }
  return JSON.parse(m[0]);
}

/* Câu trả lời giả cho AI_MOCK: đủ hình dạng để giao diện chạy */
function mockAnswer(prompt) {
  const n = Number((prompt.match(/gồm (\d+) câu/) || prompt.match(/Soạn (\d+) câu/) || [])[1] || 3);
  if (/mảng JSON gồm \d+ số/.test(prompt)) { const k = Number(prompt.match(/gồm (\d+) số/)[1]); return JSON.stringify(Array.from({ length: k }, () => 0)); }
  if (/"lam_tot"/.test(prompt)) return '{"lam_tot":"Làm bài cẩn thận","can_luyen":"Câu tường thuật","goi_y":"Hỏi con kể lại bài học bằng tiếng Anh 5 phút"}';
  if (/Trả lời 1–2 câu/.test(prompt)) return "Cô có 3 em cần xác nhận ở 8A3, nên xem trước giờ lên lớp.";
  const items = Array.from({ length: n }, (_, i) => ({
    stem: `(Mẫu ${i + 1}) She asked me where I ___ the day before.`,
    options: ["go", "went", "had gone", "goes"].map((o, j) => (j + i) % 4 === 2 ? "had gone" : o),
    answer: 2, skill: "NP.CC.06", explain: "Câu tường thuật lùi thì: quá khứ đơn → quá khứ hoàn thành.",
    rub: { A: 1, B: 2, C: 1, D: 1, E: 2 }
  }));
  return JSON.stringify(items);
}
