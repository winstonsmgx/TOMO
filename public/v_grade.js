/* ===== Sổ điểm theo kiểu truyền thống (Thông tư 22/2021, THCS): thường xuyên hệ số 1, giữa kỳ hệ số 2, cuối kỳ hệ số 3 ===== */
const q25=v=>Math.max(0,Math.min(10,Math.round(v*4)/4));
function gbCols(c){
  const kt=assignsOf(c).filter(a=>a.kind==="kt"&&a.state!=="open").slice().reverse();
  const cols=[{id:"tx1",grp:"tx",t:"Miệng",d:"22/09",sim:.5},{id:"tx2",grp:"tx",t:"15 phút",sub:"Unit 1–2",d:"02/10",sim:.25}];
  kt.forEach((a,i)=>{if(cols.filter(x=>x.grp==="tx").length<4)cols.push({id:a.id,grp:"tx",t:"15 phút",sub:"Unit "+find(a.examId).unit,d:fmtD(a.given),aid:a.id,scan:a.state==="scan"})});
  while(cols.filter(x=>x.grp==="tx").length<4){const n=cols.filter(x=>x.grp==="tx").length;cols.push({id:"tx"+(n+1),grp:"tx",t:n===2?"15 phút":"Miệng",sub:n===2?"Unit 4–5":"",d:n===2?"20/10":"",sim:n===2?.25:null})}
  cols.push({id:"gk",grp:"gk",t:"Giữa kỳ I",sub:"Đề số 4",d:"05/11",mid:true});
  cols.push({id:"ck",grp:"ck",t:"Cuối kỳ I",d:"dự kiến 25/12",none:true});
  return cols;
}
function gbScore(c,s,col){const ov=((DB.gbEdits||{})[c]||{})[s.id];if(ov&&ov[col.id]!=null)return {v:ov[col.id],edited:true};return gbRaw(c,s,col)}
function gbRaw(c,s,col){
  if(col.none)return {v:null,lab:"—"};
  if(col.aid){if(col.scan)return {v:null,lab:"Chờ nhập"};const r=resultOf(DB.assigns.find(a=>a.id===col.aid)).rows.find(x=>x.s.id===s.id);return r&&r.submitted?{v:q25(r.score)}:{v:null,lab:"Vắng",miss:true}}
  if(col.sim==null&&!col.mid)return {v:null,lab:"—"};
  const r=rng((s.id+col.id).split("").reduce((a,ch)=>Math.imul(a^ch.charCodeAt(0),16777619)>>>0,2166136261));r();r();
  const base=10*(0.25+0.75*sig(s.theta+(col.mid?0:0.4)));const v=base+(r()-.5)*2.2;
  return {v:col.sim===.5?Math.max(0,Math.min(10,Math.round(v*2)/2)):q25(v)};
}
function gbAvg(sc,cols){let sum=0,w=0;cols.forEach((c,i)=>{const v=sc[i].v;if(v==null)return;const k=c.grp==="gk"?2:c.grp==="ck"?3:1;sum+=v*k;w+=k});return w?+(sum/w).toFixed(1):null}
const GBL=v=>v==null?null:v>=8?["Tốt","g-l3"]:v>=6.5?["Khá","g-l2"]:v>=5?["Đạt","g-l1"]:["Chưa đạt","g-l0"];
function gradebook(c){
  const cols=gbCols(c.id),ro=ROSTER[c.id];const G=UI.r.gb=UI.r.gb||{sort:"stt",dir:1,low:false,hw:false,q:""};
  let rows=ro.map((s,i)=>{const sc=cols.map(col=>gbScore(c.id,s,col));return {s,stt:i+1,sc,avg:gbAvg(sc,cols),hw:avgOf(c.id,s)}});
  const nm=norm(G.q);if(nm)rows=rows.filter(r=>norm(r.s.full||r.s.name).includes(nm));
  if(G.low)rows=rows.filter(r=>r.sc.some(x=>x.v!=null&&x.v<5)||(r.avg!=null&&r.avg<5));
  const key=r=>G.sort==="stt"?r.stt:G.sort==="name"?norm(r.s.name):G.sort==="avg"?(r.avg??-1):G.sort==="hw"?(r.hw??-1):(r.sc[+G.sort].v??-1);
  rows.sort((a,b)=>{const x=key(a),y=key(b);return (x>y?1:x<y?-1:0)*G.dir});
  const tone=v=>v==null?"":v<5?"g-low":v<6.5?"g-mid":v>=8?"g-hi":"";
  const fmt=v=>v==null?"":String(v).replace(".",",");
  const th=(k,l,sub,cls)=>`<th class="${cls||""}"><button class="sortbtn ${G.sort===String(k)?"on":""}" data-gs="${k}">${l}${G.sort===String(k)?(G.dir>0?" ↑":" ↓"):""}</button>${sub?`<span class="sub">${sub}</span>`:""}</th>`;
  const nTx=cols.filter(x=>x.grp==="tx").length;
  const classAvg=i=>{const vs=rows.map(r=>r.sc[i].v).filter(v=>v!=null);return vs.length?(vs.reduce((a,b)=>a+b,0)/vs.length).toFixed(1).replace(".",","):"—"};
  const avgAll=rows.map(r=>r.avg).filter(v=>v!=null);const nLow=ro.filter(s=>{const sc=cols.map(col=>gbScore(c.id,s,col));return gbAvg(sc,cols)<5}).length;
  return `<div class="toolbar"><input class="search" id="gq" placeholder="Tìm học sinh" value="${esc(G.q)}" aria-label="Tìm học sinh"><label class="chk"><input type="checkbox" id="glow" ${G.low?"checked":""}>Chỉ em có điểm dưới 5</label><label class="chk"><input type="checkbox" id="ghw" ${G.hw?"checked":""}>Hiện TB bài về nhà</label><span class="sp"></span>${((DB.gbLog||{})[c.id]||[]).length?`<button class="btn sm ghost" id="gbLogB">Lịch sử sửa điểm · ${(DB.gbLog[c.id]||[]).length}</button>`:""}<span class="muted small">ĐTB học kỳ tạm tính: ${avgAll.length?(avgAll.reduce((a,b)=>a+b,0)/avgAll.length).toFixed(1).replace(".",","):"—"} · ${nLow} em dưới 5</span></div>
  <section class="panel flush"><div class="scrollx"><table class="tbl gbook"><thead>
   <tr class="grp"><th colspan="2"></th><th colspan="${nTx}">Thường xuyên · hệ số 1</th><th>Giữa kỳ · hệ số 2</th><th>Cuối kỳ · hệ số 3</th><th></th><th></th>${G.hw?"<th></th>":""}</tr>
   <tr>${th("stt","STT","","num")}${th("name","Họ và tên")}${cols.map((col,i)=>th(i,col.t,[col.sub,col.d].filter(Boolean).join(" · "),"num"+(col.grp!=="tx"?" gsep":"")))}${th("avg","ĐTB học kỳ","tạm tính","num gsep")}<th>Mức</th>${G.hw?th("hw","TB bài về nhà","không vào sổ","num"):""}</tr></thead>
  <tbody>${rows.map(r=>`<tr><td class="num">${r.stt}</td><td><a href="#" data-student="${r.s.name}">${esc(r.s.full||r.s.name)}</a></td>${r.sc.map((x,i)=>`<td class="num gcell ${tone(x.v)}${cols[i].grp!=="tx"?" gsep":""}${x.edited?" edited":""}" ${cols[i].none?"":`data-gbe="${r.s.id}|${i}" title="${x.edited?"Đã sửa tay · bấm để xem hoặc sửa lại":"Bấm để sửa điểm"}"`}>${x.v!=null?fmt(x.v):`<span class="${x.miss?"warn-t":"muted"}">${x.lab}</span>`}</td>`).join("")}<td class="num gsep"><b class="${tone(r.avg)}">${fmt(r.avg)}</b></td><td class="glv">${GBL(r.avg)?`<span class="glab ${GBL(r.avg)[1]}">${GBL(r.avg)[0]}</span><button class="iconbtn sm" data-gbi="${esc(r.s.name)}" aria-label="Cần cải thiện gì" title="Cần cải thiện gì">${ic("info",14)}</button>`:""}</td>${G.hw?`<td class="num muted">${fmt(r.hw)}</td>`:""}</tr>`).join("")||`<tr><td colspan="${cols.length+5}"><div class="empty-line">Không có em nào khớp.</div></td></tr>`}</tbody>
  <tfoot><tr><td></td><td class="muted">TB lớp</td>${cols.map((col,i)=>`<td class="num muted${col.grp!=="tx"?" gsep":""}">${col.none?"—":classAvg(i)}</td>`).join("")}<td class="num gsep"></td><td></td>${G.hw?"<td></td>":""}</tr></tfoot></table></div></section>
  <p class="muted small gnote">ĐTB học kỳ = (tổng điểm thường xuyên + 2 × giữa kỳ + 3 × cuối kỳ) ÷ (số bài thường xuyên + 5). Chưa có điểm cuối kỳ nên đang tính trên các cột đã có. "Vắng" là em chưa làm bài, cần kiểm tra bù. Bấm vào điểm để sửa; mỗi lần sửa được ghi lại (ai, lúc nào, từ bao nhiêu thành bao nhiêu, lý do). Mức: Tốt từ 8, Khá từ 6,5, Đạt từ 5, Chưa đạt dưới 5.</p>`;
}
function bindGradebook(c){
  const G=UI.r.gb;if(!G)return;const cols=gbCols(c);
  on("[data-gbe]",el=>{const [sid,i]=el.dataset.gbe.split("|");gbEdit(c,sid,cols[+i])});
  on("[data-gbi]",el=>improveModal(c,el.dataset.gbi));
  const lb=document.querySelector("#gbLogB");if(lb)lb.onclick=()=>gbLogModal(c);
  on("[data-gs]",el=>{const k=el.dataset.gs;if(G.sort===k)G.dir*=-1;else{G.sort=k;G.dir=k==="stt"||k==="name"?1:-1}render()});
  const q=document.querySelector("#gq");if(q)q.oninput=()=>{G.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{render();const n=document.querySelector("#gq");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)};
  const lo=document.querySelector("#glow");if(lo)lo.onchange=()=>{G.low=lo.checked;render()};
  const hw=document.querySelector("#ghw");if(hw)hw.onchange=()=>{G.hw=hw.checked;render()};
  on("[data-student]",el=>studentSheet(c,el.dataset.student));
}

