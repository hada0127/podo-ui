import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  Tldraw,
  createShapeId,
  resizeBox,
  type Editor,
  type Geometry2d,
  type RecordProps,
  type TLResizeInfo,
  type TLShape,
} from "tldraw";
import "tldraw/tldraw.css";
import {
  PODO_SCHEMA_VERSION,
  parseComponentDocument,
  parseTokenDocument,
  type ComponentDocument,
  type DesignToken,
  type TokenDocument,
  type TokenTree,
} from "@podo/spec";

export const packageName = "@podo/editor";

export const PODO_COMPONENT_SHAPE_TYPE = "podo-component" as const;
const PODO_COMPONENT_DRAG_TYPE = "application/x-podo-component";

export type ResponsiveViewportName = "desktop" | "tablet" | "mobile";

export interface ResponsiveViewport {
  name: ResponsiveViewportName;
  width: number;
  height: number;
  columns: number;
}

export const responsiveViewports: Record<ResponsiveViewportName, ResponsiveViewport> = {
  desktop: { name: "desktop", width: 1440, height: 900, columns: 12 },
  tablet: { name: "tablet", width: 834, height: 1112, columns: 6 },
  mobile: { name: "mobile", width: 390, height: 844, columns: 4 },
};

export interface EditorComponentNode {
  id: string;
  componentId: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variant?: string;
  props: Record<string, unknown>;
  slots: Record<string, string[]>;
}

export interface EditorCanvasState {
  schemaVersion: typeof PODO_SCHEMA_VERSION;
  viewport: ResponsiveViewportName;
  components: ComponentDocument[];
  nodes: EditorComponentNode[];
  selectedNodeId?: string;
}

export interface ComponentSpecExportFile {
  path: string;
  contents: string;
  document: ComponentDocument;
}

export interface PodoTldrawStateWriter {
  createShape(shape: PodoComponentShapeInput): unknown;
  updateShapes(shapes: PodoComponentShapeInput[]): unknown;
}

export interface PodoComponentShapeProps {
  w: number;
  h: number;
  componentId: string;
  label: string;
  variant: string;
  propsJson: string;
  slotsJson: string;
}

declare module "tldraw" {
  export interface TLGlobalShapePropsMap {
    [PODO_COMPONENT_SHAPE_TYPE]: PodoComponentShapeProps;
  }
}

export type PodoComponentShape = TLShape<typeof PODO_COMPONENT_SHAPE_TYPE>;
export type PodoComponentShapeInput = Pick<PodoComponentShape, "id" | "type" | "x" | "y" | "props">;

export class PodoComponentShapeUtil extends ShapeUtil<PodoComponentShape> {
  static override type = PODO_COMPONENT_SHAPE_TYPE;
  static override props: RecordProps<PodoComponentShape> = {
    w: T.number,
    h: T.number,
    componentId: T.string,
    label: T.string,
    variant: T.string,
    propsJson: T.string,
    slotsJson: T.string,
  };

  getDefaultProps(): PodoComponentShape["props"] {
    return {
      w: 240,
      h: 128,
      componentId: "button",
      label: "Button",
      variant: "default",
      propsJson: "{}",
      slotsJson: "{}",
    };
  }

  override canResize(): boolean {
    return true;
  }

  override isAspectRatioLocked(): boolean {
    return false;
  }

