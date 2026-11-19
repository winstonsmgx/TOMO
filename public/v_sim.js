/* ===== Mô phỏng chỉ số (chỉ dùng cho prototype): một nhóm em đi qua nhiều vòng BTVN → mini test =====
   θ thật: năng lực thật (chỉ mô phỏng mới biết). θ̂: năng lực hệ thống ước tính. b: độ khó câu.
   p = 0,25 + 0,75·sig(θ − b). z = (số câu đúng − Σp) / √Σp(1−p), tính theo θ̂ trước vòng đó. */
const SIM_BEH={tu:"Tự làm",chep:"Chép BTVN mọi vòng",chep50:"Thỉnh thoảng chép (50%)",tuchep:"Tự làm, rồi chép từ vòng…",doan:"Làm qua loa, đoán nhanh"};
const SIM_COL={th:"#2a78d6",est:"#eb6834",b:"#1baf7a",btvn:"#2a78d6",mini:"#eb6834",exp:"#8a8984"};
const SIM_SAMPLE=()=>[
  {name:"An",t0:0.6,g:0,beh:"tu",from:3},{name:"Bình",t0:-0.4,g:0.3,beh:"tu",from:3},{name:"Chi",t0:-0.6,g:0,beh:"chep",from:3},
  {name:"Dũng",t0:0.2,g:0,beh:"chep50",from:3},{name:"Giang",t0:0,g:0,beh:"doan",from:3},{name:"Hà",t0:0.9,g:0,beh:"tuchep",from:4},{name:"Khoa",t0:0.8,g:-0.25,beh:"tu",from:3}];
