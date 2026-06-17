import type { TokenDocument } from "@podo/spec";
import type { EditorCanvasState } from "./canvas.js";
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
  return (
    <>
      <div style={sidebarTitleStyle}>Build</div>
      <div style={summaryListStyle}>
        <span>{tokenRecords.length} tokens</span>
        <span>{state.components.length} components</span>
        <span>{state.nodes.length} canvas nodes</span>
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
  return (
    <section style={exportSectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>Build</h1>
          <p style={sectionMetaStyle}>
            JSON spec artifacts that feed the build (reproducible source of truth)
          </p>
        </div>
      </div>
      <div style={splitPanelStyle}>
        <div style={exportJsonPanelStyle}>
          <strong>Tokens</strong>
          <textarea
            style={exportJsonTextareaStyle}
            readOnly
            value={JSON.stringify(tokenDocumentsState, null, 2)}
          />
        </div>
        <div style={exportJsonPanelStyle}>
          <strong>Components</strong>
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
