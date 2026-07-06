import type { CSSProperties } from "react";

export const editorShellStyle: CSSProperties = {
  height: "100vh",
  display: "grid",
  gridTemplateRows: "40px minmax(0, 1fr)",
  gridTemplateColumns: "200px minmax(0, 1fr)",
  overflow: "hidden",
  background: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.9)",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export const topBarStyle: CSSProperties = {
  gridColumn: "1 / -1",
  borderBottom: "1px solid #e6e6e6",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "0 14px",
};

export const productTitleStyle: CSSProperties = { fontSize: 13, fontWeight: 600 };

export const panelTabsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(72px, 1fr))",
  gap: 4,
};

export const panelTabStyle: CSSProperties = {
  height: 32,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#4e5968",
  cursor: "pointer",
  fontWeight: 600,
  textTransform: "capitalize",
};

export const panelTabActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#123b72",
};

export const topBarControlStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto auto auto",
  alignItems: "center",
  gap: 8,
  minWidth: 280,
};

export const topBarControlLabelStyle: CSSProperties = {
  color: "#5d6775",
  fontSize: 12,
  fontWeight: 600,
};

export const topBarControlValueStyle: CSSProperties = {
  minWidth: 42,
  color: "#3f4a5a",
  fontSize: 12,
  textAlign: "right",
};
export const persistErrorStyle: CSSProperties = {
  color: "#b42318",
  fontSize: 12,
  lineHeight: 1.4,
};

export const schemeSegmentedStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 54px)",
  gap: 3,
};

export const schemeButtonStyle: CSSProperties = {
  height: 28,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#4e5968",
  padding: 0,
  fontSize: 12,
  cursor: "pointer",
  textTransform: "capitalize",
};

export const schemeButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#153e75",
};

export const localeControlStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export const localeSegmentedStyle: CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gap: 3,
};

export const localeButtonStyle: CSSProperties = {
  height: 28,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#4e5968",
  padding: "0 10px",
  fontSize: 12,
  cursor: "pointer",
};

export const sidebarStyle: CSSProperties = {
  minHeight: 0,
  borderRight: "1px solid #e6e6e6",
  background: "#ffffff",
  padding: 10,
  display: "grid",
  alignContent: "start",
  gap: 10,
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
};

export const sidebarTitleStyle: CSSProperties = { fontWeight: 700, fontSize: 15 };

export const toolbarStyle: CSSProperties = { display: "grid", gap: 8 };

export const toolbarButtonStyle: CSSProperties = {
  height: 36,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  textAlign: "left",
  padding: "0 11px",
  color: "#263241",
  cursor: "pointer",
};

export const listStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

export const emptyListStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: 13,
  lineHeight: 1.45,
  padding: "8px 2px",
};

export const tokenTypeButtonStyle: CSSProperties = {
  minHeight: 48,
  border: "1px solid transparent",
  borderRadius: 8,
  background: "transparent",
  color: "#1f2937",
  padding: "8px 10px",
  display: "grid",
  gap: 3,
  textAlign: "left",
};

export const tokenTypeButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#123b72",
};

export const tokenTypeNameStyle: CSSProperties = {
  fontWeight: 700,
  lineHeight: "18px",
};

export const tokenTypeMetaStyle: CSSProperties = {
  color: "#657386",
  fontSize: 11,
  lineHeight: "16px",
};

export const componentListStyle: CSSProperties = {
  display: "grid",
  gap: 3,
};

export const componentListButtonStyle: CSSProperties = {
  minHeight: 38,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#171a20",
  padding: "7px 8px",
  display: "grid",
  gap: 2,
  textAlign: "left",
};

export const componentListButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
};

export const componentListNameStyle: CSSProperties = {
  minWidth: 0,
  overflowWrap: "anywhere",
  fontWeight: 600,
  lineHeight: "18px",
};

export const componentListIdStyle: CSSProperties = {
  minWidth: 0,
  overflowWrap: "anywhere",
  color: "#6b7280",
  lineHeight: "16px",
};

export const disclosureStyle: CSSProperties = {
  border: 0,
  borderBottom: "1px solid #e6e6e6",
  borderRadius: 0,
  background: "#ffffff",
  padding: "12px 16px",
};

export const summaryStyle: CSSProperties = {
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
};
export const compactFormGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(160px, 1fr))",
  gap: 10,
  marginTop: 10,
};

export const componentStatRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  color: "#5d6775",
  fontSize: 12,
};

export const componentEditModeBarStyle: CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(0, 1fr)",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  padding: 3,
  gap: 3,
};

export const componentEditModeButtonStyle: CSSProperties = {
  minHeight: 22,
  border: "1px solid transparent",
  borderRadius: 4,
  background: "transparent",
  color: "#4e5968",
  padding: "0 6px",
  fontSize: 11,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const componentEditModeButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#153e75",
};
export const tokenMatrixPanelStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: 10,
  padding: 12,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const inlineHelpStyle: CSSProperties = {
  margin: "3px 0 0",
  color: "#6b7280",
  fontSize: 12,
  lineHeight: "16px",
};

export const tokenMatrixScrollStyle: CSSProperties = {
  overflowX: "auto",
  overflowY: "visible",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  scrollbarWidth: "thin",
  scrollbarColor: "#aab4c4 #eef2f7",
  boxShadow: "inset -16px 0 14px -16px rgba(15, 23, 42, 0.28)",
};

export const tokenMatrixTableStyle: CSSProperties = {
  width: "max-content",
  minWidth: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const tokenMatrixHeaderCellStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  minWidth: 132,
  borderBottom: "1px solid #d8e0ea",
  borderRight: "1px solid #e6e6e6",
  background: "#f7f9fc",
  color: "#4e5968",
  padding: "9px 10px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
};

export const tokenMatrixRowHeaderStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  minWidth: 156,
  maxWidth: 220,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #d8e0ea",
  background: "#ffffff",
  color: "#171a20",
  padding: "10px",
  textAlign: "left",
  verticalAlign: "top",
  overflowWrap: "anywhere",
  fontSize: 12,
};

export const tokenMatrixCellStyle: CSSProperties = {
  minWidth: 132,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #e6e6e6",
  padding: 7,
  verticalAlign: "top",
};

export const tokenMatrixColorCellStyle: CSSProperties = {
  minWidth: 120,
  minHeight: 64,
  boxSizing: "border-box",
  border: "1px solid transparent",
  borderRadius: 6,
  display: "grid",
  gridTemplateColumns: "28px minmax(0, 1fr)",
  gap: 6,
  alignItems: "center",
  padding: 4,
};

export const tokenMatrixCellActiveStyle: CSSProperties = {
  borderColor: "transparent",
  background: "#e5f4ff",
  boxShadow: "0 0 0 2px #0d99ff",
};

export const tokenMatrixColorPickerStyle: CSSProperties = {
  width: 28,
  height: 42,
  border: "1px solid #e6e6e6",
  borderRadius: 5,
  padding: 2,
  background: "#ffffff",
};

export const tokenMatrixColorFallbackSwatchStyle: CSSProperties = {
  width: 28,
  height: 42,
  border: "1px dashed #b9c2d0",
  borderRadius: 5,
  background: "#f6f8fb",
};

export const tokenMatrixValueInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  maxWidth: 116,
  minHeight: 32,
  border: "1px solid #e6e6e6",
  borderRadius: 5,
  background: "#ffffff",
  color: "#171a20",
  padding: "0 6px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
};

