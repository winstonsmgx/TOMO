/* ===== Kho đề: sổ giao đề theo lớp, nháp, thư viện, ngân hàng câu ===== */
VIEWS.kho={
  html(){
    const r=UI.r,t=r.tab||"book";
    const nh=DB.exams.filter(e=>e.place==="nhap"),sc=DB.exams.filter(e=>e.place==="school");
    let body="";
    if(t==="book")body=bookView();
    if(t==="mylib")body=myLibView();
    if(t==="nhap")body=draftView(nh);
    if(t==="school")body=schoolView(sc);
    if(t==="bank")body=bankView();
    return `<div class="title-row"><button class="iconbtn menu" id="menuBtn" aria-label="Mở menu">${ic("lib")}</button><h1>Kho đề</h1><span class="sp"></span><button class="btn" id="libBtn">${ic("search")} Tìm trong thư viện trường</button><button class="btn pri" id="newEx" aria-haspopup="menu">${ic("plus")} Tạo đề</button></div>
    ${tabs([["book","Sổ giao đề",DB.exams.filter(e=>e.place==="mine"&&e.status!=="luutru").length],["mylib","Thư viện của tôi",DB.exams.filter(e=>e.place==="mine"||e.place==="nhap").length],["nhap","Nháp",nh.length],["school","Thư viện trường",sc.length],["bank","Ngân hàng câu",DB.bank.length]],t)}${body}`;
  },
  bind(){
    document.querySelector("#newEx").onclick=e=>createMenu(e.currentTarget);
    document.querySelector("#libBtn").onclick=()=>libraryModal();
    on("[data-tab]",el=>go({v:"kho",tab:el.dataset.tab,g:UI.r.g}));
    on("[data-g]",el=>go({v:"kho",tab:"book",g:+el.dataset.g}));
    on("[data-pickc]",el=>{const g=UI.r.g||8;const all=CLASSES.filter(c=>c.grade===g).map(c=>c.id);DB.bookCls=DB.bookCls||{};let cur=DB.bookCls[g]||all.slice();const id=el.dataset.pickc;
      cur=cur.includes(id)?cur.filter(x=>x!==id):[...cur,id];if(!cur.length){toast("Cần giữ ít nhất một lớp.");return}DB.bookCls[g]=all.filter(x=>cur.includes(x));save();render()});
    const pa=document.querySelector("#pickAll");if(pa)pa.onclick=()=>{DB.bookCls[UI.r.g||8]=null;save();render()};
    const ht=document.querySelector("#hidT");if(ht)ht.onclick=()=>{UI.r.hid=!UI.r.hid;render()};on("[data-unhide]",el=>unhide(el.dataset.unhide));
    const og=document.querySelector("#onlyGiven");if(og)og.onchange=()=>{DB.bookOnly=og.checked;save();render()};
    const u=document.querySelector("#unitF");if(u)u.onchange=()=>go(Object.assign({},UI.r,{unit:u.value}));
    on("[data-edit]",el=>go({v:"editor",id:el.dataset.edit}));
    on("[data-give]",el=>{const [id,c]=el.dataset.give.split("|");assignModal(id,c?[c]:null)});
    on("[data-more]",el=>examMenu(el.dataset.more,el));
    on("[data-view]",el=>fullExam(el.dataset.view));
    on("[data-use]",el=>useNow(el.dataset.use));
    on("[data-del]",el=>confirmBox("Xoá đề nháp này?","Đề sẽ bị xoá hẳn. Câu đã vào Ngân hàng câu vẫn giữ nguyên.","Xoá",()=>{DB.exams=DB.exams.filter(e=>e.id!==el.dataset.del);save();render();toast("Đã xoá nháp.")}));
    on("[data-pull]",el=>pull(el.dataset.pull));
    on("[data-peek]",el=>fullExam(el.dataset.peek));
    on("[data-src]",el=>go({v:"kho",tab:"bank",src:el.dataset.src,by:UI.r.by}));
    on("[data-by]",el=>go({v:"kho",tab:"bank",src:UI.r.src,by:el.dataset.by}));
    on("[data-addq]",el=>addToDraft(el.dataset.addq));
    on("[data-bfav]",el=>{const it=DB.bank.find(b=>b.id===el.dataset.bfav);toggleFav(it);save();render()});
    const ml=document.querySelector("#mlq");if(ml)ml.oninput=()=>{UI.r.mlq=ml.value;const pos=ml.selectionStart;render();const n=document.querySelector("#mlq");n.focus();n.setSelectionRange(pos,pos)};
    document.querySelectorAll("[data-mlf]").forEach(el=>el.onchange=()=>{UI.r[el.dataset.mlf]=el.value;render()});
    const h=document.querySelector("#hideOld");if(h)h.onclick=()=>{UI.r.hideOld=1;render()};
  }
};
function bookView(){
  const g=UI.r.g||8,unit=UI.r.unit||"all";const allCl=CLASSES.filter(c=>c.grade===g);
  DB.bookCls=DB.bookCls||{};const pick=(DB.bookCls[g]||allCl.map(c=>c.id)).filter(id=>allCl.some(c=>c.id===id));const cl=allCl.filter(c=>pick.includes(c.id));
  const only=!!DB.bookOnly;
  const hid=!!UI.r.hid;const nHid=DB.exams.filter(e=>e.place==="mine"&&(e.grade||8)===g&&e.status==="luutru").length;
  let ex=DB.exams.filter(e=>e.place==="mine"&&(e.grade||8)===g&&(hid?e.status==="luutru":e.status!=="luutru"));
  if(only)ex=ex.filter(e=>DB.assigns.some(a=>a.examId===e.id&&pick.includes(a.cls)));
  const units=[...new Set(ex.map(e=>e.unit))].sort((a,b)=>b-a);
  if(unit!=="all")ex=ex.filter(e=>String(e.unit)===String(unit));
  const latestU=units[0];const missing=cl.filter(c=>!DB.assigns.some(a=>a.cls===c.id&&(find(a.examId)||{}).unit===latestU));
  const groups=[...new Set(ex.map(e=>e.unit))].sort((a,b)=>b-a);
  const cell=(e,c)=>{const as=DB.assigns.filter(a=>a.examId===e.id&&a.cls===c.id);if(!as.length)return (e.plan||[]).includes(c.id)?`<td class="cell planned" data-c="${c.id}"><span class="sub">Dự định</span><button class="btn sm" data-give="${e.id}|${c.id}">Giao</button></td>`:`<td class="cell empty" data-c="${c.id}"><button class="give" data-give="${e.id}|${c.id}" aria-label="Giao ${esc(e.title)} cho ${c.id}">Giao</button></td>`;
    return `<td class="cell" data-c="${c.id}">${as.map(a=>{const rs=resultOf(a);return `<a href="#" data-gocls="${c.id}" data-tab="result" data-aid="${a.id}" class="slot ${a.state}" title="${c.id}: giao ${fmtD(a.given)}, hạn ${fmtDue(a.due)} · ${a.state==="done"?`${rs.nSub}/${rs.size} em nộp, điểm TB ${rs.avg}`:a.state==="scan"?"chờ nhập phiếu giấy":`${rs.nSub}/${rs.size} em đã nộp`}. Bấm để xem kết quả."><span>${fmtD(a.given)}${a.form==="giay"?" · giấy":""}</span><b class="num">${a.state==="done"?(rs.avg!=null?rs.avg.toFixed(1):"—"):a.state==="scan"?"Chờ phiếu":`${rs.nSub}/${rs.size}`}</b></a>`}).join("")}</td>`};
  return `<p class="lede">${missing.length?`Unit ${latestU}: ${missing.map(c=>c.id).join(", ")} chưa được giao bài nào.`:`${cl.length===allCl.length?`Mọi lớp khối ${g}`:cl.map(c=>c.id).join(", ")} đã có bài cho Unit ${latestU}.`}</p>
  <div class="toolbar">${seg("g",[["8","Khối 8"],["9","Khối 9"]],String(g))}<div class="seg multi" role="group" aria-label="Lớp hiển thị">${allCl.map(c=>`<button class="${pick.includes(c.id)?"on":""}" data-pickc="${c.id}" aria-pressed="${pick.includes(c.id)}">${c.id}</button>`).join("")}</div>${pick.length<allCl.length?`<button class="btn sm ghost" id="pickAll">Cả khối</button>`:""}<label class="chk"><input type="checkbox" id="onlyGiven" ${only?"checked":""}>Chỉ đề đã giao cho ${pick.length===1?pick[0]:"các lớp này"}</label><select id="unitF" aria-label="Lọc theo Unit"><option value="all">Mọi Unit</option>${units.map(u=>`<option value="${u}" ${String(unit)===String(u)?"selected":""}>Unit ${u} — ${D.UNITS[u-1][1]}</option>`).join("")}</select><span class="sp"></span><button class="btn sm ${hid?"pri":"ghost"}" id="hidT" aria-pressed="${hid}">${hid?"← Về Sổ giao đề":`Đã ẩn ${nHid}`}</button></div>${hid?`<div class="notice">Các đề cô đã ẩn. Đề không bị xoá; kết quả các lần giao vẫn nằm trong trang lớp. Bấm Hiện lại để đưa đề về Sổ giao đề.</div>`:""}
  <section class="panel flush"><div class="scrollx"><table class="tbl book"><thead><tr><th class="examcol">Đề</th><th>Độ khó</th>${cl.map(c=>`<th class="clscol"><a href="#" data-gocls="${c.id}">${c.id}</a><div class="sub">${c.size} em</div></th>`).join("")}<th></th></tr></thead>
  <tbody>${groups.map(u=>`<tr class="grouprow"><td colspan="${cl.length+3}">Unit ${u} — ${D.UNITS[u-1][1]}</td></tr>`+ex.filter(e=>e.unit===u).map(e=>`<tr>
    <td class="examcol"><a href="#" data-edit="${e.id}"><b>${esc(e.title)}</b></a><div class="sub">${e.items.length} câu · ${e.minutes} phút · ${e.kind==="kt"?"Kiểm tra":"Luyện tập"}${e.twinOf?" · mini test":""} ${statusPill(e)}</div></td>
    <td>${diffBar(e.items,88)}<div class="sub">${(()=>{const as=DB.assigns.filter(a=>a.examId===e.id&&a.state!=="scan").map(a=>resultOf(a)).filter(r=>r.nSub>0&&r.avg!=null);if(!as.length)return `Dự kiến <span class="num">${String(expOf(e,pick)).replace(".",",")}</span>/10 <span class="muted">(chưa có bài chấm)</span>`;const n=as.reduce((t,r)=>t+r.nSub,0),avg=as.reduce((t,r)=>t+r.avg*r.nSub,0)/n;return `Kết quả <b class="num">${avg.toFixed(1).replace(".",",")}</b>/10 · ${n} em <span class="muted">(dự kiến ${String(expOf(e,pick)).replace(".",",")})</span>`})()}${e.plan&&e.plan.length?` · dành cho ${esc(e.plan.join(", "))}`:""}</div></td>
    ${cl.map(c=>cell(e,c)).join("")}<td class="act">${hid?`<button class="btn sm" data-unhide="${e.id}">Hiện lại</button>`:""}<button class="btn sm ghost" data-view="${e.id}">Xem đề</button><button class="iconbtn" data-more="${e.id}" aria-label="Thao tác với đề">${ic("kebab")}</button></td></tr>`).join("")).join("")||`<tr><td colspan="${cl.length+3}"><div class="empty-line">${hid?"Chưa có đề nào bị ẩn.":"Chưa có đề nào cho bộ lọc này."}</div></td></tr>`}</tbody></table></div></section>`;
}
function draftView(nh){
  const old=nh.filter(e=>e.old).length;
  return `${old&&!UI.r.hideOld?`<div class="notice">${old} đề nháp đã 30 ngày chưa sửa. <button class="btn sm" data-edit="${nh.find(e=>e.old).id}">Xem</button> <button class="btn sm ghost" id="hideOld">Để sau</button></div>`:""}
    <section class="panel flush">${nh.length?`<table class="tbl"><thead><tr><th>Đề</th><th>Dành cho</th><th>Nguồn</th><th class="num">Số câu</th><th>Độ khó</th><th>Cần cô xem</th><th></th></tr></thead><tbody>${nh.map(e=>{const f=e.items.filter(i=>i.check==="lech").length;return `<tr><td class="idc"><a href="#" data-edit="${e.id}"><b>${esc(e.title)}</b></a><div class="sub">Unit ${e.unit} · ${e.minutes} phút ${statusPill(e)}</div></td><td>${e.plan&&e.plan.length?esc(e.plan.join(", ")):`<span class="muted">Chưa chọn lớp</span>`}</td><td>${esc(e.from||"—")}</td><td class="num">${e.items.length}</td><td>${diffBar(e.items,80)}</td><td>${f?pill(`${f} câu cần xác nhận đáp án`,"warn"):`<span class="dash">—</span>`}</td><td class="act"><button class="btn sm" data-edit="${e.id}">Mở và chỉnh</button><button class="btn sm ghost" data-use="${e.id}" ${f?"disabled title='Còn câu cần cô xác nhận đáp án'":""}>Dùng đề này…</button><button class="btn sm ghost neg-t" data-del="${e.id}">Xoá</button></td></tr>`}).join("")}</tbody></table>`:`<div class="empty-line">Không có đề nào đang làm dở.</div>`}</section>`;
}
function schoolView(sc){
  return `  <section class="panel flush"><table class="tbl"><thead><tr><th>Đề</th><th>Người soạn</th><th class="num">Số câu</th><th>Độ khó</th><th></th></tr></thead><tbody>${sc.map(e=>`<tr><td class="idc"><a href="#" data-peek="${e.id}"><b>${esc(e.title)}</b></a><div class="sub">Khối ${e.grade||8} · Unit ${e.unit} · ${e.minutes} phút · <span class="mono">${e.id}_${e.ver||"v1"}</span></div></td><td>${esc(e.owner||"—")}</td><td class="num">${e.items.length}</td><td>${diffBar(e.items,80)}</td><td class="act"><button class="btn sm" data-peek="${e.id}">Xem</button><button class="btn sm pri" data-pull="${e.id}">Lấy về đề của tôi</button></td></tr>`).join("")}</tbody></table></section>`;
}
function bankView(){
  const src=UI.r.src||"all",by=UI.r.by||"cau";const list=DB.bank.filter(i=>src==="all"||i.source===src||(src==="new"&&i.isNew)||(src==="fav"&&isFav(i)));
  const row=(i,n)=>`<tr><td class="num stt">${n}</td><td><div class="bqcell"><button class="iconbtn fav ${isFav(i)?"on":""}" data-bfav="${i.id}" aria-pressed="${isFav(i)}" aria-label="Đánh dấu câu hay">${ic("star")}</button><span>${esc(i.stem)}<span class="sub">${i.options?i.options.map((o,j)=>j===i.answer?`<b class="ink">${ABCD[j]}. ${esc(o)}</b>`:`${ABCD[j]}. ${esc(o)}`).join(" · "):""}</span></span></div></td><td>${esc(sk(i.skill))}</td><td>${lvPill(lvOf(i))}</td><td>${i.source==="GV"?"Giáo viên":i.source==="AI"?"TOMO":esc(i.source)}${i.isNew?" "+pill("Câu mới"):""}</td><td class="num">${i.attempts}</td><td class="act"><button class="btn sm" data-addq="${i.id}">${ic("plus",12)} Thêm vào đề</button></td></tr>`;
  const head=`<thead><tr><th class="num stt">STT</th><th style="width:44%">Câu hỏi</th><th>Kỹ năng</th><th>Độ khó</th><th>Nguồn</th><th class="num">Lượt làm</th><th></th></tr></thead>`;
  let body;
  if(by==="de"){const groups=DB.exams.filter(e=>e.place!=="school"||true).map(e=>({e,items:list.filter(i=>e.items.some(x=>x.id===i.id))})).filter(g=>g.items.length);
    const used=new Set(groups.flatMap(g=>g.items.map(i=>i.id)));const loose=list.filter(i=>!used.has(i.id));
    body=groups.map(g=>`<tr class="grouprow"><td colspan="7"><span>${esc(g.e.title)}</span> <span class="muted">· ${g.items.length} câu trong ngân hàng · ${g.e.place==="school"?"Thư viện trường":g.e.place==="nhap"?"Nháp":"Của tôi"}</span> <button class="btn sm" data-view="${g.e.id}">Xem đề</button></td></tr>`+g.items.map((i,k)=>row(i,k+1)).join("")).join("")+(loose.length?`<tr class="grouprow"><td colspan="7">Câu lẻ, chưa thuộc đề nào · ${loose.length} câu</td></tr>`+loose.map((i,k)=>row(i,k+1)).join(""):"");
  } else body=list.map((i,k)=>row(i,k+1)).join("");
  return `<div class="toolbar">${seg("by",[["cau","Theo câu"],["de","Theo đề"]],by)}${seg("src",[["all","Tất cả"],["fav",`Yêu thích ${Object.keys(DB.fav||{}).length}`],["GV","Giáo viên"],["Tải lên","Tải lên"],["AI","TOMO"],["new","Câu mới"]],src)}<span class="muted small">${list.length} câu</span></div>
  <section class="panel flush"><table class="tbl">${head}<tbody>${body||`<tr><td colspan="7"><div class="empty-line">Không có câu nào khớp bộ lọc.</div></td></tr>`}</tbody></table></section>`;
}
function hideExam(id){const e=find(id);const open=DB.assigns.filter(a=>a.examId===id&&a.state!=="done");
  if(open.length){modal(mhead("Chưa ẩn được đề này",esc(e.title))+`<p>Đề đang có lượt giao chưa xong: ${open.map(a=>`${a.cls} (hạn ${fmtDue(a.due)})`).join(", ")}. Cô ẩn đề sau khi các lượt này kết thúc để học sinh vẫn làm được bài.</p><div class="mfoot"><button class="btn pri" data-close>Đã hiểu</button></div>`);return}
  const nA=DB.assigns.filter(a=>a.examId===id).length;
  confirmBox(`Ẩn "${e.title}" khỏi Sổ giao đề?`,`Đề <b>không bị xoá</b>. ${nA?`Kết quả ${nA} lần đã giao vẫn nằm nguyên trong trang từng lớp. `:""}Cô xem và hiện lại đề này bất cứ lúc nào ở nút <b>Đã ẩn</b> trên thanh lọc của Sổ giao đề.`,"Ẩn đề",()=>{e.status="luutru";save();render();toast(`Đã ẩn "${e.title}". Xem lại ở nút Đã ẩn.`,()=>{e.status=null;save();render()})});}
