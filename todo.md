# Podo v2 Todo

기준 문서: `plan.md`
작성일: 2026-06-11

## 진행 규칙

- [x] 각 작업은 완료 기준을 만족할 때만 체크한다.
- [x] 스펙 변경은 반드시 schema, sample JSON, validation test를 함께 수정한다.
- [x] 생성물 변경은 source JSON에서 다시 빌드 가능한 상태여야 한다.
- [x] 설치 프로젝트용 기능은 `.podo` 경로 밖의 파일을 임의로 덮어쓰지 않는다.
- [x] 사용자 프로젝트에 쓰기 작업을 하는 CLI/MCP 기능은 dry-run과 diff 확인을 먼저 제공한다.

## Phase 0: 저장소 기반 작업

- [x] pnpm workspace 기반 모노레포 초기화
  - 완료 기준: `pnpm-workspace.yaml`이 있고 `packages/*`, `examples/*`가 workspace로 인식된다.
- [x] root `package.json` 생성
  - 완료 기준: `type: module`, 공통 scripts, package manager, repository, license가 정의된다.
- [x] TypeScript 공통 설정 생성
  - 완료 기준: root `tsconfig.base.json`과 패키지별 `tsconfig.json`이 연결된다.
- [x] lint/format/test 기본 도구 결정 및 설정
  - 완료 기준: `pnpm lint`, `pnpm typecheck`, `pnpm test` 명령이 존재한다.
- [x] Changesets 초기화
  - 완료 기준: `.changeset/config.json`이 생성되고 version/publish 흐름이 문서화된다.
- [x] main 브랜치 배포 구조 분석 결과 반영
  - 완료 기준: npm `exports`, `files`, `bin`, `prepublishOnly` 설계 초안이 root 또는 docs에 반영된다.
- [x] 패키지 네이밍 최종 결정
  - 완료 기준: `@podo/*` scoped package와 단일 `podo-ui` subpath export 중 1차 배포 전략이 확정된다.

## Phase 1: 스펙 고정

### Token Schema

- [x] DTCG 기반 token JSON schema 작성
  - 완료 기준: `$type`, `$value`, `$description`, `$extensions`, alias reference를 검증한다.
- [x] Podo 전용 token extension 정의
  - 완료 기준: `$extensions.podo.themeable`, `roles`, `scope`, `deprecated`, `migration` 필드가 타입화된다.
- [x] token category 구조 정의
  - 완료 기준: `primitive`, `semantic`, `component`, `theme` 계층이 문서화되고 샘플이 있다.
- [x] typography composite token 모델 정의
  - 완료 기준: fontFamily, fontSize, lineHeight, weight, letterSpacing, paragraphSpacing를 검증한다.
- [x] spacing/radius/shadow/motion token 모델 정의
  - 완료 기준: 단위, scale, alias, theme override가 검증된다.
- [x] color token 모델 정의
  - 완료 기준: hex, alpha, semantic alias, light/dark override가 검증된다.

### Component Schema

- [x] component JSON schema 작성
  - 완료 기준: id, name, category, status, anatomy, slots, props, states, tokens, targets를 검증한다.
- [x] props type system 정의
  - 완료 기준: boolean, string, number, enum, union, object, event handler 타입을 표현한다.
- [x] slot model 정의
  - 완료 기준: default slot, named slot, required slot, repeated slot, fallback을 표현한다.
- [x] variant/state model 정의
  - 완료 기준: variant 조합, state별 token binding, disabled/loading/focusVisible 상태를 표현한다.
- [x] anatomy model 정의
  - 완료 기준: root, label, icon, helper 등 part 이름과 target별 매핑을 표현한다.
- [x] target support model 정의
  - 완료 기준: web/react/hono/native 지원 여부와 제한 사항을 스펙에 표현한다.
- [x] accessibility spec model 정의
  - 완료 기준: role, aria, keyboard interaction, focus management 요구사항을 표현한다.

### Icon Schema

- [x] icon manifest schema 작성
  - 완료 기준: fontFamily, icons, codepoint, source, tags, groups를 검증한다.
- [x] icon group schema 작성
  - 완료 기준: 그룹 추가/삭제/정렬과 아이콘 중복 포함 규칙을 검증한다.
