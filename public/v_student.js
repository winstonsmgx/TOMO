/* ===== Góc nhìn học sinh: Đặng Tuấn, 8A1 — làm bài về nhà (UC3) và luyện lỗi ===== */
const STU={cls:"8A1",name:"Tuấn",aid:"GIAO_8A1_20261113"};
const PASSAGE="Scientists have found ice under the surface of Mars. The planet is very cold and dry, and there are no big oceans like on Earth. However, the ice is important. In the future, visitors could melt it to get drinking water and even make fuel. Many scientists are still studying Mars to learn more.";
const HINT={"TV.CD.05":"Tìm từ khoá trong câu (creature, Red) rồi loại các từ không hợp nghĩa.","NA.TA.01":"Đọc to từng từ. Danh từ 2 âm tiết thường nhấn âm đầu, động từ 2 âm tiết thường nhấn âm sau.",
 "NP.CC.05":"Câu tường thuật lùi thì một bậc: am/is → was, will → would.","NP.CC.06":"Câu hỏi tường thuật dùng trật tự câu kể: từ để hỏi + chủ ngữ + động từ. Câu hỏi Có/Không dùng if.",
 "DH.DH.02":"Tìm câu trong đoạn có từ giống phương án, rồi so từng chi tiết.","DH.DH.03":"Chọn ý mà đoạn văn gợi ra. Cẩn thận với các từ nói quá: All, Nobody, easy."};
/* Nhãn lỗi của từng phương án sai (distractor_tags) */
const ERRT={"3":{0:"Chưa lùi thì",2:"Sai hoà hợp chủ ngữ",3:"Sai dạng động từ"},"4":{0:"Chưa lùi thì",2:"Chưa lùi thì",3:"Đổi nghĩa động từ khuyết thiếu"},
 "5":{1:"Dùng that cho câu hỏi Có/Không",2:"Nhầm từ để hỏi",3:"Giữ trợ động từ của câu hỏi"},"6":{1:"Giữ trật tự câu hỏi",2:"Chưa lùi thì",3:"Giữ trật tự câu hỏi"},
 "7":{0:"Chưa lùi thì",2:"Sai hoà hợp chủ ngữ",3:"Sai dạng động từ"},"0":{1:"Nhầm từ cùng chủ đề",2:"Nhầm từ cùng chủ đề",3:"Nhầm từ cùng chủ đề"},"1":{0:"Nhầm từ cùng chủ đề",2:"Nhầm từ cùng chủ đề",3:"Nhầm từ cùng chủ đề"},
 "2":{0:"Nhầm trọng âm",1:"Nhầm trọng âm",2:"Nhầm trọng âm"},"8":{1:"Đọc lướt, bắt nhầm chi tiết",2:"Đọc lướt, bắt nhầm chi tiết",3:"Đọc lướt, bắt nhầm chi tiết"},"9":{0:"Suy luận quá lên",2:"Suy luận quá lên",3:"Suy luận quá lên"}};
const PRACT={
 "Chưa lùi thì":[["\"I live in Hue,\" Lan said. → Lan said that she ___ in Hue.",["live","lives","lived","living"],2,"Lùi thì: live → lived."],["\"We are hungry,\" the boys said. → The boys said they ___ hungry.",["are","were","was","be"],1,"Lùi thì: are → were."],["\"I will call you,\" Nam said. → Nam said he ___ call me.",["will","would","shall","can"],1,"Lùi thì: will → would."]],
 "Giữ trật tự câu hỏi":[["\"Where is the station?\" he asked. → He asked where the station ___.",["is","was","did be","does"],1,"Trật tự câu kể: where + the station + was."],["\"What do you want?\" Mai asked me. → Mai asked me what I ___.",["want","wanted","did I want","do I want"],1,"Không đảo trợ động từ: what + I + wanted."],["\"Why are you late?\" the teacher asked Tom. → The teacher asked Tom why he ___ late.",["is","was","were he","are"],1,"why + he + was, không đảo ngữ."]],
 "Dùng that cho câu hỏi Có/Không":[["\"Are you ready?\" she asked. → She asked ___ I was ready.",["that","if","what","do"],1,"Câu hỏi Có/Không dùng if hoặc whether."],["\"Can you swim?\" he asked me. → He asked me ___ I could swim.",["whether","that","what","can"],0,"Câu hỏi Có/Không dùng whether hoặc if."],["\"Did you see Mars?\" Hoa asked. → Hoa asked ___ I had seen Mars.",["that","if","when","did"],1,"Câu hỏi Có/Không dùng if."]],
 "Suy luận quá lên":[["\"Some planets have moons.\" Which sentence is TRUE?",["All planets have moons.","Not every planet may have moons.","No planet has moons.","Moons are planets."],1,"\"Some\" không có nghĩa là tất cả."],["\"Mars is very cold.\" What can we infer?",["People need warm suits on Mars.","Mars is hotter than the Sun.","Nobody can study Mars.","Mars has no ice."],0,"Rất lạnh → cần đồ giữ ấm."],["\"Few people have seen a comet.\" What does this mean?",["Everyone has seen one.","Not many people have seen one.","Comets do not exist.","Nobody can see comets."],1,"Few = không nhiều."]]};
