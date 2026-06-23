/** Strings for project-panel.tsx. en is the source of truth; ko mirrors it. */
export const projectPanelEn = {
  "projectPanel.title": "Project",
  "projectPanel.baseStylesCount": "{defined}/{total} base styles",
  "projectPanel.fontFamiliesCount": "{count} font families",
  "projectPanel.textStylesCount": "{count} text styles",
  "projectPanel.defaultsHeading": "Project defaults",
  "projectPanel.defaultsMeta":
    "Project-wide base text styles (h1–h3, body, caption). Component-specific typography is set inside each component.",
  "projectPanel.defaultFontFamily": "Default font family",
  "projectPanel.familiesAvailable": "{count} available",
  "projectPanel.familyLabel": "Family",
  "projectPanel.addFamilyHelp":
    "Add a font family in Tokens → typography first, then pick it here.",
  "projectPanel.baseTextStyles": "Base text styles",
  "projectPanel.baseTextStylesMeta": "h1 · h2 · h3 · body · caption",
  "projectPanel.addRole": "+ Add {role}",
} as const;

export const projectPanelKo: Record<keyof typeof projectPanelEn, string> = {
  "projectPanel.title": "프로젝트",
  "projectPanel.baseStylesCount": "기본 스타일 {defined}/{total}개",
  "projectPanel.fontFamiliesCount": "글꼴 {count}개",
  "projectPanel.textStylesCount": "텍스트 스타일 {count}개",
  "projectPanel.defaultsHeading": "프로젝트 기본값",
  "projectPanel.defaultsMeta":
    "프로젝트 전체 기본 텍스트 스타일(h1–h3, body, caption). 컴포넌트별 타이포그래피는 각 컴포넌트 내부에서 설정합니다.",
  "projectPanel.defaultFontFamily": "기본 글꼴",
  "projectPanel.familiesAvailable": "{count}개 사용 가능",
  "projectPanel.familyLabel": "글꼴",
  "projectPanel.addFamilyHelp": "먼저 토큰 → typography에서 글꼴을 추가한 다음 여기서 선택하세요.",
  "projectPanel.baseTextStyles": "기본 텍스트 스타일",
  "projectPanel.baseTextStylesMeta": "h1 · h2 · h3 · body · caption",
  "projectPanel.addRole": "+ {role} 추가",
};
