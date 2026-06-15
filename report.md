# Podo v2 통합 에디터 리디자인 리포트

- **작성일**: 2026-06-15
- **브랜치**: `v2`
- **대상**: `@podo/editor`(React+tldraw), `@podo/studio`(Hono+vanilla JS) — 토큰/컴포넌트 편집 UI 전반
- **방법**: Claude(코드 정밀분석 + 레퍼런스 리서치 + 설계 판정단 + 적대적 검증 워크플로우 22 에이전트), Codex(`gpt-5.5`), Agy 세 엔진을 병렬 리서치하고 본 문서에서 종합. 모든 핵심 주장은 실제 코드로 재검증.
- **기준 문서**: `plan.md`(특히 §5, §9, §10, §12), `AGENTS.md`, `todo.md`
- **참고**: 이전 마이그레이션 리뷰 문서는 `report.migration-review.md`로 백업됨.

---

## 0. 목표 비전 (사용자 결정사항)

> 이 리포트는 일반론적 재설계가 아니라 **아래 확정된 비전을 향한** 설계다.

1. **통합 에디터 하나** — 두 UI(`@podo/editor`, `@podo/studio`)를 하나의 공유 편집 엔진으로 합친다.
2. **podo-ui 저장소 내부 (개발 컨텍스트 A)** = **토큰 + 컴포넌트 수정만**.
3. **설치된 프로젝트 (컨텍스트 B, `podo ui`)** = 토큰 + 컴포넌트 + **페이지 디자인**까지.
4. **설치 프로젝트의 편집값** = 프로젝트(`.podo`)에 저장되고, **디자인 시스템 빌드 시 반영**되어야 한다.

`plan.md §10`은 이미 "두 UI는 같은 편집 엔진을 공유하되 저장 위치만 다르다"고 명시한다. 즉 이 비전은 새 요구가 아니라 **계획서가 의도했지만 구현이 어긋난 부분을 바로잡는 것**이다.

---

## 1. 한 장 요약 (TL;DR)

세 엔진의 결론이 수렴했다. 핵심은 다음과 같다.

- **새 패키지 `@podo/edit-core`(헤드리스) 하나만 추출하면 된다.** 전면 재작성이 아니다. `packages/editor/src/spec-editing.ts`는 이미 **순수 모듈**(React 훅 0개, `@podo/spec`만 import — 검증됨)이라 기계적으로 승격 가능하다. 여기에 ① 반응형 store ② 커밋 전 항상 `@podo/spec` 파서/검증을 재실행하는 **validation gate**를 얹는다.
- **두 호스트는 `SaveAdapter` 포트 + `capabilities` 플래그로 분기**한다. 현재의 느슨한 콜백(`onSpecsChange`/`onStateChange`, `index.tsx:256`)을 어댑터 주입으로 교체. 컨텍스트 A=repo-FS 어댑터(페이지 비활성), 컨텍스트 B=studio의 기존 `/api/*` 위 HTTP 어댑터(페이지 활성). 이것이 곧 `plan.md §10`의 "같은 엔진, 저장 위치만 다름"이다.
- **빌드 반영의 진실은 층위에 따라 다르다 (가장 중요한 발견):**
  - **토큰**: ✅ `.podo` → 빌드 반영이 **end-to-end로 이미 동작**. 에디터는 studio가 이미 호출하는 라우트를 부르기만 하면 된다.
  - **컴포넌트**: ⚠️ **파일 파이프라인은 연결되어 있으나(spec 저장·로드), codegen이 spec-driven이 아니다.** `generateComponentFiles`는 하드코딩된 런타임(`@podo/web`/`@podo/react`)의 **얇은 재export만** 방출한다(variant/state/token-binding 참조 0건 — 직접 grep 검증). 따라서 **컴포넌트의 variant/state/토큰 편집은 실제 빌드 출력에 반영되지 않는다.** 사용자 요구사항을 진짜로 만족시키려면 **spec-driven codegen**이 필요하다.
  - **페이지**: ❌ `@podo/spec`에 page/layout 스펙 자체가 **없다**. 완전한 신규 영역.
- **가장 ROI 높은 UX 한 방**: **타입 기반 reference picker**(Tokens Studio 패턴). `$type`으로 필터된 드롭다운이 `{dot.path}` alias를 써넣어 raw JSON 텍스트박스(`index.tsx:1604-1617`)와 raw 값 셀을 대체. 이 한 가지로 컨텍스트 A와 B의 편집 경험이 저장 대상만 빼고 동일해진다.
- **차단 제약 두 가지(반드시 인지):**
  - **tldraw 라이선스**: 에디터가 `tldraw: ^5.1.0` 고정(검증). v4+는 프로덕션 키 + "made with tldraw" 워터마크를 요구하는데 Podo는 MIT이고 서드파티 프로젝트에 설치된다. tldraw는 현재 **정적 import** → **지연 로드 + 컨텍스트 B 페이지 전용 청크**로 격리해야 한다.
  - **앱 번들 빌드 부재**: 에디터 `build`는 `tsc`(라이브러리 컴파일)이고 studio엔 React/`serveStatic` 의존이 없다(검증). "studio가 에디터 번들을 서빙"은 **신규 인프라**이며 `plan.md`의 "의존성 가벼운 단일 페이지 studio" 목표와 긴장 관계 → 명시적 게이트 단계로 두고 패리티 검증 전까지 vanilla UI를 폴백으로 유지.
- **권장 합성안**(세 판정 렌즈 일치): Pragmatic 골격(새 패키지 1개, 재작성 아닌 재배선, 기존 라우트 재사용) + Clean-Architecture 코어(store + validation gate + undo/redo) + Product/UX 표면(reference picker, capability 기반 내비, 영구 validation/저장대상 푸터). **연기**: 레거시 렌더러의 spec-driven 재작성, 멀티브랜드 theme-resolver, 페이지 — 모두 1차 목표의 임계경로 밖.

