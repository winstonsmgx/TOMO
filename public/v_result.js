/* ===== Kết quả từng câu: học sinh × câu, mức vận dụng, lỗi sai; bài gần nhất trên trang lớp ===== */
const MVD=[["NB","Nhận biết","mv0"],["TH","Thông hiểu","mv1"],["VD","Vận dụng","mv2"],["VDC","Vận dụng cao","mv3"]];
const mvOf=it=>MVD[Math.max(0,Math.min(3,(it.rub&&it.rub.B!=null)?it.rub.B:1))];
const ERR_BY_SKILL={"NP.CC.05":"Chưa lùi thì","NP.CC.06":"Giữ trật tự câu hỏi","NA.TA.01":"Nhầm trọng âm","NA.AM.02":"Nhầm cách phát âm","DH.DH.02":"Đọc lướt, bắt nhầm chi tiết","DH.DH.03":"Suy luận quá lên","DH.DD.01":"Chọn từ sai ngữ cảnh","TV.TK.02":"Nhầm dạng từ","TV.TK.01":"Sai kết hợp từ"};
const errLabel=(it,pick,i,a)=>{if(a&&a.examId===STU_EXAM&&typeof ERRT!=="undefined"&&ERRT[i]&&ERRT[i][pick])return ERRT[i][pick];if(ERR_BY_SKILL[it.skill])return ERR_BY_SKILL[it.skill];return (it.skill||"").startsWith("TV")?"Nhầm từ cùng chủ đề":"Chưa nắm kỹ năng"};
const STU_EXAM="DE_GV014_0002";
const RESP_CACHE={};
/* Bài làm từng em: đúng/sai từng câu, khớp với điểm đã có. Bài Tuấn tự làm (góc nhìn học sinh) dùng đúng đáp án em chọn. */
function respOf(a){const key=a.id+"|"+(DB.stuDone&&DB.stuDone[a.id]?"s":"");if(RESP_CACHE[key])return RESP_CACHE[key];
  const e=find(a.examId),rs=resultOf(a),n=e.items.length;
  const rows=rs.rows.map(r=>{if(!r.submitted)return {s:r.s,submitted:false,ans:[]};
    const live=r.live&&DB.stu&&DB.stu[a.id];
    if(live){const w=DB.stu[a.id];return {s:r.s,submitted:true,score:r.score,ans:e.items.map((it,i)=>{const p=w.ans[i];const ok=p===it.answer;return {ok,pick:p,tag:ok||p==null?null:errLabel(it,p,i,a)}})}}
    const k=Math.max(0,Math.min(n,Math.round(r.score/10*n)));const rr=rng((a.id+r.s.id).split("").reduce((h,ch)=>Math.imul(h^ch.charCodeAt(0),16777619)>>>0,2166136261));rr();
    const order=e.items.map((it,i)=>({i,v:pCorrect(r.s.theta,it)+(rr()-.5)*.5})).sort((x,y)=>y.v-x.v);const okSet=new Set(order.slice(0,k).map(x=>x.i));
    return {s:r.s,submitted:true,score:r.score,ans:e.items.map((it,i)=>{const ok=okSet.has(i);let pick=it.answer;if(!ok&&it.options){pick=(it.answer+1+Math.floor(rr()*3))%it.options.length}return {ok,pick:ok?it.answer:pick,tag:ok?null:errLabel(it,pick,i,a)}})}});
  const rate=e.items.map((_,i)=>{const sub=rows.filter(r=>r.submitted);return sub.length?Math.round(100*sub.filter(r=>r.ans[i].ok).length/sub.length):0});
  const tags={};rows.forEach(r=>(r.ans||[]).forEach(x=>{if(x.tag)tags[x.tag]=(tags[x.tag]||0)+1}));
  return RESP_CACHE[key]={e,rows,rate,tags:Object.entries(tags).sort((x,y)=>y[1]-x[1])};
}
function latestAssign(c){const as=assignsOf(c);return as.find(a=>a.state!=="scan"&&resultOf(a).nSub>0)||null}
function miniOf(a){return DB.assigns.find(x=>x.twinOfAssign===a.id)}
/* ---- Đối chiếu mini test với BTVN: nhãn "có tự làm BTVN không" ---- */
const CMPL={"Khớp":["Khớp BTVN","pos","Điểm mini test khớp với BTVN và với năng lực đã đo: BTVN nhiều khả năng là em tự làm.",0],"Thấp hơn một chút":["Nên kiểm tra thêm","warn","Mini test thấp hơn BTVN một chút. Chưa kết luận, nên kiểm tra thêm một lần.",2],"Thấp hơn nhiều":["Cần cô xác nhận","neg","Mini test thấp hơn nhiều so với BTVN và với dự kiến theo năng lực: BTVN có thể chưa phải em tự làm. Cô hỏi lại em trước khi kết luận.",3],"Cao hơn dự kiến":["Cao hơn dự kiến","info","Mini test cao hơn dự kiến: em có thể đã tiến bộ, hệ thống nâng mức của em.",1]};
const isTwinA=a=>!!a.twinOfAssign||a.fixed==="twin12";
function sortKey(mode,r,flagW){const sc=r.score??-1;if(mode==="score")return -sc;if(mode==="low")return r.submitted?sc:99;if(mode==="flag")return -(flagW*100+ (10-sc)/10);if(mode==="name")return 0;return r.stt}
const SORTS=[["stt","Số thứ tự"],["score","Điểm cao → thấp"],["low","Điểm thấp → cao"],["flag","Cần chú ý trước"],["name","Tên A → Z"]];
function sortBar(key,cur,extra){return `<div class="sortbar"><label class="sortsel"><span class="muted small">Sắp xếp</span><select data-srtsel="${key}" aria-label="Sắp xếp bảng">${SORTS.map(([k,l])=>`<option value="${k}" ${cur===k?"selected":""}>${l}</option>`).join("")}</select></label>${extra||""}</div>`}
function selBarHtml(a){const ids=Object.keys(UI.r.sel||{});if(!ids.length)return `<div class="selbar off muted small">Chọn học sinh ở ô vuông đầu dòng để báo phụ huynh, đánh dấu cần xác nhận hoặc mở bài làm.</div>`;
  const rs=resultOf(a);const names=ids.map(id=>(rs.rows.find(x=>x.s.id===id)||{s:{name:id}}).s.name);
  return `<div class="selbar"><b>Đã chọn ${ids.length} em</b><span class="muted small">${esc(names.slice(0,4).join(", "))}${names.length>4?` và ${names.length-4} em khác`:""}</span><span class="sp"></span>${ids.length===1?`<button class="btn sm" data-sact="profile">Mở bài làm</button>`:""}<button class="btn sm" data-sact="report">Báo phụ huynh ${ids.length} em</button><button class="btn sm" data-sact="verify">Đánh dấu cần xác nhận</button><button class="btn sm ghost" data-sact="clear">Bỏ chọn</button></div>`}
