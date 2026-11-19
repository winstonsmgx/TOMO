/* ===== Xem và chỉnh đề; gửi duyệt; dùng luôn; sinh đôi; giao bài ===== */
VIEWS.editor={
  html(){
    const e=find(UI.r.id);if(!e)return `<div class="empty-line">Không tìm thấy đề. <a href="#" data-back>Về Kho đề</a></div>`;
    const ro=e.place==="school"||e.status==="cho";const exp=expOf(e),mins=minutesOf(e.items),dis=e.dismiss||{};
    const lech=e.items.filter(i=>i.check==="lech").length;const ul=e.items.filter(i=>i.lostUnderline&&!i.ulOK).length;const given=DB.assigns.filter(a=>a.examId===e.id);
    let flags="";
    if(UI.asgBack&&!ro)flags+=`<div class="notice info gback"><b>Cô đang giao bài${UI.asgBack.cls.length?" cho "+esc(UI.asgBack.cls.join(", ")):""}.</b> Kiểm tra đề này xong (kể cả các câu cần xác nhận đáp án) thì bấm để quay lại giao. <button class="btn sm pri" id="gBack">Giao đề này${UI.asgBack.cls.length?" cho "+esc(UI.asgBack.cls.join(", ")):""}</button> <button class="btn sm ghost" id="gBackX">Không giao nữa</button></div>`;
    if(lech&&!ro)flags+=`<div class="notice warn"><b>${lech} câu cần cô xác nhận đáp án.</b> Cô chọn đáp án đúng ở từng câu hoặc bỏ câu đó; xong mới dùng hoặc gửi duyệt được.</div>`;
    if(ul&&!ro)flags+=`<div class="notice warn"><b>${ul} câu mất phần gạch chân khi tải lên.</b> TOMO đã khôi phục theo đáp án và lời giải của đề; cô xem lại từng câu được đánh dấu. <button class="btn sm" id="ulAll">Dùng bản khôi phục cho cả ${ul} câu</button></div>`;
    if(!ro&&mins>e.minutes&&!dis.long)flags+=`<div class="notice">Đề dài hơn ${e.minutes} phút (khoảng ${mins} phút), em làm chậm có thể không kịp. <button class="btn sm" id="trim">Bỏ bớt câu</button> <button class="btn sm ghost" data-dis="long">Giữ nguyên</button></div>`;
    if(!ro&&e.kind==="kt"&&exp>8.5&&!dis.easy)flags+=`<div class="notice">Điểm dự kiến của lớp là ${exp}/10, đề hơi dễ để kiểm tra. <button class="btn sm" id="addHard">Thêm câu khó</button> <button class="btn sm ghost" data-dis="easy">Giữ nguyên</button></div>`;
    if(!ro&&e.kind==="kt"&&exp<6.5&&!dis.hard)flags+=`<div class="notice">Đề hơi khó cho kiểm tra: điểm dự kiến ${exp}/10, mục tiêu 6.5–7.5. <button class="btn sm" id="rebal">Cân lại tự động</button> <button class="btn sm ghost" data-dis="hard">Giữ nguyên</button></div>`;
    if(e.status==="cho")flags+=`<div class="notice info">Đề đang chờ thầy Minh (tổ trưởng) duyệt. Cô vẫn xem được nhưng chưa sửa được.${e.leadNote?` Lời nhắn: "${esc(e.leadNote)}"`:""} <button class="btn sm ghost" id="withdraw">Rút lại</button>
      <div class="sim"><span class="muted small">Giả lập phía tổ trưởng:</span> <input type="text" id="leadC" placeholder="Nhận xét khi trả về" aria-label="Nhận xét của tổ trưởng"> <button class="btn sm" id="approve">Duyệt</button> <button class="btn sm" id="reject">Trả về</button></div></div>`;
    if(e.returned)flags+=`<div class="notice neg">Tổ trưởng chưa duyệt: "${esc(e.leadComment||"")}". Đề đã về nháp để cô sửa.</div>`;
    let lastSec=null,lastPas=null;
    const body=e.items.map((it,i)=>{let h="";if(it.sec&&it.sec!==lastSec){h+=`<h3 class="sec">${esc(it.sec)}</h3>`;lastSec=it.sec}if(it.passage&&it.passage!==lastPas){h+=`<div class="passage">${esc(it.passage)}</div>`;lastPas=it.passage}return h+itemView(e,it,i,ro)}).join("");
    let acts="";
    if(e.place==="nhap")acts=`<span class="muted small">Đề tự lưu vào Nháp.</span><span class="sp"></span><button class="btn" id="toDraft">Lưu nháp</button><button class="btn" data-send="${e.id}" ${lech?"disabled":""}>Gửi tổ trưởng duyệt</button><button class="btn pri" data-use="${e.id}" ${lech?"disabled":""}>Dùng đề này…</button>`;
    else if(e.place==="mine"&&e.status!=="cho")acts=`<span class="sp"></span>${e.status==="duyet"?"":`<button class="btn" data-send="${e.id}">Gửi tổ trưởng duyệt</button>`}${e.twinOf?"":`<button class="btn" id="twinBtn">Tạo mini test</button>`}<button class="btn pri" id="giveBtn">Giao bài</button>`;
    else if(e.place==="school")acts=`<span class="sp"></span><button class="btn pri" id="pullBtn">Lấy về đề của tôi</button>`;
    return `<nav class="crumb"><a href="#" data-back>Kho đề</a> ${ic("chev",12)} <span>${e.place==="nhap"?"Nháp":e.place==="school"?"Thư viện trường":"Sổ giao đề"}</span></nav>
    <div class="title-row">${backBtn("Quay lại")}<h1>${esc(e.title)}</h1>${statusPill(e)}</div>
    <p class="lede">Unit ${e.unit} · ${e.kind==="kt"?"Kiểm tra":"Luyện tập"} ${e.minutes} phút · <span class="mono">${e.id}</span>${given.length?` · đã giao cho ${given.map(a=>`<a href="#" data-gocls="${a.cls}" data-tab="result" data-aid="${a.id}">${a.cls} (${fmtD(a.given)})</a> <a href="#" class="wdl" data-wd="${a.id}" title="Đóng bài hoặc huỷ lượt giao này">rút lại</a>`).join(", ")}`:""}</p>
    <div class="planrow"><span class="flabel inl">Dành cho</span>${ro?`<span>${esc(e.plan&&e.plan.length?e.plan.join(", "):"Chưa chọn lớp")}</span>`:planPicker(e)}${e.plan&&e.plan.length?"":`<span class="muted small">Chưa chọn lớp</span>`}</div>
    ${flags}
    <div class="kpis"><div><span class="k">Số câu</span><span class="v num">${e.items.length}</span></div><div><span class="k">Thời gian ước tính</span><span class="v num">${mins}<span class="unit"> phút</span></span></div><div><span class="k">Điểm dự kiến (${esc(planLabel(e))})</span><span class="v num">${exp}<span class="unit">/10</span></span><span class="sub">${targetOf(e).map(id=>`${id} ${expOf(e,[id])}`).join(" · ")}</span></div><div class="wide"><span class="k">Độ khó của đề</span>${diffBar(e.items)}<span class="sub">${diffText(e.items)}</span></div></div>
    <div class="items">${body}</div>
    ${ro?"":`<div class="row gap"><button class="btn" id="addBlank">${ic("plus")} Thêm câu tự soạn</button><button class="btn ghost" id="fromBank">Thêm từ Ngân hàng câu</button></div>`}
    <div class="stick">${acts}</div>
    <div class="jump" id="jump" hidden><button class="btn sm inv" id="jPrev" aria-label="Câu cần xem trước">↑</button><button class="jmain" id="jNext"></button><button class="btn sm inv" id="jNext2" aria-label="Câu cần xem tiếp theo">↓</button></div>`;
  },
  bind(){
    on("[data-wd]",el=>withdrawModal(el.dataset.wd));
    const gb=document.querySelector("#gBack");if(gb)gb.onclick=()=>{const b=UI.asgBack,id=UI.r.id;const n=find(id).items.filter(i=>i.check==="lech").length;if(n){toast(`Còn ${n} câu cần cô xác nhận đáp án trước khi giao.`);const f=document.querySelector("[data-issue='1'],.item.flag");if(f)f.scrollIntoView({behavior:"smooth",block:"center"});return}assignModal(id,b.cls.length?b.cls:null,{fromUse:true})};const gx=document.querySelector("#gBackX");if(gx)gx.onclick=()=>{UI.asgBack=null;render()};
    const e=find(UI.r.id);on("[data-backbtn]",()=>goBack({v:"kho",tab:"book"}));on("[data-back]",()=>go({v:"kho",tab:e&&e.place==="nhap"?"nhap":e&&e.place==="school"?"school":"book"}));if(!e)return;
    on("[data-use]",el=>useNow(el.dataset.use));on("[data-send]",el=>sendLead(el.dataset.send));
    const q=s=>document.querySelector(s);
    q("#toDraft")&&(q("#toDraft").onclick=()=>{go({v:"kho",tab:"nhap"});toast("Đã lưu nháp.")});
    q("#twinBtn")&&(q("#twinBtn").onclick=()=>twinModal(e.id));q("#giveBtn")&&(q("#giveBtn").onclick=()=>assignModal(e.id));q("#pullBtn")&&(q("#pullBtn").onclick=()=>pull(e.id));
    q("#fromBank")&&(q("#fromBank").onclick=()=>go({v:"kho",tab:"bank"}));
    q("#withdraw")&&(q("#withdraw").onclick=()=>{e.place="nhap";e.status=null;save();render();toast("Đã rút lại. Đề quay về Nháp.")});
    q("#approve")&&(q("#approve").onclick=()=>{e.status="duyet";e.ver="v1";const lib=clone(e);lib.place="school";lib.owner=`${ME} · cô ${MY_NAME}`;DB.exams=DB.exams.filter(x=>!(x.place==="school"&&x.id===e.id));DB.exams.push(lib);save();render();toast("Tổ trưởng đã duyệt. Bản khoá v1 đã vào Thư viện trường.")});
    q("#reject")&&(q("#reject").onclick=()=>{e.place="nhap";e.status=null;e.returned=true;e.leadComment=q("#leadC").value.trim()||"Câu 4 có hai đáp án đúng.";save();render();toast("Tổ trưởng đã trả về. Đề đang ở Nháp.")});
    on("[data-plan]",el=>{const c=el.dataset.plan;e.plan=e.plan||[];e.plan=e.plan.includes(c)?e.plan.filter(x=>x!==c):[...e.plan,c];save();render()});
    on("[data-dis]",el=>{e.dismiss=Object.assign(e.dismiss||{},{[el.dataset.dis]:1});save();render()});
    q("#trim")&&(q("#trim").onclick=()=>{const before=clone(e.items);let n=0;while(minutesOf(e.items)>e.minutes&&e.items.length>3){let k=0;e.items.forEach((it,i)=>{if(it.b<e.items[k].b)k=i});e.items.splice(k,1);n++}save();render();toast(`Đã bỏ ${n} câu dễ nhất.`,()=>{e.items=before;save();render()})});
    q("#addHard")&&(q("#addHard").onclick=()=>{const c=DB.bank.filter(b=>!e.items.some(i=>i.id===b.id)).sort((a,b)=>b.b-a.b)[0];if(c){e.items.push(clone(c));save();render();toast("Đã thêm 1 câu khó từ Ngân hàng câu.")}});
    q("#rebal")&&(q("#rebal").onclick=()=>rebalance(e));
    q("#addBlank")&&(q("#addBlank").onclick=()=>{const s=(D.UNIT_SKILLS[e.unit]||["TV.TK.01"])[0];e.items.push(mkItem({id:newItemId(s),stem:"",options:["","","",""],skill:s,source:"GV",check:"gv",isNew:true}));UI.r.edit=e.items.length-1;UI.r.mode="fix";save();render()});
    on("[data-fix]",el=>{const [i,k]=el.dataset.fix.split(":").map(Number);const it=e.items[i];it.answer=k;it.check="gv";save();render();toast(`Đã xác nhận đáp án ${ABCD[k]} cho câu ${it.n||i+1}.`)});
    on("[data-fixrw]",el=>{const it=e.items[+el.dataset.fixrw];if(el.dataset.mode==="new")it.answer=it.fixTo;it.check="gv";save();render();toast("Đã cập nhật đáp án mẫu.")});
    on("[data-rm]",el=>{const i=+el.dataset.rm,before=clone(e.items);e.items.splice(i,1);save();render();toast(`Đã bỏ câu ${i+1}.`,()=>{e.items=before;save();render()})});
    on("[data-imenu]",el=>{const i=+el.dataset.imenu,it=e.items[i];popMenu(el,[...(it.type==="rewrite"?[]:[["Đổi câu cùng mức",()=>altPick(e,i,0)],["Đổi câu khó hơn",()=>altPick(e,i,1)],["Đổi câu dễ hơn",()=>altPick(e,i,-1)]]),["Sửa câu",()=>startEdit(e,i)],["Đánh giá lại mức",()=>rerate(e,i)],["Bỏ câu",()=>{const before=clone(e.items);e.items.splice(i,1);save();render();toast(`Đã bỏ câu ${i+1}.`,()=>{e.items=before;save();render()})}]])});
    on("[data-edit]",el=>startEdit(e,+el.dataset.edit));
    on("[data-lvq]",el=>rerate(e,+el.dataset.lvq));
    {const iss=[...document.querySelectorAll('[data-issue="1"]')];const J=q("#jump");if(J&&iss.length){J.hidden=false;let cur=-1;
      const lab=()=>{q("#jNext").textContent=cur<0?`${iss.length} câu cần cô xem · đến câu đầu tiên`:`Câu ${iss[cur].querySelector(".ihead b").textContent.replace("Câu ","")} · ${cur+1}/${iss.length} câu cần xem`};
      const goTo=k=>{cur=(k+iss.length)%iss.length;iss[cur].scrollIntoView({behavior:"smooth",block:"center"});iss.forEach(x=>x.classList.remove("focusq"));iss[cur].classList.add("focusq");lab()};
      lab();q("#jNext").onclick=()=>goTo(cur+1);q("#jNext2").onclick=()=>goTo(cur+1);q("#jPrev").onclick=()=>goTo(cur<0?iss.length-1:cur-1);}}
    on("[data-ulok]",el=>{const it=e.items[+el.dataset.ulok];it.ulOK=true;save();render();toast(`Đã dùng phần gạch chân khôi phục cho câu ${it.n}.`)});
    q("#ulAll")&&(q("#ulAll").onclick=()=>{e.items.forEach(it=>{if(it.lostUnderline&&RESTORE[it.n])it.ulOK=true});save();render();toast("Đã khôi phục phần gạch chân.")});
    on("[data-info]",el=>infoPop(el,e.items[+el.dataset.info]));
    on("[data-fav]",el=>{const it=e.items[+el.dataset.fav];toggleFav(it);save();render();toast(isFav(it)?"Đã đánh dấu câu hay. Câu nằm trong bộ lọc Yêu thích của Ngân hàng câu.":"Đã bỏ đánh dấu.")});
    on("[data-ecancel]",()=>{UI.r.edit=null;render()});
    on("[data-esave]",el=>{const i=+el.dataset.esave,it=e.items[i];const stem=q("#eStem").value.trim();if(!stem){toast("Cô nhập nội dung câu hỏi giúp nhé.");return}
      it.stem=stem;if(it.type!=="rewrite"){it.options=[0,1,2,3].map(k=>q("#eOpt"+k).value);const a=document.querySelector("input[name=eAns]:checked");it.answer=a?+a.value:it.answer}else it.answer=q("#eAns").value;
      it.lostUnderline=false;if(it.check==="lech"||it.check==="chua")it.check="gv";if(UI.r.mode==="new"){it.id=newItemId(it.skill);it.attempts=0;it.isNew=true;it.inBank=false}
      const mode=UI.r.mode;UI.r.edit=null;save();render();
      if(mode!=="typo")modal(mhead("Cô sửa vì sao?","Lý do giúp TOMO ra câu tốt hơn.")+`${seg("why",["Sai đáp án","Câu khó hiểu","Không hợp lớp 8","Lý do khác"].map(x=>[x,x]),"")}<div class="mfoot"><button class="btn" data-close>Bỏ qua</button></div>`,()=>on("#layer [data-why]",b=>{it.editWhy=b.dataset.why;save();closeM();toast("Đã lưu câu và lý do sửa.")}));else toast("Đã lưu câu.")});
  }
};
function startEdit(e,i){const it=e.items[i];
  if(it.attempts>0){modal(mhead("Câu này đã có lượt làm")+`<p>Câu này đã có ${it.attempts} lượt làm. Sửa nội dung sẽ tạo câu mới, để độ khó đã đo không bị sai.</p><div class="mfoot"><button class="btn" id="typo">Chỉ sửa chính tả</button><button class="btn pri" id="mkNew">Tạo câu mới</button></div>`,()=>{document.querySelector("#typo").onclick=()=>{closeM();UI.r.edit=i;UI.r.mode="typo";render()};document.querySelector("#mkNew").onclick=()=>{closeM();UI.r.edit=i;UI.r.mode="new";render()}});return}
  UI.r.edit=i;UI.r.mode="fix";render();
}
function chk(it){if(it.check==="tomo")return pill(it.type==="rewrite"?"TOMO soạn đáp án mẫu":`TOMO giải${it.verified?", giải lại vẫn khớp":""}`,"pos");if(it.type==="rewrite")return it.check==="lech"?pill("Đáp án mẫu cần cô xem","warn"):"";
  if(it.check==="lech")return pill("Đáp án cần xác nhận","warn");if(it.source==="Tải lên")return it.check==="khop"?pill(it.verified?"Đáp án của đề, TOMO giải khớp":"Đáp án của đề","pos"):"";if(it.source!=="AI")return "";return it.check==="khop"?pill("Đáp án đã khớp","pos"):it.check==="gv"?pill("Cô đã xác nhận","pos"):pill("Chưa kiểm tra")}