export const tokenMatrixInputActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
};

export const tokenMatrixObjectCellStyle: CSSProperties = {
  width: "100%",
  maxWidth: 240,
  minHeight: 34,
  border: "1px solid #e6e6e6",
  borderRadius: 5,
  background: "#ffffff",
  color: "#4e5968",
  padding: "6px",
  textAlign: "left",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
};

export const tokenMatrixEmptyCellStyle: CSSProperties = {
  color: "#a1a9b5",
  fontSize: 12,
};

// --- Color comparison matrix (light left / dark right) ---------------------

const checkerboardBackground: CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, #d9dee7 25%, transparent 25%), linear-gradient(-45deg, #d9dee7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d9dee7 75%), linear-gradient(-45deg, transparent 75%, #d9dee7 75%)",
  backgroundSize: "10px 10px",
  backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
  backgroundColor: "#ffffff",
};

export const colorSchemeLegendStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#5d6775",
  fontSize: 11,
  fontWeight: 600,
};

export const colorSchemeLegendSwatchLightStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 3,
  border: "1px solid #e6e6e6",
  background: "#ffffff",
};

export const colorSchemeLegendSwatchDarkStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 3,
  border: "1px solid #2c2c31",
  background: "#18181b",
};

// Groups (primary, default, …) lay out as responsive cards; inside each card,
// variations (base, hover, …) stack as rows and only light|dark split into two
// columns. table-layout:fixed + min-width:0 keep inputs inside narrow cards
// (no horizontal scroll).
export const colorComparisonGridStyle: CSSProperties = {
  // One group card per row: full width is clearer than a multi-column wall of
  // cards, and gives each light/dark value input room to show its full value.
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 12,
  minWidth: 0,
};

export const colorGroupCardStyle: CSSProperties = {
  border: "1px solid #e3e9f2",
  borderRadius: 10,
  background: "#ffffff",
  padding: "12px 16px 6px",
  minWidth: 0,
  maxWidth: 1040,
  display: "grid",
  gap: 6,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const colorGroupHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 8,
  paddingBottom: 4,
  borderBottom: "1px solid #eef2f7",
  color: "#171a20",
  fontSize: 14,
  fontWeight: 700,
};

export const colorGroupCountStyle: CSSProperties = {
  color: "#8a93a3",
  fontSize: 11,
  fontWeight: 600,
};

export const colorGroupTableStyle: CSSProperties = {
  width: "100%",
  tableLayout: "fixed",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const colorGroupColHeadStyle: CSSProperties = {
  textAlign: "left",
  padding: "4px 4px 6px 0",
  color: "#8a93a3",
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const colorGroupCornerStyle: CSSProperties = {
  width: 70,
};

export const colorVariationHeadStyle: CSSProperties = {
  width: 76,
  textAlign: "left",
  verticalAlign: "middle",
  padding: "9px 10px 9px 10px",
  borderTop: "1px solid #f2f5fa",
  color: "#4e5968",
  fontSize: 12,
  fontWeight: 600,
  overflowWrap: "anywhere",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

export const colorVariationRowActiveStyle: CSSProperties = {
  background: "#f3f7ff",
};

export const colorSideCellStyle: CSSProperties = {
  padding: "9px 16px 9px 0",
  verticalAlign: "middle",
  borderTop: "1px solid #f2f5fa",
};

export const colorSideStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
};

export const colorSideRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px minmax(0, 1fr) auto",
  gap: 8,
  alignItems: "center",
  minWidth: 0,
};
// Swatch-triggered color+alpha picker popover (native color input has no alpha,
// so alpha is a slider here and the value recombines to hex / rgba()).
export const colorPickerWrapStyle: CSSProperties = {
  position: "relative",
  width: 40,
  height: 32,
};

export const colorSwatchTriggerStyle: CSSProperties = {
  width: 40,
  height: 32,
  borderRadius: 7,
  border: "1px solid #d3dae6",
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.45)",
  overflow: "hidden",
  cursor: "pointer",
  padding: 0,
  ...checkerboardBackground,
};

export const colorPickerBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 40,
};

export const colorPickerPopoverStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  left: 0,
  zIndex: 41,
  width: 216,
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
  padding: 12,
  display: "grid",
  gap: 10,
};
export const colorPickerPreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
  color: "#171a20",
  overflowWrap: "anywhere",
};

export const colorPickerPreviewSwatchStyle: CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 4,
  border: "1px solid #e6e6e6",
  flex: "0 0 auto",
  ...checkerboardBackground,
};

// Inline (single-step) HSV color picker: saturation/value 2D area + hue bar +
// alpha bar, all pointer-driven (no nested OS color dialog).
export const colorPickerSvStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: 132,
  borderRadius: 8,
  border: "1px solid #e6e6e6",
  cursor: "crosshair",
  touchAction: "none",
};

export const colorPickerSvThumbStyle: CSSProperties = {
  position: "absolute",
  width: 14,
  height: 14,
  borderRadius: "50%",
  border: "2px solid #ffffff",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.35)",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
};

export const colorPickerHueStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: 14,
  borderRadius: 7,
  cursor: "pointer",
  touchAction: "none",
  background:
    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
};

export const colorPickerBarThumbStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "2px solid #ffffff",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.35)",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
};

export const colorPickerAlphaTrackStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: 14,
  borderRadius: 7,
  overflow: "hidden",
  cursor: "pointer",
  touchAction: "none",
  ...checkerboardBackground,
};

export const colorPickerAlphaOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 7,
  pointerEvents: "none",
};

export const colorPickerStackStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};
export const colorSideInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  minHeight: 32,
  boxSizing: "border-box",
  border: "1px solid #dde3ec",
  borderRadius: 7,
  background: "#ffffff",
  color: "#171a20",
  padding: "0 10px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
};

export const colorTokenToggleStyle: CSSProperties = {
  height: 32,
  border: "1px solid #dde3ec",
  borderRadius: 7,
  background: "#f4f7fc",
  color: "#6b7686",
  cursor: "pointer",
  fontSize: 11,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  padding: "0 10px",
  whiteSpace: "nowrap",
};

// The `{token}` reference picker renders as a floating popover anchored to its
// button (so it overlays instead of pushing the matrix down).
export const colorTokenPickerAnchorStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
};

export const colorTokenPickerPopoverStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: 0,
  zIndex: 41,
  width: 300,
  maxWidth: "72vw",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)",
  padding: 10,
};

export const colorSideEmptyButtonStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  minHeight: 26,
  boxSizing: "border-box",
  border: "1px dashed #b9c2d0",
  borderRadius: 5,
  background: "#f6f8fb",
  color: "#6b7280",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

export const typographyWorkspaceStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  display: "grid",
  gap: 12,
  padding: 12,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const typographyWorkspaceHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
};

export const typographyWorkspaceCountStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  justifyContent: "flex-end",
  color: "#5d6775",
  fontSize: 12,
};
// --- Typography workspace redesign (foundations / scale ramp / style cards) ---

export const typographyCardStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  background: "#ffffff",
  padding: 14,
  display: "grid",
  gap: 12,
  minWidth: 0,
};

export const typographyCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontSize: 11,
  fontWeight: 700,
  color: "#4e5968",
};

export const typographyCardMetaStyle: CSSProperties = {
  color: "#8a95a3",
  fontWeight: 600,
};
export const fontSpecimenBadgeStyle: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#2f9e6b",
};

