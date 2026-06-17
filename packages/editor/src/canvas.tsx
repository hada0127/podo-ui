import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  T,
  createShapeId,
  resizeBox,
  type Editor,
  type Geometry2d,
  type RecordProps,
  type TLResizeInfo,
  type TLShape,
} from "tldraw";
import {
  PODO_SCHEMA_VERSION,
  parseComponentDocument,
  parsePageDocument,
  type ComponentDocument,
  type PageDocument,
} from "@podo/spec";
import { type ResponsiveViewportName } from "./viewport.js";
import {
  autoLayoutFrameStyle,
  componentShapeStyle,
  shapeBodyStyle,
  shapeHeaderStyle,
  shapeLayoutBadgeStyle,
  shapeMetaStyle,
  slotDropZoneEmptyStyle,
  slotDropZoneLabelStyle,
  slotDropZoneStyle,
} from "./styles.js";

export const PODO_COMPONENT_SHAPE_TYPE = "podo-component" as const;
export const PODO_COMPONENT_DRAG_TYPE = "application/x-podo-component";

/** Per-axis resize behavior, mirroring Figma/pencil hug/fill/fixed. */
export type AxisSizing = "fixed" | "hug" | "fill";

/**
 * Auto-layout (flex/stack) configuration for a canvas node, modeled on
 * Figma auto layout and pencil.dev frame layout. `mode: "none"` is the default
 * and reproduces today's absolute box. `gap`/`padding` are token-reference
 * strings (e.g. "{spacing.2}") or "" so page export stays token-only.
 */
export interface EditorNodeLayout {
  mode: "none" | "horizontal" | "vertical";
  gap: string;
  padding: string;
  align: "start" | "center" | "end" | "stretch" | "baseline";
  justify: "start" | "center" | "end" | "space-between" | "space-around";
  wrap: boolean;
}

export const DEFAULT_NODE_LAYOUT: EditorNodeLayout = {
  mode: "none",
  gap: "",
  padding: "",
  align: "stretch",
  justify: "start",
  wrap: false,
};

export const DEFAULT_AXIS_SIZING: AxisSizing = "fixed";

const LAYOUT_MODE_VALUES: readonly EditorNodeLayout["mode"][] = ["none", "horizontal", "vertical"];
const LAYOUT_ALIGN_VALUES: readonly EditorNodeLayout["align"][] = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
];
const LAYOUT_JUSTIFY_VALUES: readonly EditorNodeLayout["justify"][] = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
];
const AXIS_SIZING_VALUES: readonly AxisSizing[] = ["fixed", "hug", "fill"];

function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * Validate and coerce an untrusted layout value (e.g. parsed from a tldraw shape
 * prop) into a well-formed EditorNodeLayout, filling defaults for any missing or
 * out-of-range field. `wrap` is forced off when the node is not a flex container.
 */
export function normalizeEditorNodeLayout(value: unknown): EditorNodeLayout {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const mode = oneOf(LAYOUT_MODE_VALUES, record.mode, "none");
  return {
    mode,
    gap: typeof record.gap === "string" ? record.gap : "",
    padding: typeof record.padding === "string" ? record.padding : "",
    align: oneOf(LAYOUT_ALIGN_VALUES, record.align, "stretch"),
    justify: oneOf(LAYOUT_JUSTIFY_VALUES, record.justify, "start"),
    wrap: mode === "none" ? false : record.wrap === true,
  };
}

export function normalizeAxisSizing(value: unknown): AxisSizing {
  return oneOf(AXIS_SIZING_VALUES, value, "fixed");
}

/** Map the layout `align` enum to a CSS align-items value. */
export function flexAlignToCss(align: EditorNodeLayout["align"]): string {
  switch (align) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    default:
      return align; // center | stretch | baseline are valid CSS as-is
  }
}

