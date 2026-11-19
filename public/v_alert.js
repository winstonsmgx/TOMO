/* ===== Cảnh báo bất thường: điểm dao động & lệch thứ tự kỹ năng ===== */
/* Cặp kỹ năng nền → kỹ năng tiếp theo (nền phải vững trước) */
const PREREQ=[["NP.CC.05","NP.CC.06"],["TV.TK.01","TV.TK.02"],["NP.TH.01","NP.TH.04"],["NA.TA.01","NA.AM.02"]];
const SWING=2.0; /* ngưỡng dao động: chênh TB giữa 2 bài liên tiếp ≥ 2 điểm */
/* 6 bài về nhà gần nhất: điểm thực tế và điểm kỳ vọng (theo mức của em và độ khó từng đề).
   Các bài đã chấm trong prototype dùng kết quả thật; các bài trước đó mô phỏng có hạt giống. */
function seriesOf(c,s){
  const done=assignsOf(c).filter(a=>a.state==="done").slice().reverse();
  const real=[];done.forEach(a=>{const row=resultOf(a).rows.find(x=>x.s.id===s.id);if(row&&row.submitted)real.push([row.score,+expectedScore(find(a.examId).items,[s]).toFixed(1),`${find(a.examId).title} · ${fmtD(a.given)}`])});
  const r=rng(s.id.split("").reduce((a,ch)=>(Math.imul(a^ch.charCodeAt(0),2654435761))>>>0,2166136261));for(let k=0;k<5;k++)r();
  const base=Math.max(2,Math.min(9.5,6+s.theta*1.8));const wild=r()<.14;
  const prev=[];for(let i=0;i<6-real.length;i++){const ex=+(base+(r()-.5)*1.2).toFixed(1);let v=ex+(r()-.5)*1.4;if(wild)v+=(i%2?-1:1)*(1.8+r()*1.4);prev.push([+Math.max(0,Math.min(10,v)).toFixed(1),ex,`Bài về nhà tuần ${i+1} (trước đó)`])}
  const all=prev.concat(real).slice(-6);return {xs:all.map(x=>x[0]),ex:all.map(x=>x[1]),lab:all.map(x=>x[2])};
}
/* Độ dao động = chênh trung bình giữa 2 bài liên tiếp của phần lệch (thực tế − kỳ vọng).
   Đề khó hơn làm điểm thấp hơn thì không tính là dao động. */