const SLV=b=>b<-0.7?["Dễ","easy"]:b<=0.7?["Trung bình","mid"]:["Khó","hard"];
function stuS(){return ROSTER[STU.cls].find(x=>x.name===STU.name)}
function stuA(){return DB.assigns.find(a=>a.id===STU.aid)}
function stuW(){DB.stu=DB.stu||{};return DB.stu[STU.aid]=DB.stu[STU.aid]||{ans:{},chg:{},hint:{},mark:{},t:{},ev:[],i:0,state:"todo",fast:0}}
/* Thời gian dự kiến của riêng Tuấn cho từng câu (theo doc, khi câu chưa có dữ liệu):
   điển hình = số từ ÷ 2 + số bước suy luận (trục D) × 8 + 2 giây; ngưỡng quá nhanh = số từ ÷ 5 + D × 2 giây (đọc lướt);
   cả hai nhân e^(−τ), τ = tốc độ quen thuộc của Tuấn (dương là nhanh). Đoạn văn chỉ tính lần đầu (câu 9). */
const TAU0=0.2,PAUSE=5;
/* τ (tau) = tốc độ quen thuộc của Tuấn, KHÔNG phải năng lực θ (theta). Bắt đầu từ mức ước lượng τ0, rồi cập nhật ngay trong bài:
   mỗi câu em làm không quá nhanh cho một mẫu (β − ln t); τ = (n × trung vị mẫu + 5 × τ0) ÷ (n + 5), giới hạn −1 đến 1,5. */
function tauOf(){const w=stuW();const xs=(w.tauS||[]).slice().sort((a,b)=>a-b);if(!xs.length)return TAU0;const med=xs.length%2?xs[(xs.length-1)/2]:(xs[xs.length/2-1]+xs[xs.length/2])/2;const n=xs.length;return Math.max(-1,Math.min(1.5,(n*med+5*TAU0)/(n+5)))}
/* Thời gian điển hình khi câu chưa có dữ liệu: số từ ÷ 2 (đọc 2 từ/giây) + số bước suy luận (trục D) × 4 giây với câu ngắn, × 8 giây với câu đọc hiểu + 2 giây chọn.
   Ngưỡng quá nhanh = số từ ÷ 5 + D × 1 giây (đọc lướt). Cả hai nhân e^(−τ). */
function timeOf(it,i){const wc=t=>t.trim().split(/\s+/).length;const stem=it.stem.replace(/^\([^)]*\)\s*/,"");let words=wc(stem)+it.options.reduce((a,o)=>a+wc(o),0);if(i===8)words+=wc(PASSAGE);
  const D=(it.rub&&it.rub.D!=null)?it.rub.D:1,step=it.skill.startsWith("DH")?8:4;const typ0=words/2+D*step+2,min0=words/5+D;const k=Math.exp(-tauOf());return {typ0,exp:Math.round(typ0*k),min:Math.max(2,Math.round(min0*k)),words,D}}
const SU={r:"home",shownAt:0,lastAct:Date.now(),idle:false,nudge:false,lockUntil:0,away:null,copied:0,pi:0,pAns:null};
const hhmm=()=>{const d=new Date();return [d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":")};
function logEv(t,extra){const w=stuW();w.ev.push({at:hhmm(),q:SU.r==="q"?w.i+1:null,t,...(extra||{})});save();renderLog();renderChips()}

/* ---------- Chuyển góc nhìn ---------- */
function roleSwitch(cur){return `<div class="roleswitch" role="tablist" aria-label="Góc nhìn"><button role="tab" aria-selected="${cur==="gv"}" class="${cur==="gv"?"on":""}" data-role="gv">${ic("cls",14)} Cô Thu · Giáo viên</button><button role="tab" aria-selected="${cur==="hs"}" class="${cur==="hs"?"on":""}" data-role="hs"><span class="av">T</span> Đặng Tuấn · 8A1</button></div>`}
function setRole(r){UI.role=r;document.body.classList.toggle("role-hs",r==="hs");closeM();if(r==="hs"){SU.r=stuW().state==="done"?"home":SU.r;renderStu()}else{RES_CLEAR();render()}}
function RES_CLEAR(){delete RES_CACHE[STU.aid]}
function bindRole(){document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>setRole(b.dataset.role))}

