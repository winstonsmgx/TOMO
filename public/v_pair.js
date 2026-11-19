/* ===== Mô phỏng theo cặp câu: câu gốc ở nhà ↔ câu sinh đôi trên lớp (chỉ dùng cho prototype) =====
   Dùng 10 câu Bài về nhà Unit 12 và 10 câu sinh đôi viết sẵn (cùng kỹ năng, cùng rubric nên cùng độ khó b).
   Cho thấy từng cặp: em làm câu gốc thế nào, câu sinh đôi thế nào, và các chỉ số z, d/SE, lz, r được tính ra sao. */
const PAIR_TWINS=[
 {stem:"A person who travels into space is called an ___.",options:["astronaut","alien","planet","rocket"],answer:0},
 {stem:"Jupiter is the biggest ___ in our solar system.",options:["star","planet","moon","sun"],answer:1},
 {stem:"Choose the word with a different stress pattern.",options:["rocket","oxygen","galaxy","attack"],answer:3},
 {stem:"\"I am hungry,\" he said. → He said that he ___ hungry.",options:["is","was","were","be"],answer:1},
 {stem:"\"We can see the stars,\" they said. → They said they ___ see the stars.",options:["can","could","will","may"],answer:1},
 {stem:"\"Are you interested in space?\" she asked me. → She asked me ___ I was interested in space.",options:["whether","that","what","are"],answer:0},
 {stem:"\"When do you get up?\" Nam asked me. → Nam asked me ___.",options:["when I got up","when did I get up","when I get up","when do I get up"],answer:0},
 {stem:"\"What is she reading?\" Lan asked. → Lan asked what she ___ reading.",options:["is","was","were","does"],answer:1},
 {stem:"(Đoạn 60 từ về một xe tự hành trên sao Hỏa) Which detail is TRUE?",options:["The rover takes photos of rocks.","The rover carries people.","The rover is on the Moon.","The rover never sends data."],answer:0},
 {stem:"(Cùng đoạn) What can be inferred from the passage?",options:["Every rover finds life.","The photos may help scientists plan future trips.","Mars is easy to reach.","Scientists have stopped exploring Mars."],answer:1}];
const PAIR_BEH={tu:"Tự làm",chepkho:"Chép riêng câu khó",chephet:"Chép cả bài",hongnen:"Hổng nền (trọng âm, từ vựng)"};
const PAIR_G={dk:["Đ-khó","em đúng câu khó với em (p < 50%)"],dd:["Đ-dễ","em đúng câu dễ (p ≥ 75%)"],sd:["S-dễ","em sai câu dễ (p ≥ 75%)"],sk:["S-khó","em sai câu khó (p < 50%)"],mid:["Giữa","p 50–75%: không chọn để đối chiếu"]};
function pairState(){if(!UI.pair)UI.pair={th:-0.5,est:0.3,beh:"chepkho",seed:3};return UI.pair}
const pP=(th,b)=>0.25+0.75*sig(th-b);
/* một lượt: em làm bài về nhà (câu gốc) rồi mini test (câu sinh đôi) */
function pairRun(S,R){const items=D.U12.map((x,i)=>({o:x,t:PAIR_TWINS[i],b:bOf(x.rub),i}));
  const weak=it=>["NA.TA.01","TV.CD.05"].includes(it.o.skill);
  return items.map(it=>{const pe=pP(S.est,it.b),pt=pP(S.th,it.b);
    const okH=S.beh==="chephet"?R()<0.95:S.beh==="chepkho"&&pe<0.5?R()<0.95:S.beh==="hongnen"&&weak(it)?R()<0.3:R()<pt;
    const okM=S.beh==="hongnen"&&weak(it)?R()<0.3:R()<pt; /* trên lớp không chép được */
    const g=okH&&pe<0.5?"dk":okH&&pe>=0.75?"dd":!okH&&pe>=0.75?"sd":!okH&&pe<0.5?"sk":"mid";
    return Object.assign(it,{pe,pt,okH,okM,g})})}
