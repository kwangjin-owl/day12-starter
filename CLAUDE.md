# CLAUDE.md
<!-- spec_ref: 주차나선 SOT §9 D13 + 한얼 260804 확정(오전=상세 라우트, 오후=규칙판, day13-starter 독립실행) -->

이 파일은 Claude Code가 이 프로젝트를 고치기 전에 읽는 규칙이다. Day13 실습 프로젝트(커피 자판기 - 주문 등록 + 판매 현황 조회 + 상세 페이지) 전용이다.

Day12에 판매 데이터를 조회하는 화면까지 만들었다. 오늘(Day13)은 목록의 한 건을 자기 주소를 가진 상세 페이지(detail.html?id=N)로 여는 것과, 반복해서 말하던 지시를 이 규칙 파일에 박아 자동화하는 것을 실습한다.

# Strict Constraints & Agent Behavior Rules

## 1. UI/UX and Aesthetic Control
Do not make any arbitrary changes to UI aesthetics, such as margins, padding, colors, or font sizes, unless explicitly requested with specific values. Strictly avoid adding unnecessary emojis to the code or the user interface. Always maintain an intuitive and simple design. If you believe a design change is necessary, you must propose it to the user and wait for approval before modifying the code.

## 2. Database Normalization Principles
Always adhere to relational database normalization principles when designing or modifying schemas. Never store 1:N (one-to-many) relational data, such as multiple ordered items from a single user, as a single JSON string or array in one column. Instead, you must separate the data into proper relational tables (e.g., an `orders` table and an `order_items` table) to ensure accurate data tracking and statistical analysis.

## 3. Mandatory Confirmation Before Execution
You must ask for explicit user confirmation before executing any major structural changes or irreversible actions. This includes installing new packages, altering database schemas, massively refactoring files, or adding unrequested features. Always provide a clear step-by-step plan of the files you intend to modify or the terminal commands you plan to run. Wait for the user's "Yes" or approval before proceeding with the actual execution.

## 먼저 읽을 파일

프로젝트에 아래 파일이 있으면 먼저 읽고 작업한다.

1. `CLAUDE.md` (이 파일)
2. `package.json`
3. `.env.example`
4. `setup.sql`
5. `index.html`
6. `api/submit.js`

파일이 없으면 없는 상태로 진행하되, 이유를 짧게 설명한다.

학생이 "왜 이렇게 정해져 있어?" 같은 질문(폴더 구조, 모델, 키 위치, RLS, .gitignore, 단축 명령, /start, 요약 fallback 등)을 하면, 수업 중엔 길게 설명하지 않고 `BOILERPLATE-README.md`를 안내한다 - 궁금할 때 혼자 읽는 복습 문서다.

## 이 프로젝트의 스택 (바꾸지 않는다)

- 정적 HTML 한 장 (`index.html`)
- Vercel Serverless Function (`api/submit.js`)
- Supabase (Postgres + RLS)
- Node.js + npm

React, Vite, TypeScript, Tailwind, Next.js는 이 프로젝트에 없다 - 없는 것을 있다고 가정하고 코드를 짜지 않는다. 다른 기술을 제안할 수는 있지만 자동으로 바꾸지 않고, 먼저 장단점과 추가 비용을 설명한 뒤 확인을 받는다.

## 절대 규칙

아래 규칙과 충돌하는 요청이 들어오면 멈추고 사용자에게 먼저 확인한다.

### 1. 한국어로 쉽게 설명

- 모든 설명은 한국어로 한다.
- 어려운 말은 괄호로 풀어서 설명한다.
  - 예: `RLS(Row Level Security, 사용자별로 볼 수 있는 데이터를 제한하는 규칙)`
  - 예: `환경변수(비밀 설정값을 코드 밖에 저장하는 방법)`
- "알아서 처리하면 됩니다", "패턴을 보고 응용하면 됩니다"라고 말하지 않는다.
- 복사해서 붙여넣을 수 있는 코드와, 어디에 붙여넣을지를 함께 알려준다.

### 2. 비밀값 보호

