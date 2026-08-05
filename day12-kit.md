# Day12 실습 키트 - 복사해서 쓰는 문장 모음

오늘 수업에서 입력할 문장들을 모아 둔 문서입니다. 슬라이드와 번호가 같습니다. 각 칸의 내용을 그대로 복사해서 쓰시면 됩니다.

---

## 0. 아침 확인 (09:00)

1. 어제 #실습공유에 올린 **내 배포 주소**를 엽니다 (어제 내가 올린 메시지에서 찾습니다)
2. 폼에 신청 1건을 제출합니다 - 이름 칸에 `생존확인`
3. Supabase Table Editor에서 방금 행이 생겼는지 봅니다
4. #실습공유에 "어제 것 열림" 한 줄을 올립니다

**막히면 - 네 유형 중 번호로 보고해 주세요**

| 번호 | 증상 | 복구 (Supabase SQL Editor에서) |
|---|---|---|
| 1 | 제출하면 실패 + "칸을 찾을 수 없다"나 "빈 값" 계열 메시지 | 코드와 표의 약속이 어긋난 것입니다. 칸이 없다는 메시지면 아래 [칸 추가], 빈 값 메시지면 아래 [빈 값 허용]을 실행합니다 |
| 2 | "환경변수가 설정되지 않았습니다" | Vercel Settings > Environment Variables 재입력 후 재배포합니다 (어제 자료 S7-S8) |
| 3 | 화면은 새것인데 제출해도 표에 안 쌓임 | 화면과 서버가 연결 안 된 것입니다 - 오늘 오후 실습에서 잇습니다. 지금은 그대로 두셔도 됩니다 |
| 4 | 주소가 아예 404 | 터미널에서 `npx vercel --prod` 재배포 후 새 주소를 다시 공유합니다 |

[칸 추가] - `새칸이름`과 자료형은 에러 메시지에 나온 그대로 씁니다:

```sql
alter table applications add column 새칸이름 text;
```

[빈 값 허용]:

```sql
alter table applications alter column 새칸이름 drop not null;
```

---

## 1. 오전 - SQL 연습 문장 (SQL Editor에 붙여넣고 Run)

전체 보기 (최신 먼저):

```sql
select * from applications order by created_at desc;
```

두 컬럼만 보기:

```sql
select name, subject from applications order by created_at desc;
```

조건 걸기 - '수학' 자리는 내 표에 실제 있는 값으로 바꿉니다:

```sql
select * from applications where subject = '수학' order by created_at desc;
```

세기:

```sql
select count(*) from applications;
```

조건에 맞는 것만 세기:

```sql
select count(*) from applications where subject = '수학';
```

오전 마감 보고 형식 (#실습공유에): `총 N건, 최신 1건은 OO`

---

## 2. 오후 첫 지시 - 규칙 파일 넓히기 (Claude Code에 입력)

> day12-starter로 시작한 분은 이미 반영돼 있습니다 - "파일 규칙 읽어줘"로 확인만 하고 3번으로 갑니다.

```text
CLAUDE.md의 파일 구조 규칙에 오늘 만들 파일 list.html, detail.html, api/list.js 세 개를 추가해줘
```

에이전트가 "규칙과 충돌한다"며 확인을 구하면 정상 작동입니다 - "오늘 실습으로 승인한다"라고 답하면 진행됩니다.

---

## 3. 읽기 문 열기 (Claude Code에 입력 -> 받은 SQL은 내가 Supabase에서 직접 Run)

> day12-starter의 setup.sql을 실행한 분은 이미 열려 있습니다 - 확인만 하고 4번으로 갑니다.

```text
applications를 서비스가 읽을 수 있게 하는 정책 SQL을 만들어줘. 실행은 내가 Supabase에서 직접 할게
```

"policy already exists" 에러가 나면 이미 실행된 것이니 그대로 다음으로 갑니다.

---

## 4. 지시 A - 목록 화면 + 같은 페이지 안 상세 모듈 (Claude Code에 입력)

```text
접수 목록 화면을 만들어줘.
1) api/list.js를 새로 만들어 applications를 읽고 id, name, subject, created_at만 보내줘. name은 첫 글자만 남기고 **로 가리고, contact는 절대 보내지 마.
2) list.html을 새로 만들어 목록을 표로 보여주고, 행을 클릭하면 같은 화면 안에 상세(과목·지원 동기·시각)가 뜨게 해줘. 페이지 이동은 하지 마.
3) 끝나면 만든 파일 목록과 확인 방법을 알려줘
```

확인 세 가지: (1) 행 클릭 시 상세 모듈이 뜹니다 (2) 이름이 가려져 있고 연락처는 어디에도 없습니다 (3) 상세를 띄워도 주소창이 안 바뀝니다.

---

## 5. 지시 B - 상세를 새 페이지로 분리 (Claude Code에 입력)

```text
이번엔 상세를 별도 페이지로 분리해줘.
1) detail.html을 새로 만들어서 주소가 detail.html?id=3 형식이면 그 접수의 상세를 보여주게 해줘. 이름 가림과 연락처 금지는 아까와 똑같이.
2) list.html의 각 행에 그 페이지로 가는 링크를 달아줘. 상세 페이지에는 목록으로 돌아가는 링크도 넣어줘.
3) 끝나면 예시 링크 주소 하나를 알려줘
```

---

## 6. 세 동작 체험 - 결과를 그대로 적어 둡니다

| 동작 | 방식 A에서 | 방식 B에서 |
|---|---|---|
| 새로고침 (Cmd/Ctrl+R) | | |
| 링크 복사해 새 탭에 붙여넣기 | | |
| 뒤로가기 | | |

---

## 7. 배포와 마지막 확인 (Claude Code에 입력)

```text
index.html 상단에 "접수 목록 보기" 링크를 list.html로 달아줘. 그리고 /deploy
```

배포가 끝나면: (1) 배포 주소의 list.html을 엽니다 (2) 방식 B의 상세 링크를 복사해 옆자리나 폰에 보내 열리는지 확인합니다 (3) 이름 `오후검증`으로 신청 1건을 제출합니다 (4) SQL Editor에서 `select count(*) from applications;` - 아침보다 늘었는지 봅니다.

---

## 8. 제출 - 두 방식 비교 기록 (과제 플랫폼에)

아래 7줄을 채워서 올립니다. 형식은 자유이고, 7줄이 다 있으면 됩니다.

```text
[두 방식 비교 기록]
1. 주소(URL): A는 ___ / B는 ___
2. 공유·북마크: A는 ___ / B는 ___
3. 어울리는 곳: A는 ___ / B는 ___
4. 내가 본 것 - 새로고침: A ___ / B ___
5. 내가 본 것 - 새 탭: A ___ / B ___
6. 내가 본 것 - 뒤로가기: A ___ / B ___
7. 내일 규칙으로 만들 1줄: ___
```

마감 보고 (#실습공유에 한 줄): `A/B/C + 막힌 단계 번호(B·C만) + 비교 기록 제출 여부`