- [x] stable codepoint lock schema 작성
  - 완료 기준: 기존 아이콘의 codepoint가 의도 없이 바뀌지 않도록 lock 파일을 검증한다.

### .podo Schema

- [x] `.podo/config.json` schema 작성
  - 완료 기준: environment, darkMode, themes, build target, outDir를 검증한다.
- [x] `.podo/lock.json` schema 작성
  - 완료 기준: package version, schema version, migration state, generated hash를 검증한다.
- [x] `.podo` override merge 규칙 정의
  - 완료 기준: package default와 project override의 우선순위가 테스트된다.

### 샘플 스펙

- [x] Button 샘플 component spec 작성
  - 완료 기준: props, slots, variants, states, tokens, examples가 포함된다.
- [x] Input 샘플 component spec 작성
  - 완료 기준: value, invalid, disabled, helper/error 상태가 포함된다.
- [x] Field 샘플 component spec 작성
  - 완료 기준: label, description, error, required, control slot이 포함된다.
- [x] Typography 샘플 token spec 작성
  - 완료 기준: landing/dashboard h1/body 값 차이가 표현된다.
- [x] Color 샘플 token spec 작성
  - 완료 기준: light/dark semantic color가 표현된다.
- [x] Icon group 샘플 spec 작성
  - 완료 기준: navigation/editor 그룹과 codepoint lock이 표현된다.

### Validation

- [x] `@podo/spec` 패키지 생성
  - 완료 기준: schema, zod parser, TypeScript type export가 포함된다.
- [x] schema validation test 작성
  - 완료 기준: valid sample은 통과하고 invalid sample은 명확한 에러를 낸다.
- [x] reference validation 구현
  - 완료 기준: 존재하지 않는 token alias, circular reference, broken component token binding을 검출한다.
- [x] schema versioning 정책 작성
  - 완료 기준: breaking/non-breaking schema change 기준이 문서화된다.

## Phase 2: 토큰과 아이콘 빌드

### Token Resolver

- [x] `@podo/tokens` 패키지 생성
  - 완료 기준: token load, merge, resolve API가 export된다.
- [x] token file loader 구현
  - 완료 기준: package default와 `.podo/tokens`를 함께 로드한다.
- [x] alias resolver 구현
  - 완료 기준: `{color.primary}` 형태 참조와 JSON Pointer 참조를 해석한다.
- [x] theme resolver 구현
  - 완료 기준: landing/dashboard/custom, light/dark 조합의 resolved token set을 만든다.
- [x] component token resolver 구현
  - 완료 기준: component token이 primitive/semantic token을 참조해 최종 값으로 풀린다.
- [x] token validation CLI API 구현
  - 완료 기준: 중복 이름, 잘못된 단위, circular alias를 에러로 표시한다.

### Token Outputs

- [x] CSS variables 생성기 구현
  - 완료 기준: theme별 `[data-podo-theme]`, `[data-color-scheme]` CSS가 생성된다.
- [x] TypeScript token object 생성기 구현
  - 완료 기준: ESM import 가능한 typed token object가 생성된다.
- [x] React Native token object 생성기 구현
  - 완료 기준: RN에서 사용할 number/string 값이 단위 변환되어 생성된다.
- [x] token JSON bundle 생성기 구현
  - 완료 기준: MCP와 editor가 읽는 resolved JSON bundle이 생성된다.
- [x] sourcemap 또는 origin metadata 생성
  - 완료 기준: resolved 값이 어느 원본 파일/토큰에서 왔는지 추적된다.

### Legacy Grid Compatibility

- [x] 기존 grid 시스템 호환 산출물 구현
  - 완료 기준: v1 `scss/layout/grid.scss`의 `.grid`, `.grid-fix-{2..6}`, `.w-*`, `.w-full`, `.w-{n}_{d}`, `.w-{n}px` 동작과 12/6/4 컬럼 규칙을 유지하는 CSS/SCSS 산출물이 생성된다.
- [x] grid 호환성 테스트 작성
  - 완료 기준: 기존 grid 클래스와 PC/tablet/mobile column/gap/padding 규칙이 snapshot으로 고정된다.

### Icon Build

- [x] `@podo/icons` 패키지 생성
  - 완료 기준: icon manifest parser와 build API가 export된다.