function respMatrix(a,opt){opt=opt||{};const R=respOf(a),e=R.e,rs=resultOf(a);const S=UI.r.rm||{sort:"stt"};const TW=isTwinA(a);const SEL=UI.r.sel||{};
  const RS={};rs.rows.forEach(r=>RS[r.s.id]=r);const FIT={};if(!TW)fitOf(a).forEach(x=>{if(x.lvl)FIT[x.r.s.id]=x});
  const flagOf=r=>{if(TW){const c=CMPL[(RS[r.s.id]||{}).cmp];return c?c[3]:0}const f=FIT[r.s.id];return f?({hi:3,mid:2,lo:1})[f.lvl]:0};
  let rows=R.rows.map((r,i)=>Object.assign({stt:i+1},r));
  rows.sort((x,y)=>S.sort==="name"?(x.s.name||"").localeCompare(y.s.name||"","vi"):sortKey(S.sort,x,flagOf(x))-sortKey(S.sort,y,flagOf(y))||x.stt-y.stt);
  const lv=it=>LV.find(x=>x.k===lvOf(it))||LV[1];const SM=!!UI.r.showMini&&!opt.noMini&&!TW;const MP={};if(SM)R.rows.forEach(r=>{if(r.submitted)MP[r.s.id]=new Map(miniPick(a,r,10).picks.map(q=>[q.i,q.g]))});
  const sub=R.rows.filter(r=>r.submitted).length,nsel=Object.keys(SEL).length;
  return `${sortBar("rm",S.sort)}<div id="selbar">${selBarHtml(a)}</div><div class="rmwrap"><table class="rm ${TW?"tw":""}"><thead><tr class="grp"><th colspan="4" class="g1">Học sinh</th><th colspan="${TW?2:1}" class="g2">${TW?"Đối chiếu mini test với BTVN":"Cảnh báo điểm BTVN"}</th><th colspan="${e.items.length}" class="g3">Từng câu · mức vận dụng · độ khó</th></tr><tr class="hd"><th class="ck"><input type="checkbox" data-selall aria-label="Chọn tất cả em đã nộp" ${nsel&&nsel>=sub?"checked":""}></th><th class="st">STT</th><th class="nm"><button class="sortbtn ${S.sort==="name"?"on":""}" data-srt="rm:${S.sort==="name"?"stt":"name"}">Học sinh</button></th><th class="sc"><button class="sortbtn ${S.sort==="score"||S.sort==="low"?"on":""}" data-srt="rm:${S.sort==="score"?"low":"score"}">Điểm${S.sort==="score"?" ↓":S.sort==="low"?" ↑":""}</button></th>
    ${TW?`<th class="hm">BTVN</th><th class="cmpc"><button class="sortbtn ${S.sort==="flag"?"on":""}" data-srt="rm:flag" title="Mini test đối chiếu với BTVN: có khớp không">Đối chiếu BTVN${S.sort==="flag"?" ↓":""}</button></th>`:`<th class="cmpc"><button class="sortbtn ${S.sort==="flag"?"on":""}" data-srt="rm:flag" title="Điểm BTVN so với năng lực đã đo (θ, b, z)">Cảnh báo${S.sort==="flag"?" ↓":""}</button></th>`}
    ${e.items.map((it,i)=>{const m=mvOf(it);return `<th class="q" title="Câu ${i+1}: ${esc((it.stem||"").replace(/^\([^)]*\)\s*/,"").slice(0,90))} · ${m[1]} · ${lv(it).t}"><span class="qn">${i+1}</span><span class="mv ${m[2]}">${m[0]}</span><i class="dl" style="background:${lv(it).c}"></i></th>`}).join("")}</tr></thead>
    <tbody>${rows.map(r=>{const F_=FIT[r.s.id];const x0=RS[r.s.id]||{};const cm=TW?CMPL[x0.cmp]:null;const lvl=TW?(cm?({3:"hi",2:"mid",1:"lo"})[cm[3]]:null):(F_?F_.lvl:null);
      const gap=TW&&r.submitted&&x0.exp!=null?+(x0.score-x0.exp).toFixed(1):null;const vnn=v=>String(v).replace(".",",");
      const cell=TW?(r.submitted&&cm?`<span class="fitlab cm-${cm[1]}" title="${cm[2]}">${cm[0]}</span><span class="rsn">Mini test ${vnn(x0.score)} · dự kiến ${vnn(x0.exp)} theo năng lực${gap?` (${gap>0?"+":"−"}${vnn(Math.abs(gap))})`:""}${x0.home!=null?` · BTVN ${vnn(x0.home)}`:""}</span>`:`<span class="dash">—</span>`):(F_?`<span class="fitlab f-${F_.lvl}" title="${FITL[F_.lvl][1]}">${FITL[F_.lvl][0]}</span><span class="rsn">${F_.lvl==="lo"?"Sai":"Đúng"} ${F_.o}/${F_.n} câu, năng lực em kỳ vọng ${F_.E.toFixed(1).replace(".",",")}${F_.lvl==="lo"?"":`; ${F_.dk} câu khó em ít khi làm đúng`}</span>`:(r.submitted?`<span class="muted small">Bình thường</span>`:`<span class="dash">—</span>`));
      return `<tr class="${r.submitted?"":"miss"} ${lvl?"fitrow f-"+lvl:""} ${SEL[r.s.id]?"sel":""}"><td class="ck">${r.submitted?`<input type="checkbox" data-sel="${r.s.id}" aria-label="Chọn ${esc(r.s.name)}" ${SEL[r.s.id]?"checked":""}>`:""}</td><td class="st">${r.stt}</td><td class="nm"><a href="#" data-rmw="${esc(r.s.name)}">${esc(r.s.full||r.s.name)}</a></td><td class="sc">${r.submitted?`<b class="${r.score<5?"neg-t":r.score>=8?"pos-t":""}">${String(r.score).replace(".",",")}</b>`:`<span class="muted">${a.state==="open"?"Chưa nộp":"Vắng"}</span>`}</td>
      ${TW?`<td class="hm num">${x0.home==null?`<span class="dash">—</span>`:String(x0.home).replace(".",",")}</td>`:""}<td class="cmpc">${cell}</td>
      ${r.submitted?r.ans.map((x,i)=>{const mg=SM&&MP[r.s.id]&&MP[r.s.id].get(i);return (x.ok?`<td class="ok ${F_&&F_.lvl!=="lo"&&F_.ps[i]<0.5?"surp":""}" title="Câu ${i+1}: đúng${F_&&F_.lvl!=="lo"&&F_.ps[i]<0.5?` · câu khó với em (khả năng đúng ${Math.round(F_.ps[i]*100)}%)`:""}">✓</td>`:`<td class="bad" title="Câu ${i+1}: chọn ${x.pick!=null&&e.items[i].options?ABCD[x.pick]+". "+esc(e.items[i].options[x.pick]):"bỏ trống"}${x.tag?" · lỗi sai: "+esc(x.tag):""}">${x.pick!=null&&e.items[i].options?ABCD[x.pick]:"–"}</td>`).replace("<td class=\"",mg?`<td data-mg="${MG[mg][0]}" class="mgcell g-${mg} `:"<td class=\"")}).join(""):e.items.map(()=>`<td class="na"></td>`).join("")}</tr>`}).join("")}</tbody>
    <tfoot><tr><td></td><td></td><td class="nm muted">% làm đúng</td><td></td>${TW?"<td></td>":""}<td></td>${R.rate.map(v=>`<td class="rt ${v<50?"neg-t":v>=80?"pos-t":""}">${v}</td>`).join("")}</tr></tfoot></table></div>
  <div class="rmleg">${opt.noMini||TW?"":`<label class="mgtog"><input type="checkbox" id="showMini" ${SM?"checked":""}> Câu vào mini test</label>${SM?["dk","dd","sd","sk"].map(k=>`<span class="mgc g-${k}">${MG[k][0]}</span>`).join(""):""}<span class="vsep"></span>`}<span>Mức vận dụng <span class="muted">(% cả lớp làm đúng, trung bình các câu cùng mức)</span>:</span>${(()=>{const R_=respOf(a),e_=R_.e;return MVD.map((m,k)=>{const ix=e_.items.map((it,i)=>i).filter(i=>mvOf(e_.items[i])===m);if(!ix.length)return `<span class="mvoff"><span class="mv ${m[2]}">${m[0]}</span> ${m[1]}</span>`;const r=Math.round(ix.reduce((t,i)=>t+R_.rate[i],0)/ix.length);return `<span class="mvpct"><span class="mv ${m[2]}">${m[0]}</span> ${m[1]} <b class="${r<50?"neg-t":r>=80?"pos-t":""}">${r}%</b> <span class="muted">· ${ix.length} câu</span></span>`}).join(" ")})()}<span class="sp"></span><span>✓ đúng · chữ đỏ = phương án em chọn sai (rê chuột để xem lỗi sai)${Object.keys(FIT).length?` · <span class="surpk">✓</span> câu khó em làm đúng bất ngờ`:""}</span></div>`;
}
/* chọn học sinh, sắp xếp, hành động hàng loạt — dùng chung cho mọi bảng kết quả theo em */
function markVerify(a,ids){const rs=resultOf(a);let n=0;ids.forEach(id=>{const r=rs.rows.find(x=>x.s.id===id);if(!r||!r.submitted)return;if(DB.verify.some(v=>v.cls===a.cls&&v.name===r.s.name&&!v.status))return;const t=find(a.examId).title;DB.verify.push({name:r.s.name,task:(/Unit \d+/.exec(t)||[t])[0],home:r.home==null?null:r.home,cls:a.cls,exp:r.exp==null?null:r.exp,why:"Cô chọn từ kết quả: "+t,ask:"vì sao em chọn đáp án ở một số câu",clsScore:r.score,status:null});n++});save();return n}
function bindResultTools(a){if(!a)return;
  const refresh=()=>{const sb=document.querySelector("#selbar");if(sb)sb.innerHTML=selBarHtml(a);document.querySelectorAll("tr").forEach(tr=>{const c=tr.querySelector("[data-sel]");if(c)tr.classList.toggle("sel",c.checked)});const sa=document.querySelector("[data-selall]");if(sa){const cs=[...document.querySelectorAll("[data-sel]")];sa.checked=cs.length>0&&cs.every(c=>c.checked)}bindBar()};
  const bindBar=()=>{on("[data-sact]",el=>{const ids=Object.keys(UI.r.sel||{}),k=el.dataset.sact;
    if(k==="clear"){UI.r.sel={};document.querySelectorAll("[data-sel]").forEach(c=>c.checked=false);refresh();return}
    if(k==="profile"){const rs=resultOf(a);const r=rs.rows.find(x=>x.s.id===ids[0]);if(r)studentWork(a.id,r.s.name);return}
    if(k==="report"){notifyModal(a,ids);return}
    if(k==="verify"){const n=markVerify(a,ids);toast(n?`Đã đưa ${n} em vào Cần xác nhận.`:"Các em này đã ở trong Cần xác nhận.");UI.r.sel={};render()}})};
  UI.r.sel=UI.r.sel||{};document.querySelectorAll("[data-sel]").forEach(el=>el.onchange=()=>{if(el.checked)UI.r.sel[el.dataset.sel]=1;else delete UI.r.sel[el.dataset.sel];refresh()});
  /* rê chuột vào ô là hiện ngay lỗi sai (không chờ tooltip mặc định của trình duyệt) */
  {const tip=typeof simTip==="function"?simTip():null;if(tip)document.querySelectorAll("table.rm [title]").forEach(el=>{el.dataset.tt=el.getAttribute("title");el.removeAttribute("title");
    el.addEventListener("mouseenter",()=>{tip.textContent=el.dataset.tt;tip.style.display="block";const r=el.getBoundingClientRect();tip.style.left=Math.min(innerWidth-300,Math.max(8,r.left))+"px";tip.style.top=(r.bottom+6)+"px"});
    el.addEventListener("mouseleave",()=>{tip.style.display="none"})})}
  document.querySelectorAll("table.rm .fitlab").forEach(l=>l.onclick=()=>{const r=l.parentElement.querySelector(".rsn");if(r)r.classList.toggle("open")});
  const sa=document.querySelector("[data-selall]");if(sa)sa.onchange=()=>{UI.r.sel={};document.querySelectorAll("[data-sel]").forEach(c=>{c.checked=sa.checked;if(sa.checked)UI.r.sel[c.dataset.sel]=1});refresh()};
  document.querySelectorAll("[data-srtsel]").forEach(sel=>sel.onchange=()=>{if(sel.dataset.srtsel==="rm")UI.r.rm={sort:sel.value};else UI.r.ts=sel.value;render()});
  on("[data-srt]",el=>{const [k,m]=el.dataset.srt.split(":");if(k==="rm")UI.r.rm={sort:m};else UI.r.ts=m;render()});
  bindBar()}

