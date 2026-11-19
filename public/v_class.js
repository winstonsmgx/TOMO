/* ===== Trang lớp: bài đã giao, kết quả, báo cáo, cần xác nhận, phụ huynh ===== */
const SK9=["NP.TH.04","TV.TK.02","TV.TK.01","GT.HT.02","NA.TA.01"];
function skillsOf(c){return cls(c).grade===9?SK9:D.SK12}
function masteryOf(c,s){if(c==="8A3"&&D.MASTERY[s.name])return D.MASTERY[s.name];const r=rng(s.id.split("").reduce((a,ch)=>a*31+ch.charCodeAt(0),3));return skillsOf(c).map(()=>Math.max(0,Math.min(3,Math.round(s.theta+1.4+(r()-.5)*1.4))))}
const tamtinh=(c,s)=>c==="8A3"?D.TAMTINH.includes(s.name):cls(c).isNew;
const LVN=["Chưa làm được","Đang luyện","Làm được","Thành thạo"];

VIEWS.class={
  html(){
    const c=cls(UI.r.cls),t=UI.r.tab||"assign";const todo=todoOf(c.id);const pend=DB.verify.filter(v=>v.cls===c.id&&!v.status).length;
    const tabsHtml=tabs([["assign","Bài đã giao",assignsOf(c.id).length],["report","Báo cáo lớp"],["verify","Cần xác nhận",pend],["parents","Phụ huynh"],...(DB.assigns.some(a=>a.cls===c.id&&a.mode==="canhan")||t==="personal"?[["personal","Đề của từng em"]]:[])],t==="result"?"assign":t);
    let body="";
    if(t==="assign")body=classAssigns(c);if(t==="result")body=resultView(c);if(t==="report")body=classReport(c);if(t==="verify")body=verifyView(c);if(t==="parents")body=parentsView(c);if(t==="personal")body=personalView(c);
    const ra=t==="result"&&DB.assigns.find(x=>x.id===UI.r.aid);const TABN={assign:"Bài đã giao",report:"Báo cáo lớp",verify:"Cần xác nhận",parents:"Phụ huynh",personal:"Đề của từng em",result:"Bài đã giao"};
    return `<nav class="crumb"><a href="#" data-go2="today">Hôm nay</a> ${ic("chev",12)} ${t==="assign"&&!ra?`<span>Lớp ${c.id}</span>`:`<a href="#" data-tab="assign">Lớp ${c.id}</a> ${ic("chev",12)} ${ra?`<a href="#" data-tab="assign">${TABN.assign}</a> ${ic("chev",12)} <span>${esc(find(ra.examId).title)}</span>`:`<span>${TABN[t]}</span>`}`}</nav>
    <div class="title-row"><button class="iconbtn menu" id="menuBtn" aria-label="Mở menu">${ic("cls")}</button><h1>${c.id}</h1><span class="muted">${c.size} em · Tiếng Anh ${c.grade} · ${esc(c.slot)}${c.note?" · "+esc(c.note):""}</span><span class="sp"></span><button class="btn pri" id="giveC">Giao bài cho ${c.id}</button></div>
    ${todoHiddenList(c.id).length?`<p class="lede small"><a href="#" id="hidTodo" class="muted">${todoHiddenList(c.id).length} việc đã hoãn hoặc bỏ qua</a></p>`:""}${tabsHtml}${body}`;
  },
  bind(){
    const c=UI.r.cls;document.querySelector("#giveC").onclick=()=>assignModal(null,[c]);const ht=document.querySelector("#hidTodo");if(ht)ht.onclick=e=>{e.preventDefault();hiddenTodosModal(c)};
    on("[data-tab]",el=>go({v:"class",cls:c,tab:el.dataset.tab}));on("[data-av]",el=>{UI.r.av=el.dataset.av;render()});if((UI.r.tab||"assign")==="assign"&&(UI.r.av||"latest")==="latest")bindLatest(c);if(UI.r.tab==="result"&&UI.r.aid){const a_=DB.assigns.find(x=>x.id===UI.r.aid);if(a_){if(document.querySelector(".ibd"))bindItemBreakdown(a_);bindResultTools(a_)}}on("[data-backbtn]",()=>goBack());on("[data-go2]",el=>go({v:el.dataset.go2}));
    on("[data-res]",el=>go({v:"class",cls:c,tab:"result",aid:el.dataset.res}));
    on("[data-scan]",el=>scanModal(el.dataset.scan));on("[data-print]",el=>printModal(el.dataset.print));
    on("[data-viewx]",el=>fullExam(el.dataset.viewx));on("[data-mkmini]",el=>twinModal(el.dataset.mkmini,UI.r.cls));
    const hq=document.querySelector("#hq");if(hq){hq.oninput=()=>{UI.r.hq=hq.value;clearTimeout(hq._t);hq._t=setTimeout(()=>{render();const n=document.querySelector("#hq");n.focus();n.setSelectionRange(n.value.length,n.value.length)},250)}}
    on("[data-hpick]",el=>{UI.r.hq=el.dataset.hpick;render()});
    on("[data-par]",el=>go({v:"class",cls:c,tab:"parents",aid:el.dataset.par}));
    on("[data-amenu]",el=>{const a=DB.assigns.find(x=>x.id===el.dataset.amenu);popMenu(el,[["Xem đề",()=>fullExam(a.examId)],...(a.form==="giay"?[["In phiếu đề, phiếu trả lời, đáp án",()=>printModal(a.id)]]:[]),...(a.id===STU.aid?[["Xem như học sinh Đặng Tuấn",()=>setRole("hs"),"Mở bài này ở góc nhìn của Tuấn"]]:[]),...(a.state==="scan"?[["Nhập phiếu",()=>scanModal(a.id)]]:[[a.state==="open"?"Xem tiến độ":"Xem kết quả",()=>go({v:"class",cls:c,tab:"result",aid:a.id})]]),...(a.state==="done"?[["Báo cáo phụ huynh",()=>go({v:"class",cls:c,tab:"parents",aid:a.id}),"Xem đã gửi gì, gửi tiếp"],["Chữa bài: 3 lỗi phổ biến",()=>fixModal(a.id)]]:[]),...(a.state==="done"&&a.kind==="lt"&&!DB.assigns.some(x=>x.twinOfAssign===a.id)?[["Tạo mini test",()=>twinModal(a.examId,c)]]:[]),["Rút lại bài đã giao",()=>withdrawModal(a.id),a.state==="done"?"Bài đã chấm: cân nhắc kỹ":"Đóng bài hoặc huỷ lượt giao"]])});on("[data-twin]",el=>twinModal(el.dataset.twin,c));
    on("[data-edit]",el=>go({v:"editor",id:el.dataset.edit}));
    on("[data-remind]",el=>toast(`Đã nhắc ${el.dataset.remind} trên app.`));
    on("[data-fix3]",el=>fixModal(el.dataset.fix3));
    on("[data-review]",el=>aiModal({unit:+el.dataset.unit,kind:"lt",min:15,skills:[el.dataset.review],reason:`Đề ôn cho lớp ${c}: ${sk(el.dataset.review)}.`}));
    on("[data-detail]",el=>studentWork(UI.r.aid,el.dataset.detail));
    bindAlert(c);bindVerify();bindReport();bindParents();bindPersonal();
  }
};
/* ---- Bài đã giao: biểu đồ điểm TB theo bài + lịch sử ---- */
function classAssigns(c){
  const as=assignsOf(c.id);if(!as.length)return `<section class="panel"><div class="empty-line">Lớp chưa có bài nào. Bài đầu tiên nên là một đề chung để hệ thống biết mức của từng em. <button class="btn sm pri" id="first">Giao bài đầu tiên</button></div></section>`;
  const done=as.filter(a=>a.state==="done").slice().reverse();const v=UI.r.av||"latest";
  const sw=`<div class="avsw">${seg("av",[["latest","Bài gần nhất"],["all","Kết quả tổng thể"],["hist",`Lịch sử giao bài · ${as.length}`]],v)}</div>`;
  if(v==="all")return sw+`<div class="cols2 wide-left"><section class="panel"><div class="phead"><h2>Điểm trung bình theo bài</h2><span class="muted">${done.length} bài đã chấm · thang 10</span></div>${scoreChart(done)}</section>
  <section class="panel"><div class="phead"><h2>Độ khó các bài đã giao</h2></div><ul class="list">${as.slice(0,5).map(a=>{const e=find(a.examId);return `<li><div><span>${esc(e.title)}</span><div class="sub">${fmtD(a.given)} · ${diffText(e.items)}</div></div>${diffBar(e.items,80)}</li>`}).join("")}</ul></section></div>
  ${alertPanel(c)}`;
  if(v==="hist")return sw+histTable(c,as);
  return sw+latestPanel(c);
}
function scoreChart(done){
  if(!done.length)return `<div class="empty-line">Chưa có bài nào được chấm.</div>`;
  const W=560,H=190,L=34,B=34,T=12;const n=done.length;const bw=Math.min(56,(W-L-20)/n*0.55);const step=(W-L-10)/n;
  const y=v=>T+(H-T-B)*(1-v/10);
  let s=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Điểm trung bình theo từng bài">`;
  [0,2.5,5,7.5,10].forEach(v=>{s+=`<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)" stroke-width="1"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end" class="tick">${String(v).replace(".",",")}</text>`});
  done.forEach((a,i)=>{const rs=resultOf(a);const x=L+step*i+step/2;const last=i===n-1;s+=`<rect x="${x-bw/2}" y="${y(rs.avg)}" width="${bw}" height="${y(0)-y(rs.avg)}" fill="${last?"var(--hue)":"#9aa1b1"}"><title>${esc(find(a.examId).title)}: ${rs.avg}</title></rect><text x="${x}" y="${y(rs.avg)-6}" text-anchor="middle" class="val ${last?"hue":""}">${rs.avg.toFixed(1).replace(".",",")}</text><text x="${x}" y="${H-14}" text-anchor="middle" class="tick">${fmtD(a.given)}</text>`});
  return s+`<line x1="${L}" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--text)" stroke-width="1"/></svg>`;
}
/* ---- Kết quả một lượt giao (BTVN hoặc mini test) ---- */
function resultView(c){
  const a=DB.assigns.find(x=>x.id===UI.r.aid);if(!a)return `<div class="empty-line">Không tìm thấy lượt giao.</div>`;
  const e=find(a.examId),rs=resultOf(a);const isTwin=!!a.twinOfAssign||a.fixed==="twin12";
  const head=`<div class="subhead"><div><h2>${esc(e.title)}</h2><span class="muted">${a.form==="giay"?"Trên giấy":"Online"} · giao ${fmtD(a.given)} · hạn ${fmtDue(a.due)} · <span class="mono">${a.id}</span></span></div></div>`;
  if(a.state==="scan")return head+`<section class="panel"><div class="empty-line">Phiếu giấy chưa được nhập. <button class="btn sm pri" data-scan="${a.id}">Nhập phiếu</button></div></section>`;
  const missing=rs.rows.filter(x=>!x.submitted).map(x=>x.s.name);
  if(isTwin)return head+twinResult(c,a,e,rs);
  const items=e.items;const bySk={};items.forEach((it,i)=>{(bySk[it.skill]=bySk[it.skill]||[]).push(rs.rates[i])});
  const weak=Object.entries(bySk).map(([k,v])=>[k,Math.round(v.reduce((s,x)=>s+x,0)/v.length)]).sort((x,y)=>x[1]-y[1])[0];
  const ver=n=>{const v=DB.verify.find(x=>x.cls===c.id&&x.name===n&&!x.status);if(v)return pill("Cần cô xác nhận","neg");if(c.id==="8A3"&&D.TWIN[n])return D.TWIN[n].next==="Nên kiểm tra thêm"?pill("Nên kiểm tra thêm","warn"):pill("Khớp","pos");return `<span class="muted">Chưa kiểm tra</span>`};
  const rep=n=>{const r=(DB.reports[a.id]||{})[n];return r?.status||(a.reported?"Đã nhận":"Chưa gửi")};
  return head+`<div class="kpis"><div><span class="k">Đã nộp</span><span class="v num">${rs.nSub}<span class="unit">/${rs.size}</span></span></div><div><span class="k">Điểm trung bình</span><span class="v num">${rs.avg==null?"—":rs.avg.toFixed(1)}<span class="unit">/10</span></span></div><div><span class="k">Kỹ năng yếu nhất</span><span class="v small-v">${esc(sk(weak[0]))}</span><span class="sub">${weak[1]}% câu làm đúng</span></div><div><span class="k">Điểm dự kiến trước khi giao</span><span class="v num">${expectedScore(items,ROSTER[c.id])}<span class="unit">/10</span></span></div></div>
  ${missing.length?`<div class="notice">${a.state==="open"?"Chưa nộp":"Không nộp"}: ${missing.slice(0,12).join(", ")}${missing.length>12?` và ${missing.length-12} em khác`:""}. ${a.state==="open"?`<button class="btn sm" data-remind="${missing.length} em chưa nộp">Nhắc các em</button>`:""}</div>`:""}
  ${itemBreakdown(a)}
  <section class="panel flush"><div class="phead pad"><h2>Từng em</h2><span class="muted">${rs.size} em · việc cần làm với từng em sau bài: ai cần cô kiểm tra, ai đã làm mini test trên lớp, phụ huynh đã nhận tin chưa</span></div>${sortBar("ts",UI.r.ts||"stt")}<div id="selbar">${selBarHtml(a)}</div><div class="scrolly"><table class="tbl compact"><thead><tr><th class="ck"><input type="checkbox" data-selall aria-label="Chọn tất cả em đã nộp"></th><th>Học sinh</th><th class="num">Điểm</th><th>Cảnh báo điểm BTVN</th><th class="num">Thời gian làm</th><th>Kiểm tra trên lớp</th><th>Phụ huynh</th></tr></thead><tbody>${(()=>{const FT={};fitOf(a).forEach(f=>{if(f.lvl)FT[f.r.s.id]=f});const W=x=>{if(!x.submitted)return 0;if(FT[x.s.id])return ({hi:3,mid:2,lo:1})[FT[x.s.id].lvl];if(DB.verify.some(v=>v.cls===c.id&&v.name===x.s.name&&!v.status))return 3;if(c.id==="8A3"&&D.TWIN[x.s.name]&&D.TWIN[x.s.name].next==="Nên kiểm tra thêm")return 2;return 0};const m=UI.r.ts||"stt";const rr=rs.rows.map((x,i)=>Object.assign({stt:i+1},x));rr.sort((x,y)=>m==="name"?(x.s.name||"").localeCompare(y.s.name||"","vi"):sortKey(m,x,W(x))-sortKey(m,y,W(y))||x.stt-y.stt);return rr})().map(x=>`<tr class="${(UI.r.sel||{})[x.s.id]?"sel":""}"><td class="ck">${x.submitted?`<input type="checkbox" data-sel="${x.s.id}" ${(UI.r.sel||{})[x.s.id]?"checked":""} aria-label="Chọn ${esc(x.s.name)}">`:""}</td><td><a href="#" data-detail="${x.s.name}">${esc(x.s.full||x.s.name)}</a>${x.need?`<div class="sub">Cần luyện: ${esc(x.need)}</div>`:""}</td><td class="num">${x.submitted?x.score+"<span class='unit'>/10</span>":`<span class="warn-t">${a.state==="open"?"Chưa nộp":"Không nộp"}</span>`}</td><td>${(()=>{const f=x.submitted&&fitOf(a).find(q=>q.r.s.id===x.s.id&&q.lvl);return f?`<span class="fitlab f-${f.lvl}" title="${FITL[f.lvl][1]}">${FITL[f.lvl][0]}</span>`:x.submitted?`<span class="muted small">Bình thường</span>`:`<span class="dash">—</span>`})()}</td><td class="num">${x.time?x.time+"<span class='unit'> ph</span>":`<span class="dash">—</span>`}</td><td>${x.submitted?ver(x.s.name):`<span class="dash">—</span>`}</td><td class="small">${esc(rep(x.s.name))}</td></tr>`).join("")}</tbody></table></div></section>
  ${a.state==="done"?`<div class="stick"><span class="sp"></span>${a.kind==="lt"?`<button class="btn" data-twin="${e.id}">Tạo mini test cho bài này</button>`:""}<button class="btn" data-fix3="${a.id}">Chữa bài: 3 lỗi phổ biến</button><button class="btn pri" id="toParents">Gửi báo cáo phụ huynh</button></div>`:""}`;
}
function twinResult(c,a,e,rs){
  const rows=rs.rows.filter(x=>x.submitted);const cnt=k=>rows.filter(x=>x.cmp===k).length;const conf=DB.verify.filter(v=>v.cls===c.id&&!v.status).length;
  return `<div class="kpis"><div><span class="k">Đã làm</span><span class="v num">${rs.nSub}<span class="unit">/${rs.size}</span></span></div><div class="wide"><span class="k">Đối chiếu với BTVN</span><span class="v small-v">${cnt("Khớp")} khớp · ${cnt("Thấp hơn một chút")} nên kiểm tra thêm · ${cnt("Thấp hơn nhiều")} cần cô xác nhận</span></div><div><span class="k">Phần cốt lõi: Làm được trở lên</span><span class="v num">9<span class="unit">/${rs.nSub} em</span></span><span class="sub">Câu tường thuật: câu hỏi</span></div></div>
  <div class="notice info">Cả lớp thấp hơn dự kiến một chút, có thể do đề trên lớp khó hơn hoặc các em đã quên. Hệ thống đã tính phần này trước khi so từng em. Dũng làm trên lớp tốt hơn bài nhà; hệ thống nâng mức của em.</div>
  <div class="cols2 wide-left"><section class="panel flush"><div class="phead pad"><h2>Từng em</h2></div>${sortBar("ts",UI.r.ts||"stt")}<div id="selbar">${selBarHtml(a)}</div><div class="scrolly"><table class="tbl compact"><thead><tr><th class="ck"><input type="checkbox" data-selall aria-label="Chọn tất cả em đã nộp"></th><th>Học sinh</th><th class="num" title="BTVN = bài tập về nhà">Điểm BTVN</th><th class="num">Trên lớp</th><th title="Mini test đối chiếu với BTVN: có khớp không">Đối chiếu BTVN</th><th>Hiểu bài</th><th>Việc tiếp theo</th></tr></thead><tbody>
  ${(()=>{const m=UI.r.ts||"stt";const rr=rows.map((x,i)=>Object.assign({stt:i+1},x));rr.sort((x,y)=>m==="name"?(x.s.name||"").localeCompare(y.s.name||"","vi"):sortKey(m,x,(CMPL[x.cmp]||[0,0,0,0])[3])-sortKey(m,y,(CMPL[y.cmp]||[0,0,0,0])[3])||x.stt-y.stt);return rr})().map(x=>`<tr class="${(UI.r.sel||{})[x.s.id]?"sel":""}"><td class="ck"><input type="checkbox" data-sel="${x.s.id}" ${(UI.r.sel||{})[x.s.id]?"checked":""} aria-label="Chọn ${esc(x.s.name)}"></td><td><a href="#" data-student="${x.s.name}">${esc(x.s.full||x.s.name)}</a></td><td class="num">${x.home==null?`<span class="dash">—</span>`:x.home+"<span class='unit'>/10</span>"}</td><td class="num">${x.score}<span class="unit">/10</span><div class="sub">dự kiến ${String(x.exp).replace(".",",")}</div></td><td>${CMPL[x.cmp]?`<span title="${CMPL[x.cmp][2]}">${pill(CMPL[x.cmp][0],CMPL[x.cmp][1]==="info"?"":CMPL[x.cmp][1])}</span>`:`<span class="dash">—</span>`}</td><td>${esc(x.und)}</td><td class="small">${x.next==="Cần cô xác nhận"?`<a href="#" data-tab="verify">${x.next}</a>`:esc(x.next)}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="panel"><div class="phead"><h2>Cặp câu của An</h2><span class="muted">câu BTVN và câu mini test trên lớp</span></div><table class="tbl compact"><thead><tr><th class="num">Vị trí</th><th>BTVN</th><th>Trên lớp</th><th>Ý nghĩa</th></tr></thead><tbody>${D.AN_PAIRS.map(p=>`<tr><td class="num">${p[0]}</td><td>${p[1]}</td><td class="${p[2]==="Sai"?"neg-t":""}">${p[2]}</td><td class="small">${p[3]}</td></tr>`).join("")}</tbody></table></section></div>
  <div class="stick"><span class="sp"></span><button class="btn" data-tab="verify">Mở danh sách cần xác minh (${conf})</button><button class="btn" id="toParents">Gửi báo cáo phụ huynh</button><button class="btn pri" id="giveNext">Giao bài tiếp</button></div>`;
}
function studentWork(aid,n){
  const a=DB.assigns.find(x=>x.id===aid),e=find(a.examId),rs=resultOf(a),row=rs.rows.find(x=>x.s.name===n);
  if(!row||!row.submitted){modal(mhead(`${n} chưa nộp bài`,`Hạn nộp: ${fmtDue(a.due)}.`)+`<div class="mfoot"><button class="btn" data-close>Đóng</button></div>`);return}
  const R=respOf(a),rr=R.rows.find(x=>x.s.name===n);const rows=e.items.map((q,i)=>{const x=rr.ans[i];return [i+1,x.ok?"Đúng":"Sai",q.options&&x.pick!=null?ABCD[x.pick]+". "+q.options[x.pick]:"—",x.ok?"—":(x.tag||sk(q.skill)),mvOf(q)[1]]});
  modal(mhead(`${n} · ${e.title}`,`${row.score}/10 · ${row.time||"—"} phút`)+`<table class="tbl compact"><thead><tr><th class="num">Câu</th><th>Kết quả</th><th>Em chọn</th><th>Lỗi sai</th><th>Mức vận dụng</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="num">${r[0]}</td><td class="${r[1]==="Sai"?"neg-t":""}">${r[1]}</td><td>${esc(r[2])}</td><td class="small">${esc(r[3])}</td><td class="small">${esc(r[4])}</td></tr>`).join("")}</tbody></table>
  <p class="muted small">Ghi nhận khi làm bài: ${n==="Minh"?"rời bài 1 lần (25 giây) ở câu 7.":n==="An"?"2 lần sao chép rồi rời bài.":"không có."}</p><div class="mfoot"><button class="btn" data-close>Đóng</button></div>`,null,"wide");
}
function fixModal(aid){const a=DB.assigns.find(x=>x.id===aid),e=find(a.examId),rs=resultOf(a);
  const worst=e.items.map((it,i)=>({it,i,r:respOf(a).rate[i]})).sort((x,y)=>x.r-y.r).slice(0,3);
  const R=respOf(a);const byTag={};R.rows.forEach(r=>(r.ans||[]).forEach((x,i)=>{if(!x.tag)return;const b=byTag[x.tag]=byTag[x.tag]||{n:0,q:{},who:new Set()};b.n++;b.q[i]=(b.q[i]||0)+1;b.who.add(r.s.name)}));
  const tops=Object.entries(byTag).sort((x,y)=>y[1].n-x[1].n).slice(0,3);
  modal(mhead("Chữa bài",`${a.cls} · ${esc(e.title)} · ${rs.nSub}/${rs.size} em đã nộp${a.state==="open"?" · bài còn mở đến hạn nộp, số liệu sẽ thay đổi khi các em còn lại nộp":""}`)+`<h3 class="fixh">Lỗi sai thường gặp</h3>`+tops.map(([t,b])=>`<div class="fixr"><div><b>${esc(t)}</b> <span class="muted small">· ${b.n} lượt sai · ${b.who.size} em</span></div><div class="sub">Ở các câu: ${Object.entries(b.q).sort((x,y)=>y[1]-x[1]).map(([i,n])=>`Câu ${+i+1} (${n} em)`).join(", ")}</div><div class="sub">Ví dụ: ${esc(e.items[+Object.entries(b.q).sort((x,y)=>y[1]-x[1])[0][0]].stem)}</div></div>`).join("")+`<h3 class="fixh">3 câu nhiều em sai nhất</h3>`+worst.map(w=>`<div class="fixr"><div class="sub">Câu ${w.i+1} · ${w.r}% em làm đúng · sai nhiều nhất: ${esc(rs.wrong[w.i])}</div><div>${esc(w.it.stem)}</div><div class="sub">${rs.err[w.i]!=="—"?esc(rs.err[w.i]):esc(sk(w.it.skill))}</div></div>`).join("")+`<div class="mfoot"><button class="btn" data-close>Đóng</button><button class="btn pri" id="mkRev">Tạo đề ôn</button></div>`,()=>{document.querySelector("#mkRev").onclick=()=>aiModal({unit:e.unit,kind:"lt",min:15,skills:[worst[0].it.skill],reason:`Đề ôn cho lớp ${a.cls}: ${sk(worst[0].it.skill)}.`})},"wide");
}
/* ---- Cần xác nhận ---- */
function verifyView(c){
  const pend=DB.verify.filter(v=>v.cls===c.id&&!v.status),done=DB.verify.filter(v=>v.cls===c.id&&v.status);
  const msg={tu:n=>`Đã ghi nhận. Kết quả bài về nhà của ${n} được giữ.`,khong:n=>`Đã ghi nhận. Hệ thống dùng kết quả trên lớp để chọn bài vừa sức cho ${n}.`,lai:n=>`Hệ thống sẽ thêm 2–3 câu mini test vào bài buổi sau của ${n}.`};
  return `<p class="lede">Kết quả trên lớp của các em này thấp hơn nhiều so với bài về nhà. Đây chưa phải bằng chứng; cô hỏi lại em trước khi chọn. Phụ huynh chỉ được báo khi cô đã xác nhận và việc này lặp lại.</p>
  ${pend.length>=2?`<div class="notice info">Còn ${pend.length} em chờ cô xác nhận. Nếu cô chưa xem trong 3 ngày, hệ thống sẽ kiểm tra lại các em ở buổi sau.</div>`:""}
  ${pend.length?`<section class="panel flush"><table class="tbl"><thead><tr><th>Học sinh</th><th class="num" title="BTVN = bài tập về nhà">Điểm BTVN</th><th class="num">Trên lớp</th><th>Ghi nhận khi làm bài</th><th></th></tr></thead><tbody>${pend.map(v=>`<tr><td class="idc"><a href="#" data-student="${v.name}"><b>${esc(fullOf(c.id,v.name))}</b></a><div class="sub">${esc(v.task)} · gợi ý: hỏi em ${esc(v.ask)}</div></td><td class="num">${v.home}<span class="unit">/10</span></td><td class="num"><span class="neg-t">${v.clsScore}</span><span class="unit">/10</span><div class="sub">dự kiến ${String(v.exp).replace(".",",")}</div></td><td class="small">${esc(v.why)}</td><td class="act"><button class="btn sm" data-vf="${v.name}:tu">Tự làm</button><button class="btn sm" data-vf="${v.name}:khong">Không tự làm</button><button class="btn sm pri" data-vf="${v.name}:lai">Kiểm tra lại</button></td></tr>`).join("")}</tbody></table></section>`:`<section class="panel"><div class="empty-line">Không có em nào cần cô xác nhận.</div></section>`}
  ${done.length?`<section class="panel"><div class="phead"><h2>Đã xử lý</h2></div><ul class="list">${done.map(v=>`<li><div><b>${v.name}</b> <span class="muted">${esc(msg[v.status](v.name))}</span></div><button class="btn sm ghost" data-vundo="${v.name}">Hoàn tác</button></li>`).join("")}</ul></section>`:""}`;
}
function recheckModal(c,n,v){
  const a=DB.assigns.filter(x=>x.cls===c&&x.kind==="lt"&&!x.twinOfAssign&&find(x.examId).title===v.task)[0]||DB.assigns.filter(x=>x.cls===c&&!x.twinOfAssign)[0];
  const done=(opt)=>{v.status="lai";DB.recheck[c]=DB.recheck[c]||[];if(opt==="next"&&!DB.recheck[c].includes(n))DB.recheck[c].push(n);save();closeM();render()};
  modal(mhead(`Kiểm tra lại · ${esc(fullOf(c,n))}`,"Chọn cách cô muốn xác nhận lại. Em vẫn chưa bị kết luận gì.")+`<div class="schopts">
   <label class="radio"><input type="radio" name="rk" value="next" checked><span><b>Thêm vài câu vào bài kế tiếp của lớp</b><span class="sub">Khi cô giao bài sau, TOMO gợi ý thêm 2 đến 3 câu cùng kỹ năng cho em, không tạo bài riêng. Em chuyển sang "Đã xử lý" và hệ thống nhắc cô lúc giao bài. Phù hợp khi không gấp.</span></span></label>
   <label class="radio"><input type="radio" name="rk" value="now"><span><b>Giao mini test riêng cho em ngay</b><span class="sub">Mở màn Tạo mini test từ "${esc(v.task)}"; cô chọn thời gian và giao trong hôm nay. Kết quả mới có thể đối chiếu lại với BTVN và điểm trên lớp.</span></span></label></div>
   <div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="rkOk">Tiếp tục</button></div>`,()=>{
    document.querySelector("#rkOk").onclick=()=>{const o=document.querySelector('input[name="rk"]:checked').value;if(o==="now"&&a){v.status="lai";save();closeM();render();twinModal(a.examId,c)}else done("next");if(o==="next")toast(`Hệ thống sẽ gợi ý thêm 2 đến 3 câu cho ${n} khi cô giao bài kế tiếp cho ${c}.`)}})}
