/* ===== Nút nổi "Việc cần làm" trong trang lớp: nhảy thẳng tới chỗ cần làm ===== */
function todoTarget(c,t){
  if(t.k==="verify")return {tab:"verify",sel:'[data-vf]'};
  if(t.k==="scan")return {tab:"assign",sel:`[data-scan="${t.aid}"]`};
  if(t.k==="report")return {tab:"parents",aid:t.go.aid,sel:"#sendAll"};
  return {tab:"assign",sel:"#first, #giveC"};
}
const TK={verify:["Cần xác nhận","neg"],scan:["Phiếu giấy","warn"],report:["Báo phụ huynh","info"],first:["Lớp mới","pos"]};
function todoShort(t){const m=/"([^"]+)"/.exec(t.t||"");const main={verify:`${t.n} em cần cô xác nhận`,scan:"Nhập phiếu giấy",report:"Gửi báo cáo phụ huynh",first:"Giao bài đầu tiên"}[t.k]||t.t;return [main,m?m[1]:""]}
function todoFloat(){
  if(UI.r.v!=="class")return "";const c=UI.r.cls,td=todoOf(c);if(!td.length)return "";DB.ui=DB.ui||{};
  const i=Math.min(UI.r.ti??-1,td.length-1);
  if(DB.ui.tjMin)return `<button class="tjpill" id="tjOpen" aria-label="Mở danh sách việc cần làm">${td.length} việc cần làm ở ${c}</button>`;
  return `<aside class="tjcard" id="tjump" aria-label="Việc cần làm ở lớp ${c}">
   <header><b>Việc cần làm</b><span class="tjn">${td.length}</span><span class="muted small">${c}</span><span class="sp"></span><button class="iconbtn sm" id="tjMin" aria-label="Thu nhỏ" title="Thu nhỏ">${ic("chevd",14)}</button></header>
   <ol>${td.map((t,j)=>{const [m,sub]=todoShort(t);return `<li class="${j===i?"on":""}"><button class="tjrow" data-tj="${j}"><span class="tjk k-${TK[t.k][1]}">${TK[t.k][0]}</span><span class="tjt"><b>${esc(m)}</b>${sub?`<span>${esc(sub)}</span>`:""}</span>${ic("chev",12)}</button><button class="iconbtn sm" data-tjm="${j}" aria-label="Nhắc lại sau hoặc bỏ qua" title="Nhắc lại sau hoặc bỏ qua">${ic("kebab",14)}</button></li>`}).join("")}</ol>
   <footer><button class="btn sm" id="tPrev">‹ Việc trước</button><span class="muted small">${i<0?"Bấm một việc để đi tới":`Đang ở việc ${i+1}/${td.length}`}</span><button class="btn sm pri" id="tNext">${i<0?"Bắt đầu":"Việc tiếp"} ›</button></footer></aside>`;
}
/* Nhảy thẳng tới chức năng: mở đúng tab, cuộn tới, nháy viền; báo cáo phụ huynh thì mở luôn hộp Gửi */
function jumpTodo(c,t,open){const td=todoOf(c);const i=Math.max(0,td.findIndex(x=>x.k===t.k&&(x.aid||(x.go&&x.go.aid))===(t.aid||(t.go&&t.go.aid))));const tg=todoTarget(c,t);
  const r={v:"class",cls:c,tab:tg.tab,ti:i};if(tg.aid)r.aid=tg.aid;go(r);
  setTimeout(()=>{const el=document.querySelector(tg.sel);if(!el)return;el.scrollIntoView({behavior:"smooth",block:"center"});const row=el.closest("tr")||el;row.classList.add("pulse");setTimeout(()=>row.classList.remove("pulse"),2400);
    if(open&&t.k==="report")setTimeout(()=>el.click(),450)},80)}
function bindTodoFloat(){
  const op=document.querySelector("#tjOpen");if(op){op.onclick=()=>{DB.ui.tjMin=false;save();render()};return}
  const J=document.querySelector("#tjump");if(!J)return;const c=UI.r.cls,td=todoOf(c);
  const goI=i=>{i=(i+td.length)%td.length;const tg=todoTarget(c,td[i]);const r={v:"class",cls:c,tab:tg.tab,ti:i};if(tg.aid)r.aid=tg.aid;
    const same=UI.r.tab===tg.tab&&(!tg.aid||UI.r.aid===tg.aid);if(same){UI.r.ti=i;render()}else go(r,true);
    setTimeout(()=>{const el=document.querySelector(tg.sel);if(!el)return;el.scrollIntoView({behavior:"smooth",block:"center"});const row=el.closest("tr")||el;row.classList.remove("pulse");void row.offsetWidth;row.classList.add("pulse");setTimeout(()=>row.classList.remove("pulse"),2400)},60)};
  const i=UI.r.ti??-1;
  J.querySelectorAll("[data-tj]").forEach(b=>b.onclick=()=>goI(+b.dataset.tj));
  J.querySelectorAll("[data-tjm]").forEach(b=>b.onclick=e=>{e.stopPropagation();todoMenu(b,c,td[+b.dataset.tjm])});
  document.querySelector("#tNext").onclick=()=>goI(i<0?0:i+1);
  document.querySelector("#tPrev").onclick=()=>goI(i<0?td.length-1:i-1);
  document.querySelector("#tjMin").onclick=()=>{DB.ui.tjMin=true;save();render()};
}

