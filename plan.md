# Podo v2 Design System Plan

작성일: 2026-06-11
브랜치: `v2`

## 1. 목표

Podo v2는 JSON 스펙을 단일 원천으로 삼는 TypeScript 기반 디자인 시스템이다. 디자인 토큰, 아이콘, 컴포넌트, 테마, 프로젝트별 커스텀 설정을 모두 검증 가능한 JSON으로 관리하고, 이 스펙을 웹 표준 컴포넌트, React, Hono TSX, React Native 환경으로 빌드한다.

동시에 디자인 시스템 개발자가 쓰는 편집 도구와, 패키지를 설치한 프로젝트에서 쓰는 경량 Web UI를 제공한다. 두 UI는 같은 편집 엔진을 공유하되 저장 위치만 다르다. 디자인 시스템 개발용 UI는 저장소 스펙을 수정하고, 설치 프로젝트용 UI는 `.podo` 경로의 오버라이드와 설정을 수정한다.

## 2. 리서치 요약

### Claude Code 관점

- 단일 원천은 DTCG 형식의 디자인 토큰 JSON으로 두고, Podo 전용 필드는 `$extensions.podo` 아래에 격리한다.
- 컴포넌트는 토큰과 별도 JSON 스키마로 정의한다. props, slots, variants, states, anatomy, token binding, examples, target support를 명시한다.
- 하나의 컴포넌트 코드를 네 환경에 억지로 공유하지 않는다. 공통 스펙과 공통 로직을 중심에 두고, 렌더러는 타깃별로 분리한다.
- 웹/React/Hono는 CSS custom properties 기반 테마를 우선 사용하고, React Native는 같은 토큰을 JS 객체와 테마 컨텍스트로 변환한다.
- MCP는 기존 `public/ai` 직접 참조보다 컨텍스트 효율이 높으므로 v2에서도 핵심 배포물로 유지한다.

### Agy 관점

- 편집 도구는 Figma 전체 복제보다 "스펙 에디터 + 캔버스 미리보기"로 시작한다.
- Canvas 기반 편집에는 tldraw 같은 SDK를 활용하고, 토큰/컴포넌트/테마 편집은 구조화된 패널을 중심으로 설계한다.
- 로컬 프로젝트에서는 `podo init`, `podo ui`, `podo build`, `podo update` 흐름으로 설정과 반영을 끝낼 수 있어야 한다.
- `.podo` 설정은 경량 Web UI와 CLI가 함께 읽고 쓰는 계약이다.
- Hono TSX와 Web Component SSR은 FOUC와 hydration 범위를 별도 리스크로 관리해야 한다.

### Codex 검증 관점

- DTCG Design Tokens Format은 JSON 기반 교환 포맷을 정의하며, 디자인 도구와 변환 도구 사이의 상호운용성을 목표로 한다.
- Style Dictionary는 디자인 토큰을 CSS, JS, HTML 등 여러 플랫폼 산출물로 변환하는 빌드 시스템이다.
- Figma Plugin API는 `figma.variables`를 통해 변수를 읽고 만들 수 있으므로, Figma 연동은 토큰 가져오기/내보내기부터 시작할 수 있다.
- MCP는 LLM 애플리케이션이 외부 데이터와 도구를 표준 방식으로 연결하는 프로토콜이므로, Podo 스펙 조회와 코드 생성 보조에 적합하다.
- Hono는 JSX 렌더링을 지원하지만 React DOM과 동일한 클라이언트 모델이 아니므로 Hono용 컴포넌트는 SSR/정적 렌더링을 1차 목표로 둔다.
- React Native는 TypeScript가 기본 지원되는 방향이지만 DOM, CSS, slot이 없으므로 전용 렌더러가 필요하다.

## 3. main 브랜치에서 가져올 점

`main` 브랜치의 기존 구조는 SCSS/React/Svelte/Vanilla 중심이지만 다음 자산은 v2 설계에 그대로 반영한다.