function bindVerify(){
  on("[data-vf]",el=>{const [n,s]=el.dataset.vf.split(":");const c=UI.r.cls;const v=DB.verify.find(x=>x.name===n&&x.cls===c);
    if(s==="lai"){recheckModal(c,n,v);return}
    v.status=s;if(s==="khong")DB.repeatKhong[n]=(DB.repeatKhong[n]||0)+1;save();render();
    toast({tu:`Đã ghi nhận. Kết quả bài về nhà của ${n} được giữ.`,khong:`Đã ghi nhận. Hệ thống dùng kết quả trên lớp để chọn bài vừa sức cho ${n}.`,lai:`Hệ thống sẽ thêm 2–3 câu mini test vào bài buổi sau của ${n}.`}[s]+(s==="khong"&&DB.repeatKhong[n]>=2?" Việc này đã lặp lại: tin mời trao đổi đã soạn sẵn ở tab Phụ huynh.":""))});
  on("[data-vundo]",el=>{const c=UI.r.cls;const v=DB.verify.find(x=>x.name===el.dataset.vundo&&x.cls===c);if(v.status==="khong")DB.repeatKhong[v.name]--;if(v.status==="lai")DB.recheck[c]=(DB.recheck[c]||[]).filter(x=>x!==v.name);v.status=null;save();render()});
  const tp=document.querySelector("#toParents");if(tp)tp.onclick=()=>go({v:"class",cls:UI.r.cls,tab:"parents",aid:UI.r.aid});
  const gn=document.querySelector("#giveNext");if(gn)gn.onclick=()=>assignModal(null,[UI.r.cls]);
  const f=document.querySelector("#first");if(f)f.onclick=()=>assignModal(null,[UI.r.cls]);
}
/* ---- Báo cáo lớp ---- */
function classReport(c){
  const ro=ROSTER[c.id],sks=skillsOf(c.id);const M=ro.map(s=>({s,m:masteryOf(c.id,s)}));
  const ok=M.filter(x=>x.m.reduce((a,b)=>a+b,0)/x.m.length>=1.8).length;
  const skAvg=sks.map((k,j)=>({k,v:M.reduce((a,x)=>a+x.m[j],0)/M.length})).sort((a,b)=>a.v-b.v);const weak=skAvg[0];const weakN=M.filter(x=>x.m[sks.indexOf(weak.k)]<=1).length;
  const support=M.slice().sort((a,b)=>a.m.reduce((s,v)=>s+v,0)-b.m.reduce((s,v)=>s+v,0)).slice(0,2);
  const last=assignsOf(c.id).find(a=>a.state==="done");const unit=last?find(last.examId).unit:12;
  return `<p class="lede">${ok}/${ro.length} em Làm được trở lên ở các kỹ năng gần đây. Lớp yếu nhất ở "${esc(sk(weak.k))}": ${weakN} em còn ở mức Chưa làm được hoặc Đang luyện.</p>
  <div class="notice neg">Cả lớp cần ôn lại "<b>${esc(sk(weak.k))}</b>"${c.id==="8A3"?". Lỗi hay gặp: giữ trật tự câu hỏi (9 em), quên lùi thì (6 em)":""}. <button class="btn sm" data-review="${weak.k}" data-unit="${unit}">Tạo đề ôn</button>${last?` <button class="btn sm ghost" data-fix3="${last.id}">Mở phần chữa bài</button>`:""}</div>
  <div class="notice">Cần hỗ trợ: ${support.map(x=>`<a href="#" data-student="${x.s.name}">${esc(x.s.name)}</a>`).join(", ")}${c.id==="8A3"?" (Minh sai lặp lại lỗi quên lùi thì; Lan chưa nộp 2 bài liền)":""}.</div>
  ${c.id==="8A3"&&DB.ab[c.id]==null?`<div class="notice info">Đề B có điểm trung bình thấp hơn đề A 0,8 điểm. Cô có muốn quy đổi điểm? <button class="btn sm" id="abYes">Quy đổi</button> <button class="btn sm ghost" id="abNo">Giữ điểm thô</button></div>`:c.id==="8A3"?`<p class="muted small">Đề A/B: ${DB.ab[c.id]?"đã quy đổi (cách tính tạm, nhóm chưa chốt)":"giữ điểm thô"}.</p>`:""}
  <div class="rvsw">${seg("rv",[["skill","Học sinh × kỹ năng"],["grade","Sổ điểm"]],UI.r.rv||"skill")}</div>
  ${(UI.r.rv||"skill")==="grade"?gradebook(c):matrixBlock(c,M,sks,unit)}
  <div class="stick"><span class="muted small">Điểm đã đồng bộ vào sổ điểm điện tử lúc 10:24 hôm nay.</span><span class="sp"></span><button class="btn" id="printR">In</button><button class="btn pri" id="export">${(UI.r.rv||"skill")==="grade"?"Xuất sổ điểm":"Xuất báo cáo"}</button></div>`;
}
function bindReport(){
  const c=UI.r.cls;on("[data-rv]",el=>{UI.r.rv=el.dataset.rv;render()});if((UI.r.rv||"skill")==="grade")bindGradebook(c);else bindMatrix(c);const y=document.querySelector("#abYes");if(y)y.onclick=()=>{DB.ab[c]=true;save();render();toast("Đã quy đổi điểm đề B.")};const n=document.querySelector("#abNo");if(n)n.onclick=()=>{DB.ab[c]=false;save();render()};
  const ex=document.querySelector("#export");if(ex)ex.onclick=()=>exportModal(c);
  const pr=document.querySelector("#printR");if(pr)pr.onclick=()=>exportModal(c,"print");
}
/* ---- Bảng Học sinh × kỹ năng: STT, sắp xếp theo cột, lọc kết hợp nhiều điều kiện, chọn nhiều em ---- */
const LVSET={"0":[0],"1":[1],"2":[2],"3":[3],"01":[0,1],"23":[2,3]};
const LVSETN={"0":"Chưa làm được","1":"Đang luyện","2":"Làm được","3":"Thành thạo","01":"Chưa đạt (Chưa làm được hoặc Đang luyện)","23":"Đạt (Làm được hoặc Thành thạo)"};
function mxState(){UI.r.mx=UI.r.mx||{sort:{col:"stt",dir:1},conds:[],sel:[]};return UI.r.mx}
function lastDone(c){return assignsOf(c).find(a=>a.state==="done")}
function avgOf(c,s){const sc=assignsOf(c).filter(a=>a.state==="done").map(a=>resultOf(a).rows.find(x=>x.s.id===s.id)).filter(r=>r&&r.submitted).map(r=>r.score);return sc.length?+(sc.reduce((x,y)=>x+y,0)/sc.length).toFixed(1):null}
function matrixBlock(c,M,sks,unit){
  const X=mxState();const ld=lastDone(c.id);
  M.forEach((x,i)=>{x.stt=i+1;x.avg=avgOf(c.id,x.s);x.rep=ld?repOf(ld,x.s):null});
  let rows=M.filter(x=>X.conds.every(k=>LVSET[k.lv].includes(x.m[k.j])));
  const {col,dir}=X.sort;const key=x=>col==="stt"?x.stt:col==="name"?x.s.name:col==="avg"?(x.avg??-1):x.m[+col];
  rows=rows.slice().sort((a,b)=>{const ka=key(a),kb=key(b);const d=typeof ka==="string"?ka.localeCompare(kb,"vi"):ka-kb;return d*dir||a.stt-b.stt});
  const sel=new Set(X.sel);const allSel=rows.length&&rows.every(x=>sel.has(x.s.name));
  const th=(k,l,cls)=>{const on=String(col)===String(k);return `<th class="${cls||""}" aria-sort="${on?(dir>0?"ascending":"descending"):"none"}"><button class="sortbtn ${on?"on":""}" data-sort="${k}">${l}<span class="arrow">${on?(dir>0?"↑":"↓"):"↕"}</span></button></th>`};
  const repTxt=r=>!r?`<span class="dash">—</span>`:r.hold?`<span class="warn-t">Tạm giữ</span>`:!r.linked?`<span class="muted">Chưa liên kết</span>`:esc(r.status);
  return `<section class="panel flush" id="mx"><div class="phead pad"><h2>Học sinh × kỹ năng</h2><span class="muted">${rows.length}/${M.length} em${X.conds.length?` thoả ${X.conds.length>1?"cả "+X.conds.length+" điều kiện":"điều kiện"}`:""}</span><div class="legend">${LVN.map((l,i)=>`<span><i class="lv${i}"></i>${l}</span>`).join("")}<span class="muted">chữ nghiêng: tạm tính</span></div></div>
  <div class="toolbar pad-x filters"><span class="flabel inl">Lọc</span>${X.conds.map((k,i)=>`<span class="fchip">${esc(sk(sks[k.j]))}: ${esc(LVSETN[k.lv])}<button class="iconbtn sm" data-rmc="${i}" aria-label="Bỏ điều kiện này">${ic("x",12)}</button></span>`).join(X.conds.length>1?`<span class="muted small">và</span>`:"")}
    ${X.conds.length<3?`<select id="cSk" aria-label="Kỹ năng">${sks.map((k,j)=>`<option value="${j}">${esc(sk(k))}</option>`).join("")}</select><select id="cLv" aria-label="Mức">${Object.entries(LVSETN).map(([k,l])=>`<option value="${k}" ${k==="01"?"selected":""}>${l}</option>`).join("")}</select><button class="btn sm" id="cAdd">${ic("plus",12)} Thêm điều kiện</button>`:""}
    ${X.conds.length?`<button class="btn sm ghost" id="cClr">Bỏ lọc</button>`:""}</div>
  ${sel.size?`<div class="bulk pad-x"><b>Đã chọn ${sel.size} em</b><span class="sp"></span><button class="btn sm" id="bReview">Tạo đề ôn cho ${sel.size} em</button><button class="btn sm pri" id="bReport" ${ld?"":"disabled"}>Gửi báo cáo phụ huynh (${sel.size})</button><button class="btn sm ghost" id="bClr">Bỏ chọn</button></div>`:""}
  <div class="scrollx"><table class="tbl hm mx"><thead><tr><th class="ck"><input type="checkbox" id="ckAll" ${allSel?"checked":""} aria-label="Chọn tất cả em đang hiện"></th>${th("stt","STT","num stt")}${th("name","Học sinh","nm")}${sks.map((k,j)=>th(j,esc(sk(k)))).join("")}${th("avg","Điểm TB","num")}<th>Báo phụ huynh${ld?`<span class="sub">${esc(find(ld.examId).title)}</span>`:""}</th></tr></thead>
  <tbody>${rows.map(x=>`<tr class="clickrow ${sel.has(x.s.name)?"selrow":""}" data-row="${esc(x.s.name)}"><td class="ck"><input type="checkbox" data-ck="${esc(x.s.name)}" ${sel.has(x.s.name)?"checked":""} aria-label="Chọn ${esc(x.s.name)}"></td><td class="num stt">${x.stt}</td><td class="nm"><a href="#" data-student="${esc(x.s.name)}">${esc(x.s.full||x.s.name)}</a></td>${x.m.map(v=>`<td class="lv${v} ${tamtinh(c.id,x.s)?"tt":""}">${LVN[v]}</td>`).join("")}<td class="num">${x.avg==null?`<span class="dash">—</span>`:x.avg.toFixed(1)}</td><td class="small">${repTxt(x.rep)}</td></tr>`).join("")||`<tr><td colspan="${sks.length+5}"><div class="empty-line">Không có em nào thoả các điều kiện lọc.</div></td></tr>`}</tbody></table></div></section>`;
}
function bindMatrix(c){
  if(!document.querySelector("#mx"))return;const X=mxState();
  on("[data-sort]",el=>{const k=el.dataset.sort;if(String(X.sort.col)===k)X.sort.dir*=-1;else X.sort={col:k,dir:k==="stt"||k==="name"?1:1};render();document.querySelector("#mx").scrollIntoView({block:"start"})});
  const add=document.querySelector("#cAdd");if(add)add.onclick=()=>{const j=+document.querySelector("#cSk").value,lv=document.querySelector("#cLv").value;X.conds=X.conds.filter(k=>k.j!==j);X.conds.push({j,lv});X.sel=[];render();document.querySelector("#mx").scrollIntoView({block:"start"})};
  on("[data-rmc]",el=>{X.conds.splice(+el.dataset.rmc,1);render()});const cc=document.querySelector("#cClr");if(cc)cc.onclick=()=>{X.conds=[];render()};
  document.querySelectorAll("[data-ck]").forEach(cb=>{cb.onclick=ev=>ev.stopPropagation();cb.onchange=()=>{const n=cb.dataset.ck;X.sel=cb.checked?[...new Set([...X.sel,n])]:X.sel.filter(x=>x!==n);render()}});
  const all=document.querySelector("#ckAll");if(all)all.onchange=()=>{const vis=[...document.querySelectorAll("[data-ck]")].map(x=>x.dataset.ck);X.sel=all.checked?[...new Set([...X.sel,...vis])]:X.sel.filter(n=>!vis.includes(n));render()};
  document.querySelectorAll("tr.clickrow").forEach(tr=>tr.onclick=ev=>{if(ev.target.closest("input,button,a"))return;studentSheet(c,tr.dataset.row)});
  const bc=document.querySelector("#bClr");if(bc)bc.onclick=()=>{X.sel=[];render()};
  const br=document.querySelector("#bReview");if(br)br.onclick=()=>{const sks=skillsOf(c);const j=X.conds.length?X.conds[0].j:0;const ld=lastDone(c);aiModal({unit:ld?find(ld.examId).unit:12,kind:"lt",min:10,skills:[sks[j]],reason:`Đề ôn "${sk(sks[j])}" cho ${X.sel.length} em lớp ${c}: ${X.sel.join(", ")}.`})};
  const bp=document.querySelector("#bReport");if(bp)bp.onclick=()=>sendReports(c,X.sel,()=>{X.sel=[];render()});
}
/* ---- Giờ gửi báo cáo phụ huynh: cô gửi trong giờ làm việc, tin được hẹn đến buổi tối ---- */
function isSentLike(st){return ["Đã gửi","Đã nhận"].includes(st)||/^Đã hẹn/.test(st||"")}
function nowHour(){const sim=DB.settings.simHour;if(sim!=null&&sim!=="")return +sim;const d=new Date();return d.getHours()+d.getMinutes()/60}
function schedOf(){const at=DB.settings.sendAt||"19:30";const [H,M]=at.split(":").map(Number);const t=H+M/60;const h=nowHour();
  if(h>=t&&h<22)return {later:false,at,label:"ngay bây giờ"};
  return {later:true,at,label:`${at} ${h>=22?"tối mai":"tối nay"}`,status:`Đã hẹn ${at}`};}