export const fontSpecimenFieldStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  minWidth: 0,
};

export const fontSpecimenAssetRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  alignItems: "center",
};
export const familyListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

export const familyCardStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "minmax(180px, 240px) minmax(0, 1fr)",
  gap: 18,
  alignItems: "start",
  border: "1px solid #e0e7f0",
  borderRadius: 12,
  background: "#ffffff",
  padding: 16,
};

export const familyCardSpecimenStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 8,
  alignContent: "start",
  paddingRight: 18,
  borderRight: "1px solid #eef2f7",
  minWidth: 0,
};

export const familyCardBodyStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  minWidth: 0,
};

export const familyAddButtonStyle: CSSProperties = {
  marginTop: 12,
  width: "100%",
  border: "1px dashed #c5d0e0",
  borderRadius: 10,
  background: "#ffffff",
  color: "#2f6df6",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: "12px",
};

export const familyWeightToggleLabelStyle: CSSProperties = {
  display: "block",
  marginTop: 10,
  marginBottom: 4,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.3,
  textTransform: "uppercase",
  color: "#8a93a3",
};

export const familyWeightToggleRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};

export const familyWeightChipStyle: CSSProperties = {
  minWidth: 34,
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 11,
  cursor: "pointer",
  lineHeight: 1.2,
  textAlign: "center",
};

export const familyWeightChipOnStyle: CSSProperties = {
  border: "1px solid #2f6df6",
  background: "#e5f4ff",
  color: "#1b3f8f",
};

export const familyWeightChipOffStyle: CSSProperties = {
  border: "1px solid #e3e7ee",
  background: "#ffffff",
  color: "#aab2c0",
};

export const styleCardHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flex: "0 0 auto",
};

export const colorMatrixHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

export const colorVariationDeleteStyle: CSSProperties = {
  flex: "0 0 auto",
  width: 18,
  height: 18,
  lineHeight: "14px",
  border: "1px solid #e6c9c9",
  borderRadius: 5,
  background: "#fdf3f3",
  color: "#b4231f",
  fontSize: 12,
  cursor: "pointer",
  padding: 0,
};

// Trailing cell that holds each variation's delete control on the right edge.
export const colorVariationDeleteCellStyle: CSSProperties = {
  width: 38,
  textAlign: "right",
  verticalAlign: "middle",
  padding: "9px 10px 9px 6px",
  borderTop: "1px solid #f2f5fa",
};

// Color-set (group) header rename + delete controls.
export const colorGroupActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
};

export const colorGroupRenameButtonStyle: CSSProperties = {
  border: "1px solid #d8dee8",
  borderRadius: 5,
  background: "#f7f9fc",
  color: "#4e5968",
  fontSize: 11,
  fontWeight: 600,
  padding: "2px 8px",
  cursor: "pointer",
};

export const colorGroupRenameInputStyle: CSSProperties = {
  border: "1px solid #9db8e8",
  borderRadius: 6,
  padding: "2px 6px",
  fontSize: 13,
  fontWeight: 700,
  color: "#171a20",
  width: 160,
};

// Usage-checked color deletion dialog (repoint references before removal).
export const colorDeleteOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.32)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  padding: 20,
};

export const colorDeleteDialogStyle: CSSProperties = {
  width: "min(460px, 100%)",
  maxHeight: "80vh",
  overflow: "auto",
  background: "#ffffff",
  borderRadius: 12,
  border: "1px solid #e3e9f2",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.24)",
  padding: 20,
  display: "grid",
  gap: 12,
};

export const colorDeleteTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#171a20",
};

export const colorDeleteUsageListStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: "grid",
  gap: 2,
  fontSize: 12,
  color: "#4e5968",
  maxHeight: 160,
  overflow: "auto",
};

export const colorDeleteFieldLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#4e5968",
  display: "grid",
  gap: 4,
};

export const colorDeleteSelectStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 7,
  padding: "6px 8px",
  fontSize: 13,
  color: "#171a20",
  background: "#ffffff",
};

export const colorDeleteActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 4,
};

export const colorDeleteCancelStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 7,
  background: "#ffffff",
  color: "#3a4658",
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const colorDeleteConfirmStyle: CSSProperties = {
  border: "1px solid #c0322e",
  borderRadius: 7,
  background: "#d93a36",
  color: "#ffffff",
  padding: "7px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

export const typographyAddButtonStyle: CSSProperties = {
  border: "1px solid #c5d4ee",
  borderRadius: 7,
  background: "#e5f4ff",
  color: "#123b72",
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  textTransform: "none",
  letterSpacing: "normal",
};

export const typographyDeleteButtonStyle: CSSProperties = {
  border: "1px solid #e6c9c9",
  borderRadius: 6,
  background: "#fdf3f3",
  color: "#b4231f",
  padding: "3px 8px",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
};

export const scaleRampDeleteStyle: CSSProperties = {
  flex: "0 0 auto",
  width: 26,
  height: 26,
  border: "1px solid #e6c9c9",
  borderRadius: 6,
  background: "#fdf3f3",
  color: "#b4231f",
  fontSize: 13,
  lineHeight: "22px",
  cursor: "pointer",
  padding: 0,
};

export const scaleRampStyle: CSSProperties = {
  display: "grid",
  gap: 0,
  border: "1px solid #e0e7f0",
  borderRadius: 8,
  overflow: "hidden",
  background: "#ffffff",
};

export const scaleRampRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 16,
  padding: "8px 12px",
  borderBottom: "1px solid #f1f4f8",
  minWidth: 0,
};

export const scaleRampSpecimenStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "#171a20",
  lineHeight: 1.1,
};

export const scaleRampRailStyle: CSSProperties = {
  flex: "0 0 auto",
  width: 208,
  display: "flex",
  alignItems: "center",
  gap: 8,
  justifyContent: "flex-end",
};

export const scaleChipLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

// Scalar (spacing / radius) ramp specimen: a left-aligned visual proportional to
// the token's resolved value — a bar for spacing, a rounded box for radius.
export const scalarSpecimenStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  height: 32,
  overflow: "hidden",
};

export const scalarSpecimenBarStyle: CSSProperties = {
  height: 14,
  borderRadius: 3,
  background: "#3b82f6",
  flex: "0 0 auto",
};

export const scalarSpecimenBoxStyle: CSSProperties = {
  width: 44,
  height: 28,
  background: "#e5f4ff",
  border: "2px solid #3b82f6",
  flex: "0 0 auto",
};

export const scalarSpecimenEmptyStyle: CSSProperties = {
  fontSize: 12,
  color: "#9aa3b2",
  padding: "10px 4px",
};

export const styleCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: 14,
  minWidth: 0,
};

export const styleCardStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  background: "#ffffff",
  padding: 14,
  display: "grid",
  gap: 12,
  minWidth: 0,
};

export const styleCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  minWidth: 0,
};

export const styleCardTitleStyle: CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
};

export const styleCardNameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#171a20",
  overflowWrap: "anywhere",
};

export const typographyStyleSummaryStyle: CSSProperties = {
  fontSize: 11,
  color: "#6b7280",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export const styleSpecimenStyle: CSSProperties = {
  border: "1px solid #eef2f7",
  borderRadius: 8,
  background: "#fcfdff",
  padding: 12,
  minHeight: 72,
  overflow: "hidden",
};

export const styleFieldsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  minWidth: 0,
};

export const styleFieldStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  minWidth: 0,
};

export const styleFieldWideStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  minWidth: 0,
  gridColumn: "1 / -1",
};

