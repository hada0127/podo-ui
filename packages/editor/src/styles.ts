import type { CSSProperties } from "react";

export const editorShellStyle: CSSProperties = {
  height: "100vh",
  display: "grid",
  gridTemplateRows: "52px minmax(0, 1fr)",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  overflow: "hidden",
  background: "#eef2f7",
  color: "#171a20",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export const topBarStyle: CSSProperties = {
  gridColumn: "1 / -1",
  borderBottom: "1px solid #d7dee8",
  background: "#fbfcfe",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "0 14px",
};

export const productTitleStyle: CSSProperties = { fontSize: 15 };

export const panelTabsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(92px, 1fr))",
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
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
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
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#4e5968",
  padding: 0,
  fontSize: 12,
  cursor: "pointer",
  textTransform: "capitalize",
};

export const schemeButtonActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
  color: "#153e75",
};

export const sidebarStyle: CSSProperties = {
  minHeight: 0,
  borderRight: "1px solid #d7dee8",
  background: "#fbfcfe",
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
  border: "1px solid #ccd6e3",
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
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
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
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
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
  border: "1px solid #d4dce8",
  borderRadius: 8,
  background: "#fbfcfe",
  padding: 10,
};

export const summaryStyle: CSSProperties = {
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};

export const nestedDisclosureStyle: CSSProperties = {
  border: "1px solid #e0e7f0",
  borderRadius: 6,
  background: "#ffffff",
  padding: 8,
};

export const nestedSummaryStyle: CSSProperties = {
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
  color: "#4e5968",
};

export const detailPanelBodyStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  marginTop: 10,
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
  display: "inline-flex",
  width: "fit-content",
  border: "1px solid #d8dde6",
  borderRadius: 8,
  background: "#ffffff",
  padding: 3,
  gap: 3,
};

export const componentEditModeButtonStyle: CSSProperties = {
  minHeight: 30,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#4e5968",
  padding: "0 10px",
};

export const componentEditModeButtonActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
  color: "#153e75",
};

export const tokenValueEditorStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  alignItems: "stretch",
  gap: 8,
};

export const tokenValueEditorPlainStyle: CSSProperties = {
  display: "grid",
};

export const tokenColorInputStyle: CSSProperties = {
  width: 52,
  minHeight: 72,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  padding: 4,
  background: "#ffffff",
};

export const tokenMatrixPanelStyle: CSSProperties = {
  border: "1px solid #d4dce8",
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
  overflow: "auto",
  maxHeight: "min(64vh, 680px)",
  border: "1px solid #dde5ef",
  borderRadius: 6,
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
  borderRight: "1px solid #edf1f6",
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
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #d8e0ea",
  background: "#fbfcfe",
  color: "#171a20",
  padding: "10px",
  textAlign: "left",
  verticalAlign: "top",
  overflowWrap: "anywhere",
  fontSize: 12,
};

export const tokenMatrixCellStyle: CSSProperties = {
  minWidth: 132,
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #edf1f6",
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
  background: "#edf4ff",
  boxShadow: "0 0 0 2px #7aa7ee",
};

export const tokenMatrixColorPickerStyle: CSSProperties = {
  width: 28,
  height: 42,
  border: "1px solid #d8dde6",
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
  minHeight: 32,
  border: "1px solid #ccd6e3",
  borderRadius: 5,
  background: "#fbfcfe",
  color: "#171a20",
  padding: "0 6px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 11,
};

export const tokenMatrixInputActiveStyle: CSSProperties = {
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
};

export const tokenMatrixObjectCellStyle: CSSProperties = {
  width: "100%",
  maxWidth: 240,
  minHeight: 34,
  border: "1px solid #d8dde6",
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

export const typographyWorkspaceStyle: CSSProperties = {
  border: "1px solid #d4dce8",
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

export const typographySubPanelStyle: CSSProperties = {
  border: "1px solid #dde5ef",
  borderRadius: 8,
  background: "#fbfcfe",
  display: "grid",
  alignContent: "start",
  gap: 8,
  padding: 10,
};

export const typographySubHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: 12,
  color: "#5d6775",
  fontSize: 12,
};

export const typographyTwoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

export const typographyTableScrollStyle: CSSProperties = {
  overflow: "auto",
  border: "1px solid #e0e7f0",
  borderRadius: 6,
  maxHeight: "min(50vh, 520px)",
};

export const typographyTableStyle: CSSProperties = {
  width: "100%",
  minWidth: 640,
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const typographyWideTableStyle: CSSProperties = {
  ...typographyTableStyle,
  minWidth: 1120,
};

export const typographyHeaderCellStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 1,
  borderBottom: "1px solid #d8e0ea",
  borderRight: "1px solid #edf1f6",
  background: "#f7f9fc",
  color: "#4e5968",
  padding: "8px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
};

export const typographyRowHeaderCellStyle: CSSProperties = {
  minWidth: 180,
  maxWidth: 260,
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #d8e0ea",
  background: "#ffffff",
  padding: 6,
  textAlign: "left",
  verticalAlign: "middle",
};

export const typographyCellStyle: CSSProperties = {
  minWidth: 128,
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #edf1f6",
  background: "#ffffff",
  padding: 6,
  verticalAlign: "middle",
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
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
  color: "#123b72",
};

export const typographyInlineInputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: 32,
  border: "1px solid #ccd6e3",
  borderRadius: 5,
  background: "#fbfcfe",
  color: "#171a20",
  padding: "0 7px",
  fontSize: 12,
};