/* ---------- Khung trang học sinh ---------- */
const DEV_EVT=[["leave","Rời cửa sổ / tab"],["copy","Sao chép"],["paste","Dán"],["rclick","Chuột phải"],["shot","Phím chụp màn hình"],["narrow","Thu hẹp cửa sổ"],["idle","Ngồi im 3 phút"]];
function stuDev(){DB.ui=DB.ui||{};return DB.ui.stuDev||"desk"}
function renderStu(){
  let root=document.querySelector("#stu");if(!root){root=document.createElement("div");root.id="stu";document.body.insertBefore(root,document.querySelector("#layer"))}
  const dev=stuDev();SU.w0=window.innerWidth;SU.narrow=false;
  const frame=dev==="desk"?`<div class="deskf"><div class="winbar"><i></i><i></i><i></i><span>TOMO · Bài tập của Tuấn</span></div><div class="screen desk" id="scr">${stuScreen()}</div></div>`
    :`<div class="phonef"><div class="notch"></div><div class="screen" id="scr">${stuScreen()}</div></div>`;
  const sim=dev==="desk"?`<span class="flabel">Đang bắt thao tác thật trên máy tính</span><div class="evchips" id="evchips"></div>
     <p class="small muted simnote">Thử ngay khi đang mở một câu: chuyển sang tab hoặc cửa sổ khác, bôi đen rồi Ctrl C, chuột phải, phím chụp màn hình (Windows: PrtSc, Alt+PrtSc, Win+Shift+S; Mac: Cmd+Shift+3/4/5), thu nhỏ cửa sổ.</p>
     <span class="flabel">Mô phỏng nhanh</span><p class="small muted simnote">Dùng khi trình duyệt hoặc hệ điều hành chặn thao tác thật (thường gặp với phím chụp màn hình và khi xem trong khung nhúng).</p>
     <div class="simbtns"><button class="btn sm" id="simLeave">Rời cửa sổ 40 giây</button><button class="btn sm" id="simCopy">Sao chép đề rồi rời đi 25 giây</button><button class="btn sm" id="simShot">Chụp màn hình, ở lại bài</button><button class="btn sm" id="simShotLeave">Chụp màn hình rồi rời đi 30 giây</button><button class="btn sm" id="simPaste">Dán vào bài</button><button class="btn sm" id="simRclick">Chuột phải</button><button class="btn sm" id="simNarrow">Thu hẹp cửa sổ</button></div>
     <button class="btn sm" id="simIdle">Tua nhanh: ngồi im 3 phút</button><button class="btn sm" id="simReset">Làm lại từ đầu</button>`
    :`<span class="flabel">Mô phỏng hành vi</span><button class="btn sm" id="simCopy">Sao chép đề rồi rời app 25 giây</button><button class="btn sm" id="simShot">Chụp màn hình, ở lại app</button><button class="btn sm" id="simShotLeave">Chụp màn hình rồi rời app 30 giây</button><button class="btn sm" id="simIdle">Ngồi im 3 phút</button><button class="btn sm" id="simReset">Làm lại từ đầu</button>`;
  root.innerHTML=`<header class="stubar"><span class="brand-s"><b>TOMO</b> Học sinh</span><div class="devsw" role="group" aria-label="Thiết bị"><button class="${dev==="desk"?"on":""}" data-dev="desk" aria-pressed="${dev==="desk"}">Máy tính</button><button class="${dev==="phone"?"on":""}" data-dev="phone" aria-pressed="${dev==="phone"}">Điện thoại</button></div><span class="sp"></span>${roleSwitch("hs")}</header>
  <div class="stuwrap ${dev}">${frame}
  <aside class="syslog"><div class="slh"><h2>Hệ thống ghi nhận</h2><span class="tagg">Tuấn không thấy</span></div><div id="slog"></div>
   <div class="simbox">${sim}</div></aside></div>`;
  bindRole();bindScr();renderLog();renderChips();
  root.querySelectorAll("[data-dev]").forEach(b=>b.onclick=()=>{DB.ui.stuDev=b.dataset.dev;save();renderStu()});
  const need=()=>{if(SU.r!=="q"){toast("Mở một câu hỏi trước.");return false}return true};
  const q=id=>root.querySelector(id);
  if(q("#simCopy"))q("#simCopy").onclick=()=>{if(!need())return;logEv("copy",{n:58});logEv("leave");logEv("back",{sec:25});flagCopy(25)};
  if(q("#simShot"))q("#simShot").onclick=()=>{if(!need())return;logEv("shot")};
  if(q("#simShotLeave"))q("#simShotLeave").onclick=()=>{if(!need())return;logEv("shot");logEv("leave");logEv("back",{sec:30});flagCopy(30,"shot")};
  const simq=(id,f)=>{const b=q(id);if(b)b.onclick=()=>{if(!need())return;f()}};
  simq("#simLeave",()=>{logEv("leave");logEv("back",{sec:40});toast("Đã mô phỏng: Tuấn rời cửa sổ 40 giây rồi quay lại.")});
  simq("#simPaste",()=>logEv("paste"));simq("#simRclick",()=>logEv("rclick"));simq("#simNarrow",()=>logEv("narrow"));
  if(q("#simShot"))q("#simShot").onclick=()=>{if(!need())return;shot("PrtSc (mô phỏng)",true)};
  q("#simIdle").onclick=()=>{if(!need())return;showIdle()};
  q("#simReset").onclick=()=>{delete DB.stu[STU.aid];delete (DB.stuDone||{})[STU.aid];RES_CLEAR();save();SU.r="home";renderStu()};
}
function renderChips(){const el=document.querySelector("#evchips");if(!el)return;const w=stuW();const c={};w.ev.forEach(x=>{const k=x.t==="back"?null:x.t;if(k)c[k]=(c[k]||0)+1});
  el.innerHTML=DEV_EVT.map(([k,l])=>`<span class="evc ${c[k]?"hit":""}">${l}${c[k]?` <b>${c[k]}</b>`:""}</span>`).join("")}
function rerender(){const s=document.querySelector("#scr");if(!s)return;s.innerHTML=stuScreen();s.scrollTop=0;bindScr();renderLog()}
function stuScreen(){return ({home:scrHome,intro:scrIntro,q:scrQ,review:scrReview,result:scrResult,practice:scrPractice,pdone:scrPDone})[SU.r]()}
function tabbar(){return `<nav class="tabbar"><span class="on">${ic("today",18)}Trang chủ</span><span>${ic("book",18)}Bài tập</span><span>${ic("chart",18)}Kỹ năng</span><span>${ic("user",18)}Tôi</span></nav>`}