export const styleFieldLabelStyle: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#8a95a3",
};

export const projectRoleAddCardStyle: CSSProperties = {
  border: "1px dashed #c5d0e0",
  borderRadius: 10,
  background: "#ffffff",
  padding: 14,
  minHeight: 120,
  display: "grid",
  gap: 8,
  alignContent: "center",
  justifyItems: "start",
  color: "#4e5968",
};

export const projectRoleAddButtonStyle: CSSProperties = {
  border: "1px solid #c5d4ee",
  borderRadius: 7,
  background: "#e5f4ff",
  color: "#123b72",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
export const typographyTokenPathButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 32,
  border: "1px solid transparent",
  borderRadius: 5,
  background: "transparent",
  color: "#263241",
  padding: "5px 6px",
  textAlign: "left",
  overflowWrap: "anywhere",
  fontSize: 12,
};

export const typographyTokenPathButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#123b72",
};

export const typographyInlineInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: 32,
  border: "1px solid #e6e6e6",
  borderRadius: 5,
  background: "#ffffff",
  color: "#171a20",
  padding: "0 7px",
  fontSize: 12,
};
export const fontAttachButtonStyle: CSSProperties = {
  minHeight: 30,
  border: "1px solid #9fb4cf",
  borderRadius: 6,
  background: "#ffffff",
  color: "#263241",
  padding: "6px 9px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};

export const hiddenFileInputStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: "none",
};

export const fontAssetNameStyle: CSSProperties = {
  maxWidth: 180,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "#4e5968",
  fontSize: 12,
};

export const fontAssetEmptyStyle: CSSProperties = {
  color: "#8a95a3",
  fontSize: 12,
};

export const fontRemoveButtonStyle: CSSProperties = {
  minHeight: 28,
  border: "1px solid #e1b4af",
  borderRadius: 6,
  background: "#fff8f7",
  color: "#a23a32",
  padding: "0 8px",
  fontSize: 12,
};
export const summaryListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#4e5968",
  fontSize: 13,
};

export const smallButtonStyle: CSSProperties = {
  minHeight: 32,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 10px",
  textAlign: "left",
  color: "#263241",
  cursor: "pointer",
  boxShadow: "0 1px 1px rgba(15, 23, 42, 0.03)",
};

// Figma-density action button for the component workspace: 24px, 11px text.
export const railButtonStyle: CSSProperties = {
  ...smallButtonStyle,
  minHeight: 24,
  padding: "0 8px",
  fontSize: 11,
  border: "1px solid transparent",
  borderRadius: 5,
  background: "#f5f5f5",
  boxShadow: "none",
};

export const dangerButtonStyle: CSSProperties = {
  ...railButtonStyle,
  color: "#b42318",
  border: "1px solid #f0b8b2",
};

export const segmentedStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 4,
};

export const segmentedButtonStyle: CSSProperties = {
  minHeight: 28,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  padding: 0,
  cursor: "pointer",
  textTransform: "capitalize",
};

export const segmentedButtonActiveStyle: CSSProperties = {
  background: "#e5f4ff",
  border: "1px solid #0d99ff",
};

export const inspectorStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 10,
};

export const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: "#4e5d70",
  fontWeight: 600,
};

export const checkboxFieldStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 34,
  fontSize: 12,
  color: "#5d6775",
};

// Rail-density form label + checkbox rows (component workspace forms).
export const railFieldStyle: CSSProperties = {
  ...fieldStyle,
  gap: 3,
  fontSize: 11,
};

export const railCheckboxFieldStyle: CSSProperties = {
  ...checkboxFieldStyle,
  minHeight: 24,
  fontSize: 11,
  gap: 6,
};

export const railCheckboxInputStyle: CSSProperties = {
  width: 13,
  height: 13,
  margin: 0,
  flex: "none",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  height: 38,
  // border-box: a 100%-width padded input must not overflow its grid cell.
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  padding: "0 10px",
  fontSize: 13,
  color: "#171a20",
  background: "#ffffff",
  boxShadow: "inset 0 1px 1px rgba(15, 23, 42, 0.03)",
};

// Figma-density rail controls: 24px, 11px text; numeric fields right-aligned.
export const railInputStyle: CSSProperties = {
  ...inputStyle,
  height: 24,
  padding: "0 6px",
  fontSize: 11,
  border: "1px solid transparent",
  borderRadius: 5,
  background: "#f5f5f5",
  boxShadow: "none",
  textAlign: "right",
  fontVariantNumeric: "tabular-nums",
};

export const railSelectStyle: CSSProperties = {
  ...inputStyle,
  height: 24,
  padding: "0 18px 0 6px",
  fontSize: 11,
  border: "1px solid transparent",
  borderRadius: 5,
  boxShadow: "none",
  appearance: "none",
  background:
    "#f5f5f5 url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M1.5 3l2.5 2.5L6.5 3' fill='none' stroke='rgba(0,0,0,0.5)' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat right 5px center",
};

// Figma in-field leading glyph (W/H/X/Y) — absolutely positioned over the field.
export const fieldGlyphStyle: CSSProperties = {
  position: "absolute",
  left: 7,
  top: 0,
  height: 24,
  display: "flex",
  alignItems: "center",
  fontSize: 11,
  color: "rgba(0, 0, 0, 0.5)",
  pointerEvents: "none",
  zIndex: 1,
};

// Two geometry fields per row (W|H, X|Y), Figma UI3.
export const geometryPairStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
  minWidth: 0,
};

// 20px chevron-only mode dropdown attached to a fixed-size field.
export const modeChevronSelectStyle: CSSProperties = {
  height: 24,
  width: 20,
  flex: "none",
  border: "1px solid transparent",
  borderRadius: 5,
  appearance: "none",
  padding: 0,
  overflow: "hidden",
  color: "transparent",
  background:
    "#f5f5f5 url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M1.5 3l2.5 2.5L6.5 3' fill='none' stroke='rgba(0,0,0,0.5)' stroke-linecap='round'/%3E%3C/svg%3E\") no-repeat center",
  cursor: "pointer",
};

// Left-aligned rail input for text (names, values, descriptions) — numerics
// keep railInputStyle's right alignment.
export const railTextInputStyle: CSSProperties = {
  ...railInputStyle,
  textAlign: "left",
  fontVariantNumeric: "normal",
};

export const selectStyle: CSSProperties = {
  ...inputStyle,
};

export const textareaStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 90,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  padding: 10,
  resize: "vertical",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  lineHeight: "18px",
  background: "#ffffff",
  color: "#171a20",
};

// Rail-density textarea (multiline prop values, notes) for the component workspace.
export const railTextareaStyle: CSSProperties = {
  ...textareaStyle,
  minHeight: 60,
  padding: 6,
  fontSize: 11,
  lineHeight: "16px",
  border: "1px solid transparent",
  borderRadius: 5,
  background: "#f5f5f5",
  boxShadow: "none",
};

export const errorTextStyle: CSSProperties = {
  color: "#b42318",
  fontSize: 12,
  lineHeight: 1.4,
};

export const errorBannerStyle: CSSProperties = {
  border: "1px solid #f0b8b2",
  borderRadius: 6,
  padding: 10,
  color: "#b42318",
  background: "#fff4f2",
  fontSize: 13,
};

export const slotRowStyle: CSSProperties = {
  display: "grid",
  gap: 5,
};

export const slotRowLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#52525b",
};

