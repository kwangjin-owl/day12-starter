-- Day12 통합판 - Supabase SQL Editor에 통째로 붙여넣고 Run 한 번.
-- 어제(Day11) 이미 표를 만든 분도 그대로 실행해도 안전합니다 (있으면 건너뜁니다).

-- [1] 표 만들기 (어제와 동일 - 이미 있으면 건너뜀)
create table if not exists applications (
  id bigint generated always as identity primary key,
  name text not null,
  contact text not null,
  subject text not null,
  motivation text,
  created_at timestamptz not null default now()
);
alter table applications enable row level security;

-- [2] 넣기 정책 (어제와 동일): 익명 키로는 "넣기"만 허용합니다.
drop policy if exists "anon insert only" on applications;
create policy "anon insert only" on applications
  for insert to anon with check (true);

-- [3] 읽기 정책 (Day12 추가): 오늘 만들 목록/상세 화면이 읽을 수 있게 엽니다.
--     열쇠(키)는 여전히 서버에만 있고, 무엇을 내보낼지는 api/list.js가 고릅니다.
drop policy if exists "anon select" on applications;
create policy "anon select" on applications
  for select to anon using (true);

-- 참고: 나중에 새 질문(칸)을 추가할 때는 not null을 붙이지 않습니다.
--   좋은 예: alter table applications add column mood text;
--   피할 예: alter table applications add column mood text not null;  <- 빈 값이 오면 제출이 실패(500)합니다

-- [4] Day13 커피 자판기: 판매 데이터 표
create table if not exists sales (
  id bigint generated always as identity primary key,
  buyer_name text not null,
  product text not null,
  quantity integer not null,
  price_per_unit integer not null,
  total_price integer not null,
  purchased_at timestamptz not null default now()
);
alter table sales enable row level security;

-- 판매 표 읽기 정책: 익명 사용자도 읽을 수 있게 (관리자 화면용)
drop policy if exists "anon select sales" on sales;
create policy "anon select sales" on sales
  for select to anon using (true);

-- 판매 표 넣기 정책: 익명 사용자도 주문 저장 가능
drop policy if exists "anon insert sales" on sales;
create policy "anon insert sales" on sales
  for insert to anon with check (true);