function scrHome(){
  const s=stuS(),a=stuA(),e=find(a.examId),w=stuW();const m=masteryOf(STU.cls,s),sks=skillsOf(STU.cls);
  const past=assignsOf(STU.cls).filter(x=>x.state==="done").map(x=>[x,resultOf(x).rows.find(r=>r.s.id===s.id)]);
  const done=w.state==="done";const started=Object.keys(w.ans).length>0;
  return `<div class="sbody"><div class="hi"><div><span class="sub">Thứ Tư, 18/11</span><h1>Chào Tuấn</h1></div><span class="av big">T</span></div>
  ${done?`<div class="card ok"><span class="sub">Đã nộp · Bài về nhà Unit 12</span><b class="big">${w.score}<small>/10</small></b><p>Cô Thu đã nhận bài của em.</p><button class="sbtn ghost" data-sgo="result">Xem lại bài và lời giải</button>${w.prac==="done"?"":`<button class="sbtn" data-sgo="practice">Luyện lỗi · 3 câu</button>`}</div>`
  :`<div class="card due"><span class="duechip">Hạn hôm nay · 21:00</span><h2>${esc(e.title)}</h2><p class="sub">Cô Thu giao · ${e.items.length} câu · khoảng ${e.minutes} phút</p>${started?`<div class="pbar"><i style="width:${Object.keys(w.ans).length*10}%"></i></div><p class="sub">Đã làm ${Object.keys(w.ans).length}/${e.items.length} câu</p>`:""}<button class="sbtn" data-sgo="${started?"q":"intro"}">${started?"Làm tiếp":"Bắt đầu làm bài"}</button></div>`}
  <h3>Kỹ năng Unit 12</h3><ul class="sk">${sks.map((k,i)=>`<li><span>${esc(sk(k))}</span><span class="lvchip lv${m[i]}">${LVN[m[i]]}</span></li>`).join("")}</ul>
  <h3>Bài đã làm</h3><ul class="past">${past.map(([x,r])=>`<li><span>${esc(find(x.examId).title)}<span class="sub">${fmtD(x.given)}</span></span><b>${r&&r.submitted?String(r.score).replace(".",",")+"/10":"—"}</b></li>`).join("")}</ul></div>${tabbar()}`;
}
function scrIntro(){const e=find(stuA().examId);
  return `<div class="stop"><button class="sback" data-sgo="home" aria-label="Quay lại">${ic("chevl",22)}</button><span>Bài về nhà</span></div><div class="sbody">
  <h1>${esc(e.title)}</h1><p class="sub">Cô Thu · hạn 21:00 hôm nay</p>
  <div class="facts"><div><b>${e.items.length}</b><span>câu</span></div><div><b>~${e.minutes}</b><span>phút</span></div><div><b>1</b><span>đoạn văn</span></div></div>
  <ul class="rules"><li>Mỗi câu có nút Gợi ý nếu em bí.</li><li>Em có thể đánh dấu câu để xem lại trước khi nộp.</li><li>Thoát giữa chừng, bài vẫn được lưu.</li></ul></div>
  <div class="sfoot"><button class="sbtn" id="startQ">Bắt đầu</button></div>`}
function scrQ(){
  const w=stuW(),e=find(stuA().examId),it=e.items[w.i],n=e.items.length,lv=SLV(it.b);const pick=w.ans[w.i];
  const passage=it.skill.startsWith("DH");
  return `<div class="stop"><button class="sback" data-exit aria-label="Lưu và thoát">${ic("x",20)}</button><span>Câu ${w.i+1}/${n}</span><button class="markbtn ${w.mark[w.i]?"on":""}" data-mark aria-pressed="${!!w.mark[w.i]}">${ic("star",16)} Xem lại</button></div>
  <div class="pbar thin"><i style="width:${(w.i+1)/n*100}%"></i></div>
  <div class="sbody q">${lockLeft()>0?`<div class="slow" role="alert"><b>Em đang làm rất nhanh mấy câu liền</b><span>Với tốc độ em hay làm, câu này cần khoảng ${timeOf(it,w.i).exp} giây. Em đọc lại đề và các đáp án nhé.</span><span class="cd">Câu tiếp mở sau <b id="cdn">${lockLeft()}</b> giây</span></div>`:""}
  <span class="dtag ${lv[1]}">${lv[0]}</span>
  ${passage?`<details class="passage" ${w.i===8?"open":""}><summary>Đoạn văn</summary><p>${esc(PASSAGE)}</p></details>`:""}
  <p class="stem">${esc(it.stem.replace(/^\((Đoạn 60 từ về nước trên sao Hỏa|Cùng đoạn)\)\s*/,""))}</p>
  <div class="opts">${it.options.map((o,j)=>`<button class="opt2 ${pick===j?"on":""}" data-opt="${j}"><span class="l">${ABCD[j]}</span><span>${esc(o)}</span></button>`).join("")}</div>
  ${w.hint[w.i]?`<div class="hintbox">${ic("info",14)} ${esc(HINT[it.skill]||"Đọc lại đề, gạch chân từ khoá.")}</div>`:`<button class="hintbtn" data-hint>Gợi ý</button>`}</div>
  <div class="sfoot two"><button class="sbtn ghost" data-prev ${w.i===0||lockLeft()>0?"disabled":""}>Câu trước</button>${w.i===n-1?`<button class="sbtn" data-sgo="review" ${lockLeft()>0?"disabled":""}>Xem lại bài</button>`:`<button class="sbtn" data-next ${lockLeft()>0?"disabled":""}>Câu tiếp</button>`}</div>
  ${SU.idle?`<div class="sover"><div class="sdlg"><h2>Em còn ở đây không?</h2><p class="sub">Đồng hồ đang tạm dừng.</p><button class="sbtn" id="stillHere">Em vẫn đang làm</button></div></div>`:""}`;
}
function scrReview(){const w=stuW(),e=find(stuA().examId);const blank=e.items.filter((_,i)=>w.ans[i]==null).length;
  return `<div class="stop"><button class="sback" data-sgo="q" aria-label="Quay lại">${ic("chevl",22)}</button><span>Xem lại bài</span></div><div class="sbody">
  <div class="qgrid">${e.items.map((_,i)=>`<button class="qcell ${w.mark[i]?"mk":w.ans[i]!=null?"done":""}" data-goq="${i}" aria-label="Câu ${i+1}: ${w.mark[i]?"cần xem lại":w.ans[i]!=null?"đã làm":"chưa làm"}">${i+1}</button>`).join("")}</div>
  <div class="leg"><span><i class="done"></i>Đã làm</span><span><i class="mk"></i>Cần xem lại</span><span><i></i>Chưa làm</span></div>
  ${blank?`<p class="warnline">Còn ${blank} câu chưa làm. Câu bỏ trống tính là sai.</p>`:`<p class="sub">Em đã làm đủ ${e.items.length} câu.</p>`}</div>
  <div class="sfoot"><button class="sbtn" id="submitB">Nộp bài</button></div>`}
