# 빌드 시스템

## 빌드 명령어 개요

| 명령어 | 용도 | 출력 |
|--------|------|------|
| `npm run build:lib` | React 라이브러리 | `dist/` |
| `npm run build:svelte` | Svelte 라이브러리 | `dist/svelte/` |
| `npm run build:cdn` | CDN CSS | `cdn/podo-ui.css` |
| `npm run build:cdn-js` | Vanilla JS | `cdn/podo-datepicker.js` |
| `npm run build:all` | 전체 빌드 | 위 4개 모두 |

---

## build:lib (React 라이브러리)

### 실행
```bash
npm run build:lib
```

### 스크립트
`cli/build-lib.js`

### 프로세스
1. `dist/` 폴더 클린
2. TypeScript 컴파일 (`tsconfig.build.json`)
3. SCSS 파일 복사 (`react/**/*.scss` → `dist/`)
4. 타입 선언 파일 생성 (`.d.ts`)

### 출력 구조
```
dist/
├── index.js           # 메인 엔트리
├── index.d.ts         # 타입 선언
├── react/
│   ├── atom/
│   │   ├── input.js
│   │   ├── input.d.ts
│   │   └── input.module.scss
│   └── molecule/
│       └── datepicker.js
```

### 사용
```typescript
import { Input, DatePicker } from 'podo-ui';
import { Avatar } from 'podo-ui/react/atom/avatar';
```

---

## build:svelte (Svelte 라이브러리)

### 실행
```bash
npm run build:svelte
```

### 스크립트
`cli/build-svelte.js`

### 프로세스
1. `dist/svelte/` 폴더 클린
2. Svelte 컴파일 (svelte-package 또는 커스텀 빌드)
3. 타입 선언 파일 생성 (`.d.ts`)
4. index.js 엔트리 생성

### 출력 구조
```
dist/svelte/
├── index.js           # 메인 엔트리
├── index.d.ts         # 타입 선언
├── atom/
│   ├── Input.svelte
│   ├── Input.js
│   └── Input.d.ts
└── molecule/
    ├── Field.svelte
    ├── Field.js
    └── Field.d.ts
```

### 사용
```typescript
// 전체 import
import { Input, Button, Field } from 'podo-ui/svelte';

// 개별 import
import Input from 'podo-ui/svelte/atom/Input';
import Field from 'podo-ui/svelte/molecule/Field';
```

---

## build:cdn (CSS)

### 실행
```bash
npm run build:cdn
```

### 스크립트
`cli/build-cdn.js`

### 프로세스
1. `cdn/` 폴더 생성
2. 아이콘 폰트 복사 (`scss/icon/font/icon.woff` → `cdn/font/`)
3. `global.scss` 컴파일 (expanded + compressed)

### 출력 파일
| 파일 | 용도 |
|------|------|
| `cdn/podo-ui.css` | 개발용 (가독성) |
| `cdn/podo-ui.min.css` | 프로덕션용 (압축) |
| `cdn/font/icon.woff` | 아이콘 폰트 |

### CDN 사용
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-ui.min.css">
```

---

## build:cdn-js (Vanilla JS)

### 실행
```bash
npm run build:cdn-js
```

### 스크립트
`cli/build-cdn-js.js`

### 프로세스
1. `vanilla/datepicker.js` 읽기
2. 배너 추가 (버전, 라이선스)
3. 일반 버전 + 압축 버전 생성
4. CSS 파일 복사

### 출력 파일
| 파일 | 용도 |
|------|------|
| `cdn/podo-datepicker.js` | 개발용 |
| `cdn/podo-datepicker.min.js` | 프로덕션용 |
| `cdn/podo-datepicker.css` | 스타일 |
| `cdn/podo-datepicker.min.css` | 압축 스타일 |

### CDN 사용
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.css">
<script src="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.js"></script>
```

---

## build:all

### 실행
```bash
npm run build:all
```

### 프로세스
순차 실행:
1. `npm run build:lib`
2. `npm run build:svelte`
3. `npm run build:cdn`
4. `npm run build:cdn-js`

### 사용 시점
- npm 배포 전 (`prepublishOnly`에서 자동 실행)
- 전체 릴리스 준비

---

## 아이콘 빌드

### 실행
```bash
npm run icon
```

### 스크립트
`cli/icon-scss.js`

### 프로세스
1. `scss/icon/font/icon.woff` 읽기
2. 글리프 이름/유니코드 추출
3. `scss/icon/icon-name.scss` 생성

### 출력
```scss
// scss/icon/icon-name.scss
$icon-name: (
  star: \e900,
  heart: \e901,
  // ...
);
```

---

## 개발 서버

### 실행
```bash
npm run dev
```

### 설정
- 포트: 5432
- URL: http://localhost:5432

### 기능
- Vike 개발 서버
- Hot Reload
- 문서 사이트 확인

---

## 배포

### Cloudflare Pages
```bash
npm run pages:build  # 빌드
npm run deploy       # 배포
```

### NPM
```bash
npm version patch    # 버전 업
npm publish          # 배포 (build:all 자동 실행)
```

---

## 트러블슈팅

### TypeScript 에러
```bash
# 캐시 삭제 후 재빌드
rm -rf dist .tsbuildinfo
npm run build:lib
```

### Svelte 빌드 에러
```bash
# dist/svelte 삭제 후 재빌드
rm -rf dist/svelte
npm run build:svelte
```

### 아이콘 누락
```bash
# 아이콘 폰트 재생성 후 CDN 빌드
npm run icon
npm run build:cdn
```

### CDN 파일 구버전
```bash
# 전체 재빌드
npm run build:all
```
