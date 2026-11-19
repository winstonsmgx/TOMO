/* ===== Trạng thái, điều hướng, khung trang, hộp thoại ===== */
let DB;
const KEY="examen-proto-v3";
function seed(){const {exams,bank}=seedExams();return {exams,bank,assigns:seedAssigns(),verify:seedVerify(),recheck:{"8A3":["Chi","Hà"]},reports:{},settings:{mustApprove:false,night:false},seq:20,itemSeq:400,repeatKhong:{Khoa:1},ab:{},scan:{},noteAll:{}}}
function load(){try{const s=localStorage.getItem(KEY);DB=s?JSON.parse(s):seed()}catch(e){DB=seed()}(DB.exams||[]).forEach(e=>{if(e.twinOf&&!e.forCls){const m=/mini test (\d[A-Z]\d)/.exec(e.title||"");e.forCls=m?m[1]:e.id.endsWith("0002_KT")?"8A3":undefined}if(/kiểm tra sinh đôi/.test(e.title))e.title=e.title.replace("Bài về nhà Unit 12 — kiểm tra sinh đôi","Mini test — Bài về nhà Unit 12").replace(/ — kiểm tra sinh đôi/," — mini test")})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
function find(id){return DB.exams.find(e=>e.id===id)}
function newExamId(){return `DE_${ME}_${String(++DB.seq).padStart(4,"0")}`}
function newItemId(skill){return `ENG8_${skill}_${String(++DB.itemSeq).padStart(4,"0")}`}

const UI={r:{v:"today"},flow:null,busy:null};
const VIEWS={};
function go(r,noHist){if(!noHist&&UI.r&&JSON.stringify(UI.r)!==JSON.stringify(r)){UI.hist=(UI.hist||[]).concat([UI.r]).slice(-30)}UI.r=r;closeM();render();window.scrollTo(0,0);syncFlow()}
function goBack(fallback){const h=UI.hist||[];const r=h.pop();go(r||fallback||{v:"today"},true)}
function backBtn(label,fb){return `<button class="backbtn" data-backbtn aria-label="${esc(label)}" title="${esc(label)}">${ic("chevl",22)}</button>`}
function on(sel,fn){document.querySelectorAll(sel).forEach(el=>el.onclick=ev=>{ev.preventDefault();fn(el,ev)})}
function streamTo(t){const el=document.querySelector("#stream");if(el)el.textContent=t.slice(-400)}

/* ---- icons: một bộ nét mảnh 16px ---- */
const IC={
 book:'<path d="M3 3h4.5a1.5 1.5 0 0 1 1.5 1.5V13a1 1 0 0 0-1-1H3zM13 3H9.5"/><path d="M13 3v9H9"/>', chart:'<path d="M3 13V8M8 13V3M13 13V6"/>', user:'<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c.8-2.4 2.7-3.5 5-3.5s4.2 1.1 5 3.5"/>', check:'<path d="m3.5 8.5 3 3 6-7"/>',
 today:'<path d="M3 4.5h10M3 8h10M3 11.5h6" />',
 lib:'<path d="M3 3h4v10H3zM9 3h4v10H9z" />',
 cls:'<circle cx="8" cy="6" r="2.5"/><path d="M3 13c.8-2.2 2.7-3.3 5-3.3s4.2 1.1 5 3.3"/>',
 map:'<path d="M2.5 4l3.5-1.5 4 1.5 3.5-1.5v9.5L10 13.5 6 12l-3.5 1.5z"/><path d="M6 2.5V12M10 4v9.5"/>',
 set:'<circle cx="8" cy="8" r="2"/><path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4"/>',
 chart:'<path d="M2.5 13.5h11"/><path d="m3.5 10.5 3-3.5 2.5 2 4-5"/>', plus:'<path d="M8 3v10M3 8h10"/>', search:'<circle cx="7" cy="7" r="4"/><path d="m10 10 3 3"/>', mic:'<rect x="6" y="2" width="4" height="8" rx="2"/><path d="M3.5 8a4.5 4.5 0 0 0 9 0M8 12.5V14"/>',
 cam:'<path d="M2.5 5h2.5l1-1.5h4L11 5h2.5v7.5h-11z"/><circle cx="8" cy="8.6" r="2.2"/>', up:'<path d="M8 11V3M5 6l3-3 3 3M3 13h10"/>', ai:'<path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M4 12l2-2M10 6l2-2"/>',
 x:'<path d="m4 4 8 8M12 4l-8 8"/>', chevl:'<path d="m10 4-4 4 4 4"/>', chevd:'<path d="m4 6 4 4 4-4"/>', info:'<circle cx="8" cy="8" r="6"/><path d="M8 7.2V11M8 5v.01"/>', star:'<path d="M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4L2.2 6.5l4-.6z"/>', chev:'<path d="m6 4 4 4-4 4"/>', kebab:'<circle cx="8" cy="3.5" r=".8"/><circle cx="8" cy="8" r=".8"/><circle cx="8" cy="12.5" r=".8"/>'
};
const ic=(k,s)=>`<svg class="ic" width="${s||16}" height="${s||16}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;

/* ---- thanh bên: lớp là trục chính ---- */
function side(){
  DB.ui=DB.ui||{};const mini=!!DB.ui.mini,closed=DB.ui.closed||{};document.body.classList.toggle("mini",mini);
  const r=UI.r;const n=(cond,html,attrs)=>`<a href="#" class="nav ${cond?"on":""}" ${attrs}>${html}</a>`;
  const groups=[8,9].map(g=>`<button class="grp" data-grp="${g}" aria-expanded="${!closed[g]}">Khối ${g} ${ic(closed[g]?"chev":"chevd",10)}${closed[g]?`<span class="cmeta">${CLASSES.filter(c=>c.grade===g).reduce((t,c)=>t+todoOf(c.id).length,0)||""}</span>`:""}</button>`+(closed[g]&&!mini?"":CLASSES.filter(c=>c.grade===g).map(c=>{const t=todoOf(c.id).length;return n(r.v==="class"&&r.cls===c.id,`<span class="cname">${c.id}</span><span class="cmeta">${c.size} em</span>${t?`<span class="badge" title="${t} việc cần cô làm">${mini?t:t+" việc"}</span>`:""}`,`data-cls="${c.id}" title="${c.id} · ${c.size} em"`)}).join(""))).join("");
  document.querySelector("#side").innerHTML=`
   <div class="brand"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="6" fill="#161A2B"/><text x="14" y="19" text-anchor="middle" font-family="Be Vietnam Pro,sans-serif" font-size="13" font-weight="700" fill="#fff">T</text></svg>
     <div class="bt"><b>TOMO</b><small>Cô ${MY_NAME} · Tiếng Anh</small></div><button class="iconbtn collapse" id="sideToggle" aria-label="${mini?"Mở rộng thanh bên":"Thu gọn thanh bên"}" title="${mini?"Mở rộng":"Thu gọn"}">${ic(mini?"chev":"chevl")}</button></div>
   <button class="searchbtn" id="gsearch">${ic("search")}<span>Tìm lớp, học sinh, đề, tính năng</span><kbd>Ctrl K</kbd></button>
   <button class="term" id="term" title="Đổi học kỳ">HK I · 2026–2027 ${ic("chev",12)}</button>
   ${n(r.v==="today",ic("today")+"Hôm nay",'data-go="today"')}
   ${n(r.v==="kho"||r.v==="editor",ic("lib")+"Kho đề",'data-go="kho"')}
   ${groups}
   <div class="sp-v"></div>
   <button class="nav asstu" id="asStu" title="Xem như học sinh Đặng Tuấn, 8A1"><span class="av">T</span><span class="lbl">Xem như học sinh</span></button>
   ${n(r.v==="map",ic("map")+"Bản đồ flow",'data-go="map"')}
   ${n(r.v==="sim",ic("chart")+"Mô phỏng chỉ số",'data-go="sim"')}
   ${n(r.v==="set",ic("set")+"Cài đặt prototype",'data-go="set"')}
   <div class="ai-state">${aiOK?"TOMO đang bật":aiOK===false?"TOMO chưa bật: dùng dữ liệu mẫu":"Đang kết nối TOMO…"}</div>`;
  const as=document.querySelector("#asStu");if(as)as.onclick=()=>setRole("hs");
  on("#side [data-go]",el=>{const v=el.dataset.go;UI.flow=null;go({v})});
  on("#side [data-cls]",(el,ev)=>{UI.flow=null;go({v:"class",cls:el.dataset.cls,tab:"assign"});if(ev&&ev.target.closest(".badge")){const m=document.querySelector("#tMain");if(m)m.click()}});
  document.querySelector("#gsearch").onclick=()=>searchPalette();
  document.querySelector("#sideToggle").onclick=()=>{DB.ui.mini=!DB.ui.mini;save();side()};
  on("#side [data-grp]",el=>{DB.ui.closed=DB.ui.closed||{};const g=el.dataset.grp;DB.ui.closed[g]=!DB.ui.closed[g];save();side()});
  document.querySelector("#term").onclick=()=>toast("Prototype chỉ có học kỳ I năm học 2026–2027.");
}

/* Nút ☰ nằm trong #main nên phải gắn sau khi vẽ lại trang (trước đây gắn trước nên bấm không có tác dụng) */
function bindMenuBtn(){const mb=document.querySelector("#menuBtn");if(mb)mb.onclick=e=>{e.stopPropagation();document.body.classList.toggle("nav-open")};
  if(!window.__navClose){window.__navClose=1;document.addEventListener("click",e=>{if(document.body.classList.contains("nav-open")&&!e.target.closest("#side"))document.body.classList.remove("nav-open")})}}
function render(){
  side();document.body.classList.remove("nav-open");
  const m=document.querySelector("#main");
  if(UI.busy){m.innerHTML=flowBar()+`<div class="title-row"><h1>${esc(UI.busy.title)}</h1></div><p class="lede">${esc(UI.busy.sub||"")}</p><div class="panel loading"><div class="spin"></div><div><b>${esc(UI.busy.step)}</b><div class="stream" id="stream"></div></div></div>`;bindFlow();return}
  const v=VIEWS[UI.r.v]||VIEWS.today;
  m.innerHTML=flowBar()+v.html()+(typeof todoFloat==="function"?todoFloat():"");bindFlow();v.bind&&v.bind();if(typeof bindTodoFloat==="function")bindTodoFloat();bindMenuBtn();
  on("[data-gocls]",el=>go({v:"class",cls:el.dataset.gocls,tab:el.dataset.tab||"assign",aid:el.dataset.aid}));
  on("[data-student]",el=>studentSheet(el.dataset.cls||UI.r.cls||"8A3",el.dataset.student));
}

/* ---- hộp thoại, thông báo ---- */
function modal(html,after,size){const L=document.querySelector("#layer");L.innerHTML=`<div class="overlay" role="dialog" aria-modal="true"><div class="modal ${size||""}">${html}</div></div>`;
  L.querySelector(".overlay").onclick=ev=>{if(ev.target.classList.contains("overlay"))closeM()};L.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);
  document.onkeydown=e=>{if(e.key==="Escape")closeM()};after&&after();const f=L.querySelector("input,textarea,select,button.pri");if(f)f.focus()}
function closeM(){const L=document.querySelector("#layer");if(L)L.innerHTML="";document.onkeydown=null}
function mhead(t,sub){return `<div class="mhead"><div><h2>${esc(t)}</h2>${sub?`<p class="muted">${sub}</p>`:""}</div><button class="iconbtn" data-close aria-label="Đóng">${ic("x")}</button></div>`}
function confirmBox(t,m,ok,fn,cancel){modal(mhead(t)+`<p>${m}</p><div class="mfoot"><button class="btn" data-close>${esc(cancel||"Huỷ")}</button><button class="btn pri" id="mOk">${esc(ok)}</button></div>`,()=>{document.querySelector("#mOk").onclick=()=>{closeM();fn()}})}
let tt;function toast(m,undo){clearTimeout(tt);let el=document.querySelector(".toast");if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");document.body.appendChild(el)}
  el.innerHTML=esc(m)+(undo?` <button class="btn sm inv" id="undoBtn">Hoàn tác</button>`:"");if(undo)document.querySelector("#undoBtn").onclick=()=>{undo();el.remove()};tt=setTimeout(()=>el.remove(),undo?6000:3600)}
function seg(name,list,cur){return `<div class="seg" role="group">${list.map(([k,l])=>`<button class="${cur===k?"on":""}" data-${name}="${k}" aria-pressed="${cur===k}">${l}</button>`).join("")}</div>`}
function tabs(list,cur,attr){return `<div class="tabs" role="tablist">${list.map(([k,l,n])=>`<button role="tab" aria-selected="${cur===k}" class="tab ${cur===k?"on":""}" data-${attr||"tab"}="${k}">${l}${n!=null?` <span class="n">${n}</span>`:""}</button>`).join("")}</div>`}

/* ---- thành phần dữ liệu ---- */
function diffBar(items,w){const c={de:0,tb:0,kha:0,kho:0};items.forEach(i=>c[lvOf(i)]++);const n=items.length||1;
  return `<div class="dbar" style="${w?`width:${w}px`:""}" title="${LV.filter(l=>c[l.k]).map(l=>`${l.t} ${c[l.k]}`).join(" · ")}">${LV.map(l=>c[l.k]?`<span style="flex:${c[l.k]};background:${l.c}"></span>`:"").join("")}</div>`}
function diffText(items){const c={de:0,tb:0,kha:0,kho:0};items.forEach(i=>c[lvOf(i)]++);return LV.filter(l=>c[l.k]).map(l=>`${l.t} ${c[l.k]}`).join(" · ")}
function pill(t,k){return `<span class="pill ${k||""}">${esc(t)}</span>`}
function statusPill(e){
  if(e.place==="nhap")return e.returned?pill("Cần chỉnh","neg"):e.pulled?pill("Lấy từ thư viện"):pill("Nháp");
  if(e.status==="cho")return pill("Chờ duyệt","warn");if(e.status==="duyet")return pill("Đã duyệt","pos");if(e.status==="luutru")return pill("Đã ẩn");
  return e.unapprovedGiven?pill("Chưa duyệt (cô dùng luôn)","warn"):"";
}
function scoreCell(v){return v==null?`<span class="dash">—</span>`:`<span class="num">${v.toFixed(1)}</span>`}
function bar(frac,hue){return `<span class="track"><span style="width:${Math.round(frac*100)}%;${hue?"":"background:var(--text)"}"></span></span>`}

const App={start(){load();render();(async()=>{try{sampleFn=await window.claude?.use?.("sample")}catch(e){sampleFn=null}aiOK=!!sampleFn;try{imgOK=!!(sampleFn&&sampleFn.limits&&(await sampleFn.limits()).images)}catch(e){imgOK=false}render()})()}};

/* ---- Tìm kiếm chung: lớp, học sinh, đề, tính năng ---- */
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();searchPalette()}});
const FEATURES=[["Tạo đề: tự nhập",()=>typeModal()],["Tạo đề: tải file lên",()=>uploadModal()],["Tạo đề: TOMO gợi ý",()=>aiModal()],["Tìm trong thư viện trường",()=>libraryModal()],["Giao bài",()=>assignModal()],["Sổ giao đề",()=>go({v:"kho",tab:"book"})],["Đề nháp",()=>go({v:"kho",tab:"nhap"})],["Ngân hàng câu",()=>go({v:"kho",tab:"bank"})],["Câu yêu thích",()=>go({v:"kho",tab:"bank",src:"fav"})],["Nhập phiếu giấy",()=>{const t=CLASSES.flatMap(c=>todoOf(c.id)).find(x=>x.k==="scan");t?scanModal(t.aid):toast("Không có lượt nào chờ nhập phiếu.")}],["Cài đặt",()=>go({v:"set"})],["Bản đồ flow",()=>go({v:"map"})],["Xem như học sinh: Đặng Tuấn 8A1",()=>setRole("hs")]];
function norm(x){return (x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase()}
function searchPalette(){
  const st={q:"",i:0};
  const results=()=>{const q=norm(st.q.trim());const R=[];
    CLASSES.forEach(c=>{if(!q||norm(c.id+" lop "+c.id+" khoi "+c.grade).includes(q))R.push({g:"Lớp",t:c.id,s:`${c.size} em · ${c.slot}`,run:()=>go({v:"class",cls:c.id,tab:"assign"})})});
    if(q)CLASSES.forEach(c=>ROSTER[c.id].forEach((s,i)=>{if(norm(s.full+" "+s.name+" "+s.id).includes(q))R.push({g:"Học sinh",t:s.full||s.name,s:`${c.id} · STT ${i+1} · ${s.id}`,run:()=>{go({v:"class",cls:c.id,tab:"report"});setTimeout(()=>studentSheet(c.id,s.name),30)}})}));
    if(q)DB.exams.filter(e=>norm(e.title+" unit "+e.unit).includes(q)).forEach(e=>R.push({g:"Đề",t:e.title,s:`${e.place==="school"?"Thư viện trường":e.place==="nhap"?"Nháp":"Của tôi"} · ${e.items.length} câu`,run:()=>fullExam(e.id)}));
    FEATURES.forEach(([t,run])=>{if(!q||norm(t).includes(q))R.push({g:"Tính năng",t,s:"",run})});
    return R.slice(0,40)};
  const draw=()=>{const R=results();st.i=Math.min(st.i,Math.max(0,R.length-1));const M=document.querySelector("#layer .modal");let g="";
    M.innerHTML=`<div class="searchbox big">${ic("search")}<input type="search" id="sq" placeholder="Tìm lớp, học sinh (họ tên), đề, tính năng" value="${esc(st.q)}" aria-label="Tìm"></div>
    <div class="sres" role="listbox">${R.map((r,k)=>{const h=r.g!==g?`<div class="sgrp">${r.g}</div>`:"";g=r.g;return h+`<button class="sitem ${k===st.i?"on":""}" data-si="${k}" role="option" aria-selected="${k===st.i}"><span>${esc(r.t)}</span><span class="muted small">${esc(r.s)}</span></button>`}).join("")||`<div class="empty-line">Không tìm thấy kết quả.</div>`}</div>`;
    const inp=document.querySelector("#sq");inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);
    inp.oninput=()=>{st.q=inp.value;st.i=0;draw()};
    inp.onkeydown=e=>{if(e.key==="ArrowDown"){e.preventDefault();st.i=Math.min(st.i+1,R.length-1);draw()}else if(e.key==="ArrowUp"){e.preventDefault();st.i=Math.max(st.i-1,0);draw()}else if(e.key==="Enter"&&R[st.i]){closeM();R[st.i].run()}};
    document.querySelectorAll("#layer [data-si]").forEach(b=>b.onclick=()=>{const r=R[+b.dataset.si];closeM();r.run()});
    const on_=document.querySelector(".sitem.on");if(on_)on_.scrollIntoView({block:"nearest"});
  };
  modal("",null,"search");draw();
}
