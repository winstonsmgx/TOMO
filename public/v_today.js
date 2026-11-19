/* ===== Hôm nay: TOMO + mọi lớp, chia theo khối và theo loại việc ===== */
const KIND={verify:{t:"Em cần cô xác nhận",c:"neg"},scan:{t:"Phiếu giấy chờ nhập",c:"warn"},report:{t:"Báo cáo chưa gửi",c:"info"},due:{t:"Hạn nộp hôm nay",c:"teal"},first:{t:"Lớp chưa có bài",c:"pos"}};
function todosAll(){const out=[];CLASSES.forEach(c=>{todoOf(c.id).forEach(t=>out.push(Object.assign({cls:c.id},t)));DB.assigns.filter(a=>a.cls===c.id&&a.state==="open"&&a.due.startsWith(TODAY)&&!todoHidden(c.id,{k:"due",aid:a.id})).forEach(a=>out.push({cls:c.id,k:"due",n:1,t:`Hạn nộp "${find(a.examId).title}" hôm nay ${a.due.slice(11)}`,act:"Xem tiến độ",go:{v:"class",cls:c.id,tab:"result",aid:a.id}}))});return out}
UI.chat=UI.chat||[];
VIEWS.today={
  html(){
    const all=todosAll();const f=UI.r.kf||null;
    const strip=Object.entries(KIND).map(([k,v])=>{const n=all.filter(x=>x.k===k).reduce((t,x)=>t+(x.k==="verify"?x.n:1),0);return `<button class="kcount k-${v.c} ${f===k?"on":""} ${n?"":"zero"}" data-kf="${k}" aria-pressed="${f===k}"><span class="kn num">${n}</span><span class="kl">${v.t}</span><span class="kc">${[...new Set(all.filter(x=>x.k===k).map(x=>x.cls))].join(", ")||"Không có"}</span></button>`}).join("");
    const card=c=>{const as=assignsOf(c.id);const opens=as.filter(a=>a.state==="open");const open=opens[0];const doneL=as.filter(a=>a.state==="done");const last=doneL[0],prev=doneL[1];const rl=last&&resultOf(last),rp=prev&&resultOf(prev),ro=open&&resultOf(open);
      const td=all.filter(x=>x.cls===c.id);const top=td.find(x=>x.k==="verify")||td.find(x=>x.k==="scan")||td.find(x=>x.k==="due")||td.find(x=>x.k==="report")||td[0];
      const lvl=td.some(x=>x.k==="verify")?"neg":td.some(x=>x.k==="scan")?"warn":td.some(x=>x.k==="report")?"info":td.some(x=>x.k==="due")?"teal":td.some(x=>x.k==="first")?"pos":"ok";const dim=f&&!td.some(x=>x.k===f);
      const la=typeof latestAssign==="function"?latestAssign(c.id):last;const lr=la&&resultOf(la);const li=as.indexOf(la);const lp=la?as.slice(li+1).find(x=>x.state==="done"&&resultOf(x).nSub>0):null;const lpr=lp&&resultOf(lp);
      const delta=lr&&lpr&&lr.avg!=null&&lpr.avg!=null?+(lr.avg-lpr.avg).toFixed(1):null;
      const vn=x=>String(x).replace(".",",");const tasks=td.filter(x=>x.k!=="due");
      const SHORT={verify:x=>[`${x.n} em cần cô xác nhận`,"Xác nhận"],scan:x=>["Phiếu giấy chưa nhập","Nhập phiếu"],report:x=>["Báo cáo phụ huynh chưa gửi","Gửi"],first:x=>["Lớp chưa có bài nào","Giao bài"]};
      const ttl=x=>{const m=/"([^"]+)"/.exec(x.t||"");return m?m[1]:""};
      const grp=[];tasks.forEach(x=>{const g=grp.find(y=>y.k===x.k);if(g)g.list.push(x);else grp.push(Object.assign({},x,{list:[x]}))});
      const pills=grp.map(x=>{const [l]=SHORT[x.k](x);const m=x.list.length;return `<span class="tpill k-${KIND[x.k].c}"><button data-todo2="${c.id}|${x.k}" title="${esc(x.list.map(y=>y.t).join(" · ")||l)}">${esc(l)}${m>1?` <b class="tpn">${m}</b>`:""}</button><button class="tm" data-tmore="${c.id}|${x.k}" aria-label="Nhắc lại sau hoặc bỏ qua" title="Nhắc lại sau hoặc bỏ qua">${ic("kebab",12)}</button></span>`}).join("");
      return `<tr class="hrow s-${lvl} ${dim?"dim":""}" data-hrow="${c.id}" title="Mở lớp ${c.id}"><td class="cid"><b>${c.id}</b><span class="sub">${c.size} em</span></td>
      <td class="cop">${opens.length?opens.map(o=>{const r_=resultOf(o);return `<div class="oprow"><a href="#" data-gocls="${c.id}" data-tab="result" data-aid="${o.id}">${esc(find(o.examId).title)}</a><div class="mini">${bar(r_.nSub/r_.size,1)}<span class="sub num">${r_.nSub}/${r_.size}${o.given===TODAY&&!r_.nSub?" · mới giao":""} · <span class="${o.due.startsWith(TODAY)?"teal-t":""}">hạn ${esc(dueLabel(o.due).toLowerCase())}</span></span></div></div>`}).join(""):`<span class="dash">Không có bài đang mở</span>`}</td>
      <td class="cav num">${lr&&lr.avg!=null?`<b>${vn(lr.avg.toFixed(1))}</b>${delta!=null&&delta!==0?` <span class="delta ${delta>0?"pos-t":"neg-t"}">${delta>0?"+":""}${vn(delta)}</span>`:""}<span class="sub" title="${esc(find(la.examId).title)}">${esc(find(la.examId).title)}${la.state==="open"?` · đang mở, ${lr.nSub}/${lr.size} em`:""}</span>`:`<span class="dash">Chưa có</span>`}</td>
      <td class="ctd">${pills?`<div class="tps">${pills}</div>`:`<span class="sub">Không có việc chờ</span>`}</td></tr>`};
    const week=DB.assigns.filter(a=>a.due.slice(0,10)>=TODAY&&a.state!=="done").sort((x,y)=>x.due.localeCompare(y.due));
    const g8=CLASSES.filter(c=>c.grade===8),g9=CLASSES.filter(c=>c.grade===9);
    return `<div class="title-row"><button class="iconbtn menu" id="menuBtn" aria-label="Mở menu">${ic("today")}</button><h1>Hôm nay</h1><span class="muted stamp">Thứ Tư, 18/11/2026 · ${CLASSES.length} lớp · ${CLASSES.reduce((s,c)=>s+c.size,0)} em</span><span class="sp"></span><button class="btn pri" id="newEx">${ic("plus")} Tạo đề</button></div>
    ${tomoPanel(all)}
    <section class="panel ctab"><table class="tbl clist"><thead><tr><th>Lớp</th><th>Bài đang mở</th><th class="num">Kết quả bài gần nhất</th><th class="thf">Việc chờ <select class="sin kfsel" data-kfsel aria-label="Lọc theo loại việc"><option value="">Tất cả (${all.length})</option>${Object.entries(KIND).map(([k,v])=>{const n=all.filter(x=>x.k===k).reduce((t,x)=>t+(x.k==="verify"?x.n:1),0);return n?`<option value="${k}" ${f===k?"selected":""}>${v.t} (${n})</option>`:""}).join("")}</select></th></tr></thead>
      <tbody><tr class="grow"><td colspan="4">Khối 8 <span class="muted">· ${g8.length} lớp · ${all.filter(x=>cls(x.cls).grade===8).length} việc</span></td></tr>${g8.map(card).join("")}
      <tr class="grow"><td colspan="4">Khối 9 <span class="muted">· ${g9.length} lớp · ${all.filter(x=>cls(x.cls).grade===9).length} việc</span></td></tr>${g9.map(card).join("")}</tbody></table>
      <p class="muted small cfoot">Bấm vào dòng để mở lớp; bấm vào việc để làm ngay. ${week.length} bài đang chờ nộp, xem tiến độ ở cột Bài đang mở.</p></section>`;
  },
  bind(){
    document.querySelector("#newEx").onclick=e=>createMenu(e.currentTarget);
    on("[data-kf]",el=>{UI.r.kf=UI.r.kf===el.dataset.kf?null:el.dataset.kf;render()});
    const kfs=document.querySelector("[data-kfsel]");if(kfs)kfs.onchange=()=>{UI.r.kf=kfs.value||null;render()};
    document.querySelectorAll("tr.hrow").forEach(r=>r.onclick=ev=>{if(ev.target.closest("button,a"))return;go({v:"class",cls:r.dataset.hrow})});
    on("[data-tmore]",el=>{const [c,k]=el.dataset.tmore.split("|");const t=todoOf(c).find(x=>x.k===k);if(t)todoMenu(el,c,t)});
    on("[data-todo2]",el=>{const [c,k]=el.dataset.todo2.split("|");const L=todosAll().filter(x=>x.cls===c&&x.k===k);if(L.length>1)popMenu(el,L.map(t=>[esc(t.t).replace(/^Phiếu giấy |^Báo cáo phụ huynh /,"").replace(/ chưa (nhập|gửi)$/,""),()=>runItem(t),t.aid?"giao "+fmtD(DB.assigns.find(a=>a.id===t.aid).given):""]));else runItem(L[0])});
    bindTomo();
  }
};
function runItem(t){if(!t)return;if(t.k==="scan")return scanModal(t.aid);if(t.k==="first")return assignModal(null,[t.cls]);if(typeof jumpTodo==="function"&&t.cls&&["verify","report"].includes(t.k))return jumpTodo(t.cls,t,true);go(t.go)}
/* ---- TOMO: trợ lý trên màn Hôm nay ---- */
function tomoPanel(all){
  /* gợi ý cho ô TOMO chỉ là việc mới; việc chờ đã có ở bảng lớp và ô đếm nên không lặp lại ở đây */
  const sug=["Soạn đề 15 phút Unit 12 cho 8A1, 8A2","Hôm nay tôi cần làm gì?"];
  const greet=`Hôm nay có ${all.length} việc ở ${new Set(all.map(x=>x.cls)).size} lớp; gấp nhất là ${all[0]?esc(all[0].t)+" ("+all[0].cls+")":"không có"}.`;
  return `<section class="tomo slim"><div class="tomo-top"><span class="tmark" title="${aiOK?"TOMO, trợ lý của cô":"TOMO · đang dùng dữ liệu mẫu"}">T</span>
  <form class="tomo-input" id="tform"><label class="iconbtn" title="Tải file đề lên (hoặc thả file vào đây)">${ic("up")}<input type="file" id="tfile" accept=".csv,.txt,.xlsx,.docx,.pdf,image/*" hidden></label><input type="text" id="tq" placeholder="Nhắn TOMO hoặc thả file đề vào đây. Ví dụ: soạn đề 15 phút Unit 12 cho 8A1" aria-label="Nhắn TOMO" autocomplete="off"><button class="btn pri sm" type="submit">Gửi</button></form></div>
  ${UI.chat.length?`<div class="tomo-log" id="tlog">${UI.chat.map(m=>`<div class="msg ${m.who}">${m.who==="me"?esc(m.text):m.html}</div>`).join("")}</div>`:`<p class="tgreet small">${greet}</p>`}
  <div class="tomo-sug">${sug.map(s=>`<button class="chip2" data-sug="${esc(s)}">${esc(s)}</button>`).join("")}</div></section>`;
}
function bindTomo(){
  const f=document.querySelector("#tform");if(!f)return;const lg=document.querySelector("#tlog");if(lg)lg.scrollTop=lg.scrollHeight;
  f.onsubmit=ev=>{ev.preventDefault();const q=document.querySelector("#tq").value.trim();if(q)tomoAsk(q)};
  on("[data-sug]",el=>tomoAsk(el.dataset.sug));
  const takeFile=file=>{if(!file)return;UI.tomoFile=file;const ext=file.name.split(".").pop().toLowerCase();const img=["png","jpg","jpeg","heic"].includes(ext);
    UI.chat.push({who:"me",text:`Tải lên: ${file.name}`});
    UI.chat.push({who:"bot",html:img?`File "${esc(file.name)}" là ảnh. Đây là ảnh đề hay ảnh phiếu học sinh đã làm? <div class="row gap"><button class="btn sm" data-tact='{"type":"scan"}'>Phiếu đã làm: nhập điểm</button><button class="btn sm" data-tact='{"type":"upload"}'>Ảnh đề: tách câu</button></div>`:`Có vẻ đây là file đề (${ext}). Em sẽ đọc file, tách câu, gán kỹ năng và chấm độ khó thành một đề Nháp. <div class="row gap"><button class="btn sm pri" data-tact='{"type":"upload"}'>Tách câu thành đề mới</button><button class="btn sm" data-tact='{"type":"scan"}'>Không, đây là phiếu đã làm</button></div>`});render()};
  document.querySelector("#tfile").onchange=ev=>takeFile(ev.target.files[0]);
  const T=document.querySelector(".tomo");let dc=0;
  T.ondragenter=e=>{e.preventDefault();dc++;T.classList.add("dropping")};T.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect="copy"};
  T.ondragleave=()=>{if(--dc<=0){dc=0;T.classList.remove("dropping")}};
  T.ondrop=e=>{e.preventDefault();dc=0;T.classList.remove("dropping");takeFile(e.dataTransfer.files[0])};
  on("[data-tact]",el=>runTomoAction(JSON.parse(el.dataset.tact)));
}
function parseIntent(q){
  const s=q.toLowerCase();const clsIds=CLASSES.map(c=>c.id).filter(id=>s.includes(id.toLowerCase()));const um=s.match(/unit\s*(\d+)/);const mm=s.match(/(\d+)\s*phút/);
  if(/soạn|tạo đề|ra đề|đề ôn/.test(s))return [{type:"create",unit:um?+um[1]:12,min:mm?+mm[1]:15,plan:clsIds,kind:/ôn|luyện|bài nhà|về nhà/.test(s)?"lt":"kt",label:`Mở TOMO gợi ý: Unit ${um?um[1]:12}, ${mm?mm[1]:15} phút${clsIds.length?", cho "+clsIds.join(", "):""}`}];
  if(/giao/.test(s))return [{type:"assign",cls:clsIds,label:`Mở Giao bài${clsIds.length?" cho "+clsIds.join(", "):""}`}];
  if(/phiếu|quét|chấm giấy/.test(s)){const t=todosAll().find(x=>x.k==="scan"&&(!clsIds.length||clsIds.includes(x.cls)));return t?[{type:"todo",cls:t.cls,k:"scan",label:`Nhập phiếu ${t.cls}`}]:[]}
  if(/xác nhận|xác minh/.test(s)){const c=clsIds[0]||(todosAll().find(x=>x.k==="verify")||{}).cls;return c?[{type:"go",to:{v:"class",cls:c,tab:"verify"},label:`Mở Cần xác nhận ${c}`}]:[]}
  if(/phụ huynh|báo cáo/.test(s)){const t=todosAll().find(x=>x.k==="report"&&(!clsIds.length||clsIds.includes(x.cls)));const c=clsIds[0]||(t||{}).cls;return c?[{type:"go",to:t&&t.go||{v:"class",cls:c,tab:"parents"},label:`Mở Báo cáo phụ huynh ${c}`}]:[]}
  if(/tải|upload|file/.test(s))return [{type:"upload",label:"Mở Tải file lên"}];
  if(/hôm nay|làm gì|việc/.test(s))return todosAll().slice(0,4).map(t=>({type:"todo",cls:t.cls,k:t.k,label:`${t.cls}: ${t.act}`}));
  return [];
}
async function tomoAsk(q){
  UI.chat.push({who:"me",text:q});let acts=parseIntent(q);let reply="";
  if(sampleFn){UI.chat.push({who:"bot",html:'<span class="muted">TOMO đang trả lời…</span>'});render();
    try{const ctx=todosAll().map(t=>`${t.cls}: ${t.t}`).join("; ");const r=await sampleFn(`Bạn là TOMO, trợ lý cho cô giáo Tiếng Anh dạy các lớp ${CLASSES.map(c=>c.id).join(", ")}. Việc đang chờ: ${ctx}. Cô nhắn: "${q}". Trả lời 1–2 câu tiếng Việt, xưng "em", gọi "cô", nói rõ em sẽ mở bước nào. Không dùng ký hiệu markdown.`,{modelTier:"quick"});reply=esc(r.text.trim())}catch(e){}
    UI.chat.pop()}
  if(!reply)reply=acts.length?(acts.length>1?`Hôm nay cô có ${todosAll().length} việc. Em xếp theo thứ tự gấp:`:"Em mở bước này cho cô nhé:"):"Em chưa hiểu ý cô. Cô thử: \"soạn đề 15 phút Unit 12 cho 8A1\", \"nhập phiếu 8A3\", \"gửi báo cáo 9A1\" hoặc tải file đề lên.";
  UI.chat.push({who:"bot",html:reply+(acts.length?`<div class="row gap">${acts.map(a=>`<button class="btn sm" data-tact='${esc(JSON.stringify(a))}'>${esc(a.label)}</button>`).join("")}</div>`:"")});render();
}
function runTomoAction(a){
  if(a.type==="create")return aiModal({unit:a.unit,min:[10,15,45].includes(a.min)?a.min:15,kind:a.kind,plan:a.plan||[],reason:"TOMO đã điền sẵn theo lời cô."});
  if(a.type==="assign")return assignModal(null,a.cls&&a.cls.length?a.cls:null);
  if(a.type==="upload"){const f=UI.tomoFile;UI.tomoFile=null;return uploadModal(f||undefined)}
  if(a.type==="scan"){const t=todosAll().find(x=>x.k==="scan");return t?scanModal(t.aid):toast("Không có lượt giao nào đang chờ nhập phiếu.")}
  if(a.type==="go")return go(a.to);
  if(a.type==="todo")return runItem(todosAll().find(x=>x.cls===a.cls&&x.k===a.k));
}
function runTodo(c){const t=todoOf(c)[0];if(!t)return go({v:"class",cls:c,tab:"assign"});
  if(t.k==="scan")return scanModal(t.aid);if(t.k==="first")return assignModal(null,[c]);go(t.go)}