function itemView(e,it,i,ro){
  const lv=lvOf(it);const num=it.n||i+1;
  if(UI.r.edit===i&&!ro)return `<article class="item editing"><div class="ihead"><b>Câu ${num}</b>${UI.r.mode==="new"?pill("Sẽ tạo câu mới"):UI.r.mode==="typo"?pill("Chỉ sửa chính tả"):""}</div>
    <label>Đề bài<textarea id="eStem">${esc(it.stem)}</textarea></label>
    ${it.type==="rewrite"?`<label>Đáp án mẫu<input type="text" id="eAns" value="${esc(it.answer)}"></label>`:it.options.map((o,k)=>`<div class="optedit"><input type="radio" name="eAns" value="${k}" ${it.answer===k?"checked":""} aria-label="Đáp án đúng là ${ABCD[k]}"><span class="ol">${ABCD[k]}</span><input type="text" id="eOpt${k}" value="${esc(o)}" aria-label="Phương án ${ABCD[k]}"></div>`).join("")+``}
    <div class="row gap"><span class="sp"></span><button class="btn sm" data-ecancel>Huỷ</button><button class="btn sm pri" data-esave="${i}">Lưu câu</button></div></article>`;
  let warn="";
  if(it.check==="lech"&&!ro){
    if(it.type==="rewrite")warn=`<div class="notice warn">${esc(it.checkWhy)}<div class="row gap"><button class="btn sm pri" data-fixrw="${i}" data-mode="new">Dùng đáp án gợi ý</button><button class="btn sm" data-fixrw="${i}" data-mode="keep">Giữ đáp án gốc</button><button class="btn sm ghost" data-edit="${i}">Sửa</button><button class="btn sm ghost" data-rm="${i}">Bỏ câu đó</button></div></div>`;
    else if(it.checkPick>=0)warn=`<div class="notice warn">TOMO kiểm tra ra đáp án khác (${ABCD[it.checkPick]}). Cô chọn đáp án đúng.${it.checkWhy&&!it.checkWhy.startsWith("Lượt")?`<div class="small">${esc(it.checkWhy)}</div>`:""}<div class="row gap"><button class="btn sm" data-fix="${i}:${it.answer}">Giữ ${ABCD[it.answer]}</button><button class="btn sm" data-fix="${i}:${it.checkPick}">Đổi sang ${ABCD[it.checkPick]}</button><button class="btn sm ghost" data-rm="${i}">Bỏ câu đó</button></div></div>`;
    else warn=`<div class="notice warn">Có thể có hơn một đáp án đúng. ${esc(it.checkWhy||"")}<div class="row gap"><button class="btn sm" data-fix="${i}:${it.answer}">Vẫn dùng câu gốc (đáp án ${ABCD[it.answer]})</button><button class="btn sm" data-edit="${i}">Sửa câu</button><button class="btn sm ghost" data-rm="${i}">Bỏ câu đó</button></div></div>`;
  }
  if(it.lostUnderline&&!it.ulOK&&!ro&&RESTORE[it.n]){const R_=RESTORE[it.n];warn+=`<div class="notice warn"><b>Phần gạch chân bị mất khi tải lên.</b> TOMO khôi phục như sau:<div class="restore">${R_.stem?R_.stem:R_.options.map((o,k)=>`${ABCD[k]}. ${o}`).join(" · ")}</div><div class="small muted">${esc(R_.why)}</div><div class="row gap"><button class="btn sm pri" data-ulok="${i}">Dùng bản khôi phục</button><button class="btn sm" data-edit="${i}">Sửa tay</button></div></div>`}
  if(it.check==="chua"&&!ro&&it.type!=="rewrite")warn+=`<div class="row gap"><span class="muted small">Câu chưa có đáp án được đánh dấu.</span><button class="btn sm" data-fix="${i}:${it.answer}">Xác nhận đáp án ${ABCD[it.answer]}</button></div>`;
  const info=[it.inBank?"Câu này đã có trong ngân hàng. Hệ thống dùng lại để giữ độ khó đã đo.":"",it.keyNote||"",it.explainIssue?`Lời giải có thể chưa đúng: ${it.explainIssue}`:""].filter(Boolean);
  return `<article class="item ${it.check==="lech"||(it.lostUnderline&&!it.ulOK)?"flag":""}" id="q${i}" data-issue="${!ro&&(it.check==="lech"||it.check==="chua"&&it.type!=="rewrite"||(it.lostUnderline&&!it.ulOK&&RESTORE[it.n]))?1:0}"><div class="ihead"><b>Câu ${num}</b><span class="muted">${esc(sk(it.skill))}${it.type==="rewrite"?" · viết lại câu":""} · ${it.source==="GV"?"Giáo viên":it.source==="AI"?"TOMO":esc(it.source)}</span>${chk(it)}${it.isNew&&it.type!=="rewrite"?pill("Câu mới"):""}<span class="sp"></span>${ro?lvPill(lv):`<button class="lvbtn" data-lvq="${i}" title="Đổi mức độ khó" style="background:${LV.find(x=>x.k===lv).bg};color:${LV.find(x=>x.k===lv).ink};border-color:transparent"><i style="background:${lvC(lv)}"></i>${lvT(lv)}${it.lvGV?" · cô chỉnh":""} ${ic("chev",10)}</button>`}<button class="iconbtn" data-info="${i}" aria-label="Độ khó được tính thế nào">${ic("info")}</button><button class="iconbtn fav ${isFav(it)?"on":""}" data-fav="${i}" aria-pressed="${isFav(it)}" aria-label="${isFav(it)?"Bỏ khỏi câu yêu thích":"Đánh dấu câu hay"}">${ic("star")}</button>${ro?"":`<button class="iconbtn" data-imenu="${i}" aria-label="Thao tác với câu ${num}">${ic("kebab")}</button>`}</div>
    <p class="q">${it.ulOK&&RESTORE[it.n]&&RESTORE[it.n].stem?RESTORE[it.n].stem:esc(it.stem)||'<span class="muted">Câu trống — mở menu và chọn Sửa câu</span>'}</p>
    ${it.type==="rewrite"?`<div class="opt right">Đáp án mẫu: ${esc(it.answer)}</div>`:`<div class="opts">${it.options.map((o,k)=>`<div class="opt ${k===it.answer?"right":""} ${it.check==="lech"&&k===it.checkPick?"alt":""}"><span class="ol">${ABCD[k]}</span><span>${it.ulOK&&RESTORE[it.n]&&RESTORE[it.n].options?RESTORE[it.n].options[k]:esc(o)}</span></div>`).join("")}</div>`}
    ${explainOf(it)?`<p class="exp"><b>Giải thích:</b> ${esc(explainOf(it))}</p>`:""}${info.map(t=>`<p class="muted small">${esc(t)}</p>`).join("")}${warn}</article>`;
}
function rerate(e,i){const it=e.items[i];
  if(it.attempts>0){modal(mhead("Cô thấy câu này ở mức nào?")+`<div class="notice info">Dữ liệu từ ${it.attempts} lượt làm cho thấy câu này ở mức ${lvT(lvOfB(it.b))}. Hệ thống giữ mức này và ghi lại ý kiến của cô.</div>${seg("r",LV.map(l=>[l.k,l.t]),"")}<div class="mfoot"><button class="btn" data-close>Huỷ</button></div>`,()=>on("#layer [data-r]",b=>{it.gvOpinion=b.dataset.r;save();closeM();toast("Đã ghi lại ý kiến của cô.")}));return}
  modal(mhead("Cô thấy câu này ở mức nào?","Ý kiến của cô giúp hệ thống đoán độ khó tốt hơn. Mức cô chọn dùng trong đề của cô; độ khó chung của ngân hàng chỉ đổi khi có từ 2 giáo viên cùng ý hoặc có dữ liệu.")+`${seg("r",LV.map(l=>[l.k,l.t]),lvOf(it))}<div class="mfoot"><button class="btn" data-close>Huỷ</button></div>`,
  ()=>on("#layer [data-r]",b=>{it.lvGV=b.dataset.r===lvOfB(it.b)?null:b.dataset.r;save();closeM();render();toast(`Đã đổi câu ${i+1} sang mức ${lvT(b.dataset.r)}.`)}));
}
async function altPick(e,i,dir){const it=e.items[i];
  const DW=dir===0?"cùng mức":dir>0?"khó hơn":"dễ hơn";modal(mhead("Đổi câu "+DW)+`<div class="loading"><div class="spin"></div><b>TOMO đang gợi ý 3 câu cùng kỹ năng…</b></div>`);
  let alts;try{alts=await AI.alternatives(it,dir,e.unit)}catch(x){alts=DB.bank.filter(b=>b.skill===it.skill&&b.id!==it.id&&(dir===0?(lvOf(b)===lvOf(it)||Math.abs(b.b-it.b)<=0.5):dir>0?b.b>it.b:b.b<it.b)&&!e.items.some(z=>z.id===b.id)).slice(0,3).map(clone)}
  const M=document.querySelector("#layer .modal");if(!M)return;
  if(!alts.length){M.innerHTML=mhead("Chưa có câu phù hợp")+`<p>Ngân hàng chưa có câu ${DW} cùng kỹ năng${aiOK?"":" và trang chưa gọi được TOMO"}. Cô thử Sửa câu hoặc thêm câu tự soạn.</p><div class="mfoot"><button class="btn" data-close>Đóng</button></div>`;M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);return}
  M.innerHTML=mhead("Chọn câu "+DW,`Cùng kỹ năng ${sk(it.skill)}${dir===0?`, cùng mức ${lvT(lvOf(it))}`:""}. Câu được chọn thay vào đúng vị trí câu ${i+1}.`)+alts.map((a,k)=>`<div class="srow"><div class="sbody"><div class="sub">${lvPill(lvOf(a))} ${a.check==="lech"?"· đáp án cần cô xem":""}</div><div>${esc(a.stem)}</div><div class="sub">${a.options.map((o,j)=>j===a.answer?`<b class="ink">${ABCD[j]}. ${esc(o)}</b>`:`${ABCD[j]}. ${esc(o)}`).join(" · ")}</div></div><div class="sacts"><button class="btn sm pri" data-alt="${k}">Chọn</button></div></div>`).join("")+`<div class="mfoot"><button class="btn" data-close>Huỷ</button></div>`;
  M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);
  on("#layer [data-alt]",b=>{const before=clone(e.items);e.items[i]=alts[+b.dataset.alt];save();closeM();render();toast(`Đã đổi câu ${i+1}.`,()=>{e.items=before;save();render()})});
}
function rebalance(e){const before=clone(e.items);let n=0;
  const T=targetOf(e).flatMap(id=>ROSTER[id]);for(let s=0;s<6;s++){const cur=expectedScore(e.items,T);if(cur>=6.5&&cur<=7.5)break;let best=null;
    e.items.forEach((it,i)=>{if(it.type==="rewrite")return;DB.bank.filter(b=>b.skill===it.skill&&!e.items.some(z=>z.id===b.id)).forEach(b=>{const t=e.items.slice();t[i]=b;const d=Math.abs(expectedScore(t,T)-7);if(!best||d<best.d)best={i,b,d}})});
    if(!best||best.d>=Math.abs(cur-7))break;e.items[best.i]=clone(best.b);n++}
  save();render();if(n)toast(`Đã đổi ${n} câu. Điểm dự kiến (${planLabel(e)}): ${expectedScore(e.items,T)}/10.`,()=>{e.items=before;save();render()});else toast("Ngân hàng chưa có câu cùng kỹ năng để cân lại. Cô thử Đổi câu dễ hơn ở từng câu.");
}
function toBank(e){e.items.forEach(it=>{if(it.type==="rewrite")return;if(it.source==="AI"&&!(it.check==="khop"||it.check==="gv"))return;if(!DB.bank.some(b=>b.id===it.id))DB.bank.unshift(clone(it))})}
function blocked(e){if(e.items.some(i=>i.check==="lech")){toast("Còn câu cần cô xác nhận đáp án.");return true}if(!e.items.length){toast("Đề chưa có câu nào.");return true}return false}
function useNow(id){const e=find(id);if(blocked(e))return;
  const ask=reason=>{const tg=e.plan&&e.plan.length?e.plan:null;assignModal(e.id,tg,{fromUse:true,reason})};
  if(DB.settings.mustApprove&&e.kind==="kt"){modal(mhead("Trường yêu cầu duyệt đề kiểm tra có điểm","Cô vẫn có thể dùng luôn; tổ trưởng sẽ được báo và duyệt sau.")+`<label>Lý do dùng luôn<input type="text" id="mWhy" placeholder="Ví dụ: Kiểm tra gấp đầu giờ"></label><div class="mfoot"><button class="btn" id="mSend">Gửi duyệt trước</button><button class="btn pri" id="mOk">Dùng luôn</button></div>`,()=>{
    document.querySelector("#mOk").onclick=()=>{const w=document.querySelector("#mWhy").value.trim();if(!w){toast("Cô ghi lý do giúp nhé.");return}closeM();ask(w)};document.querySelector("#mSend").onclick=()=>{closeM();sendLead(id)}});}else ask();
}
function sendLead(id){const e=find(id);if(blocked(e))return;
  modal(mhead("Gửi đề cho tổ trưởng duyệt?","Thầy Minh sẽ nhận thông báo. Trong lúc chờ, cô vẫn xem được đề nhưng chưa sửa được.")+`<label>Lời nhắn cho tổ trưởng (không bắt buộc)<textarea id="mNote" placeholder="Ví dụ: Em nhờ thầy xem giúp câu 14"></textarea></label><div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="mOk">Gửi</button></div>`,()=>{
    document.querySelector("#mOk").onclick=()=>{e.place="mine";e.status="cho";e.returned=false;e.leadNote=document.querySelector("#mNote").value;toBank(e);save();go({v:"editor",id});toast("Đã gửi tổ trưởng.")}});
}