function latestPanel(c){
  const a=latestAssign(c.id);if(!a)return `<section class="panel"><div class="empty-line">Chưa có bài nào có kết quả.</div></section>`;
  const R=respOf(a),e=R.e,rs=resultOf(a),mini=miniOf(a);const canMini=rs.nSub>0&&e.kind==="lt"&&!a.twinOfAssign&&a.fixed!=="twin12";
  const mv=[0,1,2,3].map(k=>{const ix=e.items.map((it,i)=>i).filter(i=>mvOf(e.items[i])===MVD[k]);return ix.length?{k,n:ix.length,r:Math.round(ix.reduce((s,i)=>s+R.rate[i],0)/ix.length)}:null}).filter(Boolean);
  return `<section class="panel flush latest"><div class="phead pad"><div><h2>${esc(e.title)}</h2><span class="muted small">${a.form==="giay"?"Trên giấy":"Online"} · giao ${fmtD(a.given)} · hạn ${fmtDue(a.due)} · ${rs.nSub}/${rs.size} em nộp${rs.avg!=null?` · điểm TB ${String(rs.avg).replace(".",",")}`:""}${a.state==="open"?` · <span class="teal-t">bài còn mở, số liệu cập nhật khi các em nộp thêm</span>`:""}</span></div><span class="sp"></span>
    ${a.state==="done"?`<button class="btn sm" data-nall="${a.id}" title="Xem và sửa tin cho cả lớp trước khi gửi">Báo phụ huynh cả lớp</button>`:""}<button class="btn sm" data-res="${a.id}">Chi tiết</button>${mini?`<button class="btn sm" data-res="${mini.id}">Xem mini test</button>`:canMini?`<button class="btn sm pri" id="mkMini" data-mini="${a.examId}" title="${a.state==="open"?`Dựa trên ${rs.nSub} bài đã nộp`:""}">Tạo mini test từ kết quả này</button>`:""}</div>
    ${rs.nSub>0?(isTwinA(a)?cmpNote(a):fitNote(a)):""}<div class="lsum pad">
      ${R.tags.length?`<div class="ltags"><span class="muted small">Lỗi sai nhiều nhất</span>${R.tags.slice(0,3).map(([t,n])=>`<span class="tagl">${esc(t)} <b>${n}</b></span>`).join("")}<button class="btn sm ghost" data-fix3="${a.id}">Chữa bài${a.state==="open"?` (${rs.nSub}/${rs.size} em)`:""}</button></div>`:""}</div>
    ${respMatrix(a)}</section>`;
}
function bindLatest(c){
  bindResultTools(latestAssign(c));on("[data-nall]",el=>{const a=latestAssign(c);if(a)notifyModal(a,resultOf(a).rows.filter(r=>r.submitted).map(r=>r.s.id))});const sm=document.querySelector("#showMini");if(sm)sm.onchange=()=>{UI.r.showMini=sm.checked;render()};
  on("[data-rmw]",el=>{const a=latestAssign(c);if(a)studentWork(a.id,el.dataset.rmw)});
  const mk=document.querySelector("#mkMini");if(mk)mk.onclick=()=>twinModal(mk.dataset.mini,c);
}