function simState(){if(!UI.sim)UI.sim={st:SIM_SAMPLE(),R:6,nB:10,nM:10,seed:7,t:6,sel:0,tbl:false,ru:{r1:true,r2:"soft",r3:true},mode:"ev"};UI.sim.ru=UI.sim.ru||{r1:false,r2:false,r3:false};return UI.sim}
const sgm=x=>1/(1+Math.exp(-x));const pC=(th,b)=>0.25+0.75*sgm(th-b);
const CMP_SIM={watch:["Theo dõi","mute"],khop:["Khớp BTVN","pos"],chut:["Nên kiểm tra thêm","warn"],nhieu:["Cần cô xác nhận","neg"],cao:["Cao hơn dự kiến","info"],thap:["BTVN thấp hơn sức","info"]};
const SIM_EV={mix:1,k:0.75,h1:2,h2:4.5,s:3.5};
function simRun(S,RU){RU=RU||(S.mode==="ev"?{ev:SIM_EV}:S.ru)||{};const SEV={khop:0,cao:0,thap:0,chut:1,nhieu:2};
  const G=[];for(let x=-3;x<=3.0001;x+=0.05)G.push(+x.toFixed(2));
  return S.st.map((s,si)=>{const R_=rng(S.seed*7919+si*104729+1);let mu=0,sd=1,C=0;const rows=[],dh=[];
    for(let t=1;t<=S.R;t++){const th=s.t0+s.g*(t-1),est0=mu,sd0=sd;
      const items=n=>Array.from({length:n},(_,i)=>+(est0-0.4+(n>1?-1.2+2.4*i/(n-1):0)).toFixed(2));
      const bB=items(S.nB),bM=items(S.nM);
      const copy=s.beh==="chep"||(s.beh==="chep50"&&R_()<0.5)||(s.beh==="tuchep"&&t>=s.from);
      const okB=bB.map(b=>copy?R_()<0.95:s.beh==="doan"?R_()<0.33:R_()<pC(th,b));
      const okM=bM.map(b=>R_()<pC(th,b));
      const pB=bB.map(b=>pC(est0,b)),E=pB.reduce((a,b)=>a+b,0),V=pB.reduce((a,p)=>a+p*(1-p),0),k=okB.filter(Boolean).length;
      const z=(k-E)/Math.sqrt(V),hard=okB.filter((o,i)=>o&&pB[i]<0.5).length;
      const zf=z>=2?"Điểm cao bất thường":z>=1.5&&hard>=2?"Đúng nhiều câu khó":z<=-2?"Thấp hơn sức":"";
      const fast=s.beh==="doan";
      const sB=+(10*k/S.nB).toFixed(1),kM=okM.filter(Boolean).length,sM=+(10*kM/S.nM).toFixed(1);
      const expM=+(10*bM.reduce((a,b)=>a+pC(est0,b),0)/S.nM).toFixed(1);const d=sB-sM,gap=sM-expM;
      const expB=10*E/S.nB,overB=sB-expB;
      let lab=d>=3.5||(d>=2.5&&overB>=2.5)?"nhieu":d>=2.5?"chut":d<=-3?"thap":gap>=2?"cao":"khop";
      const base=lab,why=[];dh.push(d);
      const SE=Math.sqrt(pB.reduce((a,p)=>a+p*(1-p),0)*(10/S.nB)**2+bM.reduce((a,b)=>{const p=pC(est0,b);return a+p*(1-p)},0)*(10/S.nM)**2),zd=d/SE;
      const zh=/cao bất thường|câu khó/.test(zf);let warn,watch=false;
      if(RU.ev){const P=RU.ev;const e=P.mix?(zd+z)/Math.SQRT2:zd;C=Math.max(0,C+e-P.k);lab=d<=-3?"thap":gap>=2?"cao":"khop";
        if(e>=P.s||C>=P.h2)lab="nhieu";else if(C>=P.h1)lab="chut";else if(e>=1.2||zh)lab="watch";
        warn=lab==="nhieu"||lab==="chut";}
      const up=(k,r)=>{if(SEV[k]>SEV[lab]||(SEV[lab]===0&&SEV[k]>0)){lab=k;why.push(r)}};
      if(RU.r1&&overB>=2&&d>=1.5)up("chut","Quy tắc 1: BTVN vượt dự kiến ≥ 2 và cao hơn mini ≥ 1,5");
      if(RU.r2&&dh.slice(-3).filter(v=>v>=1.5).length>=2)up(RU.r2==="soft"?"chut":"nhieu","Quy tắc 2: BTVN cao hơn mini ≥ 1,5 ở 2 trong 3 vòng gần nhất");
      if(RU.r3&&/cao bất thường|câu khó/.test(zf)&&SEV[lab]===0)up("chut","Quy tắc 3: có cờ z cao nên không để Khớp");
      if(!RU.ev)warn=lab==="nhieu"||lab==="chut"||zh;
      /* cập nhật θ̂: mini test tin hoàn toàn; BTVN được tin ít hơn khi có nhãn hoặc cờ */
      const w=lab==="nhieu"||fast?0:lab==="chut"?0.3:lab==="thap"||zf?0.5:1;
      const lp=G.map(x=>-((x-est0)**2)/(2*(sd0*sd0+0.04))+bM.reduce((a,b,i)=>a+Math.log(okM[i]?pC(x,b):1-pC(x,b)),0)+w*bB.reduce((a,b,i)=>a+Math.log(okB[i]?pC(x,b):1-pC(x,b)),0));
      const mx=Math.max(...lp),ws=lp.map(v=>Math.exp(v-mx)),Z=ws.reduce((a,b)=>a+b,0);
      mu=G.reduce((a,x,i)=>a+x*ws[i],0)/Z;sd=Math.sqrt(G.reduce((a,x,i)=>a+(x-mu)**2*ws[i],0)/Z);
      rows.push({warn,watch,zd:+zd.toFixed(2),C:+C.toFixed(2),base,why,d:+d.toFixed(1),expB:+expB.toFixed(1),t,th:+th.toFixed(2),est0:+est0.toFixed(2),sd0:+sd0.toFixed(2),est:+mu.toFixed(2),sd:+sd.toFixed(2),bAvg:+(bB.reduce((a,b)=>a+b,0)/S.nB).toFixed(2),copy,sB,sM,expM,z:+z.toFixed(2),hard,zf,fast,lab,w})}
    return {s,rows}})}
function spread(ys,gap){const o=ys.map((y,i)=>({y,i})).sort((a,b)=>a.y-b.y);for(let k=1;k<o.length;k++)if(o[k].y-o[k-1].y<gap)o[k].y=o[k-1].y+gap;const r=[];o.forEach(q=>r[q.i]=q.y);return r}
function simScore(RS,t){let cp=0,hit=0,miss=0,fa=0,hon=0,cs=0,csh=0,hs=0,hsf=0;RS.forEach(x=>{const rw=x.rows.slice(0,t);if(rw.some(r=>r.copy)){cs++;if(rw.some(r=>r.copy&&r.warn))csh++}else{hs++;if(rw.some(r=>r.warn))hsf++}});RS.forEach(x=>x.rows.slice(0,t).forEach(r=>{const warn=r.warn;if(r.copy){cp++;warn?hit++:miss++}else{hon++;if(warn)fa++}}));return {cp,hit,miss,fa,hon,cs,csh,hs,hsf}}
function simCompare(S){const C=[["Cộng dồn bằng chứng (đề xuất)",{ev:SIM_EV}],["Ngưỡng từng vòng, không thêm quy tắc",{}],["Chỉ quy tắc 1",{r1:1}],["Chỉ quy tắc 2 (mức Cần cô xác nhận)",{r2:1}],["Chỉ quy tắc 3",{r3:1}],["Gộp cả 3 (quy tắc 2 ở mức Cần cô xác nhận)",{r1:1,r2:1,r3:1}],["Gộp cả 3 (quy tắc 2 ở mức Nên kiểm tra thêm, đang dùng)",{r1:1,r2:"soft",r3:1}]];
  return C.map(([n,ru])=>{let a={cp:0,hit:0,miss:0,fa:0,hon:0,cs:0,csh:0,hs:0,hsf:0,nh:0,nhc:0};for(let sd=1;sd<=100;sd++){const RS=simRun(Object.assign({},S,{seed:sd}),ru);const m=simScore(RS,S.R);for(const k in m)a[k]+=m[k];RS.forEach(x=>x.rows.forEach(r=>{if(r.lab==="nhieu"){a.nh++;if(r.copy)a.nhc++}}))}return {n,...a}})}
