/* ===== Mô hình dữ liệu: lớp, học sinh, đề, lượt giao, kết quả =====
   Mọi con số tổng (đã nộp, điểm TB, tỉ lệ đúng) đều tính từ từng dòng, không gõ tay. */
const TODAY = "2026-11-18";
const CLASSES = [
  {id:"8A1",grade:8,size:38,slot:"Thứ 2, 4 · tiết 2"},
  {id:"8A2",grade:8,size:36,slot:"Thứ 3, 5 · tiết 1"},
  {id:"8A3",grade:8,size:20,slot:"Thứ 2, 4, 6 · tiết 3",note:"Lớp tăng cường"},
  {id:"8A4",grade:8,size:35,slot:"Thứ 3, 6 · tiết 4",isNew:true,note:"Cô mới nhận từ tuần 10"},
  {id:"9A1",grade:9,size:40,slot:"Thứ 2, 5 · tiết 4"},
  {id:"9A2",grade:9,size:39,slot:"Thứ 4, 6 · tiết 1"}
];
const FAMILY=["Nguyễn","Trần","Lê","Phạm","Hoàng","Vũ","Đặng","Bùi","Đỗ","Hồ","Ngô","Dương"];
const GIVEN=["Anh","Bảo","Châu","Duy","Hân","Hiếu","Khánh","Linh","Long","My","Nhi","Phong","Quang","Sơn","Tâm","Thư","Trang","Tuấn","Uyên","Việt","Vy","Yến","Đạt","Hưng","Kiên","Lâm","Ngân","Oanh","Phát","Quỳnh","Thịnh","Trí","Vân","Xuân","Ánh","Cường","Diệp","Giao","Hậu","Khoa"];
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function rosterOf(c){
  if(c.id==="8A3"){const F=["Nguyễn Minh","Trần Bảo","Lê Gia","Phạm Quốc","Hoàng Thu","Vũ Thanh","Đặng Minh","Bùi Ngọc","Đỗ Gia","Hồ Đăng","Ngô Ngọc","Dương Khánh","Nguyễn Thanh","Trần Đức","Lê Hoài","Phạm Bảo","Hoàng Gia","Vũ Minh","Đặng Phương","Bùi Anh"];return D.STUDENTS.map((s,i)=>Object.assign({},s,{full:F[i]+" "+s.name}))}
  const r=rng(c.id.charCodeAt(0)*97+c.id.charCodeAt(2)*31+c.id.charCodeAt(1));const used=new Set();const out=[];
  for(let i=0;i<c.size;i++){let g;do{g=GIVEN[Math.floor(r()*GIVEN.length)]}while(used.has(g)&&used.size<GIVEN.length);used.add(g);
    const name=used.size<=GIVEN.length&&out.every(o=>o.name!==g)?g:g+" "+(i+1);
    out.push({id:`HS${c.id.replace("A","")}${String(i+1).padStart(2,"0")}`,name,full:FAMILY[Math.floor(r()*FAMILY.length)]+" "+name,parent:(r()<.5?"chị ":"anh ")+GIVEN[Math.floor(r()*GIVEN.length)],theta:+((r()*2.6-1.1)+(c.grade===9?0.2:0)).toFixed(2),zalo:r()>.06,phoneOK:r()>.04})}
  return out.sort((a,b)=>a.name.localeCompare(b.name,"vi"));
}
const ROSTER = Object.fromEntries(CLASSES.map(c=>[c.id,rosterOf(c)]));
const cls = id => CLASSES.find(c=>c.id===id);