export const propRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "84px minmax(0, 1fr)",
  alignItems: "center",
  gap: 8,
};

// Figma-style THREE-pane component-set editor: layers (left) + variant-set
// preview (center) + properties rail (right).
export const componentPanelWorkspaceLayout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px minmax(0, 1fr) 240px",
  gap: 0,
  alignItems: "stretch", // panels run full height, Figma-style
  width: "100%",
  minWidth: 0,
  minHeight: "100%",
};

export const layersColumnStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  display: "grid",
  gap: 0,
  alignContent: "start",
  minWidth: 0,
  background: "#ffffff",
  borderRight: "1px solid #e6e6e6",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  overscrollBehavior: "contain",
};

// Drag handle straddling the gap on the layers column's right edge.
export const layerResizeHandleStyle: CSSProperties = {
  // Fully INSIDE the column: the panel scrolls (overflow-y auto), which also
  // clips the x-axis — a handle hanging outside (right:-9) loses its hit area.
  position: "absolute",
  top: 0,
  bottom: 0,
  right: 0,
  width: 8,
  cursor: "col-resize",
  borderRight: "2px solid transparent",
  zIndex: 5,
};

export const stickyPreviewColumnStyle: CSSProperties = {
  display: "grid",
  gap: 24,
  alignContent: "start",
  minWidth: 0,
  padding: 24,
};

export const propertiesRailStyle: CSSProperties = {
  display: "grid",
  gap: 0,
  alignContent: "start",
  minWidth: 0,
  background: "#ffffff",
  borderLeft: "1px solid #e6e6e6",
  // Pin the inspector and give it its own scroll, so you can scroll the (tall)
  // variant matrix in the center while editing properties here — instead of the
  // rail scrolling off the top with the page. (main is the scroll container,
  // 100vh − 52px header; 12px sticky top + 12px bottom breathing.)
  position: "sticky",
  top: 0,
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  overscrollBehavior: "contain",
};

// Figma UI3 section title: 11px semibold, mixed case.
export const railSectionTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(0, 0, 0, 0.9)",
};

// Flat inspector section: hairline-divided, Figma UI3 (no cards).
export const railSectionStyle: CSSProperties = {
  borderBottom: "1px solid #e6e6e6",
  padding: "8px 16px 12px",
  display: "grid",
  alignContent: "start",
  minWidth: 0,
  gap: 8,
  background: "#ffffff",
};

export const editSchemaBodyStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 12,
};

// Figma-style layers list (anatomy parts) + per-part appearance rows.
export const layersListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
};

// Figma-style hierarchical layers tree (vertical rows, indent by depth).
export const layerTreeStyle: CSSProperties = {
  display: "grid",
  // Cap the column at the container width (min 0) so deep/long rows can't blow the
  // grid out past the panel — without this an auto column grows to the widest row.
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 1,
};

export const layerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  // Grid item must be allowed to shrink below its content so the name ellipsises.
  minWidth: 0,
  height: 24,
  padding: "0 8px",
  borderRadius: 0,
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 400,
  color: "rgba(0, 0, 0, 0.8)",
  userSelect: "none",
  border: "1px solid transparent",
};

export const layerRowActiveStyle: CSSProperties = {
  // Figma UI3 full-row selection tint; keep the border SHORTHAND (see note in
  // git history: React clears removed longhands to currentColor).
  background: "#e5f4ff",
  border: "1px solid transparent",
  color: "rgba(0, 0, 0, 0.9)",
  fontWeight: 400,
};

export const layerIconStyle: CSSProperties = {
  width: 14,
  flexShrink: 0,
  textAlign: "center",
  color: "rgba(0, 0, 0, 0.45)",
  fontSize: 11,
};

export const layerNameStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
  // Without this a flex item won't shrink below its content, so deep/long layer
  // names overflow the column and get clipped raw instead of ellipsised.
  minWidth: 0,
};

export const layerRenameInputStyle: CSSProperties = {
  font: "inherit",
  flex: 1,
  minWidth: 0,
  border: "1px solid #6366f1",
  borderRadius: 3,
  padding: "1px 4px",
};

export const layerDisclosureStyle: CSSProperties = {
  width: 14,
  flexShrink: 0,
  border: "none",
  background: "transparent",
  color: "#a1a1aa",
  cursor: "pointer",
  fontSize: 11,
  lineHeight: 1,
  padding: 0,
  textAlign: "center",
};

export const layerDropIndicatorStyle: CSSProperties = {
  position: "absolute",
  left: 4,
  right: 4,
  height: 2,
  background: "#3b82f6",
  borderRadius: 2,
  pointerEvents: "none",
};

// Row-trailing eye/lock toggles (Figma-style): hidden until the row is hovered
// or the flag is on; the row controls visibility via inline opacity.
export const layerFlagButtonStyle: CSSProperties = {
  width: 16,
  height: 16,
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: "transparent",
  color: "#a1a1aa",
  cursor: "pointer",
  padding: 0,
  borderRadius: 3,
};

export const layerFlagButtonOnStyle: CSSProperties = {
  color: "#3f3f46",
};

export const layerFilterInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 5,
  padding: "3px 8px",
  fontSize: 11,
  marginBottom: 6,
  color: "#3f3f46",
};

// --- Figma-style Auto layout section (design rail) ---

export const autoLayoutRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
  // Crowded control rows (direction+wrap+distribution) wrap instead of
  // overflowing the 320px rail with localized labels.
  flexWrap: "wrap",
};

export const autoLayoutToggleStyle: CSSProperties = {
  minWidth: 26,
  height: 24,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid transparent",
  borderRadius: 5,
  background: "#f5f5f5",
  color: "rgba(0, 0, 0, 0.8)",
  cursor: "pointer",
  fontSize: 11,
  padding: "0 6px",
};

export const autoLayoutToggleActiveStyle: CSSProperties = {
  background: "#e5f4ff",
  border: "1px solid #0d99ff",
  color: "#1d4ed8",
};

export const alignmentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 2,
  width: 72,
  padding: 4,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#fafafa",
  boxSizing: "border-box",
};

export const alignmentDotButtonStyle: CSSProperties = {
  width: "100%",
  height: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 0,
  borderRadius: 3,
};

// --- Figma-style variant Properties card (design rail) ---

export const variantAxisBlockStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  padding: "6px 0",
  borderTop: "1px solid #f1f1f4",
};

export const variantValueNameButtonStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  textAlign: "left",
  border: "1px solid transparent",
  background: "transparent",
  borderRadius: 4,
  padding: "3px 6px",
  fontSize: 11,
  color: "#27272a",
  cursor: "pointer",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const variantValueNameButtonActiveStyle: CSSProperties = {
  background: "#e5f4ff",
  border: "1px solid #0d99ff",
  color: "#1d4ed8",
  fontWeight: 600,
};

export const layerMenuStyle: CSSProperties = {
  position: "fixed",
  zIndex: 81,
  minWidth: 168,
  background: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
  padding: 4,
  display: "grid",
  gap: 1,
};

export const layerMenuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  border: "none",
  background: "transparent",
  borderRadius: 5,
  padding: "6px 10px",
  fontSize: 12,
  color: "#27272a",
  cursor: "pointer",
};

export const layerButtonStyle: CSSProperties = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #e6e6e6",
  background: "#ffffff",
  color: "#3f3f46",
  fontSize: 12,
  cursor: "pointer",
};

