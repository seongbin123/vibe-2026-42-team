-- 수원대 중고책 거래 앱 DB 스키마

create table books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text,
  subject text,
  department text,
  price integer not null,
  condition text check (condition in ('상', '중', '하')) not null,
  description text,
  contact text not null,
  image_url text,
  is_sold boolean default false,
  created_at timestamptz default now()
);

-- 누구나 책 목록 조회 가능
alter table books enable row level security;

create policy "누구나 조회 가능" on books
  for select using (true);

create policy "누구나 등록 가능" on books
  for insert with check (true);

create policy "누구나 판매완료 처리 가능" on books
  for update using (true);