---

## 2. 현재 상태 진단

### 2.1 `@podo/editor` (React + tldraw, `index.tsx` ~6800 LOC, 단일 파일)

| 문제                                          | 위치                                                               | 상세                                                                                                                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`.podo` 영속화 배선 없음**                  | `index.tsx:256-257` (`onSpecsChange`/`onStateChange`), 저장 함수들 | `saveTokenDraft`, `saveComponentMetaDraft`, `savePropDraft`, `saveVariantDraft`가 모두 React state만 변경(`commitState`/`commitTokenDocuments`). `.podo`로의 POST/fetch가 없다. export 패널은 read-only textarea. **새로고침하면 편집이 사라진다.** |
| **chrome 전체가 인라인 `CSSProperties`**      | `index.tsx:813-1735`, `5343~`, `6764-6800`                         | `topBarStyle`, `tokenTypeButtonStyle`, `inputStyle` 등 raw hex(`#7c3aed` 등)·px·monospace 하드코딩. **자기가 편집하는 디자인 시스템을 정작 자신은 쓰지 않는다(dogfooding 부재).**                                                                   |
| **studio와 공유 코드 0**                      | `index.tsx` vs `studio/src/index.ts`                               | 토큰 매트릭스·타이포 워크스페이스·상세 draft·컴포넌트 에디터가 studio의 vanilla-JS 렌더링과 전혀 공유되지 않음. 같은 일을 두 번 구현.                                                                                                               |
| **토큰 매트릭스: 강점 있으나 밀도/성능 문제** | `createTokenMatrix` `index.tsx:1842`, 렌더러 `2542~`               | landing/dashboard × light/dark 교차 뷰는 좋은 아이디어. 그러나 (a) color/dimension/component 포함 규칙 하드코딩, (b) 셀이 수백 개 텍스트필드를 직접 렌더 → 성능 부담, (c) 복잡 값은 raw JSON 폴백, (d) origin/diff 설명 약함.                       |
| **상세 에디터 ↔ 매트릭스 셀 값 표현 분리**    | `1094-1202` vs `2604-2691`                                         | 상세에서 편집·저장해도 매트릭스 셀 `defaultValue`가 re-focus 전까지 갱신 안 됨(stale 버그).                                                                                                                                                         |
| **타입 전환 시 미저장 draft 무경고 폐기**     | `selectTokenType` `592-607`                                        | dirty 경고 없이 빈 draft로 교체.                                                                                                                                                                                                                    |
| **암묵적 blur 커밋**                          | `2646-2652`                                                        | onBlur/Enter→즉시 커밋. 리뷰 전 커밋, 무효값 에러는 포커스 이동 후 표시.                                                                                                                                                                            |
| **variant 토큰 바인딩이 raw JSON**            | `variantDraft.tokensText` `1604-1617`                              | picker/자동완성 없음. `parseVariantTokensInput`은 JSON 형태만 검증, 참조 경로 존재는 검증 안 함.                                                                                                                                                    |
| **레거시 프리뷰 렌더러 ~17–19개 하드코딩**    | `legacyComponentPreviewIds` `65-85`, `3090~`                       | 컴포넌트마다 커스텀 렌더러 필요. 비레거시는 토큰 바인딩/state 프리뷰 없는 폴백.                                                                                                                                                                     |
| **캔버스가 프리뷰가 아니라 다이어그램**       | `PodoComponentShapeUtil` `179-246`                                 | shape가 "N props, N slots" 메타데이터만 표시, 실제 렌더된 컴포넌트가 아님.                                                                                                                                                                          |
| **undo/redo·변경 이력 없음**                  | 모든 `commit*` 경로                                                | React state 직접 커밋, 되돌리기 불가.                                                                                                                                                                                                               |

### 2.2 `@podo/studio` (Hono + vanilla JS 문자열 템플릿, `index.ts` ~1850 LOC)

| 문제                                        | 위치                                                                                   | 상세                                                                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **문자열 템플릿 + `innerHTML` 렌더**        | `renderStudioHtml` `653`, `render()` `775`                                             | 상태 변화 시 `innerHTML` 통째 교체. 컴포넌트화/타입 안전성/상호작용성 낮음. 인라인 CSS 76줄(`660-726`).              |
| **편집 모델이 대부분 raw JSON/text input**  | `renderTokens` `815~`, `renderComponents` `830~`                                       | 시각적 편집·프리뷰 빈약.                                                                                             |
| **컴포넌트 생성만 가능, 기존 편집 UI 없음** | `POST /api/components/local` `327`                                                     | gnb/lng 템플릿 생성만. 기존 컴포넌트 속성 수정 화면 없음.                                                            |
| **(긍정) 진짜 영속화 배선은 여기 있다**     | `POST /api/tokens/override` `230`, `writeTokenOverride` `1189`, `PUT /api/files` `194` | studio만이 실제로 `.podo`에 쓴다. **풍부한 UI(editor) ↔ 영속화(studio)가 정확히 반대로 갈라져 있는 것이 핵심 모순.** |

### 2.3 공통 구조 문제 (세 엔진 공통 지적)

1. **하나의 편집 엔진을 위한 두 갈래 스택** — React+tldraw vs Hono+vanilla. 시각적 프리뷰·드래그 페이지 구성·인터랙티브 variant 테스트가 repo 에디터에만 갇혀 설치 프로젝트엔 없다.
2. **Studio 기본 spec ≠ CLI 기본 spec (Codex 발견, 검증됨)** — `studioDefaultTokens`/`studioDefaultComponents`(`studio:1731`/`1790`)와 CLI의 `defaultTokenDocument`/`defaultComponentDocuments`(`cli:1038`/`1109`)가 **별도 정의**. → **preview와 build가 불일치**할 수 있다. 통합 시 단일 기본 소스로 합쳐야 한다.
3. **검증/빌드 노출 분리** — studio엔 build/validation 탭이 있으나(`studio:843`), editor엔 read-only JSON textarea와 로컬 draft 에러뿐(`index.tsx:1704`).