export const layerButtonActiveStyle: CSSProperties = {
  background: "#ede9fe",
  borderColor: "#c4b5fd",
  color: "#5b21b6",
  fontWeight: 600,
};

export const appearanceRowStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  minWidth: 0,
};

export const appearanceHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 6,
  minWidth: 0,
};

// Pencil/Figma-style grouped inspector: named property groups with mini headers.
export const appearanceGroupsStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

export const appearanceGroupStyle: CSSProperties = {
  display: "grid",
  gap: 4,
};

export const appearanceGroupTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(0, 0, 0, 0.9)",
  minHeight: 24,
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  userSelect: "none",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
};

// Token chip: [swatch] value ........ token-name — click to open the picker.
export const tokenChipStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  minWidth: 0,
  minHeight: 24,
  padding: "0 8px",
  borderRadius: 5,
  border: "1px solid transparent",
  background: "#f5f5f5",
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
};

// Figma component-set frame on the canvas: dashed purple with a floating label.
export const componentSetFrameStyle: CSSProperties = {
  position: "relative",
  border: "1px dashed #9747ff",
  borderRadius: 5,
  padding: 16,
  minWidth: 0,
};

export const canvasFrameLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "rgba(0, 0, 0, 0.5)",
  marginBottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
};

export const componentSetLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "#9747ff",
  marginBottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
};

// Left panel (Pages-like) components section rows, Figma UI3 density.
export const pagesRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  height: 24,
  padding: "0 8px",
  border: 0,
  borderRadius: 0,
  background: "transparent",
  cursor: "pointer",
  fontSize: 11,
  color: "rgba(0, 0, 0, 0.8)",
  textAlign: "left",
  minWidth: 0,
  width: "100%",
};

export const pagesRowActiveStyle: CSSProperties = {
  background: "#e5f4ff",
  color: "rgba(0, 0, 0, 0.9)",
};

// 40px Figma section header row inside left/right panels.
export const panelSectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  minHeight: 40,
  padding: "0 8px 0 16px",
  minWidth: 0,
};

export const tokenChipValueStyle: CSSProperties = {
  fontSize: 11,
  color: "#1a1a1a",
  // Long raw values (multi-shadow / gradient lists) must ellipsize, never
  // stretch the 320px rail.
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
};

export const tokenChipNameStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  textAlign: "right",
  fontSize: 10,
  color: "#939399",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const appearanceControlStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
};

export const appearanceValueStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 11,
  color: "#71717a",
};

export const swatchStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: 4,
  border: "1px solid rgba(0,0,0,0.08)",
  flexShrink: 0,
};

export const appearanceRemoveStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#a1a1aa",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1,
  padding: 2,
  flexShrink: 0,
};

export const propLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: "#616167",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const advancedDetailsStyle: CSSProperties = {
  marginTop: 2,
  display: "grid",
  gap: 6,
};

export const advancedSummaryStyle: CSSProperties = {
  fontSize: 12,
  color: "#71717a",
  cursor: "pointer",
};

export const slotBadgeWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
};

export const slotBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 4px 2px 8px",
  borderRadius: 6,
  background: "#f4f4f5",
  border: "1px solid #e6e6e6",
  fontSize: 12,
  color: "#27272a",
};

export const slotBadgeRemoveStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 16,
  height: 16,
  borderRadius: 4,
  border: "none",
  background: "transparent",
  color: "#71717a",
  cursor: "pointer",
  fontSize: 13,
  lineHeight: 1,
  padding: 0,
};

export const viewportPanelStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 4,
};

export const legacyGridPanelStyle: CSSProperties = {
  marginTop: 8,
  borderTop: "1px solid #e6e6e6",
  paddingTop: 8,
  display: "grid",
  gap: 4,
  color: "#5d6775",
  fontSize: 12,
};

export const workspaceStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  overflow: "auto",
  padding: 12,
};

export const sectionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 12,
  width: "100%",
  minWidth: 0,
  maxWidth: "none",
};

export const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.2,
  fontWeight: 700,
};

export const sectionMetaStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#5d6775",
  fontSize: 13,
};

export const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};
export const splitPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
  minHeight: 0,
  height: "100%",
  alignItems: "stretch",
};

export const exportSectionStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  minWidth: 0,
  minHeight: 0,
  height: "100%",
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "auto minmax(0, 1fr)",
};

export const exportJsonPanelStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  padding: 12,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateRows: "auto minmax(0, 1fr)",
  minWidth: 0,
  minHeight: 0,
  gap: 10,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const exportJsonTextareaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  resize: "none",
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#171a20",
  padding: 10,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  lineHeight: 1.5,
};

export const cardStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  alignContent: "start",
  minWidth: 0,
  gap: 12,
  padding: 12,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const cardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  minWidth: 0,
};

export const tableStyle: CSSProperties = {
  display: "grid",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  overflow: "hidden",
};

export const tableRowStyle: CSSProperties = {
  // Figma-density list rows (schema props/variants/slots in the rail).
  minHeight: 24,
  border: 0,
  borderBottom: "1px solid #e6e6e6",
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "minmax(96px, 0.45fr) minmax(0, 1fr)",
  gap: 8,
  alignItems: "center",
  padding: "4px 8px",
  fontSize: 11,
  textAlign: "left",
};

export const tableRowActiveStyle: CSSProperties = {
  background: "#e5f4ff",
  color: "#123b72",
};

export const tableCellTextStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const tableCellMetaStyle: CSSProperties = {
  minWidth: 0,
  justifySelf: "end",
  textAlign: "right",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 11,
  lineHeight: "16px",
};

export const editorFormStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

// Single-column field list (one control per line) for the rail Variants/Props.
export const railFieldsStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

export const previewPanelStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  padding: 12,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: 10,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const componentPreviewPanelStyle: CSSProperties = {
  ...previewPanelStyle,
};

export const componentMatrixPanelStyle: CSSProperties = {
  borderTop: "1px solid #e6e6e6",
  paddingTop: 10,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: 8,
};

export const componentMatrixHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  color: "#5d6775",
  fontSize: 12,
};

export const componentMatrixScrollStyle: CSSProperties = {
  overflowX: "auto",
  overflowY: "visible",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  scrollbarWidth: "thin",
  scrollbarColor: "#aab4c4 #eef2f7",
  boxShadow: "inset -16px 0 14px -16px rgba(15, 23, 42, 0.28)",
};

export const componentMatrixTableStyle: CSSProperties = {
  width: "max-content",
  minWidth: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const componentMatrixHeaderCellStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  minWidth: 150,
  borderBottom: "1px solid #d8e0ea",
  borderRight: "1px solid #e6e6e6",
  background: "#f7f9fc",
  color: "#4e5968",
  padding: "8px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
};

export const componentMatrixRowHeaderStyle: CSSProperties = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  minWidth: 120,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #d8e0ea",
  background: "#ffffff",
  color: "#171a20",
  padding: "8px",
  textAlign: "left",
  verticalAlign: "middle",
  fontSize: 12,
};

export const componentMatrixCellStyle: CSSProperties = {
  minWidth: 150,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #e6e6e6",
  padding: 6,
  verticalAlign: "middle",
};

export const componentMatrixPreviewButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 82,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  display: "grid",
  placeItems: "center",
  padding: 8,
  cursor: "pointer",
};

export const componentMatrixPreviewButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
};