const v1=x=>String(x).replace(".",",");
function simTip(){let t=document.querySelector("#simtip");if(!t){t=document.createElement("div");t.id="simtip";t.className="simtip";t.setAttribute("role","tooltip");document.body.appendChild(t)}return t}
/* Biểu đồ đường: một trục y, đánh nhãn trực tiếp ở cuối đường, rê chuột hiện số của cả vòng */
function simLine(o){const W=560,H=210,L=40,Rr=110,T=14,B=28,pw=W-L-Rr,ph=H-T-B,n=o.R;const x=i=>L+(n>1?pw*i/(n-1):pw/2),y=v=>T+ph*(1-(v-o.min)/(o.max-o.min));
  const grid=o.ticks.map(v=>`<line x1="${L}" x2="${L+pw}" y1="${y(v)}" y2="${y(v)}" class="sg"/><text x="${L-6}" y="${y(v)+4}" class="sax" text-anchor="end">${v1(v)}</text>`).join("");
  const xl=Array.from({length:n},(_,i)=>`<text x="${x(i)}" y="${H-8}" class="sax" text-anchor="middle">V${i+1}</text>`).join("");
  const tY=spread((o.thr||[]).map(r=>y(r[0])),13);const thr=(o.thr||[]).map((r,k)=>`<line x1="${L}" x2="${L+pw}" y1="${y(r[0])}" y2="${y(r[0])}" class="sthr"/><text x="${L+pw+4}" y="${tY[k]+4}" class="sax">${r[1]}</text>`).join("");
  const shown=o.t;
  const band=(o.band||[]).map(bd=>{const pts=bd.lo.slice(0,shown);if(pts.length<1)return "";const up=bd.hi.slice(0,shown).map((v,i)=>`${x(i)},${y(Math.min(o.max,v))}`),dn=pts.map((v,i)=>`${x(i)},${y(Math.max(o.min,v))}`).reverse();return `<polygon points="${up.concat(dn).join(" ")}" fill="${bd.c}" opacity=".14"/>`}).join("");
  const ls=o.series.map(s=>{const v=s.vals.slice(0,shown);if(!v.length)return "";const d=v.map((q,i)=>`${i?"L":"M"}${x(i)},${y(q)}`).join("");const li=v.length-1;
    return `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2" ${s.dash?'stroke-dasharray="5 4"':""} stroke-linejoin="round" stroke-linecap="round"/>${v.map((q,i)=>`<circle cx="${x(i)}" cy="${y(q)}" r="4" fill="${s.c}" stroke="#fff" stroke-width="2"/>`).join("")}`}).join("");
  const ends=o.series.map(s=>{const v=s.vals.slice(0,shown);return v.length?{li:v.length-1,y:y(v[v.length-1]),n:s.name}:null});const ly=spread(ends.map(e=>e?e.y:-99),14);
  const labs=ends.map((e,k)=>e?`<text x="${x(e.li)+8}" y="${ly[k]+4}" class="slab">${esc(e.n)}</text>`:"").join("");
  const marks=(o.marks||[]).map(m=>m.i<shown?`<text x="${x(m.i)}" y="${T+ph-6}" text-anchor="middle" class="smk">${m.s}</text>`:"").join("");
  const hit=Array.from({length:Math.min(n,shown)},(_,i)=>`<rect x="${x(i)-(n>1?pw/(n-1)/2:pw/2)}" y="${T}" width="${n>1?pw/(n-1):pw}" height="${ph}" fill="transparent" data-tip="${esc(o.tip(i))}" data-cx="${x(i)}"/>`).join("");
  return `<figure class="schart"><figcaption><b>${o.title}</b><span class="muted small">${o.sub||""}</span></figcaption><div class="slegend">${o.series.map(s=>`<span><i style="background:${s.c}${s.dash?";background-image:repeating-linear-gradient(90deg,#fff 0 3px,transparent 3px 7px)":""}"></i>${esc(s.name)}</span>`).join("")}${(o.band||[]).map(b=>`<span><i class="bd" style="background:${b.c}"></i>${esc(b.name)}</span>`).join("")}</div>
  <svg viewBox="0 0 ${W} ${H}" class="ssvg" role="img" aria-label="${esc(o.title)}"><line class="scross" x1="0" x2="0" y1="${T}" y2="${T+ph}" style="display:none"/>${grid}${thr}${band}${ls}${labs}${marks}${xl}${hit}</svg></figure>`}
function simBars(o){const W=560,H=190,L=40,Rr=110,T=14,B=28,pw=W-L-Rr,ph=H-T-B,n=o.R,bw=Math.min(36,pw/n*0.55);const x=i=>L+pw*(i+0.5)/n,y=v=>T+ph*(1-(v-o.min)/(o.max-o.min)),y0=y(0);
  const grid=o.ticks.map(v=>`<line x1="${L}" x2="${L+pw}" y1="${y(v)}" y2="${y(v)}" class="sg ${v===0?"s0":""}"/><text x="${L-6}" y="${y(v)+4}" class="sax" text-anchor="end">${v1(v)}</text>`).join("");
  const tY=spread(o.thr.map(r=>y(r[0])),13);const thr=o.thr.map((r,k)=>`<line x1="${L}" x2="${L+pw}" y1="${y(r[0])}" y2="${y(r[0])}" class="sthr"/><text x="${L+pw+4}" y="${tY[k]+4}" class="sax">${r[1]}</text>`).join("");
  const bars=o.vals.slice(0,o.t).map((v,i)=>{const c=Math.max(o.min,Math.min(o.max,v)),top=Math.min(y(c),y0),h=Math.max(2,Math.abs(y(c)-y0));const fl=o.flag(i);
    return `<rect x="${x(i)-bw/2}" y="${top}" width="${bw}" height="${h}" rx="3" fill="${fl?"#b45309":"#86b6ef"}"/><text x="${x(i)}" y="${v>=0?top-5:top+h+12}" text-anchor="middle" class="sval">${v1(v)}</text>`}).join("");
  const hit=Array.from({length:Math.min(n,o.t)},(_,i)=>`<rect x="${x(i)-pw/n/2}" y="${T}" width="${pw/n}" height="${ph}" fill="transparent" data-tip="${esc(o.tip(i))}" data-cx="${x(i)}"/>`).join("");
  const xl=Array.from({length:n},(_,i)=>`<text x="${x(i)}" y="${H-8}" class="sax" text-anchor="middle">V${i+1}</text>`).join("");
  return `<figure class="schart"><figcaption><b>${o.title}</b><span class="muted small">${o.sub||""}</span></figcaption><div class="slegend"><span><i style="background:#86b6ef"></i>${(o.leg||["z bình thường"])[0]}</span><span><i style="background:#b45309"></i>${(o.leg||["","z có cờ"])[1]}</span></div><svg viewBox="0 0 ${W} ${H}" class="ssvg" role="img" aria-label="${esc(o.title)}"><line class="scross" x1="0" x2="0" y1="${T}" y2="${T+ph}" style="display:none"/>${grid}${thr}${bars}${xl}${hit}</svg></figure>`}
VIEWS.sim={
  html(){const S=simState(),RS=simRun(S);S.t=Math.min(S.t,S.R);const sel=Math.min(S.sel,RS.length-1),t=S.t;UI.simRS=RS;
    const pill=(k,r)=>`<span class="fitlab cm-${CMP_SIM[k][1]}" title="BTVN − mini = ${r?v1(r.d):""}${r&&r.why.length?" · "+r.why.join("; ")+" (trước đó: "+CMP_SIM[r.base][0]+")":""}">${CMP_SIM[k][0]}${r&&r.why.length?" *":""}</span>`;
    const stRows=S.st.map((s,i)=>`<tr class="${i===sel?"sel":""}"><td><input type="text" value="${esc(s.name)}" data-sf="${i}:name" aria-label="Tên" class="sin w8"></td>
      <td><input type="number" step="0.1" min="-3" max="3" value="${s.t0}" data-sf="${i}:t0" class="sin w5" aria-label="θ thật ban đầu"></td>
      <td><input type="number" step="0.05" min="-1" max="1" value="${s.g}" data-sf="${i}:g" class="sin w5" aria-label="Thay đổi mỗi vòng"></td>
      <td><select data-sf="${i}:beh" class="sin">${Object.entries(SIM_BEH).map(([k,l])=>`<option value="${k}" ${s.beh===k?"selected":""}>${l}</option>`).join("")}</select>${s.beh==="tuchep"?` <input type="number" min="2" max="${S.R}" value="${s.from}" data-sf="${i}:from" class="sin w4" aria-label="Chép từ vòng">`:""}</td>
      <td class="act"><button class="btn sm ghost" data-ssel="${i}">Xem</button><button class="iconbtn" data-sdel="${i}" aria-label="Xoá em này">${ic("x")}</button></td></tr>`).join("");
    const grid=RS.map((x,i)=>`<tr class="${i===sel?"sel":""}" data-ssel="${i}"><th class="snm"><b>${esc(x.s.name)}</b><span class="sub">${SIM_BEH[x.s.beh].replace("…"," "+x.s.from)}</span></th>${x.rows.map((r,j)=>j<t?`<td class="scell ${r.copy?"cp":""}"><div class="num">BTVN <b>${v1(r.sB)}</b> · Mini <b>${v1(r.sM)}</b></div>${pill(r.lab,r)}${r.zf?`<span class="sflag">${r.zf}</span>`:""}${r.fast?`<span class="sflag">Làm nhanh liên tục</span>`:""}${S.mode==="ev"?`<span class="sev">bằng chứng ${v1(r.C)}</span>`:""}${r.copy?`<span class="struth">thật: chép</span>`:""}</td>`:`<td class="scell fut"></td>`).join("")}</tr>`).join("");
    /* độ chính xác của cảnh báo, tới vòng đang xem */
    const {cp,hit,miss,fa,hon,cs,csh,hs,hsf}=simScore(RS,t);
    const err=RS.length?RS.reduce((a,x)=>a+Math.abs(x.rows[t-1].est-x.rows[t-1].th),0)/RS.length:0;
    const X=RS[sel];let detail="";
    if(X){const r=X.rows,nm=esc(X.s.name);
      detail=`<section class="panel"><div class="phead"><h2>Chi tiết: ${nm}</h2><span class="muted small">${SIM_BEH[X.s.beh].replace("…"," "+X.s.from)} · θ thật ban đầu ${v1(X.s.t0)} · thay đổi ${X.s.g>0?"+":""}${v1(X.s.g)}/vòng</span><span class="sp"></span><button class="btn sm ghost" id="simTbl">${S.tbl?"Ẩn bảng số":"Xem bảng số"}</button></div>
      <div class="sgrid">${simLine({title:"Năng lực và độ khó được giao",sub:"cùng thang θ (logit)",R:S.R,t,min:-3,max:3,ticks:[-3,-2,-1,0,1,2,3],
        series:[{name:"θ thật",c:SIM_COL.th,vals:r.map(q=>q.th)},{name:"θ ước tính",c:SIM_COL.est,vals:r.map(q=>q.est0)},{name:"Độ khó BTVN",c:SIM_COL.b,dash:1,vals:r.map(q=>q.bAvg)}],
        band:[{name:"khoảng tin cậy θ ước tính",c:SIM_COL.est,lo:r.map(q=>q.est0-q.sd0),hi:r.map(q=>q.est0+q.sd0)}],
        tip:i=>`Vòng ${i+1}\nθ thật ${v1(r[i].th)}\nθ ước tính trước vòng ${v1(r[i].est0)} ± ${v1(r[i].sd0)}\nĐộ khó BTVN trung bình ${v1(r[i].bAvg)}\nSau vòng: θ ước tính ${v1(r[i].est)}`})}
      ${simLine({title:"Điểm BTVN, mini test và dự kiến",sub:"thang 10",R:S.R,t,min:0,max:10,ticks:[0,2,4,6,8,10],
        series:[{name:"BTVN",c:SIM_COL.btvn,vals:r.map(q=>q.sB)},{name:"Mini test",c:SIM_COL.mini,vals:r.map(q=>q.sM)},{name:"Dự kiến",c:SIM_COL.exp,dash:1,vals:r.map(q=>q.expM)}],
        marks:r.map((q,i)=>({i,s:q.lab==="nhieu"?"!!":q.lab==="chut"?"!":""})),
        tip:i=>`Vòng ${i+1}\nBTVN ${v1(r[i].sB)} · Mini test ${v1(r[i].sM)}\nDự kiến theo θ ước tính ${v1(r[i].expM)}\nĐối chiếu: ${CMP_SIM[r[i].lab][0]}\nBTVN được tin: ${Math.round(r[i].w*100)}%`})}
      ${simBars({title:"Độ lệch z của BTVN",sub:"so với dự kiến theo θ ước tính",R:S.R,t,min:-4,max:4,ticks:[-4,-2,0,2,4],thr:[[2,"z = 2"],[1.5,"z = 1,5"],[-2,"z = −2"]],vals:r.map(q=>q.z),flag:i=>!!r[i].zf,
        tip:i=>`Vòng ${i+1}\nz = ${v1(r[i].z)}\nCâu khó làm đúng: ${r[i].hard}\nCờ: ${r[i].zf||"không"}`})}
      ${S.mode==="ev"?simBars({title:"Bằng chứng cộng dồn",sub:"chỉ tăng khi lệch lặp lại",R:S.R,t,min:0,max:8,ticks:[0,2,4,6,8],thr:[[2,"Nên kiểm tra"],[4.5,"Cần xác nhận"]],vals:r.map(q=>q.C),flag:i=>r[i].C>=2,leg:["dưới ngưỡng","đã cảnh báo"],
        tip:i=>`Vòng ${i+1}\nd = BTVN − mini = ${v1(r[i].d)} (d/SE = ${v1(r[i].zd)})\nz = ${v1(r[i].z)}\nBằng chứng sau vòng: ${v1(r[i].C)}\nNhãn: ${CMP_SIM[r[i].lab][0]}`}):""}
      <div class="snote small"><b>Cách đọc.</b> Đường cam là năng lực hệ thống tin; dải cam nhạt là độ chắc chắn, hẹp dần khi có thêm dữ liệu. Độ khó BTVN đi theo θ ước tính (đặt để em có khoảng 70% khả năng đúng). Khi BTVN bị gắn "Cần cô xác nhận", hệ thống không dùng BTVN vòng đó để cập nhật năng lực (tin 0%), nên đường cam không bị kéo lên theo điểm chép. Dấu ! trên biểu đồ điểm là "Nên kiểm tra thêm", !! là "Cần cô xác nhận".</div></div>
      ${S.tbl?`<div class="scrollx"><table class="tbl compact"><thead><tr><th>Vòng</th><th class="num">θ thật</th><th class="num">θ ước tính trước</th><th class="num">Độ khó BTVN</th><th class="num">BTVN</th><th class="num">Mini</th><th class="num">Dự kiến mini</th><th class="num">Dự kiến BTVN</th><th class="num">z</th><th>Cờ</th><th>Đối chiếu</th><th class="num">BTVN được tin</th><th>Thật</th></tr></thead><tbody>${r.slice(0,t).map(q=>`<tr><td>V${q.t}</td><td class="num">${v1(q.th)}</td><td class="num">${v1(q.est0)} ± ${v1(q.sd0)}</td><td class="num">${v1(q.bAvg)}</td><td class="num">${v1(q.sB)}</td><td class="num">${v1(q.sM)}</td><td class="num">${v1(q.expM)}</td><td class="num">${v1(q.expB)}</td><td class="num">${v1(q.z)}</td><td>${q.zf||(q.fast?"Làm nhanh liên tục":"—")}</td><td>${CMP_SIM[q.lab][0]}</td><td class="num">${Math.round(q.w*100)}%</td><td>${q.copy?"chép":"tự làm"}</td></tr>`).join("")}</tbody></table></div>`:""}</section>`}
    return `<div class="title-row"><h1>Mô phỏng chỉ số</h1><span class="pill warn">Chỉ dùng cho prototype</span></div>
    <p class="lede">Tạo một nhóm em với năng lực thật và cách làm bài của từng em, rồi cho chạy qua nhiều vòng BTVN → mini test. Xem hệ thống ước tính năng lực, chọn độ khó, đối chiếu mini test và gắn cờ thay đổi thế nào qua từng vòng. "Thật: chép" chỉ mô phỏng mới biết, giáo viên không thấy.</p>
    <section class="panel flush"><div class="phead pad"><h2>Nhóm học sinh</h2><span class="muted">${S.st.length} em</span><span class="sp"></span><button class="btn sm" id="simAdd">${ic("plus")} Thêm em</button><button class="btn sm ghost" id="simReset">Nhóm mẫu</button></div>
      <div class="scrollx"><table class="tbl compact ssetup"><thead><tr><th>Tên</th><th title="Năng lực thật, thang −3 đến 3; 0 là trung bình">θ thật ban đầu</th><th title="Năng lực thật tăng hoặc giảm bao nhiêu mỗi vòng">Thay đổi mỗi vòng</th><th>Cách làm BTVN</th><th></th></tr></thead><tbody>${stRows}</tbody></table></div>
      <div class="sctl pad"><label>Số vòng<input type="number" min="2" max="10" value="${S.R}" data-sg="R" class="sin w4"></label><label>Câu BTVN<input type="number" min="5" max="20" value="${S.nB}" data-sg="nB" class="sin w4"></label><label>Câu mini test<select data-sg="nM" class="sin">${[5,10,13].map(n=>`<option ${S.nM===n?"selected":""}>${n}</option>`).join("")}</select></label><label>Hạt ngẫu nhiên<input type="number" value="${S.seed}" data-sg="seed" class="sin w5"></label><button class="btn sm ghost" id="simReroll">Chạy lại với hạt khác</button></div></section>
    <section class="panel"><div class="phead"><h2>Theo vòng</h2><span class="sp"></span><button class="btn sm ghost" id="simPrev" ${t<=1?"disabled":""}>‹ Vòng trước</button><span class="sround">Đang xem tới <b>vòng ${t}</b>/${S.R}</span><button class="btn sm ghost" id="simNext" ${t>=S.R?"disabled":""}>Vòng sau ›</button><button class="btn sm pri" id="simPlay">${t>=S.R?"Chạy lại từ đầu":"Chạy hết"}</button></div>
      <div class="skpi"><div><span class="kn num">${hit}/${cp}</span><span class="kl">lượt chép được cảnh báo</span></div><div><span class="kn num ${fa?"warn-t":""}">${fa}/${hon}</span><span class="kl">lượt tự làm bị cảnh báo nhầm</span></div><div><span class="kn num">${csh}/${cs}</span><span class="kl">em có chép bị phát hiện</span></div><div><span class="kn num ${hsf?"warn-t":""}">${hsf}/${hs}</span><span class="kl">em chỉ tự làm mà từng bị cảnh báo</span></div><div><span class="kn num">${v1(err.toFixed(2))}</span><span class="kl">sai số θ trung bình sau vòng ${t}</span></div></div>
      <div class="srulebox"><label class="smode"><b>Cách gắn cảnh báo</b><select data-smode class="sin"><option value="ev" ${S.mode==="ev"?"selected":""}>Cộng dồn bằng chứng qua các vòng (đề xuất, ít cảnh báo nhầm)</option><option value="fix" ${S.mode!=="ev"?"selected":""}>Ngưỡng từng vòng + quy tắc bổ sung</option></select></label>
      ${S.mode==="ev"?`<p class="small">Mỗi vòng tính <b>độ lệch chuẩn hoá</b> e = (z + d/SE)/√2, trong đó d = BTVN − mini, SE là mức dao động tự nhiên của d với số câu hiện có. Bằng chứng cộng dồn B = max(0, B trước + e − 0,75): vòng lệch nhẹ do may rủi bị trừ dần, chỉ lệch lặp lại mới tích lại. B ≥ 2 → Nên kiểm tra thêm · B ≥ 4,5 hoặc e ≥ 3,5 trong một vòng → Cần cô xác nhận · tín hiệu yếu (e ≥ 1,2 hoặc có cờ z) → "Theo dõi": chỉ ghi lại, không báo cô, không tính là cảnh báo.</p>`:`<b>Quy tắc bổ sung</b>`}${S.mode==="ev"?"":`<label><input type="checkbox" data-ru="r1" ${S.ru.r1?"checked":""}> 1. BTVN vượt dự kiến ≥ 2 và cao hơn mini ≥ 1,5 → Nên kiểm tra thêm</label><label><input type="checkbox" data-ru="r2" ${S.ru.r2?"checked":""}> 2. BTVN cao hơn mini ≥ 1,5 ở 2 trong 3 vòng gần nhất → Nên kiểm tra thêm</label><label><input type="checkbox" data-ru="r3" ${S.ru.r3?"checked":""}> 3. Có cờ z cao thì không để Khớp → Nên kiểm tra thêm</label>`}${S.mode==="ev"?"":`<span class="muted small">Nhãn đổi do quy tắc bổ sung có dấu *; rê chuột vào nhãn để xem lý do.</span>`}<button class="btn sm" id="simCmp">So sánh các tổ hợp trên 100 lần chạy (mất vài giây)</button></div>
      ${S.cmp?`<div class="scrollx"><table class="tbl compact scmp"><thead><tr><th>Tổ hợp</th><th class="num">Lượt chép được cảnh báo</th><th class="num">Bỏ sót</th><th class="num">Cảnh báo nhầm (lượt tự làm)</th><th class="num">"Cần cô xác nhận" đúng là chép</th><th class="num">Em có chép bị phát hiện</th><th class="num">Em tự làm từng bị cảnh báo</th></tr></thead><tbody>${S.cmp.map(c=>`<tr><td>${c.n}</td><td class="num">${Math.round(100*c.hit/c.cp)}%</td><td class="num">${c.miss}</td><td class="num">${v1(Math.round(1000*c.fa/c.hon)/10)}%</td><td class="num">${c.nh?Math.round(100*c.nhc/c.nh)+"% / "+c.nh+" lượt":"—"}</td><td class="num">${Math.round(100*c.csh/c.cs)}%</td><td class="num"><b>${Math.round(100*c.hsf/c.hs)}%</b></td></tr>`).join("")}</tbody></table><p class="small muted">Cùng nhóm em, cùng số vòng, chạy lại với 100 hạt ngẫu nhiên khác nhau (${S.cmp[0].cp} lượt chép, ${S.cmp[0].hon} lượt tự làm).</p></div>`:""}
      <div class="scrollx"><table class="sgridt"><thead><tr><th></th>${Array.from({length:S.R},(_,j)=>`<th class="${j<t?"":"fut"}">Vòng ${j+1}</th>`).join("")}</tr></thead><tbody>${grid}</tbody></table></div>
      <details class="srules small"><summary>Quy tắc đang dùng trong mô phỏng</summary><p>Mỗi vòng: BTVN có độ khó quanh θ ước tính − 0,4 (khoảng 70% khả năng đúng), trải từ dễ đến khó. Mini test làm trên lớp nên không chép được. Dự kiến = điểm em nên đạt theo θ ước tính trước vòng.</p><p><b>Đối chiếu</b> (d = BTVN − mini test): Cần cô xác nhận khi d ≥ 3,5, hoặc d ≥ 2,5 và BTVN cao hơn dự kiến ≥ 2,5 · Nên kiểm tra thêm khi d ≥ 2,5 · BTVN thấp hơn sức khi d ≤ −3 · Cao hơn dự kiến khi mini test cao hơn dự kiến ≥ 2 · còn lại là Khớp BTVN. Sau đó áp các quy tắc bổ sung đang bật (chỉ nâng mức, không hạ).</p><p><b>Cờ z</b>: Điểm cao bất thường z ≥ 2 · Đúng nhiều câu khó z ≥ 1,5 và ≥ 2 câu khó · Thấp hơn sức z ≤ −2. <b>Cập nhật năng lực</b>: mini test tin 100%; BTVN tin 100% nếu Khớp, 50% nếu có cờ z hoặc BTVN thấp hơn sức, 30% nếu Nên kiểm tra thêm, 0% nếu Cần cô xác nhận hoặc làm nhanh liên tục.</p></details><p class="small muted">Ô có viền cam là vòng em thật sự chép BTVN. Bấm một dòng để xem chi tiết bên dưới. "Cảnh báo" tính cả nhãn Nên kiểm tra thêm, Cần cô xác nhận và cờ z cao.</p></section>${detail}`},
  bind(){const S=simState();
    document.querySelectorAll("[data-sf]").forEach(el=>el.onchange=()=>{const [i,f]=el.dataset.sf.split(":");const v=["t0","g","from"].includes(f)?+el.value:el.value;S.st[+i][f]=v;S.cmp=null;render()});
    document.querySelectorAll("[data-sg]").forEach(el=>el.onchange=()=>{S[el.dataset.sg]=+el.value;if(el.dataset.sg==="R")S.t=S.R;S.cmp=null;render()});
    on("[data-ssel]",el=>{S.sel=+el.dataset.ssel;render();const d=document.querySelectorAll("#main .panel")[2];d&&d.scrollIntoView({behavior:"smooth",block:"start"})});
    on("[data-sdel]",el=>{S.st.splice(+el.dataset.sdel,1);S.sel=0;render()});
    const b=(id,f)=>{const e=document.querySelector(id);if(e)e.onclick=f};
    b("#simAdd",()=>{S.st.push({name:"Em "+(S.st.length+1),t0:0,g:0,beh:"tu",from:3});S.sel=S.st.length-1;render()});
    b("#simReset",()=>{UI.sim=null;render()});b("#simReroll",()=>{S.seed=(S.seed*31+17)%997;render()});
    b("#simPrev",()=>{S.t=Math.max(1,S.t-1);render()});b("#simNext",()=>{S.t=Math.min(S.R,S.t+1);render()});b("#simTbl",()=>{S.tbl=!S.tbl;render()});b("#simCmp",()=>{S.cmp=simCompare(S);render()});
    const sm=document.querySelector("[data-smode]");if(sm)sm.onchange=()=>{S.mode=sm.value;render()};
    document.querySelectorAll("[data-ru]").forEach(el=>el.onchange=()=>{S.cmp=S.cmp;S.ru[el.dataset.ru]=el.checked?(el.dataset.ru==="r2"?"soft":true):false;S.cmp=null;render()});
    b("#simPlay",()=>{if(S.t>=S.R)S.t=1;render();clearInterval(UI.simTimer);UI.simTimer=setInterval(()=>{if(UI.r.v!=="sim"||S.t>=S.R){clearInterval(UI.simTimer);return}S.t++;render()},700)});
    const tip=simTip();document.querySelectorAll(".ssvg").forEach(svg=>{const cr=svg.querySelector(".scross");
      svg.querySelectorAll("[data-tip]").forEach(h=>{h.onmousemove=e=>{tip.textContent=h.dataset.tip;tip.style.display="block";tip.style.left=Math.min(innerWidth-240,e.clientX+14)+"px";tip.style.top=(e.clientY+14)+"px";cr.setAttribute("x1",h.dataset.cx);cr.setAttribute("x2",h.dataset.cx);cr.style.display=""};h.onmouseleave=()=>{tip.style.display="none";cr.style.display="none"}})})}
};
