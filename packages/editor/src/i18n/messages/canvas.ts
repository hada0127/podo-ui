/** Strings for canvas.tsx. en is the source of truth; ko mirrors it. */
export const canvasEn = {
  "canvas.nestedChild": "↳ {label} in {parent}",
  "canvas.autoLayoutDropHere": "auto-layout · drop components here",
  "canvas.autoLayoutAddSlot": "auto-layout · add a slot",
  "canvas.childCount": "{count} child",
  "canvas.propsCount": "{count} props",
  "canvas.slotsCount": "{count} slots",
  "canvas.layoutRow": "→ row",
  "canvas.layoutColumn": "↓ column",
  "canvas.previewEmpty": "Place components on the canvas, then switch to play to test them.",
} as const;

export const canvasKo: Record<keyof typeof canvasEn, string> = {
  "canvas.nestedChild": "↳ {parent} 안의 {label}",
  "canvas.autoLayoutDropHere": "자동 레이아웃 · 여기에 컴포넌트를 놓으세요",
  "canvas.autoLayoutAddSlot": "자동 레이아웃 · 슬롯 추가",
  "canvas.childCount": "자식 {count}개",
  "canvas.propsCount": "속성 {count}개",
  "canvas.slotsCount": "슬롯 {count}개",
  "canvas.layoutRow": "→ 가로",
  "canvas.layoutColumn": "↓ 세로",
  "canvas.previewEmpty": "캔버스에 컴포넌트를 배치한 뒤 플레이로 전환해 테스트하세요.",
};
