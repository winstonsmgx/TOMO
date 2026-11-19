# TOMO · Prototype giáo viên — nội dung nguồn (đồng bộ)

Cập nhật: 18/11/2026 · Artifact: https://claude.ai/artifact/NwsBa2uMuPtJMjnC4KFGou · bản v91

## 0. Cách dùng file này
- Đây là nơi giữ **toàn bộ nội dung** của prototype (thuật ngữ, quy tắc, số liệu mẫu, chữ trên từng màn hình). Khi đổi nội dung: sửa file này trước, rồi cập nhật prototype, Claude Doc, Notion, FigJam cho khớp.
- Số liệu mẫu bên dưới được xuất tự động từ chính prototype (mục 3), nên khớp với các trang Hôm nay, Lớp, Kho đề.
- Bản sao: `content.md` trong artifact (mở từ trang Bản đồ flow) và `claude/tomo-prototype-content.md` trong Project.
- Nhật ký lệnh MCP mỗi lần đăng bản nằm ở file log v16 (ngoài file này).

| Nơi dùng | Đang giữ phần nào | Tình trạng so với file này |
|---|---|---|
| Prototype (artifact) | Toàn bộ | Nguồn chạy thật, khớp |
| Claude Doc 1071472e… | Mô tả sản phẩm, quy tắc, ví dụ 4 giáo viên | Còn từ cũ: "Dùng luôn", luật làm nhanh cũ, bước τ cũ |
| Notion 41b4d4b9… | Hành vi + mục "Cập nhật 18/11/2026" | Còn từ cũ: "đề sinh đôi", "nhãn lỗi" |
| FigJam | Sơ đồ flow | Còn từ cũ: "Dùng luôn" |

## 1. Thuật ngữ (giải thích ở lần dùng đầu)
- **BTVN**: bài tập về nhà.
- **θ (theta)**: năng lực của em, đo từ các bài trước. **b**: độ khó của câu. **τ (tau)**: tốc độ làm bài thường ngày của em. **w**: trọng số tin cậy của một lượt đo.
- **p**: khả năng em làm đúng một câu = 0,25 + 0,75 / (1 + e^-(θ − b)) (câu trắc nghiệm 4 phương án có 25% đoán đúng).
- **z**: độ lệch chuẩn hoá = (số câu đúng thực tế − Σp) / √Σp(1−p).
- **Mức vận dụng** (trục B của rubric độ khó): NB Nhận biết · TH Thông hiểu · VD Vận dụng · VDC Vận dụng cao.
- **Lỗi sai**: tên lỗi gắn cho phương án sai (ví dụ "Chưa lùi thì", "Giữ trật tự câu hỏi", "Suy luận quá lên").
- **Mini test**: bài ngắn dựng từ kết quả BTVN thật của lớp, cùng kỹ năng và độ khó, đổi từ vựng, ngữ cảnh và đáp án (trước đây gọi "đề sinh đôi").
- **4 nhóm câu của mini test**: Đ-dễ (đúng, em có ≥75% khả năng đúng) · Đ-khó (đúng, <50%) · S-dễ (sai câu dễ) · S-khó (sai câu khó).
- **Xếp loại bảng điểm (TT22)**: Tốt ≥ 8 · Khá ≥ 6,5 · Đạt ≥ 5 · Chưa đạt < 5. Hệ số: thường xuyên 1, giữa kỳ 2, cuối kỳ 3.