  getGeometry(shape: PodoComponentShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override onResize(shape: PodoComponentShape, info: TLResizeInfo<PodoComponentShape>) {
    return resizeBox(shape, info);
  }

  component(shape: PodoComponentShape) {
    const props = safeParseRecord(shape.props.propsJson);
    const slots = safeParseRecord(shape.props.slotsJson);
    return (
      <HTMLContainer style={componentShapeStyle}>
        <div style={shapeHeaderStyle}>
          <strong>{shape.props.label}</strong>
          <span>{shape.props.variant}</span>
        </div>
        <div style={shapeMetaStyle}>{shape.props.componentId}</div>
        <div style={shapeBodyStyle}>
          <span>{Object.keys(props).length} props</span>
          <span>{Object.keys(slots).length} slots</span>
        </div>
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: PodoComponentShape): Path2D {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}

export const podoShapeUtils = [PodoComponentShapeUtil];

export interface PodoEditorAppProps {
  components: ComponentDocument[];
  initialState?: EditorCanvasState;
  viewport?: ResponsiveViewportName;
  onStateChange?: (state: EditorCanvasState) => void;
}

export function PodoEditorApp({
  components,
  initialState,
  viewport = "desktop",
  onStateChange,
}: PodoEditorAppProps) {
  const startingState = useMemo(
    () => initialState ?? createEditorState({ components, viewport }),
    [components, initialState, viewport]
  );
  const [state, setState] = useState(startingState);
  const [exportPreview, setExportPreview] = useState<ComponentSpecExportFile | undefined>();
  const [propsDraft, setPropsDraft] = useState("");
  const [propsDraftNodeId, setPropsDraftNodeId] = useState<string | undefined>();
  const [propsDraftError, setPropsDraftError] = useState<string | undefined>();
  const editorRef = useRef<Editor | null>(null);
  const isApplyingStateToTldrawRef = useRef(false);
  const stateRef = useRef(startingState);
  const frame = responsiveViewports[state.viewport];
  const selectedNode = state.nodes.find((node) => node.id === state.selectedNodeId);
  const selectedComponent = selectedNode
    ? state.components.find((component) => component.id === selectedNode.componentId)
    : undefined;
  const selectedNodePropsKey = selectedNode ? JSON.stringify(selectedNode.props) : "";

  useEffect(() => {
    setPropsDraft(selectedNode ? JSON.stringify(selectedNode.props, null, 2) : "");
    setPropsDraftNodeId(selectedNode?.id);
    setPropsDraftError(undefined);
  }, [selectedNode?.id, selectedNodePropsKey]);

  const commitState = (nextState: EditorCanvasState, createdNode?: EditorComponentNode): void => {
    const previousState = stateRef.current;
    stateRef.current = nextState;
    setState(nextState);
    onStateChange?.(nextState);
    if (editorRef.current) {
      isApplyingStateToTldrawRef.current = true;
      try {
        applyEditorStateToTldraw(editorRef.current, previousState, nextState, createdNode);
      } finally {
        isApplyingStateToTldrawRef.current = false;
      }
    }
  };
  const placeComponent = (
    component: ComponentDocument,
    position: { x: number; y: number }
  ): void => {
    const nextState = dropComponentOnCanvas(state, component, position);
    commitState(nextState, nextState.nodes.at(-1));
  };
  const handleCanvasDrop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    const componentId = event.dataTransfer.getData(PODO_COMPONENT_DRAG_TYPE);
    const component = components.find((item) => item.id === componentId);
    if (!component) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    placeComponent(component, {
      x: Math.max(0, event.clientX - bounds.left),
      y: Math.max(0, event.clientY - bounds.top),
    });
  };
  const syncFromTldraw = (editor: Editor): void => {
    if (isApplyingStateToTldrawRef.current) {
      return;
    }
    const nextState = syncEditorStateFromTldraw(stateRef.current, editor);
    stateRef.current = nextState;
    setState(nextState);
    onStateChange?.(nextState);
  };
  const updateSelectedPropsDraft = (value: string): void => {
    setPropsDraft(value);
    if (propsDraftError && parseJsonRecord(value).ok) {
      setPropsDraftError(undefined);
    }
  };
  const commitSelectedPropsDraft = (): void => {
    if (!selectedNode) {
      return;
    }
    const parsed = parseJsonRecord(propsDraft);
    if (!parsed.ok) {
      setPropsDraftError(parsed.error);
      return;
    }
    setPropsDraftError(undefined);
    commitState(updateComponentNodeProps(state, selectedNode.id, parsed.value));
  };

  return (
    <div style={editorShellStyle}>
      <aside style={sidebarStyle}>
        <div style={sidebarTitleStyle}>Podo Editor</div>
        <div style={toolbarStyle}>
          {components.map((component) => (
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
              onClick={() =>
                setExportPreview(createComponentSpecExportFile(state, selectedNode.id))
              }
            >
              Export
            </button>
            {exportPreview ? (
              <textarea style={textareaStyle} readOnly value={exportPreview.contents} />
            ) : null}
          </div>
        ) : null}
      </aside>
      <main
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
                editor.sideEffects.registerAfterChangeHandler("shape", () =>
                  syncFromTldraw(editor)
                ),
                editor.sideEffects.registerAfterDeleteHandler("shape", () =>
                  syncFromTldraw(editor)
                ),
              ];
              return () => {
                for (const unsubscribe of unsubscribers) {
                  unsubscribe();
                }
              };
            }}
          />
        </div>
      </main>
    </div>
  );
}

