/** Strings for build-panel.tsx. en is the source of truth; ko mirrors it. */
export const buildPanelEn = {
  "buildPanel.title": "Build",
  "buildPanel.tokensCount": "{count} tokens",
  "buildPanel.componentsCount": "{count} components",
  "buildPanel.canvasNodesCount": "{count} canvas nodes",
  "buildPanel.workspaceMeta":
    "JSON spec artifacts that feed the build (reproducible source of truth)",
  "buildPanel.tokensLabel": "Tokens",
  "buildPanel.componentsLabel": "Components",
} as const;

export const buildPanelKo: Record<keyof typeof buildPanelEn, string> = {
  "buildPanel.title": "빌드",
  "buildPanel.tokensCount": "토큰 {count}개",
  "buildPanel.componentsCount": "컴포넌트 {count}개",
  "buildPanel.canvasNodesCount": "캔버스 노드 {count}개",
  "buildPanel.workspaceMeta": "빌드에 사용되는 JSON 스펙 아티팩트 (재현 가능한 단일 진실 공급원)",
  "buildPanel.tokensLabel": "토큰",
  "buildPanel.componentsLabel": "컴포넌트",
};