- `package.json`의 npm `exports`, `files`, `bin`, `prepublishOnly`, MCP 포함 배포 패턴
- `public/ai`의 컴포넌트/시스템 JSON 문서화 방향
- `mcp/src`의 `@modelcontextprotocol/sdk` 기반 도구 등록 구조
- `scss/icon/font/icon.woff`와 `cli/icon-scss.js`의 아이콘 폰트 추출 경험
- `build:lib`, `build:cdn`, `build:mcp`, `build:all`처럼 타깃별 빌드를 분리한 스크립트 구성

v2에서는 SCSS-first 구조를 JSON-spec-first 구조로 바꾸고, 기존 JSON 문서는 AI 문서가 아니라 실제 빌드 입력으로 승격한다.

## 4. 핵심 설계 원칙

1. JSON 스펙이 단일 원천이다.
2. TypeScript는 스키마 검증, 코드 생성, 런타임 타입의 기본 언어다.
3. 토큰과 컴포넌트는 별도 스키마로 관리하되, 컴포넌트는 토큰 참조만 사용한다.
4. 기능성 컴포넌트는 state, interaction, accessibility, renderer, style binding을 파일 단위로 분리한다.
5. 웹 표준 컴포넌트를 중심 타깃으로 두되 React, Hono, React Native는 각각의 런타임 특성에 맞춘 산출물을 낸다.
6. 설치 프로젝트는 `.podo` 아래에서만 Podo 설정과 오버라이드를 관리한다.
7. 업데이트는 자동 덮어쓰기보다 diff, migration, lockfile, dry-run을 기본으로 한다.
8. MCP는 문서 검색기가 아니라 스펙 조회, 생성, 검증을 돕는 개발 인터페이스다.

## 5. 모노레포 구조

```text
.
├── packages/
│   ├── spec/              # JSON schema, Zod schema, shared types
│   ├── tokens/            # DTCG token source and token transformers
│   ├── icons/             # SVG source, icon groups, woff build, manifests
│   ├── core/              # shared behavior, a11y utilities, state machines
│   ├── web/               # standard Web Components
│   ├── react/             # React components/wrappers
│   ├── hono/              # Hono TSX components and SSR helpers
│   ├── native/            # React Native components and token runtime
│   ├── editor/            # design-system development editor
│   ├── studio/            # installed-project lightweight Web UI
│   ├── cli/               # podo command
│   └── mcp/               # podo MCP server
├── examples/
│   ├── web/
│   ├── react/
│   ├── hono/
│   └── native/
├── schemas/
├── docs/
└── plan.md
```

패키지 관리는 pnpm workspace를 기본으로 한다. 배포 버전 관리는 Changesets를 사용하고, npm package export는 `main`의 패턴을 계승한다.

## 6. JSON 스펙

### 6.1 디자인 토큰

토큰은 DTCG 형식에 맞춘 `.tokens.json` 파일로 저장한다.

```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": "#5B5BD6",
      "$description": "Primary brand color",
      "$extensions": {
        "podo": {
          "themeable": true,
          "roles": ["brand", "action"]
        }
      }
    }
  }
}
```

토큰 계층은 다음 네 층으로 둔다.

- `primitive`: 색상 팔레트, 폰트 패밀리, raw spacing scale
- `semantic`: text, surface, border, action, danger 같은 의미 토큰
- `component`: button, input, modal 등 컴포넌트 전용 토큰
- `theme`: landing, dashboard, custom, light, dark mode override

폰트 패밀리 토큰의 `$value`는 렌더러와 타이포그래피 토큰에서 참조하기 쉬운 family name 또는 alias로 유지한다. 에디터에서 첨부한 실제 폰트 파일은 `$extensions.podo.fontAsset`에 `woff`, `woff2`, `ttf`, `otf` 메타데이터와 base64 data URL로 저장해 DTCG 토큰 값 모델을 깨뜨리지 않고 JSON 단일 원천에 포함한다.

### 6.2 컴포넌트 스펙

컴포넌트는 `.component.json`으로 정의한다.