/* ===== Cài đặt ===== */
VIEWS.set={
  html(){const s=DB.settings;return `<div class="title-row"><h1>Cài đặt prototype</h1></div><p class="lede">Công tắc để thử nhánh khác của flow.</p>
  <section class="panel"><label class="switch"><input type="checkbox" id="setApprove" ${s.mustApprove?"checked":""}><span><b>Trường bắt buộc duyệt đề kiểm tra có điểm</b><span class="sub">Bật để thử hộp thoại ghi lý do khi cô dùng luôn một đề kiểm tra.</span></span></label>
  <div class="setrow"><label>Giờ gửi báo cáo phụ huynh<select id="setSendAt">${["18:00","19:00","19:30","20:00","20:30"].map(t=>`<option ${(s.sendAt||"19:30")===t?"selected":""}>${t}</option>`).join("")}</select></label><span class="sub">Cô bấm gửi trong giờ hành chính, tin được hẹn đến giờ này. Từ giờ này đến 22:00 thì gửi luôn; sau 22:00 hẹn sang tối hôm sau.</span></div>
  <div class="setrow"><label>Giả lập giờ hiện tại<select id="setSim"><option value="" ${s.simHour==null||s.simHour===""?"selected":""}>Theo đồng hồ thật</option>${[[9,"9:00 sáng"],[14,"14:00 chiều"],[20,"20:00 tối"],[23,"23:00 đêm"]].map(([v,l])=>`<option value="${v}" ${String(s.simHour)===String(v)?"selected":""}>${l}</option>`).join("")}</select></label></div></section>
  ${sessPanel()}`},
  bind(){document.querySelector("#setApprove").onchange=e=>{DB.settings.mustApprove=e.target.checked;save();toast("Đã lưu.")};
    document.querySelector("#setSendAt").onchange=e=>{DB.settings.sendAt=e.target.value;save();toast("Đã lưu.")};document.querySelector("#setSim").onchange=e=>{DB.settings.simHour=e.target.value;save();toast("Đã lưu.")};
    bindSess()}
};

