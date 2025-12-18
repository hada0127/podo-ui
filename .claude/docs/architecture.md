# 아키텍처

## 프로젝트 개요

Podo UI는 **SCSS 모듈 기반 디자인 시스템 + React/Svelte UI 컴포넌트 라이브러리**입니다.

### 핵심 철학
- **97% CSS 기반**: 최대 유연성, 프레임워크 독립적
- **3% Components**: 복잡한 상태 관리가 필요한 경우만

### 기술 스택
| 분류 | 기술 |
|------|------|
| 프레임워크 | Vike 0.4 + vike-react |
| React | React 18/19 + TypeScript |
| Svelte | Svelte 5 + TypeScript |
| 스타일 | SCSS (CSS Modules) |
| 빌드 도구 | Vite 5.4 |
| 검증 | Zod |
| 국제화 | i18next + react-i18next |
| 배포 | Cloudflare Pages |

---

## 아토믹 디자인 구조

### React 컴포넌트
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

### Svelte 컴포넌트
```
svelte/
├── atom/           # 원자 컴포넌트
│   ├── Avatar      # 프로필 이미지
│   ├── Button      # 버튼
│   ├── Checkbox    # 체크박스
│   ├── Chip        # 태그/칩
│   ├── EditorView  # 에디터 뷰어
│   ├── File        # 파일 입력
│   ├── Input       # 입력 필드
│   ├── Label       # 라벨
│   ├── Radio       # 라디오
│   ├── RadioGroup  # 라디오 그룹
│   ├── Select      # 셀렉트
│   ├── Textarea    # 텍스트영역
│   ├── Toggle      # 토글
│   └── Tooltip     # 툴팁
│
└── molecule/       # 분자 컴포넌트
    ├── Field       # 폼 필드 래퍼
    ├── Pagination  # 페이지네이션
    ├── Tab         # 탭
    ├── TabPanel    # 탭 패널
    ├── Table       # 테이블
    ├── Toast       # 토스트 알림
    └── ToastProvider
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
| `build:lib` | `dist/` | npm 패키지 (React) |
| `build:svelte` | `dist/svelte/` | npm 패키지 (Svelte) |
| `build:cdn` | `cdn/podo-ui.css` | CDN CSS |
| `build:cdn-js` | `cdn/podo-*.js` | Vanilla JS |

---

## 내보내기 전략

```typescript
// React 표준
import { Input, Avatar } from 'podo-ui'
import { Input } from 'podo-ui/react/atom/input'

// Svelte 표준
import { Input, Button } from 'podo-ui/svelte'
import Input from 'podo-ui/svelte/atom/Input'

// SCSS
@use 'podo-ui/mixin' as *;
@use 'podo-ui/global.scss';
```
