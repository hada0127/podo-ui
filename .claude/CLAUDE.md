# 프로젝트 지침

**중요**
- 모든 응답은 한국어로 할 것 (코드는 영어 가능)
- **필수**: 매 응답의 시작이나 중간에 반드시 사용자를 "포도"라고 부를 것 (예: "포도, ~할게", "포도가 요청한 대로~")
- 반말로 대화할 것 (예: "했어", "할게", "확인해봐")


- 코드 설명은 한국어로 작성
- 에러 메시지 설명은 한국어로 작성
- 기술적인 내용은 한국어로 작성
- 모든 대화와 피드백은 한국어로 작성

단, 코드 자체(변수명, 함수명, 코드 주석 등)는 영어를 사용할 수 있습니다.

## 작업 처리 방식

1. **작업 요청 JSON 변환**: 사용자가 작업을 요청하면, 요청 내용을 JSON 형식으로 구조화하여 정리한 후 작업을 진행하세요.

   ```json
   {
     "task": "작업 제목",
     "description": "작업 설명",
     "steps": ["단계1", "단계2", ...],
     "affected_files": ["파일1", "파일2", ...]
   }
   ```

2. **설정 자동 반영**: 작업 완료 후, 해당 내용이 프로젝트 규칙이나 문서에 반영되어야 할 경우 `.claude` 폴더 내의 적절한 파일에 즉시 반영하세요.
   - 아키텍처 관련: `.claude/docs/` 폴더
   - 슬래시 커맨드 추가: `.claude/commands/` 폴더
   - 프로젝트 전체 정책: `.claude/CLAUDE.md`

## 에이전트 자동 호출 규칙

> **중요**: 작업 요청 시 적절한 에이전트를 자동으로 선택하여 Task 도구로 호출하세요.

### 에이전트 선택 기준

| 키워드/작업 유형 | 호출할 에이전트 |
|-----------------|----------------|
| 새 컴포넌트, 컴포넌트 생성, Figma URL | `component-creator` |
| SCSS, 스타일, 색상, 간격, CSS | `scss-helper` |
| 문서, 페이지 작성, 예제, Props 테이블 | `docs-writer` |
| AI JSON, 동기화, public/ai | `ai-json-sync` |
| 빌드, 타입 에러, 컴파일 에러 | `build-checker` |
| 번역, i18n, 다국어, locales | `i18n-manager` |

### 에이전트 체이닝 규칙

복합 작업 시 에이전트를 순차적으로 체이닝합니다:

**새 컴포넌트 생성 (전체 프로세스):**
```
component-creator → scss-helper (스타일 보완 필요시) → docs-writer → ai-json-sync → build-checker
```

**컴포넌트 수정:**
```
[직접 수정] → ai-json-sync → build-checker
```

**스타일 시스템 변경:**
```
scss-helper → ai-json-sync (systems JSON 업데이트)
```

**문서 작성:**
```
docs-writer → i18n-manager (번역 필요시)
```

### 자동 호출 예시

```
사용자: "Card 컴포넌트 만들어줘"
→ component-creator 에이전트 자동 호출
→ 완료 후 ai-json-sync 체이닝
→ 완료 후 build-checker로 검증

사용자: "버튼 색상 변경해줘"
→ scss-helper 에이전트 자동 호출
→ 완료 후 ai-json-sync로 color.json 업데이트

사용자: "Input 문서 페이지 작성해줘"
→ docs-writer 에이전트 자동 호출
```

### 병렬 실행

독립적인 작업은 병렬로 실행합니다:
- 컴포넌트 생성 + 문서 작성 (동시 가능)
- 여러 번역 파일 업데이트 (동시 가능)

## 하위 문서 참조

> 작업에 필요한 상세 정보는 아래 문서를 참조하세요. 필요한 경우에만 해당 문서를 읽어주세요.

### docs/ - 프로젝트 문서
| 문서 | 경로 | 용도 |
|------|------|------|
| 아키텍처 | `.claude/docs/architecture.md` | 전체 구조, 설계 철학 |
| 프로젝트 개요 | `.claude/docs/overview.md` | 기술 스택, 버전 정보 |
| 폴더 구조 | `.claude/docs/structure.md` | 전체 디렉토리 구조 상세 |
| 빌드 시스템 | `.claude/docs/build-system.md` | 빌드 명령어, 출력, 프로세스 |
| NPM 스크립트 | `.claude/docs/scripts.md` | 빌드, 배포 명령어 요약 |
| React 컴포넌트 | `.claude/docs/react-components.md` | React 컴포넌트 사용법, Props |
| Svelte 컴포넌트 | `.claude/docs/svelte-components.md` | Svelte 5 컴포넌트 사용법, Props |
| SCSS 시스템 | `.claude/docs/scss-system.md` | 색상, 간격, 그리드 |
| Vanilla JS | `.claude/docs/vanilla-js.md` | CDN 컴포넌트 |
| 국제화 | `.claude/docs/i18n.md` | i18next 번역 파일 관리 |
| 코딩 규칙 | `.claude/docs/coding-rules.md` | 네이밍, 스타일 규칙 |
| 컨벤션 | `.claude/docs/conventions.md` | 프로젝트 컨벤션 |
| 새 컴포넌트 | `.claude/docs/new-component.md` | 컴포넌트 추가 가이드 |
| 아이콘 가이드 | `.claude/docs/icon-guide.md` | 아이콘 추가/사용법 |

