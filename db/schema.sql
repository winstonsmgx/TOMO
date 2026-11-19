-- Bảng dữ liệu của prototype TOMO. Chạy tự động ở lần gọi API đầu tiên (lib/server/db.js),
-- hoặc chạy tay trong Neon SQL Editor.
create sequence if not exists kv_seq;
-- Mỗi khoá là một nhóm dữ liệu của prototype: exams, bank, assigns, verify, reports, scan, stu, settings…
-- value = null nghĩa là khoá đã bị xoá (để các máy khác biết mà xoá theo).
create table if not exists kv (
  key        text primary key,
  value      jsonb,
  version    integer     not null default 1,
  seq        bigint      not null default nextval('kv_seq'),
  updated_at timestamptz not null default now(),
  updated_by text
);
create index if not exists kv_seq_idx on kv (seq);
-- Phiên dữ liệu đã lưu (Cài đặt prototype → Phiên dữ liệu)
create table if not exists snapshots (
  id         text primary key,
  name       text        not null,
  created_at timestamptz not null default now(),
  created_by text,
  data       jsonb       not null
);
-- Nhật ký thay đổi dữ liệu
create table if not exists audit (
  id     bigserial primary key,
  at     timestamptz not null default now(),
  who    text,
  action text not null,
  keys   text[],
  detail jsonb
);
-- Nhật ký gọi Claude API (đếm lượt, token, lỗi)
create table if not exists ai_calls (
  id            bigserial primary key,
  at            timestamptz not null default now(),
  who           text,
  route         text,
  model         text,
  input_tokens  integer,
  output_tokens integer,
  ms            integer,
  ok            boolean,
  error         text
);
create index if not exists ai_calls_at_idx on ai_calls (at);