- [x] SVG source 규칙 정의
  - 완료 기준: viewBox, currentColor, width/height 제거 규칙이 문서화된다.
- [x] SVG optimizer 도입
  - 완료 기준: 빌드 전에 SVG가 일관된 형태로 정리된다.
- [x] SVG to WOFF 빌드 구현
  - 완료 기준: `PodoIcons.woff`와 CSS font-face가 생성된다.
- [x] WOFF2 산출 여부 결정 및 구현
  - 완료 기준: 웹 성능을 위한 `woff2` 생성 여부가 결정되고 빌드에 반영된다.
- [x] icon class CSS 생성
  - 완료 기준: `.podo-icon-chevron-left::before` 또는 동등한 클래스가 생성된다.
- [x] TypeScript icon name union 생성
  - 완료 기준: React/Web 컴포넌트에서 icon name 자동완성이 된다.
- [x] React Native icon 산출물 생성
  - 완료 기준: RN용 glyph map 또는 SVG component 산출물이 생성된다.
- [x] icon group build 구현
  - 완료 기준: 특정 그룹만 포함한 subset font를 만들 수 있다.
- [x] codepoint lock 검증 구현
  - 완료 기준: 기존 아이콘 codepoint 변경 시 빌드가 실패한다.

### Build 검증

- [x] landing/dashboard light/dark 토큰 빌드 테스트
  - 완료 기준: 네 조합의 CSS/TS/RN 출력 snapshot이 생성된다.
- [x] icon font snapshot 테스트
  - 완료 기준: manifest, CSS, font metadata가 안정적으로 생성된다.
- [x] 빌드 성능 기준 설정
  - 완료 기준: token/icon build 최대 실행 시간이 문서화된다.

## Phase 3: 컴포넌트 코드 생성 MVP

### 공통 Core

- [x] `@podo/core` 패키지 생성
  - 완료 기준: 공통 state, interaction, a11y helper를 export한다.
- [x] component registry 구현
  - 완료 기준: component spec을 이름/category/target으로 조회할 수 있다.
- [x] renderer contract 정의
  - 완료 기준: web/react/hono/native renderer가 구현해야 할 인터페이스가 문서화된다.
- [x] accessibility helper 구현
  - 완료 기준: id 연결, aria-describedby, focusVisible, keyboard handler를 재사용한다.
- [x] state machine 또는 behavior module 패턴 확정
  - 완료 기준: 기능성 컴포넌트가 behavior와 renderer를 분리한다.

### Web Components

- [x] `@podo/web` 패키지 생성
  - 완료 기준: Custom Element 등록 API와 CSS import가 제공된다.
- [x] Web Component 기반 기술 확정
  - 완료 기준: Lit 사용 여부와 직접 Custom Element 구현 범위가 문서화된다.
- [x] Button web renderer 구현
  - 완료 기준: slots, variants, states, CSS variables가 동작한다.
- [x] Input web renderer 구현
  - 완료 기준: value, disabled, invalid, focus 상태가 동작한다.
- [x] Field web renderer 구현
  - 완료 기준: label/helper/error/control slot과 aria 연결이 동작한다.
- [x] Icon web renderer 구현
  - 완료 기준: icon font와 group subset을 사용할 수 있다.
- [x] Typography web renderer 구현
  - 완료 기준: theme별 typography token이 적용된다.
- [x] Web Component visual tests 작성
  - 완료 기준: 기본/variant/theme/dark mode 스냅샷이 있다.

### React

- [x] `@podo/react` 패키지 생성
  - 완료 기준: React entry와 typed component exports가 제공된다.
- [x] React 구현 전략 확정
  - 완료 기준: Web Component wrapper와 native React renderer 중 MVP 전략이 결정된다.
- [x] Button React renderer 구현
  - 완료 기준: typed props, ref, event handler, icon slots가 동작한다.
- [x] Input React renderer 구현
  - 완료 기준: controlled/uncontrolled value와 a11y 연결이 동작한다.
- [x] Field React renderer 구현
  - 완료 기준: children control과 error/helper UI가 동작한다.
- [x] React hooks 또는 provider 구현
  - 완료 기준: theme provider와 color scheme 전환 API가 제공된다.