/* ---- Phiên dữ liệu: lưu, mở lại, tạo phiên mới từ dữ liệu mẫu mà không mất phiên cũ ---- */
const SNAPKEY="examen-proto-snaps";
function snaps(){try{return JSON.parse(localStorage.getItem(SNAPKEY)||"[]")}catch(e){return []}}
function setSnaps(L){try{localStorage.setItem(SNAPKEY,JSON.stringify(L));return true}catch(e){toast("Bộ nhớ trình duyệt đã đầy. Xoá bớt phiên cũ hoặc tải xuống rồi xoá.");return false}}
const sessName=()=>DB.sessionName||"Phiên mặc định";
function snapNow(name){const L=snaps();const now=new Date();const at=now.toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"});
  L.unshift({id:"S"+now.getTime(),name:name||sessName(),at,data:JSON.stringify(DB)});return setSnaps(L.slice(0,20))}
function useDB(d){DB=d;Object.keys(RES_CACHE).forEach(k=>delete RES_CACHE[k]);if(typeof RESP_CACHE!=="undefined")Object.keys(RESP_CACHE).forEach(k=>delete RESP_CACHE[k]);UI.flow=null;UI.r={};save()}
function sessPanel(){const L=snaps();
  return `<section class="panel"><div class="phead"><h2>Phiên dữ liệu</h2><span class="muted">Đang dùng: <b>${esc(sessName())}</b></span></div>
  <p class="muted small">Mỗi phiên là một bản đầy đủ của dữ liệu prototype (đề, lượt giao, kết quả, báo cáo, xác nhận). Lưu lại trước khi thử một nhánh flow, rồi mở lại khi cần quay về. Phiên lưu trong trình duyệt này; tải xuống để chuyển sang máy khác hoặc gửi cho người khác.</p>
  <div class="sessbar"><input type="text" id="snapName" class="sin" placeholder="Tên phiên, ví dụ: Trước khi thử nhập phiếu" value=""><button class="btn" id="snapSave">Lưu phiên hiện tại</button><button class="btn pri" id="sessNew">Phiên mới từ dữ liệu mẫu</button><label class="btn ghost" for="snapImp">Nhập từ file</label><input type="file" id="snapImp" accept=".json,application/json" hidden></div>
  ${L.length?`<table class="tbl compact sesst"><thead><tr><th>Phiên đã lưu</th><th>Lưu lúc</th><th></th></tr></thead><tbody>${L.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td class="small">${esc(x.at)}</td><td class="act"><div class="acts"><button class="btn sm pri" data-snapopen="${x.id}">Mở lại</button><button class="btn sm" data-snapdl="${x.id}">Tải xuống</button><button class="iconbtn" data-snapdel="${x.id}" aria-label="Xoá phiên">${ic("x")}</button></div></td></tr>`).join("")}</tbody></table>`:`<p class="small muted">Chưa có phiên nào được lưu.</p>`}
  <p class="small muted">Khi mở lại một phiên hoặc tạo phiên mới, phiên đang dùng được tự lưu trước, nên luôn quay lại được.</p></section>`}
function bindSess(){const v=id=>document.querySelector(id);
  v("#snapSave").onclick=()=>{const n=v("#snapName").value.trim()||sessName();if(snapNow(n)){DB.sessionName=n;save();render();toast(`Đã lưu phiên "${n}".`)}};
  v("#sessNew").onclick=()=>confirmBox("Bắt đầu phiên mới từ dữ liệu mẫu?",`Phiên đang dùng "${esc(sessName())}" sẽ được tự lưu vào danh sách để cô mở lại khi cần.`,"Bắt đầu phiên mới",()=>{if(!snapNow(sessName()+" (tự lưu)"))return;useDB(seed());DB.sessionName="Phiên mới "+new Date().toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"});save();go({v:"set"});toast("Đã tạo phiên mới từ dữ liệu mẫu. Phiên cũ đã được lưu.")});
  document.querySelectorAll("[data-snapopen]").forEach(b=>b.onclick=()=>{const x=snaps().find(s=>s.id===b.dataset.snapopen);if(!x)return;confirmBox(`Mở lại phiên "${esc(x.name)}"?`,`Phiên đang dùng "${esc(sessName())}" sẽ được tự lưu trước.`,"Mở lại",()=>{if(!snapNow(sessName()+" (tự lưu)"))return;const d=JSON.parse(x.data);d.sessionName=x.name;useDB(d);go({v:"set"});toast(`Đang dùng phiên "${x.name}".`)})});
  document.querySelectorAll("[data-snapdl]").forEach(b=>b.onclick=()=>{const x=snaps().find(s=>s.id===b.dataset.snapdl);if(!x)return;const blob=new Blob([JSON.stringify({name:x.name,at:x.at,data:JSON.parse(x.data)},null,1)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`examen-phien-${x.name.replace(/[^\p{L}\p{N}]+/gu,"-")}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)});
  document.querySelectorAll("[data-snapdel]").forEach(b=>b.onclick=()=>{const x=snaps().find(s=>s.id===b.dataset.snapdel);confirmBox(`Xoá phiên "${esc(x.name)}"?`,"Phiên này sẽ bị xoá khỏi trình duyệt. Nếu cần giữ, cô tải xuống trước.","Xoá",()=>{setSnaps(snaps().filter(s=>s.id!==x.id));render();toast("Đã xoá phiên.")})});
  v("#snapImp").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);const d=j.data||j;if(!d.exams||!d.assigns)throw 0;const L=snaps();L.unshift({id:"S"+Date.now(),name:(j.name||f.name.replace(/\.json$/,""))+" (nhập)",at:new Date().toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}),data:JSON.stringify(d)});if(setSnaps(L)){render();toast("Đã thêm phiên từ file. Bấm Mở lại để dùng.")}}catch(_){toast("File này không phải phiên dữ liệu của prototype.")}})}}

