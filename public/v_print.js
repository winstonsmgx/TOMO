/* ===== In phiếu giấy có mã QR: phiếu đề, phiếu trả lời, đáp án cho cô — mỗi em một bộ ===== */
function qrSvg(text,cell){try{const q=qrcode(0,"M");q.addData(text);q.make();return q.createSvgTag({cellSize:cell||3,margin:0,scalable:true})}catch(e){return ""}}
/* Bộ câu của một em: đề riêng (mỗi em một đề) hoặc đề chung; đảo thứ tự phương án theo hạt giống riêng */
function sheetOf(a,s,shuffle){
  const e=find(a.examId);let items=a.mode==="canhan"&&a.personal&&a.personal[s.name]?a.personal[s.name].map(p=>Object.assign({role:p.role},DB.bank.find(b=>b.id===p.id)||{})):e.items.map(x=>Object.assign({},x));
  items=items.filter(x=>x&&x.stem);
  const r=rng((a.id+s.id).split("").reduce((h,ch)=>Math.imul(h^ch.charCodeAt(0),16777619)>>>0,2166136261));r();r();
  return items.map((it,i)=>{if(!it.options||!shuffle)return {it,opts:it.options,key:it.answer};
    const idx=[0,1,2,3].slice(0,it.options.length);for(let k=idx.length-1;k>0;k--){const j=Math.floor(r()*(k+1));[idx[k],idx[j]]=[idx[j],idx[k]]}
    return {it,opts:idx.map(j=>it.options[j]),key:idx.indexOf(it.answer)}});
}
const phieuId=(a,s)=>`PHIEU_${a.examId}_${s.id}`;
const clean=st=>st.replace(/^\([^)]*\)\s*/,"");
function pageHead(a,s,kind){const e=find(a.examId),c=cls(a.cls);return `<div class="ph-top"><div><div class="ph-sch">THCS · Tiếng Anh ${c.grade} · Cô ${MY_NAME}</div><div class="ph-t">${esc(e.title)}</div><div class="ph-m">${kind} · ${e.minutes} phút · lớp ${a.cls} · ${fmtD(a.given)}</div></div>`}
function pgQuestion(a,s,sh){
  return `<section class="a4">${pageHead(a,s,"Phiếu đề")}<div class="ph-qr sm">${qrSvg(phieuId(a,s)+"|DE",2)}<span>Đề của ${esc(s.full||s.name)}</span></div></div>
  <div class="ph-who"><span>Học sinh: <b>${esc(s.full||s.name)}</b></span><span>STT ${ROSTER[a.cls].indexOf(s)+1}</span><span>Mã HS: ${s.id}</span></div>
  <p class="ph-note">Em làm bài vào <b>phiếu trả lời</b>. Không viết lên phiếu đề. Đề của mỗi bạn có thứ tự phương án khác nhau.</p>
  <ol class="ph-q">${sh.map(({it,opts},i)=>`<li>${it.skill&&it.skill.startsWith("DH")&&i===sh.findIndex(x=>x.it.skill&&x.it.skill.startsWith("DH"))&&typeof PASSAGE!=="undefined"?`<div class="ph-pass">${esc(PASSAGE)}</div>`:""}<div class="ph-stem">${esc(clean(it.stem))}</div>${opts?`<div class="ph-opts">${opts.map((o,j)=>`<span><b>${ABCD[j]}.</b> ${esc(o)}</span>`).join("")}</div>`:`<div class="ph-lines"></div>`}</li>`).join("")}</ol>
  <div class="ph-foot">${phieuId(a,s)} · Phiếu đề · trang 1</div></section>`;
}
function pgAnswer(a,s,sh){
  return `<section class="a4 ans"><i class="reg tl"></i><i class="reg tr"></i><i class="reg bl"></i><i class="reg br"></i>
  ${pageHead(a,s,"Phiếu trả lời")}<div class="ph-qr">${qrSvg(phieuId(a,s),3)}<span>Không gập, không viết đè lên mã</span></div></div>
  <div class="ph-who big"><span>Học sinh: <b>${esc(s.full||s.name)}</b></span><span>Lớp ${a.cls} · STT ${ROSTER[a.cls].indexOf(s)+1}</span><span>Mã HS: ${s.id}</span></div>
  <p class="ph-note">Tô kín <b>một</b> ô cho mỗi câu bằng bút chì hoặc bút mực đậm. Muốn đổi thì gạch chéo ô cũ và tô ô mới.</p>
  <div class="ph-grid">${sh.map(({opts},i)=>opts?`<div class="ph-row"><b>${i+1}</b>${opts.map((_,j)=>`<span class="bub">${ABCD[j]}</span>`).join("")}</div>`:`<div class="ph-row wr"><b>${i+1}</b><span class="wline"></span></div>`).join("")}</div>
  <div class="ph-tbox"><span class="flabel">Ô dành cho cô</span><label><span class="sq"></span> Nghi nhìn bài</label><label>Nộp lúc: ____ : ____</label><label><span class="sq"></span> Vắng</label></div>
  <div class="ph-foot">${phieuId(a,s)} · Phiếu trả lời · camera đọc mã QR và các ô đã tô</div></section>`;
}
function pgKey(a,list,shuffle){
  const e=find(a.examId);const rows=list.map(s=>({s,sh:sheetOf(a,s,shuffle)}));const n=Math.max(...rows.map(r=>r.sh.length));
  return `<section class="a4 key">${pageHead(a,list[0],"Đáp án cho cô — không phát cho học sinh")}<div class="ph-qr sm">${qrSvg(`KEY_${a.id}`,2)}<span>Bảng đáp án</span></div></div>
  <p class="ph-note">${shuffle?"Mỗi em có thứ tự phương án riêng nên đáp án khác nhau theo từng em. Khi cô chụp phiếu, hệ thống đọc mã QR để chấm đúng đáp án của em đó.":"Mọi em cùng một thứ tự phương án."}</p>
  <table class="ph-key"><thead><tr><th>STT</th><th>Học sinh</th>${Array.from({length:n},(_,i)=>`<th>${i+1}</th>`).join("")}</tr></thead><tbody>${rows.map(({s,sh})=>`<tr><td>${ROSTER[a.cls].indexOf(s)+1}</td><td class="nm">${esc(s.full||s.name)}</td>${Array.from({length:n},(_,i)=>`<td>${sh[i]?(sh[i].opts?ABCD[sh[i].key]:"✎"):""}</td>`).join("")}</tr>`).join("")}</tbody></table>
  ${a.mode!=="canhan"?`<h4 class="ph-h4">Đáp án gốc và giải thích</h4><ol class="ph-q sm">${e.items.map(it=>`<li><div class="ph-stem">${esc(clean(it.stem))}</div><div><b>${it.options?ABCD[it.answer]+". "+esc(it.options[it.answer]):"Tự luận"}</b>${explainOf(it)?` — ${esc(explainOf(it))}`:""}</div></li>`).join("")}</ol>`:""}
  <div class="ph-foot">KEY_${a.id} · Đáp án cho cô</div></section>`;
}
function printModal(aid){
  const a=DB.assigns.find(x=>x.id===aid);if(!a)return;const e=find(a.examId),ro=ROSTER[a.cls];
  const P={kind:"de",who:"all",shuffle:a.shuffle!==false,q:""};
  const pages=()=>{const list=P.who==="all"?ro:[ro.find(s=>s.id===P.who)];
    if(P.kind==="key")return pgKey(a,list,P.shuffle);
    return list.map(s=>{const sh=sheetOf(a,s,P.shuffle);return P.kind==="de"?pgQuestion(a,s,sh):P.kind==="tl"?pgAnswer(a,s,sh):pgQuestion(a,s,sh)+pgAnswer(a,s,sh)}).join("")};
  const count=()=>P.kind==="key"?1:(P.who==="all"?ro.length:1)*(P.kind==="both"?2:1);
  const side=()=>`<div class="pm-side"><span class="flabel">Loại phiếu</span>${seg("pk",[["de","Phiếu đề"],["tl","Phiếu trả lời"],["both","Cả hai"],["key","Đáp án cho cô"]],P.kind)}
    <label class="chk"><input type="checkbox" id="pShuf" ${P.shuffle?"checked":""}>Đảo thứ tự phương án cho từng em</label>
    ${a.mode==="canhan"?`<p class="small muted">Lượt này giao <b>mỗi em một đề riêng</b>: phiếu đề của từng em có câu hỏi khác nhau.</p>`:""}
    <span class="flabel">Học sinh</span><input class="search" id="pq" placeholder="Tìm em" value="${esc(P.q)}"><div class="pm-list"><button class="${P.who==="all"?"on":""}" data-pw="all">Cả lớp · ${ro.length} em</button>${ro.filter(s=>!P.q||norm(s.full).includes(norm(P.q))).map((s,i)=>`<button class="${P.who===s.id?"on":""}" data-pw="${s.id}"><span class="mono">${ro.indexOf(s)+1}</span> ${esc(s.full||s.name)}</button>`).join("")}</div></div>`;
  modal(`<div class="fullbar"><div><b>In phiếu · ${esc(e.title)} · ${a.cls}</b><span class="muted small" id="pcount"> · ${count()} trang A4</span></div><span class="sp"></span><button class="btn" id="pPdf">Tải PDF</button><button class="btn pri" id="pPrint">In</button><button class="iconbtn" data-close aria-label="Đóng">${ic("x")}</button></div>
    <div class="pm-body"><div id="pmSide">${side()}</div><div class="pm-pages" id="pmPages">${pages()}</div></div>`,()=>{
    const re=(all)=>{if(all)document.querySelector("#pmSide").innerHTML=side();document.querySelector("#pmPages").innerHTML=pages();document.querySelector("#pcount").textContent=` · ${count()} trang A4`;bindSide()};
    function bindSide(){document.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>{P.kind=b.dataset.pk;re(true)});
      document.querySelectorAll("[data-pw]").forEach(b=>b.onclick=()=>{P.who=b.dataset.pw;re(true)});
      const sf=document.querySelector("#pShuf");sf.onchange=()=>{P.shuffle=sf.checked;a.shuffle=P.shuffle;save();re(false)};
      const q=document.querySelector("#pq");q.oninput=()=>{P.q=q.value;const v=q.value;re(true);const n=document.querySelector("#pq");n.focus();n.setSelectionRange(v.length,v.length)}}
    bindSide();
    document.querySelector("#pPrint").onclick=()=>{document.body.classList.add("printing");window.print();setTimeout(()=>document.body.classList.remove("printing"),500)};
    document.querySelector("#pPdf").onclick=()=>{const b=document.querySelector("#pPdf");b.disabled=true;b.textContent="Đang tạo PDF…";setTimeout(()=>{b.disabled=false;b.textContent="Tải PDF";toast(`Đã tạo ${a.id}_${P.kind}.pdf (${count()} trang). Prototype: chưa tải file thật.`)},1200)};
  },"full");
}