function unhide(id){const e=find(id);e.status=null;save();render();toast(`Đã hiện lại "${e.title}" trong Sổ giao đề.`)}
function examMenu(id,anchor){
  const e=find(id);const items=[["Xem toàn bộ đề",()=>fullExam(id)],["Mở để chỉnh",()=>go({v:"editor",id})],["Giao bài…",()=>assignModal(id)],...(e.twinOf?[]:[["Tạo mini test…",()=>twinModal(id)]]),...(e.status==="duyet"?[]:[["Gửi tổ trưởng duyệt…",()=>sendLead(id)]]),(e.status==="luutru"?["Hiện lại trong Sổ giao đề",()=>unhide(id)]:["Ẩn khỏi Sổ giao đề…",()=>hideExam(id),"Đề không bị xoá, xem lại ở mục Đã ẩn"])];
  popMenu(anchor,items);
}
function popMenu(anchor,items){
  document.querySelectorAll(".pop").forEach(p=>p.remove());
  const r=anchor.getBoundingClientRect();const p=document.createElement("div");p.className="pop";p.setAttribute("role","menu");
  p.innerHTML=items.map(([l,,sub],i)=>`<button role="menuitem" data-i="${i}">${l}${sub?`<span class="sub">${sub}</span>`:""}</button>`).join("");
  document.body.appendChild(p);const w=p.offsetWidth,h=p.offsetHeight,vh=window.innerHeight,below=vh-r.bottom-18,above=r.top-18;
  const up=h>below&&above>below;const room=up?above:below;if(h>room)p.style.maxHeight=Math.max(160,room)+"px";
  p.style.top=(up?Math.max(12,r.top-6-Math.min(h,room)):r.bottom+6)+"px";p.style.left=Math.max(12,Math.min(window.innerWidth-w-12,r.right-w))+"px";
  const closeOnScroll=()=>{p.remove();window.removeEventListener("scroll",closeOnScroll,true)};setTimeout(()=>window.addEventListener("scroll",closeOnScroll,true),0);
  p.querySelectorAll("button").forEach(b=>b.onclick=()=>{p.remove();items[+b.dataset.i][1]()});p.querySelector("button").focus();
  setTimeout(()=>{const off=ev=>{if(!p.contains(ev.target)){p.remove();document.removeEventListener("click",off)}};document.addEventListener("click",off)},0);
  p.onkeydown=ev=>{if(ev.key==="Escape")p.remove()};
}