export const fontAssetCellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  flexWrap: "wrap",
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

export const fontWeightPreviewStyle: CSSProperties = {
  display: "inline-block",
  minWidth: 42,
  fontSize: 22,
  lineHeight: "28px",
};

export const fontSizePreviewStyle: CSSProperties = {
  display: "inline-block",
  minWidth: 42,
  lineHeight: 1.2,
};

export const summaryListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#4e5968",
  fontSize: 13,
};

export const smallButtonStyle: CSSProperties = {
  minHeight: 32,
  border: "1px solid #ccd6e3",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 10px",
  textAlign: "left",
  color: "#263241",
  cursor: "pointer",
  boxShadow: "0 1px 1px rgba(15, 23, 42, 0.03)",
};

export const dangerButtonStyle: CSSProperties = {
  ...smallButtonStyle,
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
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: 0,
  cursor: "pointer",
  textTransform: "capitalize",
};

export const segmentedButtonActiveStyle: CSSProperties = {
  background: "#eaf1ff",
  border: "1px solid #8fb3f4",
};

export const inspectorStyle: CSSProperties = {
  border: "1px solid #d8dde6",
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

export const inputStyle: CSSProperties = {
  width: "100%",
  height: 38,
  border: "1px solid #ccd6e3",
  borderRadius: 6,
  padding: "0 10px",
  fontSize: 13,
  color: "#171a20",
  background: "#fbfcfe",
  boxShadow: "inset 0 1px 1px rgba(15, 23, 42, 0.03)",
};

export const selectStyle: CSSProperties = {
  ...inputStyle,
};

export const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 90,
  border: "1px solid #ccd6e3",
  borderRadius: 6,
  padding: 10,
  resize: "vertical",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  lineHeight: "18px",
  background: "#fbfcfe",
  color: "#171a20",
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

export const viewportPanelStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 4,
};

export const legacyGridPanelStyle: CSSProperties = {
  marginTop: 8,
  borderTop: "1px solid #e2e7ef",
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

export const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
  gap: 10,
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
  border: "1px solid #d4dce8",
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
  border: "1px solid #ccd6e3",
  borderRadius: 6,
  background: "#fbfcfe",
  color: "#171a20",
  padding: 10,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
  lineHeight: 1.5,
};

export const cardStyle: CSSProperties = {
  border: "1px solid #d4dce8",
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
};

export const tableStyle: CSSProperties = {
  display: "grid",
  border: "1px solid #dde5ef",
  borderRadius: 6,
  overflow: "hidden",
};

export const tableRowStyle: CSSProperties = {
  minHeight: 36,
  border: 0,
  borderBottom: "1px solid #edf1f6",
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "minmax(96px, 0.45fr) minmax(0, 1fr)",
  gap: 8,
  alignItems: "start",
  padding: "8px",
  textAlign: "left",
};

export const tableRowActiveStyle: CSSProperties = {
  background: "#edf4ff",
  color: "#123b72",
};

export const tableCellTextStyle: CSSProperties = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const tableCellMetaStyle: CSSProperties = {
  minWidth: 0,
  justifySelf: "end",
  textAlign: "right",
  overflowWrap: "anywhere",
  lineHeight: "16px",
};

export const editorFormStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

export const previewPanelStyle: CSSProperties = {
  border: "1px solid #d4dce8",
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
  borderTop: "1px solid #e2e7ef",
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
  overflow: "auto",
  maxHeight: "min(60vh, 640px)",
  border: "1px solid #dde5ef",
  borderRadius: 6,
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
  borderRight: "1px solid #edf1f6",
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
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #d8e0ea",
  background: "#fbfcfe",
  color: "#171a20",
  padding: "8px",
  textAlign: "left",
  verticalAlign: "middle",
  fontSize: 12,
};

export const componentMatrixCellStyle: CSSProperties = {
  minWidth: 150,
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #edf1f6",
  padding: 6,
  verticalAlign: "middle",
};

export const componentMatrixPreviewButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 82,
  border: "1px solid #d7dee8",
  borderRadius: 6,
  background: "#fbfcfe",
  display: "grid",
  placeItems: "center",
  padding: 8,
  cursor: "pointer",
};