---

## 3. 핵심 발견 — "빌드 반영"의 실제 상태 (요구사항 4의 정확한 진단)

사용자 요구 "토큰과 컴포넌트 수정값이 `.podo`에 저장되고 빌드 시 반영"을 **층위별로** 검증한 결과:

### 3.1 토큰 — ✅ 완전 동작 (적대적 검증 통과)

```
편집 → POST /api/tokens/override (studio:230)
     → writeTokenOverride(studio:1189) : .podo/themes/studio-overrides.tokens.json 에 setNestedToken + parseTokenDocument 재검증 후 기록
빌드 → loadBuildTokenSources(cli:737) : tier=package(defaultTokenDocument) + .podo/tokens + .podo/themes(tier=project)
     → mergeTokenDocuments(tokens:90) : project가 package override, origin 기록
     → resolveTokenDocument(tokens:131) : alias 해석
     → emit tokens.css/.ts/.native.ts/.json (cli:284-294)
```

테스트도 존재(`tokens/src/index.test.ts`). **결론: 에디터가 죽은 콜백 대신 이 라우트를 부르기만 하면 끝.** 어댑터 도입으로 닫힌다.

### 3.2 컴포넌트 — ⚠️ 파일은 흐르나, codegen이 spec을 안 읽는다 (가장 중요한 갭)

**파일 파이프라인은 연결됨:**

```
편집 → PUT /api/files (studio:194, parseComponentDocument 검증 + resolvePodoPath 경로탈출 방지)
        또는 POST /api/components/local → .podo/components/local/{id}.component.json (studio:339)
빌드 → loadBuildComponents(cli:761) : defaultComponentDocuments + readJsonFiles(".podo/components") [재귀, id 기준 override]
     → generateComponentFiles(codegen:48)
```

`readJsonFiles`가 재귀라 `.podo/components/local/*`도 정상 픽업된다(검증). 여기까진 동작.

**그러나 codegen이 spec-driven이 아니다 (Codex 발견 + 직접 검증):**

```ts
// packages/codegen/src/index.ts — componentTemplates
web: `export const ${exportName}ElementName = "podo-${id}"; export function define...`;
react: `export { ${exportName} } from "@podo/react";`; // 하드코딩 런타임 재export
hono: `export { ${exportName} } from "@podo/hono";`;
native: `export { ${exportName} } from "@podo/native";`;
```

`grep -E "variant|state|tokens|props" codegen/src/index.ts` → **0건**. 즉 **컴포넌트 spec의 variant/state/token-binding/anatomy를 코드 생성에 전혀 쓰지 않는다.** 런타임 컴포넌트는 `@podo/web`(`web:59`)·`@podo/react`(`react:31`)에 **하드코딩**되어 있다.

> **결론: 컴포넌트 spec 편집은 "메타데이터/존재" 수준까지만 빌드에 반영되고, 실제 스타일·동작(variant/state/토큰 바인딩)은 반영되지 않는다.** 사용자 요구사항을 진짜로 만족시키려면 **spec → 런타임 코드/스타일을 생성하는 spec-driven codegen**(또는 런타임이 generated `tokens.css`의 컴포넌트 토큰을 소비하도록 재구성)이 필요하다. 이것이 P0/P1의 필수 항목이다. (단기 절충: 미지원 편집을 "metadata-only, 빌드 미반영"으로 UI에 명시.)

### 3.3 페이지 — ❌ 완전 부재 (검증됨)

`@podo/spec`에 page/layout 스펙이 없다. `.podo/pages` 로더도, 페이지 빌드 출력도 없다. 현재 캔버스의 "export node"는 선택 노드를 `.component.json`으로 내보낼 뿐 진짜 page/layout 스펙이 아니다(`index.tsx:4761`, `docs/editor-workflow.md`도 이를 "해결된 스키마가 아닌 경계"로 명시). → **신규 영역, 컨텍스트 B 전용으로 스코프.**

---

## 4. 레퍼런스에서 가져올 패턴 (Podo 매핑)

세 엔진이 조사한 실제 도구 → JSON-spec-first 모델 매핑.

### 4.1 토큰 에디터

- **Tokens Studio (Figma)** — **타입 reference picker**(호환 `$type` 토큰 드롭다운이 `{dot.path}` 기록, raw 값 거의 안 침) + `$themes.json`/`$metadata.json` **theme resolver manifest**(set별 `source`=해석전용/`enabled`=해석+방출, 순서 캐스케이드). → picker는 `collectTokenPaths`/`flattenTokenDocuments`로 채우고 `aliasReferenceSchema`로 검증. `source`/`enabled` + 순서는 Podo의 package→project 병합 순서에 그대로 대응.
- **Style Dictionary v4 (DTCG)** — 편집(DTCG JSON 변경)과 빌드(transitive resolve → 플랫폼별 방출) 분리, theme 순열마다 명명된 독립 출력. → `buildProject()`가 이미 SD 형태. 업그레이드 2개: tier 간 **transitive 해석** 보장(기존 `validateTokenReferences`의 alias 그래프/순환 검출 재사용), 순열별 명명 출력.
- **Specify** — validate→build→publish, **빌드 전 검증이 필수 게이트**. → `parseTokenDocument`/`parseComponentDocument` + `PODO_SCHEMA_VERSION`이 house 포맷. 방출·`.podo` 기록 전에 항상 게이트.
- **Supernova** — foundation + 브랜드별 override 레이어. → package-default tier + `.podo` project tier와 구조 동일. DTCG를 interop 출력 형태로 유지.

### 4.2 컴포넌트 플레이그라운드