```json
{
  "id": "button",
  "name": "Button",
  "category": "atom",
  "status": "stable",
  "anatomy": ["root", "icon", "label", "loader"],
  "slots": [
    { "name": "leftIcon", "required": false },
    { "name": "children", "required": true },
    { "name": "rightIcon", "required": false }
  ],
  "props": [
    { "name": "variant", "type": "enum", "values": ["solid", "soft", "outline", "ghost"] },
    { "name": "size", "type": "enum", "values": ["sm", "md", "lg"] },
    { "name": "disabled", "type": "boolean" }
  ],
  "states": ["hover", "active", "focusVisible", "disabled", "loading"],
  "tokens": {
    "root.background": "{component.button.background}",
    "root.radius": "{radius.control.md}"
  },
  "targets": {
    "web": true,
    "react": true,
    "hono": true,
    "native": true
  }
}
```

### 6.3 아이콘 스펙

아이콘은 SVG 원본, 그룹, 코드포인트, 폰트 산출물을 분리한다.

```json
{
  "fontFamily": "PodoIcons",
  "groups": {
    "navigation": ["chevron-left", "chevron-right", "menu"],
    "editor": ["bold", "italic", "align-left"]
  },
  "icons": {
    "chevron-left": {
      "source": "svg/navigation/chevron-left.svg",
      "codepoint": "E001",
      "tags": ["arrow", "navigation"]
    }
  }
}
```

웹은 `woff`를 기본 산출물로 제공한다. 호환성과 성능을 위해 `woff2`도 함께 만들 수 있다. React Native는 WOFF를 직접 쓰기 어렵기 때문에 같은 SVG 원본에서 native용 glyph map 또는 SVG 컴포넌트를 함께 생성한다.

## 7. 설치 프로젝트의 `.podo` 구조

```text
.podo/
├── config.json            # environment, dark mode, selected themes
├── lock.json              # installed podo version, schema version, migration state
├── tokens/
│   └── overrides.tokens.json
├── themes/
│   ├── landing.theme.json
│   ├── dashboard.theme.json
│   └── custom.theme.json
├── components/
│   └── local/*.component.json
├── icons/
│   ├── groups.json
│   └── svg/
├── generated/             # generated code, ignored by default if project wants
└── cache/
```

초기 설정 예시는 다음과 같다.

```json
{
  "schemaVersion": "2.0.0",
  "environment": "react",
  "darkMode": {
    "enabled": true,
    "strategy": "class"
  },
  "themes": {
    "default": "dashboard",
    "available": ["landing", "dashboard"]
  },
  "build": {
    "targets": ["react"],
    "outDir": "src/podo"
  }
}
```

## 8. 빌드 도구

CLI 이름은 `podo`로 둔다.

```bash
podo init
podo ui
podo build --target web
podo build --target react
podo build --target hono
podo build --target native
podo update
podo migrate
podo validate
podo mcp
```

### 8.1 빌드 입력 순서

1. 패키지 내 기본 스펙 로드
2. 설치 프로젝트의 `.podo/config.json` 로드
3. `.podo/tokens`, `.podo/themes`, `.podo/components`, `.podo/icons` 오버라이드 병합
4. JSON schema와 Zod로 검증
5. token reference와 component token binding 해석
6. 타깃별 산출물 생성

### 8.2 타깃별 산출물

| Target | Output                                             | 비고                                                  |
| ------ | -------------------------------------------------- | ----------------------------------------------------- |
| web    | Custom Elements, CSS variables, icon font CSS      | 표준 Web Component와 slot 우선                        |
| react  | React TSX, hooks, typed props                      | Web Component wrapper 또는 native React renderer 선택 |
| hono   | Hono TSX, SSR helpers, critical CSS                | hydration 없는 컴포넌트를 1차 지원                    |
| native | React Native TSX, token JS objects, theme provider | DOM slot은 named prop으로 변환                        |

### 8.3 Legacy Grid Compatibility

그리드 시스템은 v1의 `scss/layout/grid.scss` 동작을 그대로 유지한다. v2 토큰 시스템으로 재설계하거나 클래스 이름을 바꾸지 않는다.

유지해야 하는 계약:

- PC 12 columns, tablet 6 columns, mobile 4 columns
- `.grid` container
- `.grid-fix-{2..6}` fixed column helpers
- direct child `.w-{1..12}` column span helpers
- direct child `.w-full`
- fraction helpers `.w-{n}_{d}`
- non-grid child width helpers
- pixel width helpers `.w-{0..5000}px`
- gap/padding은 기존 spacing scale 기준: PC `s(6)` 24px, tablet/mobile `s(5)` 16px

v2에서는 이 grid를 `@podo/web` 또는 호환 CSS 산출물에서 그대로 제공하고, 새 JSON 기반 layout/token 시스템과 별도로 취급한다. grid 관련 변경은 bug fix 외에는 breaking change로 본다.

## 9. 테마 전략

기본 제공 테마는 `landing`, `dashboard` 두 개로 시작한다.

- `landing`: 큰 display scale, 넓은 spacing, 콘텐츠 중심 rhythm
- `dashboard`: 작은 heading scale, 높은 정보 밀도, 폼/테이블 중심 spacing

같은 `h1`, `body` 이름이라도 theme scope가 다르면 다른 값을 가질 수 있다.

```text
typography.h1
├── landing: 64/72, weight 700
└── dashboard: 28/36, weight 600
```

웹 런타임에서는 `data-podo-theme`와 `data-color-scheme` 속성으로 CSS variables를 전환한다.

```html
<html data-podo-theme="dashboard" data-color-scheme="dark"></html>
```

React Native는 `PodoThemeProvider`가 같은 theme JSON을 읽어 JS 객체로 제공한다.

설치 프로젝트의 경량 Web UI는 초기 설정에서 다음을 처리한다.

- 환경 선택: web, react, hono, react-native
- 기본 테마 선택: landing, dashboard, custom
- 다크모드 사용 여부와 전략 선택
- 생성 경로 선택
- 프로젝트 framework별 bootstrap 파일 생성

## 10. 편집 도구

편집 도구는 두 모드로 제공한다.

| 모드                 | 실행            | 저장 위치                            |
| -------------------- | --------------- | ------------------------------------ |
| Design System Editor | repo dev server | `packages/tokens`, `packages/*/spec` |
| Project Studio       | `podo ui`       | 설치 프로젝트 `.podo`                |

공통 기능은 다음과 같다.

- 토큰 편집: color, typography, spacing, radius, shadow, motion
- 테마 편집: landing/dashboard/custom, light/dark mode matrix
- 컴포넌트 편집: props, variants, slots, states, token binding
- 아이콘 편집: 그룹 관리, SVG 업로드, 코드포인트 잠금, 폰트 재빌드
- 캔버스 미리보기: 컴포넌트 배치, variant state preview, responsive preview
- 타깃 미리보기: web/react/hono/native 산출물 diff
- 검증: schema error, broken token reference, missing slot renderer

초기 MVP는 Figma 전체 기능이 아니라 "Podo 스펙을 안전하게 편집하는 도구"로 제한한다. Figma 연동은 변수 import/export와 GitHub sync부터 시작한다.

## 11. 컴포넌트 파일 분리 원칙

기능이 들어가는 컴포넌트는 단일 책임 원칙에 따라 다음처럼 나눈다.

```text
button/
├── button.component.json
├── index.ts
├── props.ts
├── anatomy.ts
├── tokens.ts
├── behavior.ts
├── accessibility.ts
├── render.web.ts
├── render.react.tsx
├── render.hono.tsx
├── render.native.tsx
├── button.test.ts
└── button.visual.spec.ts
```

예를 들어 DatePicker처럼 기능이 큰 컴포넌트는 달력 계산, 선택 상태, 키보드 이동, 포맷팅, 렌더러를 반드시 분리한다.

```text
datepicker/
├── calendar-model.ts
├── date-selection.ts
├── keyboard-navigation.ts
├── format.ts
├── render.*
└── *.test.ts
```

## 12. 업데이트 반영 전략

설치 프로젝트가 디자인 시스템 업데이트를 빠르게 반영하려면 자동 덮어쓰기가 아니라 관리 가능한 업데이트 흐름이 필요하다.

`podo update`는 다음 순서로 동작한다.