/* Hộp chọn: hẹn giờ tối (mặc định) hoặc gửi ngay */
function sendChoice(n,title,msg,onSched,onNow,prev){const sc=schedOf();
  if(!sc.later){confirmBox(title,msg+(prev||""),"Gửi",onNow,"Xem lại");return}
  modal(mhead(title)+`<p>${msg}</p>${prev||""}<div class="schopts"><label class="radio"><input type="radio" name="sch" value="sched" checked><span><b>Hẹn gửi lúc ${sc.label}</b><span class="sub">Phụ huynh thường đang đi làm trong giờ hành chính; nhận tin buổi tối để có thời gian trò chuyện với con, nhất là khi kết quả chưa tốt.</span></span></label>
   <label class="radio"><input type="radio" name="sch" value="now"><span><b>Gửi ngay</b><span class="sub">Chỉ dùng khi tin cần đến phụ huynh trong ngày làm việc.</span></span></label></div>
   <div class="mfoot"><button class="btn" data-close>Xem lại</button><button class="btn pri" id="mOk">${sc.at?`Hẹn gửi ${n} tin`:"Gửi"}</button></div>`,()=>{
    const ok=document.querySelector("#mOk");document.querySelectorAll('input[name="sch"]').forEach(r=>r.onchange=()=>{ok.textContent=r.value==="now"&&r.checked?`Gửi ngay ${n} tin`:`Hẹn gửi ${n} tin`});
    ok.onclick=()=>{const v=document.querySelector('input[name="sch"]:checked').value;closeM();v==="now"?onNow():onSched(sc)}});}