/* ---- Sinh đôi (hộp thoại) ---- */
function twinModal(id,c){UI.mpFull=false;
  const e=find(id);const P={pur:DB.assigns.some(a=>a.examId===id&&a.kind==="lt")?"bainha":"ab",min:10,cls:c||(DB.assigns.find(a=>a.examId===id)||{}).cls||"8A3"};
  const draw=()=>{const M=document.querySelector("#layer .modal");const given=DB.assigns.filter(a=>a.examId===id).map(a=>a.cls);
    M.innerHTML=mhead("Tạo mini test",`${esc(e.title)} · giữ nguyên kỹ năng và độ khó, chỉ đổi từ vựng, ngữ cảnh và đáp án.`)+`
    <span class="flabel">Mục đích</span><div class="choice">
      <button class="${P.pur==="ab"?"on":""}" data-pur="ab"><b>Đề A/B cho cả lớp</b><span class="sub">Tránh nhìn bài bạn. Sinh đôi toàn bộ đề.</span></button>
      <button class="${P.pur==="bainha"?"on":""}" data-pur="bainha"><b>Kiểm tra bài về nhà</b><span class="sub">Mỗi em một mini test dựng từ chính câu em làm đúng, sai ở nhà.</span></button></div>
    ${P.pur==="bainha"?`<div class="fgrid"><label>Lớp đã làm bài này<select id="tCls">${(given.length?given:[P.cls]).map(x=>`<option ${x===P.cls?"selected":""}>${x}</option>`).join("")}</select></label><div><span class="flabel">Thời lượng</span>${seg("tmin",[["5","5 phút"],["10","10 phút (nên dùng)"],["15","15 phút"]],String(P.min))}</div></div>
      ${typeof miniPlan==="function"?miniPlan(id,P):""}${P.min===5?`<p class="muted small">Bài 5 phút ngắn, hệ thống gộp với lần kiểm tra sau rồi mới kết luận.</p>`:""}`:""}
    <div id="twRes"></div><div class="mfoot"><button class="btn" data-close>Huỷ</button><button class="btn pri" id="mkTwin">Tạo mini test</button></div>`;
    M.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeM);
    on("#layer [data-pur]",el=>{P.pur=el.dataset.pur;draw()});on("#layer [data-tmin]",el=>{P.min=+el.dataset.tmin;draw()});
    const s=document.querySelector("#tCls");if(s)s.onchange=()=>{P.cls=s.value;draw()};const M2=document.querySelector("#layer .modal");if(M2)M2.classList.toggle("xl",!!UI.mpFull&&P.pur==="bainha");const mf=document.querySelector("#mpFull");if(mf)mf.onclick=()=>{UI.mpFull=!UI.mpFull;draw()};
    document.querySelector("#mkTwin").onclick=()=>makeTwin(e,P);
  };
  modal("",null,"wide");draw();
}
async function makeTwin(e,P){
  let src=e.items.filter(i=>i.type!=="rewrite"),roles=[];
  if(P.pur==="bainha"){const n={5:4,10:8,15:12}[P.min];const a=DB.assigns.find(x=>x.examId===e.id&&x.cls===P.cls);const rs=a&&resultOf(a);
    const ranked=src.map((it,i)=>({it,rate:rs?rs.rates[i]:70-it.b*10})).sort((x,y)=>x.rate-y.rate);
    const by={};ranked.forEach(r=>{(by[r.it.skill]=by[r.it.skill]||[]).push(r.rate)});const cand=Object.entries(by).filter(([k,v])=>v.length>=2).sort((x,y)=>x[1].reduce((s,v)=>s+v,0)/x[1].length-y[1].reduce((s,v)=>s+v,0)/y[1].length);
    const main=(cand[0]||[ranked[0].it.skill])[0];const core=src.filter(i=>i.skill===main);const nC=Math.min(core.length,Math.round(n*0.6));const pick=[];
    for(let k=0;k<nC;k++){pick.push(core[k]);roles.push("Cốt lõi")}ranked.forEach(r=>{if(pick.length<n&&!pick.includes(r.it)){pick.push(r.it);roles.push("Câu dễ sai")}});src=pick.slice(0,n);roles=roles.slice(0,src.length)}
  const box=document.querySelector("#twRes");box.innerHTML=`<div class="loading"><div class="spin"></div><div><b>TOMO đang viết lại từng câu…</b><div class="stream" id="stream"></div></div></div>`;
  let tw=[],short=0;
  try{tw=await AI.twins(src,streamTo);try{await AI.blind(tw)}catch(x){}}
  catch(x){const used=new Set();tw=src.map(a=>{const alt=DB.bank.find(b=>b.skill===a.skill&&b.id!==a.id&&!used.has(b.id)&&Math.abs(b.b-a.b)<=1.2&&!src.some(s=>s.id===b.id));if(alt)used.add(alt.id);return alt?Object.assign(clone(alt),{id:a.id+"_T1",twinOf:a.id,source:"AI",check:"khop",isNew:true}):null});short=tw.filter(t=>!t).length}
  const pairs=src.map((a,k)=>({a,t:tw[k],role:roles[k]})).filter(p=>p.t);
  const n={id:e.id+(P.pur==="ab"?"_B":"_KT_"+P.cls),title:e.title+(P.pur==="ab"?" — đề B":` — mini test ${P.cls}`),unit:e.unit,minutes:P.pur==="ab"?e.minutes:P.min,kind:"kt",items:pairs.map(p=>p.t),place:"nhap",status:null,twinOf:e.id,from:"Sinh đôi",grade:e.grade||8,forCls:P.cls,plan:[P.cls]};
  DB.exams=DB.exams.filter(x=>x.id!==n.id);DB.exams.unshift(n);save();
  const nNew=n.items.filter(t=>t.isNew).length;
  box.innerHTML=`${short?`<div class="notice warn">Chưa đủ câu tương đương cho ${short} vị trí. Cô đổi ${short} câu đó trong đề gốc hoặc giảm thời lượng.</div>`:`<div class="notice pos">Mini test đã sẵn sàng: cùng kỹ năng ở mỗi vị trí, độ khó gần như bằng đề gốc.</div>`}
  <table class="tbl compact"><thead><tr><th>Vị trí</th><th>Câu gốc</th><th>Câu mini test</th><th>Độ khó</th></tr></thead><tbody>${pairs.map((p,k)=>`<tr><td>${k+1}${p.role?`<div class="sub">${p.role}</div>`:""}</td><td class="small">${esc(p.a.stem)}</td><td class="small">${esc(p.t.stem)}</td><td class="small">${lvPill(lvOf(p.a))} → ${lvPill(lvOf(p.t))}</td></tr>`).join("")}</tbody></table>
  ${nNew?`<p class="muted small">${nNew} câu mới sinh chưa được duyệt. Câu đã qua kiểm tra đáp án tự động.</p>`:""}`;
  document.querySelector("#layer .mfoot").innerHTML=`<button class="btn" id="twOpen">Xem mini test</button><button class="btn" id="twSend">Gửi tổ trưởng duyệt</button><button class="btn pri" id="twUse">Dùng luôn</button>`;
  document.querySelector("#twOpen").onclick=()=>go({v:"editor",id:n.id});document.querySelector("#twSend").onclick=()=>{closeM();sendLead(n.id)};document.querySelector("#twUse").onclick=()=>{closeM();useNow(n.id)};
}

