# 아키텍처

## 프로젝트 개요

Podo UI는 **SCSS 모듈 기반 디자인 시스템 + React UI 컴포넌트 라이브러리**입니다.

### 핵심 철학
- **97% CSS 기반**: 최대 유연성, 프레임워크 독립적
- **3% React**: 복잡한 상태 관리가 필요한 경우만

### 기술 스택
| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 14.1.0 |
| 언어 | TypeScript |
| 스타일 | SCSS (CSS Modules) |
| 검증 | Zod |
| 국제화 | next-intl |
| 배포 | Cloudflare Pages |

---

## 아토믹 디자인 구조

```
react/
├── atom/           # 원자 컴포넌트 (독립적)
│   ├── avatar      # 프로필 이미지
│   ├── chip        # 태그/칩
│   ├── input       # 입력 필드
│   ├── textarea    # 텍스트영역
│   ├── editor      # WYSIWYG 에디터
│   ├── editor-view # 에디터 뷰어
│   └── tooltip     # 툴팁
│
└── molecule/       # 분자 컴포넌트 (조합)
    ├── datepicker  # 날짜/시간 선택
    ├── field       # 폼 필드 래퍼
    ├── pagination  # 페이지네이션
    ├── toast       # 토스트 알림
    └── toast-provider
```

---

## SCSS 디자인 시스템

```
scss/
├── button/         # 버튼 스타일
├── color/          # 컬러 시스템 (테마)
│   ├── theme.scss  # 라이트/다크 변수
│   └── function.scss
├── form/           # 폼 요소
├── icon/           # 아이콘 폰트
│   ├── svg/        # 원본 SVG
│   └── font/       # 생성된 WOFF
├── layout/         # 그리드, 간격, 반경
│   ├── grid.scss
│   ├── spacing.scss
│   └── radius.scss
├── molecule/       # 복합 스타일
└── typo/           # 타이포그래피
```

---

## 테마 시스템

### 모드 전환
```html
<html data-color-mode="light">  <!-- 라이트 -->
<html data-color-mode="dark">   <!-- 다크 -->
<html data-color-mode="">       <!-- 자동 (시스템) -->
<html data-color-tone="warm">   <!-- 웜 톤 -->
```

### 시맨틱 컬러
- **기본**: primary, default, default-deep
- **상태**: info, link, success, warning, danger
- **변형**: base, hover, pressed, focus, fill, reverse, outline

---

## 반응형 그리드

| 디바이스 | 컬럼 수 | 브레이크포인트 |
|----------|---------|----------------|
| PC | 12 | 1024px+ |
| Tablet | 6 | 768px - 1023px |
| Mobile | 4 | ~767px |

---

## 빌드 출력

| 빌드 | 출력 경로 | 용도 |
|------|-----------|------|
| `build:lib` | `dist/` | npm 패키지 |
| `build:cdn` | `cdn/podo-ui.css` | CDN CSS |
| `build:cdn-js` | `cdn/podo-*.js` | Vanilla JS |

---

## 내보내기 전략

```typescript
// 표준
import { Input, Avatar } from 'podo-ui/react'

// Next.js (SSR 비활성화)
import { Editor } from 'podo-ui/next'

// SCSS
@use 'podo-ui/mixin' as *;
@use 'podo-ui/global.scss';
```