- [x] React tests 작성
  - 완료 기준: Testing Library 기반 interaction 테스트가 통과한다.

### Hono TSX

- [x] `@podo/hono` 패키지 생성
  - 완료 기준: Hono JSX에서 import 가능한 TSX 컴포넌트를 제공한다.
- [x] Hono renderer 범위 확정
  - 완료 기준: SSR/정적 컴포넌트와 interactive 컴포넌트의 경계가 문서화된다.
- [x] Button Hono renderer 구현
  - 완료 기준: class/style/token이 SSR HTML로 출력된다.
- [x] Input Hono renderer 구현
  - 완료 기준: form attribute와 a11y 속성이 SSR HTML에 반영된다.
- [x] Field Hono renderer 구현
  - 완료 기준: label/helper/error 연결이 SSR HTML에 반영된다.
- [x] Hono critical CSS helper 구현
  - 완료 기준: 초기 theme CSS와 dark mode script 삽입 방식이 제공된다.
- [x] Hono examples 작성
  - 완료 기준: Hono 앱에서 `c.render` 또는 JSX 응답으로 동작한다.

### React Native

- [x] `@podo/native` 패키지 생성
  - 완료 기준: RN entry와 typed component exports가 제공된다.
- [x] RN token adapter 구현
  - 완료 기준: px/rem 등 웹 단위가 RN number/string으로 변환된다.
- [x] RN theme provider 구현
  - 완료 기준: landing/dashboard, light/dark 전환이 가능하다.
- [x] Button native renderer 구현
  - 완료 기준: Pressable 기반 variants/states가 동작한다.
- [x] Input native renderer 구현
  - 완료 기준: TextInput 기반 value/error/disabled가 동작한다.
- [x] Field native renderer 구현
  - 완료 기준: label/helper/error와 accessibilityLabel 연결이 동작한다.
- [x] Icon native renderer 구현
  - 완료 기준: SVG 또는 glyph map 방식으로 아이콘이 표시된다.
- [x] RN example app 작성
  - 완료 기준: Expo 또는 RN 샘플에서 기본 컴포넌트가 렌더링된다.

### Codegen

- [x] `@podo/codegen` 또는 내부 codegen 모듈 생성
  - 완료 기준: component spec에서 target별 파일을 생성할 수 있다.
- [x] codegen template 구조 작성
  - 완료 기준: renderer별 template와 shared helper가 분리된다.
- [x] generated file header 정책 작성
  - 완료 기준: 생성 파일임을 표시하고 수동 수정 금지 안내가 들어간다.
- [x] codegen idempotency 테스트 작성
  - 완료 기준: 같은 입력으로 두 번 빌드해도 diff가 없다.

## Phase 4: CLI와 `.podo`

### CLI Foundation

- [x] `@podo/cli` 패키지 생성
  - 완료 기준: `podo` bin이 로컬에서 실행된다.
- [x] CLI command router 구현
  - 완료 기준: `init`, `build`, `validate`, `ui`, `update`, `migrate`, `mcp` 명령이 등록된다.
- [x] project root 탐색 구현
  - 완료 기준: package.json 또는 git root 기준으로 설치 프로젝트 루트를 찾는다.
- [x] config loader 구현
  - 완료 기준: `.podo/config.json`이 없을 때 명확한 안내를 출력한다.
- [x] CLI logging/error format 정의
  - 완료 기준: validation error, warning, next action이 읽기 쉽게 출력된다.

### Init

- [x] `podo init` 인터랙티브 wizard 구현
  - 완료 기준: environment, theme, dark mode, outDir를 설정한다.
- [x] non-interactive init 옵션 구현
  - 완료 기준: CI나 템플릿에서 `podo init --target react --theme dashboard`가 동작한다.
- [x] `.podo` 디렉토리 생성 구현
  - 완료 기준: config, lock, tokens, themes, components, icons, generated, cache 구조를 만든다.
- [x] framework 감지 구현
  - 완료 기준: React, Hono, React Native 프로젝트를 package.json 기반으로 추정한다.
- [x] framework별 bootstrap 파일 생성
  - 완료 기준: React provider, Hono CSS helper, RN provider 연결 예시를 만든다.

### Build

- [x] `podo build` 구현
  - 완료 기준: config target에 맞춰 token/icon/component build를 실행한다.