## 2. Quy tắc hệ thống
1. **Giao bài**: ô Đề gồm cả Sổ giao đề và Nháp; có lối tắt tạo đề mới ngay trong màn (Tải file đề · Nhờ TOMO soạn · Thư viện trường · Tự nhập), tạo xong vào màn xem đề có thanh "Cô đang giao bài cho …" và nút "Giao đề này" để quay lại đúng lớp đã chọn (phải xác nhận hết câu lệch đáp án trước). Màn Giao bài gộp việc chọn lớp, hạn nộp, hình thức (Online / Trên giấy, phiếu QR), một đề cho cả lớp hay mỗi em một đề. Mini test mở ra thì chọn sẵn lớp đã sinh ra nó.
1b. **Rút lại bài đã giao**: ở menu ⋮ của lượt giao (Lịch sử giao bài) và link "rút lại" cạnh từng lớp trong màn xem đề. Bài đang mở có em đã nộp: Đóng bài ngay (giữ bài đã nộp) hoặc Rút hẳn (xoá cả bài đã nộp, em thấy "Cô đã rút bài này"); chưa ai nộp hoặc phiếu giấy chưa nhập: rút / huỷ lượt giao. Có ô lý do; nếu báo cáo phụ huynh đã gửi thì cảnh báo không thu hồi được tin đã gửi, tin đang hẹn bị huỷ.
2. **Báo cáo phụ huynh**: cô bấm gửi trong giờ hành chính, tin hẹn gửi 19:30 (đổi được ở Cài đặt: 18:00–20:30). Từ giờ hẹn đến 22:00 thì gửi luôn; sau 22:00 hẹn sang tối hôm sau. Tin gồm: kết quả, một điều làm tốt, một điều cần luyện, một gợi ý 5 phút; không so với bạn khác, không nhắc chuyện sao chép.
3. **Cảnh báo khi em làm bài** (màn học sinh): chỉ khi làm nhanh liên tục (3 câu nhanh liên tiếp và ≥ 2 câu sai) thì tạm khoá 5 giây; câu dễ (p ≥ 85%) không tính; em giỏi làm đúng nhanh không bị cảnh báo. Chặn sao chép, chặn chụp màn hình, nhắc khi rời bài (bài kiểm tra).
4. **Cảnh báo điểm cao bất thường** (trước khi tạo mini test): z ≥ 2, hoặc z ≥ 1,5 và đúng ≥ 2 câu khó (p < 50%) → nhãn "Điểm cao bất thường" / "Đúng nhiều câu khó"; z ≤ −2 → "Thấp hơn sức". So với chính em, không so với bạn. Lời cảnh báo không dùng chữ "gian lận": mini test mới là bước kết luận.
5. **Đọc file đề**: Agent đọc docx/xlsx/pdf/csv/txt/ảnh (PDF scan và watermark: OCR, bỏ chữ lặp); định dạng lại câu, **luôn đưa đáp án** (theo đề, hoặc TOMO tự giải + độ chắc chắn), giải lại độc lập để kiểm. Chỉ hỏi cô khi đáp án đề lệch TOMO, có >1 đáp án đúng, hoặc TOMO chắc < 70%.
6. **Bảng điểm**: ô điểm sửa được, bắt buộc chọn lý do, mọi lần sửa ghi log, có nút trả về điểm gốc. Cột Mức (Tốt/Khá/Đạt/Chưa đạt); nút i mở "Cần cải thiện" + lời nhắn phụ huynh sửa được.
7. **Việc chờ** (Hôm nay): Em cần cô xác nhận · Phiếu giấy chờ nhập · Báo cáo chưa gửi · Hạn nộp hôm nay · Lớp chưa có bài. Mỗi việc bấm là làm ngay, có menu nhắc lại sau / bỏ qua.
8. **Mini test từ BTVN**: mỗi em một bộ câu, tối đa ~60% lấy từ BTVN của em theo 4 nhóm, còn lại là câu mới cùng kỹ năng. 5 phút ≈ 5 câu, 10 phút ≈ 10 câu (nên dùng), 15 phút ≈ 13 câu.
9. **Kiểm tra lại** (tab Cần xác nhận): bấm thì hiện hai lựa chọn: (a) thêm 2–3 câu cùng kỹ năng vào bài kế tiếp của lớp (mặc định, không tạo bài riêng, nhắc ở màn Giao bài); (b) giao mini test riêng cho em ngay (mở màn Tạo mini test từ BTVN đó). Em chuyển sang "Đã xử lý", chưa bị kết luận.

## 3. Số liệu mẫu (xuất từ prototype)
### 3.1 Lớp
| Lớp | Sĩ số | Khối | Lịch dạy |
|---|---|---|---|
| 8A1 | 38 | 8 | Thứ 2, 4 · tiết 2 |
| 8A2 | 36 | 8 | Thứ 3, 5 · tiết 1 |
| 8A3 | 20 | 8 | Thứ 2, 4, 6 · tiết 3 |
| 8A4 | 35 | 8 | Thứ 3, 6 · tiết 4 |
| 9A1 | 40 | 9 | Thứ 2, 5 · tiết 4 |
| 9A2 | 39 | 9 | Thứ 4, 6 · tiết 1 |