1. 현재 `.podo/lock.json`의 Podo 버전과 schema version 확인
2. 새 패키지의 `migration-manifest.json` 확인
3. `.podo` 오버라이드와 새 기본 스펙의 diff 계산
4. 자동 적용 가능한 변경과 충돌 변경 분리
5. dry-run 리포트 출력
6. 사용자가 승인하면 migration 적용
7. `podo build` 실행

마이그레이션은 JSON Patch 형태로 관리하고, Podo 전용 operation은 runner에서 JSON Patch로 컴파일한다.

```json
{
  "from": "2.1.0",
  "to": "2.2.0",
  "operations": [{ "op": "renameToken", "from": "color.text.body", "to": "color.text.default" }]
}
```

Phase 7의 기본 구현은 `@podo/migration`을 공통 계층으로 두고 CLI와 Studio가 같은 dry-run plan, conflict detector, lockfile update 로직을 사용한다. 적용 범위는 `.podo` JSON 상태로 제한하고 rollback은 VCS 기반으로 수행한다.

## 13. MCP 설계

MCP 서버는 npm package에 포함한다. 기존 `main`의 `podo-ui-mcp`처럼 `bin`으로 실행할 수 있어야 한다.

```bash
claude mcp add podo -- npx podo mcp
```

1차 도구:

- `get_system_overview`: 설치된 Podo 버전, 타깃, 테마, 사용 가능한 컴포넌트 조회
- `search_tokens`: 토큰 이름/역할/값 검색
- `get_token`: 토큰 상세와 resolved value 조회
- `search_components`: 컴포넌트 이름, category, slot, prop 기준 검색
- `get_component_spec`: 컴포넌트 JSON 스펙 조회
- `get_component_example`: 타깃별 사용 예시 조회
- `validate_podo_project`: `.podo` 설정과 스펙 검증
- `suggest_component_spec`: 새 컴포넌트 스펙 초안 생성
- `explain_migration`: 업데이트 시 변경점 설명

쓰기 작업은 기본적으로 하지 않는다. 파일을 생성하거나 변경하는 MCP 도구는 `write_*` prefix를 붙이고, CLI와 동일한 validation/dry-run을 통과해야 한다.

## 14. 배포 전략

- npm 패키지 배포는 `main` 브랜치의 `prepublishOnly`와 `exports` 설계를 참고한다.
- v2는 `@podo/*` scoped package를 권장한다.
- Changesets로 버전, changelog, publish를 관리한다.
- `main` 브랜치 직접 설치는 canary 검증 용도로만 둔다.

패키지 후보:

```text
@podo/spec
@podo/tokens
@podo/icons
@podo/web
@podo/react
@podo/hono
@podo/native
@podo/cli
@podo/editor
@podo/mcp
```

단일 패키지 배포가 필요하면 `podo-ui`의 subpath export로 제공한다.

## 15. 단계별 로드맵

### Phase 0: 저장소 기반 작업

- pnpm workspace 기반 모노레포 초기화
- root package, TypeScript, lint/format/test 설정
- Changesets 초기화
- main 브랜치 배포 구조 분석 결과 반영
- 패키지 네이밍 최종 결정

완료 기준: `@podo/*` 패키지 골격이 workspace에서 인식되고 `pnpm check`, `pnpm build`가 통과한다.

### Phase 1: 스펙 고정

- DTCG 기반 token schema 작성
- component schema 작성
- icon group schema 작성
- `.podo/config.json` schema 작성
- schema validation test 작성

완료 기준: 샘플 Button, Input, Typography, Color, Icon 그룹이 JSON만으로 검증된다.

### Phase 2: 토큰과 아이콘 빌드

- token resolver 구현
- CSS variables, TS token object, RN token object 생성
- SVG to WOFF 아이콘 빌드 구현
- icon manifest와 stable codepoint lock 구현

완료 기준: landing/dashboard, light/dark 토큰이 web/react/native에서 같은 값으로 resolved 된다.

### Phase 3: 컴포넌트 코드 생성 MVP