export const componentMatrixPreviewButtonActiveStyle: CSSProperties = {
  border: "1px solid #7aa7ee",
  background: "#edf4ff",
};

export const componentMatrixPreviewClipStyle: CSSProperties = {
  maxWidth: 180,
  maxHeight: 110,
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
};

export const componentTokenGroupListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

export const componentTokenGroupStyle: CSSProperties = {
  border: "1px solid #dde5ef",
  borderRadius: 8,
  background: "#fbfcfe",
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
  overflow: "auto",
  border: "1px solid #e0e7f0",
  borderRadius: 6,
  maxHeight: "min(48vh, 520px)",
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
  borderRight: "1px solid #edf1f6",
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
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #d8e0ea",
  background: "#ffffff",
  padding: 6,
  textAlign: "left",
  verticalAlign: "middle",
};

export const componentTokenCellStyle: CSSProperties = {
  minWidth: 160,
  borderBottom: "1px solid #edf1f6",
  borderRight: "1px solid #edf1f6",
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
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
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
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 8px",
  fontSize: 12,
};

export const tokenColorPreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

export const tokenSwatchStyle: CSSProperties = {
  width: 56,
  height: 56,
  border: "1px solid #d8dde6",
  borderRadius: 8,
};

export const tokenTypographyPreviewStyle: CSSProperties = {
  display: "grid",
  gap: 8,
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

export const fontAttachmentPanelStyle: CSSProperties = {
  border: "1px solid #dde5ef",
  borderRadius: 6,
  background: "#ffffff",
  padding: 8,
  display: "grid",
  gap: 8,
};

export const fontAttachmentHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  color: "#4e5968",
  fontSize: 12,
};

export const fontAttachmentActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

export const tokenScalePreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 80,
};

export const tokenScaleBoxStyle: CSSProperties = {
  display: "block",
  minWidth: 2,
  maxWidth: 240,
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
};

export const previewInlineWrapStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export const previewAvatarStyle: CSSProperties = {
  border: "2px solid #e4e4e7",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  fontWeight: 700,
};

export const previewAvatarIconStyle: CSSProperties = {
  width: "42%",
  height: "42%",
  border: "2px solid currentColor",
  borderRadius: "9999px",
  boxShadow: "0 13px 0 -4px currentColor",
  opacity: 0.85,
};

export const previewChoiceGroupStyle: CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "start",
  justifyContent: "center",
  flexWrap: "wrap",
};

export const previewChoiceStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  lineHeight: "20px",
};

export const previewChoiceBoxStyle: CSSProperties = {
  width: 18,
  height: 18,
  border: "1px solid #e4e4e7",
  display: "grid",
  placeItems: "center",
  flex: "0 0 auto",
};

export const previewChoiceDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  background: "#ffffff",
};

export const previewChipStyle: CSSProperties = {
  border: "1px solid #e4e4e7",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export const previewChipDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: "9999px",
};

export const previewChipDeleteStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 16,
  height: 16,
  opacity: 0.72,
};

export const previewPopoverStackStyle: CSSProperties = {
  display: "grid",
  justifyItems: "center",
  gap: 8,
};

export const previewControlIconStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 20,
  color: "inherit",
  opacity: 0.68,
  fontSize: 11,
  textTransform: "uppercase",
};

export const previewCalendarHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 10,
};

export const previewCalendarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 4,
};

export const previewCalendarDayStyle: CSSProperties = {
  width: 32,
  height: 30,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  fontSize: 12,
};

export const previewFieldStyle: CSSProperties = {
  width: 340,
  display: "grid",
  gap: 6,
};

export const previewFieldMessageStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: "18px",
};

export const previewLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 3,
};

export const previewPaginationStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  flexWrap: "wrap",
};

export const previewTableListStyle: CSSProperties = {
  width: "min(520px, 100%)",
  display: "grid",
  gap: 8,
};

export const previewToastAccentStyle: CSSProperties = {
  display: "block",
  width: 4,
  minHeight: 92,
};

export const previewToastContentStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: 14,
  alignContent: "center",
};

export const previewTooltipStageStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  justifyItems: "center",
  alignItems: "center",
};

export const componentPreviewStageStyle: CSSProperties = {
  minHeight: 168,
  border: "1px solid #dde5ef",
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
  minWidth: 120,
  cursor: "default",
  outline: "none",
};

export const codeStyle: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
};

export const codeBlockStyle: CSSProperties = {
  ...codeStyle,
  display: "block",
  whiteSpace: "pre-wrap",
  border: "1px solid #e2e7ef",
  borderRadius: 6,
  background: "#f8fafc",
  padding: 10,
};

export const canvasShellStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  height: "100%",
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr)",
  overflow: "hidden",
};

export const previewFrameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
  border: "1px solid #cfd6e2",
  borderRadius: 8,
  background: "#ffffff",
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
  borderBottom: "1px solid #d8dde6",
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