/* ===== Bản đồ flow ===== */
const FLOWS=[
  {id:1,name:"Tạo đề, chỉnh sửa, duyệt",uc:"GV-02, GV-03, GV-10",steps:[
    ["Kho đề",()=>go({v:"kho",tab:"book"})],["Hộp thoại Tạo đề",()=>{go({v:"kho",tab:"book"});setTimeout(()=>createMenu(document.querySelector("#newEx")),30)}],
    ["Tải file lên (hộp thoại)",()=>{go({v:"kho",tab:"book"});setTimeout(()=>uploadModal(),30)}],["Xem và chỉnh đề",()=>go({v:"editor",id:`DE_${ME}_0005`})],["Gửi duyệt hoặc Dùng luôn",()=>{go({v:"editor",id:`DE_${ME}_0005`});setTimeout(()=>sendLead(`DE_${ME}_0005`),30)}]]},
  {id:2,name:"Tạo mini test",uc:"GV-04",steps:[["Đề trong Của tôi",()=>go({v:"editor",id:`DE_${ME}_0002`})],["Hộp thoại Tạo mini test",()=>{go({v:"editor",id:`DE_${ME}_0002`});setTimeout(()=>twinModal(`DE_${ME}_0002`,"8A3"),30)}]]},
  {id:3,name:"Giao bài cho nhiều lớp",uc:"GV-05",steps:[["Sổ giao đề",()=>go({v:"kho",tab:"book"})],["Hộp thoại Giao bài",()=>{go({v:"kho",tab:"book"});setTimeout(()=>assignModal(`DE_${ME}_0003`,["8A1","8A2"]),30)}],["Đề của từng em",()=>go({v:"class",cls:"8A3",tab:"personal"})]]},
  {id:4,name:"Thu bài, xác minh, báo cáo",uc:"GV-06 đến GV-09, GV-11",steps:[["Lớp 8A3",()=>go({v:"class",cls:"8A3",tab:"assign"})],["Nhập phiếu giấy (hộp thoại)",()=>{go({v:"class",cls:"8A3",tab:"assign"});setTimeout(()=>scanModal("GIAO_8A3_20261118"),30)}],["Cần cô xác nhận",()=>go({v:"class",cls:"8A3",tab:"verify"})],["Báo cáo lớp",()=>go({v:"class",cls:"8A3",tab:"report"})],["Hồ sơ học sinh",()=>{go({v:"class",cls:"8A3",tab:"report"});setTimeout(()=>studentSheet("8A3","Minh"),30)}]]},
  {id:5,name:"Kết quả và báo cáo phụ huynh",uc:"GV-08, GV-12",steps:[["Kết quả bài về nhà",()=>go({v:"class",cls:"8A3",tab:"result",aid:"GIAO_8A3_20261113"})],["Kết quả mini test",()=>go({v:"class",cls:"8A3",tab:"result",aid:"GIAO_8A3_20261117"})],["Báo cáo phụ huynh",()=>go({v:"class",cls:"8A3",tab:"parents",aid:"GIAO_8A3_20261113"})]]},
  {id:6,name:"Kho đề theo lớp",uc:"GV-02, GV-03",steps:[["Sổ giao đề",()=>go({v:"kho",tab:"book"})],["Nháp",()=>go({v:"kho",tab:"nhap"})],["Thư viện trường (hộp thoại tìm)",()=>{go({v:"kho",tab:"book"});setTimeout(()=>libraryModal(),30)}],["Ngân hàng câu",()=>go({v:"kho",tab:"bank"})]]},
  {id:7,name:"Phân loại một em: tiến bộ hay chưa tự làm",uc:"GV-06, GV-07, GV-11",steps:[
    ["Kết quả bài về nhà: cờ z",()=>go({v:"class",cls:"8A3",tab:"result",aid:"GIAO_8A3_20261113"})],
    ["Cảnh báo bất thường",()=>go({v:"class",cls:"8A3",tab:"assign",av:"all"})],
    ["Tạo mini test",()=>{go({v:"editor",id:`DE_${ME}_0002`});setTimeout(()=>twinModal(`DE_${ME}_0002`,"8A3"),30)}],
    ["Kết quả mini test: đối chiếu",()=>go({v:"class",cls:"8A3",tab:"result",aid:"GIAO_8A3_20261117"})],
    ["Cần cô xác nhận · Hỏi em ngay",()=>go({v:"class",cls:"8A3",tab:"verify"})],
    ["Hồ sơ em: Bằng chứng qua các vòng",()=>{go({v:"class",cls:"8A3",tab:"verify"});setTimeout(()=>studentSheet("8A3","An"),30)}],
    ["Mô phỏng chỉ số",()=>go({v:"sim"})]]}
];
function flowBar(){if(!UI.flow)return "";const f=FLOWS.find(x=>x.id===UI.flow.id);
  return `<div class="flowbar"><b>Flow ${f.id} · ${esc(f.name)}</b><div class="fsteps">${f.steps.map((s,i)=>`<button class="fst ${i===UI.flow.i?"on":i<UI.flow.i?"done":""}" data-fstep="${i}">${esc(s[0])}</button>`).join("")}</div><span class="sp"></span>${UI.flow.i>0?`<button class="btn sm inv" data-fprev>Bước trước</button>`:""}${UI.flow.i<f.steps.length-1?`<button class="btn sm inv" data-fnext>Bước tiếp</button>`:""}<button class="btn sm inv" data-fexit>Thoát</button></div>`}
