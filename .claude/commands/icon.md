# 아이콘 추가 (폰트 교체 + 매핑/문서 동기화)

새 `icon.woff` 폰트 파일을 받아 아이콘을 추가하고, 이름 매핑·AI 레퍼런스·문서 페이지를 모두 동기화합니다.

## 인자
- `$ARGUMENTS`: 새 `icon.woff` 파일의 경로 (예: `~/Desktop/icon.woff`)
  - 생략 시 사용자에게 woff 파일 경로를 물어볼 것

## 핵심 원리
- `npm run icon`(`cli/icon-scss.js`)은 **woff 파일 자체에서** opentype.js로 글리프 이름·codepoint를 읽어 `scss/icon/icon-name.scss`를 생성한다.
- 따라서 SVG 원본 없이 **woff 파일 하나만** 있으면 아이콘 추가가 가능하다.
- woff 안에 글리프 이름이 박혀 있으므로 매핑은 자동 복원된다.

## 실행 절차

### 1. 새 woff 파일 확인
- 인자로 받은 woff 파일이 존재하는지 확인
- 기존 `scss/icon/font/icon.woff`와 해시 비교 (동일하면 "변경 없음" 알리고 중단)

### 2. woff 교체
- 새 파일을 `scss/icon/font/icon.woff`로 복사

### 3. 이름 매핑 재생성
- `npm run icon` 실행 → `scss/icon/icon-name.scss` 자동 재생성
- `git diff scss/icon/icon-name.scss`로 **새로 추가된 아이콘 이름·codepoint 확인**
  (예: `inbox: \e9b5`, `pull-arrow: \e9b6`, `server: \e9b7`)

### 4. AI 레퍼런스 동기화
- `public/ai/systems/icon.json`의 `commonIcons` 배열 마지막에 새 아이콘 추가
  - 형식: `"icon-{name}"` (예: `"icon-inbox"`)

### 5. 문서 페이지 반영
- `src/pages/foundation/icons/+Page.tsx` 수정:
  - 상단 전체 아이콘 배열에 새 이름 추가 (`'inbox', 'pull-arrow', 'server'`)
  - 적절한 카테고리 섹션 배열에도 추가:
    - 일반 UI / 화살표(arrows) / 파일·문서(fileDocument) / 소셜(socialMedia) / 상태(status) / 기타(etc)
  - 아이콘 의미에 맞는 카테고리로 분류 (예: 화살표류 → arrows, 서버/DB류 → fileDocument)

### 6. 빌드 검증
- `npm run build:cdn` 실행 → 통과 확인 (`cdn/font/icon.woff` 갱신됨)

### 7. 브라우저 확인 (선택)
- `npm run dev` 후 `http://localhost:5432/foundation/icons` 접속
- Claude in Chrome으로 새 아이콘이 실제 글리프로 렌더링되는지 확인
- codepoint가 `icon-name.scss`와 일치하는지 점검

### 8. 결과 보고
- 추가된 아이콘 목록 (이름 + codepoint)
- 변경된 파일 목록

## 변경 대상 파일 요약
| 파일 | 작업 |
|------|------|
| `scss/icon/font/icon.woff` | 새 폰트로 교체 |
| `scss/icon/icon-name.scss` | `npm run icon`으로 재생성 (수동 편집 금지) |
| `public/ai/systems/icon.json` | `commonIcons` 배열에 추가 |
| `src/pages/foundation/icons/+Page.tsx` | 전체 목록 + 카테고리 배열에 추가 |

## 사용법 (참고)
```html
<i class="icon-{name}"></i>
```
```scss
@use 'podo-ui/mixin' as *;
.btn::before { @include icon({name}); }
```

## 주의사항
- `icon-name.scss`는 **빌드 산출물** — 직접 편집하지 말고 항상 `npm run icon`으로 재생성할 것
- `cdn/`, `dist/`는 `.gitignore` 대상 — 빌드 산출물은 커밋되지 않음
- 커밋·푸시는 이 커맨드에 포함되지 않음. 완료 후 `/commit-push patch`로 버전 업(아이콘 추가는 patch)·커밋
- 이전 아이콘 추가 커밋 메시지 형식: `feat: 새 아이콘 N종 추가 (...) (vX.Y.Z)`
