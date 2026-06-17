import { Tldraw, type Editor } from "tldraw";
import { useRef } from "react";
import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";
import type { ComponentDocument } from "@podo/spec";
import type { PodoSaveAdapter } from "@podo/edit-core";
import {
  PODO_COMPONENT_DRAG_TYPE,
  DEFAULT_AXIS_SIZING,
  composeSlot,
  createComponentSpecExportFile,
  createPageDocumentExportFile,
  editorNodeToTldrawShape,
  nodeLayout,
  podoShapeUtils,
  selectResponsivePreview,
  updateComponentNodeLayout,
  type AxisSizing,
  type ComponentSpecExportFile,
  type EditorCanvasState,
  type EditorComponentNode,
  type EditorNodeLayout,
  type PageDocumentExportFile,
} from "./canvas.js";
import { TOKEN_REFERENCE_LIST_ID } from "./token-model.js";
import {
  editorLegacyGridContract,
  responsiveViewports,
  type ResponsiveViewport,
  type ResponsiveViewportName,
} from "./viewport.js";
import {
  canvasArtboardStageStyle,
  canvasShellStyle,
  checkboxFieldStyle,
  errorTextStyle,
  fieldStyle,
  inputStyle,
  inspectorStyle,
  legacyGridPanelStyle,
  previewFrameStyle,
  rowStyle,
  segmentedButtonActiveStyle,
  segmentedButtonStyle,
  segmentedStyle,
  selectStyle,
  sidebarTitleStyle,
  slotRowStyle,
  smallButtonStyle,
  textareaStyle,
  toolbarButtonStyle,
  toolbarStyle,
  viewportPanelStyle,
} from "./styles.js";
import { TokenPicker, type TokenPickerOption } from "./token-picker.js";

const LAYOUT_MODE_OPTIONS: Array<{ value: EditorNodeLayout["mode"]; label: string }> = [
  { value: "none", label: "none (absolute)" },
  { value: "horizontal", label: "horizontal (row)" },
  { value: "vertical", label: "vertical (column)" },
];
const LAYOUT_ALIGN_OPTIONS: EditorNodeLayout["align"][] = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
];
const LAYOUT_JUSTIFY_OPTIONS: EditorNodeLayout["justify"][] = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
];
const AXIS_SIZING_OPTIONS: AxisSizing[] = ["fixed", "hug", "fill"];

type NodeLayoutUpdate = {
  layout?: Partial<EditorNodeLayout>;
  widthSizing?: AxisSizing;
  heightSizing?: AxisSizing;
};