/* ---- Giao bài cho nhiều lớp (hộp thoại) ---- */
function assignModal(examId,preCls,opt){
  opt=opt||{};UI.asgBack=null;let mine=DB.exams.filter(e=>(e.place==="mine"&&!["cho","luutru"].includes(e.status))||e.place==="nhap");if(opt.fromUse&&examId&&!mine.some(x=>x.id===examId))mine=[find(examId)].concat(mine);
  const toMine=x=>{if(x.place!=="mine"||x.status){x.place="mine";x.status=null;x.returned=false;if(opt.reason){x.unapprovedGiven=true;x.reason=opt.reason}toBank(x)}};
  const KEY=examId||"_";UI.asg=UI.asg||{};
  const ex0=examId&&find(examId);if(!preCls&&ex0&&ex0.forCls)preCls=[ex0.forCls];if(!preCls&&ex0&&ex0.plan&&ex0.plan.length)preCls=ex0.plan.filter(c=>!DB.assigns.some(a=>a.cls===c&&a.examId===examId));if(preCls&&!preCls.length)preCls=null;
  const P={exam:examId||(mine.find(e=>(e.grade||8)===(preCls?cls(preCls[0]).grade:8))||mine[0]).id,cls:new Set(preCls||[]),date:"2026-11-25",time:"21:00",form:"online",mode:(opt&&opt.mode)||"chung",essay:"go",rc:new Set()};
  P.kind=find(P.exam).kind;P.anti=P.kind==="kt"?{copy:true,shot:true,leave:true}:{leave:true,copy:true};
  const SV=UI.asg[KEY];if(SV){Object.assign(P,SV,{cls:new Set(SV.cls),rc:new Set(SV.rc),anti:Object.assign({},SV.anti)})}
  const remember=()=>{UI.asg[KEY]=Object.assign({},P,{cls:[...P.cls],rc:[...P.rc]})};
  const draw=()=>{const e=find(P.exam),g=e.grade||8;const cl=CLASSES.filter(c=>c.grade===g);[...P.cls].forEach(c=>{if(cls(c).grade!==g)P.cls.delete(c)});
    const anyNew=[...P.cls].some(c=>cls(c).isNew);const hasRw=e.items.some(i=>i.type==="rewrite");
    /* Mở từ một đề cụ thể (màn xem đề, Kho đề, mini test): đề đã chốt, chỉ còn chọn lớp, hạn, hình thức.
       Mở từ trang lớp (chưa có đề): mới cho chọn đề hoặc tạo đề mới. */
    const exSel=examId?`<div class="gfix"><span class="flabel">Đề</span><div><b>${esc(e.title)}</b> <span class="muted small">· ${e.items.length} câu · ${e.minutes} phút · ${e.kind==="kt"?"Kiểm tra":"Luyện tập"}${e.place==="nhap"?" · đang ở Nháp, giao xong sẽ vào Sổ giao đề":""}</span></div></div>`:`<label>Đề<select id="gEx">${[["Sổ giao đề",mine.filter(x=>x.place!=="nhap")],["Nháp",mine.filter(x=>x.place==="nhap")]].filter(g=>g[1].length).map(([gl,L])=>`<optgroup label="${gl}">${L.map(x=>`<option value="${x.id}" ${x.id===e.id?"selected":""}>${esc(x.title)} · ${x.items.length} câu · ${x.minutes} phút</option>`).join("")}</optgroup>`).join("")}</select></label>
    <div class="gnew small"><span class="muted">Chưa có đề phù hợp? Tạo đề mới ngay, xong quay lại giao cho lớp đã chọn:</span><button type="button" class="btn sm" data-gnew="up">${ic("up")} Tải file đề</button><button type="button" class="btn sm" data-gnew="ai">${ic("ai")} Nhờ TOMO soạn</button><button type="button" class="btn sm" data-gnew="lib">${ic("search")} Thư viện trường</button><button type="button" class="btn sm ghost" data-gnew="type">Tự nhập</button></div>`;
    const M=document.querySelector("#layer .modal");
    M.innerHTML=mhead("Giao bài",opt.fromUse&&find(P.exam).place!=="mine"?"Đề đang ở Nháp. Cô giao xong hoặc bấm “Chỉ lưu vào Sổ giao đề” thì đề mới vào Sổ giao đề.":(SV?"Đã giữ các lựa chọn lần trước cô chưa giao xong.":""))+`
    ${exSel}
    <span class="flabel">Lớp (khối ${g})</span><div class="clspick">${cl.map(c=>{const prev=DB.assigns.filter(a=>a.cls===c.id&&a.examId===e.id);const rc=(DB.recheck[c.id]||[]);return `<label class="crow ${P.cls.has(c.id)?"on":""}"><input type="checkbox" data-pc="${c.id}" ${P.cls.has(c.id)?"checked":""}><span class="cn"><b>${c.id}</b> <span class="muted">${c.size} em</span></span><span class="cnote">${prev.length?`<span class="warn-t">Đã giao ngày ${prev.map(a=>fmtD(a.given)).join(", ")}</span>`:c.isNew?"Lớp mới: chỉ giao đề chung":`<span class="muted">Chưa giao đề này</span>`}${rc.length&&P.cls.has(c.id)?`<span class="rc"><input type="checkbox" data-rc="${c.id}" ${P.rc.has(c.id)?"checked":""} id="rc_${c.id}"><label for="rc_${c.id}">Thêm câu mini test cho ${rc.length} em nên kiểm tra lại (${rc.join(", ")})</label></span>`:""}</span></label>`}).join("")}</div>
    <div class="fgrid"><label>Hạn nộp<span class="row gap"><input type="date" id="gD" value="${P.date}"><input type="time" id="gT" value="${P.time}"></span></label><div><span class="flabel">Loại bài</span>${seg("gk",[["lt","Luyện tập"],["kt","Kiểm tra"]],P.kind)}</div>
    <div><span class="flabel">Hình thức</span>${seg("gf",[["online","Online"],["giay","Trên giấy, phiếu có mã QR"]],P.form)}</div>
    <div><span class="flabel">Chọn đề</span>${seg("gm",[["chung","Một đề cho cả lớp"],["canhan","Mỗi em một đề vừa sức"]],anyNew?"chung":P.mode)}<span class="sub">${anyNew?"Có lớp mới chưa đủ bài để biết mức từng em; bài đầu tiên nên là một đề chung.":P.mode==="canhan"?`Đề này làm khung (Unit ${e.unit}, cùng kỹ năng); TOMO chọn trong ngân hàng câu cho từng em: 2 câu khởi động, 6 câu luyện tập, 2 câu thử thách. Một lượt giao, mỗi em một phiếu riêng.`:"Cả lớp làm đúng các câu của đề này."}</span></div></div>
    ${P.form==="online"?`<span class="flabel">Chống gian lận — ${P.kind==="kt"?"Kiểm tra":"Luyện tập"}</span><div class="checks">${(P.kind==="kt"?[["copy","Chặn sao chép"],["shot","Chặn chụp màn hình"],["leave","Nhắc em khi rời bài"]]:[["leave","Ghi lại khi em rời bài"],["copy","Chặn sao chép với bài trắc nghiệm"]]).map(([k,l])=>`<label class="chk"><input type="checkbox" data-anti="${k}" ${P.anti[k]?"checked":""}>${l}</label>`).join("")}</div>`:`<p class="muted small">Bài giấy: khi nhập phiếu, cô đánh dấu được "Nghi nhìn bài" cho từng tờ.</p>`}
    ${hasRw?`<span class="flabel">Câu tự luận (${e.items.filter(i=>i.type==="rewrite").length} câu viết lại)</span>${seg("ge",[["go","Bắt buộc gõ tay"],["dan","Cho phép dán"]],P.essay)}${P.essay==="dan"?`<p class="muted small">Bài cho phép dán vẫn được chấm để em học, nhưng không dùng để đo mức kỹ năng.</p>`:""}`:""}
    <div class="mfoot"><span class="muted small">${P.cls.size?`${[...P.cls].join(", ")} · ${[...P.cls].reduce((s,c)=>s+cls(c).size,0)} em`:"Chưa chọn lớp"}</span><span class="sp"></span><button class="btn" data-close>Đóng</button>${opt.fromUse&&find(P.exam).place!=="mine"?`<button class="btn" id="gSave">Chỉ lưu vào Sổ giao đề</button>`:""}<button class="btn pri" id="gGo" ${P.cls.size?"":"disabled"}>${P.cls.size>1?`Giao cho ${P.cls.size} lớp`:"Giao bài"}</button></div>`;
    M.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{keep();closeM();if(P.cls.size)toast("Đã giữ lựa chọn. Mở lại Giao bài với đề này để làm tiếp.")});
    const keep=()=>{P.date=document.querySelector("#gD").value;P.time=document.querySelector("#gT").value;remember()};
    const gs=document.querySelector("#gSave");if(gs)gs.onclick=()=>{const x=find(P.exam);toMine(x);delete UI.asg[KEY];save();closeM();go({v:"kho",tab:"book",g:x.grade||8});toast(`Đã lưu "${x.title}" vào Sổ giao đề, Unit ${x.unit}. Bấm ô Giao của lớp nào thì giao cho lớp đó.`)};
    document.querySelectorAll("[data-gnew]").forEach(b=>b.onclick=()=>{keep();remember();const back={cls:[...P.cls],from:KEY};closeM();UI.asgBack=back;const k=b.dataset.gnew;if(k==="up")uploadModal();else if(k==="ai")aiModal({kind:P.kind,plan:[...P.cls]});else if(k==="lib")libraryModal();else typeModal();UI.asgBack=back});
    const gex=document.querySelector("#gEx");if(gex)gex.onchange=ev=>{keep();P.exam=ev.target.value;P.kind=find(P.exam).kind;const fe=find(P.exam);if(fe.forCls)P.cls=new Set([fe.forCls]);draw()};
    document.querySelectorAll("[data-pc]").forEach(c=>c.onchange=()=>{keep();c.checked?P.cls.add(c.dataset.pc):P.cls.delete(c.dataset.pc);draw()});
    document.querySelectorAll("[data-rc]").forEach(c=>c.onchange=()=>{c.checked?P.rc.add(c.dataset.rc):P.rc.delete(c.dataset.rc)});
    on("#layer [data-gk]",el=>{keep();P.kind=el.dataset.gk;P.anti=P.kind==="kt"?{copy:true,shot:true,leave:true}:{leave:true,copy:true};draw()});
    on("#layer [data-gf]",el=>{keep();P.form=el.dataset.gf;draw()});on("#layer [data-gm]",el=>{keep();P.mode=el.dataset.gm;draw()});on("#layer [data-ge]",el=>{keep();P.essay=el.dataset.ge;draw()});
    document.querySelectorAll("[data-anti]").forEach(c=>c.onchange=()=>{P.anti[c.dataset.anti]=c.checked});
    document.querySelector("#gGo").onclick=()=>{keep();toMine(e);delete UI.asg[KEY];const made=[];
      [...P.cls].forEach(c=>{const mode=cls(c).isNew?"chung":P.mode;const a={id:`GIAO_${c}_${TODAY.replaceAll("-","")}_${String(++DB.seq).padStart(2,"0")}`,examId:e.id,cls:c,given:TODAY,due:`${P.date} ${P.time}`,kind:P.kind,form:P.form,mode,state:P.form==="giay"?"scan":"open",subFrac:0,anti:clone(P.anti),essay:P.essay,twinsAdded:P.rc.has(c)?(DB.recheck[c]||[]).slice():[]};
        if(mode==="canhan")a.personal=Object.fromEntries(ROSTER[c].map(s=>[s.name,personalSet(s)]));DB.assigns.push(a);made.push(a);if(P.rc.has(c))DB.recheck[c]=[]});
      e.items.forEach(it=>{const b=DB.bank.find(x=>x.id===it.id);if(b)b.isNew=false});save();closeM();render();
      if(P.form==="giay"){const pid=made[0].id;setTimeout(()=>printModal(pid),0)}
      toast(P.form==="giay"?`Đã tạo phiếu cho ${made.map(a=>a.cls).join(", ")}${made.length>1?`. Đang mở phiếu ${made[0].cls}; các lớp khác in ở nút In phiếu trong trang lớp`:""}. In một mặt, không thu nhỏ, để camera đọc được mã QR.`:`Đã giao bài cho ${made.map(a=>a.cls).join(", ")}. Các em sẽ nhận thông báo.`);
      if(made.some(a=>a.mode==="canhan"))go({v:"class",cls:made.find(a=>a.mode==="canhan").cls,tab:"personal",aid:made.find(a=>a.mode==="canhan").id});};
  };
  modal("",null,"wide");draw();
}
function personalSet(st){const pool=DB.bank.filter(b=>b.type!=="rewrite");const tgt=[...Array(2).fill(0.85),...Array(6).fill(0.65),...Array(2).fill(0.42)];const role=[...Array(2).fill("Khởi động"),...Array(6).fill("Luyện tập"),...Array(2).fill("Thử thách")];
  const taken=new Set();return tgt.map((p,k)=>{const x=(p-0.25)/0.75;const want=st.theta-Math.log(x/(1-x));let best=null;pool.forEach(b=>{if(taken.has(b.id))return;const d=Math.abs(b.b-want);if(!best||d<best.d)best={b,d}});taken.add(best.b.id);return {id:best.b.id,role:role[k]}})}