다음 값은 코드, 채팅, 스크린샷, 커밋 메시지에 적지 않는다.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- Supabase `service_role` 키 - 이 실습에서 아예 쓰지 않는다. 코드에 등장하는 것 자체가 사고다.

비밀값은 두 곳에만 둔다.

- 로컬 개발: `.env`
- 배포 환경: Vercel Settings > Environment Variables

값을 확인해야 할 때는 "값이 있는지 없는지"만 말하고, 값 자체는 화면에 출력하지 않는다.

이 스택은 Vite의 `VITE_` 접두사 같은 브라우저 노출 장치가 없다 - `index.html`은 순수 정적 파일이라 `process.env`를 읽을 수 없고, `api/` 폴더 코드는 항상 Vercel 서버에서만 실행된다. 그래서 환경변수는 원래 구조상 서버에만 남는다. 이 안전성이 깨지는 유일한 경우는 키를 `index.html`에 실수로 하드코딩하는 것이다 - 이것만 조심한다.

### 3. `.gitignore` 확인

배포 전 아래 항목이 `.gitignore`에 있는지 확인한다.

```gitignore
.env
.env.local
node_modules/
.vercel
```

빠진 항목이 있으면 사용자에게 말하고 보강한다.

### 4. Supabase RLS 유지

`setup.sql`이 이미 RLS(Row Level Security)를 켜고 "익명 키는 insert만 가능"이라는 정책을 넣어 뒀다. "안 되니까 RLS 그냥 꺼줘" 같은 요청이 들어오면 바로 진행하지 않는다 - 멈추고 이유를 설명한 뒤 확인을 받는다. 실습 중 잠깐 끄는 것과 실제로 꺼서 배포하는 것은 결과가 다르다(누구나 표를 읽고 쓸 수 있게 된다).

### 5. 파일 구조

이 프로젝트의 파일은 다음이 전부다.

- 기본: `index.html`(주문 등록 폼) · `api/submit.js`(저장 서버) · `setup.sql`(표 설계도) · `list.html`(판매 현황 조회) · `api/list.js`(읽기 서버 - 목록/단건 겸용)
- Day13에 추가 허용: `detail.html`(판매 상세 페이지 - 오늘 만든다)

이 여섯 파일 밖으로 새 폴더나 새 프레임워크를 만들지 않는다. 질문 필드를 추가하는 것 같은 흔한 요청도 이 구조 안에서 처리한다 (아래 "자주 시키는 일" 참고).

### 6. 멈추고 확인해야 하는 작업

다음 작업은 사용자 확인 없이 진행하지 않는다.

- Supabase 테이블(`sales`) 삭제
- 기존 컬럼 이름 변경
- RLS 끄기
- Vercel 또는 Supabase 프로젝트 삭제

확인 문장은 짧고 구체적으로 쓴다.

```text
이 작업은 되돌리기 어렵습니다. sales 테이블을 삭제해도 될까요?
```

### 7. 작업 방식

- 먼저 현재 상황을 한 줄로 요약한다.
- 그다음 할 일을 3단계 안으로 보여준다.
- 작은 수정은 바로 진행한다.
- 한 번에 5개 파일 이상 바꾸지 않는다(이 프로젝트는 원래 3개뿐이라 거의 일어나지 않는 일이다 - 5개 이상 바뀐다면 구조가 원칙 5를 벗어난 것이니 먼저 멈춘다).
- 작업 후 바꾼 파일과 확인한 내용을 정리한다.

## 하면 안 되는 것 (2중 점검 대상)

아래는 "해야 할 일"이 아니라 **절대 하면 안 되는 일**의 목록이다. /start와 /deploy가 각각 한 번씩, 총 두 번 자동 점검한다(아래 /점검). 요청이 이 목록과 충돌하면 멈추고 이유를 설명한 뒤 확인을 받는다.