- **Storybook 8 (args/controls/argTypes)** — prop 타입에서 컨트롤 자동 추론 + 라이브 프리뷰. → `propTypeSchema`의 discriminated `kind`로 인스펙터 위젯 자동 생성(boolean→switch, number{min,max,step}→slider, enum→select…). 손으로 짠 `savePropDraft` 폼 대체.
- **Chromatic story modes** — 명명 모드 스택. → **variant × state × theme** 교차 매트릭스(`componentVariantSchema`+`componentStateSchema`). 매트릭스를 프리뷰가 아닌 **편집 표면**으로.
- **Radix ThemePanel / shadcn theming** — 유한한 토큰 knob이 전체를 재테마, **raw 값 없는 토큰 바인딩 picker**. → `variant.tokens`/`state.tokens` alias 맵 + resolved `tokens.css`.

### 4.3 DS 플랫폼

- **Knapsack** — 하나의 워크스페이스/레지스트리, 여러 뷰. **페이지 구성을 같은 프로덕션 컴포넌트 위에** 얹음(별도 도구 아님). "보는 것이 곧 배포되는 것".
- **Supernova / Zeroheight** — repo-as-source-of-truth, CI 동기화, **거버넌스를 상시 표면**(Component Tracker, Missing Elements). repo tier 편집은 **PR로** 영속화(plan.md Phase 8과 일치).
- **Backlight (반면교사)** — 올인원 클라우드 IDE, **2025-06 종료**. 교훈: Podo 에디터는 **로컬·의존성 가벼운 JSON 프로젝션**으로 유지, Figma 대체물이 되려 하지 말 것.
- 매핑: editor+studio를 하나의 `@podo/spec` 레지스트리 위 단일 엔진으로 통합. `.podo/config.json`이 Podo의 `knapsack.config.js`. 검증을 상시 노출.

### 4.4 페이지 빌더 (컨텍스트 B 페이지 디자인용)

- **Builder.io** — page = 재귀 `blocks`, `component.name + options` 간접화, 3-breakpoint `responsiveStyles`.
- **Plasmic** — **page와 component가 discriminator로 구분되는 같은 doc 타입**, `tplTree`(TplTag/TplComponent/TplSlot), `vsettings`=variant/breakpoint별 override 레이어 목록.
- **TeleportHQ (UIDL)** — 프레임워크 무관 **discriminated-union 노드 트리**(`element|component|static|dynamic|conditional|repeat|slot`), `dynamic.referenceType`에 `token` 케이스.
- **Penpot** — 네이티브 **W3C DTCG** 토큰(Podo 선택을 검증), 레이아웃은 절대 x/y가 아닌 **CSS flex/grid**.
- **Framer** — Property Controls(타입 props가 인스펙터로 자동 노출), master/instance(페이지는 인스턴스화만, fork 안 함).
- 매핑: `pageNodeSchema = z.discriminatedUnion('type', [...])`; 컴포넌트 인스턴스는 `componentDocumentSchema.id` 참조, props는 `componentPropSchema[]`로 검증; **모든 스타일 값 = `aliasReferenceSchema`(토큰 구동, raw hex/px 금지)**; 반응형=`appliesWhen` 스택 override; 레이아웃=토큰 참조 gap/padding의 flex/grid.

### 4.5 캔버스 / 아키텍처

- **tldraw SDK v5** — `ShapeUtil`(geometry + `component()` React 렌더 + resize)는 공간 레이아웃에 적합. `PodoComponentShapeUtil`(`index.tsx:179`)이 이미 `declare module "tldraw"` augmentation 사용. **store snapshot을 source of truth로 영속화하지 말 것** — page document만 어댑터로 저장, 세션(카메라/선택)은 `persistenceKey`로 로컬.
- **Ports & Adapters (Hexagonal)** — 도메인 코어는 아무것도 의존 안 함, outbound `SaveAdapter` 포트 하나, composition root가 어댑터 연결. 현재의 느슨한 `onSpecsChange`/`onStateChange`를 형식화.
- **반응형 도메인 store (tldraw 아님)** — `@podo/spec` 문서 위 정규화 in-memory 모델 + `useSyncExternalStore`. 흩어진 `useState`/`useRef`와 `isApplyingStateToTldrawRef` 단방향 동기화 핵(`index.tsx:367,504`) 대체. **토큰/컴포넌트 문서는 tldraw store에 두지 말 것.**

---

## 5. 권장 아키텍처 — `@podo/edit-core` + 포트/어댑터 + capability gating

```
                         ┌───────────────────────────────────────────┐
                         │  @podo/edit-core  (NEW, headless)           │
                         │  - 정규화 reactive store (spec 문서 위)      │
                         │  - mutation 계층 (spec-editing.ts 승격)      │
                         │  - validation gate (커밋 전 spec 파서 재실행) │
                         │  - (옵션) command bus + undo/redo           │
                         │  - SaveAdapter 포트 + capabilities          │
                         │  의존: @podo/spec, @podo/tokens (only)       │
                         └───────────────────────────────────────────┘
                                    ▲                     ▲
                  ┌─────────────────┘                     └─────────────────┐
        ┌─────────────────────┐                                   ┌─────────────────────┐
        │ Context A: 개발(repo)│                                   │ Context B: 설치 프로젝트│
        │ Vite/React dev app   │                                   │ @podo/studio (Hono)   │
        │ RepoFsAdapter        │                                   │ StudioHttpAdapter     │
        │ caps: pageDesign=off │                                   │ caps: pageDesign=on   │
        │       write=repo     │                                   │       write=overrides │
        └─────────────────────┘                                   └─────────────────────┘
                                    공유 React UI (token/component 패널 동일)
                                    + 지연로드 @podo/editor-canvas (B 페이지 전용)
```

### 5.1 `@podo/edit-core` (유일하게 반드시 필요한 신규 패키지)