/* chọn câu đối chiếu cho bài 10 phút: 3 Đ-khó, 1 Đ-dễ, 2 S-dễ; còn lại là câu mới */
/* dấu vết hành vi khi làm ở nhà: lượt có chép để lại dấu vết với xác suất q (mặc định 60%), em tự làm 5% */
function pairTrace(S,R){return ["chepkho","chephet"].includes(S.beh)?R()<(S.q==null?0.6:S.q):R()<0.05}
function pairPick(rows){const W={dk:3,dd:1,sd:2,sk:0},used={};rows.forEach(x=>{x.sel=false});
  ["dk","dd","sd","sk"].forEach(g=>{rows.filter(x=>x.g===g).sort((a,b)=>g==="dk"||g==="sk"?a.pe-b.pe:b.pe-a.pe).slice(0,W[g]).forEach(x=>{x.sel=true})});return rows}
function pairStats(rows){const P=r=>r.pe,sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
  const kH=rows.filter(x=>x.okH).length,kM=rows.filter(x=>x.okM).length,E=sum(rows,P),V=sum(rows,x=>P(x)*(1-P(x)));
  const z=(kH-E)/Math.sqrt(V),sH=kH,sM=kM,d=sH-sM,SE=Math.sqrt(2*V*1)/1; /* điểm thang 10 với 10 câu: phương sai = Σp(1−p) mỗi bài */
  const dk=rows.filter(x=>x.sel&&x.g==="dk");const Ek=sum(dk,P),Vk=sum(dk,x=>P(x)*(1-P(x))),ok=dk.filter(x=>x.okM).length;
  const r=dk.length?(ok-Ek)/Math.sqrt(Math.max(Vk,0.05)):null;
  const sd=rows.filter(x=>x.sel&&x.g==="sd"),sdStill=sd.filter(x=>!x.okM).length;
  const lzH=lzOf(rows.map(x=>x.okH),rows.map(P)),lzM=lzOf(rows.map(x=>x.okM),rows.map(P));
  const e2=(z+d/SE)/Math.SQRT2,e3=r==null?e2:(z+d/SE+r)/Math.sqrt(3);
  const hx=rows.filter(x=>x.pe<0.65).reduce((q,x)=>q+(x.okH?1:0)-x.pe,0);
  /* Hỏi em ngay: 3 câu em làm đúng ở nhà, khó nhất với em; em làm câu sinh đôi trên máy cô */
  const oral=rows.filter(x=>x.okH).sort((a,b)=>a.pe-b.pe).slice(0,3);const oralOk=oral.filter(x=>x.okM).length;
  return {kH,kM,E,V,z,d,SE,dk,Ek,ok,r,sd,sdStill,lzH,lzM,e2,e3,hx,oral,oralOk}}
/* Các cách kiểm chứng: mỗi cách quyết định "gắn cờ" hay không cho một em */
const PAIR_METHODS=[
 {k:"z",n:"Chỉ nhìn bài về nhà (z ≥ 2)",cost:"0 phút",f:(st)=>st.z>=2},
 {k:"bh",n:"Theo dõi hành vi khi làm bài (dán, chụp màn hình, rời app, quá nhanh)",cost:"0 phút",f:(st,tr)=>tr},
 {k:"lz",n:"Kiểu đúng sai ở nhà (lz nhà ≤ −2 và đúng câu khó nhiều hơn dự kiến)",cost:"0 phút",f:(st)=>st.lzH<=-2&&st.hx>=1},
 {k:"mini",n:"Mini test cả đề, so tổng điểm (e ≥ 2,5)",cost:"10 phút cả lớp",f:(st)=>st.e2>=2.5},
 {k:"r",n:"Mini test có mục tiêu: e ≥ 2,5 hoặc cặp Đ-khó r ≤ −1,5",cost:"10 phút cả lớp",f:(st)=>st.e2>=2.5||(st.r!=null&&st.r<=-1.5)},
 {k:"oral",n:"Hỏi em ngay 3 câu khó em đã làm đúng: đúng 0/3",cost:"2–3 phút mỗi em",f:(st)=>st.oral.length===3&&st.oralOk===0},
 {k:"all",n:"Kết hợp một vòng: hành vi + kiểu đúng sai + mini test có mục tiêu (cần ≥ 2 tín hiệu, hoặc e ≥ 2,5)",cost:"10 phút cả lớp",f:(st,tr)=>st.e2>=2.5||[tr,st.lzH<=-2&&st.hx>=1,st.r!=null&&st.r<=-1.5,st.z>=2].filter(Boolean).length>=2},
 {k:"multi",n:"Cộng dồn 3 vòng: B ≥ 2, hoặc một vòng e ≥ 2,5, hoặc r ≤ −1,5",cost:"3 mini test",multi:true}];