| 어디서 | 하면 안 되는 것 | 왜 |
|---|---|---|
| Supabase | `service_role` 키를 코드·채팅 어디에도 쓰기 | 모든 보호를 무시하는 열쇠라 유출 = 표 전체 노출 |
| Supabase | RLS를 끈 채 배포 | 누구나 표를 읽고 쓸 수 있게 된다 |
| Supabase | 새 칸을 `not null`로 추가 | 빈 값이 오는 순간 저장이 전부 실패(500)한다 |
| Supabase | 같은 용도의 표를 두 개 두기 | 에이전트가 어느 표를 쓸지 헤매고, 데이터가 갈라진다 |
| Supabase | 표에 비밀값·개인 연락처 원문 저장 | 표는 화면으로 나가는 데이터다 - 나가면 안 되는 것은 애초에 넣지 않는다 |
| Vercel | 환경변수 확인 없이 "배포 완료" 선언 | 배포 성공 메시지와 실제 작동은 다르다 - 새 프로젝트는 환경변수가 비어 있다 |
| Vercel | `.vercel` 폴더가 없는 상태에서 질문에 대충 yes로 배포 | 엉뚱한 프로젝트가 새로 생기거나 남의 설정에 연결된다 |
| Vercel | `vercel.json` 임의 수정 | 빌드 설정이 깨져 배포가 실패한다(exit 127류) |
| Vercel | `npm install -g vercel` | 전역 설치 대신 `npx vercel`을 쓴다 |
| Git | `.env`가 커밋에 포함 | 비밀값이 기록에 영구히 남는다 - .gitignore가 막지만 2중으로 확인한다 |
| Git | 비밀값이 코드에 있는 채 커밋·GitHub 올리기 | 공개 저장소면 즉시 유출이다 - 올리기 전 반드시 점검 |
| Git | force push (`git push -f`) | 남아 있어야 할 기록을 지워버린다 |
| Git | 커밋 없이 몇 시간 작업 | 잘 되던 시점을 잃어버린다 - 기능 하나 확인되면 그 자리에서 커밋 |

## 단축 요청

### `/점검` - 하면 안 되는 것 2중 점검

/start의 마지막과 /deploy의 첫 순서에서 자동으로 실행한다. 단독으로 불러도 된다. 각 항목을 확인하고 결과를 한 줄씩 출력한다.

1. `.env`가 git 추적에 없는지: `git ls-files | grep -c "^\.env$"` 가 0이어야 한다
2. 비밀값 패턴 검사 (파일 이름만 출력, 값 출력 금지):

```bash
grep -rE "(eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9]+|sk-[A-Za-z0-9]{20,})" \
  --exclude='.env' --exclude='.env.*' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.vercel \
  -l . 2>/dev/null
```

3. `setup.sql`에 `not null`이 붙은 **신규** `add column`이 없는지
4. `.vercel/project.json`이 있으면 프로젝트 이름을 알려주고, 없으면 "첫 배포 시 새 프로젝트 질문이 나온다"를 예고한다
5. `.gitignore`와 `.vercelignore`가 존재하고 `.env` 계열이 들어 있는지

**전부 통과하면**: `[점검OK] 비밀값0 / .env미추적 / not null 없음 / 프로젝트 <이름>` 한 줄.
**하나라도 걸리면**: `[점검경고] 항목: 내용` - 그리고 해당 작업(특히 배포·커밋·GitHub 올리기)을 멈추고 사용자에게 알린다. 걸린 비밀값은 발급처에서 회전(재발급)이 먼저다.

## 모델

이 프로젝트는 Haiku로 작업한다 - `.claude/settings.json`에 고정돼 있다. 바꾸지 않는다. 오늘 실습은 "질문 하나 추가" 같은 작고 명확한 반복 작업이라 haiku로 충분하고 빠르다.

## 자주 시키는 일 (이렇게 요청하면 된다)