function sendReports(c,names,after,aSel){
  const a=aSel||lastDone(c);if(!a){toast("Lớp chưa có bài nào đã chấm để báo phụ huynh.");return}
  const st=names.map(n=>ROSTER[c].find(s=>s.name===n)).filter(Boolean).map(s=>({s,r:repOf(a,s)}));
  const done={includes:isSentLike};
  const ok=st.filter(x=>x.r.linked&&!x.r.hold&&!done.includes(x.r.status)),hold=st.filter(x=>x.r.hold),nolink=st.filter(x=>!x.r.linked),already=st.filter(x=>done.includes(x.r.status));
  const notes=[hold.length?`${hold.length} em tạm giữ vì đang chờ cô xác nhận (${hold.map(x=>x.s.name).join(", ")})`:"",nolink.length?`${nolink.length} phụ huynh chưa liên kết Zalo`:"",already.length?`${already.length} em đã được báo cho bài này`:""].filter(Boolean);
  if(!ok.length){modal(mhead("Chưa gửi được tin nào",`Bài: ${esc(find(a.examId).title)}`)+`<p>${notes.join(". ")}.</p><div class="mfoot"><button class="btn" data-close>Đóng</button></div>`);return}
  const body=`Bài: ${esc(find(a.examId).title)} (${fmtD(a.given)}). Mỗi phụ huynh nhận một tin Zalo về bài của con; tin đã gửi không sửa được.${notes.length?"<br><br>Không gửi: "+esc(notes.join("; "))+".":""}`;
  const fin=msg=>{if(ROSTER[c].every(s=>{const r=DB.reports[a.id][s.name];return !r||done.includes(r.status)||r.hold||!r.linked||r.status==="Không gửi được"}))a.reported=true;save();after&&after();toast(msg)};
  sendChoice(ok.length,`Gửi báo cáo cho ${ok.length} phụ huynh`,body,sc=>{ok.forEach(x=>DB.reports[a.id][x.s.name].status=sc.status);fin(`Đã hẹn gửi ${ok.length} tin lúc ${sc.label}.`)},
    ()=>{ok.forEach(x=>DB.reports[a.id][x.s.name].status=x.s.phoneOK===false?"Không gửi được":"Đã gửi");const fail=ok.filter(x=>DB.reports[a.id][x.s.name].status==="Không gửi được").length;fin(`Đã gửi ${ok.length-fail} tin.${fail?` ${fail} tin không gửi được (số điện thoại chưa dùng Zalo).`:""}`)},
    `<div class="sprev"><span class="flabel">Nội dung từng tin (đúng như phụ huynh sẽ nhận)</span>${ok.map((x,i)=>`<details ${i===0?"open":""}><summary><b>${esc(x.s.full||x.s.name)}</b> · phụ huynh em ${esc(x.s.name)}</summary>${zns(a,x.s,x.r,(DB.noteAll||{})[c])}</details>`).join("")}</div>`);
}
function studentSheet(c,n){
  const s=ROSTER[c].find(x=>x.name===n);if(!s)return;const m=masteryOf(c,s),sks=skillsOf(c);
  const exp=+(10*(0.25+0.75*sig(s.theta+0.6))).toFixed(1);const tag=exp>=8?"Tốt":exp>=6.5?"Khá":exp>=5?"Trung bình":"Cần cố gắng";
  const zone=s.theta>1?"làm chắc câu Dễ và Trung bình, đang tiến tới câu Khó":s.theta>0.2?"làm chắc câu Dễ, còn chập chờn ở câu Trung bình, chưa vững câu Khó":"đang luyện câu Dễ, câu Trung bình còn khó với em";
  const tw=c==="8A3"&&D.TWIN[n];const doneA=assignsOf(c).filter(a=>a.state==="done");const hist=doneA.map(a=>[a,resultOf(a).rows.find(x=>x.s.id===s.id)]);
  const nSub=hist.filter(([a,r])=>r&&r.submitted).length;const avg=avgOf(c,s);const okN=m.filter(v=>v>=2).length;
  const errs=c==="8A3"&&D.HW_NEED[n]?D.HW_NEED[n]:sk(sks[m.indexOf(Math.min(...m))]);
  const ld=doneA[0];const r=ld?repOf(ld,s):null;save();
  const repState=!r?"Lớp chưa có bài đã chấm.":r.hold?"Tạm giữ: em đang chờ cô xác nhận bài về nhà. Tin sẽ gửi sau khi cô xác nhận.":!r.linked?"Phụ huynh chưa liên kết Zalo.":isSentLike(r.status)?`${r.status} cho bài này.`:r.status==="Không gửi được"?"Lần trước không gửi được: số điện thoại chưa dùng Zalo.":"Chưa gửi cho bài này.";
  const canSend=r&&r.linked&&!r.hold&&!isSentLike(r.status);
  const stCls=!r?"":r.hold||r.status==="Không gửi được"||!r.linked?"s-warn":isSentLike(r.status)?"s-pos":"s-info";
  const recent=hist.slice(0,5).filter(([a,rr])=>rr&&rr.submitted).map(([a,rr])=>[fmtD(a.given),rr.score]).reverse();
  const detailPage=`<div class="phone pdetail" data-ui><div class="pdh">Trang chi tiết · ${esc(s.full||n)}</div>
    <div class="pdsec"><span class="sub">Kết quả ${ld?esc(find(ld.examId).title):""}</span><b class="num">${r&&r.row&&r.row.submitted?String(r.row.score).replace(".",",")+"/10":"Chưa nộp"}</b></div>
    <div class="pdsec"><span class="sub">Điểm các bài gần đây</span><div class="pdbars">${recent.map(([d,v])=>`<span><i style="height:${Math.max(4,v*4)}px"></i><em>${d}</em></span>`).join("")}</div></div>
    <div class="pdsec"><span class="sub">Con đang ở mức nào</span>${sks.map((k,i)=>`<div class="pdrow"><span>${esc(sk(k))}</span><span class="lvchip lv${m[i]}">${LVN[m[i]]}</span></div>`).join("")}</div>
    <div class="pdsec"><span class="sub">Gợi ý ở nhà</span><p>${esc(r?r.goi_y:"")}</p></div></div>`;
  modal(mhead(`${s.full||n} · ${c}`,`STT ${ROSTER[c].indexOf(s)+1} · mã ${s.id}`)+`
  <div class="segh"><span class="segtag t-me">Chỉ cô thấy</span><span class="muted">Số liệu để cô theo dõi, không gửi cho phụ huynh</span></div>
  <div class="kpis"><div><span class="k">Điểm dự kiến</span><span class="v num">${String(exp).replace(".",",")}<span class="unit">/10</span></span><span class="sub">${tag}${tamtinh(c,s)?" · tạm tính":""}</span></div><div><span class="k">Kỹ năng Làm được trở lên</span><span class="v num">${okN}<span class="unit">/${sks.length}</span></span></div><div><span class="k">Bài đã nộp</span><span class="v num">${nSub}<span class="unit">/${doneA.length}</span></span></div><div><span class="k">Điểm TB các bài</span><span class="v num">${avg==null?"—":String(avg).replace(".",",")}</span></div></div>
  <section class="panel"><div class="phead"><h2>Điểm dự kiến và điểm thực tế</h2><div class="legend"><span><i style="background:var(--hue)"></i>Thực tế</span><span><i class="tick"></i>Dự kiến trước khi làm</span></div></div>${studentChart(c,s)}</section>
  <p><b>Lỗi hay gặp:</b> ${esc(errs)}. <b>Vùng câu:</b> ${n} ${zone}.${n==="Bình"?" <b>Tiến bộ:</b> +12 điểm phần trăm so với 2 tuần trước ở Câu tường thuật.":""}</p>
  <p><b>Kiểm tra trên lớp:</b> ${tw?`bài về nhà đã được kiểm tra ngày 17/11: ${tw.cmp==="Khớp"?"khớp":tw.cmp.toLowerCase()}.`:"bài về nhà chưa được kiểm tra trên lớp; kết quả đang tạm tính."}</p>
  <div class="cols2 tight"><div><span class="flabel">Mức kỹ năng</span><ul class="list">${sks.map((k,i)=>`<li><span>${esc(sk(k))}</span><span class="lvchip lv${m[i]}">${LVN[m[i]]}</span></li>`).join("")}</ul></div>
    <div><span class="flabel">Bài gần đây</span><ul class="list">${hist.slice(0,5).map(([a,rr])=>`<li><span>${esc(find(a.examId).title)}<span class="sub">${fmtD(a.given)}</span></span><span class="num">${rr&&rr.submitted?rr.score+"<span class='unit'>/10</span>":`<span class="warn-t">Không nộp</span>`}</span></li>`).join("")}</ul></div></div>
  <section class="parseg">
    <div class="parhead"><div><span class="segtag t-par">Phụ huynh sẽ nhận</span><h2>Gửi ${esc(s.parent)} qua Zalo${ld?` · ${esc(find(ld.examId).title)}`:""}</h2></div>${r?`<span class="apill ${stCls}">${esc(r.hold?"Tạm giữ":!r.linked?"Chưa liên kết Zalo":r.status)}</span>`:""}</div>
    ${r?`<div class="pargrid"><div><span class="flabel">1. Tin nhắn Zalo</span>${zns(ld,s,r,(DB.noteAll||{})[c])}</div>
      <div><span class="flabel">2. Khi bấm "Xem chi tiết"</span>${detailPage}</div>
      <div class="parnote"><span class="flabel">Phụ huynh không thấy</span><ul class="dash"><li>Điểm dự kiến của hệ thống</li><li>Thứ hạng, so sánh với bạn trong lớp</li><li>Ghi chú riêng của cô</li><li>Cảnh báo bất thường</li></ul>
        <p class="small ${r.hold?"warn-t":"muted"}">${esc(repState)}</p>
        <div class="paract"><button class="btn" id="editRep">Sửa nội dung tin</button><button class="btn pri" id="sendOne" ${canSend?"":"disabled"}>Gửi cho phụ huynh</button></div></div></div>`
    :`<div class="empty-line">${esc(repState)}</div>`}
  </section>
  <div class="mfoot"><button class="btn" data-close>Đóng</button><button class="btn" id="giveOne">Giao bài cho lớp</button></div>`,()=>{
    document.querySelector("#giveOne").onclick=()=>assignModal(null,[c]);
    const er=document.querySelector("#editRep");if(er)er.onclick=()=>{go({v:"class",cls:c,tab:"parents",aid:ld.id});setTimeout(()=>{const b=document.querySelector(`[data-prev="${n}"]`);if(b)b.click()},30)};
    const so=document.querySelector("#sendOne");if(so)so.onclick=()=>{closeM();sendReports(c,[n],()=>render())};
  },"wide");
}

