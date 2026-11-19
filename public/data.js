/* Dữ liệu mẫu cho prototype. Nguồn: tab Tổng hợp GV (đề mẫu Unit 12, S13–S15) và đề tham khảo "Đề số 4 — Kiểm tra giữa kì 1 — Tiếng Anh 8" do người dùng cung cấp. */
window.D = (function(){
const UNITS = [[1,"Leisure time"],[2,"Life in the countryside"],[3,"Teenagers"],[4,"Ethnic groups of Viet Nam"],[5,"Our customs and traditions"],[6,"Lifestyles"],[7,"Environmental protection"],[8,"Shopping"],[9,"Natural disasters"],[10,"Communication in the future"],[11,"Science and technology"],[12,"Life on other planets"]];
const SKILLS = {
 "NP.TH.01":"Thì hiện tại đơn","NP.TH.02":"Thì quá khứ tiếp diễn","NP.TH.03":"Thì tương lai đơn","NP.TH.04":"Thì hiện tại hoàn thành",
 "NP.SS.01":"So sánh hơn","NP.CC.01":"Liên từ, câu ghép","NP.CC.02":"Câu hỏi Yes/No và Wh-","NP.CC.03":"Mệnh đề thời gian",
 "NP.CC.04":"Câu điều kiện loại 1","NP.CC.05":"Câu tường thuật: câu trần thuật","NP.CC.06":"Câu tường thuật: câu hỏi","NP.CC.07":"Câu cảm thán",
 "NP.TL.01":"Động từ sở thích + V-ing / to V","NP.TL.03":"Mạo từ","NP.TL.05":"Giới từ; đại từ sở hữu",
 "TV.CD.01":"Từ vựng giải trí, lối sống","TV.CD.02":"Từ vựng thôn quê, dân tộc, phong tục","TV.CD.05":"Từ vựng khoa học, hành tinh",
 "TV.TK.01":"Kết hợp từ","TV.TK.02":"Dạng từ","TV.DN.01":"Từ đồng nghĩa, trái nghĩa",
 "NA.AM.02":"Phát âm nguyên âm, phụ âm","NA.TA.01":"Trọng âm từ","GT.HT.01":"Lời mời, gợi ý, khuyên","GT.HT.02":"Hội thoại tình huống",
 "DH.DD.01":"Điền từ vào đoạn văn","DH.DH.02":"Đọc hiểu: tìm chi tiết","DH.DH.03":"Đọc hiểu: suy luận","VL.01":"Viết lại câu"
};
const UNIT_SKILLS = {1:["NP.TL.01","TV.CD.01","NA.TA.01","GT.HT.02"],2:["NP.SS.01","TV.CD.02","NA.AM.02","DH.DD.01"],3:["NP.CC.01","TV.CD.01","GT.HT.01"],4:["NP.CC.02","TV.CD.02","NP.TL.03"],5:["NP.TL.03","TV.CD.02","DH.DD.01"],6:["NP.TH.03","NP.CC.04","TV.CD.01"],7:["NP.CC.03","TV.TK.02","GT.HT.01"],8:["NP.TH.01","TV.TK.01","GT.HT.02"],9:["NP.TH.02","TV.TK.01","NA.AM.02"],10:["NP.TL.05","GT.HT.02","NA.TA.01"],11:["NP.CC.05","TV.CD.05","TV.TK.02"],12:["NP.CC.06","NP.CC.05","TV.CD.05","NA.TA.01","DH.DH.02"]};

const NAMES = ["An","Bình","Chi","Dũng","Giang","Hà","Hải","Hoa","Huy","Khoa","Lan","Linh","Mai","Minh","Nam","Ngọc","Phúc","Quân","Thảo","Tú"];
const PARENTS = ["chị Hạnh","anh Tuấn","chị Liên","anh Sơn","chị Thu","chị Nga","anh Đức","chị Vân","anh Hùng","chị Phương","chị Hồng","anh Long","chị Yến","anh Thắng","chị Hiền","anh Bảo","chị Mơ","anh Trung","chị Lụa","anh Khải"];
const TH = [1.6,0.9,0.4,0.7,0.2,0.3,-0.1,0.5,0.0,0.8,-0.6,0.6,0.1,-0.7,0.3,0.4,-0.2,0.2,0.9,-0.9];
const STUDENTS = NAMES.map((n,i)=>({id:"HS02"+String(i+1).padStart(2,"0"),name:n,parent:PARENTS[i],zalo:n!=="Tú",phoneOK:n!=="Minh",theta:TH[i],firstReport:n==="Phúc"}));

/* Mức kỹ năng Unit 12 (0 Chưa làm được, 1 Đang luyện, 2 Làm được, 3 Thành thạo); t = tạm tính */
const SK12 = ["TV.CD.05","NA.TA.01","NP.CC.05","NP.CC.06","DH.DH.02"];
const MASTERY = {
 An:[3,2,3,1,2],Bình:[3,2,2,2,3],Chi:[2,1,2,1,2],Dũng:[3,2,2,2,2],Giang:[2,1,2,1,1],Hà:[2,2,2,1,2],Hải:[2,1,1,1,1],Hoa:[3,2,2,1,2],
 Huy:[2,1,2,1,2],Khoa:[3,2,2,1,2],Lan:[1,1,1,0,1],Linh:[3,2,2,2,2],Mai:[2,2,2,1,2],Minh:[2,1,1,0,1],Nam:[2,2,2,1,2],Ngọc:[2,2,2,2,2],
 Phúc:[2,1,1,1,1],Quân:[2,2,2,1,2],Thảo:[3,3,2,2,3],Tú:[1,0,1,0,1]
};
const TAMTINH = ["Lan","Tú","Phúc"];

/* Đề mẫu bài về nhà Unit 12 (tab Tổng hợp, mục Đề mẫu dùng cho S13–S15) */
const r = (A,B,C,D,E)=>({A,B,C,D,E});
const U12 = [
 {n:1,stem:"A creature from another planet is called an ___.",options:["alien","astronaut","planet","galaxy"],answer:0,skill:"TV.CD.05",rub:r(0,0,1,0,0)},
 {n:2,stem:"Mars is often called the Red ___.",options:["Star","Planet","Moon","Sun"],answer:1,skill:"TV.CD.05",rub:r(0,1,0,0,0)},
 {n:3,stem:"Choose the word with a different stress pattern.",options:["planet","alien","surface","survive"],answer:3,skill:"NA.TA.01",rub:r(1,1,2,1,1)},
 {n:4,stem:"\"I am tired,\" she said. → She said that she ___ tired.",options:["is","was","were","be"],answer:1,skill:"NP.CC.05",rub:r(1,1,1,1,2)},
 {n:5,stem:"\"We will visit Mars,\" they said. → They said they ___ visit Mars.",options:["will","would","shall","can"],answer:1,skill:"NP.CC.05",rub:r(1,2,1,1,2)},
 {n:6,stem:"\"Do you like science?\" he asked me. → He asked me ___ I liked science.",options:["if","that","what","do"],answer:0,skill:"NP.CC.06",rub:r(2,2,2,1,2)},
 {n:7,stem:"\"Where do you live?\" Hoa asked me. → Hoa asked me ___.",options:["where I lived","where did I live","where I live","where do I live"],answer:0,skill:"NP.CC.06",rub:r(2,2,2,2,2)},
 {n:8,stem:"\"What are you doing?\" Mai asked Nam. → Mai asked Nam what he ___ doing.",options:["is","was","were","does"],answer:1,skill:"NP.CC.06",rub:r(2,2,2,2,2)},
 {n:9,stem:"(Đoạn 60 từ về nước trên sao Hỏa) Which detail is TRUE?",options:["There is ice under the surface.","Mars has big oceans.","People live on Mars.","Mars is warmer than Earth."],answer:0,skill:"DH.DH.02",rub:r(1,1,1,2,1)},
 {n:10,stem:"(Cùng đoạn) What can be inferred from the passage?",options:["All scientists agree there is life on Mars.","Water on Mars may help future visitors.","Mars will be easy to live on.","Nobody studies Mars any more."],answer:1,skill:"DH.DH.03",rub:r(2,3,2,3,2)}
];
const HW_RATE = [94,89,61,83,72,56,50,61,78,39];
const HW_WRONG = ["astronaut (1 em)","Star (2 em)","planet (5 em)","is (3 em)","will (5 em)","that (6 em)","where did I live (6 em)","is (5 em)","—","A (7 em)"];
const HW_ERR = ["—","—","Nhầm trọng âm từ 2 âm tiết","Quên lùi thì","Quên lùi thì","Dùng \"that\" cho câu hỏi Yes/No","Giữ trật tự câu hỏi","Quên lùi thì","—","Chọn phương án tuyệt đối (\"All…\")"];
const HW_SCORE = {An:9,Bình:8,Chi:7,Dũng:7,Giang:6,Hà:8,Hải:6,Hoa:7,Huy:6,Khoa:9,Lan:null,Linh:7,Mai:7,Minh:5,Nam:6,Ngọc:8,Phúc:5,Quân:6,Thảo:9,Tú:null};
const HW_TIME = {An:4,Bình:12,Chi:10,Dũng:11,Giang:13,Hà:9,Hải:12,Hoa:11,Huy:12,Khoa:5,Linh:10,Mai:11,Minh:15,Nam:12,Ngọc:10,Phúc:14,Quân:12,Thảo:9};
const HW_NEED = {Bình:"Lùi thì",Minh:"Giữ trật tự câu hỏi, lùi thì",Giang:"Giữ trật tự câu hỏi",Hải:"Lùi thì",Phúc:"Trọng âm",Huy:"Giữ trật tự câu hỏi",Nam:"Lùi thì",Quân:"Giữ trật tự câu hỏi"};
const MINH_DETAIL = [[1,"Đúng","alien","—",40],[2,"Đúng","Planet","—",35],[3,"Sai","planet","Nhầm trọng âm từ 2 âm tiết",70],[4,"Đúng","was","—",60],[5,"Sai","will","Quên lùi thì",80],[6,"Sai","that","Dùng \"that\" cho câu hỏi Yes/No",95],[7,"Sai","where did I live","Giữ trật tự câu hỏi",120],[8,"Đúng","was","—",90],[9,"Đúng","A","—",150],[10,"Sai","A","Chọn phương án tuyệt đối",160]];

/* Kết quả kiểm tra sinh đôi (S14) */
const TWIN = {
 An:{home:9,cls:5,exp:9,cmp:"Thấp hơn nhiều",und:"Đang luyện",next:"Cần cô xác nhận"},
 Khoa:{home:9,cls:5,exp:8.5,cmp:"Thấp hơn nhiều",und:"Đang luyện",next:"Cần cô xác nhận"},
 Chi:{home:7,cls:5,exp:7,cmp:"Thấp hơn một chút",und:"Đang luyện",next:"Nên kiểm tra thêm"},
 Hà:{home:8,cls:6,exp:7.5,cmp:"Thấp hơn một chút",und:"Làm được",next:"Nên kiểm tra thêm"},
 Bình:{home:8,cls:7,exp:7.5,cmp:"Khớp",und:"Làm được",next:"Giao bài tiếp"},
 Minh:{home:5,cls:5,exp:5,cmp:"Khớp",und:"Chưa làm được",next:"Luyện lỗi giữ trật tự câu hỏi"},
 Dũng:{home:7,cls:8,exp:6.5,cmp:"Cao hơn dự kiến",und:"Làm được",next:"Giao bài tiếp"}
};
const AN_PAIRS = [[6,"Đúng","Sai","BTVN đúng, trên lớp sai"],[7,"Đúng","Sai","BTVN đúng, trên lớp sai"],[8,"Đúng","Đúng","Làm được cả hai"],[4,"Sai","Đúng","Đã học được sau bài nhà"]];

/* Hàng chờ xác nhận (S10) */
const VERIFY = [
 {name:"An",task:"Unit 12",home:9,cls:5,exp:9,why:"2 lần sao chép rồi rời bài · Đúng liền nhiều câu khó",ask:"vì sao em chọn đáp án ở câu 7"},
 {name:"Khoa",task:"Unit 12",home:9,cls:5,exp:8.5,why:"Làm 10 câu trong 5 phút · Rời bài 3 lần",ask:"cách em lùi thì ở câu 8",prior:1},
 {name:"Ngọc",task:"Unit 11",home:8,cls:4,exp:7.5,why:"Dán câu trả lời tự luận 2 lần",ask:"em viết lại câu 3 thế nào"}
];

/* ===== Đề tham khảo giữa kì 1 (đề số 4) — dùng cho luồng Tải file lên ===== */
const M = (n,sec,type,stem,options,answer,skill,rub,extra)=>Object.assign({n,sec,type,stem,options,answer,skill,rub},extra||{});
const P1 = "The Muong (25) ___ ethnic roots with the Vietnamese people and their language is classified in the Vietnamese-Muong language branch. The Muong live in mountainous areas which have abundant land for (26) ___ wet rice. … The Muong's (27) ___ is special. … The gong is the most popular musical instrument along with the flute, the (28) ___ violin, the drum, and the panpipe.";
const P2 = "The thing I liked most when I was small was the change of seasons. Spring, summer, autumn and winter — I could see them all come and go and each one was completely different. Now in the city, you can buy summer flowers in winter and eat the same vegetables all the year round. … We also made most of our food and would never eat frozen or tinned food. Everything was fresh, so it must be better than the type of food I am taking now in the city. …";
const MID = [
 M(1,"A. Phonetics","mcq","Choose the word whose underlined part is pronounced differently.",["penalty","celebrate","leisure","eight"],3,"NA.AM.02",r(1,1,1,0,1),{lostUnderline:true}),
 M(2,"A. Phonetics","mcq","Choose the word whose underlined part is pronounced differently.",["paragraph","although","laugh","enough"],1,"NA.AM.02",r(1,1,1,0,1),{lostUnderline:true}),
 M(3,"A. Phonetics","mcq","Choose the word with a different stress pattern.",["blackberry","heritage","museum","decorate"],2,"NA.TA.01",r(1,1,1,0,1)),
 M(4,"A. Phonetics","mcq","Choose the word with a different stress pattern.",["minorities","activity","populated","experience"],2,"NA.TA.01",r(2,1,2,0,1)),
 M(5,"B. Vocabulary and grammar","mcq","Find the mistake: What part of our country would you most like to live in?",["What","part of our country","would you most like","to live in"],0,"NP.CC.02",r(1,2,2,1,2),{lostUnderline:true}),
 M(6,"B. Vocabulary and grammar","mcq","Find the mistake: Mua sap is the typical dance of the Muong people in the North West.",["the typical","dance","of the Muong people","in the North West"],0,"NP.TL.03",r(1,2,2,1,2),{lostUnderline:true}),
 M(7,"B. Vocabulary and grammar","mcq","Find the mistake: Five-coloured sticky rice is a traditional dish in the north mountainous regions.",["traditional","dish","north","mountainous regions"],2,"TV.TK.02",r(1,2,1,1,1),{lostUnderline:true}),
 M(8,"B. Vocabulary and grammar","mcq","The ___ on display in Da Nang Museum of Cham Sculpture are very interesting.",["goods","shows","products","items"],3,"TV.CD.02",r(1,1,2,1,1)),
 M(9,"B. Vocabulary and grammar","mcq","The boys often help their parents to ___ water from the village well.",["collect","gather","find","give"],0,"TV.TK.01",r(1,1,2,0,1)),
 M(10,"B. Vocabulary and grammar","mcq","The crops ___ on the weather.",["affect heavily","affect heavy","depend heavily","depend heavy"],2,"TV.TK.01",r(1,1,2,1,2)),
 M(11,"B. Vocabulary and grammar","mcq","___ month is the Hoa Ban Festival of the Thai people held in?",["Which","How many","When","How often"],0,"NP.CC.02",r(0,1,1,0,1)),
 M(12,"B. Vocabulary and grammar","mcq","In the Central Highlands, the biggest and tallest house in the village is the ___ house.",["commune","communication","communal","community"],2,"TV.TK.02",r(1,1,2,0,1)),
 M(13,"B. Vocabulary and grammar","mcq","The Viet people have many ___ customs and crafts.",["culture","traditional","customary","tradition"],1,"TV.TK.02",r(1,1,1,0,1),{explainIssue:"Lời giải dịch \"tradition\" là \"truyền thuyết\"; nên là \"truyền thống\"."}),
 M(14,"B. Vocabulary and grammar","mcq","The Gong Festival is held ___ in the Central Highlands.",["yearly","annually","year","annual"],1,"TV.TK.02",r(1,1,3,0,2),{check:"lech",checkPick:-1,checkWhy:"Có 2 phương án đúng: \"yearly\" và \"annually\" đều là trạng từ và đều hợp nghĩa. Lời giải còn ghi \"annually (adj)\"."}),
 M(15,"B. Vocabulary and grammar","mcq","An old woman was ___ the goats up the mountainside.",["talking","herding","riding","running"],1,"TV.CD.02",r(2,1,1,1,0)),
 M(16,"B. Vocabulary and grammar","mcq","My dad doesn't mind ___ my mom from work every day.",["picks up","picking up","pick up","picked up"],1,"NP.TL.01",r(0,1,1,0,1),{inBank:true}),
 M(17,"B. Vocabulary and grammar","mcq","Life in a small town is ___ than that in a big city.",["much more peaceful","less peaceful","much peaceful","peaceful"],0,"NP.SS.01",r(1,1,2,0,1)),
 M(18,"B. Vocabulary and grammar","mcq","It is typical of the cultural life of ___ Thai people.",["the","∅ (không dùng mạo từ)","a","some"],0,"NP.TL.03",r(1,1,1,0,1),{inBank:true}),
 M(19,"B. Vocabulary and grammar","mcq","Nga: The Thai not only have their own language but also they have their own writing system. — Ba: ___",["I see","Check out this","How interesting!","It's right up your street"],2,"GT.HT.02",r(0,1,1,1,0)),
 M(20,"B. Vocabulary and grammar","mcq","Tuan: \"My favourite leisure activity is people watching.\" — Hoa: ___",["That sounds so weird!","OK. That's what you've chosen.","That's all right.","Sure. It's very entertaining."],0,"GT.HT.02",r(1,2,2,1,1),{check:"lech",checkPick:3,checkWhy:"Phương án D cũng là một phản hồi tự nhiên; đáp án A chỉ đúng nếu Hoa thấy sở thích này lạ."}),
 M(21,"B. Vocabulary and grammar","mcq","CLOSEST in meaning to \"experienced\": The Thai are experienced farmers. They grow different crops.",["bad","better","worse","good"],3,"TV.DN.01",r(2,2,2,1,1)),
 M(22,"B. Vocabulary and grammar","mcq","CLOSEST in meaning to \"famous\": The northwest region of Viet Nam is famous for breathtaking rice terraced paddy fields.",["fabulous","well-known","surprised","interesting"],1,"TV.DN.01",r(1,1,1,1,0),{inBank:true}),
 M(23,"B. Vocabulary and grammar","mcq","OPPOSITE in meaning to \"traditional\": Ethnic peoples often put on their traditional costumes on special occasions.",["good","beautiful","different","modern"],3,"TV.DN.01",r(1,1,1,1,0)),
 M(24,"B. Vocabulary and grammar","mcq","OPPOSITE in meaning to \"important\": Gathering and hunting still play an important role in the economy of the Laha.",["traditional","major","insignificant","inconvenient"],2,"TV.DN.01",r(2,1,1,1,0)),
 M(25,"C. Reading","mcq","Passage 1, blank (25)",["cut","have","share","divide"],2,"DH.DD.01",r(2,1,2,2,0),{passage:P1}),
 M(26,"C. Reading","mcq","Passage 1, blank (26)",["raising","harvesting","growing","putting"],2,"DH.DD.01",r(1,1,1,2,0),{passage:P1,keyNote:"Đề gốc đánh số chỗ trống này là (25) lần hai; hệ thống đã đổi thành (26)."}),
 M(27,"C. Reading","mcq","Passage 1, blank (27)",["material","costumes","cloth","costume"],3,"DH.DD.01",r(1,1,2,2,1),{passage:P1}),
 M(28,"C. Reading","mcq","Passage 1, blank (28)",["two strings","two-string","second-string","two string"],1,"DH.DD.01",r(1,1,2,2,1),{passage:P1}),
 M(29,"C. Reading","mcq","What did the writer like most about living in the country?",["Flowers in spring","The wild animals and plants","Leaves in autumn","The change of seasons"],3,"DH.DH.02",r(0,1,0,1,0),{passage:P2}),
 M(30,"C. Reading","mcq","What does the word \"them\" in line 2 refer to?",["Plants","Countryside people","Winter and autumn","Four seasons"],3,"DH.DH.02",r(1,2,1,2,0),{passage:P2}),
 M(31,"C. Reading","mcq","Why did the writer never eat tinned food when living in the country?",["Because it was contaminated","Because it wasn't very fresh","Because it was very fat","Because it was frozen"],1,"DH.DH.03",r(1,2,1,2,1),{passage:P2}),
 M(32,"C. Reading","mcq","Which of the following sentences is NOT true?",["In the countryside turnips are grown in winter","The writer often eat frozen and tinned food now","Many city people think they live better than those in the country","People in the city can grow vegetables all year round"],3,"DH.DH.03",r(1,3,2,3,2),{passage:P2,check:"lech",checkPick:1,checkWhy:"Phương án B cũng không được bài đọc xác nhận: bài không nói người viết đang ăn đồ đông lạnh hay đồ hộp. Phương án B còn sai ngữ pháp (\"eat\" → \"eats\")."}),
 M(33,"D. Writing","rewrite","This supermarket isn't as expensive as the one across the street. (less)",null,"This supermarket is less expensive than the one across the street.","NP.SS.01",r(1,2,0,1,1)),
 M(34,"D. Writing","rewrite","The English teacher started teaching at our school three years ago. (for)",null,"The English teacher has taught at our school for three years.","NP.TH.04",r(1,2,0,2,2)),
 M(35,"D. Writing","rewrite","You won't pass the exam unless you study harder. (if)",null,"You won't pass the exam if you don't study harder.","NP.CC.04",r(1,2,0,2,2)),
 M(36,"D. Writing","rewrite","Your village is so beautiful! (What)",null,"What your/ a beautiful village!","NP.CC.07",r(1,2,0,1,2),{check:"lech",fixTo:"What a beautiful village you have!",checkWhy:"Đáp án mẫu sai ngữ pháp. Gợi ý sửa: \"What a beautiful village you have!\""}),
 M(37,"D. Writing","rewrite","Although the villagers are quite poor, they live a happy and healthy way. → In spite of …",null,"In spite of being poor/their poverty, the villagers live a happy and healthy way.","NP.CC.01",r(2,2,0,2,2),{check:"lech",fixTo:"In spite of being quite poor / their poverty, the villagers live in a happy and healthy way.",checkWhy:"Câu gốc và đáp án thiếu giới từ: \"live a … way\" → \"live in a … way\" (hoặc \"live a happy and healthy life\")."}),
 M(38,"D. Writing","rewrite","Romantic films interest me more than war films. → I find …",null,"I find romantic films more interesting than war films.","NP.SS.01",r(1,2,0,2,1)),
 M(39,"D. Writing","rewrite","How long is it since you built this stilt house? → When …",null,"When did you build this stilt house?","NP.CC.02",r(1,2,0,2,1)),
 M(40,"D. Writing","rewrite","Living in a big city is more convenient than living in a village. → It's …",null,"It's more convenient to live in a big city than to live in a village.","NP.SS.01",r(2,2,0,2,1))
];
return {UNITS,SKILLS,UNIT_SKILLS,STUDENTS,SK12,MASTERY,TAMTINH,U12,HW_RATE,HW_WRONG,HW_ERR,HW_SCORE,HW_TIME,HW_NEED,MINH_DETAIL,TWIN,AN_PAIRS,VERIFY,MID,P1,P2};
})();
