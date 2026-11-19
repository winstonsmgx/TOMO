# TOMO · prototype giáo viên (bản deploy)

Prototype giao diện TOMO (Examen) chạy trên Vercel. Dữ liệu là dữ liệu mẫu, **dùng chung cho mọi người có link** (lưu trong Postgres). Câu mini test và các việc TOMO soạn đề được tạo bằng **Claude API** gọi từ máy chủ.

## Cấu trúc

```
public/            Giao diện (HTML, CSS, JS thuần) — giống bản artifact, thêm sync.js
  sync.js          Đồng bộ dữ liệu với máy chủ, đăng nhập, gọi Claude qua /api, quản lí phiên dữ liệu
api/               Hàm serverless của Vercel (mỗi file một đường dẫn /api/<tên>)
  me.js            Trạng thái: cần mật khẩu không, có DB và Claude API chưa
  login.js         Đăng nhập bằng mật khẩu chung (cookie 30 ngày)
  state.js         Đọc / ghi dữ liệu dùng chung (theo từng nhóm: exams, assigns, reports…)
  snapshots.js     Phiên dữ liệu: lưu, mở lại, xoá, tải xuống
  admin.js         Quản lí dữ liệu: các nhóm dữ liệu, lượt gọi Claude, nhật ký thay đổi
  ai.js            Cổng gọi Claude chung (soạn đề, đọc file đề, giải lại đáp án, trò chuyện)
  minitest.js      Sinh câu mini test cùng kỹ năng, cùng độ khó
lib/server/        Code dùng chung cho các API (DB, đăng nhập, Claude)
db/schema.sql      Các bảng Postgres (API tự tạo ở lần gọi đầu)
dev-server.mjs     Chạy thử trên máy không cần Vercel CLI
```

## Deploy lên Vercel

### 1. Đẩy code lên GitHub
```bash
cd examen-deploy
git init
git add .
git commit -m "TOMO prototype: bản deploy Vercel"
# Tạo repo trống trên github.com (riêng tư), rồi:
git remote add origin https://github.com/<tên-bạn>/examen-tomo-prototype.git
git branch -M main
git push -u origin main
```
`.env.local` đã nằm trong `.gitignore`, không bị đẩy lên.

### 2. Tạo project trên Vercel
1. vercel.com → **Add New → Project** → chọn repo vừa đẩy.
2. Framework Preset: **Other**. Để nguyên Build Command, Root Directory. Output Directory đã được đặt là `public` trong `vercel.json`.
3. Bấm **Deploy** (lần đầu chưa có DB thì trang vẫn chạy, nhưng dữ liệu chỉ ở từng máy).

### 3. Thêm database Neon
1. Trong project: **Storage → Create Database → Neon (Serverless Postgres)** → gói Free → Connect với project.
2. Vercel tự thêm biến `DATABASE_URL` (và vài biến khác) vào project.
3. Không cần tạo bảng bằng tay: lần gọi API đầu tiên tự tạo. Muốn tạo trước: `npm run db:init` với `DATABASE_URL` trong `.env.local`.

### 4. Thêm biến môi trường
Project → **Settings → Environment Variables** (chọn cả Production và Preview):

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `DATABASE_URL` | Có | Neon tự thêm ở bước 3 |
| `ANTHROPIC_API_KEY` | Nên có | Lấy ở console.anthropic.com. Không có thì TOMO dùng câu mẫu trong ngân hàng |
| `APP_PASSWORD` | Nên có | Mật khẩu chung cho cả nhóm. Bỏ trống = ai có link cũng vào được và gọi được AI |
| `AUTH_SECRET` | Nên có | Chuỗi ngẫu nhiên dài để ký cookie. Đổi chuỗi này = đăng xuất mọi người |
| `ANTHROPIC_MODEL` | Không | Mặc định `claude-sonnet-5-5` |
| `ANTHROPIC_MODEL_FAST` | Không | Mặc định `claude-haiku-5-5` (dùng cho bước giải lại đáp án) |
| `AI_HOURLY_LIMIT` | Không | Giới hạn số lượt gọi AI mỗi giờ cho cả nhóm, mặc định 300 |

Đổi biến xong: **Deployments → … → Redeploy** để biến có hiệu lực.

### 5. Mở trang
Vào link Vercel, nhập mật khẩu và tên. Người đầu tiên mở trang sẽ tự đưa dữ liệu mẫu lên DB. Tên hiện trong nhật ký để cả nhóm biết ai vừa sửa gì.

## Đồng bộ hoạt động thế nào
- Dữ liệu của prototype chia thành các nhóm (`exams`, `bank`, `assigns`, `verify`, `reports`, `scan`, `stu`, `settings`…), mỗi nhóm là một dòng JSON trong bảng `kv`.
- Mỗi lần ai đó thao tác, nhóm dữ liệu vừa đổi được gửi lên sau khoảng 0,4 giây. Các máy khác hỏi lại mỗi 4 giây và khi quay lại tab.
- Nếu đang mở hộp thoại hoặc đang gõ, cập nhật của người khác được giữ lại và hiện khi đóng hộp thoại.
- **Ai ghi sau thắng, theo từng nhóm dữ liệu**: hai người cùng giao bài trong cùng vài giây có thể mất một lượt giao. Đủ cho thử nghiệm nhóm nhỏ; sản phẩm thật cần bảng riêng cho từng lượt giao.
- Trạng thái đồng bộ hiện ở cuối thanh bên trái (Đã lưu / Đã cập nhật · giờ · người sửa).

## Quản lí dữ liệu
Trong prototype: **Cài đặt prototype**
- **Phiên dữ liệu**: lưu phiên, mở lại phiên (tự lưu bản hiện tại trước), đặt lại dữ liệu mẫu, nhập/tải file JSON.
- **Quản lí dữ liệu**: các nhóm dữ liệu (lần sửa, dung lượng, ai sửa cuối), lượt gọi Claude (24 giờ, token, lỗi), nhật ký thay đổi.

Trực tiếp bằng SQL: Vercel → Storage → Neon → **Open in Neon** → SQL Editor. Ví dụ:
```sql
select key, version, updated_by, updated_at from kv order by updated_at desc;
select jsonb_array_length(value) from kv where key = 'assigns';
select route, count(*), sum(input_tokens), sum(output_tokens) from ai_calls group by route;
```

## Chạy thử trên máy
```bash
npm install
cp .env.example .env.local      # điền DATABASE_URL (Neon) hoặc Postgres trên máy + LOCAL_PG=1
# Không muốn tốn tiền AI khi thử: thêm AI_MOCK=1
npm run dev                     # http://localhost:3000
```

## Giới hạn hiện tại
- Dữ liệu mẫu, không dùng dữ liệu thật của học sinh.
- Không có tài khoản riêng: một mật khẩu chung cho cả nhóm.
- Chống sao chép, rời bài và chụp màn hình vẫn là mô phỏng trên trình duyệt; quét phiếu giấy và gửi Zalo vẫn là mô phỏng.
- Hàm gọi AI tối đa 60 giây mỗi lượt (`vercel.json`), đề rất dài có thể cần tách nhỏ.
