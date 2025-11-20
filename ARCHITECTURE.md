# Podo-UI Architecture

## 프로젝트 개요

**Podo-UI**는 SCSS 모듈 기반의 디자인 시스템이자 React용 UI 컴포넌트 라이브러리입니다. CSS 클래스를 주로 제공하면서, 복잡한 폼 인터랙션을 위한 일부 React 컴포넌트도 포함하는 하이브리드 라이브러리입니다.

- **버전:** 0.1.44
- **라이선스:** MIT
- **저장소:** https://github.com/hada0127/podo-ui
- **핵심 특징:** SCSS 우선, 라이트/다크 테마, 반응형 그리드, 아이콘 폰트 시스템

---

## 목차

1. [프로젝트 구조](#1-프로젝트-구조)
2. [SCSS 디자인 시스템](#2-scss-디자인-시스템)
3. [React 컴포넌트](#3-react-컴포넌트)
4. [CLI 도구](#4-cli-도구)
5. [스타일링 접근법](#5-스타일링-접근법)
6. [빌드 및 배포](#6-빌드-및-배포)
7. [개발 워크플로우](#7-개발-워크플로우)
8. [핵심 기술 스택](#8-핵심-기술-스택)

---

## 1. 프로젝트 구조

### 루트 디렉토리 구조

```
podo-ui/
├── cli/                    # CLI 도구 (아이콘 생성)
├── react/                  # React 컴포넌트 소스
│   ├── atom/              # 원자 단위 컴포넌트
│   └── molecule/          # 분자 단위 컴포넌트
├── scss/                   # SCSS 디자인 시스템
│   ├── button/            # 버튼 스타일
│   ├── color/             # 컬러 시스템
│   ├── form/              # 폼 요소
│   ├── icon/              # 아이콘 시스템
│   ├── layout/            # 레이아웃 유틸리티
│   ├── molecule/          # 복합 컴포넌트
│   └── typo/              # 타이포그래피
├── src/                    # Next.js 데모/문서 앱
│   └── app/               # 앱 라우트
├── global.scss             # 글로벌 스타일 진입점
├── mixin.scss              # SCSS 함수/믹스인
├── react.ts                # React 컴포넌트 표준 내보내기
├── next.ts                 # Next.js용 컴포넌트 내보내기
└── package.json            # 패키지 설정
```

### 주요 설정 파일

#### package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "icon": "node cli/icon-scss.js",
    "pages:build": "pnpm next-on-pages",
    "deploy": "pnpm pages:build && wrangler pages deploy"
  }
}
```

- **타입:** ESM 모듈
- **주요 의존성:** React 18, Next.js 14, Sass, Zod, SunEditor
- **빌드 타겟:** Next.js + Cloudflare Pages

#### tsconfig.json

- Strict 모드 활성화
- Next.js 플러그인 통합
- 경로 별칭: `@/*` → `./src/*`
- 모듈 해석: bundler

---

## 2. SCSS 디자인 시스템

### 디렉토리 구조

```
scss/
├── button/              # 버튼 스타일
│   ├── class.scss       # 색상 변형 클래스
│   └── layout.scss      # 기본 버튼 레이아웃
├── color/               # 컬러 시스템
│   ├── class.scss       # 컬러 유틸리티 클래스
│   ├── function.scss    # 컬러 SCSS 함수
│   └── theme.scss       # 라이트/다크 테마 변수
├── form/                # 폼 요소
│   ├── checkbox-radio.scss
│   ├── file.scss
│   ├── input.scss
│   ├── label.scss
│   ├── select.scss
│   ├── textarea.scss
│   └── toggle.scss
├── icon/                # 아이콘 시스템
│   ├── font/icon.woff   # 아이콘 폰트 파일
│   ├── function.scss    # 아이콘 헬퍼 함수
│   ├── icon-name.scss   # 자동 생성된 아이콘 맵
│   └── icon.scss        # 아이콘 기본 스타일
├── layout/              # 레이아웃 유틸리티
│   ├── grid.scss        # 그리드 시스템
│   ├── spacing.scss     # 간격 시스템
│   ├── radius.scss      # 테두리 반경
│   ├── border.scss      # 테두리
│   └── device.scss      # 반응형 브레이크포인트
├── molecule/            # 복합 컴포넌트
│   ├── pagination.scss
│   ├── tab.scss
│   └── table.scss
├── typo/                # 타이포그래피
│   ├── font/            # Pretendard 폰트 (9가지 굵기)
│   ├── font-family.scss
│   ├── font-size.scss
│   ├── mixin.scss       # 타이포그래피 믹스인
│   └── typo.scss
└── reset.scss           # CSS 리셋
```

### 핵심 디자인 토큰

#### 컬러 시스템

**테마 아키텍처** ([scss/color/theme.scss](scss/color/theme.scss)):

- CSS 변수 기반 테마
- `data-color-mode` 속성으로 라이트/다크 모드 전환
- `data-color-tone` 속성으로 웜 톤 지원
- 8가지 시맨틱 컬러: primary, default, default-deep, info, link, success, warning, danger
- 각 컬러는 7가지 변형: base, hover, pressed, focus, fill, reverse, outline

**사용법:**

```scss
@use 'podo-ui/mixin' as *;

.button {
  background: color(primary-base);

  &:hover {
    background: color(primary-hover);
  }
}
```

#### 간격 시스템

**간격 스케일** ([scss/layout/spacing.scss](scss/layout/spacing.scss)):

```
0: 0px    1: 2px     2: 4px     3: 8px     4: 12px
5: 16px   6: 24px    7: 32px    8: 40px    9: 48px
10: 64px  11: 80px   12: 96px   13: 160px
```

**SCSS 함수:**

```scss
@use 'podo-ui/mixin' as *;

.card {
  padding: s(5);        // 16px
  margin-bottom: s(6);  // 24px
}
```

**유틸리티 클래스:**

```html
<div class="p-5 m-b-6">  <!-- padding: 16px, margin-bottom: 24px -->
<div class="p-t-3 m-l-4"> <!-- padding-top: 8px, margin-left: 12px -->
```

#### 그리드 시스템

**반응형 그리드** ([scss/layout/grid.scss](scss/layout/grid.scss)):

- PC: 12컬럼, 태블릿: 6컬럼, 모바일: 4컬럼
- 자동 래핑 그리드: `.grid` 클래스
- 고정 컬럼 그리드: `.grid-fix-2` ~ `.grid-fix-6`
- 너비 유틸리티: `.w-1` ~ `.w-12`, `.w-1_4`, `.w-2_6` 등
- 픽셀 기반 너비: `.w-{n}px` (0-5000)

**사용 예:**

```html
<!-- 자동 래핑 그리드 -->
<div class="grid">
  <div class="w-4">컬럼 1</div>
  <div class="w-8">컬럼 2</div>
</div>

<!-- 고정 3컬럼 그리드 -->
<div class="grid-fix-3">
  <div>항목 1</div>
  <div>항목 2</div>
  <div>항목 3</div>
</div>
```

#### 아이콘 시스템

**구조** ([scss/icon/](scss/icon/)):

- 커스텀 아이콘 폰트: `icon.woff`
- 100개 이상의 아이콘
- 자동 생성된 [icon-name.scss](scss/icon/icon-name.scss)
- SCSS 맵 구조: `$icon-name: (star: \e900, star-fill: \e901, ...)`

**사용법:**

```html
<i class="icon-star"></i>
<i class="icon-heart-fill"></i>
<i class="icon-check"></i>
```

#### 테두리 반경

**함수** ([scss/layout/radius.scss](scss/layout/radius.scss)):

```scss
@use 'podo-ui/mixin' as *;

.card {
  border-radius: r(4);  // 특정 반경 값
}
```

**유틸리티 클래스:**

```html
<div class="r-2">   <!-- 작은 반경 -->
<div class="r-4">   <!-- 중간 반경 -->
<div class="r-full"> <!-- 완전한 원형 -->
```

#### 타이포그래피

**폰트 패밀리:** Pretendard (9가지 굵기: 100-900)

**타이포그래피 믹스인:**

```scss
@use 'podo-ui/mixin' as *;

.title {
  @include display1;  // 큰 제목
}

.body {
  @include p1;        // 본문 텍스트
}

.caption {
  @include p5;        // 캡션 텍스트
}
```

**스타일:**
- Display: `display1` ~ `display7`
- Paragraph: `p1` ~ `p5` (semibold 변형 포함)

---

## 3. React 컴포넌트

### 아토믹 디자인 구조

```
react/
├── atom/                    # 원자 단위 컴포넌트
│   ├── avatar.tsx          # 아바타 (프로필 이미지/아이콘/텍스트)
│   ├── avatar.module.scss
│   ├── input.tsx           # 검증 기능 입력
│   ├── input.module.scss
│   ├── textarea.tsx        # 텍스트영역
│   ├── textarea.module.scss
│   ├── editor.tsx          # WYSIWYG 에디터
│   ├── editor.module.scss
│   ├── editor-view.tsx     # 에디터 뷰 (읽기 전용)
│   └── editor-view.module.scss
└── molecule/               # 분자 단위 컴포넌트
    ├── field.tsx           # 폼 필드 래퍼
    └── field.module.scss
```

### 주요 컴포넌트

#### Avatar 컴포넌트

**파일:** [react/atom/avatar.tsx](react/atom/avatar.tsx)

**특징:**
- 3가지 유형 지원: image (사진), icon (시스템 아이콘), text (이니셜)
- 9가지 크기: 16, 20, 24, 28, 32, 36, 40, 48, 56
- Activity Ring: 활동 상태 표시 (파란색 링)
- 원형 디자인 (border-radius: 9999px)
- icon/text 타입: 회색 배경(#ececef)

**사용 예:**

```tsx
import { Avatar } from 'podo-ui'

function UserProfile() {
  return (
    <>
      <Avatar type="image" src="/profile.jpg" size={56} />
      <Avatar type="icon" icon="icon-user" size={40} />
      <Avatar type="text" text="보라" size={56} activityRing={true} />
    </>
  )
}
```

#### Input 컴포넌트

**파일:** [react/atom/input.tsx](react/atom/input.tsx)

**특징:**
- TypeScript 완전 지원
- Zod 검증 통합
- 아이콘 지원 (좌/우)
- 단위 표시 (예: "원")
- 자동 검증 상태 (success/danger)

**사용 예:**

```tsx
import { Input } from 'podo-ui/react'
import { z } from 'zod'

const emailValidator = z.string().email()

function MyForm() {
  return (
    <Input
      value={email}
      validator={emailValidator}
      placeholder="이메일을 입력하세요"
      withIcon="mail"
    />
  )
}
```

#### Textarea 컴포넌트

**파일:** [react/atom/textarea.tsx](react/atom/textarea.tsx)

**특징:**
- Input과 유사한 검증 패턴
- 표준 textarea 래퍼

#### Editor 컴포넌트

**파일:** [react/atom/editor.tsx](react/atom/editor.tsx)

**특징:**
- 자체 제작 WYSIWYG 에디터
- 이미지/유튜브 삽입 및 편집
- 텍스트 서식 (굵게, 기울임, 밑줄, 취소선)
- 폰트 및 크기 설정
- 단락 형식 (제목 1-6, 본문, 인용 등)
- 색상 및 정렬 옵션
- Zod 검증 지원
- 리사이즈 가능
- 자동 높이 조절 (height='contents')

**사용 예:**

```tsx
import { Editor } from 'podo-ui/next' // Next.js용

function MyEditor() {
  return (
    <Editor
      value={content}
      onChange={setContent}
      height="400px"
      placeholder="내용을 입력하세요..."
    />
  )
}
```

#### EditorView 컴포넌트

**파일:** [react/atom/editor-view.tsx](react/atom/editor-view.tsx)

**특징:**
- Editor에서 생성된 HTML 표시
- 읽기 전용
- Editor와 동일한 스타일 적용
- 이미지, 링크, 유튜브 영상 표시
- 간단한 사용법

**사용 예:**

```tsx
import { EditorView } from 'podo-ui/react'

function MyPost() {
  return (
    <EditorView value={htmlContent} />
  )
}
```

#### Field 컴포넌트

**파일:** [react/molecule/field.tsx](react/molecule/field.tsx)

**특징:**
- 레이블, 도움말, 검증이 있는 폼 필드 래퍼
- 필수 필드 표시
- Validator 통합

**사용 예:**

```tsx
import { Field, Input } from 'podo-ui/react'

function MyForm() {
  return (
    <Field
      label="이메일"
      required
      helper="유효한 이메일을 입력하세요"
      validator={emailValidator}
      value={email}
    >
      <Input value={email} onChange={handleChange} />
    </Field>
  )
}
```

#### Pagination

**파일:** [react/molecule/pagination.tsx](react/molecule/pagination.tsx)

**특징:**
- 페이지 네비게이션 컴포넌트
- 현재 페이지 표시 및 페이지 이동
- 이전/다음 버튼 지원
- 페이지 번호 범위 표시

**사용 예:**

```tsx
import { Pagination } from 'podo-ui/react'

function MyList() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={10}
      onPageChange={setCurrentPage}
    />
  )
}
```

### 내보내기 전략

#### 표준 내보내기 ([index.ts](index.ts))

```typescript
export { Input, Textarea, Editor, EditorView, Avatar, Pagination, Field }
```

#### Next.js 내보내기 ([next.ts](next.ts))

```typescript
'use client' // 클라이언트 컴포넌트

// Editor는 동적 임포트 (SSR 비활성화)
const Editor = dynamic(() => import('./react/atom/editor'), { ssr: false })

export { Input, Textarea, Editor, EditorView, Avatar, Pagination, Field }
```

---

## 4. CLI 도구

### 아이콘 SCSS 생성기

**파일:** [cli/icon-scss.js](cli/icon-scss.js)

**목적:** 아이콘 폰트에서 SCSS 아이콘 이름 매핑 자동 생성

**기술:** Node.js + opentype.js

**프로세스:**
1. `/scss/icon/font/icon.woff` 읽기
2. 글리프 이름과 유니코드 값 추출
3. SCSS 맵 생성
4. 글리프 이름의 언더스코어를 하이픈으로 변환

**입력:**
```
/scss/icon/font/icon.woff
```

**출력:**
```scss
// /scss/icon/icon-name.scss
$icon-name: (
  star: \e900,
  star-fill: \e901,
  exchange-horizontally: \e902,
  // ... 100개 이상의 아이콘
);
```

**사용법:**

```bash
npm run icon
```

---

## 5. 스타일링 접근법

### SCSS 모듈 아키텍처

#### 글로벌 스타일 ([global.scss](global.scss))

- 글로벌 스타일 진입점
- `@forward`로 모든 SCSS 컴포넌트 임포트
- 순서: 리셋 → 컬러 → 레이아웃 → 타이포그래피 → 아이콘 → 버튼 → 폼 → Molecule

#### 믹스인 파일 ([mixin.scss](mixin.scss))

- SCSS 모듈에서 사용
- 글로벌 스타일 없이 함수와 믹스인 제공
- 포함: 컬러 함수, 간격, 반경, 테두리, 타이포그래피 믹스인, 아이콘 유틸리티

#### Vite 전용 폰트 ([vite-fonts.scss](vite-fonts.scss))

- Vite 번들러의 폰트 경로 문제 해결
- 아이콘과 Pretendard 폰트 경로 재정의
- Vite 프로젝트에만 필요 (Next.js나 CRA 제외)

### 하이브리드 CSS + React 접근법

**철학:**
- 대부분의 UI는 순수 CSS 클래스 (버튼, 폼, 테이블 등)
- React 컴포넌트는 상태 보존/복잡한 요소에만 사용 (입력 검증, WYSIWYG 에디터)
- 모든 프레임워크나 바닐라 JS에서 사용 가능

**장점:**
- 프레임워크 독립적
- 빠른 성능 (JS 번들 최소화)
- 점진적 채택 가능
- CSS 우선, 필요시 React

---

## 6. 빌드 및 배포

### 빌드 설정

#### Next.js 구성

- Next.js 14.1.0 + Edge 런타임
- Cloudflare Pages 어댑터 (`@cloudflare/next-on-pages`)
- Cloudflare 호환성을 위한 `setupDevPlatform`

#### NPM 무시

**배포 제외:**
- node_modules, .git, tests, .env, .vscode, .vercel, .wrangler, .next

**배포 포함:**
- scss/, react/, 루트 SCSS 파일, TypeScript 파일

### 배포 전략

**진입점:**
1. `podo-ui/global.scss` - 글로벌 스타일
2. `podo-ui/mixin` - 모듈용 SCSS 함수/믹스인
3. `podo-ui/react` - React 컴포넌트 (표준)
4. `podo-ui/next` - React 컴포넌트 (Next.js)
5. `podo-ui/vite-fonts.scss` - Vite 폰트 경로 수정

**Cloudflare Pages 배포:**

```bash
npm run pages:build  # Cloudflare Pages용 빌드
npm run deploy       # Cloudflare에 배포
```

---

## 7. 개발 워크플로우

### 표준 워크플로우

**1. 설치:**

```bash
npm install podo-ui
```

**2. 글로벌 스타일 임포트:**

```typescript
// app.tsx or main.tsx
import 'podo-ui/global.scss'
```

**3. CSS 클래스 사용:**

```tsx
function Button() {
  return <button className="primary">클릭</button>
}
```

**4. React 컴포넌트 사용:**

```tsx
import { Input, Field } from 'podo-ui/react'

function Form() {
  return (
    <Field label="이름">
      <Input value={name} onChange={setName} />
    </Field>
  )
}
```

**5. SCSS 함수 사용:**

```scss
@use 'podo-ui/mixin' as *;

.custom-card {
  padding: s(5);
  background: color(primary);
  border-radius: r(4);
}
```

### 아이콘 개발 워크플로우

**1. 아이콘 폰트 업데이트:**

```bash
# /scss/icon/font/icon.woff 파일 교체
```

**2. 아이콘 맵 재생성:**

```bash
npm run icon
```

**3. 사용:**

```html
<i class="icon-new-icon-name"></i>
```

### 데모 개발

**1. 개발 서버 시작:**

```bash
npm run dev
```

**2. 컴포넌트 테스트:**

[src/app/page.tsx](src/app/page.tsx) 편집

**3. 확인:**

http://localhost:3000

---

## 8. 핵심 기술 스택

### 코어 스택

- **React 18** - 컴포넌트 라이브러리
- **Next.js 14** - 문서/데모 앱 프레임워크
- **Sass** - 스타일링 시스템
- **TypeScript** - 타입 안정성
- **Zod** - 스키마 검증

### 전문 라이브러리

- **SunEditor** - WYSIWYG 에디터
- **opentype.js** - 아이콘 생성용 폰트 파싱
- **UUID** - 고유 ID 생성

### 빌드 도구

- **Next.js** - 주 번들러
- **Cloudflare Pages** - 배포 플랫폼
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포매팅

---

## 특별한 기능 및 패턴

### 1. 하이브리드 CSS + React 접근법

**비율:**
- 97% CSS 기반 컴포넌트 (최대 유연성)
- 3% React 컴포넌트 (복잡한 상태 인터랙션)

**장점:**
- 모든 프레임워크에서 사용 가능
- 최소한의 JavaScript 번들 크기
- 점진적 채택 가능

### 2. 런타임 테마 시스템

**전환 방법:**

```html
<!-- 라이트/다크 모드 -->
<html data-color-mode="light">
<html data-color-mode="dark">
<html data-color-mode=""> <!-- 자동 (시스템 설정) -->

<!-- 컬러 톤 -->
<html data-color-tone="">     <!-- 기본 -->
<html data-color-tone="warm"> <!-- 웜 톤 -->
```

**특징:**
- CSS 변수 기반 (리빌드 불필요)
- 즉각적인 전환
- JavaScript로 동적 제어 가능

### 3. 반응형 그리드

**자동 브레이크포인트 적응:**

```scss
// PC: 12컬럼
// 태블릿: 6컬럼
// 모바일: 4컬럼
// Gap과 padding이 브레이크포인트마다 조정
```

### 4. 아이콘 폰트 자동화

**장점:**
- CLI 도구가 수동 아이콘 매핑 제거
- 단일 소스 (WOFF 파일)
- SCSS 맵을 통한 타입 안전 아이콘 이름

**워크플로우:**

```
icon.woff → npm run icon → icon-name.scss → CSS 클래스
```

### 5. 검증 통합

**Zod 스키마 검증:**
- 모든 입력 컴포넌트에 통합
- 시각적 피드백 (success/danger 상태)
- 커스터마이징 가능한 오류 메시지

**예:**

```tsx
import { z } from 'zod'

const schema = z.string().min(2, '2자 이상 입력하세요')

<Input validator={schema} value={value} />
```

---

## 요약

**Podo-UI**는 다음을 제공하는 잘 설계된 SCSS 우선 디자인 시스템입니다:

- **97% CSS 기반 컴포넌트** - 최대 유연성
- **3% React 컴포넌트** - 복잡한 상태 인터랙션용
- **포괄적인 디자인 토큰** - 간격, 컬러, 타이포그래피, 반경
- **내장 테마** - 라이트/다크 모드
- **반응형 그리드 시스템** - 모바일 우선 접근
- **아이콘 시스템** - 폰트로부터 자동 생성
- **타입 안전 검증** - Zod 통합
- **프로덕션 준비** - Cloudflare Pages 배포

이 아키텍처는 명확한 관심사 분리, 아토믹 디자인 원칙, 그리고 SCSS 함수, TypeScript 지원, 포괄적인 문서를 통한 우수한 개발자 경험과 함께 현대적인 모범 사례를 따릅니다.