export const componentMatrixPreviewClipStyle: CSSProperties = {
  // No horizontal cap: the box shrink-wraps to the preview's width so a wide
  // component (e.g. an input) shows in full. `overflow: hidden` + `maxHeight`
  // still clamps tall previews. The matrix's scroll container handles wide
  // matrices; capping width here cropped the right edge of each preview.
  maxHeight: 110,
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
  // Breathing room so content with a negative margin (e.g. the toggle's v1
  // `margin-top: -1px`) isn't flush against the clip edge and cropped.
  padding: 4,
};

// Editor preview: a row of toggle chips to show/hide each v1 toolbar item.
export const editorToolbarToggleRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 4,
  marginBottom: 8,
};
export const editorToggleChipStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: 1.4,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid #e6e6e6",
  background: "#ffffff",
  color: "#9ca3af",
  cursor: "pointer",
};
export const editorToggleChipOnStyle: CSSProperties = {
  borderColor: "#0d99ff",
  background: "#e5f4ff",
  color: "#1f2937",
};

export const componentTokenGroupListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

export const componentTokenGroupStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  display: "grid",
  gap: 8,
  padding: 10,
};

export const componentTokenGroupHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "#5d6775",
  fontSize: 12,
};

export const componentTokenTableScrollStyle: CSSProperties = {
  overflowX: "auto",
  overflowY: "visible",
  border: "1px solid #e0e7f0",
  borderRadius: 6,
  scrollbarWidth: "thin",
  scrollbarColor: "#aab4c4 #eef2f7",
};

export const componentTokenTableStyle: CSSProperties = {
  width: "100%",
  minWidth: 720,
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const componentTokenHeaderCellStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  borderBottom: "1px solid #d8e0ea",
  borderRight: "1px solid #e6e6e6",
  background: "#f7f9fc",
  color: "#4e5968",
  padding: "8px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
};

export const componentTokenRowHeaderStyle: CSSProperties = {
  minWidth: 260,
  maxWidth: 360,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #d8e0ea",
  background: "#ffffff",
  padding: 6,
  textAlign: "left",
  verticalAlign: "middle",
};

export const componentTokenCellStyle: CSSProperties = {
  minWidth: 160,
  borderBottom: "1px solid #e6e6e6",
  borderRight: "1px solid #e6e6e6",
  background: "#ffffff",
  padding: 6,
  verticalAlign: "middle",
};

export const componentTokenPreviewInlineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 0,
};

export const componentDimensionPreviewBarStyle: CSSProperties = {
  display: "block",
  minWidth: 2,
  maxWidth: 180,
  height: 18,
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  borderRadius: 4,
};

export const componentNumberPreviewTrackStyle: CSSProperties = {
  width: 120,
  height: 8,
  borderRadius: 999,
  background: "#e2e8f0",
  overflow: "hidden",
};

export const componentNumberPreviewFillStyle: CSSProperties = {
  display: "block",
  height: "100%",
  borderRadius: 999,
  background: "#5b7fd7",
};

export const emptyStatePanelStyle: CSSProperties = {
  border: "1px dashed #cbd5e1",
  borderRadius: 8,
  background: "#f8fafc",
  padding: 14,
  color: "#6b7280",
  fontSize: 13,
};

export const previewControlRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

export const compactFieldStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  minWidth: 112,
  fontSize: 11,
  color: "#5d6775",
};

export const compactSelectStyle: CSSProperties = {
  height: 30,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 8px",
  fontSize: 12,
};
export const fontPreviewSampleStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: 4,
};

export const fontPreviewTextStyle: CSSProperties = {
  display: "block",
  minWidth: 0,
  overflowWrap: "anywhere",
  fontSize: 20,
  lineHeight: "28px",
  color: "#171a20",
};

export const fontPreviewMetaStyle: CSSProperties = {
  minWidth: 0,
  overflowWrap: "anywhere",
  color: "#6b7280",
  fontSize: 11,
};

export const componentPreviewStageStyle: CSSProperties = {
  minHeight: 168,
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#f8fafc",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: 16,
  padding: 20,
};

export const buttonBasePreviewStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "default",
  outline: "none",
};

export const variantValueRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export const codeStyle: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
};
export const tokenPickerWrapStyle: CSSProperties = {
  position: "relative",
};

export const tokenPickerDropdownStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: "auto",
  // No minWidth on purpose: portaled via AnchoredPortal width="anchor", a
  // minimum wider than the anchor would jut past the viewport clamp.
  maxWidth: "min(320px, 90vw)",
  zIndex: 20,
  maxHeight: 260,
  overflowY: "auto",
  background: "#ffffff",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.16)",
  scrollbarWidth: "thin",
  scrollbarColor: "#aab4c4 #eef2f7",
};

export const tokenPickerOptionStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "16px minmax(0, 1fr) auto",
  alignItems: "center",
  gap: 8,
  width: "100%",
  border: 0,
  borderBottom: "1px solid #f0f3f8",
  background: "transparent",
  padding: "6px 8px",
  textAlign: "left",
  cursor: "pointer",
};

export const tokenPickerSwatchStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 3,
  border: "1px solid #e6e6e6",
  boxSizing: "border-box",
};

export const tokenPickerSwatchEmptyStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 3,
  border: "1px dashed #c3cbd8",
  boxSizing: "border-box",
};

export const tokenPickerLabelStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  color: "#263241",
};

export const tokenPickerValueStyle: CSSProperties = {
  justifySelf: "end",
  maxWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
  color: "#5d6775",
};

export const tokenPickerEmptyStyle: CSSProperties = {
  padding: "8px",
  fontSize: 12,
  color: "#6b7280",
};

// Icon picker: a current-glyph swatch + search input, with a glyph grid popover.
export const iconPickerSwatchStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  flex: "none",
  border: "1px solid #e6e6e6",
  borderRadius: 4,
  background: "#ffffff",
  fontSize: 14,
  color: "#1f2937",
};
export const iconPickerPopoverStyle: CSSProperties = {
  ...tokenPickerDropdownStyle,
  padding: 8,
};
export const iconPickerGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
  gap: 4,
  marginTop: 8,
};
export const iconPickerCellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: "8px 4px",
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  cursor: "pointer",
  overflow: "hidden",
};
export const iconPickerCellActiveStyle: CSSProperties = {
  borderColor: "#0d99ff",
  background: "#e5f4ff",
};
export const iconPickerCellGlyphStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: 1,
  color: "#1f2937",
};
export const iconPickerCellNameStyle: CSSProperties = {
  fontSize: 10,
  color: "#6b7280",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const canvasShellStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  height: "100%",
  overflow: "auto",
  padding: 20,
  boxSizing: "border-box",
  background: "#e6ebf2",
  scrollbarWidth: "thin",
  scrollbarColor: "#aab4c4 #e6ebf2",
  scrollbarGutter: "stable",
};

// Stretches to fill the shell so the artboard centers when smaller, and grows
// to max-content so the shell scrolls (instead of clipping) when the artboard
// is larger than the available area.
export const canvasArtboardStageStyle: CSSProperties = {
  minWidth: "100%",
  minHeight: "100%",
  width: "max-content",
  height: "max-content",
  display: "grid",
  placeItems: "center",
  boxSizing: "border-box",
};

export const previewFrameStyle: CSSProperties = {
  minWidth: 320,
  minHeight: 320,
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
  border: "1px solid #cfd6e2",
  borderRadius: 10,
  background: "#ffffff",
  boxShadow: "0 8px 28px rgba(15, 23, 42, 0.12)",
};