- 호스트 중립. `@podo/spec`(+ resolve/merge 재사용 위해 `@podo/tokens`)만 의존. **React/`fs`/`fetch` 없음.**
- **도메인 store** — `{ tokenDocuments, components, pages?, iconManifest, origins }`를 `parseTokenDocument`/`parseComponentDocument`로 구축. headless라 CLI dry-run/테스트에서도 동작.
- **mutation 계층** — `spec-editing.ts`의 이미 순수한 헬퍼들(`moveTokenInDocuments`, `upsertTokenInDocuments`, `deleteTokenFromDocuments`, `upsertComponentProp`/`Variant`, `updateComponentMeta`, `parseEditorTokenValue`/`serializeEditorTokenValue`, `parseVariantTokensInput`, `editorTokenTypes` …)을 **그대로 승격**. 전환기엔 `spec-editing.ts`에 re-export shim 유지(순수성 검증됨 → 기계적 이동).
- **validation gate** — 모든 mutation이 커밋 전 `tokenDocumentSchema.parse` + `validateTokenReferences`(+ `validateComponentTokenBindings`, 향후 `validatePageComponents`) 재실행. 실패 시 `ValidationIssue[]`로 거부. (프로젝트의 "검증 누락/안전하지 않은 쓰기는 blocker" 기준 충족.)
- **(권장) command bus + 역명령 undo/redo** — stale-cell/draft-loss 결함을 우회가 아닌 구조로 해결. 게이트 내부에 추가, 호스트 변경 불필요.
- **SaveAdapter 포트:**
  ```ts
  interface PodoSaveAdapter {
    loadContext(): Promise<EditContext>;
    saveToken(input: { path; type; value; dryRun?; force? }): Promise<Result>;
    saveComponent(doc: ComponentDocument, opts): Promise<Result>;
    savePage?(doc: PageDocument, opts): Promise<Result>; // 컨텍스트 B만
    validate(): Promise<ValidationIssue[]>;
    build?(): Promise<BuildPlan>;
  }
  interface EditorCapabilities {
    pageDesign: boolean;
    writeMode: "repo" | "overrides";
    tldrawLicenseKey?: string;
  }
  ```

### 5.2 React UI (두 안 중 택1, 코어가 있으면 가역적)

- **(a) `@podo/editor` 경량 리팩터(Pragmatic, 권장 시작점)** — `index.tsx` 유지, 헬퍼를 `@podo/edit-core`에서 import, 콜백을 어댑터 prop으로 교체, 캔버스 gating. blast radius 최소.
- **(b) 새 `@podo/edit-ui` 셸(Clean)** — store 바인딩으로 패널 재구축. 상한 높지만 패리티 리스크 큼. → 코어 존재 후 결정해도 늦지 않음(저위험).
- **tldraw 격리** — 캔버스를 별도 **지연 import 청크 `@podo/editor-canvas`**로 분리, `capabilities.pageDesign`일 때만 로드. **컨텍스트 A와 모든 토큰/컴포넌트 편집은 tldraw 0 바이트.**

### 5.3 두 얇은 호스트

- **컨텍스트 A (repo dev app)** — `RepoFsAdapter`가 `packages/tokens`+`packages/*/spec`에 기록. `caps {pageDesign:false, write:'repo'}`. AGENTS.md대로 **dry-run 필수**, plan.md Phase 8대로 궁극적으로 GitHub-Action PR 흐름(어댑터 뒤 격리 → PR 어댑터로 교체는 한 파일).
- **컨텍스트 B (`podo ui`, `@podo/studio`)** — Hono 서버와 `/api/*` 라우트를 `StudioHttpAdapter` 백엔드로 유지, 프리빌트 React 번들을 `serveStatic`+SPA fallback으로 서빙. `caps {pageDesign:true, write:'overrides', tldrawLicenseKey: config.editor?.tldrawLicenseKey}`. **React 번들이 검증된 패리티에 도달하기 전엔 `renderStudioHtml()`을 플래그 뒤에 유지.**

### 5.4 의존 방향 (비순환)

`@podo/spec ← @podo/tokens ← @podo/edit-core ← (UI) ← {editor-canvas | studio | dev-app}`. 순환 없음.

---

## 6. 토큰 편집 모델

- **DTCG 일관.** store는 `TokenDocument[]` + origin/tier(`package`/`project`).
- **타입 reference picker가 1차 값 입력 컨트롤(핵심).** 모든 매트릭스 셀/상세 필드 기본값이 "호환 `$type`의 기존 토큰 선택" → `{dot.path}` alias 기록(`aliasReferenceSchema` 검증), raw 입력은 폴백. `collectTokenPaths`/`flattenTokenDocuments`를 `$type`로 필터해 채움. **이것으로 컨텍스트 A/B 토큰 편집이 저장대상만 빼고 동일.**
- **단일 검증 커밋 경로.** UI가 `UpsertToken`/`MoveToken` 디스패치 → 코어 reducer → validation gate(missing-ref/circular) → 통과 시 커밋 + 역명령 push → `adapter.saveToken(...)`. stale 셀, blur 암묵 커밋, 타입전환 draft 손실 결함을 구조적으로 해결.
- **매트릭스+타이포 워크스페이스+상세 에디터 UI 유지**(가장 풍부한 표면). 값 셀에 picker 추가, 게이트 경유만 변경.
- **멀티모드/멀티브랜드 = 가산, 연기.** `kind:'theme-resolver'` 직렬화 문서 추가(Tokens Studio `$themes`/`$metadata`), transitive 해석 + 순열별 명명 출력(`tokens.light.css` 등). 기존 단일 병합 빌드는 유효 유지.

---

## 7. 컴포넌트 속성 편집 모델

