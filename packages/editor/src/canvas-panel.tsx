import { Tldraw, type Editor } from "tldraw";
import { useRef } from "react";
import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";
import type { ComponentDocument } from "@podo/spec";
import type { TokenLookup } from "./token-lookup.js";
import { CanvasPreview, PodoCanvasRenderContext } from "./canvas.js";
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
  removeFromSlot,
  selectResponsivePreview,
  updateComponentNodeLayout,
  updateComponentNodeProps,
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
  advancedDetailsStyle,
  advancedSummaryStyle,
  inputStyle,
  inspectorStyle,
  legacyGridPanelStyle,
  previewFrameStyle,
  propLabelStyle,
  propRowStyle,
  rowStyle,
  segmentedButtonActiveStyle,
  segmentedButtonStyle,
  segmentedStyle,
  selectStyle,
  sidebarTitleStyle,
  slotBadgeRemoveStyle,
  slotBadgeStyle,
  slotBadgeWrapStyle,
  slotRowLabelStyle,
  slotRowStyle,
  smallButtonStyle,
  textareaStyle,
  toolbarButtonStyle,
  toolbarStyle,
  viewportPanelStyle,
} from "./styles.js";
import { TokenPicker, type TokenPickerOption } from "./token-picker.js";
import { useT } from "./i18n/context.js";