function gradeOf(w,e){const res=e.items.map((it,i)=>({it,i,pick:w.ans[i],ok:w.ans[i]===it.answer,tag:w.ans[i]!=null&&w.ans[i]!==it.answer?(ERRT[i]||{})[w.ans[i]]||"Chưa nắm kỹ năng":null}));return res}
function topErr(res){const c={};res.filter(r=>r.tag&&PRACT[r.tag]).forEach(r=>c[r.tag]=(c[r.tag]||0)+1);const k=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];return k||"Chưa lùi thì"}
function scrResult(){
  const w=stuW(),e=find(stuA().examId),res=gradeOf(w,e);const s=stuS();const m=masteryOf(STU.cls,s),sks=skillsOf(STU.cls);
  const after=sks.map((k,i)=>{const rs=res.filter(r=>r.it.skill===k);if(!rs.length)return m[i];const p=rs.filter(r=>r.ok).length/rs.length;return Math.max(0,Math.min(3,m[i]+(p>=0.99&&m[i]<3?1:p<0.5?-1:0)))});
  const te=topErr(res);
  return `<div class="stop"><button class="sback" data-sgo="home" aria-label="Về trang chủ">${ic("chevl",22)}</button><span>Kết quả</span></div><div class="sbody">
  <div class="score"><b>${w.score}<small>/10</small></b><span>${w.score>=8?"Làm tốt lắm!":w.score>=5?"Khá rồi, còn vài chỗ cần luyện.":"Mình luyện thêm nhé."}</span></div>
  ${res.some(r=>!r.ok)?`<div class="card pr"><span class="sub">Em hay nhầm</span><b>${esc(te)}</b><p class="sub">${res.filter(r=>r.tag===te).length} câu trong bài</p>${w.prac==="done"?`<p class="okline">Đã luyện xong</p>`:`<button class="sbtn" data-sgo="practice">Luyện 3 câu nhắm lỗi này</button>`}</div>`:""}
  <h3>Kỹ năng sau bài này</h3><ul class="sk">${sks.map((k,i)=>`<li><span>${esc(sk(k))}</span><span>${after[i]!==m[i]?`<span class="lvchip lv${m[i]} old">${LVN[m[i]]}</span> ${ic("chev",10)} `:""}<span class="lvchip lv${after[i]}">${LVN[after[i]]}</span></span></li>`).join("")}</ul>
  <h3>Từng câu</h3><ol class="rlist">${res.map(r=>`<li class="${r.ok?"ok":"bad"}"><div class="rh"><span class="mk2">${r.ok?ic("check",14):ic("x",14)}</span><span>Câu ${r.i+1}</span><span class="dtag ${SLV(r.it.b)[1]}">${SLV(r.it.b)[0]}</span></div>
   ${r.ok?"":`<details><summary>Xem vì sao</summary><p class="stem sm">${esc(r.it.stem.replace(/^\([^)]*\)\s*/,""))}</p><p>Em chọn: <s>${r.pick==null?"(bỏ trống)":esc(r.it.options[r.pick])}</s></p><p>Đáp án: <b>${esc(r.it.options[r.it.answer])}</b></p><p class="why">${esc(explainOf(r.it)||HINT[r.it.skill]||"")}</p></details>`}</li>`).join("")}</ol></div>`;
}
function scrPractice(){const w=stuW(),res=gradeOf(w,find(stuA().examId)),te=topErr(res),P=PRACT[te],q=P[SU.pi];const ans=SU.pAns;
  return `<div class="stop"><button class="sback" data-sgo="result" aria-label="Quay lại">${ic("chevl",22)}</button><span>Luyện lỗi · ${SU.pi+1}/3</span></div><div class="pbar thin"><i style="width:${(SU.pi+1)/3*100}%"></i></div>
  <div class="sbody q"><span class="sub">${esc(te)}</span><p class="stem">${esc(q[0])}</p>
  <div class="opts">${q[1].map((o,j)=>`<button class="opt2 ${ans!=null?(j===q[2]?"right":j===ans?"wrong":""):""}" data-popt="${j}" ${ans!=null?"disabled":""}><span class="l">${ABCD[j]}</span><span>${esc(o)}</span></button>`).join("")}</div>
  ${ans!=null?`<div class="fb ${ans===q[2]?"ok":"bad"}"><b>${ans===q[2]?"Đúng rồi!":"Chưa đúng."}</b> ${esc(q[3])}</div>`:""}</div>
  <div class="sfoot">${ans!=null?`<button class="sbtn" id="pNext">${SU.pi<2?"Câu tiếp":"Hoàn thành"}</button>`:""}</div>`}