/* Đề */
function mid(x){return mkItem(x)}
function seedExams(){
  let q=0;const I=(x,src,att)=>mkItem({id:`ENG8_${x.skill}_${String(++q).padStart(4,"0")}`,stem:x.stem,options:x.options,answer:x.answer,skill:x.skill,rub:x.rub,source:src||"GV",attempts:att??120});
  const u12=D.U12.map(x=>I(x));
  const r=(A,B,C,D_,E)=>({A,B,C,D:D_,E});
  const u11=[
    I({stem:"He said, \"I am using a new app.\" → He said that he ___ a new app.",options:["is using","was using","used","uses"],answer:1,skill:"NP.CC.05",rub:r(2,1,2,1,2)}),
    I({stem:"He said, \"I can fix the robot.\" → He said that he ___ fix the robot.",options:["can","could","will","must"],answer:1,skill:"NP.CC.05",rub:r(1,1,1,1,1)}),
    I({stem:"Recycling is an ___ way to protect the environment.",options:["effect","effective","effectively","effectiveness"],answer:1,skill:"TV.TK.02",rub:r(1,1,2,1,1)}),
    I({stem:"Scientists ___ a new kind of robot last year.",options:["invent","invented","inventing","have invented"],answer:1,skill:"TV.CD.05",rub:r(1,1,1,0,1)}),
    I({stem:"Choose the word with a different stress pattern.",options:["robot","machine","science","program"],answer:1,skill:"NA.TA.01",rub:r(1,1,1,0,1)}),
    I({stem:"She told me that she ___ the experiment the day before.",options:["finishes","had finished","finish","will finish"],answer:1,skill:"NP.CC.05",rub:r(2,2,2,2,2)}),
    I({stem:"There is no ___ on the Moon, so astronauts need tanks to breathe.",options:["oxygen","gravity","light","rock"],answer:0,skill:"TV.CD.05",rub:r(1,1,1,1,0)}),
    I({stem:"Robots can do many jobs ___ than people.",options:["fast","faster","fastest","more fast"],answer:1,skill:"NP.SS.01",rub:r(1,1,2,0,2)})
  ];
  const extra=[
    I({stem:"\"Do you live near here?\" the man asked me. → The man asked me ___ near there.",options:["if I lived","if did I live","that I lived","do I live"],answer:0,skill:"NP.CC.06",rub:r(2,2,2,1,2)},"AI",42),
    I({stem:"\"Why are you late?\" the teacher asked Nam. → The teacher asked Nam why he ___ late.",options:["is","was","were","be"],answer:1,skill:"NP.CC.06",rub:r(2,2,2,2,2)},"GV",77),
    I({stem:"\"Can you see Mars tonight?\" Lan asked. → Lan asked ___ Mars that night.",options:["if I could see","if could I see","that I could see","can I see"],answer:0,skill:"NP.CC.06",rub:r(3,2,3,2,3)},"GV",58),
    I({stem:"Many people think aliens may ___ on other planets.",options:["exist","existence","existing","existed"],answer:0,skill:"TV.CD.05",rub:r(1,1,2,1,1)},"AI",0)
  ];
  extra[3].isNew=true;
  const u9=[
    mkItem({id:"ENG9_NP.TH.04_0101",stem:"I ___ to Ha Long Bay twice.",options:["go","went","have been","am going"],answer:2,skill:"NP.TH.04",rub:r(1,1,2,1,2),attempts:150}),
    mkItem({id:"ENG9_NP.TH.04_0102",stem:"She has lived here ___ 2019.",options:["for","since","in","at"],answer:1,skill:"NP.TH.04",rub:r(1,1,1,0,2),attempts:150}),
    mkItem({id:"ENG9_TV.CD.01_0103",stem:"It was the most ___ trip I have ever had.",options:["memory","memorable","memorize","memorably"],answer:1,skill:"TV.TK.02",rub:r(1,1,2,1,1),attempts:150}),
    mkItem({id:"ENG9_TV.CD.01_0104",stem:"We ___ a lot of photos during the trip.",options:["did","made","took","got"],answer:2,skill:"TV.TK.01",rub:r(1,1,1,0,1),attempts:150}),
    mkItem({id:"ENG9_NP.TH.04_0105",stem:"Have you ever ___ a camel?",options:["ride","rode","ridden","riding"],answer:2,skill:"NP.TH.04",rub:r(2,1,2,1,2),attempts:150}),
    mkItem({id:"ENG9_GT.HT.02_0106",stem:"\"Have you ever been abroad?\" — \"___\"",options:["Yes, I have. I went to Laos.","Yes, I do.","No, I don't go.","Yes, I am."],answer:0,skill:"GT.HT.02",rub:r(1,1,1,1,1),attempts:150})
  ];
  const twinItems=u12.slice(5,8).concat([u12[3],u12[4],u12[9]]).map(x=>Object.assign(clone(x),{id:x.id+"_T1",twinOf:x.id,source:"AI",attempts:19}));
  twinItems[0].stem="\"Do you play chess?\" she asked him. → She asked him ___ chess.";twinItems[0].options=["that he played","if he played","what he played","does he play"];twinItems[0].answer=1;
  twinItems[1].stem="\"Where does your uncle work?\" Mai asked. → Mai asked where my uncle ___.";twinItems[1].options=["does work","works","worked","did work"];twinItems[1].answer=2;
  twinItems[2].stem="\"What is Lan reading?\" he asked. → He asked what Lan ___ reading.";twinItems[2].options=["is","was","were","does"];twinItems[2].answer=1;
  twinItems[3].stem="\"I am hungry,\" Tom said. → Tom said that he ___ hungry.";twinItems[3].options=["is","be","was","were"];twinItems[3].answer=2;
  twinItems[4].stem="\"We will win,\" the team said. → The team said they ___ win.";twinItems[4].options=["would","will","shall","can"];twinItems[4].answer=0;
  twinItems[5].stem="(Đoạn 60 từ về Sao Kim) What can be inferred from the passage?";twinItems[5].options=["People will move to Venus soon.","Venus is too hot for humans today.","Venus has the same air as Earth.","Nobody has studied Venus."];twinItems[5].answer=1;
  const E=(id,title,unit,minutes,kind,items,place,status,extra2)=>Object.assign({id,title,unit,minutes,kind,items:items.map(clone),place,status,grade:unit>0&&id.includes("ENG9")?9:8},extra2||{});
  const exams=[
    E(`DE_${ME}_0001`,"Bài về nhà Unit 11",11,10,"lt",u11.slice(0,6),"mine",null,{from:"Tự soạn"}),
    E(`DE_${ME}_0004`,"Kiểm tra 15 phút — Unit 11",11,15,"kt",u11,"mine","duyet",{from:"Tự soạn",ver:"v1"}),
    E(`DE_${ME}_0002`,"Bài về nhà Unit 12",12,10,"lt",u12,"mine",null,{from:"Tự soạn"}),
    E(`DE_${ME}_0002_KT`,"Mini test — Bài về nhà Unit 12",12,10,"kt",twinItems,"mine",null,{from:"Sinh đôi",twinOf:`DE_${ME}_0002`,forCls:"8A3"}),
    E(`DE_${ME}_0003`,"Kiểm tra 15 phút — Unit 12",12,15,"kt",[u12[0],u12[2],u12[5],u12[6],extra[2],u12[3],u12[4],extra[0]],"mine",null,{from:"Gợi ý AI"}),
    E(`DE_${ME}_0005`,"Ôn tập câu tường thuật",12,15,"lt",[extra[0],extra[1],extra[2],extra[3],u12[7]].map((x,i)=>i===3?Object.assign(clone(x),{check:"lech",checkPick:2,checkWhy:"Lượt giải độc lập chọn C (existing)."}):x),"nhap",null,{from:"Gợi ý AI"}),
    E(`DE_${ME}_0006`,"Bài nhà Unit 11 — đợt 2",11,10,"lt",u11.slice(5,8),"nhap",null,{from:"Tự soạn",old:true}),
    Object.assign(E("DE_GV014_9001","Bài về nhà Unit 5 — lớp 9",5,10,"lt",u9,"mine",null,{from:"Tự soạn"}),{grade:9}),
    E("DE_TO_ANH_0007","Kiểm tra 15 phút — Unit 11",11,15,"kt",u11.slice(0,6),"school","duyet",{owner:"GV009 · cô Hương",ver:"v1"}),
    E("DE_TO_ANH_0009","Ôn tập Unit 12 — câu tường thuật",12,10,"lt",[extra[0],extra[1],extra[2],u12[3],u12[4]],"school","duyet",{owner:"GV011 · thầy Minh",ver:"v1"}),
    E("DE_TO_ANH_0012","Kiểm tra giữa kì 1 — khối 8 (đề chung)",4,45,"kt",u11.concat(u12),"school","duyet",{owner:"Tổ Tiếng Anh",ver:"v1"}),
    Object.assign(E("DE_TO_ANH_0015","Unit 5 — Our experiences (luyện tập)",5,15,"lt",u9,"school","duyet",{owner:"GV011 · thầy Minh",ver:"v1"}),{grade:9})
  ];
  const bank=[...u12,...u11,...extra].map(clone);
  return {exams,bank};
}