- **스키마 구동 인스펙터(Framer Property Controls 공짜).** prop 위젯을 `propTypeSchema`의 discriminated `kind`로 디스패치. 수동 `savePropDraft` 폼 대체, `componentPropSchema`로 커밋 전 검증.
- **variant·state를 순열 매트릭스로(Chromatic modes).** variant 축 × 고정 `componentStateSchema` enum(hover/active/focusVisible/disabled/loading/invalid/selected/open/checked) × theme. 매트릭스를 **편집 표면**으로(현재 `renderComponentPreviewMatrix` `2990-3071`은 선택만).
- **토큰 바인딩 picker(raw JSON 아님).** `variant.tokens` textarea(`1604-1617`)를 타입 picker로. 바인딩은 이미 `z.record(string, aliasReferenceSchema)` 타입. `validateComponentTokenBindings`로 **편집 시점**에 검증.
- **컴포넌트 로컬 토큰**(`component.{id}.*`, `createComponentTokenEditorModel` `1809-1823`)을 두 컨텍스트 모두 노출.
- **영속화:** `adapter.saveComponent(doc)`. 컨텍스트 B는 **기존 `PUT /api/files`** 사용(`path=.podo/components/local/{id}.component.json`) — **신규 라우트 불필요**(검증: `.component.json`은 `parseComponentDocument` 경유, `resolvePodoPath`가 경로탈출 방지). studio의 "생성만 가능" 갭도 동시 해결.
- **⚠️ 빌드 반영 전제(§3.2):** 위는 spec 영속화·로드를 닫지만, **codegen이 spec-driven이 되기 전까진 variant/state/토큰 편집이 실제 출력에 반영되지 않는다.** 따라서 본 모델과 함께 **spec-driven codegen**(또는 런타임이 generated 컴포넌트 토큰을 소비) 작업이 P0/P1로 동반되어야 요구사항이 진짜로 성립. 단기엔 미반영 편집을 UI에서 "metadata-only"로 표시.
- **프리뷰: 레거시 렌더러 재작성은 연기.** ~17–19개 하드코딩 렌더러(`65-85`, `3090~`)를 단일 spec-driven `ComponentPreview`로 바꾸는 건 가장 위험 → 임계경로 밖, before/after 스냅샷 테스트 뒤에서 점진 이전.

---

## 8. 페이지 디자인 모델 (설치 프로젝트 전용)

**진짜 신규 표면(스펙 부재 검증됨).** 컨텍스트 B 한정, `.podo/pages` 영속화, `ComponentDocument`는 깨끗이 유지.

- **page-spec 형태** — `packages/spec/src/pages.ts` → `pageDocumentSchema`(`schemaVersion` + `kind:'page'` + `id` + `name` + `route?` + `root`). `root`는 재귀 `z.discriminatedUnion('type', [...])`(TeleportHQ/Plasmic 형태, flat blocks 아님):
  - `component-instance` `{ component: componentId, props, slots: Record<slotName, node[]>, overrides: OverrideLayer[] }` — `ComponentDocument.id` 참조, **본문 인라인 금지**(master/instance). props는 해당 컴포넌트 `componentPropSchema[]`로, slot fill은 `componentSlotSchema[]`로 검증.
  - `layout` `{ layout:{mode:'flex'|'grid', direction, gap: aliasRef, padding: aliasRef}, children: node[] }` — 토큰 참조 flex/grid(Penpot), 절대 x/y 아님.
  - `text`, `slot`, 이후 `dynamic|conditional|repeat`.
  - `OverrideLayer = { appliesWhen:{breakpoint?,variant?}, props?, style? }`; **모든 스타일 값은 `aliasReferenceSchema`**. 반응형=override 레이어 스택(Plasmic `vsettings`), breakpoint/variant/state를 한 메커니즘으로.
- **캔버스** — tldraw + `PodoComponentShapeUtil` 재사용하되 **편집 표면으로만**: page doc을 tldraw frame/shape 트리에 투영(`ShapeUtil.component()`가 실제 컴포넌트 프리뷰 렌더), 저장 시 tldraw 편집을 `pageDocumentSchema` JSON으로 역변환. **page document만** `adapter.savePage()`로 영속화. 지연 로드, 키는 `.podo/config.json`.
- **경계 vs 컴포넌트** — 페이지는 컴포넌트를 인스턴스화·override만, 컴포넌트 spec을 절대 수정 안 함. `validatePageComponents()`로 인스턴스 참조 존재/prop 타입/slot fill/page→component→token alias 체인 검증.
- **빌드** — `loadBuildPages(root)`를 `loadBuildComponents` 형태로 추가(`.podo/pages` 읽고 `parsePageDocument`), 타깃별 페이지 코드를 `generated[]`에 방출.

> page-spec의 노드 모델을 **재귀 트리(권장)** vs **flat 노드 목록**(Codex/Agy 초안의 `nodes[]` + `slots`/`layout`) 중 무엇으로 할지는 열린 결정. 중첩 slot 구성·반응형 override 재사용성을 고려하면 **재귀 discriminated-union 트리**를 권장(§4.4 Plasmic/TeleportHQ).

---

## 9. 영속화 + 빌드 반영 배선 (정확한 함수 인용)

| 영역     | 쓰기                                                                                                          | 로드/병합                                                                                            | 출력                                       | 현재 상태                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| 토큰     | `POST /api/tokens/override`→`writeTokenOverride`(studio:230,1189)→`.podo/themes/studio-overrides.tokens.json` | `loadBuildTokenSources`(cli:737)→`mergeTokenDocuments`(tokens:90)→`resolveTokenDocument`(tokens:131) | `tokens.css/.ts/.native.ts/.json`(cli:284) | ✅ 동작. 에디터는 라우트만 호출하면 됨                              |
| 컴포넌트 | `PUT /api/files`(studio:194, 검증+경로보호) / `POST /api/components/local`(studio:327)                        | `loadBuildComponents`(cli:761, 재귀 id override)                                                     | `generateComponentFiles`(codegen:48)       | ⚠️ 파일은 흐르나 **codegen 비 spec-driven** → 의미 반영 안 됨(§3.2) |
| 페이지   | (신규) `POST /api/pages`→`.podo/pages/{id}.page.json`                                                         | (신규) `loadBuildPages`                                                                              | (신규) page codegen                        | ❌ 전부 신규                                                        |

**해야 할 일:**

