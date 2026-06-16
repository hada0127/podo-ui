import { Tldraw, type Editor } from "tldraw";
import type { Dispatch, DragEvent, MutableRefObject, SetStateAction } from "react";
import type { ComponentDocument } from "@podo/spec";
import type { PodoSaveAdapter } from "@podo/edit-core";
import {
  PODO_COMPONENT_DRAG_TYPE,
  composeSlot,
  createComponentSpecExportFile,
  createPageDocumentExportFile,
  editorNodeToTldrawShape,
  podoShapeUtils,
  selectResponsivePreview,
  type ComponentSpecExportFile,
  type EditorCanvasState,
  type EditorComponentNode,
  type PageDocumentExportFile,
} from "./canvas.js";
import {
  editorLegacyGridContract,
  responsiveViewports,
  type ResponsiveViewport,
  type ResponsiveViewportName,
} from "./viewport.js";
import {
  canvasShellStyle,
  errorTextStyle,
  fieldStyle,
  inputStyle,
  inspectorStyle,
  legacyGridPanelStyle,
  previewFrameStyle,
  segmentedButtonActiveStyle,
  segmentedButtonStyle,
  segmentedStyle,
  sidebarTitleStyle,
  slotRowStyle,
  smallButtonStyle,
  textareaStyle,
  toolbarButtonStyle,
  toolbarStyle,
  viewportPanelStyle,
} from "./styles.js";

export function CanvasPanelControls({
  state,
  frame,
  placeComponent,
  commitState,
  selectedNode,
  selectedComponent,
  propsDraftNodeId,
  propsDraft,
  propsDraftError,
  commitSelectedPropsDraft,
  updateSelectedPropsDraft,
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
  commitState: (nextState: EditorCanvasState, createdNode?: EditorComponentNode) => void;
  selectedNode: EditorComponentNode | undefined;
  selectedComponent: ComponentDocument | undefined;
  propsDraftNodeId: string | undefined;
  propsDraft: string;
  propsDraftError: string | undefined;
  commitSelectedPropsDraft: () => void;
  updateSelectedPropsDraft: (value: string) => void;
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
  return (
    <>
      <div style={sidebarTitleStyle}>Canvas</div>
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
      {selectedNode && selectedComponent ? (
        <div style={inspectorStyle}>
          <strong>{selectedNode.name}</strong>
          <label style={fieldStyle}>
            Props
            <textarea
              style={textareaStyle}
              value={propsDraftNodeId === selectedNode.id ? propsDraft : ""}
              onBlur={commitSelectedPropsDraft}
              onChange={(event) => updateSelectedPropsDraft(event.currentTarget.value)}
            />
            <button type="button" style={smallButtonStyle} onClick={commitSelectedPropsDraft}>
              Apply
            </button>
            {propsDraftError ? <span style={errorTextStyle}>{propsDraftError}</span> : null}
          </label>
          <div style={fieldStyle}>
            <span>Slots</span>
            {selectedComponent.slots.map((slot) => (
              <div key={slot.name} style={slotRowStyle}>
                <span>{slot.name}</span>
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
            ))}
          </div>
          <button
            type="button"
            style={toolbarButtonStyle}
            onClick={() => setExportPreview(createComponentSpecExportFile(state, selectedNode.id))}
          >
            Export node
          </button>
          {exportPreview ? (
            <textarea style={textareaStyle} readOnly value={exportPreview.contents} />
          ) : null}
        </div>
      ) : null}
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
    <section
      style={canvasShellStyle}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleCanvasDrop}
    >
      <div style={{ ...previewFrameStyle, width: frame.width / 2, height: frame.height / 2 }}>
        <Tldraw
          shapeUtils={podoShapeUtils}
          onMount={(editor) => {
            editorRef.current = editor;
            for (const node of state.nodes) {
              editor.createShape(editorNodeToTldrawShape(node));
            }
            const unsubscribers = [
              editor.sideEffects.registerAfterChangeHandler("shape", () => syncFromTldraw(editor)),
              editor.sideEffects.registerAfterDeleteHandler("shape", () => syncFromTldraw(editor)),
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
    </section>
  );
}