function scrPDone(){const w=stuW();return `<div class="sbody center"><div class="donebadge">${ic("check",28)}</div><h1>Xong phần luyện!</h1><p>Em làm đúng ${w.pracOK}/3 câu.</p><p class="sub">Cô Thu sẽ thấy em đã luyện phần này.</p></div><div class="sfoot"><button class="sbtn" data-sgo="home">Về trang chủ</button></div>`}

/* ---------- Tương tác ---------- */
function stuOn(sel,fn){document.querySelectorAll("#scr "+sel).forEach(el=>el.onclick=ev=>{ev.preventDefault();if(el.disabled)return;act();fn(el,ev)})}
function act(){SU.lastAct=Date.now()}
function lockLeft(){return Math.max(0,Math.ceil((SU.lockUntil-Date.now())/1000))}
function startLock(){SU.lockUntil=Date.now()+PAUSE*1000;clearInterval(SU.lt);SU.lt=setInterval(()=>{const n=lockLeft();const el=document.querySelector("#cdn");if(el)el.textContent=n;if(n<=0){clearInterval(SU.lt);rerender()}},250)}
function openQ(i){const w=stuW();w.i=i;SU.r="q";SU.shownAt=Date.now();SU.nudge=false;save();logEv("show");rerender()}
function bindScr(){
  stuOn("[data-sgo]",el=>{const g=el.dataset.sgo;if(g==="q"){openQ(stuW().i);return}if(g==="practice"){SU.pi=0;SU.pAns=null;stuW().pracOK=0}SU.r=g;rerender()});
  const sb=document.querySelector("#startQ");if(sb)sb.onclick=()=>{const w=stuW();w.state="doing";w.start=w.start||Date.now();openQ(0)};
  stuOn("[data-opt]",el=>{const w=stuW(),j=+el.dataset.opt,it=find(stuA().examId).items[w.i];const prev=w.ans[w.i];if(prev===j)return;
    const dt=(Date.now()-SU.shownAt)/1000;w.t[w.i]=Math.round(dt);
    if(prev!=null){w.chg[w.i]=(w.chg[w.i]||0)+1;logEv("change",{from:prev,to:j,dir:`${prev===it.answer?"đúng":"sai"} → ${j===it.answer?"đúng":"sai"}`})}
    else{const tm=timeOf(it,w.i);logEv("pick",{to:j,sec:Math.round(dt),exp:tm.exp,min:tm.min});const ok=j===it.answer,fast=dt<tm.min;
      w.fastQ=w.fastQ||{};w.streak=w.streak||[];
      if(fast){const pc=pCorrect(stuS().theta,it);
        if(pc>=0.85){w.fastQ[w.i]="easy";logEv("fastok",{sec:Math.round(dt),min:tm.min,p:pc})}
        else{w.fastQ[w.i]=ok?"ok":"bad";w.streak.push({i:w.i,ok});const last=w.streak.slice(-3);
          if(last.length===3&&last.filter(x=>!x.ok).length>=2){w.guessQ=w.guessQ||{};last.forEach(x=>{if(!x.ok)w.guessQ[x.i]=1});w.fast=(w.fast||0)+1;w.streak=[];startLock();logEv("nudge",{n:3,bad:last.filter(x=>!x.ok).length})}
          else logEv("fastone",{sec:Math.round(dt),min:tm.min,run:w.streak.length})}}
      else w.streak=[];
      if(!SU.away&&(!fast||ok)){const t0=tauOf();w.tauS=(w.tauS||[]).concat([Math.log(tm.typ0)-Math.log(Math.max(1,dt))]);const t1=tauOf();if(Math.abs(t1-t0)>=0.01)logEv("tau",{from:t0,to:t1})}}
    w.ans[w.i]=j;save();rerender()});
  stuOn("[data-hint]",()=>{const w=stuW();w.hint[w.i]=1;save();logEv("hint");rerender()});
  stuOn("[data-mark]",()=>{const w=stuW();w.mark[w.i]=!w.mark[w.i];save();rerender()});
  stuOn("[data-next]",()=>openQ(stuW().i+1));stuOn("[data-prev]",()=>openQ(stuW().i-1));
  stuOn("[data-goq]",el=>openQ(+el.dataset.goq));
  stuOn("[data-exit]",()=>{logEv("exit");SU.r="home";rerender()});
  document.querySelectorAll("#scr details.passage summary").forEach(sm=>sm.onclick=()=>{act();if(!sm.parentElement.open)logEv("passage")});
  const sh=document.querySelector("#stillHere");if(sh)sh.onclick=()=>{SU.idle=false;act();logEv("resume");rerender()};
  const sub=document.querySelector("#submitB");if(sub)sub.onclick=submitStu;
  stuOn("[data-popt]",el=>{const j=+el.dataset.popt;const w=stuW(),q=PRACT[topErr(gradeOf(w,find(stuA().examId)))][SU.pi];SU.pAns=j;if(j===q[2])w.pracOK=(w.pracOK||0)+1;save();logEv("practice",{ok:j===q[2]});rerender()});
  const pn=document.querySelector("#pNext");if(pn)pn.onclick=()=>{act();if(SU.pi<2){SU.pi++;SU.pAns=null}else{stuW().prac="done";save();SU.r="pdone";logEv("practice_done")}rerender()};
}
function submitStu(){const w=stuW(),e=find(stuA().examId);const res=gradeOf(w,e);const c=res.filter(r=>r.ok).length;
  w.score=+(10*c/e.items.length).toFixed(1);w.state="done";w.min=Math.max(1,Math.round((Date.now()-(w.start||Date.now()))/60000));
  DB.stuDone=DB.stuDone||{};DB.stuDone[STU.aid]={name:STU.name,score:w.score,time:w.min};RES_CLEAR();save();logEv("submit",{score:w.score});SU.r="result";rerender()}
