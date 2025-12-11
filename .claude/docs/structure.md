# 프로젝트 폴더 구조

```
podo-ui/
├── react/                  # React 컴포넌트
│   ├── atom/              # 원자 컴포넌트
│   │   ├── avatar.tsx     # 아바타
│   │   ├── chip.tsx       # 칩/태그
│   │   ├── editor.tsx     # WYSIWYG 에디터
│   │   ├── editor-view.tsx # 에디터 뷰어
│   │   ├── input.tsx      # 입력 필드
│   │   ├── textarea.tsx   # 텍스트영역
│   │   └── tooltip.tsx    # 툴팁
│   └── molecule/          # 분자 컴포넌트
│       ├── datepicker.tsx # 날짜 선택기
│       ├── field.tsx      # 폼 필드 래퍼
│       ├── pagination.tsx # 페이지네이션
│       ├── toast.tsx      # 토스트 알림
│       └── toast-provider.tsx
│
├── scss/                   # SCSS 디자인 시스템
│   ├── atom/              # 원자 스타일 (chip 등)
│   ├── button/            # 버튼 스타일
│   ├── color/             # 컬러 시스템 (테마)
│   ├── form/              # 폼 요소 (input, select 등)
│   ├── icon/              # 아이콘 시스템
│   │   ├── svg/           # 원본 SVG 파일
│   │   └── font/          # 생성된 WOFF
│   ├── layout/            # 그리드, 간격, 반경
│   ├── molecule/          # 복합 스타일 (tab, table, toast 등)
│   └── typo/              # 타이포그래피
│
├── vanilla/               # Vanilla JS 컴포넌트
│   └── datepicker.js      # 순수 JS 데이트피커
│
├── cdn/                   # CDN 배포 파일
│   ├── podo-ui.css        # 전체 CSS
│   ├── podo-ui.min.css    # 압축 CSS
│   ├── podo-datepicker.js # JS 컴포넌트
│   └── font/              # 아이콘 폰트
│
├── dist/                  # npm 배포 빌드
│
├── src/                   # Vike 문서 사이트
│   ├── pages/             # 페이지 라우트 (Vike)
│   │   ├── index/         # 홈
│   │   ├── getting-started/
│   │   ├── foundation/
│   │   ├── layout/
│   │   ├── components/
│   │   └── utilities/
│   ├── components/        # 문서 사이트 컴포넌트
│   └── i18n/              # i18next 설정
│
├── i18n/                  # 국제화
│   └── locales/           # 번역 파일
│       ├── en/            # 영어
│       └── ko/            # 한국어
│
├── cli/                   # 빌드 스크립트
│   ├── icon-scss.js       # 아이콘 생성기
│   ├── build-lib.js       # 라이브러리 빌드
│   ├── build-cdn.js       # CDN CSS 빌드
│   └── build-cdn-js.js    # CDN JS 빌드
│
├── global.scss            # 글로벌 스타일 진입점
├── mixin.scss             # SCSS 함수/믹스인
├── vite-fonts.scss        # Vite용 폰트 설정
├── index.ts               # React 컴포넌트 내보내기
└── vite.config.ts         # Vite 설정
```

## 주요 진입점
| 경로 | 용도 |
|------|------|
| `podo-ui` | React 컴포넌트 (기본) |
| `podo-ui/global.scss` | 글로벌 스타일 |
| `podo-ui/mixin.scss` | SCSS 함수/믹스인 |
| `podo-ui/vite-fonts.scss` | Vite 프로젝트용 폰트 |
| `podo-ui/react/atom/*` | 개별 Atom 컴포넌트 |
| `podo-ui/react/molecule/*` | 개별 Molecule 컴포넌트 |
| `podo-ui/vanilla/datepicker` | Vanilla JS 데이트피커 |
