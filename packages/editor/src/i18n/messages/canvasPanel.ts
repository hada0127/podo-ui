/** Strings for canvas-panel.tsx. en is the source of truth; ko mirrors it. */
export const canvasPanelEn = {
  "canvasPanel.title": "Canvas",

  // Auto-layout inspector
  "canvasPanel.autoLayout": "Auto layout",
  "canvasPanel.autoLayoutMode": "Auto layout mode",
  "canvasPanel.layoutMode.none": "none (absolute)",
  "canvasPanel.layoutMode.horizontal": "horizontal (row)",
  "canvasPanel.layoutMode.vertical": "vertical (column)",
  "canvasPanel.align": "align",
  "canvasPanel.alignItems": "Align items",
  "canvasPanel.justify": "justify",
  "canvasPanel.justifyContent": "Justify content",
  "canvasPanel.gap": "gap",
  "canvasPanel.layoutGap": "Layout gap",
  "canvasPanel.padding": "padding",
  "canvasPanel.layoutPadding": "Layout padding",
  "canvasPanel.spacingPlaceholder": "{spacing.2}",
  "canvasPanel.wrap": "wrap",
  "canvasPanel.width": "width",
  "canvasPanel.widthSizing": "Width sizing",
  "canvasPanel.height": "height",
  "canvasPanel.heightSizing": "Height sizing",

  // Sizing/align/justify tokens shown as visible labels (technical tokens kept verbatim).
  "canvasPanel.value.start": "start",
  "canvasPanel.value.center": "center",
  "canvasPanel.value.end": "end",
  "canvasPanel.value.stretch": "stretch",
  "canvasPanel.value.baseline": "baseline",
  "canvasPanel.value.spaceBetween": "space-between",
  "canvasPanel.value.spaceAround": "space-around",
  "canvasPanel.value.fixed": "fixed",
  "canvasPanel.value.hug": "hug",
  "canvasPanel.value.fill": "fill",

  // Inspector
  "canvasPanel.props": "Props",
  "canvasPanel.enumEmpty": "—",
  "canvasPanel.advancedRawJson": "Advanced (raw JSON)",
  "canvasPanel.apply": "Apply",
  "canvasPanel.slots": "Slots",
  "canvasPanel.removeChildFromSlot": "Remove {child} from {slot}",
  "canvasPanel.addChildToSlot": "Assign child to {slot}",
  "canvasPanel.addChildOption": "+ add child…",
  "canvasPanel.noSlots": "This component declares no slots. Add slots in the Components panel.",
  "canvasPanel.saveAsComponent": "Save as component",
  "canvasPanel.exportNode": "Export node",

  // Toolbar / viewport
  "canvasPanel.newLayoutComponent": "+ New layout component",
  "canvasPanel.viewportSize": "{width} x {height}",
  "canvasPanel.legacyGrid": "Legacy grid",
  "canvasPanel.legacyGridColumns": "{pc}/{tablet}/{mobile} columns",

  // Page export
  "canvasPanel.pageExport": "Page export",
  "canvasPanel.pageId": "Page id",
  "canvasPanel.exportPage": "Export page",
  "canvasPanel.defaultPageName": "Page",
  "canvasPanel.pageExportError": "Page could not be exported.",
} as const;

export const canvasPanelKo: Record<keyof typeof canvasPanelEn, string> = {
  "canvasPanel.title": "캔버스",

  // Auto-layout inspector
  "canvasPanel.autoLayout": "자동 레이아웃",
  "canvasPanel.autoLayoutMode": "자동 레이아웃 모드",
  "canvasPanel.layoutMode.none": "none (absolute)",
  "canvasPanel.layoutMode.horizontal": "horizontal (row)",
  "canvasPanel.layoutMode.vertical": "vertical (column)",
  "canvasPanel.align": "정렬",
  "canvasPanel.alignItems": "항목 정렬",
  "canvasPanel.justify": "배치",
  "canvasPanel.justifyContent": "콘텐츠 배치",
  "canvasPanel.gap": "간격",
  "canvasPanel.layoutGap": "레이아웃 간격",
  "canvasPanel.padding": "여백",
  "canvasPanel.layoutPadding": "레이아웃 여백",
  "canvasPanel.spacingPlaceholder": "{spacing.2}",
  "canvasPanel.wrap": "줄바꿈",
  "canvasPanel.width": "너비",
  "canvasPanel.widthSizing": "너비 크기 조정",
  "canvasPanel.height": "높이",
  "canvasPanel.heightSizing": "높이 크기 조정",

  // Sizing/align/justify tokens shown as visible labels (technical tokens kept verbatim).
  "canvasPanel.value.start": "start",
  "canvasPanel.value.center": "center",
  "canvasPanel.value.end": "end",
  "canvasPanel.value.stretch": "stretch",
  "canvasPanel.value.baseline": "baseline",
  "canvasPanel.value.spaceBetween": "space-between",
  "canvasPanel.value.spaceAround": "space-around",
  "canvasPanel.value.fixed": "fixed",
  "canvasPanel.value.hug": "hug",
  "canvasPanel.value.fill": "fill",

  // Inspector
  "canvasPanel.props": "속성",
  "canvasPanel.enumEmpty": "—",
  "canvasPanel.advancedRawJson": "고급 (원시 JSON)",
  "canvasPanel.apply": "적용",
  "canvasPanel.slots": "슬롯",
  "canvasPanel.removeChildFromSlot": "{slot}에서 {child} 제거",
  "canvasPanel.addChildToSlot": "{slot}에 자식 할당",
  "canvasPanel.addChildOption": "+ 자식 추가…",
  "canvasPanel.noSlots": "이 컴포넌트에는 슬롯이 없습니다. 컴포넌트 패널에서 슬롯을 추가하세요.",
  "canvasPanel.saveAsComponent": "컴포넌트로 저장",
  "canvasPanel.exportNode": "노드 내보내기",

  // Toolbar / viewport
  "canvasPanel.newLayoutComponent": "+ 새 레이아웃 컴포넌트",
  "canvasPanel.viewportSize": "{width} x {height}",
  "canvasPanel.legacyGrid": "레거시 그리드",
  "canvasPanel.legacyGridColumns": "{pc}/{tablet}/{mobile} 열",

  // Page export
  "canvasPanel.pageExport": "페이지 내보내기",
  "canvasPanel.pageId": "페이지 id",
  "canvasPanel.exportPage": "페이지 내보내기",
  "canvasPanel.defaultPageName": "페이지",
  "canvasPanel.pageExportError": "페이지를 내보낼 수 없습니다.",
};