/* ---- Phụ huynh ---- */
const GOOD={An:"Từ vựng về các hành tinh",Bình:"Từ vựng về các hành tinh",Thảo:"Đọc hiểu đoạn văn",Khoa:"Làm bài nhanh và đúng hạn",Dũng:"Câu tường thuật câu kể"};
const NEEDV={"Lùi thì":"Lùi thì khi kể lại lời người khác","Giữ trật tự câu hỏi, lùi thì":"Đổi câu hỏi sang câu kể khi tường thuật","Giữ trật tự câu hỏi":"Đổi câu hỏi sang câu kể khi tường thuật","Trọng âm":"Nhấn trọng âm từ 2 âm tiết"};
function repOf(a,s){DB.reports[a.id]=DB.reports[a.id]||{};const r=DB.reports[a.id][s.name]=DB.reports[a.id][s.name]||{status:a.reported?"Đã nhận":"Chưa gửi"};
  const rs=resultOf(a);const row=rs.rows.find(x=>x.s.id===s.id);const e=find(a.examId);const weakI=e.items.map((it,i)=>[it,rs.rates[i]]).sort((x,y)=>x[1]-y[1])[0];
  r.lam_tot=r.lam_tot||GOOD[s.name]||(row&&row.score>=8?"Làm bài cẩn thận, đúng hầu hết các câu":"Nộp bài đúng hạn");r.can_luyen=r.can_luyen||NEEDV[row&&row.need]||sk(weakI[0].skill);r.goi_y=r.goi_y||"Hỏi con \"Hôm nay cô hỏi gì?\" và nghe con kể lại bằng tiếng Anh";
  r.hold=DB.verify.some(v=>v.cls===a.cls&&v.name===s.name&&!v.status);r.first=s.firstReport;r.drop=s.name==="Minh"||s.name==="Phúc";r.linked=s.zalo!==false;r.should=r.hold||r.first||r.drop||!!r.note;r.row=row;return r}
function zns(a,s,r,noteAll){const e=find(a.examId);const twin=!!a.twinOfAssign;const row=r.row;
  const rows=twin?[["Kiểm tra lớp",row&&row.submitted?`${row.score}/10 câu đúng`:"Vắng"],["So với BTVN",row&&row.cmp==="Khớp"?"Khớp":"Cô sẽ cập nhật sau"],["Làm tốt",r.lam_tot],["Cần luyện",r.can_luyen],["Gợi ý ở nhà",r.goi_y]]:[["Kết quả",row&&row.submitted?`${row.score}/10`:"Chưa nộp"],["Nộp bài",row&&row.submitted?"Đúng hạn":"Chưa nộp"],["Làm tốt",r.lam_tot],["Cần luyện",r.can_luyen],["Gợi ý ở nhà",r.goi_y]];
  return `<div class="phone" data-ui><div class="zmsg"><b>${twin?"Kết quả kiểm tra trên lớp":"Kết quả bài tập"} của ${esc(s.name)}</b><p>Kính gửi phụ huynh em ${esc(s.name)}, lớp ${a.cls}. Cô ${MY_NAME} gửi kết quả bài ${esc(e.title)}:</p><table>${rows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join("")}</table><span class="zbtn">Xem chi tiết</span></div>${noteAll||r.note?`<div class="zmsg"><span class="sub">Tin tư vấn OA, nếu phụ huynh tương tác trong 48 giờ qua</span><p>${esc([noteAll,r.note].filter(Boolean).join(" · "))}</p></div>`:""}</div>`}