/* ---- Hoãn hoặc bỏ qua một việc ---- */
const SKIP_EFFECT={verify:"Các em này giữ kết quả tạm tính, báo cáo phụ huynh của các em vẫn tạm giữ.",scan:"Kết quả phiếu giấy sẽ không vào sổ điểm cho đến khi cô nhập.",report:"Phụ huynh sẽ không nhận báo cáo của bài này.",first:"Hệ thống chưa biết mức của từng em nên chưa gợi ý được đề vừa sức.",due:"Cô sẽ không được nhắc về hạn nộp của bài này."};
function hideTodo(c,t,h,msg){DB.todoHide=DB.todoHide||{};const k=todoKey(c,t);DB.todoHide[k]=h;save();if(UI.r.v==="class")UI.r.ti=-1;render();toast(msg,()=>{delete DB.todoHide[k];save();render()})}
function todoMenu(anchor,c,t){
  const now=new Date(),at=(d,h,m)=>{const x=new Date(now);x.setDate(x.getDate()+d);x.setHours(h,m,0,0);return x.getTime()};
  const eve=now.getHours()*60+now.getMinutes()<19*60+30?at(0,19,30):at(1,19,30);
  const lab=t.t.replace(/\s+/g," ");
  popMenu(anchor,[
    ["Nhắc lại sau 1 giờ",()=>hideTodo(c,t,{until:Date.now()+3600e3,how:"1 giờ"},`Sẽ nhắc lại "${lab}" sau 1 giờ.`)],
    ["Nhắc lại tối nay 19:30",()=>hideTodo(c,t,{until:eve,how:"19:30"},`Sẽ nhắc lại lúc 19:30.`)],
    ["Nhắc lại sáng mai 7:00",()=>hideTodo(c,t,{until:at(1,7,0),how:"sáng mai"},`Sẽ nhắc lại lúc 7:00 sáng mai.`)],
    ["Nhắc lại tuần sau",()=>hideTodo(c,t,{until:at(7,7,0),how:"tuần sau"},`Sẽ nhắc lại sau 7 ngày.`)],
    ["Bỏ qua việc này…",()=>skipTodo(c,t),"Không nhắc nữa; xem lại ở trang lớp"]]);
}
function skipTodo(c,t){
  const R=["Đã làm ngoài ứng dụng","Không cần với lớp này","Để sau, tự nhớ"];
  modal(mhead("Bỏ qua việc này?",`${c} · ${esc(t.t)}`)+`<p>${esc(SKIP_EFFECT[t.k]||"")}</p><span class="flabel">Lý do</span><div class="schopts">${R.map((r,i)=>`<label class="radio"><input type="radio" name="skr" value="${esc(r)}" ${i===0?"checked":""}><span><b>${esc(r)}</b></span></label>`).join("")}</div>
   <p class="muted small">Việc đã bỏ qua vẫn xem và hiện lại được ở dòng "đã hoãn hoặc bỏ qua" trên trang lớp.</p><div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="mOk">Bỏ qua</button></div>`,()=>{
    document.querySelector("#mOk").onclick=()=>{const why=document.querySelector('input[name="skr"]:checked').value;closeM();hideTodo(c,t,{skip:true,why,at:Date.now()},"Đã bỏ qua việc này.")}});
}
function hiddenTodosModal(c){
  const L=todoHiddenList(c);const fmtT=ms=>{const d=new Date(ms);return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} ${d.getDate()}/${d.getMonth()+1}`};
  modal(mhead(`Việc đã hoãn hoặc bỏ qua · ${c}`)+`<ul class="list">${L.map(({t,h})=>`<li><div><span>${esc(t.t)}</span><div class="sub">${h.skip?`Đã bỏ qua · ${esc(h.why)}`:`Nhắc lại lúc ${fmtT(h.until)}`}</div></div><button class="btn sm" data-unhide-t="${esc(todoKey(c,t))}">Hiện lại</button></li>`).join("")||`<li class="muted">Không có việc nào.</li>`}</ul><div class="mfoot"><button class="btn" data-close>Đóng</button></div>`,()=>{
    document.querySelectorAll("[data-unhide-t]").forEach(b=>b.onclick=()=>{delete DB.todoHide[b.dataset.unhideT];save();closeM();render();toast("Đã hiện lại việc này.")})});
}
