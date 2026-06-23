import type { TokenDocument } from "@podo/spec";
import type { EditorCanvasState } from "./canvas.js";
import { useT } from "./i18n/context.js";
import type { EditorTokenRecord } from "./spec-editing.js";
import {
  exportJsonPanelStyle,
  exportJsonTextareaStyle,
  exportSectionStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionTitleStyle,
  sidebarTitleStyle,
  splitPanelStyle,
  summaryListStyle,
} from "./styles.js";

export function BuildPanelControls({
  tokenRecords,
  state,
}: {
  tokenRecords: EditorTokenRecord[];
  state: EditorCanvasState;
}) {
  const t = useT();
  return (
    <>
      <div style={sidebarTitleStyle}>{t("buildPanel.title")}</div>
      <div style={summaryListStyle}>
        <span>{t("buildPanel.tokensCount", { count: tokenRecords.length })}</span>
        <span>{t("buildPanel.componentsCount", { count: state.components.length })}</span>
        <span>{t("buildPanel.canvasNodesCount", { count: state.nodes.length })}</span>
      </div>
    </>
  );
}

export function BuildPanelWorkspace({
  tokenDocumentsState,
  state,
}: {
  tokenDocumentsState: TokenDocument[];
  state: EditorCanvasState;
}) {
  const t = useT();
  return (
    <section style={exportSectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>{t("buildPanel.title")}</h1>
          <p style={sectionMetaStyle}>{t("buildPanel.workspaceMeta")}</p>
        </div>
      </div>
      <div style={splitPanelStyle}>
        <div style={exportJsonPanelStyle}>
          <strong>{t("buildPanel.tokensLabel")}</strong>
          <textarea
            style={exportJsonTextareaStyle}
            readOnly
            value={JSON.stringify(tokenDocumentsState, null, 2)}
          />
        </div>
        <div style={exportJsonPanelStyle}>
          <strong>{t("buildPanel.componentsLabel")}</strong>
          <textarea
            style={exportJsonTextareaStyle}
            readOnly
            value={JSON.stringify(state.components, null, 2)}
          />
        </div>
      </div>
    </section>
  );
}