- [x] target별 build 옵션 구현
  - 완료 기준: `--target web|react|hono|native`가 동작한다.
- [x] outDir 쓰기 정책 구현
  - 완료 기준: `.podo/generated`와 프로젝트 지정 outDir 중 선택 가능하다.
- [x] build dry-run 구현
  - 완료 기준: 생성/수정/삭제될 파일 목록을 실제 쓰기 전에 볼 수 있다.
- [x] build cache 구현
  - 완료 기준: 입력 hash가 같으면 불필요한 재생성을 건너뛴다.

### Validate

- [x] `podo validate` 구현
  - 완료 기준: `.podo` config, tokens, themes, components, icons를 모두 검증한다.
- [x] validation report 파일 출력 옵션 구현
  - 완료 기준: JSON report를 CI에서 사용할 수 있다.
- [x] schema mismatch 감지 구현
  - 완료 기준: lock schema version이 현재 패키지와 다르면 migrate 안내를 한다.

## Phase 5: 경량 Web UI

### Studio Foundation

- [x] `@podo/studio` 패키지 생성
  - 완료 기준: `podo ui`로 로컬 Web UI가 열린다.
- [x] Hono 또는 Vite 기반 로컬 서버 구현
  - 완료 기준: local file API와 frontend dev/build가 연결된다.
- [x] file API 구현
  - 완료 기준: `.podo` 파일 읽기/쓰기, validation, build 실행 API가 제공된다.
- [x] project context loader 구현
  - 완료 기준: 설치 프로젝트의 config, resolved tokens, component specs를 UI에 제공한다.
- [x] UI shell 구현
  - 완료 기준: navigation, status bar, validation panel, build button이 있다.

### Initial Setup UI

- [x] 초기 설정 wizard 화면 구현
  - 완료 기준: environment, theme, dark mode, outDir, icon groups를 설정할 수 있다.
- [x] framework 감지 결과 표시
  - 완료 기준: 자동 감지 결과와 수동 변경 옵션을 제공한다.
- [x] 설정 저장 및 build 실행 연결
  - 완료 기준: wizard 완료 후 `.podo/config.json` 저장과 첫 build가 실행된다.

### Token/Theme Editor

- [x] color token editor 구현
  - 완료 기준: palette/semantic/component token을 편집하고 preview할 수 있다.
- [x] typography editor 구현
  - 완료 기준: landing/dashboard/custom별 h1/body scale을 편집할 수 있다.
- [x] spacing/radius editor 구현
  - 완료 기준: scale과 component binding preview가 가능하다.
- [x] dark mode editor 구현
  - 완료 기준: light/dark 값을 나란히 비교하고 수정할 수 있다.
- [x] token reference picker 구현
  - 완료 기준: component token binding에 기존 token을 검색해 연결할 수 있다.

### Component Editor

- [x] component list/detail UI 구현
  - 완료 기준: 기본 컴포넌트와 project local component를 구분해 보여준다.
- [x] props editor 구현
  - 완료 기준: prop 추가/수정/삭제와 타입 검증이 가능하다.
- [x] variants/states editor 구현
  - 완료 기준: variant matrix와 state별 token binding을 편집할 수 있다.
- [x] slots editor 구현
  - 완료 기준: default/named/required slot을 편집하고 target별 매핑을 볼 수 있다.
- [x] local component 생성 UI 구현
  - 완료 기준: `.podo/components/local`에 새 component spec을 저장한다.
- [x] lng/gnb 등 슬롯형 컴포넌트 템플릿 구현
  - 완료 기준: navigation 계열 슬롯 컴포넌트를 생성하고 바로 build할 수 있다.

### Icon Editor

- [x] icon group manager 구현
  - 완료 기준: 그룹 생성/수정/삭제, 아이콘 이동/복사가 가능하다.
- [x] SVG upload/import 구현
  - 완료 기준: SVG 검증 후 `.podo/icons/svg`에 저장한다.
- [x] codepoint preview 구현
  - 완료 기준: codepoint lock 상태와 충돌을 UI에서 확인한다.
- [x] icon font rebuild action 구현
  - 완료 기준: UI에서 아이콘 빌드를 실행하고 결과를 preview한다.