export function createEditorState(input: {
  components: ComponentDocument[];
  viewport?: ResponsiveViewportName;
  nodes?: EditorComponentNode[];
}): EditorCanvasState {
  return {
    schemaVersion: PODO_SCHEMA_VERSION,
    viewport: input.viewport ?? "desktop",
    components: input.components.map((component) => parseComponentDocument(component)),
    nodes: input.nodes ?? [],
  };
}

export function createComponentNode(
  component: ComponentDocument,
  position: { x: number; y: number },
  input: Partial<Pick<EditorComponentNode, "id" | "w" | "h" | "variant" | "props" | "slots">> = {}
): EditorComponentNode {
  const parsed = parseComponentDocument(component);
  const defaultVariant = parsed.variants[0]?.default ?? parsed.variants[0]?.values[0] ?? "default";
  return {
    id: input.id ?? `${parsed.id}-${Math.round(position.x)}-${Math.round(position.y)}`,
    componentId: parsed.id,
    name: parsed.name,
    x: position.x,
    y: position.y,
    w: input.w ?? 240,
    h: input.h ?? 128,
    variant: input.variant ?? defaultVariant,
    props: input.props ?? defaultPropsForComponent(parsed),
    slots: input.slots ?? defaultSlotsForComponent(parsed),
  };
}

export function dropComponentOnCanvas(
  state: EditorCanvasState,
  component: ComponentDocument,
  position: { x: number; y: number }
): EditorCanvasState {
  const node = createComponentNode(component, position);
  return {
    ...state,
    nodes: [...state.nodes, node],
    selectedNodeId: node.id,
  };
}

export function updateComponentNodeProps(
  state: EditorCanvasState,
  nodeId: string,
  props: Record<string, unknown>
): EditorCanvasState {
  return {
    ...state,
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, props: { ...props } } : node
    ),
    selectedNodeId: nodeId,
  };
}

export function composeSlot(
  state: EditorCanvasState,
  parentNodeId: string,
  slotName: string,
  childNodeId: string
): EditorCanvasState {
  const parent = findNode(state, parentNodeId);
  const parentComponent = findComponent(state, parent.componentId);
  const slot = parentComponent.slots.find((item) => item.name === slotName);
  if (!slot) {
    throw new Error(`Component "${parent.componentId}" does not define slot "${slotName}".`);
  }
  if (!slot.repeated && parent.slots[slotName]?.length) {
    throw new Error(`Slot "${slotName}" on "${parent.componentId}" is not repeated.`);
  }
  findNode(state, childNodeId);
  if (wouldCreateSlotCycle(state, parentNodeId, childNodeId)) {
    throw new Error(
      `Slot composition would create a cycle between "${parentNodeId}" and "${childNodeId}".`
    );
  }
  return {
    ...state,
    nodes: state.nodes.map((node) =>
      node.id === parentNodeId
        ? {
            ...node,
            slots: { ...node.slots, [slotName]: [...(node.slots[slotName] ?? []), childNodeId] },
          }
        : node
    ),
    selectedNodeId: parentNodeId,
  };
}