function parentsView(c){
  const done=assignsOf(c.id).filter(a=>a.state==="done");if(!done.length)return `<section class="panel"><div class="empty-line">Lớp chưa có bài nào đã chấm để báo phụ huynh.</div></section>`;
  const a=DB.assigns.find(x=>x.id===UI.r.aid&&x.cls===c.id&&x.state==="done")||done.find(x=>!x.reported&&find(x.examId).kind==="lt")||done.find(x=>!x.reported)||done[0];UI.r.aid=a.id;
  const f=UI.r.f||"all";const all=ROSTER[c.id].map(s=>({s,r:repOf(a,s)}));save();
  const sentLike={includes:x=>isSentLike(x)||["Đang gửi","Không gửi được"].includes(x)};const elig=all.filter(x=>x.r.linked&&!x.r.hold&&!sentLike.includes(x.r.status));
  const list=all.filter(x=>f==="all"||(f==="should"&&x.r.should)||(f==="hold"&&x.r.hold));
  const inv=Object.entries(DB.repeatKhong).filter(([n,k])=>k>=2&&ROSTER[c.id].some(s=>s.name===n)).map(([n])=>n);
  const sch=schedOf();
  const sent=all.filter(x=>["Đã gửi","Đã nhận"].includes(x.r.status)).length,fail=all.filter(x=>x.r.status==="Không gửi được").length;
  return `<div class="toolbar"><label class="inline">Bài<select id="pa">${done.map(x=>`<option value="${x.id}" ${x.id===a.id?"selected":""}>${esc(find(x.examId).title)} · ${fmtD(x.given)}${x.reported?" · đã gửi":""}</option>`).join("")}</select></label>${seg("rf",[["all",`Tất cả ${all.length}`],["should",`Nên xem ${all.filter(x=>x.r.should).length}`],["hold",`Tạm giữ ${all.filter(x=>x.r.hold).length}`]],f)}</div>
  ${sch.later?`<div class="notice">Tin gửi đi sẽ được hẹn đến ${sch.label} để phụ huynh nhận sau giờ làm. Cô vẫn chọn được Gửi ngay khi bấm gửi.</div>`:""}
  ${sent||fail?`<div class="notice ${fail?"warn":"pos"}">Đã gửi ${sent}/${sent+fail} báo cáo.${fail?` ${fail} tin chưa gửi được.`:""}</div>`:""}
  ${inv.map(n=>`<div class="notice warn"><b>Tin mời trao đổi, soạn sẵn để cô tự gửi.</b> Gửi phụ huynh ${n}: "Cô muốn trao đổi với gia đình về cách con làm bài về nhà gần đây. Phụ huynh nhắn lại để hẹn thời gian giúp cô ạ." <button class="btn sm" data-invsend="${n}">Gửi</button></div>`).join("")}
  <label>Lời nhắn cho cả lớp (không bắt buộc)<textarea id="noteAll" placeholder="Ví dụ: Tuần sau lớp ôn câu tường thuật, phụ huynh nhắc con làm bài đúng hạn giúp cô.">${esc((DB.noteAll||{})[c.id]||"")}</textarea></label>
  <p class="muted small">Lời nhắn đi qua Zalo nếu phụ huynh vừa tương tác với trang của trường; nếu không, phụ huynh xem ở trang chi tiết.</p>
  <section class="panel flush"><table class="tbl"><thead><tr><th>Học sinh</th><th>Phụ huynh</th><th>Cần cô xem</th><th>Trạng thái</th><th></th></tr></thead><tbody>
  ${list.map(({s,r})=>`<tr><td class="idc"><b>${esc(s.full||s.name)}</b><div class="sub">${r.row&&r.row.submitted?r.row.score+"/10":"Chưa nộp"}</div></td><td>${esc(s.parent)}${r.linked?"":`<div class="sub warn-t">Chưa liên kết Zalo</div>`}</td>
    <td class="small">${r.hold?`Tạm giữ: em đang chờ cô xác nhận bài về nhà. Tin sẽ gửi sau khi cô xác nhận.`:!r.linked?`<button class="btn sm ghost" data-invite="${s.name}">Gửi lời mời liên kết</button>`:r.should&&!r.seen?(r.first?"Nên xem: lần đầu nhận báo cáo":r.drop?"Nên xem: kết quả thấp hơn hẳn bài trước":"Nên xem"):r.seen?`<span class="muted">Đã xem</span>`:`<span class="dash">—</span>`}</td>
    <td>${r.status==="Không gửi được"?`<span class="neg-t">Không gửi được</span><div class="sub">Số điện thoại chưa dùng Zalo</div>`:`<span class="${r.status==="Đã nhận"?"pos-t":""}">${!r.linked?"—":r.hold?"Tạm giữ":esc(r.status)}</span>`}</td>
    <td class="act">${r.status==="Không gửi được"?`<button class="btn sm" data-fixphone="${s.name}">Sửa số</button>`:""}<button class="btn sm ghost" data-prev="${s.name}">Xem trước</button></td></tr>`).join("")}</tbody></table></section>
  <details class="panel"><summary><b>Gửi gì và không gửi gì</b></summary><p class="small"><b>Gửi:</b> kết quả bài, một điều con làm tốt, một điều cần luyện bằng lời thường, một gợi ý ở nhà khoảng 5 phút, lời nhắn của cô; sau mini test: kết quả trên lớp và "Khớp" nếu khớp.<br><b>Không gửi:</b> thứ hạng, so sánh với bạn, ký hiệu nội bộ, điểm dự kiến khi còn tạm tính, cờ chưa được cô xác nhận, chi tiết hành vi, kết luận "không tự làm" trong tin tự động.<br><b>Kết nối:</b> agent điền biến của mẫu ZNS đã được Zalo duyệt và gửi qua Zalo OA trong khung 6:00–22:00. OA đứng tên trường hay sản phẩm: nhóm chưa chốt.</p></details>
  <div class="stick"><button class="btn" id="test">Gửi thử cho tôi</button><span class="sp"></span><button class="btn pri" id="sendAll" ${elig.length?"":"disabled"}>${sch.later?`Hẹn gửi cho ${elig.length} phụ huynh`:`Gửi cho ${elig.length} phụ huynh`}</button></div>`;
}
function bindParents(){
  if(UI.r.tab!=="parents")return;const c=UI.r.cls;const a=DB.assigns.find(x=>x.id===UI.r.aid);if(!a)return;
  const pa=document.querySelector("#pa");if(pa)pa.onchange=()=>go({v:"class",cls:c,tab:"parents",aid:pa.value});
  on("[data-rf]",el=>{UI.r.f=el.dataset.rf;render()});
  document.querySelector("#noteAll").onchange=e=>{DB.noteAll[c]=e.target.value;save()};
  on("[data-invite]",el=>toast(`Đã gửi lời mời liên kết Zalo cho phụ huynh của ${el.dataset.invite} qua SMS (giả lập).`));
  on("[data-invsend]",el=>{DB.repeatKhong[el.dataset.invsend]=0;save();render();toast("Đã gửi tin mời trao đổi.")});
  on("[data-fixphone]",el=>{const n=el.dataset.fixphone;modal(mhead(`Sửa số điện thoại phụ huynh ${n}`)+`<label>Số điện thoại<input type="tel" id="ph" placeholder="09xx xxx xxx"></label><div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="mOk">Lưu và gửi lại</button></div>`,()=>{document.querySelector("#mOk").onclick=()=>{DB.reports[a.id][n].status="Đã gửi";save();closeM();render();toast("Đã gửi lại.")}})});
  on("[data-prev]",el=>{const s=ROSTER[c].find(x=>x.name===el.dataset.prev),r=repOf(a,s);r.seen=true;save();
    modal(mhead(`Xem trước · ${s.name}`,"")+`<div class="cols2 tight"><div>${zns(a,s,r,(DB.noteAll||{})[c])}</div><div>
      <label>Làm tốt<input type="text" id="z1" value="${esc(r.lam_tot)}"></label><label>Cần luyện<input type="text" id="z2" value="${esc(r.can_luyen)}"></label><label>Gợi ý ở nhà<input type="text" id="z3" value="${esc(r.goi_y)}"></label>
      <label>Lời nhắn riêng cho phụ huynh ${esc(s.name)}<textarea id="pn" placeholder="Ví dụ: Con tiến bộ nhiều ở phần từ vựng.">${esc(r.note||"")}</textarea></label><button class="btn sm ghost" id="aiRe">${ic("ai")} Soạn lại bằng TOMO</button></div></div>
      <div class="mfoot"><button class="btn" data-close>Đóng</button><button class="btn pri" id="pnSave">Lưu</button></div>`,()=>{
      document.querySelector("#pnSave").onclick=()=>{r.lam_tot=document.querySelector("#z1").value;r.can_luyen=document.querySelector("#z2").value;r.goi_y=document.querySelector("#z3").value;r.note=document.querySelector("#pn").value.trim();save();closeM();render();toast("Đã lưu.")};
      document.querySelector("#aiRe").onclick=async()=>{const b=document.querySelector("#aiRe");b.disabled=true;b.textContent="Đang soạn…";try{const t=await AI.parentText(s,{score:r.row&&r.row.score,need:r.row&&r.row.need,title:find(a.examId).title});if(t.lam_tot)document.querySelector("#z1").value=t.lam_tot;if(t.can_luyen)document.querySelector("#z2").value=t.can_luyen;if(t.goi_y)document.querySelector("#z3").value=t.goi_y;b.disabled=false;b.textContent="Soạn lại bằng TOMO"}catch(e){b.disabled=false;b.textContent="Soạn lại bằng TOMO";toast(e&&e.code==="no_ai"?"Trang chưa gọi được AI.":"Chưa soạn lại được. Cô thử lại sau.")}};
    },"wide")});
  document.querySelector("#test").onclick=()=>toast("Đã gửi thử một tin tới Zalo của cô (giả lập).");
  const sa=document.querySelector("#sendAll");if(sa)sa.onclick=()=>{
    const sentLike={includes:x=>isSentLike(x)||["Đang gửi","Không gửi được"].includes(x)};const elig=ROSTER[c].filter(s=>{const r=repOf(a,s);return r.linked&&!r.hold&&!sentLike.includes(r.status)});
    sendChoice(elig.length,`Gửi báo cáo cho ${elig.length} phụ huynh`,"Tin đã gửi không sửa được.",sc=>{elig.forEach(s=>DB.reports[a.id][s.name].status=sc.status);save();render();toast(`Đã hẹn gửi ${elig.length} tin lúc ${sc.label}.`)},()=>{
      elig.forEach(s=>DB.reports[a.id][s.name].status="Đang gửi");save();render();
      setTimeout(()=>{elig.forEach(s=>DB.reports[a.id][s.name].status=s.phoneOK===false?"Không gửi được":"Đã gửi");a.reported=true;save();render();setTimeout(()=>{elig.forEach(s=>{if(DB.reports[a.id][s.name].status==="Đã gửi")DB.reports[a.id][s.name].status="Đã nhận"});save();render()},1400)},1100)})};
}
/* ---- Đề của từng em ---- */
function personalView(c){
  const a=DB.assigns.find(x=>x.id===UI.r.aid&&x.cls===c.id)||DB.assigns.find(x=>x.cls===c.id&&x.mode==="canhan");
  if(!a)return `<section class="panel"><div class="empty-line">Lớp chưa có lượt giao "Mỗi em một đề". Chọn tuỳ chọn này trong hộp thoại Giao bài.</div></section>`;
  UI.r.aid=a.id;const open=UI.r.open;
  return `<p class="lede">${esc(find(a.examId).title)}: mỗi em một đề khác nhau, vừa sức với em.</p>
  <section class="panel flush"><table class="tbl"><thead><tr><th>Học sinh</th><th class="num">Số câu</th><th class="num">Thời gian dự kiến</th><th>Kỹ năng trọng tâm</th><th></th></tr></thead><tbody>
  ${ROSTER[c.id].map(s=>{const set=a.personal[s.name];const items=set.map(x=>DB.bank.find(b=>b.id===x.id)).filter(Boolean);const m=masteryOf(c.id,s);const weak=skillsOf(c.id)[m.indexOf(Math.min(...m))];
    return `<tr><td class="idc"><b>${esc(s.full||s.name)}</b>${tamtinh(c.id,s)?` <span class="tt muted">tạm tính</span>`:""}<div class="sub mono">${find(a.examId).id}_${s.id}</div></td><td class="num">${items.length}</td><td class="num">${minutesOf(items)}<span class="unit"> phút</span></td><td>${esc(sk(weak))}</td><td class="act"><button class="btn sm ghost" data-open="${s.name}">${open===s.name?"Thu gọn":"Xem đề"}</button></td></tr>
    ${open===s.name?`<tr class="expand"><td colspan="5">${set.map((x,k)=>{const it=DB.bank.find(b=>b.id===x.id);const pc=Math.round(100*pCorrect(s.theta,it));return `<div class="prow"><span class="muted">${x.role}</span><span>${esc(it.stem)}<span class="sub">${it.options?it.options.map((o,j)=>j===it.answer?`<b class="ink">${ABCD[j]}. ${esc(o)}</b>`:`${ABCD[j]}. ${esc(o)}`).join(" · "):`Đáp án mẫu: ${esc(it.answer)}`}</span></span><span>${lvPill(lvOf(it))}<span class="sub">${esc(s.name)} làm đúng khoảng ${pc}%</span></span><button class="btn sm ghost" data-swapp="${s.name}:${k}">Đổi câu</button></div>`}).join("")}</td></tr>`:""}`}).join("")}</tbody></table></section>`;
}
function bindPersonal(){
  on("[data-open]",el=>{UI.r.open=UI.r.open===el.dataset.open?null:el.dataset.open;render()});
  on("[data-swapp]",el=>{const [n,k]=el.dataset.swapp.split(":");const a=DB.assigns.find(x=>x.id===UI.r.aid);
    modal(mhead("Vì sao cô đổi câu này?","Lý do giúp TOMO chọn câu tốt hơn lần sau.")+seg("why",["Quá khó với em","Quá dễ","Nội dung chưa phù hợp","Lý do khác"].map(x=>[x,x]),"")+`<div class="mfoot"><button class="btn" data-close>Huỷ</button></div>`,()=>on("#layer [data-why]",b=>{
      const set=a.personal[n];const cur=DB.bank.find(x=>x.id===set[+k].id);const dir=b.dataset.why==="Quá khó với em"?-1:b.dataset.why==="Quá dễ"?1:0;
      const alt=DB.bank.filter(x=>x.type!=="rewrite"&&!set.some(s=>s.id===x.id)&&(dir===0||(dir>0?x.b>cur.b:x.b<cur.b))).sort((x,y)=>Math.abs(x.b-cur.b)-Math.abs(y.b-cur.b))[0];
      if(alt){set[+k].id=alt.id;set[+k].why=b.dataset.why;save()}closeM();render();toast(alt?"Đã đổi câu và ghi lý do.":"Ngân hàng chưa có câu phù hợp.")}))});
}
/* ---- Nhập phiếu giấy (hộp thoại) ---- */
function scanModal(aid){
  const a=DB.assigns.find(x=>x.id===aid),e=find(a.examId),ro=ROSTER[a.cls];const s=DB.scan[aid]=DB.scan[aid]||{read:[],err:0,dbl:null,cheat:{}};
  const absent=a.cls==="8A3"?["Lan","Tú"]:ro.slice(-2).map(x=>x.name);const dblName=a.cls==="8A3"?"Minh":ro[5].name;
  const draw=()=>{const M=document.querySelector("#layer .modal");if(!M)return;const missing=ro.filter(x=>!s.read.includes(x.name)).map(x=>x.name);
    M.innerHTML=mhead("Nhập phiếu giấy",`${a.cls} · ${esc(e.title)}`)+`
    <div class="cols2 tight"><div><div class="cam" data-ui>${s.running?`<div class="frame on">Phiếu của ${esc(s.read[s.read.length-1]||"")}</div>`:`<div class="frame">Đưa phiếu vào khung</div>`}</div>
      <div class="row gap">${s.read.length?"":`<button class="btn pri" id="scan" ${s.running?"disabled":""}>Bắt đầu quét</button>`}${s.running?`<span class="muted small">Đang quét liền cả tập phiếu, cô cứ đưa lần lượt từng tờ…</span>`:s.read.length?`<span class="muted small">Đã quét xong cả tập. ${s.err||s.dbl?"Còn vài tờ cần cô xem ở bên phải.":""}</span>`:`<span class="muted small">Quét liền một lượt cả tập; tờ nào có vấn đề sẽ được gom lại ở cuối.</span>`}</div></div>
    <div><div class="kpis one"><div><span class="k">Đã đọc</span><span class="v num">${s.read.length}<span class="unit">/${ro.length} phiếu</span></span>${bar(s.read.length/ro.length,1)}</div></div>
      ${!s.running&&(s.err||s.dbl)?`<p class="small"><b>Cần cô xem ${(s.err?1:0)+(s.dbl?1:0)} tờ</b> trước khi hoàn tất:</p>`:""}${s.err&&!s.running?`<div class="notice neg">Chưa đọc được ${s.err} tờ (phiếu của ${esc(s.errName||"")}, ảnh mờ). <button class="btn sm" id="retake">Chụp lại</button></div>`:""}
      ${s.dbl&&!s.running?`<div class="notice warn">Phiếu của <b>${s.dbl.name}</b>, câu ${s.dbl.q}: em tô hai ô. Cô chọn đáp án em định chọn, hoặc để trống.<div class="row gap">${s.dbl.opts.map(k=>`<button class="btn sm" data-dbl="${k}">${ABCD[k]}</button>`).join("")}<button class="btn sm ghost" data-dbl="-1">Để trống</button></div><p class="muted small">Câu để trống có tính là sai không: nhóm chưa chốt.</p></div>`:""}
      ${s.read.length&&missing.length?`<p class="small">Chưa có phiếu của: ${missing.slice(0,8).join(", ")}${missing.length>8?` và ${missing.length-8} em khác`:""}</p>`:""}
      ${s.read.length?`<div class="scrolly short"><table class="tbl compact"><thead><tr><th>Phiếu</th><th>Nghi nhìn bài</th></tr></thead><tbody>${s.read.slice().reverse().map(n=>`<tr><td>${esc(n)}</td><td><input type="checkbox" data-cheat="${esc(n)}" ${s.cheat[n]?"checked":""} aria-label="Nghi ${esc(n)} nhìn bài"></td></tr>`).join("")}</tbody></table></div>`:""}</div></div>
    <div class="mfoot"><button class="btn" data-close>Để sau</button><button class="btn pri" id="finish" ${s.read.length?"":"disabled"}>Hoàn tất (${s.read.length} phiếu)</button></div>`;
    M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);
    const sc=document.querySelector("#scan");if(sc)sc.onclick=()=>{s.running=true;draw();const order=ro.map(x=>x.name).filter(n=>!absent.includes(n)&&!s.read.includes(n));let k=0;
      const t=setInterval(()=>{if(!document.querySelector("#layer .modal")){clearInterval(t);return}
        if(k>=order.length){clearInterval(t);s.running=false;save();draw();return}
        /* quét liền một lượt cả tập phiếu; tờ mờ và phiếu tô hai ô được gom lại để cô xử lý một lần ở cuối */
        if(!s.errDone&&k===6){s.err=1;s.errDone=1;s.errName=order[k];k++;draw();return}
        if(!s.dblDone&&order[k]===dblName){s.dbl={name:dblName,q:4,opts:[1,2]};s.dblDone=1}
        s.read.push(order[k]);k++;draw()},90)};
    const rt=document.querySelector("#retake");if(rt)rt.onclick=()=>{s.err=0;if(s.errName&&!s.read.includes(s.errName))s.read.push(s.errName);save();draw();toast("Đã đọc lại tờ lỗi.")};
    on("#layer [data-dbl]",el=>{s.dbl=null;save();draw();toast(+el.dataset.dbl<0?`Đã để trống câu 4 của ${dblName}.`:`Đã chọn ${ABCD[+el.dataset.dbl]} cho câu 4 của ${dblName}.`)});
    document.querySelectorAll("[data-cheat]").forEach(c=>c.onchange=()=>{s.cheat[c.dataset.cheat]=c.checked;save()});
    document.querySelector("#finish").onclick=()=>{if(s.dbl){toast(`Còn phiếu của ${dblName} cần cô chọn đáp án.`);return}if(s.err){toast("Còn 1 tờ chưa đọc được. Cô chụp lại giúp nhé.");return}
      a.state="done";a.scanned=true;a.subFrac=s.read.length/ro.length;delete RES_CACHE[a.id];save();closeM();go({v:"class",cls:a.cls,tab:"result",aid:a.id});toast(`Đã nhập xong ${s.read.length} phiếu. Kết quả đã có trong báo cáo lớp.`)};
  };
  modal("",null,"wide");draw();
}