/* ---- Mini test dựng từ kết quả bài về nhà thật: 4 nhóm câu của từng em ---- */
function miniGroups(a,row){const R=respOf(a);return R.e.items.map((it,i)=>{const p=pCorrect(row.s.theta,it),ok=row.ans[i].ok;const easy=p>=0.75,hard=p<0.5;return {i,g:ok?(hard?"dk":easy?"dd":"dt"):(easy?"sd":hard?"sk":"st")}})}
const MG={dk:["Đ-khó","Câu khó với em mà em làm đúng: làm lại câu tương tự để kiểm chứng em hiểu thật."],dd:["Đ-dễ","Câu dễ em làm đúng: làm mốc, nếu sai cả câu này thì em đang làm ẩu hoặc mệt."],sd:["S-dễ","Câu dễ mà em làm sai: tách làm ẩu (lần này đúng) với hổng nền (lần này vẫn sai)."],sk:["S-khó","Câu khó em làm sai: xem em đã tiến bộ sau khi chữa bài chưa."]};
function miniWant(min){return min===5?{N:5,w:{dd:1,dk:2,sd:1,sk:0}}:min===15?{N:13,w:{dd:2,dk:4,sd:2,sk:1}}:{N:10,w:{dd:1,dk:3,sd:2,sk:0}}}
function miniPick(a,row,min){const R=respOf(a);const {N,w}=miniWant(min);const all=R.e.items.map((it,i)=>{const p=pCorrect(row.s.theta,it),ok=row.ans[i].ok;return {i,p,g:ok?(p<0.5?"dk":"dd"):(p>=0.75?"sd":p<0.5?"sk":"sd")}});
  const by={dk:[],dd:[],sd:[],sk:[]};all.forEach(x=>by[x.g].push(x));by.dk.sort((x,y)=>x.p-y.p);by.dd.sort((x,y)=>y.p-x.p);by.sd.sort((x,y)=>y.p-x.p);by.sk.sort((x,y)=>x.p-y.p);
  const c={};Object.keys(by).forEach(k=>c[k]=by[k].length);const take={};const cap=Math.min(N,Math.round(R.e.items.length*0.6),Object.values(w).reduce((t,x)=>t+x,0));let left=cap;["dk","dd","sd","sk"].forEach(k=>{take[k]=Math.min(c[k],w[k]);left-=take[k]});["dk","dd","sd"].forEach(k=>{const add=Math.min(left,c[k]-take[k]);take[k]+=add;left-=add});
  const picks=[];["dk","dd","sd","sk"].forEach(k=>by[k].slice(0,take[k]).forEach(x=>picks.push(x)));picks.sort((x,y)=>x.i-y.i);
  return {picks,c,take,fill:Math.max(0,N-picks.length),thin:take.dk===0,N}}