function swingOf(sr){const d=sr.xs.map((v,i)=>v-sr.ex[i]);if(d.length<3)return 0;let t=0;for(let i=1;i<d.length;i++)t+=Math.abs(d[i]-d[i-1]);return +(t/(d.length-1)).toFixed(1)}
function spark(sr){const xs=sr.xs,W=120,H=28;const x=i=>4+i*(W-8)/(xs.length-1),y=v=>H-3-(H-6)*v/10;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="spark" aria-label="Điểm 6 bài gần nhất: ${xs.join(", ")}; kỳ vọng: ${sr.ex.join(", ")}"><polyline fill="none" stroke="#9aa1b1" stroke-dasharray="3 2" stroke-width="1.2" points="${sr.ex.map((v,i)=>x(i)+","+y(v)).join(" ")}"/><polyline fill="none" stroke="var(--negative)" stroke-width="1.6" points="${xs.map((v,i)=>x(i)+","+y(v)).join(" ")}"/>${xs.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="2.2" fill="var(--negative)"><title>Thực tế ${String(v).replace(".",",")} · kỳ vọng ${String(sr.ex[i]).replace(".",",")}</title></circle>`).join("")}</svg>`}
function alertsOf(c){
  const out=[];const sks=skillsOf(c);const pairs=PREREQ.filter(p=>sks.includes(p[0])&&sks.includes(p[1]));
  ROSTER[c].forEach(s=>{
    const sr=seriesOf(c,s),sw=swingOf(sr);
    if(sw>=SWING)out.push({s,k:"swing",sev:sw>=2.8?2:1,sw,sr});
    const m=masteryOf(c,s);
    pairs.forEach(([a,b])=>{const la=m[sks.indexOf(a)],lb=m[sks.indexOf(b)];
      if(la>=2&&lb<=la-2)out.push({s,k:"stuck",sev:lb===0?2:1,a,b,la,lb});
      else if(la<=1&&lb>=la+1&&lb>=2)out.push({s,k:"skip",sev:la===0?2:1,a,b,la,lb});});
  });
  return out.sort((x,y)=>y.sev-x.sev||x.s.name.localeCompare(y.s.name,"vi"));
}
const AK={swing:["Điểm dao động","s-neg","Điểm lên xuống thất thường, không theo mức của em và độ khó của đề"],
  stuck:["Hụt ở bước tiếp","s-warn","Nền đã làm được nhưng kỹ năng nối tiếp chưa làm được"],
  skip:["Làm được bước sau, nền chưa vững","s-info","Kỹ năng sau làm được trong khi kỹ năng nền chưa: có thể đoán, chép, hoặc nền đo chưa đúng"]};
function alertPanel(c){
  const al=alertsOf(c.id);const kf=UI.r.ak||"all";const cnt=k=>al.filter(x=>x.k===k).length;
  const rows=al.filter(x=>kf==="all"||x.k===kf);
  const chip=(k,lab)=>`<button class="fchip ${kf===k?"on":""}" data-ak="${k}">${lab} <b>${k==="all"?al.length:cnt(k)}</b></button>`;
  const detail=x=>x.k==="swing"?`<div class="sparkrow">${spark(x.sr)}<span class="muted">lệch kỳ vọng đổi TB <b class="neg-t">${String(x.sw).replace(".",",")}</b> điểm/bài</span></div>`
    :`<span>${esc(sk(x.a))} <b>${LVN[x.la]}</b> ${ic("chev",11)} ${esc(sk(x.b))} <b>${LVN[x.lb]}</b></span>`;
  const act=x=>x.k==="swing"?`<button class="btn sm" data-alw="${x.s.name}">Xem bài làm</button>`
    :x.k==="stuck"?`<button class="btn sm" data-alg="${x.b}" data-als="${x.s.name}">Giao bài nối</button>`
    :`<button class="btn sm" data-alg="${x.a}" data-als="${x.s.name}">Kiểm tra lại nền</button>`;
  return `<section class="panel flush alertp"><div class="phead pad"><h2>Cảnh báo bất thường</h2><span class="muted">6 bài gần nhất · ${al.length} cảnh báo · ${new Set(al.map(x=>x.s.id)).size} em</span>
    <button class="iconbtn sm" id="alInfo" aria-label="Cách tính">${ic("info",14)}</button></div>
    <div class="fchips pad">${chip("all","Tất cả")}${chip("swing","Điểm dao động")}${chip("stuck","Hụt ở bước tiếp")}${chip("skip","Nền chưa vững")}</div>
    ${rows.length?`<table class="tbl compact"><thead><tr><th>STT</th><th>Học sinh</th><th>Cảnh báo</th><th>Chi tiết</th><th></th></tr></thead><tbody>${rows.map((x,i)=>`<tr><td class="mono">${i+1}</td><td>${esc(x.s.full||x.s.name)}</td><td><span class="apill ${AK[x.k][1]}" title="${esc(AK[x.k][2])}">${AK[x.k][0]}${x.sev===2?" · mạnh":""}</span></td><td>${detail(x)}</td><td class="act"><button class="btn sm ghost" data-alx="${x.s.id}|${x.k}|${x.a||""}" aria-expanded="${UI.r.alx===`${x.s.id}|${x.k}|${x.a||""}`}">${UI.r.alx===`${x.s.id}|${x.k}|${x.a||""}`?"Ẩn giải thích":"Vì sao?"}</button>${act(x)}</td></tr>${UI.r.alx===`${x.s.id}|${x.k}|${x.a||""}`?`<tr class="alx"><td></td><td colspan="4">${explainAlert(c.id,x)}</td></tr>`:""}`).join("")}</tbody></table>`
    :`<div class="empty-line">Không có cảnh báo loại này.</div>`}</section>`;
}
const vn1=v=>(v>0?"+":v<0?"−":"")+Math.abs(v).toFixed(1).replace(".",",");
function explainAlert(c,x){const name=esc(x.s.full||x.s.name);
  if(x.k==="swing"){const {xs,ex,lab}=x.sr;const d=xs.map((v,i)=>v-ex[i]);
    const rows=xs.map((v,i)=>`<tr><td>${esc(lab[i])}</td><td class="num">${String(v).replace(".",",")}</td><td class="num">${String(ex[i]).replace(".",",")}</td><td class="num ${d[i]<-1?"neg-t":d[i]>1?"pos-t":""}">${vn1(d[i])}</td><td class="num">${i?vn1(d[i]-d[i-1]):"—"}</td></tr>`).join("");
    const hi=d.indexOf(Math.max(...d)),lo=d.indexOf(Math.min(...d));
    return `<div class="alxbox"><p><b>Vì sao cảnh báo:</b> điểm của ${name} lên xuống thất thường so với mức của em. Có bài em cao hơn kỳ vọng ${Math.abs(d[hi]).toFixed(1).replace(".",",")} điểm (${esc(lab[hi])}), có bài lại thấp hơn ${Math.abs(d[lo]).toFixed(1).replace(".",",")} điểm (${esc(lab[lo])}). Trung bình mỗi bài phần lệch đổi <b>${String(x.sw).replace(".",",")} điểm</b>; ngưỡng cảnh báo là 2,0, từ 2,8 là mạnh.</p>
    <table class="tbl compact alxt"><thead><tr><th>Bài</th><th class="num">Thực tế</th><th class="num">Kỳ vọng</th><th class="num">Lệch</th><th class="num">Đổi so với bài trước</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="small muted">Kỳ vọng tính từ mức của em và độ khó của từng đề, nên đề khó làm điểm thấp không bị tính là dao động.</p>
    <p><b>Thường do:</b> làm vội hoặc bỏ dở ở một số bài; có bài được người khác làm giúp hoặc tra công cụ ngoài; em đang hổng một phần kiến thức nên đề nào trúng phần đó thì tụt. <b>Cô có thể:</b> mở "Xem bài làm" của bài thấp nhất và bài cao nhất để so lỗi; cho em làm một bài ngắn trên lớp để xem mức thật.</p></div>`}
  const sks=skillsOf(c),m=masteryOf(c,x.s);const P=["dưới 40%","40–60%","60–80%","từ 80%"];
  const base=`<b>${esc(sk(x.a))}</b> là nền của <b>${esc(sk(x.b))}</b>: phải làm được kỹ năng đầu thì mới làm được kỹ năng sau.`;
  if(x.k==="stuck")return `<div class="alxbox"><p><b>Vì sao cảnh báo:</b> ${base} ${name} đã ở mức <b>${LVN[x.la]}</b> với kỹ năng nền (khả năng làm đúng câu chuẩn ${P[x.la]}), nhưng kỹ năng sau chỉ ở mức <b>${LVN[x.lb]}</b> (${P[x.lb]}), thấp hơn ${x.la-x.lb} mức. Bình thường hai kỹ năng này chỉ lệch nhau tối đa 1 mức.</p>
    <p><b>Thường do:</b> em nắm quy tắc nền nhưng chưa biết áp dụng sang dạng mới (ví dụ biết lùi thì ở câu trần thuật nhưng chưa biết đổi trật tự câu hỏi). <b>Cô có thể:</b> bấm "Giao bài nối" để giao 5–8 câu chuyển tiếp từ ${esc(sk(x.a))} sang ${esc(sk(x.b))}.</p></div>`;
  return `<div class="alxbox"><p><b>Vì sao cảnh báo:</b> ${base} Nhưng ${name} làm được kỹ năng sau ở mức <b>${LVN[x.lb]}</b> (${P[x.lb]}) trong khi kỹ năng nền chỉ ở mức <b>${LVN[x.la]}</b> (${P[x.la]}). Thứ tự này ngược với cách học thường gặp.</p>
    <p><b>Có 3 khả năng:</b> em đoán đúng nhiều ở kỹ năng sau; em được giúp hoặc tra công cụ khi làm kỹ năng sau; hoặc mức kỹ năng nền đang bị đo thấp vì em mới làm ít câu. <b>Cô có thể:</b> bấm "Kiểm tra lại nền" để giao vài câu ${esc(sk(x.a))}; nếu em làm tốt thì cảnh báo tự hết, nếu không thì kết quả kỹ năng sau cần xem lại.</p></div>`;
}
function bindAlert(c){
  on("[data-alx]",el=>{UI.r.alx=UI.r.alx===el.dataset.alx?null:el.dataset.alx;render()});
  on("[data-ak]",el=>{UI.r.ak=el.dataset.ak;render()});
  const inf=document.querySelector("#alInfo");if(inf)inf.onclick=()=>modal(`${mhead("Cách tính cảnh báo")}<div class="mbody"><dl class="defs">
    <dt>Điểm dao động</dt><dd>Với 6 bài về nhà gần nhất, lấy phần lệch giữa điểm thực tế và điểm kỳ vọng (theo mức của em và độ khó của đề), rồi tính phần lệch này thay đổi trung bình bao nhiêu điểm giữa hai bài liên tiếp. Đề khó hơn nên điểm thấp hơn thì không bị tính. Từ ${String(SWING).replace(".",",")} điểm trở lên là cảnh báo, từ 2,8 là mạnh. Điểm nhảy lên xuống mà không khớp mức kỹ năng thường do làm vội, nhờ người khác làm, hoặc đề lệch độ khó.</dd>
    <dt>Hụt ở bước tiếp</dt><dd>Kỹ năng nền đã "Làm được" trở lên nhưng kỹ năng nối tiếp thấp hơn từ 2 mức. Ví dụ: tường thuật câu trần thuật làm được, tường thuật câu hỏi chưa làm được.</dd>
    <dt>Làm được bước sau, nền chưa vững</dt><dd>Kỹ năng nối tiếp đạt "Làm được" trong khi kỹ năng nền chỉ "Đang luyện" hoặc thấp hơn, kể cả kỹ năng thuộc unit chưa dạy. Cần kiểm tra lại nền trước khi tin vào kết quả.</dd>
    <dt>Cặp kỹ năng đang xét</dt><dd>${PREREQ.map(([a,b])=>`${esc(sk(a))} → ${esc(sk(b))}`).join("<br>")}</dd></dl></div>`);
  on("[data-alg]",el=>aiModal({unit:12,kind:"lt",min:10,skills:[el.dataset.alg],reason:`Bài riêng cho ${fullOf(c,el.dataset.als)} (${c}): ${sk(el.dataset.alg)}.`}));
  on("[data-alw]",el=>{const a=assignsOf(c).find(x=>x.state==="done");if(a)studentWork(a.id,el.dataset.alw);else toast("Chưa có bài đã chấm.")});
}
