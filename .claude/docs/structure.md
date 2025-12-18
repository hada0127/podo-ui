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
├── svelte/                 # Svelte 5 컴포넌트
│   ├── atom/              # 원자 컴포넌트
│   │   ├── Avatar.svelte  # 아바타
│   │   ├── Button.svelte  # 버튼
│   │   ├── Checkbox.svelte # 체크박스
│   │   ├── Chip.svelte    # 칩/태그
│   │   ├── EditorView.svelte # 에디터 뷰어
│   │   ├── File.svelte    # 파일 입력
│   │   ├── Input.svelte   # 입력 필드
│   │   ├── Label.svelte   # 라벨
│   │   ├── Radio.svelte   # 라디오
│   │   ├── RadioGroup.svelte # 라디오 그룹
│   │   ├── Select.svelte  # 셀렉트
│   │   ├── Textarea.svelte # 텍스트영역
│   │   ├── Toggle.svelte  # 토글
│   │   └── Tooltip.svelte # 툴팁
│   └── molecule/          # 분자 컴포넌트
│       ├── Field.svelte   # 폼 필드 래퍼
│       ├── Pagination.svelte # 페이지네이션
│       ├── Tab.svelte     # 탭
│       ├── TabPanel.svelte # 탭 패널
│       ├── Table.svelte   # 테이블
│       ├── Toast.svelte   # 토스트 알림
│       └── ToastProvider.svelte
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
│   ├── index.js           # React 메인 엔트리
│   ├── react/             # React 컴포넌트
│   └── svelte/            # Svelte 컴포넌트
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
│   ├── build-lib.js       # React 라이브러리 빌드
│   ├── build-svelte.js    # Svelte 라이브러리 빌드
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
| `podo-ui/svelte` | Svelte 컴포넌트 |
| `podo-ui/global.scss` | 글로벌 스타일 |
| `podo-ui/mixin.scss` | SCSS 함수/믹스인 |
| `podo-ui/vite-fonts.scss` | Vite 프로젝트용 폰트 |
| `podo-ui/react/atom/*` | 개별 React Atom 컴포넌트 |
| `podo-ui/react/molecule/*` | 개별 React Molecule 컴포넌트 |
| `podo-ui/svelte/atom/*` | 개별 Svelte Atom 컴포넌트 |
| `podo-ui/svelte/molecule/*` | 개별 Svelte Molecule 컴포넌트 |
| `podo-ui/vanilla/datepicker` | Vanilla JS 데이트피커 |