function miniPlan(examId,P){const a=assignsOf(P.cls).find(x=>x.examId===examId&&resultOf(x).nSub>0);if(!a)return `<p class="muted small">Lớp ${P.cls} chưa có bài nộp của đề này.</p>`;
  const R=respOf(a);const FZ={};fitOf(a).forEach(x=>{if(x.lvl&&x.lvl!=="lo")FZ[x.r.s.id]=x});
  const rows=R.rows.filter(r=>r.submitted).map(r=>Object.assign({r,fz:FZ[r.s.id]},miniPick(a,r,P.min))).sort((x,y)=>(y.fz?y.fz.z:-9)-(x.fz?x.fz.z:-9));
  const N=rows[0]?rows[0].N:10;const thin=rows.filter(x=>x.thin).length;const vn=x=>String(x).replace(".",",");
  const FULL=!!UI.mpFull;
  return `<div class="mplan"><p class="small">Dựng từ <b>${esc(R.e.title)}</b> (${fmtD(a.given)}, ${rows.length} em đã nộp). Mỗi em ${N} câu, chọn từ chính bài làm của em theo 4 nhóm. "Dễ" là câu em có từ 75% khả năng làm đúng, "khó" là dưới 50% (tính từ năng lực θ của em và độ khó b của câu).</p>
   <div class="mgleg">${["dk","dd","sd","sk"].map(k=>`<div><span class="mgc g-${k}">${MG[k][0]}</span><span class="small">${MG[k][1]}</span></div>`).join("")}</div>
   <div class="mpwrap"><table class="tbl compact mpt"><thead><tr><th>Học sinh</th><th class="num" title="BTVN = bài tập về nhà">Điểm BTVN</th><th>Câu lấy từ BTVN (bấm để xem từng câu và lý do)</th><th class="num">Câu mới</th></tr></thead><tbody>${rows.map(x=>`<tr class="${x.fz?"fitrow f-"+x.fz.lvl:""}"><td>${esc(x.r.s.full||x.r.s.name)}${x.fz?`<div class="sub warn-t">Điểm cao bất thường: ưu tiên kiểm chứng</div>`:x.thin?`<div class="sub warn-t">Chưa có câu Đ-khó: chỉ kết luận khi cộng dồn</div>`:""}</td><td class="num">${vn(x.r.score)}</td>
     <td><details class="mpd" ${FULL?"open":""}><summary>${x.picks.map(q=>`<span class="mgc g-${q.g}" title="Câu ${q.i+1} · ${MG[q.g][0]} · em có ${Math.round(q.p*100)}% khả năng đúng">C${q.i+1}</span>`).join("")}</summary>
       <ul class="mpwhy">${x.picks.map(q=>`<li><b>Câu ${q.i+1}</b> <span class="mgc g-${q.g}">${MG[q.g][0]}</span> ${esc((R.e.items[q.i].stem||"").slice(0,70))}${(R.e.items[q.i].stem||"").length>70?"…":""} <span class="muted">· ở BTVN ${x.r.ans[q.i].ok?"đúng":"chọn "+(x.r.ans[q.i].pick!=null&&R.e.items[q.i].options?ABCD[x.r.ans[q.i].pick]:"sai")} · khả năng đúng ${Math.round(q.p*100)}%</span></li>`).join("")}${x.fill?`<li class="muted">${x.fill} câu mới: cùng kỹ năng với các câu trên nhưng em chưa gặp, để đủ ${N} câu và em không đoán được đề lấy từ BTVN.</li>`:""}</ul></details></td>
     <td class="num">${x.fill||""}</td></tr>`).join("")}<tr class="mpspace" aria-hidden="true"><td colspan="9"></td></tr></tbody></table><div class="mpfab"><button type="button" class="btn sm pri" id="mpFull">${FULL?"Thu nhỏ":"Xem toàn màn hình"}</button></div></div>
   <p class="muted small">Mỗi câu thật được thay bằng câu cùng kỹ năng, cùng độ khó (đổi từ ngữ, ngữ cảnh, đáp án) để em không nhớ đáp án. Các câu này cũng được đánh dấu trong bảng kết quả bài gần nhất (bật "Câu vào mini test"). ${thin?`${thin} em chưa có câu Đ-khó nào nên lần này chỉ ghi nhận, chưa kết luận.`:""}</p></div>`;
}
/* ---- Dự báo trước mini test: điểm BTVN (bài tập về nhà) có khớp với năng lực đã đo (θ) không ----
   θ (theta) = năng lực em đo từ các bài trước; b = độ khó câu; p = khả năng em làm đúng câu đó = 0,25 + 0,75/(1+e^-(θ-b)).
   Điểm kỳ vọng E = tổng p; z = (số câu đúng − E) / căn(tổng p(1−p)). z ≥ 2: cao hơn hẳn mức em thường làm được. */
