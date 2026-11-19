/* ===== Lõi: tiện ích, dữ liệu, AI, điều hướng, flow ===== */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const ABCD = "ABCD";
const ME = "GV014", MY_NAME = "Thu";
const LV = [{k:"de",t:"Dễ",c:"#3f9f6b",bg:"#e4f4ea",ink:"#14532d"},{k:"tb",t:"Trung bình",c:"#3b6fd8",bg:"#e7eefc",ink:"#1e3a8a"},{k:"kha",t:"Khá",c:"#d9911a",bg:"#fdf0d8",ink:"#7a4700"},{k:"kho",t:"Khó",c:"#d0453b",bg:"#fbe9e7",ink:"#8a1f18"}];
function lvPill(k,extra){const l=LV.find(x=>x.k===k);return `<span class="lvpill" style="background:${l.bg};color:${l.ink}"><i style="background:${l.c}"></i>${l.t}${extra||""}</span>`}
const sig = x => 1/(1+Math.exp(-x));
function S(r){return +(0.30*r.A+0.25*r.B+0.20*r.C+0.15*r.D+0.10*r.E).toFixed(2)}
function bOf(r){return +(2*S(r)-3).toFixed(1)}
function lvOfB(b){return b<-1.5?"de":b<0?"tb":b<1.5?"kha":"kho"}
function lvOf(it){return it.lvGV || lvOfB(it.b)}
function lvT(k){return LV.find(x=>x.k===k).t}
function lvC(k){return LV.find(x=>x.k===k).c}
function sk(c){return D.SKILLS[c]||c}
function ymd(d){d=d||new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")}
function mkItem(o){
  const r = o.rub || {A:1,B:1,C:1,D:1,E:1};
  return Object.assign({id:"",type:"mcq",stem:"",options:["","","",""],answer:0,skill:"NP.CC.06",explain:"",rub:r,lvGV:null,source:"GV",check:"khop",isNew:false,attempts:0},o,{b:bOf(r)});
}
function pCorrect(theta,it){const p=sig(theta-it.b);return it.type==="rewrite"?p:0.25+0.75*p}
function expectedScore(items,students){
  if(!items.length) return 0;
  const st=students&&students.length?students:D.STUDENTS; let s=0; st.forEach(x=>{s+=items.reduce((a,it)=>a+pCorrect(x.theta,it),0)/items.length});
  return +(10*s/st.length).toFixed(1);
}
function minutesOf(items){return Math.round(items.reduce((a,it)=>a+(it.type==="rewrite"?1.5:it.passage?1.1:0.75),0))}

/* ===== AI (Claude qua capability sample) ===== */
let sampleFn=null, aiOK=null, imgOK=false;
const RUBRIC = `Rubric độ khó 5 trục, mỗi trục 0–3:
A = kiến thức ngôn ngữ (độ hiếm của từ/cấu trúc so với lớp 8, A2 CEFR)
B = mức nhận thức (nhận biết 0 → vận dụng cao 3)
C = độ nhiễu phương án sai
D = số bước suy luận và tải ngữ cảnh
E = bẫy và ngộ nhận phổ biến của học sinh Việt Nam
Ví dụ: "My brother ___ football every Sunday. A. play B. plays C. playing D. is play" → A0 B1 C1 D0 E1.
'"Where do you live?" Hoa asked me. → Hoa asked me ___. A. where do I live B. where did I live C. where I lived D. where I live' → A2 B2 C2 D2 E2.`;
const SCHEMA = `Mỗi câu là object JSON: {"stem": string (tiếng Anh), "options": [4 string], "answer": số 0-3, "skill": mã kỹ năng trong danh sách, "explain": string (tiếng Việt, 1 câu), "rub": {"A":0-3,"B":0-3,"C":0-3,"D":0-3,"E":0-3}}`;
function parseJSON(t){const m=t.match(/\[[\s\S]*\]|\{[\s\S]*\}/);if(!m)throw new Error("parse");return JSON.parse(m[0])}
async function ask(prompt,tier,onText){
  if(!sampleFn) throw {code:"no_ai"};
  const r = await sampleFn(prompt,{modelTier:tier||"default",onText:onText?({text})=>onText(text):undefined});
  return parseJSON(r.text);
}
function cleanItems(arr,skills){
  return (Array.isArray(arr)?arr:arr.items||[]).filter(x=>x&&x.stem&&Array.isArray(x.options)&&x.options.length===4).map(x=>{
    const r={};["A","B","C","D","E"].forEach(k=>r[k]=Math.max(0,Math.min(3,Math.round(+x.rub?.[k]||1))));
    const s=D.SKILLS[x.skill]?x.skill:skills[0];
    return mkItem({id:newItemId(s),stem:String(x.stem),options:x.options.map(String),answer:Math.max(0,Math.min(3,+x.answer||0)),skill:s,explain:String(x.explain||""),rub:r,source:"AI",check:"chua",isNew:true,attempts:0});
  });
}
const AI = {
  async gen({unit,skills,count,kind},onText){
    const p=`Bạn là giáo viên Tiếng Anh 8 (sách Global Success, GDPT 2018) ở Việt Nam.
Soạn ${count} câu trắc nghiệm 4 phương án, đúng 1 đáp án, cho Unit ${unit} "${D.UNITS[unit-1][1]}", dùng cho ${kind==="kt"?"bài kiểm tra trên lớp":"bài luyện tập về nhà"}.
Kỹ năng (mã: tên): ${skills.map(s=>s+": "+sk(s)).join("; ")}. Chia đều các kỹ năng.
Phân bố độ khó: khoảng 30% dễ, 40% trung bình, 20% khá, 10% khó. Vị trí đáp án đúng phải đa dạng. Không dùng từ vượt vốn từ lớp 8.
${RUBRIC}
${SCHEMA}
Chỉ trả về một mảng JSON.`;
    return cleanItems(await ask(p,"default",onText),skills);
  },
  async blind(items){
    const mc = items.filter(i=>i.type!=="rewrite"&&(i.source==="AI"||i.source==="Tải lên")&&i.check!=="lech");
    if(!mc.length) return;
    const p=`Giải các câu trắc nghiệm tiếng Anh sau. Không có đáp án kèm theo. Với mỗi câu chọn phương án đúng (0-3); nếu thấy hơn một phương án đúng hoặc không phương án nào đúng thì trả -1.
${mc.map((it,i)=>`${i}. ${it.stem}\n   0) ${it.options[0]}  1) ${it.options[1]}  2) ${it.options[2]}  3) ${it.options[3]}`).join("\n")}
Chỉ trả về mảng JSON gồm ${mc.length} số theo đúng thứ tự.`;
    const res = await ask(p,"quick");
    mc.forEach((it,i)=>{if(it.check==="chua"){if(res[i]>=0&&res[i]<=3){it.answer=res[i];it.check="tomo";it.by="tomo";it.verified=false}else{it.check="lech";it.checkPick=-1;it.checkWhy="TOMO giải nhưng không thấy đáp án duy nhất."}return}if(res[i]===it.answer){if(it.check!=="tomo")it.check="khop";it.verified=true;return}it.check="lech";it.checkPick=res[i];if(it.check==="lech")it.checkWhy=`Lượt giải độc lập chọn ${res[i]>=0?ABCD[res[i]]:"không có đáp án duy nhất"}.`});
  },
  async alternatives(it,dir,unit){
    const p=`Soạn 3 câu trắc nghiệm Tiếng Anh 8 cùng kỹ năng ${it.skill} (${sk(it.skill)}), Unit ${unit}, ${dir===0?"CÙNG MỨC ĐỘ KHÓ với câu sau (giữ nguyên điểm rubric, đổi nội dung và ngữ cảnh, không trùng đáp án)":`nhưng ${dir>0?"KHÓ HƠN":"DỄ HƠN"} câu sau đúng một mức`}:
${it.stem} | ${it.options.join(" / ")} (điểm rubric hiện tại A${it.rub.A} B${it.rub.B} C${it.rub.C} D${it.rub.D} E${it.rub.E})
${RUBRIC}
${SCHEMA}
Chỉ trả về mảng JSON gồm 3 câu.`;
    const n=cleanItems(await ask(p,"default"),[it.skill]); if(dir===0)n.forEach(x=>{x.rub=clone(it.rub);x.b=it.b}); await AI.blind(n); return n;
  },
  async twins(items,onText){
    const mc=items.filter(i=>i.type!=="rewrite");
    const p=`Tạo câu "sinh đôi" cho từng câu trắc nghiệm Tiếng Anh 8 dưới đây. Câu sinh đôi đo đúng cùng kỹ năng và cùng độ khó (giữ điểm rubric), nhưng đổi từ ngữ, ngữ cảnh, nội dung đáp án và vị trí đáp án đúng.
${RUBRIC}
${SCHEMA}
Câu gốc: ${JSON.stringify(mc.map(it=>({stem:it.stem,options:it.options,answer:it.answer,skill:it.skill,rub:it.rub})))}
Chỉ trả về mảng JSON gồm ${mc.length} câu theo đúng thứ tự.`;
    const tw=cleanItems(await ask(p,"default",onText),mc.map(i=>i.skill));
    tw.forEach((t,i)=>{if(mc[i]){t.id=mc[i].id+"_T1";t.twinOf=mc[i].id;t.rub=clone(mc[i].rub);t.b=mc[i].b;t.skill=mc[i].skill}});
    return tw;
  },
  async parseText(text,onText){
    const p=`Đây là chữ lấy từ file đề Tiếng Anh 8 giáo viên tải lên (có thể từ OCR: xuống dòng sai, khoảng trắng thừa, số câu dính vào chữ, chỗ trống viết bằng nhiều dấu chấm).
Việc 1, định dạng lại từng câu cho sạch: nối các dòng bị ngắt, bỏ số thứ tự và chữ "A." "B." khỏi nội dung, mọi chỗ trống (….., ____, (…)) viết thành ___, phần gạch chân giữ dạng _ea_, giữ nguyên chữ của đề, không viết lại câu.
Việc 2, đưa ra đáp án đúng cho MỌI câu:
- Nếu đề có đánh dấu (dấu * trước phương án, hoặc bảng đáp án cuối đề) thì dùng đáp án đó, "by":"file". Sau đó tự giải lại; nếu thấy đáp án của đề sai thì vẫn giữ đáp án của đề nhưng ghi "doubt": lý do ngắn bằng tiếng Việt và "fix": đáp án TOMO cho là đúng (số 0-3, hoặc câu mẫu với câu viết lại).
- Nếu đề không có đáp án thì tự giải, "by":"tomo", "conf": độ chắc chắn 0–1. Câu có hơn một phương án đúng hoặc không phương án nào đúng thì conf ≤ 0.5 và ghi "doubt".
- "explain": vì sao đáp án đúng, 1 câu tiếng Việt.
Câu viết lại câu / hoàn thành câu / tự luận: "type":"rewrite", "options": null, "answer": đáp án mẫu đúng ngữ pháp (nhiều cách đúng thì nối bằng " / ").
Câu đọc hiểu: thêm "passage" là đoạn văn (chỉ ghi ở câu đầu tiên của đoạn).
Gán mã kỹ năng phù hợp nhất trong danh sách: ${Object.keys(D.SKILLS).join(", ")}.
${RUBRIC}
${SCHEMA}
Thêm "n" = số thứ tự câu trong đề, "by", "conf", "doubt", "fix" (bỏ trống nếu không nghi ngờ). Không bỏ sót câu nào.
Văn bản:
"""${text.slice(0,7000)}"""
Chỉ trả về mảng JSON.`;
    const raw=await ask(p,"default",onText);let lastP=null;
    return (Array.isArray(raw)?raw:[]).filter(x=>x&&x.stem&&(x.type==="rewrite"||Array.isArray(x.options)&&x.options.length===4)).map(x=>{
      const r={};["A","B","C","D","E"].forEach(k=>r[k]=Math.max(0,Math.min(3,Math.round(+x.rub?.[k]||1))));
      const s=D.SKILLS[x.skill]?x.skill:(x.type==="rewrite"?"VL.01":"TV.TK.01");const by=x.by==="file"?"file":"tomo";const conf=Math.max(0,Math.min(1,+x.conf||0.9));const doubt=String(x.doubt||"").trim();
      if(x.passage)lastP=String(x.passage);
      if(x.type==="rewrite"){const ans=String(x.answer||"").trim();return Object.assign(mkItem({id:newItemId(s),type:"rewrite",stem:String(x.stem),options:null,answer:ans,skill:s,explain:String(x.explain||""),rub:r,source:"Tải lên",check:doubt||!ans?"lech":by==="file"?"khop":"tomo",isNew:true}),{n:+x.n||undefined,by,conf,fixTo:x.fix?String(x.fix):(doubt?ans:undefined),checkWhy:doubt||(!ans?"TOMO chưa đưa ra được đáp án mẫu.":undefined),passage:x.passage?String(x.passage):undefined})}
      const a=+x.answer;const ok=a>=0&&a<=3;
      const check=!ok||doubt||(by==="tomo"&&conf<0.7)?"lech":by==="file"?"khop":"tomo";
      return Object.assign(mkItem({id:newItemId(s),stem:String(x.stem).replace(/\s*(\.{3,}|…+|_{2,})\s*/g," ___ ").replace(/\s{2,}/g," ").trim(),options:x.options.map(o=>String(o).replace(/^\s*[A-D][.)]\s*/,"").trim()),answer:ok?a:0,skill:s,explain:String(x.explain||doubt||""),rub:r,source:"Tải lên",check,isNew:true}),{n:+x.n||undefined,by,conf,checkPick:check==="lech"?(x.fix!=null&&+x.fix>=0&&+x.fix<=3&&+x.fix!==a?+x.fix:-1):undefined,checkWhy:doubt||(!ok?"TOMO chưa chắc đáp án nào đúng.":by==="tomo"&&conf<0.7?`TOMO giải nhưng chỉ chắc khoảng ${Math.round(conf*100)}%.`:undefined),passage:x.passage?String(x.passage):undefined});
    });
  },
  /* Đọc ảnh (trang PDF scan, ảnh chụp đề) bằng Claude: chép lại chữ, bỏ watermark và phần lặp */
  async ocr(blobs,onText){
    const p=`Đây là ảnh các trang của một đề kiểm tra Tiếng Anh lớp 8 (có thể có watermark, logo, tiêu đề lặp ở mỗi trang).
Hãy chép lại NGUYÊN VĂN phần đề: số câu, câu hỏi, các phương án A. B. C. D., đoạn văn đọc hiểu, bảng đáp án nếu có.
Bỏ qua: watermark, logo, tên trường/website, số trang, chữ lặp ở đầu hoặc cuối mỗi trang.
Phần chữ được gạch chân thì viết trong dấu gạch dưới, ví dụ _ea_. Đáp án được khoanh hoặc tô đậm thì thêm dấu * trước phương án đó.
Chép đủ mọi câu, kể cả câu bị cắt ở cuối hoặc đầu trang và câu tự luận/viết lại câu. Giữ đúng số thứ tự câu như trong đề.
Chỉ trả về văn bản đề, không giải thích.`;
    const r=await sampleFn(p,{images:blobs,modelTier:"default",onText:onText?({text})=>onText(text):undefined});return {text:r.text||"",truncated:!!r.truncated};
  },
  async parentText(st,hw){
    const p=`Viết nội dung cho tin Zalo gửi phụ huynh học sinh về kết quả bài "${hw.title||"Bài về nhà"}".
Học sinh: ${st.name}. Kết quả: ${hw.score}/10. Lỗi cần luyện (nếu có): ${hw.need||"không đáng kể"}.
Viết 3 trường, tiếng Việt thân thiện, lời thường, không ký hiệu, không so sánh với bạn, không nhắc chuyện sao chép hay rời bài:
- lam_tot: một điều con làm tốt (tối đa 40 ký tự)
- can_luyen: một điều cần luyện (tối đa 50 ký tự)
- goi_y: một gợi ý phụ huynh làm cùng con ở nhà trong khoảng 5 phút (tối đa 90 ký tự)
Chỉ trả về JSON {"lam_tot":"","can_luyen":"","goi_y":""}.`;
    return await ask(p,"quick");
  }
};
