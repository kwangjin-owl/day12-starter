-- 무인 커피 자판기 매출 시스템 테이블 정의
-- Supabase SQL Editor에 붙여넣고 Run 버튼 클릭

-- [1] 표 만들기 - 매출 기록 테이블
create table if not exists sales (
  id bigint generated always as identity primary key,
  buyer_name text not null,
  product text not null,
  quantity int not null default 1,
  price_per_unit int not null,
  total_price int not null,
  purchased_at timestamptz not null default now()
);
alter table sales enable row level security;

-- [2] 넣기 정책: 익명 키로는 "넣기"만 허용합니다.
drop policy if exists "anon insert only" on sales;
create policy "anon insert only" on sales
  for insert to anon with check (true);

-- [3] 읽기 정책: 목록/상세 화면이 읽을 수 있게 엽니다.
--     열쇠(키)는 서버에만 있고, 무엇을 내보낼지는 api/list.js가 고릅니다.
drop policy if exists "anon select" on sales;
create policy "anon select" on sales
  for select to anon using (true);

-- 참고: 이전 데이터(applications 테이블)는 유지됩니다.