/* ---- Tạo đề: menu và các hộp thoại ---- */
function createMenu(anchor){
  popMenu(anchor,[["Tự nhập hoặc dán",()=>typeModal(),"Gõ, dán, thu âm hoặc chụp ảnh đề"],["Tải file lên",()=>uploadModal(),"pdf, docx, csv, xlsx — hệ thống tự tách câu"],["TOMO gợi ý",()=>aiModal(),"Chọn Unit và thời lượng, TOMO đề xuất câu"],["Tìm trong thư viện trường",()=>libraryModal(),"Dùng lại đề tổ đã duyệt"]]);
}
const SAMPLE_TEXT=`"Is there life on Mars?" Nam asked. → Nam asked ___ life on Mars.
if there was
*whether there was
that there was
is there

Astronauts need special ___ to walk in space.
*suits
shoes
hats
bags`;
function unitSelect(id,cur){return `<select id="${id}">${D.UNITS.map(([n,t])=>`<option value="${n}" ${+cur===n?"selected":""}>Unit ${n} — ${t}</option>`).join("")}</select>`}
function typeModal(){
  modal(mhead("Tự nhập hoặc dán","Mỗi phương án một dòng, * trước đáp án đúng, các câu cách nhau một dòng trống.")+`
  <div class="fgrid"><label>Tên đề<input type="text" id="tTitle" placeholder="Ví dụ: Bài nhà Unit 12 — đợt 2"></label><label>Unit${unitSelect("tUnit",12)}</label><div class="span2"><span class="flabel">Dành cho lớp (không bắt buộc)</span>${planPicker({grade:8,plan:[]},"tplan")}</div></div>
  <div class="inputbox"><textarea id="raw" aria-label="Câu hỏi">${esc(SAMPLE_TEXT)}</textarea><div class="inputbar"><button class="btn sm ghost" id="mic">${ic("mic")} Thu âm</button><label class="btn sm ghost">${ic("cam")} Chụp ảnh<input type="file" id="cam" accept="image/*" capture="environment" hidden></label><span class="sp"></span><span class="muted small" id="cnt"></span></div></div>
  <div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="parse">Tách câu và mở đề</button></div>`,()=>{
    const raw=document.querySelector("#raw"),cnt=document.querySelector("#cnt");const upd=()=>{cnt.textContent=`${localParse(raw.value).length} câu nhận được`};raw.oninput=upd;upd();
    on("#layer [data-tplan]",b=>{b.classList.toggle("on");b.setAttribute("aria-pressed",b.classList.contains("on"))});
    document.querySelector("#mic").onclick=()=>toast("Prototype chưa bật micro. Bản thật chèn chữ từ giọng nói vào ô này.");
    document.querySelector("#cam").onchange=()=>toast("Prototype chưa đọc ảnh. Bản thật tách chữ từ ảnh vào ô này.");
    document.querySelector("#parse").onclick=async()=>{let items=localParse(raw.value);const title=document.querySelector("#tTitle").value.trim(),unit=+document.querySelector("#tUnit").value;
      if(!items.length&&sampleFn){closeM();UI.busy={title:"Đang tách câu…",step:"Đang tách câu và kiểm đáp án…"};render();try{items=await AI.parseText(raw.value,streamTo)}catch(e){items=[]}UI.busy=null}
      if(!items.length){toast("Chưa tách được câu nào. Mỗi phương án một dòng, các câu cách nhau một dòng trống.");return}
      const plan=[...document.querySelectorAll("#layer [data-tplan].on")].map(b=>b.dataset.tplan);const e={id:newExamId(),title:title||"Đề tự nhập",unit,minutes:Math.max(5,minutesOf(items)),kind:"lt",items,place:"nhap",status:null,from:"Tự nhập",grade:8,plan};DB.exams.unshift(e);save();go({v:"editor",id:e.id});toast(`Đã tách ${items.length} câu. Đề đang ở Nháp.`)};
  },"wide");
}
function uploadModal(pre){
  modal(mhead("Tải file lên","pdf, docx, csv hoặc xlsx")+`
  <label class="drop" id="drop">${ic("up",20)}<b>Kéo thả file vào đây hoặc chọn file</b><span class="muted small">TOMO đọc file ngay trên máy: docx, pdf xuất từ Word, xlsx/csv (cột Câu hỏi, A, B, C, D, Đáp án). Đáp án đánh dấu * hoặc bảng "Đáp án: 1.A 2.C".</span><input type="file" id="fileIn" accept=".csv,.txt,.xlsx,.docx,.pdf,.png,.jpg,.jpeg" hidden></label>
  <div class="or">hoặc</div><button class="btn wide" id="useMid">Dùng đề mẫu: Kiểm tra giữa kì 1 — đề số 4 (40 câu)</button>
  <div id="upRes"></div>`,()=>{
    const res=document.querySelector("#upRes");
    const show=(e,info)=>{res.innerHTML=`<div class="result"><b>Đã tách ${info.total} câu: ${info.ready} câu sẵn sàng, ${info.inBank} câu đã có trong ngân hàng, ${info.flag} câu cần cô xác nhận đáp án.</b>${info.rewrite?`<p class="muted">Trong đó ${info.rewrite} câu viết lại câu (tự luận ngắn), chấm theo đáp án mẫu.</p>`:""}${info.lost?`<div class="notice">Phần gạch chân bị mất ở câu ${info.lost}. Cô kiểm tra lại các câu này.</div>`:""}${info.nums&&info.nums.length?`<p class="small">Đề có câu ${info.nums[0]}–${info.nums[info.nums.length-1]} (${info.nums.length} câu); TOMO tách được ${info.total} câu.</p>`:""}${info.missing&&info.missing.length?`<div class="notice warn"><b>Chưa tách được ${info.missing.length} câu: ${info.missing.map(m=>m.n).join(", ")}.</b> Thường do thiếu phương án A–D trong chữ đọc được, câu bị cắt giữa hai trang, hoặc câu có hình. <details><summary>Xem chữ TOMO đọc được ở các câu này</summary>${info.missing.map(m=>`<pre class="rawq">${esc(m.raw||"(không thấy chữ của câu này)")}</pre>`).join("")}</details></div>`:""}${info.note?`<p class="muted small">${esc(info.note)}</p>`:""}${info.nums?`<details class="rawall"><summary>Xem toàn bộ chữ TOMO đọc được</summary><pre class="rawq">${esc((UI.lastRead&&UI.lastRead.text||"").slice(0,20000))}</pre></details>`:""}<div class="mfoot"><button class="btn" data-close>Để sau, lưu ở Nháp</button><button class="btn pri" id="openEx">Xem đề</button></div></div>`;
      res.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{closeM();go({v:"kho",tab:"nhap"})});document.querySelector("#openEx").onclick=()=>go({v:"editor",id:e.id})};
    document.querySelector("#useMid").onclick=()=>{res.innerHTML=`<div class="loading"><div class="spin"></div><b>Đang tách câu và kiểm đáp án…</b></div>`;setTimeout(()=>{const {e,info}=importMid();show(e,info)},1200)};
    const fin=document.querySelector("#fileIn"),drop=document.querySelector("#drop");
    const handle=async f=>{if(!f)return;
      try{const r=await agentRead(f,res);if(!r.items.length){res.innerHTML=`<div class="notice neg">TOMO đọc được chữ trong file (${r.chars} ký tự) nhưng chưa nhận ra câu hỏi nào. Đề cần có dạng "1. câu hỏi" và các phương án A. B. C. D.; cô xem lại file hoặc dán chữ vào ô Tự nhập.</div>`;return}
        const items=r.items;const e={id:newExamId(),title:f.name.replace(/\.[^.]+$/,""),unit:12,minutes:Math.max(5,minutesOf(items)),kind:"lt",items,place:"nhap",status:null,from:"Tải lên",grade:8};DB.exams.unshift(e);save();
        UI.lastRead=r;show(e,{total:items.length,ready:items.filter(i=>i.check==="khop").length,inBank:0,flag:items.filter(i=>i.check!=="khop").length,missing:r.missing,nums:r.nums,note:`${r.ocr?"Claude đọc chữ trong ảnh (OCR). ":""}${r.via.includes("TOMO")?"TOMO (Claude) tách câu, gán kỹ năng và chấm độ khó.":r.ocr?"Tách câu theo mẫu; kỹ năng tạm gán, cô kiểm tra lại.":"TOMO chưa bật nên dùng bộ tách câu theo mẫu; kỹ năng tạm gán, cô kiểm tra lại."}${r.dropped?` Đã bỏ ${r.dropped} đoạn watermark hoặc chữ lặp ở mỗi trang.`:""}${r.under?` Tìm thấy ${r.under} đoạn gạch chân, giữ dạng _chữ_.`:""} File được đọc ngay trên máy cô, không gửi đi đâu.`})}
      catch(err){const msg={image:"Đọc ảnh cần TOMO (Claude) đang bật. Cô bật TOMO rồi thử lại, hoặc dùng file docx / pdf có chữ.",scan:"File PDF này là bản scan (chỉ có ảnh, không có lớp chữ). Đọc ảnh cần TOMO (Claude) đang bật; cô bật TOMO rồi thử lại.",denied:"Cô chưa cho phép TOMO gửi ảnh cho Claude đọc.",ocrfail:"Claude chưa đọc được ảnh lúc này. Cô thử lại sau ít phút.",empty:"File không có chữ nào đọc được.",type:"Loại file này chưa hỗ trợ. Cô dùng docx, pdf, xlsx, csv hoặc txt."}[err&&err.code]||"Không đọc được file (có thể file bị hỏng hoặc có mật khẩu).";
        res.innerHTML=`<div class="notice neg">${msg}</div>`}};
    fin.onchange=()=>handle(fin.files[0]);if(pre)setTimeout(()=>handle(pre),0);drop.ondragover=e=>{e.preventDefault();drop.classList.add("over")};drop.ondragleave=()=>drop.classList.remove("over");drop.ondrop=e=>{e.preventDefault();handle(e.dataTransfer.files[0])};
  },"wide");
}
function importMid(){
  const items=D.MID.map(m=>{const it=mkItem({id:newItemId(m.skill),type:m.type,stem:m.stem,options:m.options||null,answer:m.answer,skill:m.skill,rub:m.rub,source:"Tải lên",check:m.check||"khop",isNew:!m.inBank,attempts:m.inBank?60:0});
    ["sec","passage","lostUnderline","inBank","checkPick","checkWhy","fixTo","explainIssue","keyNote"].forEach(k=>{if(m[k]!==undefined)it[k]=m[k]});it.n=m.n;return it});
  const e={id:newExamId(),title:"Kiểm tra giữa kì 1 — đề số 4",unit:4,minutes:45,kind:"kt",items,place:"nhap",status:null,from:"Tải lên",grade:8};DB.exams.unshift(e);save();
  const flag=items.filter(i=>i.check==="lech").length,inBank=items.filter(i=>i.inBank).length;
  return {e,info:{total:items.length,ready:items.length-flag-inBank,inBank,flag,rewrite:items.filter(i=>i.type==="rewrite").length,lost:items.filter(i=>i.lostUnderline).map(i=>i.n).join(", "),note:"Đề gốc đánh số hai chỗ trống là (25); hệ thống đã đổi chỗ thứ hai thành (26)."}};
}
function localParse(raw){
  const blocks=raw.replace(/\r/g,"").split(/\n\s*\n/).map(b=>b.split("\n").map(s=>s.trim()).filter(Boolean)).filter(b=>b.length>=5);
  return blocks.map(b=>{const stem=b[0].replace(/^\d+[.)]\s*/,"");const opts=b.slice(1,5);let a=opts.findIndex(o=>o.startsWith("*"));
    return mkItem({id:newItemId("TV.TK.01"),stem,options:opts.map(o=>o.replace(/^\*\s*/,"").replace(/^[A-D][.)]\s*/,"")),answer:a<0?0:a,skill:"TV.TK.01",source:"GV",check:a<0?"chua":"khop",isNew:true})});
}
function csvParse(t){
  const rows=t.replace(/\r/g,"").split("\n").filter(Boolean).map(l=>l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g,"").trim()));
  if(rows.length<2)return [];const h=rows[0].map(x=>x.toLowerCase());const ix=k=>h.findIndex(x=>x.includes(k));const iq=ix("câu")>=0?ix("câu"):0,ia=ix("đáp")>=0?ix("đáp"):5;
  return rows.slice(1).filter(r=>r.length>=5).map(r=>{const ans=ABCD.indexOf((r[ia]||"").toUpperCase());return mkItem({id:newItemId("TV.TK.01"),stem:r[iq],options:[r[iq+1],r[iq+2],r[iq+3],r[iq+4]],answer:ans<0?0:ans,skill:"TV.TK.01",source:"Tải lên",check:ans<0?"chua":"khop",isNew:true})});
}
function aiModal(preset){
  const P=Object.assign({unit:12,kind:"kt",min:15,skills:[],plan:[]},preset||{});
  const draw=()=>{const sk_=D.UNIT_SKILLS[P.unit]||[];const sug=P.sugg;
    document.querySelector("#layer .modal").innerHTML=mhead("TOMO gợi ý",preset&&preset.reason?esc(preset.reason):"")+`
    <div class="fgrid"><label>Unit${unitSelect("aUnit",P.unit)}</label><div><span class="flabel">Loại bài</span>${seg("akind",[["lt","Luyện tập"],["kt","Kiểm tra"]],P.kind)}</div>
    <div class="span2"><span class="flabel">Kỹ năng (không bắt buộc)</span>${seg("ask",sk_.map(s=>[s,sk(s)]),"")}</div>
    <div><span class="flabel">Dành cho lớp (không bắt buộc)</span>${planPicker({grade:8,plan:P.plan},"aplan")}</div><div><span class="flabel">Thời lượng</span>${seg("amin",[["10","10 phút · 8 câu"],["15","15 phút · 12 câu"],["45","45 phút · 30 câu"]],String(P.min))}</div></div>
    ${sug?`<div class="sugg">${sug.map((it,i)=>`<div class="srow ${it.keep?"":"off"} ${it.check==="lech"?"flag":""}"><div class="sbody"><div class="sub">${esc(sk(it.skill))} · ${lvPill(lvOf(it))}${it.check==="lech"?" · <span class='warn-t'>đáp án cần cô xem</span>":it.check==="khop"?" · đáp án đã khớp":""}</div><div>${esc(it.stem)}</div><div class="sub">${it.options.map((o,k)=>k===it.answer?`<b class="ink">${ABCD[k]}. ${esc(o)}</b>`:`${ABCD[k]}. ${esc(o)}`).join(" · ")}</div></div><div class="sacts"><button class="btn sm ${it.keep?"":"pri"}" data-keep="${i}" aria-pressed="${it.keep}">${it.keep?"Bỏ câu":"Giữ câu này"}</button><button class="btn sm ghost" data-other="${i}">Đổi câu khác</button></div></div>`).join("")}</div>`:""}
    <div class="mfoot">${sug?`<button class="btn" id="regen">Đổi toàn bộ gợi ý</button><span class="sp"></span><button class="btn pri" id="mk" ${sug.some(x=>x.keep)?"":"disabled"}>Tạo đề với ${sug.filter(x=>x.keep).length} câu</button>`:`<button class="btn" data-close>Huỷ</button><button class="btn pri" id="regen">Gợi ý câu</button>`}</div>`;
    document.querySelectorAll("#layer [data-close]").forEach(b=>b.onclick=closeM);
    document.querySelectorAll("#layer [data-ask]").forEach(b=>{if(P.skills.includes(b.dataset.ask))b.classList.add("on")});
    document.querySelector("#aUnit").onchange=e=>{P.unit=+e.target.value;P.skills=[];draw()};
    on("#layer [data-akind]",el=>{P.kind=el.dataset.akind;draw()});on("#layer [data-aplan]",el=>{const c=el.dataset.aplan;P.plan=P.plan.includes(c)?P.plan.filter(x=>x!==c):[...P.plan,c];draw()});on("#layer [data-amin]",el=>{P.min=+el.dataset.amin;draw()});
    on("#layer [data-ask]",el=>{const s=el.dataset.ask;P.skills=P.skills.includes(s)?P.skills.filter(x=>x!==s):[...P.skills,s];draw()});
    on("#layer [data-keep]",el=>{const it=P.sugg[+el.dataset.keep];it.keep=!it.keep;draw()});
    on("#layer [data-other]",async el=>{const i=+el.dataset.other,it=P.sugg[i];el.disabled=true;el.textContent="Đang đổi…";
      try{const n=await AI.gen({unit:P.unit,skills:[it.skill],count:1,kind:P.kind});await AI.blind(n).catch(()=>{});n[0].keep=true;P.sugg[i]=n[0]}catch(e){const alt=DB.bank.find(b=>b.skill===it.skill&&!P.sugg.some(s=>s.id===b.id));if(alt)P.sugg[i]=Object.assign(clone(alt),{keep:true});else toast("Chưa đổi được câu. Cô thử lại sau ít phút.")}draw()});
    document.querySelector("#regen").onclick=async()=>{const skills=P.skills.length?P.skills:sk_;const count={10:8,15:12,45:30}[P.min];
      document.querySelector("#layer .mfoot").innerHTML=`<div class="loading"><div class="spin"></div><div><b>TOMO đang soạn ${count} câu…</b><div class="stream" id="stream"></div></div></div>`;
      let items;try{items=await AI.gen({unit:P.unit,skills,count,kind:P.kind},streamTo);try{await AI.blind(items)}catch(e){}}
      catch(e){const pool=DB.bank.filter(b=>skills.includes(b.skill));const src=pool.length?pool:DB.bank;items=[];for(let k=0;k<count;k++){const c=clone(src[k%src.length]);c.id=newItemId(c.skill);c.source="AI";c.isNew=true;c.attempts=0;c.check=k%6===4?"lech":"khop";if(c.check==="lech"){c.checkPick=(c.answer+1)%4;c.checkWhy=`Lượt giải độc lập chọn ${ABCD[c.checkPick]}.`}items.push(c)}if(e&&e.code==="no_ai")toast("Chưa gọi được AI. Prototype dùng câu mẫu trong ngân hàng.")}
      items.forEach(i=>i.keep=true);P.sugg=items;draw()};
    const mk=document.querySelector("#mk");if(mk)mk.onclick=()=>{const items=P.sugg.filter(x=>x.keep).map(x=>{const c=clone(x);delete c.keep;return c});
      const e={id:newExamId(),title:`${P.kind==="kt"?"Kiểm tra":"Bài luyện"} ${P.min} phút — Unit ${P.unit}`,unit:P.unit,minutes:P.min,kind:P.kind,items,place:"nhap",status:null,from:"TOMO gợi ý",grade:8,plan:P.plan};DB.exams.unshift(e);save();go({v:"editor",id:e.id});toast("Đã lưu vào Nháp.")};
  };
  modal("",null,"wide");draw();
}
function libraryModal(sel){
  const st={q:"",g:"all",sel:sel||null};
  const draw=()=>{const list=DB.exams.filter(e=>e.place==="school"&&(st.g==="all"||String(e.grade||8)===st.g)&&(!st.q||(e.title+" unit "+e.unit+" "+(e.owner||"")).toLowerCase().includes(st.q.toLowerCase())));
    if(!st.sel||!list.some(e=>e.id===st.sel))st.sel=list[0]&&list[0].id;const e=st.sel&&find(st.sel);
    document.querySelector("#layer .modal").innerHTML=mhead("Tìm trong thư viện trường")+`
    <div class="toolbar"><div class="searchbox">${ic("search")}<input type="search" id="lq" placeholder="Tên đề, Unit hoặc người soạn" value="${esc(st.q)}" aria-label="Tìm đề"></div>${seg("lg",[["all","Mọi khối"],["8","Khối 8"],["9","Khối 9"]],st.g)}</div>
    <div class="split"><ul class="pick">${list.map(x=>`<li><button class="${x.id===st.sel?"on":""}" data-lsel="${x.id}"><b>${esc(x.title)}</b><span class="sub">Khối ${x.grade||8} · Unit ${x.unit} · ${x.items.length} câu · ${esc(x.owner||"")}</span></button></li>`).join("")||`<li class="empty-line">Không có đề nào khớp.</li>`}</ul>
    <div class="preview">${e?`<div class="row gap"><b>${esc(e.title)}</b><span class="sp"></span><button class="btn sm" id="lFull">Mở rộng: xem toàn bộ đề</button></div><p class="muted small">${e.items.length} câu · ${e.minutes} phút · ${e.kind==="kt"?"Kiểm tra":"Luyện tập"} · ${diffText(e.items)} · điểm dự kiến khối ${e.grade||8}: <span class="num">${expOf(e)}</span>/10</p><ol class="qlist">${e.items.slice(0,6).map(i=>`<li>${esc(i.stem)}<span class="sub">${i.options?i.options.map((o,j)=>j===i.answer?`<b class="ink">${ABCD[j]}. ${esc(o)}</b>`:`${ABCD[j]}. ${esc(o)}`).join(" · "):"Đáp án mẫu: "+esc(i.answer)}</span>${explainOf(i)?`<span class="sub">Vì sao: ${esc(explainOf(i))}</span>`:""}</li>`).join("")}</ol>${e.items.length>6?`<button class="btn sm ghost" id="lMore">Xem ${e.items.length-6} câu còn lại trong bản đầy đủ</button>`:""}`:""}</div></div>
    <div class="mfoot"><button class="btn" data-close>Đóng</button><button class="btn pri" id="lPull" ${e?"":"disabled"}>Lấy về đề của tôi</button></div>`;
    document.querySelectorAll("#layer [data-close]").forEach(b=>b.onclick=closeM);
    const q=document.querySelector("#lq");q.oninput=()=>{st.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{draw();const n=document.querySelector("#lq");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)};
    on("#layer [data-lg]",el=>{st.g=el.dataset.lg;draw()});on("#layer [data-lsel]",el=>{st.sel=el.dataset.lsel;draw()});
    const b=document.querySelector("#lPull");if(b)b.onclick=()=>pull(st.sel);
    ["#lFull","#lMore"].forEach(q=>{const x=document.querySelector(q);if(x)x.onclick=()=>fullExam(st.sel,()=>libraryModal(st.sel))});
  };
  modal("",null,"wide");draw();
}
function pull(id){const e=find(id),n=clone(e);n.id=newExamId();n.place="nhap";n.status=null;n.pulled=true;n.owner=null;n.ver=null;n.title=e.title+" (bản của cô)";n.from="Thư viện trường";DB.exams.unshift(n);save();go({v:"editor",id:n.id});toast("Đã chép đề về kho của cô. Đề gốc của tổ vẫn giữ nguyên.")}
function addToDraft(qid){
  const drafts=DB.exams.filter(e=>e.place==="nhap"),qq=DB.bank.find(b=>b.id===qid);
  modal(mhead("Thêm vào đề đang soạn",esc(qq.stem))+`<label>Đề<select id="mD">${drafts.map(d=>`<option value="${d.id}">${esc(d.title)}</option>`).join("")}<option value="__new">+ Tạo đề nháp mới</option></select></label><div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="mOk">Thêm</button></div>`,()=>{
    document.querySelector("#mOk").onclick=()=>{const v=document.querySelector("#mD").value;let d;if(v==="__new"){d={id:newExamId(),title:"Đề mới từ Ngân hàng câu",unit:12,minutes:15,kind:"lt",items:[],place:"nhap",status:null,from:"Ngân hàng câu",grade:8};DB.exams.unshift(d)}else d=find(v);
      if(d.items.some(i=>i.id===qq.id)){toast("Câu này đã có trong đề.");return}d.items.push(clone(qq));save();closeM();render();toast(`Đã thêm vào "${d.title}".`)}});
}