export function selectResponsivePreview(
  state: EditorCanvasState,
  viewport: ResponsiveViewportName
): EditorCanvasState {
  return { ...state, viewport };
}

export function applyEditorStateToTldraw(
  editor: PodoTldrawStateWriter,
  previousState: EditorCanvasState,
  nextState: EditorCanvasState,
  createdNode?: EditorComponentNode
): void {
  if (createdNode) {
    editor.createShape(editorNodeToTldrawShape(createdNode));
  }

  const previousNodes = new Map(previousState.nodes.map((node) => [node.id, node]));
  const changedNodes = nextState.nodes.filter((node) => {
    if (node.id === createdNode?.id) {
      return false;
    }
    const previousNode = previousNodes.get(node.id);
    return previousNode ? hasEditorNodeShapeChanged(previousNode, node) : false;
  });

  if (changedNodes.length) {
    editor.updateShapes(changedNodes.map(editorNodeToTldrawShape));
  }
}

export function syncEditorStateFromTldraw(
  state: EditorCanvasState,
  editor: Editor
): EditorCanvasState {
  const previousNodes = new Map(state.nodes.map((node) => [node.id, node]));
  const syncedNodes = editor
    .getCurrentPageShapes()
    .filter(isPodoComponentShape)
    .map((shape) => tldrawShapeToEditorNode(shape, previousNodes.get(shapeIdToNodeId(shape.id))));
  const currentNodeIds = new Set(syncedNodes.map((node) => node.id));
  const nodes = syncedNodes.map((node) => ({
    ...node,
    slots: filterExistingSlotChildren(node.slots, currentNodeIds),
  }));
  const selectedShapeId = editor.getSelectedShapeIds()[0];
  const selectedNodeId = selectedShapeId ? shapeIdToNodeId(selectedShapeId) : state.selectedNodeId;
  const nextSelectedNodeId = nodes.some((node) => node.id === selectedNodeId)
    ? selectedNodeId
    : nodes[0]?.id;
  return {
    ...state,
    nodes,
    ...(nextSelectedNodeId ? { selectedNodeId: nextSelectedNodeId } : {}),
  };
}

export function exportComponentSpecFromNode(
  state: EditorCanvasState,
  nodeId: string
): ComponentDocument {
  const node = findNode(state, nodeId);
  const component = findComponent(state, node.componentId);
  return parseComponentDocument({
    ...component,
    id: node.componentId,
    name: node.name,
    props: mergeEditedProps(component, node.props),
    slots: component.slots.map((slot) => ({
      ...slot,
      repeated: slot.repeated || (node.slots[slot.name]?.length ?? 0) > 1,
    })),
    variants: component.variants,
    examples: [
      ...(component.examples ?? []),
      {
        target: "web",
        title: `${node.name} editor export`,
        code: serializeNodeExample(node),
      },
    ],
  });
}

export function createComponentSpecExportFile(
  state: EditorCanvasState,
  nodeId: string,
  directory = ".podo/components/editor"
): ComponentSpecExportFile {
  const document = exportComponentSpecFromNode(state, nodeId);
  return {
    path: `${directory.replace(/\/+$/g, "")}/${document.id}.component.json`,
    contents: `${JSON.stringify(document, null, 2)}\n`,
    document,
  };
}

export interface LayoutSpecDecision {
  componentSpecOwns: string[];
  layoutSpecOwns: string[];
  pageSpecOwns: string[];
  decision: string;
}

