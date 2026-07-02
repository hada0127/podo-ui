# Browser Testing (agent-browser)

이 머신에는 `agent-browser` CLI(`v0.27.x`)가 설치돼 있다. 별도 래퍼·MCP·SDK 없이
Bash에서 셸 명령으로 바로 호출한다. 에디터 같은 **실행 중인 UI를 눈으로 확인**해야 하는
가벼운 검증에 쓴다. 정규 회귀 테스트는 여전히 Playwright(`pnpm test:studio:e2e`)와 Vitest가 담당한다.

참고: https://daleseo.com/agent-browser/

사용법은 CLI에 동봉돼 있다(버전 자동 일치). 명령을 추측하지 말고 먼저 읽는다:

```bash
agent-browser skills get core --full   # 워크플로우·ref 사용법·복붙 예제
agent-browser --help                   # 전체 명령 목록
```

## 무엇으로 무엇을 검증하나

| 도구                                | 용도                                                     | 비고                           |
| ----------------------------------- | -------------------------------------------------------- | ------------------------------ |
| `pnpm test` (Vitest)                | 로직·스펙·변환 단위/통합 테스트                          | 기본 게이트                    |
| `pnpm test:studio:e2e` (Playwright) | 재현 가능한 정규 E2E 회귀                                | CI·릴리스 게이트, 코드로 관리  |
| `agent-browser`                     | 일회성 시각 확인, 탐색적 클릭, 레이아웃/디자인 깨짐 점검 | 코드로 남기지 않는 ad-hoc 검증 |

판단 기준 한 줄: **다시 돌릴 테스트면 Playwright로 코드화한다. 지금 한 번 눈으로 보면 되는 거면 agent-browser.**

## 워크플로우

1. 에디터 dev 서버를 띄운다: `pnpm ui` (= `pnpm --filter @podo/editor dev`, 기본 `http://localhost:5173`).
2. `agent-browser open http://localhost:5173`
3. `agent-browser snapshot` 으로 접근성 트리 + ref(`@e4` 같은 ID)를 얻는다.
4. ref로 조작한다: `agent-browser click @e4`, `agent-browser fill @e7 "..."`.
   ref는 현재 페이지 상태 기준이라, 페이지가 갱신되면 `snapshot`을 다시 찍는다.
5. 시각 확인은 `agent-browser screenshot /tmp/x.png`, 추출은 `agent-browser get text "h1"`.
6. 끝나면 `agent-browser close`.

## 정책

- **Playwright e2e를 대체하지 않는다.** agent-browser로 확인한 회귀는, 반복 검증이 필요하면 `packages/studio/e2e`에 Playwright 테스트로 옮긴다.
- **파괴적 동작 금지.** 삭제 버튼이나 확인 다이얼로그(`alert`/`confirm`/`prompt`)를 띄우는 요소는 클릭하지 않는다. 불가피하면 사용자에게 먼저 알린다.
- **2~3회 실패하면 멈춘다.** 같은 명령을 반복 재시도하거나 무관한 페이지를 탐색하지 말고, 시도한 것과 실패 원인을 보고하고 어떻게 진행할지 묻는다.
- **로컬 dev 서버 대상.** 외부 사이트가 아니라 이 저장소의 에디터/스튜디오 로컬 인스턴스를 검증 대상으로 한다.
- 세션이 끝나면 `agent-browser close`로 정리한다(`--all`은 모든 세션 종료).