function fitOf(a){const R=respOf(a);return R.rows.filter(r=>r.submitted).map(r=>{const ps=R.e.items.map(it=>pCorrect(r.s.theta,it));const E=ps.reduce((t,x)=>t+x,0),V=ps.reduce((t,x)=>t+x*(1-x),0);const o=r.ans.filter(x=>x.ok).length;
  const dk=r.ans.filter((x,i)=>x.ok&&ps[i]<0.5).length,sd=r.ans.filter((x,i)=>!x.ok&&ps[i]>=0.75).length;const z=(o-E)/Math.sqrt(V||1);
  const lvl=z>=2?"hi":z>=1.5&&dk>=2?"mid":z<=-2?"lo":null;return {r,z,E,o,n:ps.length,dk,sd,lvl,ps}})}
const FITL={hi:["Điểm cao bất thường","Đúng nhiều hơn hẳn mức em thường làm được (z ≥ 2). Nên kiểm chứng bằng mini test."],mid:["Đúng nhiều câu khó","Điểm hơi cao so với năng lực (z ≥ 1,5) và đúng từ 2 câu khó trở lên. Nên kiểm chứng."],lo:["Thấp hơn sức","Sai nhiều câu em thường làm được (z ≤ −2): có thể làm vội, bỏ dở hoặc đang gặp vấn đề. Nên hỏi em."]};
function fitNote(a){const ALL=fitOf(a),F=ALL.filter(x=>x.lvl&&x.lvl!=="lo").sort((x,y)=>y.z-x.z),LO=ALL.filter(x=>x.lvl==="lo");
  if(!F.length)return `<div class="fitn pad"><div class="notice ${LO.length?"info":"ok"} small"><b>Không em nào có điểm BTVN cao bất thường so với năng lực đã đo</b> (đã kiểm ${ALL.length} bài nộp).${LO.length?` ${LO.length} em thấp hơn sức: ${LO.map(x=>`<a href="#" data-rmw="${esc(x.r.s.name)}">${esc(x.r.s.full||x.r.s.name)}</a>`).join(", ")}. Có thể em làm vội hoặc bỏ dở; nên hỏi em.`:""}</div></div>`;const vn=x=>x.toFixed(1).replace(".",",");
  return `<div class="fitn pad"><div class="notice warn"><b>${F.length} em có điểm BTVN cao bất thường so với năng lực đã đo.</b> Nên kiểm chứng bằng mini test trước khi ghi nhận. Đây chưa phải kết luận gian lận: em có thể đã tiến bộ thật, hoặc được người khác giúp.
   <div class="fitl">${F.map(x=>`<button class="fitc f-${x.lvl}" data-rmw="${esc(x.r.s.name)}" title="Kỳ vọng ${vn(x.E)}/${x.n} câu đúng, thực tế ${x.o}. Đúng ${x.dk} câu khó mà em thường chỉ có dưới 50% khả năng làm đúng.">${esc(x.r.s.full||x.r.s.name)} <span class="num">dự kiến ${vn(x.E)} câu · làm đúng ${x.o}/${x.n}</span></button>`).join("")}</div>
   <details class="small"><summary>Cách tính</summary>Mỗi câu có độ khó b; mỗi em có năng lực θ (theta) đo từ các bài trước. Từ θ và b tính được khả năng em làm đúng từng câu, cộng lại thành số câu đúng kỳ vọng. z (độ lệch chuẩn hoá) = (số câu đúng thực tế − kỳ vọng) / độ dao động bình thường. Cảnh báo khi z ≥ 2, hoặc z ≥ 1,5 và em đúng từ 2 câu khó trở lên. So với chính em, không so với bạn, nên em giỏi làm tốt không bị cảnh báo.</details></div></div>`}