function pairMethods(S,n){const prof=[["chosen",Object.assign({},S)],["tu",Object.assign({},S,{beh:"tu",est:S.th})],["hongnen",Object.assign({},S,{beh:"hongnen",est:S.th})]];const out={};
  prof.forEach(([key,P],pi)=>{const R=rng(4242+pi*97);const c={};PAIR_METHODS.forEach(m=>c[m.k]=0);
    for(let k=0;k<n;k++){const st=pairStats(pairPick(pairRun(P,R))),tr=pairTrace(P,R);PAIR_METHODS.forEach(m=>{if(!m.multi&&m.f(st,tr))c[m.k]++});
      let B=0,hit=false;for(let t=0;t<3;t++){const s2=t?pairStats(pairPick(pairRun(P,R))):st;const e=s2.e2+((t?pairTrace(P,R):tr)?0.5:0);B=Math.max(0,B+e-0.75);if(e>=2.5||B>=2||(s2.r!=null&&s2.r<=-1.5))hit=true}if(hit)c.multi++}
    PAIR_METHODS.forEach(m=>c[m.k]/=n);out[key]=c});return out}
function pairMC(S,n){const out={};for(const beh of ["tu",S.beh]){const R=rng(9001+(beh==="tu"?0:7));let a2=0,a3=0,aR=0,rN=0,rLow=0,nDk=0;
  for(let k=0;k<n;k++){const st=pairStats(pairPick(pairRun(Object.assign({},S,{beh,est:beh==="tu"?S.th:S.est}),R)));if(st.e2>=2.5)a2++;if(st.e3>=2.5)a3++;if(st.e2>=2.5||(st.r!=null&&st.r<=-1.5))aR++;nDk+=st.dk.length;if(st.r!=null){rN++;if(st.r<=-1.5)rLow++}}
  out[beh]={a2:a2/n,a3:a3/n,aR:aR/n,rLow:rLow/n,dk:nDk/n}}return out}