### Diff/Build UI

- [x] build diff panel 구현
  - 완료 기준: 생성/수정/삭제 파일 diff를 확인할 수 있다.
- [x] validation panel 구현
  - 완료 기준: schema/reference/build error를 위치와 함께 보여준다.
- [x] target preview 구현
  - 완료 기준: web/react/hono/native 산출물 일부를 UI에서 확인한다.

## Phase 6: MCP

### MCP Server

- [x] `@podo/mcp` 패키지 생성
  - 완료 기준: MCP stdio server가 실행된다.
- [x] `podo mcp` CLI 연결
  - 완료 기준: `npx podo mcp` 또는 동등한 명령으로 서버가 시작된다.
- [x] MCP data loader 구현
  - 완료 기준: package default와 설치 프로젝트 `.podo` 정보를 함께 읽는다.
- [x] MCP tool registration 구조 구현
  - 완료 기준: 도구별 파일이 분리되고 테스트 가능하다.

### Read Tools

- [x] `get_system_overview` 구현
  - 완료 기준: version, targets, themes, components, config summary를 반환한다.
- [x] `search_tokens` 구현
  - 완료 기준: 이름, 역할, 타입, 값으로 토큰을 검색한다.
- [x] `get_token` 구현
  - 완료 기준: 원본 값, resolved 값, theme별 값, origin metadata를 반환한다.
- [x] `search_components` 구현
  - 완료 기준: name, category, slot, prop, target으로 검색한다.
- [x] `get_component_spec` 구현
  - 완료 기준: 특정 컴포넌트의 JSON 스펙을 반환한다.
- [x] `get_component_example` 구현
  - 완료 기준: web/react/hono/native별 사용 예시를 반환한다.
- [x] `validate_podo_project` 구현
  - 완료 기준: `.podo` 검증 결과를 MCP 응답으로 반환한다.
- [x] `explain_migration` 구현
  - 완료 기준: update 시 변경점과 충돌 가능성을 설명한다.

### Write/Suggest Tools

- [x] `suggest_component_spec` 구현
  - 완료 기준: 사용자 요구를 기반으로 component spec 초안을 반환하되 파일은 쓰지 않는다.
- [x] write tool 정책 작성
  - 완료 기준: `write_*` 도구는 dry-run, 경로 제한, validation을 반드시 거친다.
- [x] MCP 보안 가이드 작성
  - 완료 기준: Claude Code/Codex 등록 방법과 안전한 사용 범위를 문서화한다.

### AI 사용성

- [x] Claude Code 등록 문서 작성
  - 완료 기준: `claude mcp add podo -- npx podo mcp` 흐름이 검증된다.
- [x] Codex 사용 문서 작성
  - 완료 기준: MCP 또는 JSON fallback 경로가 문서화된다.
- [x] AI prompt examples 작성
  - 완료 기준: 컴포넌트 생성, 토큰 조회, migration 설명 예시가 있다.

## Phase 7: 업데이트와 마이그레이션

- [x] migration manifest schema 작성
  - 완료 기준: from/to version, operations, risk level, notes를 검증한다.
- [x] JSON Patch 기반 migration runner 구현
  - 완료 기준: renameToken, moveComponentProp, removeDeprecatedToken 등 기본 op가 동작한다.
- [x] `podo update --dry-run` 구현
  - 완료 기준: 새 버전과 현재 `.podo` 차이를 쓰기 없이 보고한다.
- [x] conflict detector 구현
  - 완료 기준: 사용자 override와 새 기본 스펙 변경이 충돌하면 명확히 표시한다.
- [x] migration UI 구현
  - 완료 기준: Studio에서 변경점, 자동 적용 가능 항목, 수동 처리 항목을 볼 수 있다.
- [x] lockfile update 구현
  - 완료 기준: migration 성공 후 `.podo/lock.json`이 갱신된다.
- [x] rollback 전략 문서화
  - 완료 기준: migration 전 backup 또는 git diff 기반 복구 방법이 안내된다.

## Phase 8: 고급 편집 도구

- [x] `@podo/editor` 패키지 생성
  - 완료 기준: 디자인 시스템 개발용 editor 앱이 실행된다.