/* ---- Từng câu: thấy nội dung câu, bấm mở ra biết em nào chọn gì ---- */
function itemBreakdown(a){const R=respOf(a),e=R.e;const sub=R.rows.filter(r=>r.submitted);const op=UI.r.ib||{};
  const nm=r=>esc(r.s.name);
  return `<section class="panel flush ibd"><div class="phead pad"><h2>Từng câu</h2><span class="muted">${sub.length} em đã nộp · bấm vào câu để xem em nào chọn gì</span><span class="sp"></span><button class="btn sm ghost" id="ibAll">${Object.keys(op).length?"Thu gọn tất cả":"Mở tất cả"}</button></div>
  ${e.items.map((it,i)=>{const m=mvOf(it);const rate=R.rate[i];const right=sub.filter(r=>r.ans[i].ok);
    const opts=it.options?it.options.map((o,k)=>{const who=sub.filter(r=>r.ans[i].pick===k);const tag=k!==it.answer&&who.length?who[0].ans[i].tag:null;return {k,o,who,tag}}):null;
    const blank=sub.filter(r=>!r.ans[i].ok&&(r.ans[i].pick==null||!it.options));
    const top=opts?opts.filter(x=>x.k!==it.answer&&x.who.length).sort((x,y)=>y.who.length-x.who.length)[0]:null;
    return `<details class="ibq" data-ibq="${i}" ${op[i]?"open":""}><summary><span class="qn">Câu ${i+1}</span><span class="mv ${m[2]}" title="${m[1]}">${m[0]}</span>
      <span class="ibstem">${esc((it.stem||"").replace(/^\([^)]*\)\s*/,""))}${it.options?` <span class="ibans">→ ${ABCD[it.answer]}. ${esc(it.options[it.answer])}</span>`:` <span class="ibans">→ ${esc(it.answer)}</span>`}</span>
      <span class="ibrate"><b class="${rate<50?"neg-t":rate>=80?"pos-t":""}">${rate}%</b> đúng${top?`<span class="sub">Sai nhiều nhất: ${ABCD[top.k]} (${top.who.length} em)</span>`:""}</span></summary>
      <div class="ibbody">${opts?opts.map(x=>`<div class="ibopt ${x.k===it.answer?"right":x.who.length?"wrong":""}"><div class="ibh"><span class="ol">${ABCD[x.k]}</span><span>${esc(x.o)}</span>${x.k===it.answer?`<span class="pill pos">Đáp án</span>`:x.tag?`<span class="tagl">${esc(x.tag)}</span>`:""}<span class="sp"></span><b class="num">${x.who.length}</b><span class="muted small">em</span></div>
        ${x.who.length?`<div class="ibwho">${x.who.map(r=>`<a href="#" data-rmw="${nm(r)}">${esc(r.s.full||r.s.name)}</a>`).join("")}</div>`:""}</div>`).join(""):
        `<div class="ibopt right"><div class="ibh"><span>Đúng</span><span class="sp"></span><b class="num">${right.length}</b><span class="muted small">em</span></div><div class="ibwho">${right.map(r=>`<a href="#" data-rmw="${nm(r)}">${esc(r.s.full||r.s.name)}</a>`).join("")}</div></div>`}
        ${blank.length?`<div class="ibopt wrong"><div class="ibh"><span>${it.options?"Bỏ trống":"Chưa đúng"}</span><span class="sp"></span><b class="num">${blank.length}</b><span class="muted small">em</span></div><div class="ibwho">${blank.map(r=>`<a href="#" data-rmw="${nm(r)}">${esc(r.s.full||r.s.name)}</a>`).join("")}</div></div>`:""}
        ${explainOf(it)?`<p class="exp small"><b>Giải thích:</b> ${esc(explainOf(it))}</p>`:""}</div></details>`}).join("")}</section>`;
}
function bindItemBreakdown(a){
  document.querySelectorAll("details.ibq").forEach(d=>d.ontoggle=()=>{UI.r.ib=UI.r.ib||{};if(d.open)UI.r.ib[d.dataset.ibq]=1;else delete UI.r.ib[d.dataset.ibq]});
  const b=document.querySelector("#ibAll");if(b)b.onclick=()=>{const n=respOf(a).e.items.length;UI.r.ib=Object.keys(UI.r.ib||{}).length?{}:Object.fromEntries([...Array(n)].map((_,i)=>[i,1]));render()};
  on(".ibd [data-rmw]",el=>studentWork(a.id,el.dataset.rmw));
}

/* ---- Báo phụ huynh ngay từ màn kết quả: từng em hoặc nhiều em, kể cả em có cảnh báo ---- */
function notifyModal(a,ids){
  if(a.state!=="done"){toast("Bài còn đang mở. Cô báo phụ huynh sau khi chấm xong.");return}
  const c=a.cls,rs=resultOf(a),TW=isTwinA(a),FT={};if(!TW)fitOf(a).forEach(f=>{if(f.lvl)FT[f.r.s.id]=f});
  const L=ids.map(id=>{const row=rs.rows.find(x=>x.s.id===id);if(!row||!row.submitted)return null;const s=row.s,r=repOf(a,s);
    const w=TW?(CMPL[row.cmp]||[0,0,0,0])[3]:(FT[id]?({hi:3,mid:2,lo:1})[FT[id].lvl]:0);
    const lab=TW?(CMPL[row.cmp]||[])[0]:(FT[id]?FITL[FT[id].lvl][0]:"");const why=TW?(CMPL[row.cmp]||[])[2]:(FT[id]?FITL[FT[id].lvl][1]:"");
    const hold=r.hold;return {s,r,row,w,lab,why,def:hold?"hold":w>=3?"hold":"send",note:w===2?"Cô sẽ cho con làm thêm một bài kiểm tra ngắn trên lớp để cô nắm chắc phần này hơn.":(r.note||"")}}).filter(Boolean);
  if(!L.length){toast("Các em đã chọn chưa nộp bài, chưa có gì để báo.");return}
  const title=find(a.examId).title;
  modal(mhead(`Báo phụ huynh · ${L.length} em`,`${esc(title)} · lớp ${c}. Mỗi phụ huynh nhận một tin Zalo; tin gửi đi không nhắc chuyện nghi ngờ hay sao chép.`)+`<div class="ntable">${L.map((x,i)=>`<div class="nrow" data-nr="${i}">
      <div class="nh"><b>${esc(x.s.full||x.s.name)}</b><span class="muted small">${TW?"Mini test":"BTVN"} ${String(x.row.score).replace(".",",")}/10</span>${x.lab&&x.w>0?`<span class="fitlab ${TW?"cm-"+(CMPL[x.row.cmp][1]):"f-"+(FT[x.s.id].lvl)}">${esc(x.lab)}</span>`:""}${x.s.zalo===false?`<span class="pill warn">Chưa liên kết Zalo</span>`:""}</div>
      <div class="ncols"><div class="npv"><span class="flabel">Tin phụ huynh sẽ nhận · bấm biểu tượng bút để sửa từng dòng</span><div data-pv></div></div>
        <div class="nedit">${x.why&&x.w>0?`<p class="small muted nwhy"><b>Chỉ cô thấy:</b> ${esc(x.why)}</p>`:""}<label>Cách báo<select data-nopt><option value="send" ${x.def==="send"?"selected":""}>Gửi kết quả bình thường</option><option value="hold" ${x.def==="hold"?"selected":""}>Tạm giữ, đưa vào Cần xác nhận</option><option value="skip">Chưa báo</option></select></label></div></div></div>`).join("")}</div>
    <div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="nGo">Tiếp tục</button></div>`,()=>{
    document.querySelectorAll(".nrow").forEach(row=>{const x=L[+row.dataset.nr];const box=row.querySelector("[data-pv]");
      const pv=()=>{box.innerHTML=znsEdit(a,x.s,x.r,(DB.noteAll||{})[c],x.note);box.querySelectorAll("[data-pen]").forEach(pb=>pb.onclick=()=>{const f=pb.dataset.pen,cell=pb.closest(".ecell"),cur=f==="note"?x.note:x.r[f];cell.innerHTML=`<input type="text" class="einp" value="${esc(cur||"")}" ${f==="note"?'placeholder="Ví dụ: cô sẽ gọi trao đổi với phụ huynh"':""}><button type="button" class="pen ok" aria-label="Xong">✓</button>`;const inp=cell.querySelector("input");inp.focus();const done=()=>{if(f==="note")x.note=inp.value.trim();else x.r[f]=inp.value.trim()||x.r[f];pv()};cell.querySelector("button").onclick=done;inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();done()}else if(e.key==="Escape"){e.stopPropagation();pv()}}})};pv()});
    document.querySelector("#nGo").onclick=()=>{const send=[],holds=[];
      document.querySelectorAll(".nrow").forEach(row=>{const x=L[+row.dataset.nr];const v=row.querySelector("[data-nopt]").value;x.r.note=x.note||undefined;if(v==="send")send.push(x.s.name);else if(v==="hold")holds.push(x.s.id)});
      if(holds.length)markVerify(a,holds);save();closeM();
      if(send.length)sendReports(c,send,()=>render(),a);else{toast(holds.length?`Đã giữ ${holds.length} em, đưa vào Cần xác nhận.`:"Chưa báo em nào.");render()}}},"wide xl");
}