### 3.2 Đề trong Kho
| Mã | Tên | Unit | Phút | Loại | Nơi | Số câu | Ghi chú |
|---|---|---|---|---|---|---|---|
| DE_GV014_0001 | Bài về nhà Unit 11 | 11 | 10 | Luyện tập | mine | 6 |  |
| DE_GV014_0004 | Kiểm tra 15 phút — Unit 11 | 11 | 15 | Kiểm tra | mine · duyet | 8 |  |
| DE_GV014_0002 | Bài về nhà Unit 12 | 12 | 10 | Luyện tập | mine | 10 |  |
| DE_GV014_0002_KT | Mini test — Bài về nhà Unit 12 | 12 | 10 | Kiểm tra | mine | 6 | mini test của 8A3 |
| DE_GV014_0003 | Kiểm tra 15 phút — Unit 12 | 12 | 15 | Kiểm tra | mine | 8 |  |
| DE_GV014_0005 | Ôn tập câu tường thuật | 12 | 15 | Luyện tập | nhap | 5 |  |
| DE_GV014_0006 | Bài nhà Unit 11 — đợt 2 | 11 | 10 | Luyện tập | nhap | 3 |  |
| DE_GV014_9001 | Bài về nhà Unit 5 — lớp 9 | 5 | 10 | Luyện tập | mine | 6 |  |
| DE_TO_ANH_0007 | Kiểm tra 15 phút — Unit 11 | 11 | 15 | Kiểm tra | school · duyet | 6 |  |
| DE_TO_ANH_0009 | Ôn tập Unit 12 — câu tường thuật | 12 | 10 | Luyện tập | school · duyet | 5 |  |
| DE_TO_ANH_0012 | Kiểm tra giữa kì 1 — khối 8 (đề chung) | 4 | 45 | Kiểm tra | school · duyet | 18 |  |
| DE_TO_ANH_0015 | Unit 5 — Our experiences (luyện tập) | 5 | 15 | Luyện tập | school · duyet | 6 |  |

### 3.3 Lượt giao và kết quả
| Lớp | Đề | Hình thức | Giao | Hạn | Trạng thái | Đã nộp | Điểm TB |
|---|---|---|---|---|---|---|---|
| 8A1 | Bài về nhà Unit 11 | Online | 11-06 | 11-09 21:00 | đã chấm | 37/38 | 7 |
| 8A1 | Kiểm tra 15 phút — Unit 11 | Giấy | 11-10 | 11-10 09:00 | đã chấm | 36/38 | 7,3 |
| 8A1 | Bài về nhà Unit 12 | Online | 11-13 | 11-18 21:00 | đang mở | 31/38 | 7,2 |
| 8A2 | Bài về nhà Unit 11 | Online | 11-06 | 11-09 21:00 | đã chấm | 35/36 | 7,8 |
| 8A2 | Bài về nhà Unit 12 | Online | 11-14 | 11-20 21:00 | đang mở | 11/36 | 7,1 |
| 8A3 | Bài về nhà Unit 11 | Online | 11-05 | 11-08 21:00 | đã chấm | 20/20 | 8 |
| 8A3 | Kiểm tra 15 phút — Unit 11 | Giấy | 11-09 | 11-09 08:00 | đã chấm | 20/20 | 7,9 |
| 8A3 | Bài về nhà Unit 12 | Online | 11-13 | 11-17 21:00 | đã chấm | 18/20 | 7 |
| 8A3 | Mini test — Bài về nhà Unit 12 | Online | 11-17 | 11-17 08:10 | đã chấm | 19/20 | 6,2 |
| 8A3 | Kiểm tra 15 phút — Unit 12 | Giấy | 11-18 | 11-18 08:15 | chờ nhập phiếu | 0/20 | — |
| 9A1 | Bài về nhà Unit 5 — lớp 9 | Online | 11-12 | 11-16 21:00 | đã chấm | 39/40 | 7,7 |
| 9A2 | Bài về nhà Unit 5 — lớp 9 | Online | 11-12 | 11-19 21:00 | đang mở | 34/39 | 7,8 |