/** Map the layout `justify` enum to a CSS justify-content value. */
export function flexJustifyToCss(justify: EditorNodeLayout["justify"]): string {
  switch (justify) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    default:
      return justify; // center | space-between | space-around are valid CSS as-is
  }
}

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
  // Auto-layout config. Optional so legacy nodes (and test fixtures) without a
  // layout keep behaving as absolute boxes; consumers default via DEFAULT_*.
  layout?: EditorNodeLayout;
  widthSizing?: AxisSizing;
  heightSizing?: AxisSizing;
}

/** Read a node's effective layout, falling back to the absolute-box default. */
export function nodeLayout(node: EditorComponentNode): EditorNodeLayout {
  return node.layout ?? DEFAULT_NODE_LAYOUT;
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
  layoutJson: string;
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
    layoutJson: T.string,
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
      layoutJson: "{}",
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
    const layout = normalizeEditorNodeLayout(safeParseRecord(shape.props.layoutJson).layout);
    const slotEntries = Object.entries(slots);
    const isAutoLayout = layout.mode !== "none";
    return (
      <HTMLContainer style={componentShapeStyle}>
        <div style={shapeHeaderStyle}>
          <strong>{shape.props.label}</strong>
          <span>{shape.props.variant}</span>
        </div>
        {isAutoLayout ? (
          <div
            style={{
              ...autoLayoutFrameStyle,
              flexDirection: layout.mode === "horizontal" ? "row" : "column",
              alignItems: flexAlignToCss(layout.align),
              justifyContent: flexJustifyToCss(layout.justify),
              flexWrap: layout.wrap ? "wrap" : "nowrap",
              gap: layout.gap ? 10 : 6,
            }}
          >
            {slotEntries.length ? (
              slotEntries.map(([name, children]) => (
                <div key={name} style={slotDropZoneStyle}>
                  <span style={slotDropZoneLabelStyle}>{name}</span>
                  <span>{Array.isArray(children) ? children.length : 0} child</span>
                </div>
              ))
            ) : (
              <span style={slotDropZoneEmptyStyle}>auto-layout · add a slot</span>
            )}
          </div>
        ) : (
          <div style={shapeMetaStyle}>{shape.props.componentId}</div>
        )}
        <div style={shapeBodyStyle}>
          <span>{Object.keys(props).length} props</span>
          <span>{slotEntries.length} slots</span>
          {isAutoLayout ? (
            <span style={shapeLayoutBadgeStyle}>
              {layout.mode === "horizontal" ? "→ row" : "↓ column"}
            </span>
          ) : null}
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
  input: Partial<
    Pick<
      EditorComponentNode,
      "id" | "w" | "h" | "variant" | "props" | "slots" | "layout" | "widthSizing" | "heightSizing"
    >
  > = {}
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
    layout: input.layout ?? DEFAULT_NODE_LAYOUT,
    widthSizing: input.widthSizing ?? DEFAULT_AXIS_SIZING,
    heightSizing: input.heightSizing ?? DEFAULT_AXIS_SIZING,
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

/** Update a node's auto-layout config (validated/normalized) and select it. */
export function updateComponentNodeLayout(
  state: EditorCanvasState,
  nodeId: string,
  update: {
    layout?: Partial<EditorNodeLayout>;
    widthSizing?: AxisSizing;
    heightSizing?: AxisSizing;
  }
): EditorCanvasState {
  return {
    ...state,
    nodes: state.nodes.map((node) => {
      if (node.id !== nodeId) {
        return node;
      }
      return {
        ...node,
        layout: normalizeEditorNodeLayout({ ...nodeLayout(node), ...update.layout }),
        widthSizing: normalizeAxisSizing(
          update.widthSizing ?? node.widthSizing ?? DEFAULT_AXIS_SIZING
        ),
        heightSizing: normalizeAxisSizing(
          update.heightSizing ?? node.heightSizing ?? DEFAULT_AXIS_SIZING
        ),
      };
    }),
    selectedNodeId: nodeId,
  };
}

/**
 * Migrate canvas slot fills from an old slot name to a new one for every node of
 * a component, so renaming a slot declaration does not orphan children that were
 * already composed into the old slot.
 */
export function renameNodeSlot(
  nodes: EditorComponentNode[],
  componentId: string,
  fromName: string,
  toName: string
): EditorComponentNode[] {
  if (fromName === toName) {
    return nodes;
  }
  return nodes.map((node) => {
    if (node.componentId !== componentId || !(fromName in node.slots)) {
      return node;
    }
    const { [fromName]: moved, ...rest } = node.slots;
    return {
      ...node,
      slots: { ...rest, [toName]: [...(node.slots[toName] ?? []), ...(moved ?? [])] },
    };
  });
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

/**
 * Build a blank custom component document (default category "layout") with a
 * single repeated "content" slot, so users can author their own components /
 * layouts beyond the bundled ones and compose children into them on the canvas.
 */
export function createCustomComponentDocument(input: {
  id: string;
  name: string;
  category?: ComponentDocument["category"];
}): ComponentDocument {
  return parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: input.id,
    name: input.name,
    category: input.category ?? "layout",
    status: "draft",
    description: "Custom component authored in the editor.",
    anatomy: [{ name: "root" }, { name: "content" }],
    slots: [{ name: "content", required: false, repeated: true }],
    targets: {
      web: { supported: true },
      react: { supported: true },
      hono: { supported: true },
      native: { supported: true },
    },
    accessibility: {},
  });
}

/** Add a component to the canvas state, or replace the existing one by id. */
export function upsertEditorComponent(
  state: EditorCanvasState,
  component: ComponentDocument
): EditorCanvasState {
  const exists = state.components.some((item) => item.id === component.id);
  return {
    ...state,
    components: exists
      ? state.components.map((item) => (item.id === component.id ? component : item))
      : [...state.components, component],
  };
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

export interface PageExportOptions {
  id: string;
  name: string;
  route?: string;
}

export interface PageDocumentExportFile {
  path: string;
  contents: string;
  document: PageDocument;
}

/**
 * Map the canvas node graph into an installed-project PageDocument: top-level
 * nodes become a flex layout of component instances, and each node's slot fills
 * become nested component-instance children. Page design is installed-project
 * only (report.md §8). Style values stay token-driven (no raw layout values).
 */
/**
 * Project a node's editor auto-layout onto a page LayoutNode `layout` object,
 * emitting only non-default keys in a fixed order so default canvases stay
 * byte-stable. `gap`/`padding` are passed through as token-reference strings.
 */
function pageLayoutFromNode(layout: EditorNodeLayout): Record<string, unknown> {
  const result: Record<string, unknown> = {
    mode: "flex",
    direction: layout.mode === "horizontal" ? "row" : "column",
  };
  if (layout.gap) {
    result.gap = layout.gap;
  }
  if (layout.padding) {
    result.padding = layout.padding;
  }
  if (layout.align !== "stretch") {
    result.align = layout.align;
  }
  if (layout.justify !== "start") {
    result.justify = layout.justify;
  }
  if (layout.wrap) {
    result.wrap = true;
  }
  return result;
}

export function createPageDocumentFromCanvas(
  state: EditorCanvasState,
  options: PageExportOptions
): PageDocument {
  const nodeById = new Map(state.nodes.map((node) => [node.id, node]));
  const slotted = new Set<string>();
  for (const node of state.nodes) {
    for (const childIds of Object.values(node.slots)) {
      for (const childId of childIds) {
        slotted.add(childId);
      }
    }
  }

  // Cycle detection is PER PATH (ancestors), not global: a node legitimately
  // shared across two parents must appear under both (no silent drop), while a
  // slot cycle (a node reachable from itself) throws instead of looping.
  // `reached` records every node actually exported so we can detect nodes left
  // unreachable by an all-slotted cyclic subgraph.
  const reached = new Set<string>();
  const buildNode = (
    node: EditorComponentNode,
    ancestors: Set<string>
  ): Record<string, unknown> => {
    if (ancestors.has(node.id)) {
      throw new Error(
        `Canvas node "${node.id}" forms a slot cycle and cannot be exported as a page.`
      );
    }
    reached.add(node.id);
    const nextAncestors = new Set(ancestors).add(node.id);
    // A custom layout-category container with auto-layout becomes a flex/grid
    // LayoutNode whose children are its (ordered) slot fills. Regular components
    // stay component-instances so their slot structure is preserved.
    const layout = nodeLayout(node);
    const component = state.components.find((item) => item.id === node.componentId);
    if (component?.category === "layout" && layout.mode !== "none") {
      const children = Object.values(node.slots)
        .flat()
        .map((childId) => nodeById.get(childId))
        .filter((child): child is EditorComponentNode => Boolean(child))
        .map((child) => buildNode(child, nextAncestors));
      return {
        type: "layout",
        layout: pageLayoutFromNode(layout),
        children,
      };
    }
    const slots: Record<string, unknown[]> = {};
    for (const [slotName, childIds] of Object.entries(node.slots)) {
      const children = childIds
        .map((childId) => nodeById.get(childId))
        .filter((child): child is EditorComponentNode => Boolean(child))
        .map((child) => buildNode(child, nextAncestors));
      if (children.length) {
        slots[slotName] = children;
      }
    }
    return {
      type: "component-instance",
      component: node.componentId,
      props: { ...node.props, ...(node.variant ? { variant: node.variant } : {}) },
      slots,
    };
  };

  const topLevel = state.nodes.filter((node) => !slotted.has(node.id));
  if (state.nodes.length > 0 && topLevel.length === 0) {
    throw new Error(
      "Canvas has no top-level nodes to export as a page (every node is slotted; check for a slot cycle)."
    );
  }
  const children = topLevel.map((node) => buildNode(node, new Set()));
  // Every node must be reachable from a top-level root; otherwise an all-slotted
  // cyclic subgraph would be silently dropped from the exported page.
  if (reached.size !== state.nodes.length) {
    throw new Error(
      "Some canvas nodes are unreachable (orphaned or in a slot cycle) and cannot be exported as a page."
    );
  }
  return parsePageDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "page",
    id: options.id,
    name: options.name,
    ...(options.route ? { route: options.route } : {}),
    root: {
      type: "layout",
      layout: { mode: "flex" },
      children,
    },
  });
}