- Button, Input, Field, Icon, Typography 컴포넌트 스펙 작성
- `@podo/core`에 component registry, renderer contract, a11y helper, behavior helper를 둔다.
- web renderer 작성
- web renderer는 dependency-free Custom Elements로 구현한다.
- react renderer는 Web Component wrapper가 아닌 native React renderer로 구현한다.
- hono renderer는 Hono TSX 기반 정적 SSR renderer를 1차 범위로 둔다.
- native renderer는 React Native host adapter 기반으로 Pressable/Text/TextInput/View를 주입 가능하게 구현한다.
- `@podo/codegen`은 component spec에서 target별 generated file과 barrel을 결정적으로 만든다.

완료 기준: 네 타깃 예제 앱에서 같은 스펙의 Button/Input을 렌더링한다.

### Phase 4: CLI와 `.podo`

- `podo init` 구현
  - non-interactive 옵션과 최소 interactive wizard를 함께 제공한다.
  - `.podo/config.json`, `.podo/lock.json`, tokens/themes/components/icons/generated/cache/bootstrap 구조를 만든다.
- `podo build` 구현
  - token, icon, component target files를 생성하고 `--dry-run`, `--target`, `--out-dir`, build cache를 제공한다.
- `podo validate` 구현
  - config, lock, token, component, icon manifest를 검증하고 JSON report를 출력할 수 있다.
- framework별 bootstrap generator 구현
- `.podo/lock.json` 구현

완료 기준: 빈 React/Hono/RN 프로젝트에 설치 후 `podo init && podo build`가 동작한다.

### Phase 5: 경량 Web UI

- `@podo/studio`는 Hono 기반 local server와 dependency-light single page UI를 제공한다.
- `podo ui`는 CLI의 `init`, `build`, `validate` 함수를 Studio action으로 주입한다.
- file API는 `.podo` 내부 JSON/SVG만 읽고 쓸 수 있으며, JSON schema validation과 SVG script 차단을 먼저 수행한다.
- 초기 설정 wizard는 environment, theme, dark mode, outDir, icon groups를 저장하고 첫 build를 실행한다.
- token/theme editor는 resolved token 목록, color swatch, typography/spacing/radius 편집, token reference picker를 제공한다.
- component editor는 package default와 project local component를 구분하고 props, variants, states, slots를 표시한다.
- gnb/lng 슬롯형 local component template을 `.podo/components/local`에 생성할 수 있다.
- icon editor는 group JSON 관리, SVG import, codepoint preview, icon rebuild action을 제공한다.
- build 화면은 dry-run file plan, validation result, generated target preview를 보여준다.

완료 기준: UI에서 테마를 수정하고 build하면 설치 프로젝트에 즉시 반영된다.

### Phase 6: MCP

- `@podo/mcp`는 `@modelcontextprotocol/sdk` 기반 stdio server를 제공한다.
- `podo mcp`와 `podo-mcp` bin으로 서버를 실행할 수 있다.
- MCP data loader는 package default token/component/icon spec과 설치 프로젝트 `.podo` override를 함께 읽는다.
- tool registration은 overview, token, component, validation/migration, suggest tool 파일로 분리한다.
- read tools는 `get_system_overview`, `search_tokens`, `get_token`, `search_components`, `get_component_spec`, `get_component_example`, `validate_podo_project`, `explain_migration`을 제공한다.
- `suggest_component_spec`은 파일을 쓰지 않고 draft component JSON만 반환한다.
- write tool 정책은 `write_*`, dry-run, `.podo` 경로 제한, validation-before-write를 요구한다.
- Claude Code, Codex 사용 가이드와 prompt examples를 문서화한다.

완료 기준: AI 도구가 MCP를 통해 Podo 컴포넌트와 토큰을 조회하고 정확한 import/props로 코드를 작성할 수 있다.

### Phase 7: 업데이트와 마이그레이션

- migration manifest schema 작성
- `podo update --dry-run` 구현
- conflict detector 구현
- migration UI 구현
- rollback 전략 문서화

완료 기준: 설치 프로젝트의 `.podo` 오버라이드를 보존하면서 업데이트 변경점을 dry-run과 migration report로 설명할 수 있다.

### Phase 8: 고급 편집 도구