function showIdle(){SU.idle=true;logEv("idle");rerender()}
function flagCopy(sec,kind){const w=stuW();w.copyQ=w.copyQ||{};if(sec>20)w.copyQ[w.i]=kind||"copy";save();renderLog()}

/* ---------- Bảng "Hệ thống ghi nhận" ---------- */
const EVN={show:"Hiện câu",pick:"Chọn",change:"Đổi đáp án",hint:"Mở gợi ý",copy:"Sao chép nội dung câu",paste:"Dán nội dung",rclick:"Mở menu chuột phải",narrow:"Cửa sổ bị thu hẹp (có thể đang chia đôi màn hình)",wide:"Cửa sổ rộng lại",shot:"Chụp màn hình (không chặn, không lưu ảnh)",leave:"Rời app",back:"Quay lại",idle:"Không thao tác 3 phút, dừng đồng hồ",resume:"Tiếp tục",nudge:"3 câu nhanh liền, phần lớn sai: nhắc và khoá Câu tiếp 5 giây",fastone:"Nhanh hơn ngưỡng, chưa nhắc",tau:"Cập nhật tốc độ τ của Tuấn",fastok:"Nhanh nhưng câu này dễ với em, không nhắc, không gắn cờ",exit:"Lưu và thoát",passage:"Mở lại đoạn văn",submit:"Nộp bài",practice:"Luyện lỗi",practice_done:"Xong luyện lỗi"};
function wOf(w,i,it){if(w.copyQ&&w.copyQ[i])return [0.5,w.copyQ[i]==="shot"?"Nghi dùng công cụ ngoài (chụp màn hình)":"Nghi dùng công cụ ngoài"];if(w.guessQ&&w.guessQ[i]&&w.ans[i]!==it.answer)return [0,"Đoán mò"];if(w.fastQ&&w.fastQ[i]==="bad"&&w.ans[i]!==it.answer)return [0.5,""];if(w.ans[i]===it.answer&&((w.chg[i]||0)>=3||w.hint[i]))return [0.5,"Chưa chắc chắn"];return [1,""]}
function renderLog(){const el=document.querySelector("#slog");if(!el)return;const w=stuW(),e=find(stuA().examId);
  const rows=e.items.map((it,i)=>{const [wt,f]=wOf(w,i,it);return w.ans[i]==null&&!w.copyQ?.[i]?"":`<tr><td>${i+1}</td><td>${w.ans[i]==null?"—":ABCD[w.ans[i]]}</td><td class="num">${w.t[i]??"—"}s</td><td class="num">${w.chg[i]||0}</td><td>${w.hint[i]?"có":""}</td><td class="num ${wt<1?"warn-t":""}">${wt}</td><td>${f?`<span class="apill ${wt===0?"s-neg":"s-warn"}">${f}</span>`:""}</td></tr>`}).join("");
  const nS=(w.tauS||[]).length;
  el.innerHTML=`<div class="taubox"><span>Tốc độ quen thuộc τ (tau): <b>${tauOf().toFixed(2).replace(".",",")}</b></span><span class="sub">${nS?`cập nhật từ ${nS} câu em làm, bắt đầu ở ${String(TAU0).replace(".",",")}`:`ước lượng ban đầu; tự cập nhật sau mỗi câu em làm`}. Dương là nhanh hơn trung bình. Khác với năng lực θ (theta).</span></div><table class="tbl compact logt"><thead><tr><th>Câu</th><th>Chọn</th><th>Thời gian</th><th>Đổi</th><th>Gợi ý</th><th title="Trọng số tin cậy w: 1 tính đủ, 0,5 tính một nửa, 0 không tính vào năng lực">w</th><th>Cờ</th></tr></thead><tbody>${rows||`<tr><td colspan="7" class="muted">Chưa có câu nào.</td></tr>`}</tbody></table>
  <span class="flabel">Nhật ký sự kiện</span><ol class="evlog">${w.ev.slice(-14).reverse().map(x=>`<li><span class="mono">${x.at}</span>${x.q?` <b>Câu ${x.q}</b>`:""} ${esc(x.t==="leave"&&stuDev()==="desk"?"Rời cửa sổ làm bài":EVN[x.t]||x.t)}${x.t==="pick"?` ${ABCD[x.to]} sau ${x.sec}s${x.min!=null?` (dự kiến ${x.exp}s, ngưỡng ${x.min}s)`:""}`:x.t==="nudge"?` (${x.bad}/3 câu sai)`:x.t==="fastone"?` (${x.sec}s < ${x.min}s · chuỗi ${x.run} câu)`:x.t==="fastok"?` (${x.sec}s < ${x.min}s, khả năng làm đúng ${Math.round(x.p*100)}%)`:x.t==="tau"?` ${x.from.toFixed(2).replace(".",",")} → ${x.to.toFixed(2).replace(".",",")}`:x.t==="change"?` (${x.dir})`:x.t==="shot"&&x.combo?` · ${esc(x.combo)}${x.sure?"":" · có thể"}`:x.t==="copy"?` (${x.n} ký tự, không lưu nội dung)`:x.t==="back"?` sau ${x.sec}s${x.sec>20&&x.flag?" → cờ":""}`:x.t==="submit"?` · ${x.score}/10`:x.t==="practice"?(x.ok?" · đúng":" · sai"):""}</li>`).join("")||`<li class="muted">Chưa có sự kiện.</li>`}</ol>`}

