# podo-ui-mcp

podo-ui 디자인 시스템을 위한 [MCP](https://modelcontextprotocol.io) 서버.

AI 코딩 도구(Claude Code, Cursor, Windsurf 등)가 podo-ui의 컴포넌트, Props, SCSS 시스템, 사용 예시를 **정확하게** 참조할 수 있게 해줍니다.

---

## 왜 MCP인가? (기존 방식 vs MCP)

### 기존 방식: public/ai.json 직접 참고

```
프로젝트에 podo-ui 설치
→ AI에게 "public/ai/를 참고해서 코드 짜줘" 수동 지시
→ AI가 26개 JSON 파일(~124KB)을 전부 읽음
→ 컨텍스트 윈도우 소모
```

**문제점:**
- AI에게 매번 "podo-ui의 public/ai/ 폴더를 참고해" 라고 말해야 함
- 26개 파일을 전부 읽으면 **~124KB가 컨텍스트에 들어감** (대화 길어질수록 부담)
- Button 하나 쓰려는데 19개 컴포넌트 정보를 다 읽음
- CSS 클래스로 역검색 불가 ("has-error가 뭔지" 물어보면 전부 뒤져야 함)
- 프로젝트마다 AI에게 설명하는 과정을 반복

### MCP 방식: podo-ui-mcp

```
MCP 서버 한 번 등록
→ AI가 필요할 때 자동으로 도구 호출
→ 필요한 컴포넌트만 정확히 조회
→ 컨텍스트 절약
```

**장점:**
- **한 번 등록하면 끝** — 매 대화마다 안내 불필요
- **필요한 것만 조회** — Field 쓸 때 Field만 가져옴 (~4KB vs 124KB)
- **자동 연동** — AI가 podo-ui 코드 짤 때 알아서 MCP 도구 호출
- **검색 가능** — CSS 클래스 역검색, 키워드 검색, 예시 검색 지원
- **어떤 AI 도구든 동일** — Claude Code, Cursor, Windsurf 등 MCP 지원 도구 공통

### 비교 정리

| | 기존 (JSON 직접 참고) | MCP |
|---|---|---|
| 초기 설정 | 없음 | 명령어 1줄 |
| 매 대화마다 | "ai/ 폴더 참고해" 지시 필요 | 자동 |
| 컨텍스트 사용량 | ~124KB (전체 로딩) | ~2-5KB (필요한 것만) |
| 검색 | 파일 하나씩 열어봐야 함 | 키워드/클래스명 즉시 검색 |
| 정확도 | AI가 잘못 해석할 수 있음 | 구조화된 데이터 그대로 전달 |
| 프로젝트 간 공유 | 매번 경로 안내 | npm 패키지로 통일 |

---

## 설치 및 사용법

### Claude Code

```bash
claude mcp add podo-ui -- npx podo-ui-mcp
```

### Cursor

Settings > MCP Servers에 추가:

```json
{
  "podo-ui": {
    "command": "npx",
    "args": ["podo-ui-mcp"]
  }
}
```

### Windsurf

MCP 설정 파일에 추가:

```json
{
  "podo-ui": {
    "command": "npx",
    "args": ["podo-ui-mcp"]
  }
}
```

### Claude Desktop

`claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "podo-ui": {
      "command": "npx",
      "args": ["podo-ui-mcp"]
    }
  }
}
```

---

## 제공되는 도구 (6개)

| 도구 | 설명 | 예시 |
|------|------|------|
| `get_overview` | podo-ui 전체 개요 (버전, 컴포넌트 목록, 설치법, import, 테마) | "podo-ui가 뭐야?" |
| `search_component` | 이름/키워드로 컴포넌트 검색 | "form 관련 컴포넌트 찾아줘" |
| `get_component` | 특정 컴포넌트 상세 (props, CSS 클래스, 예시, 관련 컴포넌트) | "Field 컴포넌트 props 알려줘" |
| `get_system` | SCSS 시스템 조회 (color, spacing, typography, grid, icon, button) | "간격 시스템 알려줘" |
| `search_css_class` | CSS 클래스명으로 역검색 | "'has-error' 클래스가 어디꺼야?" |
| `get_example` | 사용 패턴별 예시 코드 검색 | "validation 예시 보여줘" |

---

## 실제 사용 예시

MCP를 등록하면, 바이브코딩할 때 AI가 자동으로 활용합니다:

### 예시 1: "로그인 폼 만들어줘"

AI가 내부적으로:
1. `search_component("form input")` → Input, Field 컴포넌트 발견
2. `get_component("Field")` → error prop, validator, helper 등 정확한 props 확인
3. `get_component("Input")` → type, className 등 확인
4. `get_system("color")` → danger, success 색상 토큰 확인

결과: podo-ui 컴포넌트를 정확하게 사용한 코드 생성

```tsx
import { Field } from 'podo-ui';

<Field label="이메일" required error={emailError}>
  <input type="email" value={email} onChange={handleChange} />
</Field>
```

### 예시 2: "이 CSS 클래스가 뭔지 모르겠어"

```
개발자: "has-error 클래스가 뭐야?"
AI: search_css_class("has-error") 호출
→ "Field 컴포넌트의 에러 상태 클래스입니다. error prop이 있으면 적용되고, 
   내부 input/select/textarea의 border를 danger 색상으로 변경합니다."
```

### 예시 3: "간격 얼마나 줘야 해?"

```
개발자: "카드 패딩 얼마?"
AI: get_system("spacing") 호출
→ "commonPatterns.cardPadding = s(6) = 24px 를 권장합니다."
```

---

## 데이터 소스

`public/ai/` 폴더의 JSON 레퍼런스를 그대로 사용합니다:

```
public/ai.json              → 메인 인덱스 (버전, 모듈 목록)
public/ai/overview.json     → 프로젝트 개요
public/ai/components/*.json → 컴포넌트별 상세 (19개)
public/ai/systems/*.json    → SCSS 시스템 (6개)
```

컴포넌트가 추가/수정되면 `ai-json-sync` 에이전트가 JSON을 업데이트하고,
MCP 패키지 재빌드 시 자동으로 최신 데이터가 번들됩니다.

---

## License

MIT