export function describeLayoutSpecBoundary(): LayoutSpecDecision {
  return {
    componentSpecOwns: ["props", "slots", "states", "variants", "token bindings", "a11y contract"],
    layoutSpecOwns: ["node placement", "slot composition", "responsive frames", "local overrides"],
    pageSpecOwns: ["route metadata", "data requirements", "SEO", "navigation order"],
    decision:
      "Component specs stay reusable and target-aware; editor canvas output should export component specs plus a separate layout/page composition model when route-level placement is needed.",
  };
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: FigmaVariable[];
}

export interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  description?: string;
  valuesByMode: Record<string, unknown>;
}

export interface FigmaVariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

export interface FigmaVariableExport {
  collectionName: string;
  variables: FigmaVariable[];
}

export function importFigmaVariables(input: FigmaVariableCollection): TokenDocument {
  const tokens: TokenTree = {};
  const defaultMode = input.modes[0]?.modeId;
  if (!defaultMode) {
    throw new Error("Figma variable collection must include at least one mode.");
  }

  const aliases = new Map(
    input.variables.map((variable) => [variable.id, normalizeFigmaPath(variable.name).join(".")])
  );
  for (const variable of input.variables) {
    setTokenAtPath(
      tokens,
      normalizeFigmaPath(variable.name),
      figmaVariableToToken(input, variable, defaultMode, aliases)
    );
  }

  return parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens,
  });
}

export function exportFigmaVariables(document: TokenDocument): FigmaVariableExport {
  const parsed = parseTokenDocument(document);
  const variables: FigmaVariable[] = [];
  collectTokens(parsed.tokens, [], (path, token) => {
    variables.push(tokenToFigmaVariable(path, token));
  });
  return {
    collectionName: "Podo Tokens",
    variables,
  };
}

export const githubSyncStrategy = {
  decision: "ci-managed-sync",
  recommendation:
    "Run Figma import/export in a GitHub Action that opens a pull request with token JSON changes; the editor should not push directly from a browser session.",
  requiredSecrets: ["FIGMA_TOKEN", "GITHUB_TOKEN"],
  checks: ["pnpm check", "pnpm build", "podo update --dry-run"],
} as const;

function editorNodeToTldrawShape(node: EditorComponentNode): PodoComponentShapeInput {
  return {
    id: createShapeId(node.id),
    type: PODO_COMPONENT_SHAPE_TYPE,
    x: node.x,
    y: node.y,
    props: {
      w: node.w,
      h: node.h,
      componentId: node.componentId,
      label: node.name,
      variant: node.variant ?? "default",
      propsJson: JSON.stringify(node.props),
      slotsJson: JSON.stringify(node.slots),
    },
  };
}

function isPodoComponentShape(shape: TLShape): shape is PodoComponentShape {
  return shape.type === PODO_COMPONENT_SHAPE_TYPE;
}

function tldrawShapeToEditorNode(
  shape: PodoComponentShape,
  previous?: EditorComponentNode
): EditorComponentNode {
  return {
    id: shapeIdToNodeId(shape.id),
    componentId: shape.props.componentId,
    name: shape.props.label,
    x: shape.x,
    y: shape.y,
    w: shape.props.w,
    h: shape.props.h,
    variant: shape.props.variant,
    props: safeParseRecord(shape.props.propsJson),
    slots: normalizeSlotRecord(safeParseRecord(shape.props.slotsJson)),
    ...(previous?.componentId === shape.props.componentId ? { name: previous.name } : {}),
  };
}

function shapeIdToNodeId(id: PodoComponentShape["id"]): string {
  return String(id).replace(/^shape:/, "");
}

function normalizeSlotRecord(value: Record<string, unknown>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(value).map(([slot, children]) => [
      slot,
      Array.isArray(children) ? children.map(String) : [],
    ])
  );
}

function filterExistingSlotChildren(
  slots: Record<string, string[]>,
  currentNodeIds: Set<string>
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(slots).map(([slot, children]) => [
      slot,
      children.filter((childNodeId) => currentNodeIds.has(childNodeId)),
    ])
  );
}