export const canvasPreviewEmptyStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  padding: 24,
  textAlign: "center",
  color: "#8a93a3",
  fontSize: 13,
};

export const componentShapeStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  border: "1px solid #b9c2d0",
  borderRadius: 8,
  background: "#ffffff",
  color: "#171a20",
  display: "grid",
  gridTemplateRows: "32px 1fr 32px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(15, 23, 42, .08)",
};

export const shapeHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 10px",
  background: "#eef2f7",
  borderBottom: "1px solid #e6e6e6",
};

export const shapeMetaStyle: CSSProperties = {
  padding: 10,
  fontSize: 12,
  color: "#5d6775",
};

export const shapeBodyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0 10px",
  fontSize: 12,
  color: "#5d6775",
};

export const shapeLayoutBadgeStyle: CSSProperties = {
  marginLeft: 8,
  padding: "1px 6px",
  borderRadius: 999,
  background: "#e7efff",
  color: "#2f4d86",
  fontSize: 10,
  fontWeight: 700,
};

// Auto-layout frame rendered inside a node shape when layout.mode !== "none".
export const autoLayoutFrameStyle: CSSProperties = {
  display: "flex",
  minHeight: 0,
  margin: 8,
  padding: 8,
  border: "1px dashed #9bb4dd",
  borderRadius: 6,
  background: "#f5f8ff",
  overflow: "hidden",
};

export const slotDropZoneStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  flex: "0 0 auto",
  minWidth: 56,
  minHeight: 36,
  padding: "6px 8px",
  border: "1px solid #c5d4ee",
  borderRadius: 5,
  background: "#ffffff",
  fontSize: 11,
  color: "#3f5275",
};

export const slotDropZoneLabelStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

export const slotDropZoneEmptyStyle: CSSProperties = {
  margin: "auto",
  fontSize: 11,
  color: "#6b7280",
};

// --- Icon editor ---------------------------------------------------------------

export const iconGroupListStyle: CSSProperties = { display: "grid", gap: 3 };

export const iconGroupButtonStyle: CSSProperties = {
  minHeight: 36,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#171a20",
  padding: "7px 9px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  textAlign: "left",
  cursor: "pointer",
};

export const iconGroupButtonActiveStyle: CSSProperties = {
  border: "1px solid #0d99ff",
  background: "#e5f4ff",
  color: "#123b72",
};

export const iconGroupCountStyle: CSSProperties = {
  color: "#657386",
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

export const iconSearchInputStyle: CSSProperties = {
  height: 36,
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 11px",
  color: "#263241",
  fontSize: 13,
};

export const iconBuildPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid transparent",
};

export const iconBuildPillReadyStyle: CSSProperties = {
  background: "#e8f6ee",
  color: "#1a7f47",
  border: "1px solid #aedcc1",
};

export const iconBuildPillStaleStyle: CSSProperties = {
  background: "#fdf3e2",
  color: "#9a6a12",
  border: "1px solid #ecd3a3",
};

export const iconBuildPillBusyStyle: CSSProperties = {
  background: "#e5f4ff",
  color: "#123b72",
  border: "1px solid #b6cdf3",
};

export const iconBuildPillErrorStyle: CSSProperties = {
  background: "#fff4f2",
  color: "#b42318",
  border: "1px solid #f0b8b2",
};

export const iconSaveButtonStyle: CSSProperties = {
  height: 38,
  border: "1px solid #2563eb",
  borderRadius: 7,
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  padding: "0 16px",
  cursor: "pointer",
};

export const iconSaveButtonDisabledStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#e2e8f0",
  color: "#94a3b8",
  cursor: "default",
};

export const iconSpecimenStripStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  border: "1px solid #e6e6e6",
  borderRadius: 8,
  background: "#ffffff",
  padding: "12px 14px",
  fontSize: 26,
  color: "#1f2937",
};

export const iconDropzoneStyle: CSSProperties = {
  border: "1.5px dashed #b9c4d4",
  borderRadius: 10,
  background: "#ffffff",
  padding: 16,
  display: "grid",
  gap: 10,
  color: "#52607a",
};

export const iconDropzoneActiveStyle: CSSProperties = {
  border: "1.5px dashed #2563eb",
  background: "#e5f4ff",
  color: "#1d4ed8",
};

export const iconPasteTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 64,
  boxSizing: "border-box",
  resize: "vertical",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#171a20",
  padding: 9,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  lineHeight: 1.5,
};

export const iconGroupSectionTitleStyle: CSSProperties = {
  margin: "18px 0 6px",
  fontSize: 13,
  fontWeight: 700,
  color: "#3a4658",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

export const iconGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
  gap: 10,
};

export const iconTileStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  background: "#ffffff",
  display: "grid",
  justifyItems: "center",
  gap: 6,
  padding: "14px 8px 10px",
  cursor: "pointer",
  minWidth: 0,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const iconTileActiveStyle: CSSProperties = {
  border: "1px solid #2563eb",
  background: "#f4f8ff",
  boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.18)",
};

export const iconTileGlyphStyle: CSSProperties = {
  width: 40,
  height: 40,
  color: "#1f2937",
  display: "block",
};

export const iconTileNameStyle: CSSProperties = {
  fontSize: 11,
  color: "#374151",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const iconTileCodepointStyle: CSSProperties = {
  fontSize: 10,
  color: "#9aa6b6",
  fontVariantNumeric: "tabular-nums",
};

export const iconInspectorStyle: CSSProperties = {
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  background: "#ffffff",
  padding: 14,
  display: "grid",
  gap: 12,
  alignContent: "start",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const iconInspectorPreviewStyle: CSSProperties = {
  width: 96,
  height: 96,
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  background: "#ffffff",
  display: "grid",
  placeItems: "center",
  color: "#1f2937",
};

export const iconFieldLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#52607a",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

export const iconFieldInputStyle: CSSProperties = {
  height: 34,
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 10px",
  color: "#171a20",
  fontSize: 13,
};

export const iconGroupChecklistStyle: CSSProperties = {
  display: "grid",
  gap: 4,
};

export const iconGroupCheckRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: "#374151",
};

export const iconDangerButtonStyle: CSSProperties = {
  height: 34,
  border: "1px solid #f0b8b2",
  borderRadius: 6,
  background: "#fff4f2",
  color: "#b42318",
  fontWeight: 600,
  padding: "0 12px",
  cursor: "pointer",
};

export const iconDrawWrapStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  border: "1px solid #e6e6e6",
  borderRadius: 12,
  background: "#ffffff",
  padding: 14,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

export const iconDrawToolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
};

export const iconDrawToolButtonStyle: CSSProperties = {
  height: 32,
  border: "1px solid #e6e6e6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#263241",
  padding: "0 10px",
  fontSize: 13,
  cursor: "pointer",
};

export const iconDrawToolButtonActiveStyle: CSSProperties = {
  height: 32,
  border: "1px solid #2563eb",
  borderRadius: 6,
  background: "#2563eb",
  color: "#ffffff",
  padding: "0 10px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const iconDrawCanvasStyle: CSSProperties = {
  width: "100%",
  maxWidth: 520,
  aspectRatio: "1 / 1",
  border: "1px solid #e6e6e6",
  borderRadius: 10,
  touchAction: "none",
  cursor: "crosshair",
  justifySelf: "center",
};

export const iconDrawApplyButtonStyle: CSSProperties = {
  height: 36,
  border: "1px solid #2563eb",
  borderRadius: 7,
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  padding: "0 16px",
  cursor: "pointer",
};