VIEWS.pair={
  html(){const S=pairState();const R=rng(S.seed*131+7);const rows=pairPick(pairRun(S,R));const st=pairStats(rows);const v1p=x=>String(Math.round(x*100)/100).replace(".",",");const pct=x=>Math.round(x*100)+"%";
    const opt=(o,a,me)=>o.map((t,k)=>`<span class="pq ${k===a?"ans":""} ${me!=null&&k===me&&k!==a?"me":""}">${ABCD[k]}. ${esc(t)}</span>`).join("");
    const pick=(it,ok,which)=>{const a=which==="o"?it.o.answer:it.t.answer;return ok?a:(a+1)%4};
    const read=x=>x.g==="dk"?(x.okM?"Làm lại đúng: hiểu thật":"Làm lại sai: câu gốc có thể không phải em tự làm (nhưng em làm thật cũng chỉ có "+pct(x.pe)+" khả năng đúng lại)"):x.g==="dd"?(x.okM?"Đúng lại: làm bình thường":"Sai câu dễ: có thể làm ẩu hoặc mệt"):x.g==="sd"?(x.okM?"Lần này đúng: lần trước làm ẩu":"Vẫn sai: có thể hổng nền"):x.g==="sk"?(x.okM?"Lần này đúng: tiến bộ sau khi chữa":"Vẫn sai: bình thường"):"Câu mới, không đối chiếu";
    const MC=UI.pairMC;
    return `<div class="title-row"><h1>Mô phỏng theo cặp câu</h1><span class="pill warn">Chỉ dùng cho prototype</span></div>
    <p class="lede">Một em làm Bài về nhà Unit 12 (10 câu gốc), sau đó làm mini test gồm 10 câu sinh đôi (cùng kỹ năng, cùng độ khó, đổi từ ngữ và đáp án). Trang này cho thấy từng cặp câu và cách hệ thống tính z, d/SE, lz và chỉ số theo cặp r.</p>
    <section class="panel"><div class="phead"><h2>Em mô phỏng</h2></div><div class="sctl">
      <label title="Năng lực thật của em; chỉ mô phỏng mới biết">θ thật<input type="number" step="0.1" min="-2" max="2" value="${S.th}" data-pg="th" class="sin w4"></label>
      <label title="Mức hệ thống đang tin; em chép ở các bài trước sẽ bị đẩy lên cao hơn θ thật">θ hệ thống ước tính<input type="number" step="0.1" min="-2" max="2.5" value="${S.est}" data-pg="est" class="sin w4"></label>
      <label>Cách làm bài về nhà<select data-pg="beh" class="sin">${Object.entries(PAIR_BEH).map(([k,v])=>`<option value="${k}" ${S.beh===k?"selected":""}>${v}</option>`).join("")}</select></label>
      <button class="btn sm ghost" id="pgRe">Cho em làm lại (hạt khác)</button></div>
      <p class="small muted">Gợi ý thử: θ thật −0,5, θ ước tính 0,3, "Chép riêng câu khó" (hệ thống tưởng em giỏi hơn vì các bài trước em chép), rồi bấm Chạy ở cuối trang để so với em tự làm. Thử θ ước tính 0,7: đề gần như không còn câu Đ-khó nên r không tính được.</p></section>

    <section class="panel flush"><div class="phead pad"><h2>Từng cặp câu</h2><span class="muted">${rows.filter(x=>x.sel).length} cặp dùng để đối chiếu · ${rows.filter(x=>!x.sel).length} câu mới · đáp án đúng tô xanh, phương án em chọn sai tô đỏ</span></div>
      <div class="scrollx"><table class="tbl compact pairt"><thead><tr><th>Câu</th><th>Câu gốc (bài về nhà)</th><th>Ở nhà</th><th>Nhóm</th><th>Câu sinh đôi (mini test)</th><th>Trên lớp</th><th class="num" title="Khả năng đúng theo θ hệ thống ước tính">p</th><th>Đọc cặp</th></tr></thead><tbody>
      ${rows.map(x=>`<tr class="${x.sel?"":"pdim"}"><td class="num">${x.i+1}<span class="sub">b ${v1p(x.b)}</span></td>
        <td><div class="pstem">${esc(x.o.stem)}</div><div class="popts">${opt(x.o.options,x.o.answer,pick(x,x.okH,"o"))}</div></td>
        <td>${x.okH?`<b class="pos-t">Đúng</b>`:`<b class="neg-t">Sai</b>`}</td>
        <td>${x.sel?`<span class="mgc g-${x.g}" title="${PAIR_G[x.g][1]}">${PAIR_G[x.g][0]}</span>`:`<span class="muted small">${x.g==="mid"?"Giữa":PAIR_G[x.g][0]+" (thừa)"}</span>`}</td>
        <td><div class="pstem">${esc(x.t.stem)}</div><div class="popts">${opt(x.t.options,x.t.answer,pick(x,x.okM,"t"))}</div></td>
        <td>${x.okM?`<b class="pos-t">Đúng</b>`:`<b class="neg-t">Sai</b>`}</td>
        <td class="num">${pct(x.pe)}</td><td class="small">${x.sel?esc(read(x)):`<span class="muted">Câu mới, không đối chiếu</span>`}</td></tr>`).join("")}
      </tbody></table></div></section>

    <section class="panel"><div class="phead"><h2>Các chỉ số của lượt này</h2></div>
      <div class="pgrid">
        <div class="pbox"><b>z</b> (ở nhà so với sức)<div class="pv">${v1p(st.z)}</div><div class="small muted">Đúng ${st.kH}/10, dự kiến Σp = ${v1p(st.E)}; z = (${st.kH} − ${v1p(st.E)}) / √${v1p(st.V)}</div></div>
        <div class="pbox"><b>d/SE</b> (ở nhà so với trên lớp)<div class="pv">${v1p(st.d/st.SE)}</div><div class="small muted">d = ${st.kH} − ${st.kM} = ${st.d}; SE = √(2 × ${v1p(st.V)}) = ${v1p(st.SE)}</div></div>
        <div class="pbox ${st.r!=null&&st.r<=-1.5?"pwarn":""}"><b>r</b> (theo cặp Đ-khó)<div class="pv">${st.r==null?"—":v1p(st.r)}</div><div class="small muted">${st.dk.length?`Câu khó em đúng ở nhà: trên lớp làm lại đúng ${st.ok}/${st.dk.length}, dự kiến nếu em làm thật ${v1p(st.Ek)}. r = (${st.ok} − ${v1p(st.Ek)}) / √Σp(1−p)`:"Em không có câu Đ-khó nào: lần này chưa tính được r"}</div></div>
        <div class="pbox"><b>S-dễ</b> (câu dễ em sai ở nhà)<div class="pv">${st.sd.length?`${st.sdStill}/${st.sd.length} vẫn sai`:"—"}</div><div class="small muted">Vẫn sai nhiều, lặp lại qua các vòng: hổng nền, không phải chép</div></div>
        <div class="pbox"><b>lz</b> nhà / lớp<div class="pv">${v1p(st.lzH)} / ${v1p(st.lzM)}</div><div class="small muted">Kiểu đúng sai: âm nhiều là đúng câu khó mà sai câu dễ</div></div>
        <div class="pbox"><b>e</b> của vòng<div class="pv">${v1p(st.e2)} → ${v1p(st.e3)}</div><div class="small muted">Hiện tại: (z + d/SE)/√2 · Thêm r: (z + d/SE + r)/√3. e ≥ 2,5: Nên kiểm tra thêm</div></div>
      </div>
      <p class="small">Lưu ý: câu Đ-khó là câu em chỉ có dưới 50% khả năng đúng, nên em làm thật cũng hay sai lại câu sinh đôi. r so với số câu <b>dự kiến</b> đúng lại, không so với "phải đúng hết". Em chép thì hệ thống tưởng em giỏi hơn (θ ước tính cao), nên dự kiến đúng lại nhiều hơn mức em thật sự làm được: r âm.</p></section>
    ${(()=>{const tr=pairTrace(S,rng(S.seed*131+999));const sig_=[[st.e2>=2.5,`Độ lệch của vòng e = ${v1p(st.e2)} ≥ 2,5`],[st.r!=null&&st.r<=-1.5,`Câu khó em làm đúng ở nhà, trên lớp làm lại đúng ${st.ok}/${st.dk.length} (dự kiến ${v1p(st.Ek)})`],[st.lzH<=-2&&st.hx>=1&&st.lzM>-2,"Ở nhà đúng câu khó mà sai câu dễ, trên lớp thì không"],[tr,"Có dấu vết hành vi khi làm ở nhà"],[st.z>=2,`Ở nhà cao hơn sức (z = ${v1p(st.z)})`]].filter(x=>x[0]).map(x=>x[1]);
      const odd=st.lzM<=-2&&st.kM>=st.E-2,hong=st.sd.length&&st.sdStill===st.sd.length;
      const lab=st.e2>=3.5?["Cần cô xác nhận","s-neg"]:sig_.length>=2||st.e2>=2.5||(st.r!=null&&st.r<=-1.5)?["Nên kiểm tra thêm","s-warn"]:odd?["Kiểu làm khác thường, có làm trên lớp","s-info"]:sig_.length===1?["Theo dõi (cô không thấy)","s-mute"]:["Khớp","s-pos"];
      const truth={tu:"em tự làm",chepkho:"em chép riêng câu khó",chephet:"em chép cả bài",hongnen:"em hổng nền thật"}[S.beh];
      const right=(S.beh==="tu"&&["Khớp","Theo dõi (cô không thấy)"].includes(lab[0]))||(["chepkho","chephet"].includes(S.beh)&&["Nên kiểm tra thêm","Cần cô xác nhận"].includes(lab[0]))||(S.beh==="hongnen"&&!["Nên kiểm tra thêm","Cần cô xác nhận"].includes(lab[0]));
      return `<section class="panel pconc"><div class="phead"><h2>Kết luận của lượt này</h2></div>
        <p><span class="apill ${lab[1]}">${lab[0]}</span> ${sig_.length?"Tín hiệu: "+sig_.map(esc).join(" · ")+".":"Không có tín hiệu nào vượt ngưỡng."}${hong?" Câu dễ em sai ở nhà, trên lớp vẫn sai: gợi ý ôn kỹ năng nền.":""}</p>
        <p class="small">Thực tế mô phỏng: <b>${truth}</b>. Hệ thống ${right?`<b class="pos-t">gợi ý đúng</b>`:`<b class="neg-t">gợi ý chưa đúng</b>`} ở lượt này${right?"":S.beh==="tu"||S.beh==="hongnen"?" (báo nhầm: cô sẽ hỏi em rồi kết luận em tự làm)":" (bỏ sót: cần thêm vòng sau hoặc cách kiểm chứng khác)"}. Một lượt có thể may hoặc rủi; xem bảng so sánh bên dưới để biết tỉ lệ qua 600 lượt.</p></section>`})()}

    <section class="panel"><div class="phead"><h2>So sánh các cách kiểm chứng và theo dõi</h2><span class="muted small">600 lượt cho mỗi kiểu em, cùng θ</span><span class="sp"></span><label class="small">Lượt chép để lại dấu vết <select data-pg="q" class="sin">${[0.6,0.3,0].map(q=>`<option value="${q}" ${(S.q==null?0.6:S.q)===q?"selected":""}>${q*100}%</option>`).join("")}</select></label><button class="btn sm pri" id="pgMC">${MC?"Chạy lại":"Chạy"}</button></div>
      ${MC?(()=>{const ch=S.beh,isCopy=["chepkho","chephet"].includes(ch);
        const score=m=>isCopy?MC.chosen[m.k]-2*MC.tu[m.k]-MC.hongnen[m.k]:-(MC.chosen[m.k]);
        const best=PAIR_METHODS.slice().sort((a,b)=>score(b)-score(a))[0];
        const oral=PAIR_METHODS.find(m=>m.k==="oral"),mini=PAIR_METHODS.find(m=>m.k==="mini");
        return `<table class="tbl compact pmeth"><thead><tr><th>Cách</th><th>Chi phí</th><th class="num">${isCopy?"Bắt được em "+esc(PAIR_BEH[ch].toLowerCase()):"Em đang chọn ("+esc(PAIR_BEH[ch].toLowerCase())+") bị gắn cờ"}</th><th class="num">Báo nhầm em tự làm</th><th class="num">Báo nhầm em hổng nền</th></tr></thead><tbody>
        ${PAIR_METHODS.map(m=>`<tr class="${m.k===best.k?"pbest":""}"><td>${esc(m.n)}${m.k===best.k?` <span class="apill s-pos">tốt nhất ở thiết lập này</span>`:""}</td><td class="small">${m.cost}</td><td class="num"><b>${pct(MC.chosen[m.k])}</b></td><td class="num ${MC.tu[m.k]>0.1?"neg-t":""}">${pct(MC.tu[m.k])}</td><td class="num ${MC.hongnen[m.k]>0.1?"neg-t":""}">${pct(MC.hongnen[m.k])}</td></tr>`).join("")}</tbody></table>
        <div class="pconc"><b>Kết luận</b><ul class="dash">
          ${isCopy?`<li>Với em ${esc(PAIR_BEH[ch].toLowerCase())} (θ thật ${v1p(S.th)}, hệ thống ước tính ${v1p(S.est)}), cách cân bằng nhất giữa bắt được và báo nhầm là <b>${esc(best.n)}</b>: bắt ${pct(MC.chosen[best.k])}, báo nhầm em tự làm ${pct(MC.tu[best.k])}, em hổng nền ${pct(MC.hongnen[best.k])}.</li>`:`<li>Em đang chọn là "${esc(PAIR_BEH[ch])}": mọi cờ ở cột thứ ba là báo nhầm. Cách gây ít báo nhầm nhất là <b>${esc(best.n)}</b> (${pct(MC.chosen[best.k])}).</li>`}
          ${isCopy?`<li>Hỏi em ngay đơn lẻ: bắt ${pct(MC.chosen.oral)}, nhưng báo nhầm em tự làm ${pct(MC.tu.oral)}, vì câu khó em làm thật cũng hay sai lại. Nên dùng Hỏi em ngay để <b>xác nhận</b> sau khi đã có tín hiệu, không dùng để sàng lọc.</li>
          <li>Mini test so tổng điểm: ${pct(MC.chosen.mini)}; thêm cặp Đ-khó (r): ${pct(MC.chosen.r)}; kết hợp một vòng: ${pct(MC.chosen.all)}. Cộng dồn 3 vòng: ${pct(MC.chosen.multi)} nhưng báo nhầm em tự làm cũng lên ${pct(MC.tu.multi)}, vì càng nhiều vòng càng nhiều lần có thể rủi.</li>`
          :`<li>Hỏi em ngay đơn lẻ gắn cờ nhầm ${pct(MC.chosen.oral)} số em này: câu khó em làm thật cũng hay sai lại. Chỉ dùng Hỏi em ngay để <b>xác nhận</b> sau khi đã có tín hiệu.</li>
          <li>Cộng dồn 3 vòng gắn cờ nhầm ${pct(MC.chosen.multi)}; mini test có mục tiêu ${pct(MC.chosen.r)}; kết hợp một vòng ${pct(MC.chosen.all)}.</li>`}
          <li>Em hổng nền bị báo nhầm nhiều nhất ở cách "${esc(PAIR_METHODS.slice().sort((a,b)=>MC.hongnen[b.k]-MC.hongnen[a.k])[0].n)}" (${pct(Math.max(...PAIR_METHODS.map(m=>MC.hongnen[m.k])))}); cách nào dựa trên kiểu đúng sai ở nhà mà không đối chiếu trên lớp đều dễ nhầm em này.</li>
          <li>Theo dõi hành vi phụ thuộc giả định "lượt chép để lại dấu vết" (${Math.round((S.q==null?0.6:S.q)*100)}%); đổi ô chọn ở trên để xem khi em chép kín đáo hơn.</li></ul></div>`})()
      :`<p class="muted small">Bấm Chạy: mỗi cách kiểm chứng được thử 600 lượt với em có cách làm đang chọn, em tự làm và em hổng nền cùng mức θ; trang đưa ra kết luận cách nào nên dùng.</p>`}</section>`},
  bind(){const S=pairState();
    document.querySelectorAll("[data-pg]").forEach(el=>el.onchange=()=>{const k=el.dataset.pg;S[k]=k==="beh"?el.value:+el.value;if(k==="beh"&&el.value==="tu")S.est=S.th;UI.pairMC=null;render()});
    const re=document.querySelector("#pgRe");if(re)re.onclick=()=>{S.seed=(S.seed*37+11)%1000;render()};
    const mc=document.querySelector("#pgMC");if(mc)mc.onclick=()=>{mc.textContent="Đang chạy…";setTimeout(()=>{UI.pairMC=pairMethods(S,600);render()},20)};}
};