function hasEditorNodeShapeChanged(
  previous: EditorComponentNode,
  next: EditorComponentNode
): boolean {
  return (
    previous.componentId !== next.componentId ||
    previous.name !== next.name ||
    previous.x !== next.x ||
    previous.y !== next.y ||
    previous.w !== next.w ||
    previous.h !== next.h ||
    previous.variant !== next.variant ||
    JSON.stringify(previous.props) !== JSON.stringify(next.props) ||
    JSON.stringify(previous.slots) !== JSON.stringify(next.slots)
  );
}

function defaultPropsForComponent(component: ComponentDocument): Record<string, unknown> {
  return Object.fromEntries(
    component.props
      .filter((prop) => prop.default !== undefined)
      .map((prop) => [prop.name, prop.default])
  );
}

function defaultSlotsForComponent(component: ComponentDocument): Record<string, string[]> {
  return Object.fromEntries(component.slots.map((slot) => [slot.name, []]));
}

function findNode(state: EditorCanvasState, nodeId: string): EditorComponentNode {
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node) {
    throw new Error(`Editor node "${nodeId}" was not found.`);
  }
  return node;
}

function findComponent(state: EditorCanvasState, componentId: string): ComponentDocument {
  const component = state.components.find((item) => item.id === componentId);
  if (!component) {
    throw new Error(`Component "${componentId}" was not found in editor registry.`);
  }
  return component;
}

function wouldCreateSlotCycle(
  state: EditorCanvasState,
  parentNodeId: string,
  childNodeId: string
): boolean {
  const visit = (nodeId: string, seen = new Set<string>()): boolean => {
    if (nodeId === parentNodeId) {
      return true;
    }
    if (seen.has(nodeId)) {
      return false;
    }
    seen.add(nodeId);
    const node = state.nodes.find((item) => item.id === nodeId);
    if (!node) {
      return false;
    }
    return Object.values(node.slots)
      .flat()
      .some((childId) => visit(childId, seen));
  };
  return parentNodeId === childNodeId || visit(childNodeId);
}

function mergeEditedProps(
  component: ComponentDocument,
  props: Record<string, unknown>
): ComponentDocument["props"] {
  const existing = new Set(component.props.map((prop) => prop.name));
  return [
    ...component.props,
    ...Object.entries(props)
      .filter(([name]) => !existing.has(name))
      .map(([name, value]) => ({
        name,
        type: inferPropType(value),
        required: false,
        default: value,
      })),
  ];
}

function inferPropType(value: unknown): ComponentDocument["props"][number]["type"] {
  if (typeof value === "boolean") {
    return { kind: "boolean" };
  }
  if (typeof value === "number") {
    return { kind: "number" };
  }
  if (typeof value === "object" && value !== null) {
    return { kind: "object" };
  }
  return { kind: "string" };
}

function serializeNodeExample(node: EditorComponentNode): string {
  const propEntries = Object.entries(node.props)
    .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
    .join(" ");
  return `<${node.name.replace(/\s+/g, "")} ${propEntries}></${node.name.replace(/\s+/g, "")}>`;
}

function parseJsonRecord(
  value: string
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "Props JSON must be an object." };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Props JSON is invalid.",
    };
  }
}

function safeParseRecord(value: string): Record<string, unknown> {
  const parsed = parseJsonRecord(value);
  if (parsed.ok) {
    return parsed.value;
  }
  return {};
}

function figmaAliasFromTokenValue(value: unknown): FigmaVariableAlias | undefined {
  if (typeof value === "string" && /^\{[^}]+\}$/.test(value)) {
    return { type: "VARIABLE_ALIAS", id: `podo:${value.slice(1, -1)}` };
  }
  return undefined;
}

function normalizeFigmaPath(name: string): string[] {
  return name
    .split(/[/.]/g)
    .map((part) =>
      part
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);
}