/* Mockup tin Zalo sửa được tại chỗ: mỗi dòng có biểu tượng bút */
function znsEdit(a,s,r,noteAll,note){const e=find(a.examId),twin=!!a.twinOfAssign,row=r.row;
  const pen=f=>`<button type="button" class="pen" data-pen="${f}" aria-label="Sửa dòng này" title="Sửa">✎</button>`;
  const rows=[[twin?"Kiểm tra lớp":"Kết quả",twin?(row&&row.submitted?`${row.score}/10 câu đúng`:"Vắng"):(row&&row.submitted?`${row.score}/10`:"Chưa nộp")],...(twin?[["So với BTVN",row&&row.cmp==="Khớp"?"Khớp":"Cô sẽ cập nhật sau"]]:[["Nộp bài",row&&row.submitted?"Đúng hạn":"Chưa nộp"]])];
  const ed=[["Làm tốt","lam_tot",r.lam_tot],["Cần luyện","can_luyen",r.can_luyen],["Gợi ý ở nhà","goi_y",r.goi_y]];
  return `<div class="phone" data-ui><div class="zmsg"><b>${twin?"Kết quả kiểm tra trên lớp":"Kết quả bài tập"} của ${esc(s.name)}</b><p>Kính gửi phụ huynh em ${esc(s.name)}, lớp ${a.cls}. Cô ${MY_NAME} gửi kết quả bài ${esc(e.title)}:</p><table>${rows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join("")}${ed.map(x=>`<tr><td>${x[0]}</td><td><span class="ecell"><span class="ev">${esc(x[2])}</span>${pen(x[1])}</span></td></tr>`).join("")}</table><span class="zbtn">Xem chi tiết</span></div>
  <div class="zmsg"><span class="sub">Lời nhắn của cô${noteAll?" · kèm ghi chú chung của lớp":""}</span><p><span class="ecell"><span class="ev">${note?esc(note):`<i class="muted">Chưa có lời nhắn</i>`}</span>${pen("note")}</span></p></div></div>`}

/* ---- Sau mini test: tóm tắt em nào đáng nghi theo đối chiếu với BTVN (thay cho tóm tắt BTVN) ---- */
function cmpNote(a){const rs=resultOf(a),rows=rs.rows.filter(r=>r.submitted&&CMPL[r.cmp]);const by=k=>rows.filter(r=>r.cmp===k);
  const hi=by("Thấp hơn nhiều"),mid=by("Thấp hơn một chút"),up=by("Cao hơn dự kiến"),ok=by("Khớp");
  const chip=(r,cls)=>`<button class="fitc ${cls}" data-rmw="${esc(r.s.name)}" title="${esc(CMPL[r.cmp][2])}">${esc(r.s.full||r.s.name)} <span class="num">BTVN ${r.home??"—"} · mini ${r.score}</span></button>`;
  if(!hi.length&&!mid.length)return `<div class="fitn pad"><div class="notice ok small"><b>Mini test khớp BTVN ở tất cả ${rows.length} em đã làm.</b> Không em nào đáng nghi.${up.length?` ${up.length} em làm mini test tốt hơn dự kiến: ${up.map(r=>esc(r.s.name)).join(", ")}.`:""}</div></div>`;
  return `<div class="fitn pad"><div class="notice warn"><b>${hi.length+mid.length} em có BTVN cao hơn hẳn mini test trên lớp</b> (${rows.length} em có cả BTVN và mini test: ${ok.length} khớp${up.length?`, ${up.length} cao hơn dự kiến`:""}). BTVN của các em này có thể chưa phải tự làm; chưa kết luận, cô hỏi lại em trước.
   ${hi.length?`<div class="fitl"><span class="fitk">Cần cô xác nhận</span>${hi.map(r=>chip(r,"f-hi")).join("")}</div>`:""}
   ${mid.length?`<div class="fitl"><span class="fitk">Nên kiểm tra thêm</span>${mid.map(r=>chip(r,"f-mid")).join("")}</div>`:""}
   ${up.length?`<p class="small muted">Làm mini test tốt hơn dự kiến (có thể đã tiến bộ): ${up.map(r=>esc(r.s.full||r.s.name)).join(", ")}.</p>`:""}</div></div>`}