/* ---------- Sự kiện thật của trình duyệt khi đang ở góc nhìn học sinh ---------- */
const inQ=()=>UI.role==="hs"&&SU.r==="q";
function goneStart(){if(SU.away)return;SU.away=Date.now();logEv("leave")}
function goneEnd(){if(!SU.away)return;const sec=Math.round((Date.now()-SU.away)/1000);const sus=SU.sus&&SU.away-SU.sus.at<15000?SU.sus:null;logEv("back",{sec,flag:!!(sus&&sec>20)});if(sus)flagCopy(sec,sus.kind);SU.away=null;SU.sus=null;act()}
document.addEventListener("copy",()=>{if(!inQ())return;const n=(String(window.getSelection())||"").length;logEv("copy",{n});SU.sus={kind:"copy",at:Date.now()}});
document.addEventListener("paste",()=>{if(inQ())logEv("paste")});
document.addEventListener("contextmenu",e=>{if(inQ()&&e.target.closest("#scr"))logEv("rclick")});
/* Phím chụp màn hình. Trình duyệt chỉ nhận được một phần vì hệ điều hành chặn trước:
   Windows: PrtSc / Alt+PrtSc / Win+PrtSc (Chrome, Edge nhận keyup PrintScreen) → chắc chắn.
            Win+Shift+S (Snipping Tool) → trình duyệt thấy Win+Shift rồi cửa sổ mất focus → có thể.
   Mac:     Cmd+Shift+3 / 4 / 5 (thêm Ctrl để chép vào bộ nhớ tạm) → thường chỉ thấy Cmd+Shift, phím số bị macOS chặn → có thể;
            nếu trình duyệt nhận được cả phím số thì chắc chắn. */
const isMac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);
function shot(combo,sure){logEv("shot",{combo,sure});SU.sus={kind:"shot",at:Date.now()}}
document.addEventListener("keyup",e=>{if(!inQ())return;if(e.key==="PrintScreen")shot(e.altKey?"Alt+PrtSc":e.metaKey?"Win+PrtSc":"PrtSc",true)});
document.addEventListener("keydown",e=>{if(!inQ())return;
  if(e.metaKey&&e.shiftKey&&["3","4","5","#","$","%"].includes(e.key)){shot(`${e.ctrlKey?"Cmd+Ctrl+Shift":"Cmd+Shift"}+${{"#":"3","$":"4","%":"5"}[e.key]||e.key}`,true);SU.arm=null;return}
  if(!isMac&&e.metaKey&&e.shiftKey&&(e.key==="s"||e.key==="S")){shot("Win+Shift+S",true);SU.arm=null;return}
  if((e.key==="Shift"&&e.metaKey)||(e.key==="Meta"&&e.shiftKey)){SU.arm={at:Date.now(),mac:isMac};clearTimeout(SU.armT);
    SU.armT=setTimeout(()=>{if(SU.arm&&SU.arm.mac){shot("Cmd+Shift+3/4/5 (macOS không cho trình duyệt thấy phím số)",false)}SU.arm=null},1200);return}
  if(SU.arm)SU.arm=null});
window.addEventListener("blur",()=>{if(inQ()&&SU.arm&&Date.now()-SU.arm.at<1500&&!SU.arm.mac){clearTimeout(SU.armT);shot("Win+Shift+S (công cụ cắt màn hình mở ra)",false);SU.arm=null}},true);
document.addEventListener("visibilitychange",()=>{if(!inQ())return;document.hidden?goneStart():goneEnd()});
window.addEventListener("blur",()=>{if(inQ()&&stuDev()==="desk")goneStart()});
window.addEventListener("focus",()=>{if(UI.role==="hs"&&SU.away)goneEnd()});
window.addEventListener("resize",()=>{if(!inQ()||stuDev()!=="desk"||!SU.w0)return;const n=window.innerWidth<SU.w0*0.7;if(n&&!SU.narrow){SU.narrow=true;logEv("narrow")}else if(!n&&SU.narrow){SU.narrow=false;logEv("wide")}});
setInterval(()=>{if(UI.role==="hs"&&SU.r==="q"&&!SU.idle&&Date.now()-SU.lastAct>180000)showIdle()},5000);
document.addEventListener("pointerdown",()=>{if(UI.role==="hs")act()});
