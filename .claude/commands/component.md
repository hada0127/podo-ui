# 새 컴포넌트 생성

컴포넌트: $ARGUMENTS

---

## 에이전트 사용

`component-creator` 에이전트를 사용하여 다음을 자동으로 생성합니다:

1. **컴포넌트 파일**: `react/atom/` 또는 `react/molecule/`에 `.tsx` + `index.ts`
2. **스타일 파일**: `scss/components/_{name}.scss` + `_components.scss` import 추가
3. **AI JSON**: `public/ai/components/{name}.json` + `ai.json` 경로 추가
4. **문서 페이지**: `pages/docs/{name}/+Page.tsx`
5. **익스포트**: `src/index.ts`에 추가

## Figma URL 제공 시

Figma 디자인 URL이 있으면 함께 전달하세요:
- Figma 디자인을 분석하여 스타일 추출
- podo-ui 변수 시스템에 자동 매핑
- 생성 후 브라우저에서 Figma와 비교 확인

## 참고 문서

- 상세 가이드: `.claude/docs/new-component.md`
- 에이전트: `.claude/agents/component-creator.md`

---

**component-creator 에이전트를 사용하여 "$ARGUMENTS" 컴포넌트를 생성해주세요.**