- [x] tldraw 기반 canvas 도입 검증
  - 완료 기준: Podo component node를 custom shape로 렌더링하는 prototype이 있다.
- [x] component drag/drop 구현
  - 완료 기준: canvas에 컴포넌트를 배치하고 props를 수정할 수 있다.
- [x] slot composition 구현
  - 완료 기준: gnb/lng 같은 슬롯형 컴포넌트에 child component를 배치할 수 있다.
- [x] responsive preview 구현
  - 완료 기준: desktop/tablet/mobile viewport별 preview가 가능하다.
- [x] component spec export 구현
  - 완료 기준: canvas 편집 결과가 `.component.json`으로 저장된다.
- [x] layout/page spec 모델 검토
  - 완료 기준: 컴포넌트 스펙과 페이지 조합 스펙의 경계를 문서화한다.
- [x] Figma variables import 구현
  - 완료 기준: Figma 변수에서 token JSON으로 가져올 수 있다.
- [x] Figma variables export 구현
  - 완료 기준: token JSON을 Figma 변수로 내보내는 흐름이 검증된다.
- [x] GitHub sync 전략 검토
  - 완료 기준: Figma sync를 CI/GitHub Action으로 운영할 수 있는지 결정한다.

## Phase 9: 예제와 문서

- [x] web example 작성
  - 완료 기준: Custom Elements와 icon font, theme switching이 보인다.
- [x] React example 작성
  - 완료 기준: Provider, Button/Input/Field, dark mode가 보인다.
- [x] Hono example 작성
  - 완료 기준: SSR HTML, critical CSS, form example이 보인다.
- [x] React Native example 작성
  - 완료 기준: theme provider와 기본 컴포넌트가 보인다.
- [x] 설치 가이드 작성
  - 완료 기준: npm install, `podo init`, `podo build`, framework 연결이 설명된다.
- [x] 토큰 작성 가이드 작성
  - 완료 기준: DTCG 형식, alias, theme override, naming rule이 설명된다.
- [x] 컴포넌트 스펙 작성 가이드 작성
  - 완료 기준: props, slots, variants, states, a11y, target support 작성법이 설명된다.
- [x] 아이콘 가이드 작성
  - 완료 기준: SVG 준비, group, codepoint lock, woff build 사용법이 설명된다.
- [x] 업데이트/마이그레이션 가이드 작성
  - 완료 기준: `podo update`, dry-run, conflict 처리 방법이 설명된다.
- [x] MCP 사용 가이드 작성
  - 완료 기준: Claude Code/Codex에서 사용할 수 있는 도구와 예시가 설명된다.

## Phase 10: 테스트와 품질 기준

- [x] unit test 기준 수립
  - 완료 기준: schema, resolver, codegen, CLI 핵심 로직에 테스트가 있다.
- [x] visual regression test 기준 수립
  - 완료 기준: web/react 컴포넌트의 theme/variant snapshot이 있다.
- [x] accessibility test 기준 수립
  - 완료 기준: 기본 컴포넌트에 role/aria/keyboard interaction 테스트가 있다.
- [x] build output snapshot 기준 수립
  - 완료 기준: token/icon/component 산출물이 snapshot으로 검증된다.
- [x] cross-target parity test 작성
  - 완료 기준: 같은 spec이 web/react/hono/native에서 의미상 같은 props와 token을 사용한다.
- [x] CLI e2e test 작성
  - 완료 기준: temp project에서 `podo init/build/validate/update`가 실행된다.
- [x] Studio e2e test 작성
  - 완료 기준: 설정 변경, token 변경, build 실행 workflow가 Playwright로 검증된다.
- [x] MCP integration test 작성
  - 완료 기준: MCP tools가 sample `.podo` 프로젝트에서 올바른 응답을 반환한다.
- [x] package size budget 설정
  - 완료 기준: web/react/native/cli/mcp 패키지의 목표 크기가 문서화된다.
- [x] performance budget 설정
  - 완료 기준: token build, component build, Studio initial load 목표 시간이 문서화된다.

## 릴리스 준비 체크리스트

