/* Sinh câu mini test ("câu sinh đôi") cho các câu BTVN của một lớp.
   POST {items:[{id, stem, options, answer, skill, rub}], unit}
   → {items:[{stem, options, answer, skill, explain, rub}]} cùng thứ tự với câu gốc.
   Câu sinh ra giữ kỹ năng và điểm rubric độ khó, đổi từ ngữ, ngữ cảnh, nội dung đáp án và vị trí đáp án đúng.
   Sau đó trình duyệt tự gọi bước "giải lại độc lập" (api/ai, tier quick) để kiểm tra đáp án. */
import { json, handler, body, who } from "../lib/server/http.js";
import { guard, completeText, parseJSON } from "../lib/server/anthropic.js";

const RUBRIC = `Rubric độ khó 5 trục, mỗi trục 0–3:
A = kiến thức ngôn ngữ (độ hiếm của từ/cấu trúc so với lớp 8, A2 CEFR)
B = mức nhận thức (nhận biết 0 → vận dụng cao 3)
C = độ nhiễu phương án sai
D = số bước suy luận và tải ngữ cảnh
E = bẫy và ngộ nhận phổ biến của học sinh Việt Nam`;
const SCHEMA = `Mỗi câu là object JSON: {"stem": string (tiếng Anh), "options": [4 string], "answer": số 0-3, "skill": mã kỹ năng giữ nguyên như câu gốc, "explain": string (tiếng Việt, 1 câu), "rub": {"A":0-3,"B":0-3,"C":0-3,"D":0-3,"E":0-3}}`;

export const POST = handler(async (request) => {
  await guard();
  const b = await body(request);
  const src = (b.items || []).filter(it => it && it.stem && Array.isArray(it.options) && it.options.length === 4).slice(0, 40);
  if (!src.length) return json({ error: "Không có câu trắc nghiệm nào để tạo mini test" }, 400);
  const prompt = `Bạn là giáo viên Tiếng Anh 8 (sách Global Success, GDPT 2018) ở Việt Nam.
Tạo câu mini test ("câu sinh đôi") cho từng câu trắc nghiệm dưới đây${b.unit ? ` (Unit ${b.unit})` : ""}. Câu sinh đôi đo đúng cùng kỹ năng và cùng độ khó (giữ nguyên điểm rubric), nhưng đổi từ ngữ, ngữ cảnh, nội dung đáp án và vị trí đáp án đúng, để học sinh không nhớ được đáp án câu cũ. Đúng một đáp án. Không dùng từ vượt vốn từ lớp 8.
${RUBRIC}
${SCHEMA}
Câu gốc: ${JSON.stringify(src.map(it => ({ stem: it.stem, options: it.options, answer: it.answer, skill: it.skill, rub: it.rub })))}
Chỉ trả về một mảng JSON gồm ${src.length} câu theo đúng thứ tự câu gốc.`;
  const text = await completeText({ prompt, tier: "default", who: who(request), route: "minitest" });
  const arr = parseJSON(text);
  const items = (Array.isArray(arr) ? arr : arr.items || []).map((x, i) => ({ ...x, skill: src[i]?.skill || x.skill, sourceId: src[i]?.id }));
  return json({ items });
});
