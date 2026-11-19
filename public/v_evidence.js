/* ===== Bằng chứng qua các vòng (trong hồ sơ từng em, chỉ cô thấy) =====
   Mỗi vòng: điểm ở nhà, điểm trên lớp (mini test), điểm dự kiến theo mức của em, hành vi ghi nhận khi làm bài.
   Cách tính giống trang Mô phỏng chỉ số (cộng dồn bằng chứng), nhưng cô chỉ thấy chữ và thanh mức, không thấy z, B, θ. */
const EV_LAB={odd:["Kiểu làm khác thường, có làm trên lớp","info"],khop:["Khớp","pos"],watch:["Theo dõi","mute"],chut:["Nên kiểm tra thêm","warn"],nhieu:["Cần cô xác nhận","neg"],thap:["Ở nhà thấp hơn sức","info"],cao:["Trên lớp tốt hơn dự kiến","info"]};
function evidenceOf(c,s){
  const R=6,seed=s.id.split("").reduce((a,ch)=>(Math.imul(a^ch.charCodeAt(0),2654435761))>>>0,2166136261)^0x5bd1e995;const r=rng(seed>>>0);for(let k=0;k<7;k++)r();
  const pv=(DB.verify||[]).find(v=>v.cls===c&&v.name===s.name),pend=!!pv; /* em đã từng vào Cần xác nhận (kể cả cô đã xử lý) */
  const swing=typeof alertsOf==="function"&&alertsOf(c).some(x=>x.s.id===s.id&&x.k==="swing");
  const prof=pend?"chep":swing?"thatthuong":c==="8A3"&&s.name==="Linh"?"tracau":c==="8A3"&&s.name==="Mai"?"hongnen":"that";const from=pend?3:99;
  const done=assignsOf(c).filter(a=>a.state==="done"&&a.kind==="lt"&&!a.twinOfAssign).slice().reverse();
  const labs=Array.from({length:R},(_,i)=>{const a=done[done.length-R+i];return a?`${find(a.examId).title} · ${fmtD(a.given)}`:`Bài về nhà tuần ${i+1}`});
  const P=SIM_EV;let B=0,chk=false,L=0;const out=[];const g=s.theta<0.3?0.12:0.04;
  for(let i=0;i<R;i++){
    const hasM=i===0||(pend&&i===R-1)||r()<0.6;if(hasM)chk=true;
    const th=s.theta+g*i,bH=(r()-.5)*1.2,bM=bH+(r()-.5)*.4;
    const pH=0.25+0.75*sig(th-bH),pM=0.25+0.75*sig(th-bM);const expH=10*pH,expM=10*pM;
    const sdH=Math.sqrt(10*pH*(1-pH)),sdM=Math.sqrt(10*pM*(1-pM));
    const nz=()=>(r()+r()+r()-1.5)*1.6;
    let sH=expH+nz()*sdH*.75,sM=expM+nz()*sdM*.75;
    const copy=i>=from;
    /* hành vi ghi nhận khi làm bài ở nhà */
    const ev=copy?{leave:3+Math.floor(r()*3),longest:40+Math.floor(r()*80),paste:2+Math.floor(r()*3),shot:r()<.5?1:0,sec:15+Math.floor(r()*10)}
      :{leave:r()<.4?1:0,longest:5+Math.floor(r()*12),paste:0,shot:0,sec:prof==="thatthuong"&&i%2===0?18+Math.floor(r()*8):40+Math.floor(r()*30)};
    if(copy){sH=Math.max(sH,Math.min(10,expH+2+r()*1.2));sM=Math.min(sM,expM-2-r()*1.5)} /* mức ước tính bị đẩy lên vì bài ở nhà được giúp, nên trên lớp thấp hơn dự kiến */
    if(copy&&i===R-1&&pv){if(pv.home!=null)sH=+pv.home;if(typeof pv.clsScore==="number")sM=pv.clsScore}
    if(prof==="thatthuong")sH+=(i%2?-1:1)*(1.2+r()*1.2);
    sH=Math.max(0,Math.min(10,Math.round(sH)));sM=Math.max(0,Math.min(10,Math.round(sM)));
    /* 6 câu dễ + 4 câu khó với em; chia số câu đúng thành đúng câu dễ / đúng câu khó */
    const pE=0.25+0.75*sig(th-bH+0.9),pHd=0.25+0.75*sig(th-bH-0.7); /* theo mức hệ thống đang biết */
    const thT=pend&&i>=from?th-1.5:th,qE=0.25+0.75*sig(thT-bH+0.9),qH=0.25+0.75*sig(thT-bH-0.7); /* theo sức thật, để chia câu đúng */
    const split=(tot,mode)=>{let h;if(mode==="tracau")h=Math.min(4,tot);else if(mode==="hongnen")h=Math.min(4,Math.max(tot-2,Math.round(tot*0.4)));else h=Math.round(tot*4*qH/(4*qH+6*qE)+(r()-.5));h=Math.max(Math.max(0,tot-6),Math.min(4,Math.min(tot,h)));return {e:tot-h,h}};
    if(prof==="tracau"&&i>=2){sH=Math.min(10,4+Math.round(6*Math.max(0,pE-0.5)+(r()-.5)))} /* từ vòng 3: tra hết câu khó, câu dễ làm ẩu */
    if(prof==="hongnen"){sH=Math.round(6*0.35+4*pHd+(r()-.5));if(hasM)sM=Math.round(6*0.35+4*pHd+(r()-.5))}
    const cH=split(sH,prof==="tracau"&&i>=2?"tracau":prof==="hongnen"?"hongnen":"that"),cM=hasM?split(sM,prof==="hongnen"?"hongnen":"that"):null;
    const lzC=c=>{const ok=[...Array(6)].map((_,k)=>k<c.e?1:0).concat([...Array(4)].map((_,k)=>k<c.h?1:0));return lzOf(ok,Array(6).fill(pE).concat(Array(4).fill(pHd)))};
    const lzH=lzC(cH),lzM=cM?lzC(cM):null,hx=cH.h-4*pHd;
    if(!hasM)sM=null;
    const z=(sH-expH)/sdH,d=hasM?sH-sM:null,SE=hasM?Math.sqrt(sdH*sdH+sdM*sdM):sdH;
    /* có mini test: e = (z + d/SE)/√2. Không có: chỉ còn z (z/√2). Cộng 0,5 nếu hành vi đáng chú ý */
    const e=(hasM?(z+d/SE)/Math.SQRT2:z/Math.SQRT2)+(evBehFlag(ev)?P.bh||0:0);B=Math.max(0,B+e-P.k);
    /* kênh kiểu đúng sai: ở nhà lạ hơn trên lớp, lặp lại qua các vòng; chỉ tính khi đúng câu khó nhiều hơn dự kiến */
    const dl=hx<(P.hx||1)?0:hasM?(lzM-lzH)/Math.SQRT2:-lzH/Math.SQRT2;L=Math.max(0,L+dl-(P.lzk2||0.5));const lzw=L>=(P.lzh||2.5),odd=hasM&&lzM<=-2&&sM>=expM-2; /* chỉ xét kiểu làm trên lớp khi điểm trên lớp gần dự kiến; nếu thấp hẳn thì chênh điểm đã là tín hiệu chính */
    let lab=hasM?(d<=-3?"thap":sM-expM>=2?"cao":"khop"):"khop";
    if(e>=P.s||B>=P.h2)lab="nhieu";else if(B>=P.h1)lab="chut";else if(e>=1.2||z>=2)lab="watch";
    if(P.one&&e>=P.one&&!["nhieu","chut"].includes(lab))lab="chut"; /* một vòng lệch rõ */
    if(lzw&&!["nhieu","chut"].includes(lab))lab="chut";
    if(odd&&["khop","watch"].includes(lab))lab="odd";
    if(lab==="nhieu"&&!chk)lab="chut"; /* chưa có lần kiểm tra trên lớp: cao nhất là Nên kiểm tra thêm */
    out.push({cH,cM,lzH,lzM,lzw,odd,L,i,hasM,z,SE,g,lab:labs[i],sH,sM,exp:+expH.toFixed(1),expM:+expM.toFixed(1),d,B,e,res:lab,ev});
  }
  /* tiến bộ: mức tăng qua 6 vòng; "thật" khi 3 vòng gần nhất có ít nhất một vòng kiểm tra trên lớp khớp, ngược lại "chờ xác nhận" */
  const last3=out.slice(-3),flag=out[out.length-1].res==="nhieu"||out[out.length-1].res==="chut";
  const prog=flag?["Chưa kết luận tiến bộ: đang cần kiểm tra","warn"]:g*(R-1)>=0.4?(last3.some(x=>x.hasM&&x.res==="khop")?["Tiến bộ thật","pos"]:["Tiến bộ, chờ xác nhận","info"]):["Giữ mức","mute"];
  return {rows:out,prof,prog};
}
function evBeh(ev){const t=[];
  if(ev.leave)t.push(`Rời app ${ev.leave} lần${ev.longest>20?` (lâu nhất ${ev.longest} giây)`:""}`);
  if(ev.paste)t.push(`Dán nội dung ${ev.paste} lần`);if(ev.shot)t.push(`Chụp màn hình ${ev.shot} lần`);
  t.push(`${ev.sec} giây/câu`);return t.join(" · ")}