function runStep(i){const f=FLOWS.find(x=>x.id===UI.flow.id);UI.flow.i=i;f.steps[i][1]()}
function bindFlow(){on("[data-fstep]",el=>runStep(+el.dataset.fstep));on("[data-fnext]",()=>runStep(UI.flow.i+1));on("[data-fprev]",()=>runStep(UI.flow.i-1));on("[data-fexit]",()=>{UI.flow=null;render()})}
function syncFlow(){}
VIEWS.map={
  html(){return `<div class="title-row"><h1>Bản đồ flow</h1></div><p class="lede">Cô ${MY_NAME} dạy ${CLASSES.length} lớp ở hai khối. Lớp là trục chính: mỗi lớp có lịch sử bài đã giao, báo cáo, việc cần xác nhận và báo cáo phụ huynh riêng. Các bước phụ (tải file, tìm thư viện, giao bài, nhập phiếu, mini test) mở thành hộp thoại thay vì trang mới.</p>
  ${FLOWS.map(f=>`<section class="panel"><div class="phead"><h2>Flow ${f.id}. ${esc(f.name)}</h2><span class="muted">${f.uc}</span><span class="sp"></span><button class="btn sm pri" data-start="${f.id}">Đi theo flow</button></div>
   <div class="fsteps light">${f.steps.map((s,i)=>`${i?`<span class="arr">→</span>`:""}<button class="fst" data-jump="${f.id}:${i}">${esc(s[0])}</button>`).join("")}</div></section>`).join("")}
  <section class="panel"><div class="phead"><h2>Các chỉ số dùng để phân loại một em</h2><span class="muted">dùng ở Flow 7 · cô chỉ thấy chữ và nhãn, không thấy các con số này</span></div>
   <div class="scrollx"><table class="tbl compact gloss"><thead><tr><th>Chỉ số</th><th>Là gì</th><th>Tính thế nào</th><th>Ngưỡng / cách dùng</th></tr></thead><tbody>
   <tr><td><b>θ</b> (mức của em)</td><td>Năng lực ước tính của em, thang −3 đến 3, 0 là trung bình</td><td>Cập nhật sau mỗi vòng từ câu đúng sai; mini test tin 100%, bài về nhà tin ít hơn khi có cờ hoặc không được kiểm tra (×0,6)</td><td>Dùng để tính điểm dự kiến và chọn độ khó vừa sức</td></tr>
   <tr><td><b>b</b> (độ khó câu)</td><td>Độ khó của từng câu, cùng thang với θ</td><td>Từ rubric khi câu mới; chỉnh theo lượt làm thật</td><td>Câu "khó với em" khi khả năng đúng dưới 50%</td></tr>
   <tr><td><b>p</b></td><td>Khả năng em làm đúng một câu</td><td>p = 0,25 + 0,75 · sig(θ − b) (0,25 là đoán bừa 4 phương án)</td><td>Cộng các p lại = số câu dự kiến đúng (Σp)</td></tr>
   <tr><td><b>z</b></td><td>Bài về nhà cao hay thấp hơn sức của em bao nhiêu</td><td>z = (số câu đúng − Σp) / √Σp(1−p)</td><td>z ≥ 2: Điểm cao bất thường · z ≥ 1,5 và đúng ≥ 2 câu khó: Đúng nhiều câu khó · z ≤ −2: Thấp hơn sức</td></tr>
   <tr><td><b>d</b></td><td>Chênh điểm ở nhà và trên lớp</td><td>d = điểm bài về nhà − điểm mini test (thang 10)</td><td>Chỉ có khi vòng đó có mini test</td></tr>
   <tr><td><b>SE</b></td><td>Mức chênh tự nhiên của d do may rủi, với số câu hiện có</td><td>SE = √(phương sai điểm ở nhà + phương sai điểm mini test); đề càng ít câu SE càng lớn</td><td>d/SE ≥ 2 nghĩa là chênh lớn gấp đôi mức may rủi thường gặp</td></tr>
   <tr><td><b>e</b></td><td>Độ lệch của một vòng</td><td>Có mini test: e = (z + d/SE)/√2 · Không có: e = z/√2 · Cộng 0,5 nếu vòng đó có hành vi đáng chú ý (dán nội dung, chụp màn hình, rời app > 20 giây, < 25 giây/câu)</td><td>e ≥ 3,5 trong một vòng: Cần cô xác nhận ngay · e ≥ 2,5 trong một vòng: Nên kiểm tra thêm · e ≥ 1,2: Theo dõi</td></tr>
   <tr><td><b>B</b></td><td>Bằng chứng tích lũy qua các vòng</td><td>B = max(0, B vòng trước + e − 0,75); vòng khớp làm B giảm dần</td><td>B ≥ 2: Nên kiểm tra thêm · B ≥ 4,5: Cần cô xác nhận · Chưa có vòng nào kiểm tra trên lớp: cao nhất là Nên kiểm tra thêm</td></tr>
   <tr><td><b>lz</b> (kiểu đúng sai)</td><td>Dãy đúng sai của em có hợp với mức của em không; âm nhiều = đúng câu khó mà sai câu dễ</td><td>lz = (log khả năng của dãy đúng sai − kỳ vọng) / độ lệch chuẩn; tính cho cả bài ở nhà và mini test</td><td>Thường từ −2 trở lên. Ví dụ đúng 5/5 câu khó, sai 5/5 câu dễ: lz ≈ −7</td></tr>
   <tr><td><b>L</b> (kênh kiểu đúng sai)</td><td>Kiểu làm lạ ở nhà mà trên lớp không lạ, lặp lại qua các vòng</td><td>L = max(0, L + (lz trên lớp − lz ở nhà)/√2 − 0,5); vòng không có mini test dùng −lz ở nhà/√2; chỉ tính khi em đúng câu khó nhiều hơn dự kiến ≥ 1 câu (loại đoán bừa)</td><td>L ≥ 2,5: Nên kiểm tra thêm · Trên lớp cũng lạ (lz ≤ −2, điểm gần dự kiến): "Kiểu làm khác thường, có làm trên lớp", thường là hổng nền · Câu mà em mức cao sai nhiều hơn em mức thấp: "Câu đáng xem lại", không dùng để xét lz</td></tr>
   <tr><td><b>Tiến bộ</b></td><td>Mức của em tăng rõ qua các vòng</td><td>So θ đầu và cuối giai đoạn</td><td>Có kiểm tra trên lớp khớp trong 3 vòng gần nhất: Tiến bộ thật · Không có: Tiến bộ, chờ xác nhận · Đang có cờ: chưa kết luận</td></tr>
   </tbody></table></div>
   <p class="small muted">Sơ đồ đầy đủ: FigJam "TOMO — Phân loại một học sinh: tiến bộ hay chưa tự làm". Thử các ngưỡng với nhóm em tự tạo ở trang Mô phỏng chỉ số (có tuỳ chọn % vòng có mini test).</p></section>
  <section class="panel"><div class="phead"><h2>Hai vòng lặp</h2></div><p>Em bị "Kiểm tra lại" ở tab Cần xác nhận được gợi ý thêm câu mini test khi cô giao bài kế tiếp cho lớp đó. Lớp có cờ "Cần giảng lại" ở Báo cáo lớp mở hộp thoại Gợi ý AI với kỹ năng đã điền sẵn.</p></section>
  <p class="small">Toàn bộ nội dung của prototype (thuật ngữ, quy tắc, số liệu mẫu, chữ trên các màn hình) được lưu ở một file để đồng bộ với tài liệu: <a href="content.md" target="_blank" rel="noopener">content.md</a>.</p>
  <p class="muted small">Còn mở, cần nhóm chốt: câu bỏ trống giữa bài có tính sai không · quy đổi điểm đề A/B · Zalo OA đứng tên trường hay sản phẩm.</p>`},
  bind(){on("[data-start]",el=>{UI.flow={id:+el.dataset.start,i:0};runStep(0)});on("[data-jump]",el=>{const [f,i]=el.dataset.jump.split(":").map(Number);UI.flow={id:f,i:0};runStep(i)})}
};