- [x] 모든 package `exports` 검증
- [x] ESM/CJS 지원 범위 결정 및 문서화
- [x] TypeScript declaration 출력 검증
- [x] npm `files` 필드 검증
- [x] bin 실행 권한 검증
- [x] `prepublishOnly` 또는 CI publish pipeline 검증
- [x] Changesets version/publish dry-run 검증
- [x] README 작성
- [x] CHANGELOG 생성
- [x] license 포함
- [x] example projects build 검증
- [x] MCP 패키지 실행 검증
- [x] canary 배포 전략 문서화

## 1차 MVP 완료 기준

- [x] JSON token/component/icon/config schema가 있다.
- [x] Button, Input, Field, Icon, Typography 샘플 스펙이 있다.
- [x] landing/dashboard와 light/dark token build가 된다.
- [x] icon woff와 manifest가 생성된다.
- [x] web/react/hono/native 중 최소 web/react/hono Button이 렌더링된다.
- [x] `podo init`, `podo validate`, `podo build`가 동작한다.
- [x] `.podo` 설정이 생성되고 build 산출물에 반영된다.
- [x] MCP read tools로 token/component 조회가 가능하다.
- [x] 설치 가이드와 MCP 사용 가이드가 있다.

## 2차 MVP 완료 기준

- [x] React Native 기본 컴포넌트가 동작한다.
- [x] Studio에서 초기 설정과 token/theme 편집이 가능하다.
- [x] Studio에서 component slot/variant 편집이 가능하다.
- [x] Studio에서 icon group 관리와 rebuild가 가능하다.
- [x] `podo update --dry-run`과 migration report가 동작한다.
- [x] Claude Code/Codex가 MCP로 Podo 스펙을 조회해 코드 작성에 활용할 수 있다.

## 보류하거나 나중에 결정할 항목

- [x] Web Component 구현을 Lit으로 고정할지 직접 Custom Element로 갈지 결정
- [x] React를 Web Component wrapper로 만들지 native React renderer로 만들지 결정
- [x] Hono에서 Declarative Shadow DOM을 공식 지원 범위에 넣을지 결정
- [x] React Native 아이콘을 font glyph로 갈지 SVG component로 갈지 결정
- [x] 단일 `podo-ui` 패키지와 `@podo/*` 멀티 패키지 배포 중 1차 전략 결정
- [x] Figma 연동을 plugin, REST sync, GitHub Action 중 어디까지 1차 지원할지 결정
- [x] Editor canvas를 tldraw로 고정할지 다른 canvas SDK도 비교할지 결정

## Claude 보고서 기반 보정 작업

- [x] P0: editor 변경 안정화
  - 완료 기준: `legacy-fixtures.ts`, `spec-editing.ts`, editor UI 변경이 의도된 프로덕션 코드로 포함되고 `pnpm check`가 통과한다.
  - 완료 기준: Claude CLI가 현재 P0 범위를 엄격히 리뷰하고 차단 이슈가 없다고 확인한다.
- [x] P1: 테마와 기존 grid 반영 보강
  - 완료 기준: v2 수정 범위의 기본 color scheme은 `light`, `dark`, `auto`로 명확히 제한하고 editor preview/spec에서 전환 가능하다.
  - 완료 기준: 기존 v1 grid 시스템은 새 토큰 재설계 없이 호환 산출물/문서/테스트 기준으로 유지됨이 editor 보정 범위에서도 확인된다.
- [x] P2: Button spec 완성
  - 완료 기준: 기존 Button의 theme, variant, size, state, alignment 조합이 JSON spec과 editor preview/test에 반영된다.
  - 완료 기준: Button 기본값과 token binding이 v1 문서/SCSS 기준과 충돌하지 않는다.
- [x] P3: 기존 컴포넌트 spec fixture 확장
  - 완료 기준: v1 `public/ai/components`에 있던 주요 컴포넌트가 최소 JSON spec fixture로 이식되고 editor 목록/검색/preview에서 참조 가능하다.
  - 완료 기준: 누락 컴포넌트 목록과 의도적으로 보류한 범위가 문서화된다.
- [x] P4: 설치 프로젝트 반영 플로우 연결 검증
  - 완료 기준: editor export 결과가 `.podo` 기반 project override/build/update 흐름으로 이어지는 경로가 CLI/Studio 문서와 테스트로 검증된다.
  - 완료 기준: dry-run, validation, diff 확인 없이 설치 프로젝트 파일을 덮어쓰지 않는다.