/** Auto-layout (flex/stack) + per-axis sizing controls for the selected node. */
function NodeLayoutInspector({
  node,
  onApply,
}: {
  node: EditorComponentNode;
  onApply: (update: NodeLayoutUpdate) => void;
}) {
  const layout = nodeLayout(node);
  const widthSizing = node.widthSizing ?? DEFAULT_AXIS_SIZING;
  const heightSizing = node.heightSizing ?? DEFAULT_AXIS_SIZING;
  const isAutoLayout = layout.mode !== "none";
  return (
    <div style={fieldStyle}>
      <span>Auto layout</span>
      <select
        aria-label="Auto layout mode"
        style={selectStyle}
        value={layout.mode}
        onChange={(event) =>
          onApply({ layout: { mode: event.currentTarget.value as EditorNodeLayout["mode"] } })
        }
      >
        {LAYOUT_MODE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isAutoLayout ? (
        <>
          <div style={rowStyle}>
            <label style={fieldStyle}>
              align
              <select
                aria-label="Align items"
                style={selectStyle}
                value={layout.align}
                onChange={(event) =>
                  onApply({
                    layout: { align: event.currentTarget.value as EditorNodeLayout["align"] },
                  })
                }
              >
                {LAYOUT_ALIGN_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              justify
              <select
                aria-label="Justify content"
                style={selectStyle}
                value={layout.justify}
                onChange={(event) =>
                  onApply({
                    layout: { justify: event.currentTarget.value as EditorNodeLayout["justify"] },
                  })
                }
              >
                {LAYOUT_JUSTIFY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={rowStyle}>
            <label style={fieldStyle}>
              gap
              <input
                key={`${node.id}:gap:${layout.gap}`}
                aria-label="Layout gap"
                style={inputStyle}
                list={TOKEN_REFERENCE_LIST_ID}
                defaultValue={layout.gap}
                placeholder="{spacing.2}"
                onBlur={(event) => {
                  if (event.currentTarget.value !== layout.gap) {
                    onApply({ layout: { gap: event.currentTarget.value } });
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
              />
            </label>
            <label style={fieldStyle}>
              padding
              <input
                key={`${node.id}:padding:${layout.padding}`}
                aria-label="Layout padding"
                style={inputStyle}
                list={TOKEN_REFERENCE_LIST_ID}
                defaultValue={layout.padding}
                placeholder="{spacing.2}"
                onBlur={(event) => {
                  if (event.currentTarget.value !== layout.padding) {
                    onApply({ layout: { padding: event.currentTarget.value } });
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }
                }}
              />
            </label>
          </div>
          <label style={checkboxFieldStyle}>
            <input
              type="checkbox"
              checked={layout.wrap}
              onChange={(event) => onApply({ layout: { wrap: event.currentTarget.checked } })}
            />
            wrap
          </label>
        </>
      ) : null}
      <div style={rowStyle}>
        <label style={fieldStyle}>
          width
          <select
            aria-label="Width sizing"
            style={selectStyle}
            value={widthSizing}
            onChange={(event) => onApply({ widthSizing: event.currentTarget.value as AxisSizing })}
          >
            {AXIS_SIZING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label style={fieldStyle}>
          height
          <select
            aria-label="Height sizing"
            style={selectStyle}
            value={heightSizing}
            onChange={(event) => onApply({ heightSizing: event.currentTarget.value as AxisSizing })}
          >
            {AXIS_SIZING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function CanvasPanelControls({
  state,
  frame,
  placeComponent,
  createCustomLayout,
  saveNodeAsComponent,
  commitState,
  selectedNode,
  selectedComponent,
  propsDraftNodeId,
  propsDraft,
  propsDraftError,
  commitSelectedPropsDraft,
  updateSelectedPropsDraft,
  tokenPickerOptions,
  exportPreview,
  setExportPreview,
  pageIdDraft,
  setPageIdDraft,
  pagePreview,
  setPagePreview,
  pageExportError,
  setPageExportError,
  adapter,
  enqueueHostWrite,
}: {
  state: EditorCanvasState;
  frame: ResponsiveViewport;
  placeComponent: (component: ComponentDocument, position: { x: number; y: number }) => void;
  createCustomLayout: () => void;
  saveNodeAsComponent: (nodeId: string) => void;
  commitState: (nextState: EditorCanvasState, createdNode?: EditorComponentNode) => void;
  selectedNode: EditorComponentNode | undefined;
  selectedComponent: ComponentDocument | undefined;
  propsDraftNodeId: string | undefined;
  propsDraft: string;
  propsDraftError: string | undefined;
  commitSelectedPropsDraft: () => void;
  updateSelectedPropsDraft: (value: string) => void;
  tokenPickerOptions: TokenPickerOption[];
  exportPreview: ComponentSpecExportFile | undefined;
  setExportPreview: Dispatch<SetStateAction<ComponentSpecExportFile | undefined>>;
  pageIdDraft: string;
  setPageIdDraft: Dispatch<SetStateAction<string>>;
  pagePreview: PageDocumentExportFile | undefined;
  setPagePreview: Dispatch<SetStateAction<PageDocumentExportFile | undefined>>;
  pageExportError: string | undefined;
  setPageExportError: Dispatch<SetStateAction<string | undefined>>;
  adapter: PodoSaveAdapter | undefined;
  enqueueHostWrite: (key: string, task: () => Promise<unknown>) => void;
}) {
  const propsTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTokenReference = (reference: string): void => {
    const textarea = propsTextareaRef.current;
    if (!textarea || !reference) {
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    const nextValue = textarea.value.slice(0, start) + reference + textarea.value.slice(end);
    updateSelectedPropsDraft(nextValue);
    requestAnimationFrame(() => {
      const caret = start + reference.length;
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
  };

  return (
    <>
      <div style={sidebarTitleStyle}>Canvas</div>
      {selectedNode && selectedComponent ? (
        <div style={inspectorStyle}>
          <strong>{selectedNode.name}</strong>
          <label style={fieldStyle}>
            Props
            <textarea
              ref={propsTextareaRef}
              style={textareaStyle}
              value={propsDraftNodeId === selectedNode.id ? propsDraft : ""}
              onBlur={commitSelectedPropsDraft}
              onChange={(event) => updateSelectedPropsDraft(event.currentTarget.value)}
            />
            <TokenPicker options={tokenPickerOptions} onPick={insertTokenReference} />
            <button type="button" style={smallButtonStyle} onClick={commitSelectedPropsDraft}>
              Apply
            </button>
            {propsDraftError ? <span style={errorTextStyle}>{propsDraftError}</span> : null}
          </label>
          <div style={fieldStyle}>
            <span>Slots</span>
            {selectedComponent.slots.length ? (
              selectedComponent.slots.map((slot) => (
                <div key={slot.name} style={slotRowStyle}>
                  <span>
                    {slot.name}
                    {slot.repeated ? " *" : ""} ({selectedNode.slots[slot.name]?.length ?? 0})
                  </span>
                  {state.nodes
                    .filter((node) => node.id !== selectedNode.id)
                    .map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        style={smallButtonStyle}
                        onClick={() =>
                          commitState(composeSlot(state, selectedNode.id, slot.name, child.id))
                        }
                      >
                        + {child.name}
                      </button>
                    ))}
                </div>
              ))
            ) : (
              <span style={errorTextStyle}>
                This component declares no slots. Add slots in the Components panel.
              </span>
            )}
          </div>
          <NodeLayoutInspector
            node={selectedNode}
            onApply={(update) =>
              commitState(updateComponentNodeLayout(state, selectedNode.id, update))
            }
          />
          <div style={rowStyle}>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() => saveNodeAsComponent(selectedNode.id)}
            >
              Save as component
            </button>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() =>
                setExportPreview(createComponentSpecExportFile(state, selectedNode.id))
              }
            >
              Export node
            </button>
          </div>
          {exportPreview ? (
            <textarea style={textareaStyle} readOnly value={exportPreview.contents} />
          ) : null}
        </div>
      ) : null}
      <button type="button" style={toolbarButtonStyle} onClick={createCustomLayout}>
        + New layout component
      </button>
      <div style={toolbarStyle}>
        {state.components.map((component) => (
          <button
            key={component.id}
            type="button"
            draggable
            style={toolbarButtonStyle}
            onDragStart={(event) => {
              event.dataTransfer.setData(PODO_COMPONENT_DRAG_TYPE, component.id);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => {
              placeComponent(component, {
                x: 80 + state.nodes.length * 28,
                y: 80 + state.nodes.length * 28,
              });
            }}
          >
            {component.name}
          </button>
        ))}
      </div>
      <div style={viewportPanelStyle}>
        <strong>{frame.name}</strong>
        <span>
          {frame.width} x {frame.height}
        </span>
        <div style={segmentedStyle}>
          {Object.keys(responsiveViewports).map((name) => (
            <button
              key={name}
              type="button"
              style={{
                ...segmentedButtonStyle,
                ...(state.viewport === name ? segmentedButtonActiveStyle : {}),
              }}
              onClick={() =>
                commitState(selectResponsivePreview(state, name as ResponsiveViewportName))
              }
            >
              {name}
            </button>
          ))}
        </div>
        <div style={legacyGridPanelStyle}>
          <span>Legacy grid</span>
          <strong>
            {editorLegacyGridContract.breakpoints.pc.columns}/
            {editorLegacyGridContract.breakpoints.tablet.columns}/
            {editorLegacyGridContract.breakpoints.mobile.columns} columns
          </strong>
          <small>
            .grid, .grid-fix-{"{2..6}"}, .w-*, .w-full, .w-{"{n}_{d}"}, .w-{"{n}px"}
          </small>
        </div>
      </div>
      <div style={inspectorStyle}>
        <strong>Page export</strong>
        <label style={fieldStyle}>
          Page id
          <input
            aria-label="Page id"
            style={inputStyle}
            value={pageIdDraft}
            onChange={(event) => setPageIdDraft(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          style={toolbarButtonStyle}
          onClick={() => {
            try {
              const id = pageIdDraft.trim();
              const file = createPageDocumentExportFile(state, {
                id,
                name: id || "Page",
              });
              setPagePreview(file);
              setPageExportError(undefined);
              if (adapter?.savePage) {
                const savePage = adapter.savePage.bind(adapter);
                enqueueHostWrite(`page:${file.document.id}`, () => savePage(file.document));
              }
            } catch (error) {
              setPageExportError(
                error instanceof Error ? error.message : "Page could not be exported."
              );
            }
          }}
        >
          Export page
        </button>
        {pageExportError ? <span style={errorTextStyle}>{pageExportError}</span> : null}
        {pagePreview ? (
          <textarea style={textareaStyle} readOnly value={pagePreview.contents} />
        ) : null}
      </div>
    </>
  );
}

export function CanvasPanelWorkspace({
  state,
  frame,
  handleCanvasDrop,
  editorRef,
  syncFromTldraw,
}: {
  state: EditorCanvasState;
  frame: ResponsiveViewport;
  handleCanvasDrop: (event: DragEvent<HTMLElement>) => void;
  editorRef: MutableRefObject<Editor | null>;
  syncFromTldraw: (editor: Editor) => void;
}) {
  return (
    <section style={canvasShellStyle}>
      <div style={canvasArtboardStageStyle}>
        <div
          style={{ ...previewFrameStyle, width: frame.width, height: frame.height }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={handleCanvasDrop}
        >
          <Tldraw
            shapeUtils={podoShapeUtils}
            onMount={(editor) => {
              editorRef.current = editor;
              for (const node of state.nodes) {
                editor.createShape(editorNodeToTldrawShape(node));
              }
              const unsubscribers = [
                editor.sideEffects.registerAfterChangeHandler("shape", () =>
                  syncFromTldraw(editor)
                ),
                editor.sideEffects.registerAfterDeleteHandler("shape", () =>
                  syncFromTldraw(editor)
                ),
                // Selection lives on instance_page_state (not shape records), so a plain
                // selection click does not fire the shape handlers. This record also
                // changes on hover/edit/crop, so sync only when selectedShapeIds actually
                // changes — otherwise hovering would needlessly emit editor-state updates.
                editor.sideEffects.registerAfterChangeHandler(
                  "instance_page_state",
                  (prev, next) => {
                    const before = prev.selectedShapeIds;
                    const after = next.selectedShapeIds;
                    if (
                      before.length !== after.length ||
                      before.some((id, index) => id !== after[index])
                    ) {
                      syncFromTldraw(editor);
                    }
                  }
                ),
              ];
              return () => {
                editorRef.current = null;
                for (const unsubscribe of unsubscribers) {
                  unsubscribe();
                }
              };
            }}
          />
        </div>
      </div>
    </section>
  );
}