1. (토큰) 에디터의 죽은 `onSpecsChange`를 `StudioHttpAdapter.saveToken`으로 교체.
2. (컴포넌트) **spec-driven codegen** — `generateComponentFiles`가 variant/state/token-binding/anatomy를 읽어 실제 코드·스타일을 생성하도록(또는 런타임이 generated 컴포넌트 토큰 CSS를 소비). 그 전까지 미지원 편집은 UI에서 metadata-only 표시.
3. (공통) **studio 기본 spec과 CLI 기본 spec 통합**(`studioDefaultTokens`/`studioDefaultComponents` ↔ `defaultTokenDocument`/`defaultComponentDocuments`) — preview/build 불일치 제거.
4. (결정성) `loadBuildComponents`의 id override 순서를 **재귀 정렬로 결정화**(현재 `readJsonFiles` 재귀 순서에 의존 → 재현성 결함).
5. (게이트) 모든 방출·쓰기를 검증 게이트 통과로(`buildProject`는 이미 `validateTokenBuild` 실패 시 throw `cli:~276`; 저장 시점에도 동일 게이트).
6. **회귀 테스트 추가**: `토큰 편집 → .podo 저장 → podo build → 생성 tokens가 편집 반영` (현재 이 경로를 덮는 테스트 없음). 컴포넌트도 동일 테스트로 §3.2 갭을 가시화.

---

## 10. Dogfooding (에디터의 자가 적용)

- 인라인 `CSSProperties` chrome(`index.tsx:813-1735`)과 studio 인라인 CSS(`studio:660-726`)를 **Podo 자체 토큰/컴포넌트로 교체**("보는 것이 곧 배포" — Knapsack).
- 작은 `editor-base.tokens.json`(패널/버튼/입력/테이블/탭용 color/surface/border/spacing/radius/typography)을 **빌드와 동일한** `resolveTokenDocument`+`emitCssVariables` 경로로 통과 → `editor-chrome.css` 생성, 셸이 `var(--podo-…)` 소비.
- 가장 반복되는 primitive(button/input/panel/table row/tab)를 `@podo/web`/`@podo/react`로 재구축.
- studio가 **같은** React 번들을 서빙하므로 에디터 chrome dogfooding이 studio chrome도 공짜로 해결.
- **점진(탭 단위) 비차단 트랙**. 순환 부트스트랩 방지 위해 **frozen** editor-base 토큰/픽스처 사용. 사용자 편집에 따른 라이브 재테마는 nice-to-have.

---

## 11. 우선순위 로드맵

### P0 — 통합 + 영속화 (사용자 1차 목표 직결)

1. **`@podo/edit-core` 추출.** 순수 `spec-editing.ts` 이동(re-export shim 유지). 동작 무변경. 검증 mutation 파이프라인 headless 단위 테스트 추가.
2. **store + validation gate** 구축(커밋 전 spec 파서/검증 재실행). 가능하면 command bus + undo/redo 동반.
3. **`SaveAdapter` 포트 + `capabilities` 도입**, `onSpecsChange`/`onStateChange`(`index.tsx:256-260`) 대체. `dev-app.tsx` 유지용 in-memory 기본 어댑터 제공. 커밋 지점을 `index.test.tsx` 대조하며 하나씩 어댑터 경유로 전환.
4. **어댑터 연결:** `StudioHttpAdapter`(기존 `POST /api/tokens/override` + `PUT /api/files`, 신규 라우트 0), `RepoFsAdapter`(dry-run 필수).
5. **타입 reference picker** — 매트릭스/상세 값 셀 + `variant.tokens` JSON textarea 대체, `aliasReferenceSchema`/`validateComponentTokenBindings` 검증.
6. **studio↔CLI 기본 spec 통합** + **`loadBuildComponents` 순서 결정화**.
7. **spec-driven codegen 착수** 또는 최소한 컴포넌트 미반영 편집의 "metadata-only" 명시 + §9.6 회귀 테스트(요구사항 4의 컴포넌트 갭을 닫거나 가시화).

### P1 — 두 컨텍스트 단일 UI (게이트, 신규 인프라)

8. **`@podo/editor`에 실제 앱/라이브러리 번들 빌드 추가**(Vite, code-split). _(현재 `build`=tsc 라이브러리 컴파일, 검증됨.)_
9. **studio가 번들 서빙**(`serveStatic`+SPA fallback), `GET /api/context`로 어댑터/capabilities 주입. **React UI가 패리티 체크리스트 + 기존 studio playwright e2e 통과 전까진 vanilla UI를 플래그 뒤 유지.** plan.md의 "의존성 가벼운 studio" 목표와 먼저 화해.
10. **tldraw를 지연 로드 `@podo/editor-canvas` 청크로 격리**, 키는 `.podo/config.json`, 컨텍스트 A는 tldraw 0.
11. **studio 전용 흐름(setup/migration/icons/build file-plan)을 React 탭으로 이식**해 패리티 달성.

### P2 — 페이지 디자인 + 마무리 (연기, 임계경로 밖)

12. **`pageDocumentSchema` + `validatePageComponents`**(`@podo/spec`), **Pages 탭**(tldraw 표면, page-doc이 source of truth), **`POST /api/pages`** + **`loadBuildPages`** + page codegen. 컨텍스트 B 전용.
13. **레거시 프리뷰 렌더러 ~17–19개 → 단일 spec-driven `ComponentPreview`**, 컴포넌트별 스냅샷 테스트 뒤 점진.
14. **theme-resolver manifest**(멀티모드/멀티브랜드) + transitive 해석 + 순열별 명명 출력.
15. **chrome dogfooding**(생성 토큰/컴포넌트, 병렬 트랙), **undo/redo**(P0 미반영 시), **충돌 검출**(`PUT` hash/ETag).

---

## 12. 리스크 / 오픈 퀘스천