### 3.4 Việc chờ
| Lớp | Loại | Nội dung |
|---|---|---|
| 8A1 | due | Hạn nộp "Bài về nhà Unit 12" hôm nay 21:00 |
| 8A3 | verify | 3 em cần cô xác nhận |
| 8A3 | scan | Phiếu giấy "Kiểm tra 15 phút — Unit 12" chưa nhập |
| 8A3 | report | Báo cáo phụ huynh "Bài về nhà Unit 12" chưa gửi |
| 8A4 | first | Lớp chưa có bài nào. Bài đầu tiên nên là một đề chung. |
| 9A1 | report | Báo cáo phụ huynh "Bài về nhà Unit 5 — lớp 9" chưa gửi |

### 3.5 Trang Hôm nay (bảng lớp) — đối chiếu với trang Lớp
Cột "Kết quả bài gần nhất" dùng cùng quy tắc với tab Bài gần nhất của trang Lớp: bài mới nhất đã có học sinh nộp (kể cả bài đang mở, ghi "đang mở, 31/38 em"); mũi tên so với bài đã chấm trước đó.

| Lớp | Bài đang mở | Kết quả bài gần nhất | Việc chờ |
|---|---|---|---|
| 8A1 | Bài về nhà Unit 12 31/38 · hạn hôm nay 21:00 | 7,2 -0,1 Bài về nhà Unit 12 · tạm tính | Không có việc chờ |
| 8A2 | Bài về nhà Unit 12 11/36 · hạn còn 2 ngày | 7,1 -0,7 Bài về nhà Unit 12 · tạm tính | Không có việc chờ |
| 8A3 | Không có bài đang mở | 6,2 -0,8 Mini test — Bài về nhà Unit 12 | 3 em cần cô xác nhận Phiếu giấy chưa nhập Báo cáo phụ huynh chưa gửi |
| 8A4 | Không có bài đang mở | Chưa có | Lớp chưa có bài nào |
| 9A1 | Không có bài đang mở | 7,7 Bài về nhà Unit 5 — lớp 9 | Báo cáo phụ huynh chưa gửi |
| 9A2 | Bài về nhà Unit 5 — lớp 9 34/39 · hạn ngày mai 21:00 | 7,8 Bài về nhà Unit 5 — lớp 9 · tạm tính | Không có việc chờ |

