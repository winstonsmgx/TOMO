/* ===== Đọc file đề trong trình duyệt (không gửi file đi đâu): docx, xlsx, pdf có lớp chữ, csv/txt.
   Sau khi lấy được chữ: TOMO (Claude) tách câu, gán kỹ năng, chấm độ khó; khi TOMO chưa bật thì dùng bộ tách câu theo mẫu. ===== */
async function inflateRaw(u8){const ds=new DecompressionStream("deflate-raw");const s=new Blob([u8]).stream().pipeThrough(ds);return new Uint8Array(await new Response(s).arrayBuffer())}
async function inflateZ(u8){const ds=new DecompressionStream("deflate");const s=new Blob([u8]).stream().pipeThrough(ds);return new Uint8Array(await new Response(s).arrayBuffer())}
/* Đọc ZIP qua bảng thư mục trung tâm (docx, xlsx đều là ZIP) */
async function unzip(buf,want){
  const u8=new Uint8Array(buf),dv=new DataView(buf);let eo=-1;for(let i=u8.length-22;i>=Math.max(0,u8.length-66000);i--){if(dv.getUint32(i,true)===0x06054b50){eo=i;break}}
  if(eo<0)throw new Error("zip");const n=dv.getUint16(eo+10,true);let p=dv.getUint32(eo+16,true);const out={};const td=new TextDecoder();
  for(let k=0;k<n;k++){const method=dv.getUint16(p+10,true),csize=dv.getUint32(p+20,true),fl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true);
    const name=td.decode(u8.subarray(p+46,p+46+fl));p+=46+fl+el+cl;if(want&&!want(name))continue;
    const lfl=dv.getUint16(lo+26,true),lel=dv.getUint16(lo+28,true);const data=u8.subarray(lo+30+lfl+lel,lo+30+lfl+lel+csize);
    out[name]=td.decode(method===0?data:await inflateRaw(data))}
  return out;
}
const xmlUn=s=>s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&");
async function docxText(buf){const z=await unzip(buf,n=>n==="word/document.xml");const x=z["word/document.xml"]||"";let under=0;
  const paras=x.split(/<\/w:p>/).map(p=>{let t="";p.replace(/<w:r[ >][\s\S]*?<\/w:r>/g,r=>{const tx=(r.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)||[]).map(m=>xmlUn(m.replace(/<[^>]+>/g,""))).join("");if(/<w:u [^>]*w:val="(?!none)/.test(r)&&tx.trim()){under++;t+="_"+tx+"_"}else t+=tx;if(/<w:tab\/>/.test(r))t+=" ";return r});return t.trim()});
  return {text:paras.join("\n"),under}}
async function xlsxText(buf){const z=await unzip(buf,n=>n==="xl/sharedStrings.xml"||/^xl\/worksheets\/sheet1\.xml$/.test(n));
  const ss=((z["xl/sharedStrings.xml"]||"").match(/<si>[\s\S]*?<\/si>/g)||[]).map(si=>xmlUn((si.match(/<t[^>]*>([^<]*)<\/t>/g)||[]).map(m=>m.replace(/<[^>]+>/g,"")).join("")));
  const rows=((z["xl/worksheets/sheet1.xml"]||"").match(/<row[\s\S]*?<\/row>/g)||[]).map(r=>(r.match(/<c [^>]*>[\s\S]*?<\/c>|<c [^>]*\/>/g)||[]).map(c=>{const v=(c.match(/<v>([^<]*)<\/v>/)||[])[1]||(c.match(/<t[^>]*>([^<]*)<\/t>/)||[])[1]||"";return /t="s"/.test(c)?ss[+v]||"":xmlUn(v)}));
  return rows.map(r=>r.map(c=>/[",]/.test(c)?`"${c.replace(/"/g,"'")}"`:c).join(",")).join("\n")}
/* PDF: lấy chữ từ lớp chữ (PDF xuất từ Word, Google Docs, LibreOffice…):
   - đọc cả đối tượng nằm trong luồng nén (ObjStm, PDF 1.5+), giải nén FlateDecode, đổi mã glyph ra chữ bằng bảng ToUnicode của từng phông;
   - bỏ watermark: chữ bị xoay (ma trận Tm/cm có thành phần xoay) và dòng lặp lại ở hầu hết các trang;
   - lấy ảnh lớn trong PDF (trang scan) để Claude đọc khi không có lớp chữ. */
function a85(u8){const out=[];let t=[];for(let i=0;i<u8.length;i++){const c=u8[i];if(c===126)break;if(c<=32)continue;if(c===122&&!t.length){out.push(0,0,0,0);continue}t.push(c-33);if(t.length===5){let v=0;for(const x of t)v=v*85+x;out.push(v>>>24&255,v>>>16&255,v>>>8&255,v&255);t=[]}}
  if(t.length){const n=t.length;while(t.length<5)t.push(84);let v=0;for(const x of t)v=v*85+x;const b=[v>>>24&255,v>>>16&255,v>>>8&255,v&255];out.push(...b.slice(0,n-1))}return new Uint8Array(out)}
async function pdfRead(buf){
  const u8=new Uint8Array(buf);const bin=new TextDecoder("latin1").decode(u8);const objs={};
  const ore=/(\d+)\s+0\s+obj\b/g;let m;const starts=[];while((m=ore.exec(bin)))starts.push([+m[1],m.index+m[0].length]);
  starts.forEach(([id,st])=>{const en=bin.indexOf("endobj",st);objs[id]={st,en,raw:bin.slice(st,en)}});
  const rawStream=async o=>{const i=o.raw.indexOf("stream");if(i<0||o.st==null)return null;let ds=o.st+i+6;if(bin[ds]==="\r")ds++;if(bin[ds]==="\n")ds++;
    let de=bin.lastIndexOf("endstream",o.en);const L=o.raw.slice(0,i).match(/\/Length\s+(\d+)(?!\s+\d+\s+R)/);if(L&&ds+ +L[1]<=de)de=ds+ +L[1];else{while(de>ds&&(bin[de-1]==="\n"||bin[de-1]==="\r"))de--}
    return {dict:o.raw.slice(0,i),data:u8.subarray(ds,de)}};
  const streamOf=async o=>{const r=await rawStream(o);if(!r)return null;let data=r.data;if(/ASCII85Decode|\/A85/.test(r.dict))data=a85(data);
    if(/FlateDecode/.test(r.dict)){try{data=await inflateZ(data)}catch(e){try{data=await inflateRaw(data.subarray(2))}catch(e2){return null}}}return new TextDecoder("latin1").decode(data)};
  /* đối tượng trong ObjStm */
  for(const id in objs){if(/\/Type\s*\/ObjStm/.test(objs[id].raw)){const t=await streamOf(objs[id]);if(!t)continue;const F=+(objs[id].raw.match(/\/First\s+(\d+)/)||[])[1];const nums=t.slice(0,F).trim().split(/\s+/).map(Number);
    for(let k=0;k<nums.length;k+=2){const oid=nums[k],off=nums[k+1],next=k+3<nums.length?nums[k+3]:t.length-F;if(!objs[oid])objs[oid]={raw:t.slice(F+off,F+next)}}}}
  const hexToStr=h=>{let s="";for(let i=0;i<h.length;i+=4){const c=parseInt(h.substr(i,4),16);if(isNaN(c))break;s+=String.fromCharCode(c)}return s};
  const parseCMap=t=>{const map={};let w=1;
    (t.match(/beginbfchar([\s\S]*?)endbfchar/g)||[]).forEach(bl=>bl.replace(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g,(a,src,dst)=>{w=Math.max(w,src.length/2);map[parseInt(src,16)]=hexToStr(dst);return a}));
    (t.match(/beginbfrange([\s\S]*?)endbfrange/g)||[]).forEach(bl=>bl.replace(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]+>|\[[^\]]*\])/g,(a,lo,hi,dst)=>{w=Math.max(w,lo.length/2);const L=parseInt(lo,16),H=parseInt(hi,16);
      if(dst[0]==="<"){const base=parseInt(dst.slice(1,-1),16);for(let c=L;c<=H&&c-L<65536;c++)map[c]=String.fromCodePoint(base+(c-L))}else{const arr=dst.match(/<([0-9A-Fa-f]+)>/g)||[];for(let c=L;c<=H;c++)if(arr[c-L])map[c]=hexToStr(arr[c-L].slice(1,-1))}return a}));
    return {map,w}};
  const fontCMap={};for(const id in objs){const r=objs[id].raw;const tu=r.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);if(/\/Type\s*\/Font/.test(r)&&tu&&objs[tu[1]]){const t=await streamOf(objs[tu[1]]);if(t)fontCMap[id]=parseCMap(t)}}
  const nameToFont={};for(const id in objs){objs[id].raw.replace(/\/([\w.+-]+)\s+(\d+)\s+0\s+R/g,(b,nm,oid)=>{if(fontCMap[oid]&&!nameToFont[nm]&&!/^(ToUnicode|FontDescriptor|Parent|Contents|Resources|DescendantFonts)$/.test(nm))nameToFont[nm]=fontCMap[oid];return b})}
  const lit=s=>s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g,(a,c)=>({n:"\n",r:"",t:" ",b:"",f:""}[c]??(/^[0-7]/.test(c)?String.fromCharCode(parseInt(c,8)):c)));
  const dec=(raw,font)=>{if(!font)return raw;let s="";const w=font.w;for(let i=0;i+w<=raw.length;i+=w){let c=0;for(let k=0;k<w;k++)c=c*256+raw.charCodeAt(i+k);s+=font.map[c]??""}return s};
  const rot=(b,c)=>Math.abs(+b)>0.05||Math.abs(+c)>0.05;
  const pages=[];let dropped=0;
  for(const id in objs){const o=objs[id];if(o.st==null)continue;const r=o.raw;const si=r.indexOf("stream");if(si<0)continue;const d=r.slice(0,si);
    if(/\/Subtype\s*\/Image|\/Type\s*\/(Font|Metadata|ObjStm|XRef|EmbeddedFile)|\/Length1|\/Subtype\s*\/(Type1C|CIDFontType0C|OpenType|XML)/.test(d))continue;
    const t=await streamOf(o);if(!t||!/T[Jj]/.test(t))continue;let font=null,out="",rotated=false;const stack=[];
    const tok=/\bq\b|\bQ\b|(-?\d*\.?\d+) (-?\d*\.?\d+) (-?\d*\.?\d+) (-?\d*\.?\d+) -?\d*\.?\d+ -?\d*\.?\d+ (Tm|cm)|\/([\w.+-]+)\s+[\d.]+\s+Tf|\[([^\]]*)\]\s*TJ|\(((?:\\.|[^\\)])*)\)\s*(?:Tj|')|<([0-9A-Fa-f\s]*)>\s*Tj|(T\*|Td|TD|ET)\b/g;let k;
    while((k=tok.exec(t))){const w0=k[0];
      if(w0==="q"){stack.push(rotated);continue}if(w0==="Q"){rotated=stack.length?stack.pop():false;continue}
      if(k[5]){if(k[5]==="cm"){if(rot(k[2],k[3]))rotated=true}else rotated=stack.includes(true)||rot(k[2],k[3]);continue}
      if(k[6]){font=nameToFont[k[6]]||null;continue}if(k[10]){out+="\n";continue}
      const pieces=k[7]!=null?(k[7].match(/\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]*>|-?\d+(?:\.\d+)?/g)||[]):[k[8]!=null?`(${k[8]})`:`<${k[9]}>`];
      let str="";pieces.forEach(pc=>{if(pc[0]==="(")str+=dec(lit(pc.slice(1,-1)),font);else if(pc[0]==="<"){const h=pc.slice(1,-1).replace(/\s/g,"");let raw="";for(let i=0;i<h.length;i+=2)raw+=String.fromCharCode(parseInt(h.substr(i,2),16));str+=dec(raw,font)}else if(+pc<-180)str+=" "});
      if(rotated){if(str.trim())dropped++;continue}out+=str}
    if(out.trim())pages.push(out)}
  /* dòng lặp lại ở hầu hết các trang (watermark ngang, đầu trang, chân trang) */
  const norm2=x=>x.trim().replace(/\s+/g," ").replace(/\d+/g,"#");const cnt={};pages.forEach(p=>new Set(p.split("\n").map(norm2).filter(x=>x.length>2)).forEach(l=>cnt[l]=(cnt[l]||0)+1));
  const rep=pages.length>=3?Object.keys(cnt).filter(l=>cnt[l]>=Math.ceil(pages.length*0.6)):[];
  const text=pages.map(p=>p.split("\n").filter(l=>{const n=norm2(l);if(rep.includes(n)){dropped++;return false}return true}).join("\n")).join("\n\n").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n");
  /* ảnh lớn (trang scan) */
  const images=[];for(const id in objs){const o=objs[id];if(o.st==null)continue;const d=o.raw.slice(0,Math.max(0,o.raw.indexOf("stream")));if(!/\/Subtype\s*\/Image/.test(d))continue;
    const W=+(d.match(/\/Width\s+(\d+)/)||[])[1],H=+(d.match(/\/Height\s+(\d+)/)||[])[1];if(!(W>=400&&H>=300))continue;const r=await rawStream(o);if(!r)continue;
    if(/DCTDecode/.test(d))images.push(new Blob([r.data.slice()],{type:"image/jpeg"}));
    else if(/FlateDecode/.test(d)&&/\/BitsPerComponent\s+8/.test(d)){try{const px=await inflateZ(r.data);const ch=/DeviceGray/.test(d)?1:/DeviceRGB/.test(d)?3:0;if(!ch||px.length<W*H*ch)continue;
      const cv=document.createElement("canvas");cv.width=W;cv.height=H;const ctx=cv.getContext("2d");const id2=ctx.createImageData(W,H);for(let i=0,j=0;i<W*H;i++){const v=ch===1?[px[i],px[i],px[i]]:[px[i*3],px[i*3+1],px[i*3+2]];id2.data[j++]=v[0];id2.data[j++]=v[1];id2.data[j++]=v[2];id2.data[j++]=255}
      ctx.putImageData(id2,0,0);images.push(await new Promise(res=>cv.toBlob(res,"image/png")))}catch(e){}}}
  return {text,images,dropped,pages:pages.length};
}
async function pdfText(buf){return (await pdfRead(buf)).text}
/* Tách câu theo mẫu đề quen thuộc: "1. ..." / "Câu 1: ..." + A. B. C. D. (cùng dòng hoặc mỗi dòng), đáp án đánh dấu * hoặc bảng đáp án "1.A 2.C" / "1-A" */
function qNumbers(text){const keyM=text.search(/(?:ĐÁP ÁN|Đáp án|ANSWER KEY|Answer key)/);const body=keyM>=0?text.slice(0,keyM):text;const set=new Set();
  body.replace(/(?:^|\n)\s*(?:Câu|Question|Bài)?\s*(\d{1,2})\s*[.):]/gi,(a,n)=>{set.add(+n);return a});return [...set].sort((x,y)=>x-y)}
function qChunk(text,n){const re=new RegExp(`(?:^|\\n)\\s*(?:Câu|Question)?\\s*${n}\\s*[.):][\\s\\S]*?(?=\\n\\s*(?:Câu|Question)?\\s*\\d{1,2}\\s*[.):]|$)`,"i");const m=text.match(re);return m?m[0].trim().slice(0,400):""}
function smartParse(text){
  const keyM=text.match(/(?:ĐÁP ÁN|Đáp án|ANSWER KEY|Answer key)[\s\S]*$/);const key={};if(keyM){keyM[0].replace(/(\d{1,2})\s*[.\-:)]\s*([A-D])\b/g,(a,n,l)=>{key[+n]="ABCD".indexOf(l)})}
  const body=keyM?text.slice(0,keyM.index):text;
  const qs=body.split(/\n\s*(?=(?:Câu|Question)?\s*\d{1,2}\s*[.):]\s?)/i);const out=[];
  qs.forEach(q=>{const mm=q.match(/^\s*(?:Câu|Question)?\s*(\d{1,2})\s*[.):]\s*([\s\S]*)$/i);if(!mm)return;const num=+mm[1];let rest=mm[2].replace(/\n/g," ").trim();
    const ix=[];const r=/(^|\s|\()(\*?)([A-Da-d])\s?[.)/:]\s*/g;let k;while((k=r.exec(rest))){ix.push({pos:k.index+k[1].length,star:!!k[2],L:k[3].toUpperCase(),len:k[0].length-k[1].length})}
    const seq=[];for(const L of "ABCD"){const f=ix.find(x=>x.L===L&&(!seq.length||x.pos>seq[seq.length-1].pos));if(f)seq.push(f);else break}
    if(seq.length>=2&&rest.slice(0,seq[0].pos).trim()){const stem=rest.slice(0,seq[0].pos).trim();
      let opts=seq.map((o,i)=>rest.slice(o.pos+o.len,i<seq.length-1?seq[i+1].pos:undefined).trim().replace(/\s{2,}.*$/,""));
      let a=seq.findIndex(o=>o.star);const st2=opts.findIndex(o=>/^\*/.test(o));if(a<0&&st2>=0)a=st2;opts=opts.map(o=>o.replace(/^\*\s*/,""));if(a<0&&key[num]!=null)a=key[num];
      const full=opts.length===4;while(opts.length<4)opts.push("");
      out.push(Object.assign(mkItem({id:newItemId("TV.TK.01"),stem,options:opts,answer:a<0?0:a,skill:"TV.TK.01",source:"Tải lên",check:a<0||!full?"chua":"khop",isNew:true}),{n:num,checkWhy:full?undefined:`Chỉ đọc được ${seq.length} phương án, cô bổ sung giúp.`}));return}
    if(rest.length>8&&/→|rewrite|write|viết lại|complete|hoàn thành|begin|bắt đầu|_{3,}|\.{4,}/i.test(rest)){
      out.push(Object.assign(mkItem({id:newItemId("VL.01"),type:"rewrite",stem:rest.slice(0,400),options:null,answer:"",skill:"VL.01",source:"Tải lên",check:"chua",isNew:true}),{n:num,checkWhy:"Câu tự luận, cô thêm đáp án mẫu."}))}});
  return out;
}
/* Luồng "Agent đọc file": hiện từng bước cho cô thấy, trả về danh sách câu */
async function agentRead(f,res){
  const ext=f.name.split(".").pop().toLowerCase();const isImg=["png","jpg","jpeg","heic","webp"].includes(ext);
  const steps=["Đọc file","Lấy chữ trong file","Nhận dạng chữ trong ảnh (OCR)","Tách câu và phương án","Gán kỹ năng, chấm độ khó","Giải độc lập để kiểm đáp án"];let cur=0,skipOcr=true,note="";
  const draw=()=>{res.innerHTML=`<div class="agentrun"><b>TOMO đang đọc "${esc(f.name)}"</b><ol>${steps.map((s,i)=>i===2&&skipOcr&&cur<=2?"":`<li class="${i<cur?"done":i===cur?"now":""}">${i<cur?ic("check",13):i===cur?'<span class="spin sm"></span>':'<i class="dot"></i>'} ${s}</li>`).join("")}</ol>${note?`<p class="small muted">${note}</p>`:""}</div>`};
  const step=n=>{cur=n;draw()};draw();
  const buf=await f.arrayBuffer();step(1);let text="",under=0,imgs=[],dropped=0;
  if(ext==="docx"){const r=await docxText(buf);text=r.text;under=r.under}
  else if(ext==="xlsx"){text=await xlsxText(buf)}
  else if(ext==="pdf"){const r=await pdfRead(buf);text=r.text;imgs=r.images;dropped=r.dropped}
  else if(["csv","txt"].includes(ext)){text=new TextDecoder().decode(buf)}
  else if(isImg){imgs=[new Blob([buf],{type:f.type||"image/jpeg"})]}
  else throw {code:"type"};
  const thin=text.replace(/\s/g,"").length<60;
  if(thin&&imgs.length){if(!imgOK)throw {code:isImg?"image":"scan"};skipOcr=false;note=`${imgs.length} ảnh trang được gửi cho Claude đọc chữ.`;step(2);
    let all="";const one=async (arr,lab)=>{note=`Claude đang đọc ${lab}…`;draw();try{return await AI.ocr(arr)}catch(e){if(e&&e.code==="not_granted")throw {code:"denied"};throw {code:"ocrfail"}}};
    for(let i=0;i<imgs.length;i+=2){const part=imgs.slice(i,i+2);let r=await one(part,`ảnh ${i+1}${part.length>1?"–"+(i+part.length):""}/${imgs.length}`);
      if(r.truncated&&part.length>1){r={text:""};for(let j=0;j<part.length;j++){const rr=await one([part[j]],`ảnh ${i+j+1}/${imgs.length} (từng trang)`);r.text+="\n"+rr.text}}
      all+="\n"+r.text}
    text=all;under=(text.match(/(^|[^_\w])_([A-Za-zÀ-ỹ][^_\n]{0,30})_(?![_\w])/g)||[]).length}
  if(text.replace(/\s/g,"").length<30)throw {code:ext==="pdf"?"scan":"empty"};
  if(dropped)note=`Đã bỏ ${dropped} đoạn watermark hoặc chữ lặp ở mỗi trang.`;
  step(3);let items=ext==="csv"||ext==="xlsx"?csvParse(text):[];if(!items.length)items=smartParse(text);if(!items.length&&ext==="txt")items=localParse(text);
  let via=skipOcr?"mẫu":"OCR";
  if(sampleFn){step(4);try{const parts=[];let cur2="";text.split(/\n(?=\s*(?:Câu|Question)?\s*\d{1,2}\s*[.):])/i).forEach(seg=>{if((cur2+seg).length>4500&&cur2){parts.push(cur2);cur2=""}cur2+="\n"+seg});if(cur2.trim())parts.push(cur2);
    let ai=[];for(let i=0;i<parts.length;i++){note=`TOMO đang tách phần ${i+1}/${parts.length}…`;draw();ai=ai.concat(await AI.parseText(parts[i]))}
    if(ai.length){const have=new Set(ai.map(x=>x.n).filter(Boolean));const fill=items.filter(x=>!x.n||!have.has(x.n));items=(ai.some(x=>x.n)?ai.concat(fill):ai.length>=items.length?ai:items).sort((x,y)=>(x.n||999)-(y.n||999));via=skipOcr?"TOMO":"OCR+TOMO"}}catch(e){}}
  else{step(4)}
  step(5);if(sampleFn){try{await AI.blind(items)}catch(e){}}
  const nums=qNumbers(text),got=new Set(items.map(x=>x.n).filter(Boolean));const missing=got.size?nums.filter(n=>!got.has(n)).map(n=>({n,raw:qChunk(text,n)})):[];
  cur=6;draw();return {items,via,under,chars:text.length,dropped,ocr:!skipOcr,missing,nums,text};
}