1. **tldraw 라이선스(차단).** v4+ 프로덕션 키 + 워터마크, Podo는 MIT·다운스트림 설치. tldraw는 **현재 정적 의존(검증)**. 완화: 지연 `@podo/editor-canvas`, 컨텍스트 B 페이지 전용, 키는 `.podo/config.json`. 페이지가 P2라 연기 가능.
2. **앱 번들 빌드 부재(제안서들이 과소평가).** editor `build`=tsc, studio엔 React/`serveStatic` 없음(검증). "studio가 에디터 번들 서빙"은 신규 인프라이자 plan.md의 가벼운 studio 목표와 긴장 + 설치 `podo ui` 페이로드 증가. 명시적 게이트 P1, 목표 먼저 화해, 적극 code-split.
3. **`index.tsx` 단일 ~6800 LOC** + `isApplyingStateToTldrawRef` 단방향 동기화 핵(`367,504`). 어댑터 1개 주입 + 캔버스 gating을 무회귀로 하기 까다로움. 완화: in-memory 폴백 어댑터, 커밋 지점 하나씩, `index.test.tsx` 의존.
4. **빅뱅 UI 교체 리스크.** 패리티 전 vanilla studio 삭제 시 `podo ui` 파손. 완화: 패리티 체크리스트 + e2e, 플래그 뒤 유지.
5. **컴포넌트 빌드 반영의 진짜 갭(§3.2, 요구사항 직결).** codegen 비 spec-driven + 런타임 하드코딩 → variant/state/토큰 편집 미반영. **이걸 닫지 않으면 "컴포넌트 수정값 빌드 반영" 요구는 부분만 충족.** spec-driven codegen 범위/우선순위 결정 필요.
6. **studio≠CLI 기본 spec(Codex).** preview/build 불일치원. 통합 필수.
7. **빌드는 명시적 `podo build` 필요.** `.podo` 편집만으론 재생성 안 됨. 저장대상 + "rebuild 필요" 인디케이터를 푸터에 노출.
8. **`writeTokenOverride` lost-update 레이스**(read-merge-write, 충돌검출 없음). 단일 사용자 로컬 MVP엔 허용, 멀티표면 전 hash/ETag 추가.
9. **컨텍스트 A repo 쓰기**가 `.podo` 쓰기보다 위험(소스 손상 가능) + plan.md Phase 8의 PR 흐름과 충돌. 완화: dry-run + diff/PR 스테이징, 어댑터 뒤 격리.
10. **PageDocument 그린필드**가 placement를 `ComponentDocument`에 재혼입할 위험(현 캔버스 export가 정확히 그럼 `4761`). 완화: 페이지는 컴포넌트 id 참조 별도 레이어, 컴포넌트 spec 불변, 컨텍스트 A는 페이지 완전 차단.
11. **레거시 렌더러 개수 불일치** — findings가 "19"와 "17"을 함께 인용. 구현 전 정확히 reconcile.
12. **Figma 클론으로의 스코프 크리프.** plan.md + Backlight 종료 모두 경고. MVP를 spec-editor + 프리뷰(repo/`.podo` 기록)로 묶고, 페이지는 tldraw-over-JSON 얇은 투영으로.

---

## 13. 부록 — 세 엔진의 고유 기여

| 엔진                              | 고유하게 강하게 기여한 부분                                                                                                                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude (워크플로 22 에이전트)** | 가장 포괄적 종합. 추가 적대적/로컬 검증으로 **tldraw 라이선스 차단**, **앱 번들 빌드 부재**, **`spec-editing.ts` 순수성(추출이 기계적)**, **컴포넌트 저장에 기존 `PUT /api/files` 재사용(신규 라우트 0)**을 발견. 레퍼런스 매핑·판정단·로드맵·리스크 상세. |
| **Codex (`gpt-5.5`)**             | **결정적 갭 2개**: ① studio 기본 spec ≠ CLI 기본 spec(preview/build 불일치) ② **codegen이 spec-driven이 아님 + 런타임 하드코딩 → 컴포넌트 편집 미반영**. 레퍼런스의 도구 현황(Specify/Backlight 종료)까지 정확.                                            |
| **Agy**                           | 명료한 아키텍처 다이어그램(`@podo/edit-core` + `SaveAdapter` + `EditorCapabilities`), 구체적 page-spec JSON 예시, ASCII IA 목업, "autobuild trigger / 핫리로드 / 클라이언트 사전검증" 운영 항목.                                                           |

세 엔진의 핵심 결론은 **완전히 수렴**: 헤드리스 `@podo/edit-core` 추출 → `SaveAdapter`+capability로 두 호스트 분기 → 토큰은 이미 반영되니 라우트만 연결, 컴포넌트는 codegen을 spec-driven으로, 페이지는 신규 스펙으로 컨텍스트 B에만. 전면 재작성이 아닌 **재배선 + 신규 패키지 1개**가 정답.

---

### 부록 B — 검증된 load-bearing 사실 체크리스트

- ✅ 토큰 `.podo`→빌드 반영 동작(write→merge→resolve→emit, 테스트 존재).
- ✅ 컴포넌트 spec **파일** 파이프라인 동작(`PUT /api/files` 재사용, 신규 라우트 불필요).
- ⚠️ 그러나 **codegen 비 spec-driven** → 컴포넌트 의미(variant/state/token) 미반영(grep 0건 + 템플릿 재export 확인).
- ✅ page/layout 스펙 부재 → 페이지는 진짜 신규, 컨텍스트 B 전용.
- ✅ `spec-editing.ts` 순수(React 훅 0, `@podo/spec`만 import) → edit-core 추출 기계적.
- ✅ studio≠CLI 기본 spec(`studioDefaultTokens`/`studioDefaultComponents` vs `defaultTokenDocument`/`defaultComponentDocuments`).
- ✅ 앱 번들 빌드 부재(editor build=tsc), studio에 React/`serveStatic` 없음, tldraw=`^5.1.0` 정적 의존.