## 4. Chữ chính trên các màn hình
- **Hôm nay**: ô TOMO (nhập lệnh hoặc thả file đề) · bảng lớp (Lớp | Bài đang mở | Kết quả bài gần nhất | Việc chờ); bộ lọc loại việc (kèm số đếm) nằm ngay ở tiêu đề cột Việc chờ, không còn hàng ô đếm riêng; gợi ý dưới ô TOMO chỉ là việc mới, không lặp việc chờ.
- **Lớp → Bài đã giao**: 3 tab nhỏ Bài gần nhất · Kết quả tổng thể · Lịch sử giao bài. Bài gần nhất: lỗi sai nhiều nhất ở đầu; % cả lớp làm đúng theo mức vận dụng (trung bình các câu cùng mức) nằm ở thanh chú giải dưới bảng, không lặp ở trên; bảng học sinh × câu (✓ đúng, chữ đỏ là phương án chọn sai, rê chuột xem label), công tắc "Câu vào mini test", nút Báo phụ huynh / Chi tiết / Tạo mini test từ kết quả này.
- **Bảng học sinh (mọi màn kết quả theo em: Bài gần nhất, Kết quả chi tiết)**: sắp xếp ngay tại màn (Số thứ tự · Điểm cao → thấp · Điểm thấp → cao · Cần chú ý trước · Tên A → Z); ô chọn học sinh, chọn nhiều em → thanh hành động: Mở bài làm (1 em) · Báo phụ huynh · Đánh dấu cần xác nhận · Bỏ chọn.
- **Tóm tắt sau mini test** (Bài gần nhất là mini test): thay cho tóm tắt điểm BTVN bất thường, hiện số em có BTVN cao hơn hẳn mini test, chia nhóm Cần cô xác nhận / Nên kiểm tra thêm (mỗi em ghi BTVN · mini, bấm mở bài làm), và em làm mini test tốt hơn dự kiến.
- **Nhãn "Đối chiếu BTVN"** (kết quả mini test, hiện sẵn ở từng em): Khớp BTVN (xanh) · Nên kiểm tra thêm (viền cam) · Cần cô xác nhận (cam đậm: BTVN có thể chưa phải em tự làm, hỏi lại em trước khi kết luận) · Cao hơn dự kiến (em có thể đã tiến bộ). Với bài BTVN chưa có mini test, cột "Cảnh báo" dùng nhãn z: Điểm cao bất thường · Đúng nhiều câu khó · Thấp hơn sức.
- **Kết quả một lượt giao → Từng câu**: mỗi câu một dòng (nội dung, đáp án, % đúng); bấm mở ra phương án + tên từng em + lỗi sai + giải thích.
- **Tạo mini test** (Kiểm tra bài về nhà): bảng từng em gồm Điểm BTVN, dãy câu lấy từ BTVN (C1, C5… tô theo 4 nhóm), Câu mới; nút Xem toàn màn hình.
- **Chữa bài** (mọi bài có bài nộp, kể cả BTVN đang mở: nút ghi số em đã nộp, ví dụ "Chữa bài (31/38 em)"): Lỗi sai thường gặp (top 3 theo lượt sai: số em, ở câu nào, ví dụ) + 3 câu nhiều em sai nhất; nút Tạo đề ôn.
- **Nhập phiếu giấy**: bấm "Bắt đầu quét" một lần, quét liền cả tập phiếu; tờ mờ (cần chụp lại) và phiếu tô hai ô được gom lại hiện ở cuối để cô xử lý một lượt, rồi Hoàn tất. Không phải bấm quét nhiều lần.
- **Bảng điểm**: ô điểm sửa được (log), cột Mức, nút i → Cần cải thiện.
- **Kho đề**: Sổ giao đề · Thư viện của tôi · Nháp · Thư viện trường · Ngân hàng câu. **Thư viện của tôi**: mọi đề của cô (tự soạn, tải lên, TOMO gợi ý, mini test, lấy từ thư viện trường, nháp), không phụ thuộc lớp; tìm theo tên/mã/unit; lọc Loại, Khối, Trạng thái (Chưa giao · Đã giao · Nháp · Đã ẩn); sắp xếp Mới nhất · Tên · Unit; cột Đã giao cho; nút Giao / Soạn tiếp, Xem đề.

- **Mô phỏng chỉ số** (menu trái, chỉ dùng cho prototype): tự tạo nhóm em (tên, θ thật ban đầu, thay đổi mỗi vòng, cách làm BTVN: Tự làm · Chép BTVN mọi vòng · Thỉnh thoảng chép 50% · Tự làm rồi chép từ vòng k · Làm qua loa, đoán nhanh), chọn số vòng, số câu BTVN, số câu mini test, hạt ngẫu nhiên. Xem theo vòng: bảng em × vòng (điểm BTVN · mini, nhãn Đối chiếu, cờ z, ô viền cam = vòng chép thật), 5 chỉ số tổng (lượt chép thật, cảnh báo đúng, bỏ sót, cảnh báo nhầm, sai số θ), chi tiết từng em gồm 3 biểu đồ (θ thật / θ ước tính ± độ chắc chắn / độ khó BTVN; điểm BTVN / mini / dự kiến; z với ngưỡng 2, 1,5, −2) và bảng số. Quy tắc trong mô phỏng: Cần cô xác nhận khi BTVN − mini ≥ 3,5 (hoặc ≥ 2,5 và BTVN vượt dự kiến ≥ 2,5); Nên kiểm tra thêm khi ≥ 2,5; BTVN tin 100% / 50% / 30% / 0% khi cập nhật năng lực. Quy tắc bổ sung (bật/tắt được, gộp được, chỉ nâng mức): (1) BTVN vượt dự kiến ≥ 2 và cao hơn mini ≥ 1,5 → Nên kiểm tra thêm; (2) BTVN cao hơn mini ≥ 1,5 ở 2 trong 3 vòng gần nhất → Nên kiểm tra thêm; (3) có cờ z cao thì không để Khớp. Nút so sánh các tổ hợp trên 100 lần chạy: với nhóm mẫu, gộp cả 3 cảnh báo 90% lượt chép (so với 74%), cảnh báo nhầm 17,4% (so với 10,1%), "Cần cô xác nhận" vẫn đúng 88%. **Cách gắn cảnh báo mặc định của mô phỏng: cộng dồn bằng chứng** e = (z + d/SE)/√2 (SE: dao động tự nhiên của d với số câu hiện có), B = max(0, B trước + e − 0,75); B ≥ 2 → Nên kiểm tra thêm; B ≥ 4,5 hoặc e ≥ 3,5 → Cần cô xác nhận; tín hiệu yếu → "Theo dõi" (không báo cô). Với nhóm mẫu trên 100 lần chạy: em tự làm từng bị cảnh báo giảm từ 50% xuống 14%, lượt cảnh báo nhầm 17,4% → 6,4%, em có chép vẫn bị phát hiện 96%, "Cần cô xác nhận" đúng 95%.