/* ---- Xem toàn bộ đề: lớp phủ lớn, có đáp án, in, tải xuống, lấy về ---- */
let dlFn=null;(async()=>{try{dlFn=await window.claude?.use?.("downloads")}catch(e){dlFn=null}})();
function examPaper(e,withKey){
  let lastSec=null,lastPas=null,n=0;
  const body=e.items.map((it,i)=>{let h="";if(it.sec&&it.sec!==lastSec){h+=`<h3 class="psec">${esc(it.sec)}</h3>`;lastSec=it.sec}if(it.passage&&it.passage!==lastPas){h+=`<div class="ppas">${esc(it.passage)}</div>`;lastPas=it.passage}n=it.n||i+1;
    return h+`<div class="pq"><div class="pqh"><b>Câu ${n}.</b> ${it.ulOK&&RESTORE[it.n]&&RESTORE[it.n].stem?RESTORE[it.n].stem:esc(it.stem)}</div>${it.options?`<div class="popts">${it.options.map((o,k)=>`<span class="${withKey&&k===it.answer?"key":""}">${ABCD[k]}. ${it.ulOK&&RESTORE[it.n]&&RESTORE[it.n].options?RESTORE[it.n].options[k]:esc(o)}</span>`).join("")}</div>`:`<div class="pline">……………………………………………………………………………………</div>${withKey?`<div class="key">Đáp án mẫu: ${esc(it.answer)}</div>`:""}`}${withKey&&explainOf(it)?`<div class="pexp"><b>Giải thích:</b> ${esc(explainOf(it))}</div>`:""}${withKey?`<div class="pmeta">${esc(sk(it.skill))} · ${lvT(lvOf(it))}</div>`:""}</div>`}).join("");
  const key=e.items.filter(i=>i.options).map((it,i)=>`<span>${it.n||e.items.indexOf(it)+1}.${ABCD[it.answer]}</span>`).join("");
  return `<div class="paper"><div class="phd"><div><b>TRƯỜNG THCS ……………………</b><br>Môn Tiếng Anh ${e.grade||8} · ${esc(e.kind==="kt"?"Kiểm tra":"Luyện tập")} ${e.minutes} phút</div><div class="r">Họ và tên: ……………………………<br>Lớp: ………… · Mã đề: ${esc(e.id)}${e.ver?"_"+e.ver:""}</div></div>
  <h2 class="ptitle">${esc(e.title)}</h2>${body}${withKey&&key?`<div class="pkey"><b>Bảng đáp án trắc nghiệm</b><div>${key}</div></div>`:""}</div>`;
}
function paperDoc(e,withKey,autoPrint){
  const css=`body{font-family:"Times New Roman",serif;font-size:13pt;line-height:1.45;color:#000;max-width:780px;margin:24px auto;padding:0 24px}.phd{display:flex;justify-content:space-between;gap:24px;font-size:12pt}.phd .r{text-align:right}.ptitle{text-align:center;font-size:15pt;margin:18px 0}.psec{font-size:13pt;margin:18px 0 8px}.ppas{border:1px solid #999;padding:8px 10px;margin:8px 0}.pq{margin:10px 0;break-inside:avoid}.popts{display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;margin:4px 0 0 18px}.key{font-weight:bold;text-decoration:underline}.pmeta{font-size:10pt;color:#555;margin-left:18px}.pline{margin-left:18px;color:#777}.pkey{margin-top:24px;border-top:1px solid #000;padding-top:8px}.pkey div{display:flex;flex-wrap:wrap;gap:6px 16px}.pexp{margin-left:18px;font-size:11.5pt}@media print{body{margin:0}}`;
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>${esc(e.title)}</title><style>${css}</style></head><body>${examPaper(e,withKey)}${autoPrint?"<script>window.onload=()=>window.print()<\/script>":""}</body></html>`;
}
async function saveFile(filename,data){
  if(!dlFn){toast("Trang này chưa được phép tải file xuống. Bản thật tải ngay; ở prototype cô cần cho phép tải xuống khi được hỏi.");return}
  try{await dlFn.save({filename,data});toast(`Đã tải ${filename}.`)}catch(err){toast("Chưa tải được file. Cô thử lại giúp nhé.")}
}
function fullExam(id,back){
  const e=find(id);const st={key:true};
  const slug=x=>x.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const draw=()=>{const M=document.querySelector("#layer .modal");
    M.innerHTML=`<div class="fullbar"><div><h2>${esc(e.title)}</h2><p class="muted small">${e.items.length} câu · ${e.minutes} phút · ${diffText(e.items)}${e.owner?" · "+esc(e.owner):""}</p>${(()=>{const as=DB.assigns.filter(a=>a.examId===e.id);return as.length?`<p class="small">Đã giao: ${as.map(a=>{const rs=resultOf(a);return `<a href="#" data-hist="${a.id}">${a.cls} ${fmtD(a.given)}</a> <span class="muted">(${a.state==="done"?`TB ${rs.avg}`:a.state==="scan"?"chờ phiếu":`${rs.nSub}/${rs.size} nộp`})</span>`}).join(" · ")}</p>`:`<p class="small muted">Chưa giao cho lớp nào.</p>`})()}</div><span class="sp"></span>
      ${seg("pk",[["1","Bản giáo viên (có đáp án)"],["0","Bản học sinh"]],st.key?"1":"0")}
      <button class="btn" id="fPrint">In</button><button class="btn" id="fDl">Tải xuống</button>${e.place==="school"?`<button class="btn pri" id="fPull">Lấy về đề của tôi</button>`:`<button class="btn pri" id="fOpen">Mở để chỉnh</button>`}<button class="iconbtn" id="fClose" aria-label="Đóng">${ic("x")}</button></div>
      <div class="fullbody">${examPaper(e,st.key)}</div>`;
    on("#layer [data-pk]",el=>{st.key=el.dataset.pk==="1";draw()});
    on("#layer [data-hist]",el=>{const a=DB.assigns.find(x=>x.id===el.dataset.hist);go({v:"class",cls:a.cls,tab:"result",aid:a.id})});
    document.querySelector("#fClose").onclick=()=>{closeM();if(back)back()};
    document.querySelector("#fPrint").onclick=()=>saveFile(`${slug(e.title)}${st.key?"-dap-an":""}-in.html`,paperDoc(e,st.key,true));
    document.querySelector("#fDl").onclick=()=>popMenu(document.querySelector("#fDl"),[["Word (.doc)",()=>saveFile(`${slug(e.title)}${st.key?"-dap-an":""}.doc`,paperDoc(e,st.key,false)),"Mở được bằng Word để sửa tiếp"],["Trang in (.html)",()=>saveFile(`${slug(e.title)}${st.key?"-dap-an":""}.html`,paperDoc(e,st.key,false)),"Mở bằng trình duyệt rồi in"]]);
    const p=document.querySelector("#fPull");if(p)p.onclick=()=>pull(e.id);const o=document.querySelector("#fOpen");if(o)o.onclick=()=>go({v:"editor",id:e.id});
  };
  modal("",null,"full");draw();
}

/* ---- Thư viện của tôi: mọi đề cô có, không phụ thuộc lớp hay khối ---- */
function myLibView(){
  const r=UI.r,q=norm((r.mlq||"").trim()),fk=r.mlk||"all",fg=r.mlg||"all",fs=r.mls||"all",so=r.mlo||"new";
  const SRC={"Tự soạn":"Tự soạn","Gợi ý AI":"TOMO gợi ý","Sinh đôi":"Mini test","Tải lên":"Tải file lên","Thư viện trường":"Lấy từ thư viện trường"};
  const st=e=>{const as=DB.assigns.filter(a=>a.examId===e.id);return e.place==="nhap"?"nhap":e.status==="luutru"?"luutru":as.length?"giao":"chua"};
  const STL={nhap:["Nháp","warn"],luutru:["Đã ẩn",""],giao:["Đã giao","pos"],chua:["Chưa giao","info"]};
  let ex=DB.exams.filter(e=>e.place==="mine"||e.place==="nhap");const total=ex.length;
  if(q)ex=ex.filter(e=>norm(e.title+" "+e.id+" Unit "+e.unit).includes(q));
  if(fk!=="all")ex=ex.filter(e=>e.kind===fk);if(fg!=="all")ex=ex.filter(e=>String(e.grade||8)===fg);if(fs!=="all")ex=ex.filter(e=>st(e)===fs);
  const idx=e=>DB.exams.indexOf(e);ex=ex.slice().sort(so==="name"?(a,b)=>a.title.localeCompare(b.title,"vi"):so==="unit"?(a,b)=>(b.unit-a.unit)||a.title.localeCompare(b.title,"vi"):(a,b)=>idx(b)-idx(a));
  const sel=(k,cur,opts,lab)=>`<label class="mlsel"><span class="muted small">${lab}</span><select class="sin" data-mlf="${k}">${opts.map(([v,l])=>`<option value="${v}" ${cur===v?"selected":""}>${l}</option>`).join("")}</select></label>`;
  const rows=ex.map(e=>{const as=DB.assigns.filter(a=>a.examId===e.id);const cls=[...new Set(as.map(a=>a.cls))];const S=st(e);
    return `<tr><td class="idc"><a href="#" data-edit="${e.id}"><b>${esc(e.title)}</b></a><div class="sub">${e.kind==="kt"?"Kiểm tra":"Luyện tập"} · ${e.items.length} câu · ${e.minutes} phút · <span class="mono">${e.id}</span></div></td>
      <td>Khối ${e.grade||8}</td><td>Unit ${e.unit}</td><td class="small">${esc(SRC[e.from]||e.from||"Tự soạn")}</td>
      <td>${pill(STL[S][0],STL[S][1])}</td><td class="small">${cls.length?esc(cls.join(", ")):`<span class="muted">—</span>`}</td>
      <td class="act"><div class="acts">${S==="nhap"?`<button class="btn sm" data-edit="${e.id}">Soạn tiếp</button>`:`<button class="btn sm" data-give="${e.id}">Giao</button>`}<button class="btn sm viewbtn" data-view="${e.id}">Xem đề</button><button class="iconbtn" data-more="${e.id}" aria-label="Thao tác với đề">${ic("kebab")}</button></div></td></tr>`}).join("");
  return `<p class="lede small">Mọi đề cô đang có ở một chỗ: tự soạn, tải lên, TOMO gợi ý, mini test, lấy từ thư viện trường, kể cả nháp và đề chưa giao cho lớp nào.</p>
  <section class="panel flush"><div class="mlbar pad"><div class="searchbox sm">${ic("search")}<input type="search" id="mlq" placeholder="Tìm theo tên đề, mã đề, unit" value="${esc(r.mlq||"")}" aria-label="Tìm trong thư viện của tôi"></div>
    ${sel("mlk",fk,[["all","Tất cả"],["lt","Luyện tập"],["kt","Kiểm tra"]],"Loại")}${sel("mlg",fg,[["all","Tất cả"],["8","Khối 8"],["9","Khối 9"]],"Khối")}${sel("mls",fs,[["all","Tất cả"],["chua","Chưa giao"],["giao","Đã giao"],["nhap","Nháp"],["luutru","Đã ẩn"]],"Trạng thái")}${sel("mlo",so,[["new","Mới nhất"],["name","Tên A → Z"],["unit","Unit mới → cũ"]],"Sắp xếp")}<span class="muted small mlcount">${ex.length}/${total} đề</span></div>
  <div class="scrollx"><table class="tbl hist mylib"><thead><tr><th>Đề</th><th>Khối</th><th>Unit</th><th>Nguồn</th><th>Trạng thái</th><th>Đã giao cho</th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="7"><div class="empty-line">Không có đề nào khớp bộ lọc.</div></td></tr>`}</tbody></table></div></section>`;
}
