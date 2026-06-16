import type { TokenDocument } from "@podo/spec";
import type { EditorCanvasState } from "./canvas.js";
import type { EditorTokenRecord } from "./spec-editing.js";
import {
  previewPanelStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  sidebarTitleStyle,
  splitPanelStyle,
  summaryListStyle,
  textareaStyle,
} from "./styles.js";

export function ExportPanelControls({
  tokenRecords,
  state,
}: {
  tokenRecords: EditorTokenRecord[];
  state: EditorCanvasState;
}) {
  return (
    <>
      <div style={sidebarTitleStyle}>Export</div>
      <div style={summaryListStyle}>
        <span>{tokenRecords.length} tokens</span>
        <span>{state.components.length} components</span>
        <span>{state.nodes.length} canvas nodes</span>
      </div>
    </>
  );
}

export function ExportPanelWorkspace({
  tokenDocumentsState,
  state,
}: {
  tokenDocumentsState: TokenDocument[];
  state: EditorCanvasState;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h1 style={sectionTitleStyle}>Export</h1>
          <p style={sectionMetaStyle}>Current in-memory JSON specs</p>
        </div>
      </div>
      <div style={splitPanelStyle}>
        <div style={previewPanelStyle}>
          <strong>Tokens</strong>
          <textarea
            style={{ ...textareaStyle, minHeight: 420 }}
            readOnly
            value={JSON.stringify(tokenDocumentsState, null, 2)}
          />
        </div>
        <div style={previewPanelStyle}>
          <strong>Components</strong>
          <textarea
            style={{ ...textareaStyle, minHeight: 420 }}
            readOnly
            value={JSON.stringify(state.components, null, 2)}
          />
        </div>
      </div>
    </section>
  );
}