/* ---- Sửa điểm có ghi log ---- */
function gbEdit(c,sid,col){const s=ROSTER[c].find(x=>x.id===sid);const cur=gbScore(c,s,col),raw=gbRaw(c,s,col);const log=((DB.gbLog||{})[c]||[]).filter(x=>x.sid===sid&&x.col===col.id);
  const R=["Chấm lại","Kiểm tra bù","Nhập nhầm","Phúc khảo","Khác"];
  modal(mhead(`Sửa điểm · ${esc(s.full||s.name)}`,`${esc(col.t)}${col.sub?" · "+esc(col.sub):""}${col.d?" · "+col.d:""}`)+`<div class="fgrid"><label>Điểm hiện tại<input type="text" value="${cur.v==null?"(trống)":String(cur.v).replace(".",",")}" disabled></label><label>Điểm mới (0–10)<input type="number" id="gbNew" min="0" max="10" step="0.25" value="${cur.v??""}"></label></div>
   <label>Lý do<select id="gbWhy">${R.map(r=>`<option>${r}</option>`).join("")}</select></label><label>Ghi chú (không bắt buộc)<input type="text" id="gbNote" placeholder="Ví dụ: phiếu bị nhòe câu 4, chấm lại theo bản gốc"></label>
   ${cur.edited?`<p class="small muted">Điểm gốc từ hệ thống: ${raw.v==null?"trống":String(raw.v).replace(".",",")}.</p>`:""}
   ${log.length?`<span class="flabel">Lịch sử sửa ô này</span><ul class="list small">${log.slice().reverse().map(x=>`<li><span>${x.at} · ${esc(x.who)}: ${x.old??"trống"} → <b>${x.new}</b> · ${esc(x.why)}${x.note?` (${esc(x.note)})`:""}</span></li>`).join("")}</ul>`:""}
   <div class="mfoot">${cur.edited?`<button class="btn ghost" id="gbReset">Về điểm gốc</button>`:""}<span class="sp"></span><button class="btn" data-close>Huỷ</button><button class="btn pri" id="gbSave">Lưu</button></div>`,()=>{
    const put=(v,why,note)=>{DB.gbEdits=DB.gbEdits||{};DB.gbEdits[c]=DB.gbEdits[c]||{};DB.gbEdits[c][sid]=DB.gbEdits[c][sid]||{};if(v==null)delete DB.gbEdits[c][sid][col.id];else DB.gbEdits[c][sid][col.id]=v;
      DB.gbLog=DB.gbLog||{};(DB.gbLog[c]=DB.gbLog[c]||[]).push({at:new Date().toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"}),who:`Cô ${MY_NAME}`,sid,name:s.full||s.name,col:col.id,colT:col.t+(col.sub?" "+col.sub:""),old:cur.v,new:v==null?`${raw.v} (gốc)`:v,why,note});save();closeM();render();toast("Đã lưu và ghi vào lịch sử sửa điểm.")};
    document.querySelector("#gbSave").onclick=()=>{const v=+document.querySelector("#gbNew").value;if(isNaN(v)||v<0||v>10){toast("Điểm từ 0 đến 10.");return}if(v===cur.v){closeM();return}put(Math.round(v*4)/4,document.querySelector("#gbWhy").value,document.querySelector("#gbNote").value.trim())};
    const rs=document.querySelector("#gbReset");if(rs)rs.onclick=()=>put(null,"Về điểm gốc","")});
}
function gbLogModal(c){const L=((DB.gbLog||{})[c]||[]).slice().reverse();
  modal(mhead(`Lịch sử sửa điểm · ${c}`,`${L.length} lần sửa`)+`<table class="tbl compact"><thead><tr><th>Lúc</th><th>Người sửa</th><th>Học sinh</th><th>Cột</th><th class="num">Từ</th><th class="num">Thành</th><th>Lý do</th></tr></thead><tbody>${L.map(x=>`<tr><td>${x.at}</td><td>${esc(x.who)}</td><td>${esc(x.name)}</td><td>${esc(x.colT)}</td><td class="num">${x.old==null?"—":String(x.old).replace(".",",")}</td><td class="num"><b>${String(x.new).replace(".",",")}</b></td><td class="small">${esc(x.why)}${x.note?` · ${esc(x.note)}`:""}</td></tr>`).join("")}</tbody></table><div class="mfoot"><button class="btn" data-close>Đóng</button></div>`,null,"wide");
}
/* ---- Cần cải thiện gì (để báo phụ huynh) ---- */
function improveModal(c,n){const s=ROSTER[c].find(x=>x.name===n);if(!s)return;const cols=gbCols(c);const sc=cols.map(col=>gbScore(c,s,col));const avg=gbAvg(sc,cols);const L=GBL(avg);
  const sks=skillsOf(c),m=masteryOf(c,s);const weak=sks.map((k,i)=>({k,l:m[i]})).sort((x,y)=>x.l-y.l).filter(x=>x.l<=1).slice(0,2);
  const done=assignsOf(c).filter(a=>a.state==="done"&&resultOf(a).rows.some(r=>r.s.id===s.id&&r.submitted)).slice(0,3);
  const tags={},mv=[[0,0],[0,0],[0,0],[0,0]];done.forEach(a=>{const R=respOf(a),row=R.rows.find(r=>r.s.id===s.id);if(!row||!row.submitted)return;row.ans.forEach((x,i)=>{const k=MVD.indexOf(mvOf(R.e.items[i]));mv[k][1]++;if(x.ok)mv[k][0]++;if(x.tag)tags[x.tag]=(tags[x.tag]||0)+1})});
  const topTags=Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,3);const mvR=mv.map((x,k)=>x[1]?{k,r:Math.round(100*x[0]/x[1]),n:x[1]}:null).filter(Boolean);
  const good=mvR.filter(x=>x.r>=75).map(x=>MVD[x.k][1].toLowerCase());const bad=mvR.filter(x=>x.r<50).map(x=>MVD[x.k][1].toLowerCase());
  const msg=`${s.name} ${good.length?`làm chắc các câu ${good.join(", ")}`:"đang tiến bộ"}${weak.length?`; cần luyện thêm ${weak.map(w=>sk(w.k).toLowerCase()).join(" và ")}`:""}${topTags.length?` (hay ${topTags[0][0].toLowerCase()})`:""}. Ở nhà, phụ huynh có thể nhắc con đọc kỹ đề và tự giải thích lại vì sao chọn đáp án, khoảng 5 phút mỗi tối.`;
  modal(mhead(`${esc(s.full||s.name)} · cần cải thiện gì`,`ĐTB học kỳ tạm tính ${avg==null?"—":String(avg).replace(".",",")} · mức ${L?L[0]:"—"}`)+`
   <span class="flabel">Kỹ năng cần luyện</span>${weak.length?`<ul class="list">${weak.map(w=>`<li><span>${esc(sk(w.k))}</span><span class="lvchip lv${w.l}">${LVN[w.l]}</span></li>`).join("")}</ul>`:`<p class="small muted">Không có kỹ năng nào dưới mức Làm được.</p>`}
   <span class="flabel">Làm đúng theo mức vận dụng (${done.length} bài gần nhất)</span><div class="mvrow">${mvR.map(x=>`<span><span class="mv ${MVD[x.k][2]}">${MVD[x.k][0]}</span> <b class="${x.r<50?"neg-t":x.r>=75?"pos-t":""}">${x.r}%</b> <span class="muted small">${x.n} câu</span></span>`).join("")}</div>
   <span class="flabel">Lỗi sai hay gặp</span>${topTags.length?`<div class="ltags left">${topTags.map(([t,k])=>`<span class="tagl">${esc(t)} <b>${k}</b></span>`).join("")}</div>`:`<p class="small muted">Chưa có.</p>`}
   <span class="flabel">Lời nhắn gợi ý cho phụ huynh (sửa được)</span><textarea id="impMsg" rows="3">${esc(msg)}</textarea>
   <div class="mfoot"><button class="btn" data-close>Đóng</button><button class="btn pri" id="impSend">Đưa vào báo cáo phụ huynh</button></div>`,()=>{
    document.querySelector("#impSend").onclick=()=>{const a=assignsOf(c).find(x=>x.state==="done");if(!a){toast("Lớp chưa có bài đã chấm để gửi kèm.");return}const r=repOf(a,s);r.note=document.querySelector("#impMsg").value.trim();save();closeM();studentSheet(c,n);toast("Đã thêm lời nhắn vào báo cáo. Xem ở khu “Phụ huynh sẽ nhận”.")}},"wide");
}