## 5. Mã kỹ năng
| Mã | Tên |
|---|---|
| NP.TH.01 | Thì hiện tại đơn |
| NP.TH.02 | Thì quá khứ tiếp diễn |
| NP.TH.03 | Thì tương lai đơn |
| NP.TH.04 | Thì hiện tại hoàn thành |
| NP.SS.01 | So sánh hơn |
| NP.CC.01 | Liên từ, câu ghép |
| NP.CC.02 | Câu hỏi Yes/No và Wh- |
| NP.CC.03 | Mệnh đề thời gian |
| NP.CC.04 | Câu điều kiện loại 1 |
| NP.CC.05 | Câu tường thuật: câu trần thuật |
| NP.CC.06 | Câu tường thuật: câu hỏi |
| NP.CC.07 | Câu cảm thán |
| NP.TL.01 | Động từ sở thích + V-ing / to V |
| NP.TL.03 | Mạo từ |
| NP.TL.05 | Giới từ; đại từ sở hữu |
| TV.CD.01 | Từ vựng giải trí, lối sống |
| TV.CD.02 | Từ vựng thôn quê, dân tộc, phong tục |
| TV.CD.05 | Từ vựng khoa học, hành tinh |
| TV.TK.01 | Kết hợp từ |
| TV.TK.02 | Dạng từ |
| TV.DN.01 | Từ đồng nghĩa, trái nghĩa |
| NA.AM.02 | Phát âm nguyên âm, phụ âm |
| NA.TA.01 | Trọng âm từ |
| GT.HT.01 | Lời mời, gợi ý, khuyên |
| GT.HT.02 | Hội thoại tình huống |
| DH.DD.01 | Điền từ vào đoạn văn |
| DH.DH.02 | Đọc hiểu: tìm chi tiết |
| DH.DH.03 | Đọc hiểu: suy luận |
| VL.01 | Viết lại câu |

## 6. Lịch sử bản (rút gọn)
- v59 Mini test, kết quả bài gần nhất, bảng điểm có log · v60 Hôm nay gọn · v61 Agent đưa đáp án · v62 Mini test chọn sẵn lớp, bỏ "(app Android)" · v63–v64 Cảnh báo điểm cao bất thường + label · v65 Từng câu có nội dung · v66 Giải thích câu vào mini test · v67 Sửa nút ☰ · v68 Xem toàn màn hình · v69 Đồng bộ nội dung, "Điểm BTVN", file content.md · v70 Nút "Xem toàn màn hình" nổi ở góc trái dưới khung các câu · v71 Lịch sử giao bài: BTVN có nút "Tạo mini test" / "Xem mini test" ngay trên dòng · v72 Kết quả mini test hiện sẵn nhãn Đối chiếu BTVN, sắp xếp và chọn học sinh ngay trên màn, áp dụng cho các bảng kết quả theo em.