const LAYOUT_MODE_OPTIONS: Array<{ value: EditorNodeLayout["mode"]; labelKey: string }> = [
  { value: "none", labelKey: "canvasPanel.layoutMode.none" },
  { value: "horizontal", labelKey: "canvasPanel.layoutMode.horizontal" },
  { value: "vertical", labelKey: "canvasPanel.layoutMode.vertical" },
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

/** Map a visible align/justify/sizing token to its catalog key (token kept verbatim). */
const VALUE_LABEL_KEYS: Record<string, string> = {
  start: "canvasPanel.value.start",
  center: "canvasPanel.value.center",
  end: "canvasPanel.value.end",
  stretch: "canvasPanel.value.stretch",
  baseline: "canvasPanel.value.baseline",
  "space-between": "canvasPanel.value.spaceBetween",
  "space-around": "canvasPanel.value.spaceAround",
  fixed: "canvasPanel.value.fixed",
  hug: "canvasPanel.value.hug",
  fill: "canvasPanel.value.fill",
};

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
  const t = useT();
  const layout = nodeLayout(node);
  const widthSizing = node.widthSizing ?? DEFAULT_AXIS_SIZING;
  const heightSizing = node.heightSizing ?? DEFAULT_AXIS_SIZING;
  const isAutoLayout = layout.mode !== "none";
  return (
    <div style={fieldStyle}>
      <span>{t("canvasPanel.autoLayout")}</span>
      <select
        aria-label={t("canvasPanel.autoLayoutMode")}
        style={selectStyle}
        value={layout.mode}
        onChange={(event) =>
          onApply({ layout: { mode: event.currentTarget.value as EditorNodeLayout["mode"] } })
        }
      >
        {LAYOUT_MODE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
      {isAutoLayout ? (
        <>
          <div style={rowStyle}>
            <label style={fieldStyle}>
              {t("canvasPanel.align")}
              <select
                aria-label={t("canvasPanel.alignItems")}
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
                    {t(VALUE_LABEL_KEYS[value] ?? value)}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldStyle}>
              {t("canvasPanel.justify")}
              <select
                aria-label={t("canvasPanel.justifyContent")}
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
                    {t(VALUE_LABEL_KEYS[value] ?? value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={rowStyle}>
            <label style={fieldStyle}>
              {t("canvasPanel.gap")}
              <input
                key={`${node.id}:gap:${layout.gap}`}
                aria-label={t("canvasPanel.layoutGap")}
                style={inputStyle}
                list={TOKEN_REFERENCE_LIST_ID}
                defaultValue={layout.gap}
                placeholder={t("canvasPanel.spacingPlaceholder")}
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
              {t("canvasPanel.padding")}
              <input
                key={`${node.id}:padding:${layout.padding}`}
                aria-label={t("canvasPanel.layoutPadding")}
                style={inputStyle}
                list={TOKEN_REFERENCE_LIST_ID}
                defaultValue={layout.padding}
                placeholder={t("canvasPanel.spacingPlaceholder")}
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
            {t("canvasPanel.wrap")}
          </label>
        </>
      ) : null}
      <div style={rowStyle}>
        <label style={fieldStyle}>
          {t("canvasPanel.width")}
          <select
            aria-label={t("canvasPanel.widthSizing")}
            style={selectStyle}
            value={widthSizing}
            onChange={(event) => onApply({ widthSizing: event.currentTarget.value as AxisSizing })}
          >
            {AXIS_SIZING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(VALUE_LABEL_KEYS[value] ?? value)}
              </option>
            ))}
          </select>
        </label>
        <label style={fieldStyle}>
          {t("canvasPanel.height")}
          <select
            aria-label={t("canvasPanel.heightSizing")}
            style={selectStyle}
            value={heightSizing}
            onChange={(event) => onApply({ heightSizing: event.currentTarget.value as AxisSizing })}
          >
            {AXIS_SIZING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(VALUE_LABEL_KEYS[value] ?? value)}
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
  const t = useT();
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

  // Spec-driven single-prop update: writes one key on the selected node's props
  // without round-tripping through the raw JSON draft.
  const commitNodeProp = (name: string, value: unknown): void => {
    if (!selectedNode) {
      return;
    }
    const nextProps = { ...selectedNode.props };
    if (value === undefined) {
      delete nextProps[name];
    } else {
      nextProps[name] = value;
    }
    commitState(updateComponentNodeProps(state, selectedNode.id, nextProps));
  };

  return (
    <>
      <div style={sidebarTitleStyle}>{t("canvasPanel.title")}</div>
      {selectedNode && selectedComponent ? (
        <div style={inspectorStyle}>
          <strong>{selectedNode.name}</strong>
          <div style={fieldStyle}>
            <span style={slotRowLabelStyle}>{t("canvasPanel.props")}</span>
            {selectedComponent.variants.map((axis) => {
              const current = String(
                selectedNode.props[axis.name] ?? axis.default ?? axis.values[0] ?? ""
              );
              return (
                <label key={`variant:${axis.name}`} style={propRowStyle}>
                  <span style={propLabelStyle}>{axis.name}</span>
                  <select
                    style={selectStyle}
                    value={current}
                    onChange={(event) => commitNodeProp(axis.name, event.currentTarget.value)}
                  >
                    {axis.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
            {selectedComponent.props
              .filter((prop) => !selectedComponent.variants.some((axis) => axis.name === prop.name))
              .map((prop) => {
                const propType = prop.type;
                const raw = selectedNode.props[prop.name];
                if (propType.kind === "enum" || propType.kind === "union") {
                  return (
                    <label key={prop.name} style={propRowStyle}>
                      <span style={propLabelStyle}>{prop.name}</span>
                      <select
                        style={selectStyle}
                        value={String(raw ?? prop.default ?? "")}
                        onChange={(event) => commitNodeProp(prop.name, event.currentTarget.value)}
                      >
                        <option value="">{t("canvasPanel.enumEmpty")}</option>
                        {propType.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }
                if (propType.kind === "boolean") {
                  return (
                    <label key={prop.name} style={checkboxFieldStyle}>
                      <input
                        type="checkbox"
                        checked={Boolean(raw ?? prop.default ?? false)}
                        onChange={(event) => commitNodeProp(prop.name, event.currentTarget.checked)}
                      />
                      {prop.name}
                    </label>
                  );
                }
                if (propType.kind === "number") {
                  return (
                    <label key={prop.name} style={propRowStyle}>
                      <span style={propLabelStyle}>{prop.name}</span>
                      <input
                        type="number"
                        style={inputStyle}
                        value={raw === undefined || raw === null ? "" : String(raw)}
                        onChange={(event) => {
                          const next = event.currentTarget.value;
                          commitNodeProp(prop.name, next === "" ? undefined : Number(next));
                        }}
                      />
                    </label>
                  );
                }
                if (propType.kind === "string") {
                  return (
                    <label key={prop.name} style={propRowStyle}>
                      <span style={propLabelStyle}>{prop.name}</span>
                      <input
                        type="text"
                        style={inputStyle}
                        list={TOKEN_REFERENCE_LIST_ID}
                        value={raw === undefined || raw === null ? "" : String(raw)}
                        onChange={(event) => commitNodeProp(prop.name, event.currentTarget.value)}
                      />
                    </label>
                  );
                }
                return null;
              })}
            <details style={advancedDetailsStyle}>
              <summary style={advancedSummaryStyle}>{t("canvasPanel.advancedRawJson")}</summary>
              <textarea
                ref={propsTextareaRef}
                style={textareaStyle}
                value={propsDraftNodeId === selectedNode.id ? propsDraft : ""}
                onBlur={commitSelectedPropsDraft}
                onChange={(event) => updateSelectedPropsDraft(event.currentTarget.value)}
              />
              <TokenPicker options={tokenPickerOptions} onPick={insertTokenReference} />
              <button type="button" style={smallButtonStyle} onClick={commitSelectedPropsDraft}>
                {t("canvasPanel.apply")}
              </button>
              {propsDraftError ? <span style={errorTextStyle}>{propsDraftError}</span> : null}
            </details>
          </div>
          <div style={fieldStyle}>
            <span>{t("canvasPanel.slots")}</span>
            {selectedComponent.slots.length ? (
              selectedComponent.slots.map((slot) => {
                const assigned = selectedNode.slots[slot.name] ?? [];
                const assignedSet = new Set(assigned);
                const candidates = state.nodes.filter(
                  (node) => node.id !== selectedNode.id && !assignedSet.has(node.id)
                );
                const canAdd = (slot.repeated || assigned.length === 0) && candidates.length > 0;
                return (
                  <div key={slot.name} style={slotRowStyle}>
                    <span style={slotRowLabelStyle}>
                      {slot.name}
                      {slot.repeated ? " *" : ""} ({assigned.length})
                    </span>
                    {assigned.length ? (
                      <div style={slotBadgeWrapStyle}>
                        {assigned.map((childId) => {
                          const child = state.nodes.find((node) => node.id === childId);
                          return (
                            <span key={childId} style={slotBadgeStyle}>
                              {child?.name ?? childId}
                              <button
                                type="button"
                                aria-label={t("canvasPanel.removeChildFromSlot", {
                                  child: child?.name ?? childId,
                                  slot: slot.name,
                                })}
                                style={slotBadgeRemoveStyle}
                                onClick={() =>
                                  commitState(
                                    removeFromSlot(state, selectedNode.id, slot.name, childId)
                                  )
                                }
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                    {canAdd ? (
                      <select
                        aria-label={t("canvasPanel.addChildToSlot", { slot: slot.name })}
                        style={selectStyle}
                        value=""
                        onChange={(event) => {
                          if (event.currentTarget.value) {
                            commitState(
                              composeSlot(
                                state,
                                selectedNode.id,
                                slot.name,
                                event.currentTarget.value
                              )
                            );
                          }
                        }}
                      >
                        <option value="">{t("canvasPanel.addChildOption")}</option>
                        {candidates.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.name}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <span style={errorTextStyle}>{t("canvasPanel.noSlots")}</span>
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
              {t("canvasPanel.saveAsComponent")}
            </button>
            <button
              type="button"
              style={smallButtonStyle}
              onClick={() =>
                setExportPreview(createComponentSpecExportFile(state, selectedNode.id))
              }
            >
              {t("canvasPanel.exportNode")}
            </button>
          </div>
          {exportPreview ? (
            <textarea style={textareaStyle} readOnly value={exportPreview.contents} />
          ) : null}
        </div>
      ) : null}
      <button type="button" style={toolbarButtonStyle} onClick={createCustomLayout}>
        {t("canvasPanel.newLayoutComponent")}
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
        <span>{t("canvasPanel.viewportSize", { width: frame.width, height: frame.height })}</span>
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
          <span>{t("canvasPanel.legacyGrid")}</span>
          <strong>
            {t("canvasPanel.legacyGridColumns", {
              pc: editorLegacyGridContract.breakpoints.pc.columns,
              tablet: editorLegacyGridContract.breakpoints.tablet.columns,
              mobile: editorLegacyGridContract.breakpoints.mobile.columns,
            })}
          </strong>
          <small>
            .grid, .grid-fix-{"{2..6}"}, .w-*, .w-full, .w-{"{n}_{d}"}, .w-{"{n}px"}
          </small>
        </div>
      </div>
      <div style={inspectorStyle}>
        <strong>{t("canvasPanel.pageExport")}</strong>
        <label style={fieldStyle}>
          {t("canvasPanel.pageId")}
          <input
            aria-label={t("canvasPanel.pageId")}
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
                name: id || t("canvasPanel.defaultPageName"),
              });
              setPagePreview(file);
              setPageExportError(undefined);
              if (adapter?.savePage) {
                const savePage = adapter.savePage.bind(adapter);
                enqueueHostWrite(`page:${file.document.id}`, () => savePage(file.document));
              }
            } catch (error) {
              setPageExportError(
                error instanceof Error ? error.message : t("canvasPanel.pageExportError")
              );
            }
          }}
        >
          {t("canvasPanel.exportPage")}
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
  lookup,
  previewMode,
}: {
  state: EditorCanvasState;
  frame: ResponsiveViewport;
  handleCanvasDrop: (event: DragEvent<HTMLElement>) => void;
  editorRef: MutableRefObject<Editor | null>;
  syncFromTldraw: (editor: Editor) => void;
  lookup: TokenLookup;
  previewMode: boolean;
}) {
  // Preview/play mode swaps tldraw out for a live interactive render of the
  // composed page (tldraw intercepts pointer events, so components can only be
  // tested once it is unmounted).
  if (previewMode) {
    return (
      <section style={canvasShellStyle}>
        <div style={canvasArtboardStageStyle}>
          <CanvasPreview state={state} frame={frame} lookup={lookup} />
        </div>
      </section>
    );
  }
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
          <PodoCanvasRenderContext.Provider
            value={{ components: state.components, lookup, nodes: state.nodes }}
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
          </PodoCanvasRenderContext.Provider>
        </div>
      </div>
    </section>
  );
}