function evBehFlag(ev){return ev.paste>0||ev.shot>0||ev.longest>20||ev.sec<25}
function evMeter(B){const w=Math.min(100,B/6*100);const word=B>=4.5?"Mạnh":B>=2?"Đủ để kiểm tra":B>0.3?"Đang tích lũy":"Chưa có";
  return `<div class="evm" title="Bằng chứng tích lũy đến vòng này"><div class="evbar"><i style="width:${w}%" class="${B>=4.5?"evhi":B>=2?"evmd":""}"></i><b style="left:${2/6*100}%"></b><b style="left:${4.5/6*100}%"></b></div><span>${word}</span></div>`}
function evidenceSection(c,s){
  const {rows,prog}=evidenceOf(c,s);const last=rows[rows.length-1];const hi=rows.filter(x=>x.hasM&&x.d>=2);const noM=rows.filter(x=>!x.hasM).length;
  const anyLz=rows.some(x=>x.lzw),anyOdd=rows.some(x=>x.odd);
  const now=last.res==="odd"?"Kiểu làm khác thường, có làm trên lớp":last.res==="nhieu"?"Cần cô xác nhận":last.res==="chut"?"Nên kiểm tra thêm":last.res==="watch"?"Đang theo dõi, chưa đủ để cảnh báo":"Không có dấu hiệu bất thường";
  const sum=hi.length>=2?`Ở nhà cao hơn trên lớp từ 2 điểm trở lên ở <b>${hi.length}/${rows.length}</b> vòng gần nhất (trung bình ${v1(Math.round(hi.reduce((a,x)=>a+x.d,0)/hi.length*10)/10)} điểm).`
    :hi.length===1?`Chỉ một vòng ở nhà cao hơn hẳn trên lớp (${esc(hi[0].lab.split(" · ")[0])}); các vòng còn lại khớp.`:"Điểm ở nhà và trên lớp khớp nhau qua các vòng.";
  const sum2=anyOdd?" Ở cả nhà lẫn trên lớp em hay sai câu dễ mà đúng câu khó: nhiều khả năng em hổng một mảng kiến thức nền, không phải chép. Nên xem các câu dễ em sai thuộc kỹ năng nào.":anyLz?" Ở nhà em đúng nhiều câu khó nhưng sai câu dễ, trên lớp thì không; kiểu này lặp lại qua nhiều vòng.":"";
  const t=rows.length;
  const chart=simLine({title:"Ở nhà, trên lớp và dự kiến",sub:"thang 10 · ! = Nên kiểm tra thêm, !! = Cần cô xác nhận",R:t,t,min:0,max:10,ticks:[0,2,4,6,8,10],
    series:[{name:"Ở nhà",c:SIM_COL.btvn,vals:rows.map(x=>x.sH)},{name:"Trên lớp",c:SIM_COL.mini,vals:rows.map(x=>x.sM)},{name:"Dự kiến",c:SIM_COL.exp,dash:1,vals:rows.map(x=>x.exp)}],
    marks:rows.map(x=>({i:x.i,s:x.res==="nhieu"?"!!":x.res==="chut"?"!":""})),
    tip:i=>{const x=rows[i];return `Vòng ${i+1}: ${x.lab}\nỞ nhà ${v1(x.sH)} · Trên lớp ${x.hasM?v1(x.sM):"không kiểm tra"} · Dự kiến ${v1(x.exp)}\n${evBeh(x.ev)}\nKết luận vòng: ${EV_LAB[x.res][0]}`}});
  const act=last.res==="nhieu"||last.res==="chut"?`<button class="btn sm pri" id="evAsk">Hỏi em ngay</button>`:"";
  return `<section class="panel evsec"><div class="phead"><h2>Bằng chứng qua các vòng</h2><span class="segtag t-me">Chỉ cô thấy</span><span class="sp"></span>${act}</div>
    <p class="evsum"><span class="apill ${EV_LAB[last.res][1]==="neg"?"s-neg":EV_LAB[last.res][1]==="warn"?"s-warn":"s-info"}">${now}</span> ${sum}${sum2}${noM?` ${noM}/${rows.length} vòng không có kiểm tra trên lớp; các vòng này chỉ so điểm ở nhà với sức của em nên tính nhẹ hơn.`:""}</p><p class="evsum"><span class="apill ${prog[1]==="pos"?"s-pos":prog[1]==="warn"?"s-warn":prog[1]==="info"?"s-info":"s-mute"}">${prog[0]}</span> <span class="muted small">${prog[0]==="Tiến bộ, chờ xác nhận"?"Mức tăng chủ yếu dựa trên bài ở nhà chưa được kiểm tra trên lớp. Báo phụ huynh vẫn gửi, nhưng chưa khẳng định em tiến bộ.":prog[0]==="Tiến bộ thật"?"Mức tăng đã được kiểm tra trên lớp và khớp.":""}</span></p>
    ${(()=>{if(!["nhieu","chut","odd"].includes(last.res)&&!rows.some(x=>x.lzw))return "";const {O,W}=evObs(rows);const k=c+"|"+s.name,cc=(DB.evConc||{})[k];
      return `<div class="evobs"><div class="evobs-h"><b>Hệ thống ghi nhận</b><span class="muted small">sự việc, chưa phải kết luận</span></div><ul class="dash">${O.map(o=>`<li>${esc(o)}</li>`).join("")}</ul>
      ${W.length?`<div class="evobs-h"><b>Có thể do</b><span class="muted small">cô đối chiếu với điều cô biết về em</span></div><ul class="dash">${W.map(o=>`<li>${esc(o)}</li>`).join("")}</ul>`:""}
      <div class="evconc"><span class="flabel">Cô kết luận</span>${Object.entries(EV_CONC).map(([q,v])=>`<button class="btn sm ${cc&&cc.k===q?"pri":""}" data-evc="${q}">${v[0]}</button>`).join("")}${cc?`<span class="muted small">Cô chọn "${EV_CONC[cc.k][0]}" ngày ${esc(cc.at)}</span>`:""}</div></div>`})()}
    ${chart}
    <div class="scrolly"><table class="tbl compact evt"><thead><tr><th>Vòng</th><th class="num" title="Dự kiến theo mức của em ở trong ngoặc">Ở nhà</th><th class="num">Trên lớp</th><th class="num">Nhà − lớp</th><th>Hành vi khi làm ở nhà</th><th>Bằng chứng tích lũy</th><th>Hệ thống gợi ý</th></tr></thead>
    <tbody>${rows.map(x=>`<tr><td><b>V${x.i+1}</b><span class="sub">${esc(x.lab)}</span></td><td class="num">${v1(x.sH)}<span class="sub">dự kiến ${v1(x.exp)}</span><span class="sub" ${x.lzw||x.lzH<=-2?'style="color:#b45309"':""}>dễ ${x.cH.e}/6 · khó ${x.cH.h}/4</span></td><td class="num">${x.hasM?v1(x.sM)+`<span class="sub" ${x.odd?'style="color:#b45309"':""}>dễ ${x.cM.e}/6 · khó ${x.cM.h}/4</span>`:`<span class="muted">—</span><span class="sub">không kiểm tra</span>`}</td><td class="num ${x.hasM&&x.d>=2?"neg-t":x.hasM&&x.d<=-2?"pos-t":""}">${x.hasM?(x.d>0?"+":"")+v1(x.d):`<span class="muted">—</span>`}</td><td class="small ${evBehFlag(x.ev)?"warn-t":"muted"}">${esc(evBeh(x.ev))}</td><td>${evMeter(Math.max(x.B,Math.min(4.4,x.L/2.5*2)))}</td><td><span class="apill ${x.res==="nhieu"?"s-neg":x.res==="chut"?"s-warn":x.res==="khop"?"s-pos":"s-info"}">${EV_LAB[x.res][0]}</span>${x.lzw&&x.res==="chut"?`<span class="sub" style="color:#b45309">đúng câu khó, sai câu dễ (lặp lại)</span>`:x.odd?`<span class="sub">trên lớp cũng vậy: có thể hổng nền</span>`:""}</td></tr>`).join("")}</tbody></table></div>
    <p class="small muted">Mỗi vòng ở nhà cao hơn sức hoặc cao hơn trên lớp sẽ cộng thêm bằng chứng; vòng không có kiểm tra trên lớp chỉ cộng một nửa, và khi chưa có lần kiểm tra nào thì nhãn cao nhất là Nên kiểm tra thêm; vòng khớp thì bằng chứng giảm dần, nên một lần lệch do may rủi sẽ tự tan. Vạch trên thanh: "Đủ để kiểm tra" (Nên kiểm tra thêm) và "Mạnh" (Cần cô xác nhận). Dòng "dễ x/6 · khó y/4" cho biết em đúng bao nhiêu câu dễ và câu khó với em; tô cam khi kiểu đúng sai lạ (đúng câu khó mà sai câu dễ). Hành vi tô cam khi có dán nội dung, chụp màn hình, rời app trên 20 giây hoặc làm dưới 25 giây/câu. Phụ huynh và học sinh không thấy phần này.</p></section>`;
}
function bindEvidence(c,s){
  const sec=document.querySelector("#layer .evsec");if(!sec)return;const tip=simTip();
  sec.querySelectorAll("svg.ssvg").forEach(svg=>{const cr=svg.querySelector(".scross");svg.querySelectorAll("[data-tip]").forEach(h=>{h.onmousemove=e=>{tip.textContent=h.dataset.tip;tip.style.display="block";tip.style.left=Math.min(innerWidth-260,e.clientX+14)+"px";tip.style.top=(e.clientY+14)+"px";cr.setAttribute("x1",h.dataset.cx);cr.setAttribute("x2",h.dataset.cx);cr.style.display=""};h.onmouseleave=()=>{tip.style.display="none";cr.style.display="none"}})});
  document.querySelectorAll("#layer [data-evc]").forEach(btn=>btn.onclick=()=>{const q=btn.dataset.evc,k=c+"|"+s.name;DB.evConc=DB.evConc||{};const before=DB.evConc[k];
    DB.evConc[k]={k:q,at:(d=>String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0"))(new Date())};
    const v=DB.verify.find(v=>v.cls===c&&v.name===s.name&&!v.status);if(v&&(q==="tu"||q==="khong")){v.status=q;if(q==="khong")DB.repeatKhong[s.name]=(DB.repeatKhong[s.name]||0)+1}
    save();studentSheet(c,s.name);toast(q==="tu"?`Đã ghi nhận: ${s.name} tự làm. Điểm ở nhà được giữ.`:q==="khong"?`Đã ghi nhận: ${s.name} chưa tự làm. Hệ thống dùng kết quả trên lớp để chọn bài vừa sức.`:q==="nen"?`Đã ghi nhận. Gợi ý bài ôn kỹ năng nền cho ${s.name} ở lần giao tới.`:`Đã ghi nhận. Cô có thể bấm "Hỏi em ngay" để hỏi thêm.`,()=>{if(before)DB.evConc[k]=before;else delete DB.evConc[k];save();studentSheet(c,s.name)})});
  const b=document.querySelector("#evAsk");if(b)b.onclick=()=>{const a=assignsOf(c).find(z=>z.state==="done");if(!a){toast("Chưa có bài đã chấm.");return}
    if(!DB.verify.some(v=>v.cls===c&&v.name===s.name&&!v.status)){markVerify(a,[s.id]);const v=DB.verify.find(v=>v.cls===c&&v.name===s.name&&!v.status);if(v){v.why="Bằng chứng qua các vòng";v.clsScore=null;save()}}
    const v=DB.verify.find(v=>v.cls===c&&v.name===s.name&&!v.status);if(v)oralModal(c,s.name,v)};
}
/* Điều hệ thống ghi nhận được (sự việc, không phải kết luận) và các cách hiểu có thể có. Cô là người kết luận. */
function evObs(rows){const fl=rows.filter(x=>["nhieu","chut","odd"].includes(x.res)||x.lzw);const last=fl[fl.length-1]||rows[rows.length-1];const O=[],W=[];
  const hiN=rows.filter(x=>x.hasM&&x.d>=2).length,mN=rows.filter(x=>x.hasM).length;
  if(last.hasM&&last.d>=2)O.push(`Vòng ${last.i+1}: ở nhà ${v1(last.sH)}/10, trên lớp ${v1(last.sM)}/10 (chênh ${v1(last.d)} điểm).`);
  if(hiN>=2)O.push(`Ở nhà cao hơn trên lớp từ 2 điểm ở ${hiN}/${mN} vòng có kiểm tra trên lớp.`);
  if(last.sH-last.exp>=1.5)O.push(`Ở nhà cao hơn điểm dự kiến theo mức của em ${v1(+(last.sH-last.exp).toFixed(1))} điểm.`);
  if(last.cH&&last.cH.h>=3&&last.cH.e<=3)O.push(`Ở nhà đúng ${last.cH.h}/4 câu khó nhưng chỉ đúng ${last.cH.e}/6 câu dễ${last.cM?`; trên lớp đúng ${last.cM.h}/4 câu khó, ${last.cM.e}/6 câu dễ`:""}.`);
  const ev=last.ev;if(ev.paste)O.push(`Dán nội dung ${ev.paste} lần khi làm ở nhà.`);if(ev.shot)O.push(`Chụp màn hình ${ev.shot} lần.`);if(ev.longest>20)O.push(`Rời app ${ev.leave} lần, lâu nhất ${ev.longest} giây.`);if(ev.sec<25)O.push(`Trung bình ${ev.sec} giây/câu (bình thường của em khoảng 45–65 giây).`);
  if(!O.length)O.push("Không có gì bất thường ở các vòng gần đây.");
  /* cách hiểu có thể có: luôn kèm khả năng em tự làm */
  if(hiN>=1||last.sH-last.exp>=1.5)W.push("Em được người khác giúp hoặc tra công cụ khi làm ở nhà","Em ôn kỹ trước khi làm ở nhà, còn trên lớp bị áp lực thời gian","Đề ở nhà và đề trên lớp lệch độ khó hơn hệ thống tính");
  if(last.cH&&last.cH.h>=3&&last.cH.e<=3)W.push(last.odd?"Em hổng một mảng kiến thức nền (trên lớp cũng vậy)":"Em tra riêng câu khó, câu dễ làm ẩu","Em làm vội, bỏ cẩu thả câu dễ");
  if(ev.paste||ev.shot||ev.longest>20)W.push("Em rời app để tra cứu hoặc nhắn tin","Gián đoạn ngoài ý em (gọi điện, việc nhà, mạng chập chờn)");
  return {O,W:[...new Set(W)]}}
const EV_CONC={tu:["Em tự làm","pos"],khong:["Chưa tự làm","neg"],nen:["Hổng nền, cần ôn","info"],them:["Chưa đủ thông tin, hỏi thêm","warn"]};