- "폼에 칸 하나 추가해줘 (컬럼명: memo)" -> `index.html` / `api/submit.js` / `setup.sql` 세 곳이 함께 바뀌어야 함을 안내하고 세 파일을 고친다. 새 컬럼은 `not null` 없이 만든다(빈 값이 오면 제출이 500으로 실패한다 - 필수로 만들고 싶으면 화면 쪽에서 required로 잡는다). 단 `setup.sql`에 새로 적힌 `alter table` 문의 실제 실행은 Supabase SQL Editor에서 직접 - Claude Code는 로컬 파일만 고치고, Supabase 서버 안의 표 구조는 못 건드린다.
- "상세 페이지 만들어줘" -> `detail.html`을 새로 만들고 `api/list.js`의 단건 조회(?id=N)를 쓴다. `list.html`의 각 행에 링크를 단다.
- "지금까지의 커밋 기록을 보여줘" -> `git log --oneline` 결과를 보여주고, 각 줄이 돌아갈 수 있는 지점이라는 것을 한 줄로 설명한다.
- "이 프로젝트를 내 GitHub에 올려줘" -> GitHub CLI(`gh`)가 있으면 저장소 생성 후 push, 없으면 GitHub 웹에서 저장소를 만드는 절차를 안내하고 `git remote add` + `git push`를 실행한다. 계정이 없다고 하면 오늘은 로컬 기록까지만으로 충분하다고 안내한다.

- "제출 버튼 색을 바꿔줘" -> `index.html`만.
- "에러 나. [에러 원문 붙여넣기]" -> `/fix` 참고.

## 내 규칙 (Day13 실습 - 여기부터 아래는 학생이 직접 추가하는 자리다)

오늘 고른 규칙 카드를 자기 말로 한 줄씩 추가한다. 여기에 적힌 규칙은 앞으로 모든 요청에 자동 적용된다.

### `/start` - 시작 환경 통일 게이트

목적은 기능 실행이 아니라 **모든 수강생의 시작 상태를 같게 만드는 것**이다. 아래 순서대로 하나씩 확인하고, 하나라도 실패하면 그 자리에서 멈춘다 - 다음 항목으로 넘어가지 않는다.

1. `node --version`, `npm --version` 확인. 둘 중 하나라도 없거나 명령을 못 찾으면, 설치 안내(Day9 자료 참고)를 하고 멈춘다.
2. 지금 폴더가 프로젝트 루트인지 확인 - `index.html` · `api/` · `setup.sql` 3종이 이 폴더에 실재하는지 본다. 하나라도 없으면 "VS Code에서 File > Open Folder로 starter 폴더를 통째로 다시 연다"를 안내하고 멈춘다.
3. 터미널 프롬프트 앞의 `(base)`나 `(venv)` 같은 표시는 이 실습과 무관하다고 한 줄로 학생에게 고지한다 - 지우거나 나갈 필요 없이 무시해도 된다.
4. `npm i` 실행 - `added N packages` 줄이 나오는지 확인한다.
5. `.env.example` 파일이 있는지 확인한다 - 안의 값은 보지 않는다, 파일이 존재하는지만 본다.
6. `/점검`을 실행한다 (하면 안 되는 것 1차 점검).

**모두 통과하면** 마지막 줄에 아래 형식으로 환경 영수증을 한 줄 출력한다.

```text
[환경OK] node vX / npm vY / 폴더 <폴더이름> / 준비완료
```

학생은 이 한 줄을 그대로 복사해 채팅에 올린다 - 강사가 화면을 하나하나 눈으로 확인하는 대신, 이 영수증 한 줄이 전원 환경 통일을 게이트한다.

**하나라도 실패하면** 그 항목에서 멈추고 아래 형식으로 출력한다. 학생은 이 줄을 그대로 채팅에 붙인다.

```text
[환경막힘] 항목: 원인
```

예: `[환경막힘] 폴더: index.html이 없습니다 - starter 폴더를 통째로 열었는지 확인하세요`

### `/check`

Day9부터 이어지는 원칙 - **터미널의 "완료" 메시지는 성공이 아니다.** 아래 네 가지를 사람이 직접 확인하기 전에는 "완료됐다"고 말하지 않는다.

1. 배포 URL이 실제로 응답하는지 확인 (`curl`로 상태 코드 200 확인)
2. 폼 제출 안내 - 그 URL에서 신청서 1건을 직접 제출해 보라고 안내
3. Table Editor 확인 안내 - Supabase Table Editor에서 방금 넣은 행을 눈으로 확인하라고 안내
4. Logs 확인 안내 - Vercel 프로젝트 Logs 탭에서 방금 요청의 `duration_ms` 로그 줄을 확인하라고 안내