/* ---- Xuất báo cáo (hộp thoại; prototype chỉ hiện trạng thái) ---- */
function exportModal(c,fmt0){
  const X=mxState();const nSel=X.sel.length;const done=assignsOf(c).filter(a=>a.state==="done");
  const P={what:UI.r.rv==="grade"?"scoresAll":"scores15",fmt:fmt0||"xlsx",scope:nSel?"sel":"all",step:0};
  const WHAT=[["scores15","Bảng điểm kiểm tra 15 phút","Theo mẫu sổ điểm của trường: STT, mã HS, họ tên, điểm"],["scoresAll","Sổ điểm học kỳ","Thường xuyên, giữa kỳ, cuối kỳ và ĐTB học kỳ theo mẫu sổ điểm"],["skills","Báo cáo lớp × kỹ năng","Bảng mức kỹ năng của từng em, lỗi hay gặp của lớp"],["students","Báo cáo từng em","Mỗi em một trang: chỉ số, mức kỹ năng, bài gần đây"],["parents","Nhật ký báo cáo phụ huynh","Đã gửi gì, cho ai, lúc nào, trạng thái"]];
  const FMT=[["xlsx","Excel (.xlsx)"],["pdf","PDF"],["print","In"],["sync","Đồng bộ sổ điểm điện tử"]];
  const fname=()=>`${{scores15:"DiemKT15",scoresAll:"BangDiem",skills:"BaoCaoKyNang",students:"BaoCaoTungEm",parents:"NhatKyPhuHuynh"}[P.what]}_${c}_${TODAY.replaceAll("-","")}.${P.fmt==="xlsx"?"xlsx":"pdf"}`;
  const draw=()=>{const M=document.querySelector("#layer .modal");const n=P.scope==="sel"?nSel:ROSTER[c].length;
    if(P.step>0){const steps=P.fmt==="sync"?["Đối chiếu mã học sinh với sổ điểm","Ghi điểm vào cột KT15 lần 2","Hoàn tất"]:P.fmt==="print"?["Dựng trang in","Gửi tới máy in mặc định","Hoàn tất"]:["Lấy dữ liệu "+n+" em","Tạo file "+fname(),"Hoàn tất"];
      M.innerHTML=mhead("Xuất báo cáo",`${c} · ${esc(WHAT.find(w=>w[0]===P.what)[1])}`)+`<ul class="steps">${steps.map((t,i)=>{const fin=P.step>=steps.length-1;return `<li class="${i<P.step||fin?"done":i===P.step?"now":""}">${i<P.step||fin?"✓":i===P.step?'<span class="spin"></span>':"○"} ${esc(t)}</li>`}).join("")}</ul>
      ${P.step>=steps.length-1?`<div class="notice pos">${P.fmt==="sync"?`Đã đồng bộ điểm của ${n} em vào sổ điểm điện tử.`:P.fmt==="print"?`Đã gửi ${n} trang tới máy in.`:`Đã tạo ${esc(fname())} (${n} em).`} <span class="muted small">Prototype: chưa tạo file thật.</span></div>`:""}
      <div class="mfoot">${P.step>=steps.length-1?`<button class="btn" id="again">Xuất loại khác</button><button class="btn pri" data-close>Xong</button>`:`<button class="btn" data-close>Huỷ</button>`}</div>`;
      M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);const ag=document.querySelector("#again");if(ag)ag.onclick=()=>{P.step=0;draw()};
      if(P.step<steps.length-1)setTimeout(()=>{if(document.querySelector("#layer .modal")){P.step++;draw()}},700);return}
    M.innerHTML=mhead("Xuất báo cáo",`Lớp ${c} · ${ROSTER[c].length} em · ${done.length} bài đã chấm`)+`
    <span class="flabel">Nội dung</span><div class="choice col">${WHAT.map(([k,t,d])=>`<button class="${P.what===k?"on":""}" data-xw="${k}"><b>${t}</b><span class="sub">${d}</span></button>`).join("")}</div>
    <div class="fgrid"><div><span class="flabel">Định dạng</span>${seg("xf",FMT,P.fmt)}</div><div><span class="flabel">Học sinh</span>${seg("xs",[["all",`Cả lớp (${ROSTER[c].length})`],...(nSel?[["sel",`Các em đang chọn (${nSel})`]]:[])],P.scope)}</div></div>
    <div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="xGo">${P.fmt==="print"?"In":P.fmt==="sync"?"Đồng bộ":"Xuất file"}</button></div>`;
    M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);
    on("#layer [data-xw]",el=>{P.what=el.dataset.xw;draw()});on("#layer [data-xf]",el=>{P.fmt=el.dataset.xf;draw()});on("#layer [data-xs]",el=>{P.scope=el.dataset.xs;draw()});
    document.querySelector("#xGo").onclick=()=>{P.step=1;draw()};
  };
  modal("",null,"wide");draw();
}

function studentChart(c,s){
  const done=assignsOf(c).filter(a=>a.state==="done").slice().reverse();
  const pts=done.map(a=>{const e=find(a.examId);const r=resultOf(a).rows.find(x=>x.s.id===s.id);const ex=+(10*e.items.reduce((t,it)=>t+pCorrect(s.theta,it),0)/e.items.length).toFixed(1);return {a,e,ex,act:r&&r.submitted?r.score:null}});
  if(!pts.length)return `<div class="empty-line">Chưa có bài nào đã chấm.</div>`;
  const W=640,H=200,L=30,B=44,T=14;const step=(W-L-10)/pts.length;const bw=Math.min(36,step*0.45);const y=v=>T+(H-T-B)*(1-v/10);
  let g=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Điểm dự kiến và điểm thực tế của ${esc(s.name)}">`;
  [0,5,10].forEach(v=>{g+=`<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--grid)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" class="tick">${v}</text>`});
  pts.forEach((p,i)=>{const x=L+step*i+step/2;
    if(p.act!=null)g+=`<rect x="${x-bw/2}" y="${y(p.act)}" width="${bw}" height="${y(0)-y(p.act)}" fill="var(--hue)"><title>${esc(p.e.title)}: thực tế ${p.act}, dự kiến ${p.ex}</title></rect><text x="${x}" y="${Math.min(y(p.act),y(p.ex))-6}" text-anchor="middle" class="val ${p.act<p.ex-1.5?"neg":""}">${String(p.act).replace(".",",")}</text>`;
    else g+=`<text x="${x}" y="${y(0)-6}" text-anchor="middle" class="val">không nộp</text>`;
    g+=`<line x1="${x-bw/2-6}" x2="${x+bw/2+6}" y1="${y(p.ex)}" y2="${y(p.ex)}" stroke="var(--text)" stroke-width="2"/>`;
    g+=`<text x="${x}" y="${H-26}" text-anchor="middle" class="tick">${fmtD(p.a.given)}</text><text x="${x}" y="${H-12}" text-anchor="middle" class="tick">${p.e.kind==="kt"?"Kiểm tra":"Bài nhà"}${p.a.form==="giay"?" giấy":""}</text>`});
  g+=`<line x1="${L}" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="var(--text)"/></svg>`;
  const gaps=pts.filter(p=>p.act!=null).map(p=>({p,d:+(p.act-p.ex).toFixed(1)}));const big=gaps.filter(x=>Math.abs(x.d)>=1.5);
  return g+`<p class="small">${big.length?big.map(x=>`${esc(x.p.e.title)} (${fmtD(x.p.a.given)}): ${x.d>0?"cao":"thấp"} hơn dự kiến ${Math.abs(x.d).toString().replace(".",",")} điểm`).join("; ")+".":"Các bài đều sát điểm dự kiến (lệch dưới 1,5 điểm)."} <span class="muted">Dự kiến tính từ mức của em trước bài và độ khó từng câu.</span></p>`;
}