function figmaVariableToToken(
  collection: FigmaVariableCollection,
  variable: FigmaVariable,
  defaultMode: string,
  aliases: Map<string, string>
): DesignToken {
  const tokenType = inferTokenType(variable);
  const modes = Object.fromEntries(
    collection.modes.map((mode) => [
      mode.name,
      convertFigmaValue(
        variable.resolvedType,
        variable.valuesByMode[mode.modeId],
        tokenType,
        aliases
      ),
    ])
  );
  return {
    $type: tokenType,
    $value: convertFigmaValue(
      variable.resolvedType,
      variable.valuesByMode[defaultMode],
      tokenType,
      aliases
    ),
    ...(variable.description ? { $description: variable.description } : {}),
    $extensions: {
      podo: { themeable: collection.modes.length > 1 },
      figma: {
        collectionId: collection.id,
        variableId: variable.id,
        modes,
      },
    },
  };
}

function inferTokenType(variable: FigmaVariable): DesignToken["$type"] {
  if (variable.resolvedType === "COLOR") {
    return "color";
  }
  if (variable.resolvedType === "FLOAT") {
    const path = variable.name.toLowerCase();
    if (path.includes("radius")) {
      return "radius";
    }
    if (path.includes("space") || path.includes("gap") || path.includes("spacing")) {
      return "spacing";
    }
    return "number";
  }
  if (variable.resolvedType === "BOOLEAN") {
    return "string";
  }
  return "string";
}

function convertFigmaValue(
  type: FigmaVariable["resolvedType"],
  value: unknown,
  tokenType: DesignToken["$type"],
  aliases: Map<string, string>
): unknown {
  if (isFigmaAlias(value)) {
    const alias = aliases.get(value.id);
    if (!alias) {
      throw new Error(`Figma alias "${value.id}" does not point to an imported variable.`);
    }
    return `{${alias}}`;
  }
  if (type === "COLOR" && isFigmaColor(value)) {
    return figmaColorToHex(value);
  }
  if (type === "FLOAT" && typeof value === "number") {
    return ["spacing", "radius", "dimension"].includes(tokenType) ? `${value}px` : value;
  }
  if (type === "BOOLEAN") {
    return String(Boolean(value));
  }
  return typeof value === "string" || typeof value === "number" ? value : String(value ?? "");
}

function setTokenAtPath(target: TokenTree, path: string[], token: DesignToken): void {
  const [head, ...tail] = path;
  if (!head) {
    throw new Error("Token path cannot be empty.");
  }
  if (tail.length === 0) {
    const existing = target[head];
    if (existing && !isDesignTokenLike(existing)) {
      throw new Error(`Figma variable path "${path.join(".")}" conflicts with a token group.`);
    }
    target[head] = token;
    return;
  }
  const current = target[head];
  if (isDesignTokenLike(current)) {
    throw new Error(`Figma variable path "${path.join(".")}" conflicts with token "${head}".`);
  }
  if (!current || Array.isArray(current)) {
    target[head] = {};
  }
  setTokenAtPath(target[head] as TokenTree, tail, token);
}

function collectTokens(
  tree: TokenTree,
  path: string[],
  visitor: (path: string[], token: DesignToken) => void
): void {
  for (const [key, value] of Object.entries(tree)) {
    if (isDesignTokenLike(value)) {
      visitor([...path, key], value);
    } else {
      collectTokens(value as TokenTree, [...path, key], visitor);
    }
  }
}

function tokenToFigmaVariable(path: string[], token: DesignToken): FigmaVariable {
  const resolvedType = tokenTypeToFigmaType(token.$type);
  return {
    id: `podo:${path.join(".")}`,
    name: path.join("/"),
    resolvedType,
    ...(token.$description ? { description: token.$description } : {}),
    valuesByMode: {
      default:
        resolvedType === "COLOR"
          ? tokenValueToFigmaColor(token.$value)
          : tokenValueToFigmaValue(token.$value, resolvedType),
    },
  };
}