export function createPageDocumentExportFile(
  state: EditorCanvasState,
  options: PageExportOptions,
  directory = ".podo/pages"
): PageDocumentExportFile {
  const document = createPageDocumentFromCanvas(state, options);
  return {
    path: `${directory.replace(/\/+$/g, "")}/${document.id}.page.json`,
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

export function editorNodeToTldrawShape(node: EditorComponentNode): PodoComponentShapeInput {
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
      layoutJson: JSON.stringify({
        layout: nodeLayout(node),
        widthSizing: node.widthSizing ?? DEFAULT_AXIS_SIZING,
        heightSizing: node.heightSizing ?? DEFAULT_AXIS_SIZING,
      }),
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
  const layoutRecord = safeParseRecord(shape.props.layoutJson);
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
    layout: normalizeEditorNodeLayout(layoutRecord.layout),
    widthSizing: normalizeAxisSizing(layoutRecord.widthSizing),
    heightSizing: normalizeAxisSizing(layoutRecord.heightSizing),
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
    JSON.stringify(previous.slots) !== JSON.stringify(next.slots) ||
    JSON.stringify(nodeLayout(previous)) !== JSON.stringify(nodeLayout(next)) ||
    (previous.widthSizing ?? DEFAULT_AXIS_SIZING) !== (next.widthSizing ?? DEFAULT_AXIS_SIZING) ||
    (previous.heightSizing ?? DEFAULT_AXIS_SIZING) !== (next.heightSizing ?? DEFAULT_AXIS_SIZING)
  );
}

export function defaultPropsForComponent(component: ComponentDocument): Record<string, unknown> {
  return Object.fromEntries(
    component.props
      .filter((prop) => prop.default !== undefined)
      .map((prop) => [prop.name, prop.default])
  );
}

export function defaultSlotsForComponent(component: ComponentDocument): Record<string, string[]> {
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

export function parseJsonRecord(
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