/* Lượt giao: lịch sử theo lớp. Kết quả mô phỏng từ năng lực từng em (θ) và độ khó từng câu, nên tổng luôn khớp. */
function seedAssigns(){
  const A=(id,examId,c,given,due,kind,form,state,extra)=>Object.assign({id,examId,cls:c,given,due,kind,form,mode:"chung",state},extra||{});
  return [
    A("GIAO_8A1_20261106",`DE_${ME}_0001`,"8A1","2026-11-06","2026-11-09 21:00","lt","online","done",{reported:true}),
    A("GIAO_8A1_20261110",`DE_${ME}_0004`,"8A1","2026-11-10","2026-11-10 09:00","kt","giay","done",{reported:true}),
    A("GIAO_8A1_20261113",`DE_${ME}_0002`,"8A1","2026-11-13","2026-11-18 21:00","lt","online","open",{subFrac:0.76}),
    A("GIAO_8A2_20261106",`DE_${ME}_0001`,"8A2","2026-11-06","2026-11-09 21:00","lt","online","done",{reported:true}),
    A("GIAO_8A2_20261114",`DE_${ME}_0002`,"8A2","2026-11-14","2026-11-20 21:00","lt","online","open",{subFrac:0.33}),
    A("GIAO_8A3_20261105",`DE_${ME}_0001`,"8A3","2026-11-05","2026-11-08 21:00","lt","online","done",{reported:true}),
    A("GIAO_8A3_20261109",`DE_${ME}_0004`,"8A3","2026-11-09","2026-11-09 08:00","kt","giay","done",{reported:true}),
    A("GIAO_8A3_20261113",`DE_${ME}_0002`,"8A3","2026-11-13","2026-11-17 21:00","lt","online","done",{fixed:"hw12"}),
    A("GIAO_8A3_20261117",`DE_${ME}_0002_KT`,"8A3","2026-11-17","2026-11-17 08:10","kt","online","done",{fixed:"twin12",twinOfAssign:"GIAO_8A3_20261113"}),
    A("GIAO_8A3_20261118",`DE_${ME}_0003`,"8A3","2026-11-18","2026-11-18 08:15","kt","giay","scan"),
    A("GIAO_9A1_20261112","DE_GV014_9001","9A1","2026-11-12","2026-11-16 21:00","lt","online","done"),
    A("GIAO_9A2_20261112","DE_GV014_9001","9A2","2026-11-12","2026-11-19 21:00","lt","online","open",{subFrac:0.77})
  ];
}
/* Mô phỏng kết quả một lượt giao (có hạt giống cố định) */
const RES_CACHE={};
function resultOf(a){
  if(RES_CACHE[a.id]) return RES_CACHE[a.id];
  const e=find(a.examId),ro=ROSTER[a.cls];if(!e)return null;
  const r=rng(a.id.split("").reduce((s,ch)=>s*31+ch.charCodeAt(0),7));
  const items=e.items;let rows;
  if(a.fixed==="hw12"){
    rows=ro.map(s=>{const sc=D.HW_SCORE[s.name];return {s,submitted:sc!=null,score:sc,time:D.HW_TIME[s.name]||null,need:D.HW_NEED[s.name]||null}});
    const res={rows,rates:D.HW_RATE.slice(),wrong:D.HW_WRONG.slice(),err:D.HW_ERR.slice()};return RES_CACHE[a.id]=finish(a,res);
  }
  if(a.fixed==="twin12"){
    rows=ro.map(s=>{const t=D.TWIN[s.name];const h=D.HW_SCORE[s.name];if(s.name==="Tú")return {s,submitted:false,score:null};
      const sc=t?t.cls:Math.max(3,(h??6)-(s.theta<0?1:0));return {s,submitted:true,score:sc,time:9,cmp:t?t.cmp:(h==null?"—":"Khớp"),exp:t?t.exp:(h??6),und:t?t.und:(D.MASTERY[s.name][3]>=2?"Làm được":D.MASTERY[s.name][3]===1?"Đang luyện":"Chưa làm được"),next:t?t.next:"Giao bài tiếp",home:h}});
    const rates=items.map((it,j)=>Math.round(100*rows.filter(x=>x.submitted).reduce((acc,x)=>acc+(r()<pCorrect(x.s.theta,it)?1:0),0)/rows.filter(x=>x.submitted).length));
    return RES_CACHE[a.id]=finish(a,{rows,rates,wrong:items.map(()=>"—"),err:items.map(()=>"—")});
  }
  const frac=a.state==="open"?(a.subFrac??0.5):a.state==="scan"?0:a.scanned?a.subFrac:(0.92+r()*0.08);
  const corr=items.map(()=>0);let nSub=0;
  rows=ro.map(s=>{const sub=r()<frac;if(!sub)return {s,submitted:false,score:null};nSub++;let c=0;items.forEach((it,j)=>{if(r()<pCorrect(s.theta,it)){c++;corr[j]++}});return {s,submitted:true,score:+(10*c/items.length).toFixed(1),time:Math.round(e.minutes*(0.6+r()*0.5))}});
  /* dữ liệu mẫu: 2 em năng lực thấp có điểm BTVN cao bất thường, để minh hoạ cảnh báo */
  if(a.id===`GIAO_${a.cls}_20261113`&&a.cls==="8A1"){rows.filter(x=>x.submitted).sort((x,y)=>x.s.theta-y.s.theta).slice(1,3).forEach((x,i)=>{x.score=i?9:10})}
  const rates=corr.map(c=>nSub?Math.round(100*c/nSub):0);
  return RES_CACHE[a.id]=finish(a,{rows,rates,wrong:items.map((it,j)=>it.options?`${it.options[(it.answer+1)%4]}`:"—"),err:items.map(()=>"—")});
}
function finish(a,res){
  const sd=(typeof DB!=="undefined"&&DB.stuDone||{})[a.id];if(sd){const row=res.rows.find(x=>x.s.name===sd.name);if(row){row.submitted=true;row.score=sd.score;row.time=sd.time;row.live=true}}
  const sub=res.rows.filter(x=>x.submitted);res.nSub=sub.length;res.size=res.rows.length;
  res.avg=sub.length?+(sub.reduce((s,x)=>s+x.score,0)/sub.length).toFixed(1):null;
  console.assert(res.nSub<=res.size,"nộp vượt sĩ số",a.id);
  return res;
}
function assignsOf(c){return DB.assigns.filter(a=>a.cls===c).sort((x,y)=>y.given.localeCompare(x.given))}
function fmtD(iso){const [y,m,d]=iso.slice(0,10).split("-");return `${d}/${m}`}
function fmtDue(iso){const t=iso.slice(11);return fmtD(iso)+(t?" · "+t:"")}
function dueLabel(iso){const d=iso.slice(0,10);if(d===TODAY)return "Hôm nay"+(iso.slice(11)?" "+iso.slice(11):"");const diff=Math.round((new Date(d)-new Date(TODAY))/864e5);if(diff===1)return "Ngày mai "+iso.slice(11);if(diff>1)return `Còn ${diff} ngày`;return "Đã hết hạn"}