/* ---- Lịch sử giao bài: tìm theo em hoặc theo bài ---- */
function histTable(c,as){
  const q=UI.r.hq||"";const nq=norm(q.trim());
  const stu=nq?ROSTER[c.id].filter(s=>norm(s.full+" "+s.name+" "+s.id).includes(nq)):[];const one=stu.length===1?stu[0]:null;
  const rows=nq&&!stu.length?as.filter(a=>norm(find(a.examId).title).includes(nq)):as;
  const head=one?`<th>Bài</th><th>Giao</th><th>Hình thức</th><th>Đề của em</th><th class="num">Điểm của em</th><th class="num">TB lớp</th><th>Phụ huynh</th><th></th>`:`<th>Bài</th><th>Giao</th><th>Hạn</th><th>Hình thức</th><th class="num">Đã nộp</th><th class="num">Điểm TB</th><th>Phụ huynh</th><th>Trạng thái</th><th></th>`;
  const dueK=a=>{if(a.state!=="open")return "";const d=a.due.slice(0,10);return d<TODAY?"over":d===TODAY?"today":"ok"};
  const grpK=a=>a.state==="done"?"done":a.state==="scan"?"scan":dueK(a)==="over"?"over":"open";
  const GR={over:["Quá hạn, chưa chấm","Đã quá hạn nộp; cô nhắc em còn thiếu hoặc chốt bài","neg"],open:["Đang mở, còn hạn","Em vẫn nộp được","info"],scan:["Chờ nhập phiếu giấy","Bài giấy đã thu, cô chưa nhập kết quả","warn"],done:["Đã chấm","Có kết quả, có thể báo phụ huynh","pos"]};
  const ORD=["over","open","scan","done"];
  const sorted=one?rows:ORD.flatMap(k=>rows.filter(a=>grpK(a)===k));let lastG="";
  const body=sorted.map(a=>{const e=find(a.examId),rs=resultOf(a),gk=grpK(a),dk=dueK(a);
    const gh=!one&&gk!==lastG?(lastG=gk,`<tr class="hgrp g-${gk}"><td colspan="9"><span class="dot"></span><b>${GR[gk][0]}</b> <span class="muted small">${sorted.filter(x=>grpK(x)===gk).length} bài · ${GR[gk][1]}</span></td></tr>`):"";
    const fm=a.form==="giay"?`<span class="fm fm-giay">Giấy</span>`:`<span class="fm fm-on">Online</span>`;
    const st=gk==="over"?pill("Quá hạn","neg"):a.state==="open"?pill("Đang mở","info"):a.state==="scan"?pill("Chờ nhập phiếu","warn"):pill("Đã chấm","pos");
    const act=(a.form==="giay"?`<button class="btn sm ghost" data-print="${a.id}">In phiếu</button>`:"")+(a.state==="scan"?`<button class="btn sm pri" data-scan="${a.id}">Nhập phiếu</button>`:`<button class="btn sm" data-res="${a.id}">${a.state==="open"?"Tiến độ":"Kết quả"}</button>`)+(()=>{if(a.kind!=="lt"||e.kind!=="lt"||e.twinOf||a.twinOfAssign||a.state==="scan"||rs.nSub<1)return "";const m=typeof miniOf==="function"?miniOf(a):null;return m?`<button class="btn sm" data-res="${m.id}" title="Mini test đã giao cho lớp này">Xem mini test</button>`:`<button class="btn sm pri" data-mkmini="${a.examId}" title="${a.state==="open"?`Dựa trên ${rs.nSub} bài đã nộp`:"Dựng từ kết quả bài này"}">Tạo mini test</button>`})()+`<button class="btn sm viewbtn" data-viewx="${a.examId}">Xem đề</button><button class="iconbtn" data-amenu="${a.id}" aria-label="Thao tác khác">${ic("kebab")}</button>`;
    const titleCell=`<td class="idc"><a href="#" data-res="${a.id}"><b>${esc(e.title)}</b></a><div class="sub">${e.kind==="kt"?"Kiểm tra":"Luyện tập"} · ${e.items.length} câu${a.mode==="canhan"?" · mỗi em một đề":""}${e.twinOf?" · mini test":""}</div></td>`;
    if(one){const r=rs.rows.find(x=>x.s.id===one.id);const rep=(DB.reports[a.id]||{})[one.name];const repTxt=a.state!=="done"?`<span class="dash">—</span>`:rep?esc(rep.status):a.reported?"Đã nhận":`<span class="warn-t">Chưa gửi</span>`;
      const mine=a.mode==="canhan"&&a.personal&&a.personal[one.name]?`Đề riêng · ${a.personal[one.name].length} câu`:(DB.assigns.find(x=>x.id===a.id).twinsAdded||[]).includes(one.name)?"Đề chung + câu mini test":"Đề chung";
      return `<tr class="hr g-${gk}">${titleCell}<td class="dt">${fmtD(a.given)}</td><td>${fm}</td><td class="small">${mine}</td><td class="num">${a.state==="scan"?`<span class="dash">Chờ phiếu</span>`:r&&r.submitted?`<b>${r.score}</b><span class="unit">/10</span>`:`<span class="warn-t">${a.state==="open"?"Chưa nộp":"Không nộp"}</span>`}</td><td class="num">${a.state==="done"?scoreCell(rs.avg):`<span class="dash">—</span>`}</td><td class="small">${repTxt}</td><td class="act"><div class="acts">${act}</div></td></tr>`}
    const reps=DB.reports[a.id]||{};const got=Object.values(reps).filter(r=>["Đã gửi","Đã nhận"].includes(r.status)).length;const ph=a.state!=="done"?`<span class="dash">—</span>`:a.reported&&!got?`<a href="#" data-par="${a.id}">Đã gửi</a>`:got?`<a href="#" data-par="${a.id}">${got}/${rs.size} đã nhận</a>`:`<a href="#" data-par="${a.id}" class="warn-t">Chưa gửi</a>`;
    return gh+`<tr class="hr g-${gk}">${titleCell}<td class="dt">${fmtD(a.given)}</td><td class="dt due-${dk||"x"}">${fmtDue(a.due).replace(" · "," ")}${dk==="over"?`<span class="sub">Quá hạn</span>`:dk==="today"?`<span class="sub">Hôm nay</span>`:""}</td><td>${fm}</td><td class="num">${a.state==="scan"?`<span class="dash">—</span>`:`${rs.nSub}<span class="unit">/${rs.size}</span>`}</td><td class="num">${a.state==="done"?scoreCell(rs.avg):`<span class="dash">—</span>`}</td><td class="small">${ph}</td><td>${st}</td><td class="act"><div class="acts">${act}</div></td></tr>`}).join("");
  const hint=one?`Đang xem những gì cô đã giao cho <b>${esc(one.full)}</b> (STT ${ROSTER[c.id].indexOf(one)+1}). <a href="#" data-student="${esc(one.name)}">Mở hồ sơ em</a>`:stu.length>1?`${stu.length} em khớp: ${stu.slice(0,8).map(x=>`<a href="#" data-hpick="${esc(x.full)}">${esc(x.full)}</a>`).join(", ")}`:nq&&!rows.length?"Không có em hay bài nào khớp.":"";
  return `<section class="panel flush"><div class="phead pad"><h2>Lịch sử giao bài</h2><span class="muted">${rows.length} lượt</span>${one?"":`<span class="hleg"><span class="fm fm-on">Online</span><span class="fm fm-giay">Giấy</span><span class="dl o">Quá hạn</span><span class="dl t">Hạn hôm nay</span></span>`}<span class="sp"></span><div class="searchbox sm">${ic("search")}<input type="search" id="hq" placeholder="Tìm em (họ tên) hoặc tên bài" value="${esc(q)}" aria-label="Tìm trong lịch sử giao bài"></div></div>
  ${hint?`<p class="small pad-x">${hint}</p>`:""}<table class="tbl hist"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></section>`;
}

/* ---- Rút lại bài đã giao ---- */
function withdrawModal(aid){const a=DB.assigns.find(x=>x.id===aid);if(!a)return;const e=find(a.examId),rs=resultOf(a),n=a.state==="scan"?0:rs.nSub;
  const sent=Object.values(DB.reports[a.id]||{}).some(r=>/Đã gửi|Đã nhận|Hẹn/.test(r.status||""))||a.reported;
  const opts=[];
  if(a.state==="open"&&n>0)opts.push(["close","Đóng bài ngay, giữ bài đã nộp",`${n}/${rs.size} em đã nộp được giữ và chấm như bình thường; ${rs.size-n} em chưa nộp không làm được nữa.`]);
  opts.push(["remove",n>0?"Rút hẳn, xoá cả bài đã nộp":a.state==="scan"?"Huỷ lượt giao bằng phiếu giấy":"Rút hẳn lượt giao",n>0?`${n} bài đã nộp bị xoá khỏi kết quả và sổ điểm. Các em thấy thông báo "Cô đã rút bài này".`:a.state==="scan"?"Phiếu đã in không còn dùng được để nhập điểm.":`Chưa em nào nộp. Bài biến mất khỏi danh sách của các em, kèm thông báo "Cô đã rút bài này".`]);
  modal(mhead(`Rút lại bài · ${a.cls}`,`${esc(e.title)} · giao ${fmtD(a.given)} · ${a.state==="scan"?"chờ nhập phiếu":n+"/"+rs.size+" em đã nộp"}`)+
   `${sent?`<div class="notice warn small">Báo cáo phụ huynh của bài này đã được gửi hoặc hẹn gửi. Rút bài không thu hồi được tin đã gửi; tin đang hẹn sẽ được huỷ.</div>`:""}
   <div class="schopts">${opts.map((o,i)=>`<label class="radio"><input type="radio" name="wd" value="${o[0]}" ${i===0?"checked":""}><span><b>${o[1]}</b><span class="sub">${o[2]}</span></span></label>`).join("")}</div>
   <label class="small">Lý do (ghi vào lịch sử, không bắt buộc)<input type="text" id="wdWhy" class="sin" style="width:100%" placeholder="Ví dụ: giao nhầm lớp, đề có câu sai"></label>
   <div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn neg" id="wdOk">Rút lại</button></div>`,()=>{
   document.querySelector("#wdOk").onclick=()=>{const v=document.querySelector('input[name="wd"]:checked').value,why=document.querySelector("#wdWhy").value.trim();
     DB.withdrawn=DB.withdrawn||[];DB.withdrawn.push({id:a.id,cls:a.cls,title:e.title,how:v,why,at:TODAY});
     if(v==="close"){a.state="done";a.closedEarly=true;a.due=TODAY+" "+new Date().toTimeString().slice(0,5)}
     else{DB.assigns=DB.assigns.filter(x=>x.id!==a.id&&x.twinOfAssign!==a.id);delete (DB.reports||{})[a.id];if(DB.scan)delete DB.scan[a.id];DB.verify=DB.verify.filter(x=>!(x.cls===a.cls&&x.aid===a.id))}
     Object.keys(RES_CACHE).forEach(k=>delete RES_CACHE[k]);if(typeof RESP_CACHE!=="undefined")Object.keys(RESP_CACHE).forEach(k=>delete RESP_CACHE[k]);
     save();closeM();go({v:"class",cls:a.cls,tab:"assign"});toast(v==="close"?`Đã đóng "${e.title}" ở ${a.cls}; giữ ${n} bài đã nộp.`:`Đã rút "${e.title}" khỏi ${a.cls}.`)}});
}