### commands/ - 슬래시 명령어
| 명령어 | 경로 | 용도 |
|--------|------|------|
| /build | `.claude/commands/build.md` | 빌드 실행 |
| /component | `.claude/commands/component.md` | 새 컴포넌트 생성 (간단) |
| /dev | `.claude/commands/dev.md` | 개발 서버 |
| /docs | `.claude/commands/docs.md` | 문서 페이지 작업 |
| /i18n | `.claude/commands/i18n.md` | 번역 관리 |
| /icon | `.claude/commands/icon.md` | 아이콘 빌드 |
| /publish | `.claude/commands/publish.md` | NPM 배포 |
| /scss | `.claude/commands/scss.md` | 스타일 작업 |
| /svelte | `.claude/commands/svelte.md` | Svelte 컴포넌트 작업 |
| /vanilla | `.claude/commands/vanilla.md` | Vanilla JS 작업 |

### agents/ - 서브 에이전트
> 복잡한 작업을 자동으로 처리하는 전문 에이전트들. Task 도구로 자동 호출되거나 명시적으로 요청 가능.

| 에이전트 | 경로 | 용도 |
|----------|------|------|
| component-creator | `.claude/agents/component-creator.md` | 새 컴포넌트 생성 (Figma 분석 + 브라우저 확인 포함) |
| scss-helper | `.claude/agents/scss-helper.md` | SCSS 스타일 작업 |
| docs-writer | `.claude/agents/docs-writer.md` | 문서 페이지 작성 |
| ai-json-sync | `.claude/agents/ai-json-sync.md` | AI JSON 레퍼런스 동기화 |
| build-checker | `.claude/agents/build-checker.md` | 빌드 검증 및 에러 수정 |
| i18n-manager | `.claude/agents/i18n-manager.md` | 다국어 번역 관리 |

**에이전트 사용 예시:**
- "component-creator 에이전트로 Card 컴포넌트 만들어줘"
- "build-checker로 빌드 확인해줘"
- Figma URL과 함께: "이 디자인으로 컴포넌트 만들어줘 https://figma.com/..."

## AI 레퍼런스 관리

> podo-ui는 AI 도구들이 쉽게 참조할 수 있도록 `public/ai/` 폴더에 JSON 레퍼런스를 제공합니다.

### 파일 구조
```
public/
├── ai.json                    # 메인 인덱스 (진입점)
└── ai/
    ├── overview.json          # 프로젝트 개요
    ├── components/            # 컴포넌트별 JSON (17개)
    └── systems/               # 시스템별 JSON (6개)
```

### 업데이트 필수 상황

**컴포넌트/시스템 변경 시 반드시 AI JSON도 함께 업데이트해야 합니다:**

| 작업 | 업데이트 대상 |
|------|--------------|
| 새 컴포넌트 추가 | `public/ai/components/{name}.json` 생성 + `ai.json`에 경로 추가 |
| 컴포넌트 Props 변경 | 해당 `public/ai/components/{name}.json`의 `props` 배열 수정 |
| CSS 클래스 추가/변경 | 해당 JSON의 `cssClasses` 배열 수정 |
| 시스템(색상/간격 등) 변경 | 해당 `public/ai/systems/{name}.json` 수정 |
| 컴포넌트 삭제 | JSON 파일 삭제 + `ai.json`에서 경로 제거 |
| **패키지 버전 변경** | `public/ai.json`의 `version` 필드를 `package.json`과 동기화 |

### JSON 구조 예시

```json
// public/ai/components/input.json
{
  "name": "Input",
  "category": "atom",
  "description": "Form input field with Zod validation support",
  "import": { "react": "...", "scss": "..." },
  "props": [{ "name": "value", "type": "string", ... }],
  "cssClasses": [{ "class": "input", "description": "..." }],
  "examples": [{ "title": "Basic", "code": "..." }],
  "related": ["textarea", "field"]
}
```

> 상세 가이드: `.claude/docs/new-component.md` 섹션 7 참조