/* ---- Câu yêu thích và giải thích độ khó ---- */
function isFav(it){return !!(DB.fav||{})[it.id]}
function toggleFav(it){DB.fav=DB.fav||{};if(DB.fav[it.id])delete DB.fav[it.id];else{DB.fav[it.id]=1;if(it.type!=="rewrite"&&!DB.bank.some(b=>b.id===it.id)&&!(it.source==="AI"&&it.check==="lech"))DB.bank.unshift(clone(it))}}
const AXES=[["A","Kiến thức ngôn ngữ"],["B","Mức nhận thức"],["C","Độ nhiễu phương án sai"],["D","Số bước suy luận, tải ngữ cảnh"],["E","Bẫy và ngộ nhận"]];
function infoPop(anchor,it){
  document.querySelectorAll(".pop").forEach(p=>p.remove());const r=anchor.getBoundingClientRect();const p=document.createElement("div");p.className="pop info";p.setAttribute("role","dialog");
  p.innerHTML=`<b>Vì sao câu này ở mức ${lvT(lvOf(it))}</b><p class="muted small">TOMO chấm 5 trục, mỗi trục 0–3, rồi quy ra độ khó.</p><table class="tbl compact">${AXES.map(([k,l])=>`<tr><td>${l}</td><td class="num">${it.rub[k]}<span class="unit">/3</span></td></tr>`).join("")}</table>
  <p class="small">${it.attempts>0?`Đã có ${it.attempts} lượt làm: mức được chỉnh theo dữ liệu thật.`:"Chưa có lượt làm: đây là mức dự đoán, sẽ chỉnh lại khi học sinh làm bài."}${it.lvGV?" Cô đã đổi mức của câu này trong đề của cô.":""}</p><p class="muted small mono">${it.id}${it.twinOf?` · mini test của ${it.twinOf}`:""}</p>`;
  document.body.appendChild(p);const w=p.offsetWidth;p.style.top=(r.bottom+window.scrollY+6)+"px";p.style.left=Math.max(12,Math.min(window.innerWidth-w-12,r.right-w))+"px";
  setTimeout(()=>{const off=ev=>{if(!p.contains(ev.target)){p.remove();document.removeEventListener("click",off)}};document.addEventListener("click",off)},0);
}