function tokenTypeToFigmaType(type: DesignToken["$type"]): FigmaVariable["resolvedType"] {
  if (type === "color") {
    return "COLOR";
  }
  if (type === "number" || type === "spacing" || type === "radius" || type === "dimension") {
    return "FLOAT";
  }
  return "STRING";
}

function isFigmaColor(value: unknown): value is { r: number; g: number; b: number; a?: number } {
  return (
    value !== null && typeof value === "object" && "r" in value && "g" in value && "b" in value
  );
}

function isFigmaAlias(value: unknown): value is FigmaVariableAlias {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    (value as { type?: unknown }).type === "VARIABLE_ALIAS" &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function figmaColorToHex(value: { r: number; g: number; b: number; a?: number }): string {
  const alpha = value.a ?? 1;
  return `#${[value.r, value.g, value.b, alpha]
    .filter((_, index) => index < 3 || alpha < 1)
    .map((channel) =>
      Math.round(clamp01(channel) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function tokenValueToFigmaColor(
  value: unknown
): { r: number; g: number; b: number; a: number } | FigmaVariableAlias {
  const alias = figmaAliasFromTokenValue(value);
  if (alias) {
    return alias;
  }
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6,8}$/.test(value)) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const hex = value.slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function tokenValueToFigmaValue(value: unknown, type: FigmaVariable["resolvedType"]): unknown {
  const alias = figmaAliasFromTokenValue(value);
  if (alias) {
    return alias;
  }
  if (type === "FLOAT" && typeof value === "string") {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return value;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isDesignTokenLike(value: unknown): value is DesignToken {
  return Boolean(value && typeof value === "object" && "$type" in value && "$value" in value);
}

const editorShellStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "240px minmax(0, 1fr)",
  background: "#f6f7f9",
  color: "#171a20",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const sidebarStyle: CSSProperties = {
  borderRight: "1px solid #d8dde6",
  background: "#ffffff",
  padding: 12,
  display: "grid",
  alignContent: "start",
  gap: 12,
};

const sidebarTitleStyle: CSSProperties = { fontWeight: 700, fontSize: 15 };

const toolbarStyle: CSSProperties = { display: "grid", gap: 8 };

const toolbarButtonStyle: CSSProperties = {
  height: 34,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  textAlign: "left",
  padding: "0 10px",
};

const smallButtonStyle: CSSProperties = {
  minHeight: 28,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 8px",
  textAlign: "left",
};

const segmentedStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 4,
};

const segmentedButtonStyle: CSSProperties = {
  minHeight: 28,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: 0,
};

const segmentedButtonActiveStyle: CSSProperties = {
  background: "#eaf1ff",
  borderColor: "#8fb3f4",
};

const inspectorStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 10,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 5,
  fontSize: 12,
  color: "#5d6775",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 90,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  padding: 8,
  resize: "vertical",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
};

const errorTextStyle: CSSProperties = {
  color: "#b42318",
  fontSize: 12,
  lineHeight: 1.4,
};

const slotRowStyle: CSSProperties = {
  display: "grid",
  gap: 5,
};

const viewportPanelStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  padding: 10,
  display: "grid",
  gap: 4,
};

const canvasShellStyle: CSSProperties = {
  minWidth: 0,
  overflow: "auto",
  padding: 16,
};

const previewFrameStyle: CSSProperties = {
  minWidth: 320,
  minHeight: 320,
  border: "1px solid #cfd6e2",
  background: "#ffffff",
};

const componentShapeStyle: CSSProperties = {
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

const shapeHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 10px",
  background: "#eef2f7",
  borderBottom: "1px solid #d8dde6",
};

const shapeMetaStyle: CSSProperties = {
  padding: 10,
  fontSize: 12,
  color: "#5d6775",
};

const shapeBodyStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "0 10px",
  fontSize: 12,
  color: "#5d6775",
};