/* Việc cần cô làm, theo lớp — một nguồn cho Hôm nay, thanh bên và trang lớp */
function todoKey(c,t){return `${c}|${t.k}|${t.aid||(t.go&&t.go.aid)||""}`}
function todoHidden(c,t){const H=DB.todoHide||{},k=todoKey(c,t),h=H[k];if(!h)return null;if(h.until&&Date.now()>=h.until){delete H[k];return null}return h}
function todoOf(c){return todoRaw(c).filter(t=>!todoHidden(c,t))}
function todoHiddenList(c){return todoRaw(c).map(t=>({t,h:todoHidden(c,t)})).filter(x=>x.h)}
function todoRaw(c){
  const out=[];
  const pend=DB.verify.filter(v=>v.cls===c&&!v.status);if(pend.length)out.push({k:"verify",n:pend.length,t:`${pend.length} em cần cô xác nhận`,act:"Xác nhận",go:{v:"class",cls:c,tab:"verify"}});
  DB.assigns.filter(a=>a.cls===c&&a.state==="scan").forEach(a=>out.push({k:"scan",n:1,t:`Phiếu giấy "${find(a.examId).title}" chưa nhập`,act:"Nhập phiếu",aid:a.id}));
  DB.assigns.filter(a=>a.cls===c&&a.state==="done"&&!a.reported&&find(a.examId).kind==="lt").forEach(a=>out.push({k:"report",n:1,t:`Báo cáo phụ huynh "${find(a.examId).title}" chưa gửi`,act:"Gửi báo cáo",go:{v:"class",cls:c,tab:"parents",aid:a.id}}));
  if(cls(c).isNew&&!DB.assigns.some(a=>a.cls===c)) out.push({k:"first",n:1,t:"Lớp chưa có bài nào. Bài đầu tiên nên là một đề chung.",act:"Giao bài đầu tiên",assign:c});
  return out;
}
function seedVerify(){return clone(D.VERIFY).map(v=>Object.assign(v,{clsScore:v.cls,cls:"8A3",status:null}))}

/* Đề dành cho lớp nào: không bắt buộc. Chưa chọn thì tính theo cả khối; lớp được gắn khi giao bài. */
function targetOf(e){const g=e.grade||8;return e.plan&&e.plan.length?e.plan:CLASSES.filter(c=>c.grade===g).map(c=>c.id)}
function expOf(e,ids){ids=ids||targetOf(e);return expectedScore(e.items,ids.flatMap(id=>ROSTER[id]||[]))}
function planLabel(e){return e.plan&&e.plan.length?e.plan.join(", "):`cả khối ${e.grade||8}`}
function planPicker(e,attr){const g=e.grade||8;const p=e.plan||[];return `<div class="seg multi plan" role="group" aria-label="Dành cho lớp">${CLASSES.filter(c=>c.grade===g).map(c=>`<button class="${p.includes(c.id)?"on":""}" data-${attr||"plan"}="${c.id}" aria-pressed="${p.includes(c.id)}">${c.id}</button>`).join("")}</div>`}

function fullOf(c,n){const s=(ROSTER[c]||[]).find(x=>x.name===n);return s?(s.full||s.name):n}