### `/deploy`

1. `/점검`을 실행한다 (하면 안 되는 것 2차 점검) - `[점검경고]`가 하나라도 나오면 배포를 멈추고 알린다.

2. `git add . && git commit -m "메시지"`
3. `npx vercel --prod`
4. URL 확인 후 `/check` 실행을 권한다

`npm install -g vercel`은 쓰지 않는다. `npx vercel`을 쓴다.

### `/fix`

1. 붙여넣은 에러 원문을 읽는다
2. 원인을 한 줄로 진단한다
3. 고칠 파일을 지목한다
4. 수정하고, 재확인 방법(대부분 `/check`)을 안내한다


### `/기록` - 오늘의 작업 기록 쓰기 (예비 PM 습관)

Claude가 **객관적 사실만** 적은 작업 기록을 만들어 `WORKLOG.md`에 추가한다. 이 파일은 커밋되어 GitHub에 남고(포트폴리오 재료), 배포에는 나가지 않는다(.vercelignore). 원칙 세 가지:

- **사실만 적는다** - 이 대화에서 실제로 일어난 것만. 평가·추측·칭찬을 넣지 않는다. 값(비밀값·개인정보)은 절대 넣지 않는다.
- **예비 PM의 언어로 적는다** - 전문 용어가 나오면 반드시 괄호로 풀어 준다. 예: `커밋(작업이 되던 시점을 기록으로 남기는 것)`, `라우팅(주소를 보고 무엇을 보여줄지 정하는 것)`.
- **회고는 쓰지 않는다** - 느낀 점·배운 점은 학생의 것이다. 맨 아래 빈 칸으로만 남긴다.

기록 형식 (WORKLOG.md에 날짜별로 이어 붙인다):

```markdown
## 2026-08-05 (Day13)

한 줄 요약: (오늘 무엇이 되게 됐는지 - 사실로 한 문장)

### 만든 것 · 바뀐 것
- detail.html (새 파일): 판매 한 건을 보여주는 상세 페이지 - 주소에 ?id=번호가 붙는 방식(라우팅)
- CLAUDE.md: "내 규칙"에 1줄 추가 - (넣은 규칙 원문)

### 문제와 해결
- (실제 있었던 것만) 증상: 목록이 비어 보임 -> 원인: 읽기 정책 미실행 -> 해결: setup.sql 실행

### 확인된 것
- 배포 주소 응답 확인, 판매 표 N건 조회됨, 상세 링크가 다른 기기에서 열림

### 오늘 만난 용어 (예비 PM 풀이)
- 커밋: 작업이 되던 시점을 기록으로 남기는 것 - "돌아갈 수 있는 지점"
- (오늘 새로 등장한 용어 1-2개 더)

### 내 회고 (직접 채우는 칸)
- 좋았던 것(Liked):
- 배운 것(Learned):
- 부족했던 것(Lacked):
- 바라는 것(Longed for):
```

작성 후: "WORKLOG.md에 오늘 기록을 추가했습니다 - 맨 아래 회고 네 줄만 직접 채우면 제출 재료가 됩니다"라고 안내하고 커밋한다. /deploy 전에 실행하면 기록까지 함께 GitHub에 올라간다.

### 협업 준비 (개념 안내 - 요청하면 알려준다)

지금은 1인 + 에이전트의 협업이지만, 팀으로 일하게 되면 두 개념이 바로 등장한다.

- **브랜치**: 각자 자기 작업 공간에서 일하는 것 - 지금 커밋 습관이 그 기초다
- **머지(Merge)**: 갈라진 작업을 하나로 합치는 것 - 합칠 때 겹치면 "충돌"이 나고, 사람이 판단해서 고른다

"브랜치 실습해 보고 싶어"라고 요청하면 이 프로젝트에서 안전하게 한 번 해 볼 수 있게 안내한다.
