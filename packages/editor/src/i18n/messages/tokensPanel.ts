/** Strings for tokens-panel.tsx. en is the source of truth; ko mirrors it. */
export const tokensPanelEn = {
  "tokensPanel.title": "Tokens",
  "tokensPanel.groupSummary": "{count} tokens / {groups} groups",
  "tokensPanel.metaSpecs": "{count} JSON token specs",
  "tokensPanel.scalarLabel.radius": "Radius",
  "tokensPanel.scalarLabel.spacing": "Spacing",
} as const;

export const tokensPanelKo: Record<keyof typeof tokensPanelEn, string> = {
  "tokensPanel.title": "토큰",
  "tokensPanel.groupSummary": "토큰 {count}개 / 그룹 {groups}개",
  "tokensPanel.metaSpecs": "JSON 토큰 명세 {count}개",
  "tokensPanel.scalarLabel.radius": "반경",
  "tokensPanel.scalarLabel.spacing": "간격",
};