- tldraw 기반 canvas
- component drag/drop
- slot composition
- responsive preview
- Figma variables import/export

Phase 8의 기본 구현은 `@podo/editor`가 tldraw custom shape prototype과 순수 JSON 편집 모델을 함께 제공한다. canvas 결과는 우선 `.component.json`으로 export하고, layout/page schema 경계는 `docs/editor-workflow.md`에 분리 기준을 남긴다. Figma sync는 브라우저 직접 push가 아니라 GitHub Action PR 흐름으로 운영한다.

완료 기준: 에디터에서 만든 컴포넌트/레이아웃 스펙이 JSON으로 저장되고 네 타깃 중 최소 web/react로 빌드된다.

### Phase 9: 예제와 문서

- web/react/hono/native 예제 작성
- 설치, 토큰, 컴포넌트 스펙, 아이콘, 업데이트, MCP 가이드 작성

완료 기준: 새 프로젝트가 문서만 보고 설치, 초기 설정, 빌드, MCP 연결을 재현할 수 있다.

### Phase 10: 테스트와 품질 기준

- unit, visual regression, accessibility, build snapshot, parity, CLI e2e, Studio e2e, MCP integration test 작성
- package size와 performance budget 설정

완료 기준: 릴리스 전 품질 게이트가 자동화되고 각 패키지의 크기와 성능 목표가 문서화된다.

## 16. 주요 리스크와 대응

| 리스크                                           | 대응                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| DTCG 스펙이 draft라 변경 가능성이 있음           | Podo 전용 필드는 `$extensions.podo`에 격리하고, schema migration 계층을 둔다.                   |
| 네 타깃 컴포넌트 패리티 유지 비용이 큼           | 스펙과 behavior만 공유하고 renderer는 타깃별 책임으로 둔다. MVP 컴포넌트 수를 제한한다.         |
| React Native는 slot, CSS, WOFF 처리 방식이 다름  | slot은 named prop으로 변환하고, native icon 산출물은 같은 SVG 원본에서 별도 생성한다.           |
| Figma/Pencil 수준 편집툴 범위가 과도함           | 첫 버전은 스펙 에디터와 preview에 집중한다. 완전한 자유형 디자인툴은 Phase 6 이후로 둔다.       |
| 업데이트 시 프로젝트 커스텀이 깨질 수 있음       | lockfile, migration manifest, dry-run, diff UI를 필수로 둔다.                                   |
| MCP write tool의 보안 위험                       | 1차는 read-only 중심으로 제공하고, write tool은 명시적 dry-run과 경로 제한을 둔다.              |
| Hono SSR에서 Web Component hydration/FOUC 가능성 | Hono는 정적 TSX renderer를 우선 제공하고, interactive component는 별도 client entry를 요구한다. |

## 17. 바로 다음 작업

1. `package.json`, `pnpm-workspace.yaml`, TypeScript config를 생성한다.
2. `packages/spec`에 token/component/icon/theme/config schema를 만든다.
3. Button과 Typography 샘플 스펙을 작성한다.
4. `podo validate`의 최소 CLI를 만든다.
5. token resolver와 CSS variables 출력을 먼저 구현한다.
6. `main`의 MCP 구조를 참고해 v2 MCP skeleton을 만든다.

## 18. 참고 자료

- Design Tokens Format Module: https://www.designtokens.org/tr/drafts/format/
- Style Dictionary: https://styledictionary.com/
- Figma Plugin API - Variables: https://developers.figma.com/docs/plugins/working-with-variables/
- Figma variables GitHub sync example: https://github.com/figma/variables-github-action-example
- Model Context Protocol: https://modelcontextprotocol.io/specification/2025-06-18
- Web Components - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- Lit: https://lit.dev/
- Hono JSX: https://hono.dev/docs/guides/jsx
- React Native TypeScript: https://reactnative.dev/docs/typescript
- tldraw SDK: https://tldraw.dev/
- Pencil docs: https://docs.pencil.dev/
- pnpm workspaces: https://pnpm.io/workspaces
- Changesets: https://github.com/changesets/changesets
- Fantasticon: https://github.com/tancredi/fantasticon
