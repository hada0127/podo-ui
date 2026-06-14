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
import {
  componentPropValuesText,
  componentVariantValuesText,
  createComponentPropType,
  deleteComponentProp,
  deleteComponentVariant,
  deleteTokenFromDocuments,
  editorPropKinds,
  editorTokenTypes,
  flattenTokenDocuments,
  moveTokenInDocuments,
  normalizeEditorTokenDocuments,
  parseEditorTokenValue,
  parsePropDefaultInput,
  serializeEditorTokenValue,
  serializePropDefaultInput,
  updateComponentMeta,
  upsertComponentProp,
  upsertComponentVariant,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";

export const packageName = "@podo/editor";

export const PODO_COMPONENT_SHAPE_TYPE = "podo-component" as const;
const PODO_COMPONENT_DRAG_TYPE = "application/x-podo-component";

export type ResponsiveViewportName = "desktop" | "tablet" | "mobile";
export type EditorColorScheme = "light" | "dark" | "auto";

export const editorColorSchemes: EditorColorScheme[] = ["light", "dark", "auto"];

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

export const editorLegacyGridContract = {
  breakpoints: {
    pc: { minWidth: "1280px", columns: 12, gap: "24px", paddingInline: "24px" },
    tablet: {
      minWidth: "768px",
      maxWidth: "1279px",
      columns: 6,
      gap: "16px",
      paddingInline: "16px",
    },
    mobile: { maxWidth: "767px", columns: 4, gap: "16px", paddingInline: "16px" },
  },
  fixedColumns: { min: 2, max: 6 },
  spanColumns: { min: 1, max: 12 },
  pixelWidth: { min: 0, max: 5000 },
} as const;

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
  tokenDocuments?: TokenDocument[];
  initialState?: EditorCanvasState;
  viewport?: ResponsiveViewportName;
  colorScheme?: EditorColorScheme;
  onStateChange?: (state: EditorCanvasState) => void;
  onSpecsChange?: (specs: {
    components: ComponentDocument[];
    tokenDocuments: TokenDocument[];
  }) => void;
}

type EditorPanel = "tokens" | "components" | "canvas" | "export";

interface ComponentMetaDraft {
  name: string;
  category: ComponentDocument["category"];
  status: ComponentDocument["status"];
  description: string;
}

interface ComponentPropDraft {
  name: string;
  kind: ComponentDocument["props"][number]["type"]["kind"];
  valuesText: string;
  defaultValue: string;
  required: boolean;
  description: string;
}

interface ComponentVariantDraft {
  name: string;
  valuesText: string;
  defaultValue: string;
  description: string;
  tokensText: string;
}

const editorPanels: EditorPanel[] = ["tokens", "components", "canvas", "export"];
const componentCategories: ComponentDocument["category"][] = [
  "atom",
  "molecule",
  "organism",
  "template",
  "layout",
  "utility",
];
const componentStatuses: ComponentDocument["status"][] = [
  "draft",
  "experimental",
  "stable",
  "deprecated",
];

export function PodoEditorApp({
  components,
  tokenDocuments = [],
  initialState,
  viewport = "desktop",
  colorScheme = "light",
  onStateChange,
  onSpecsChange,
}: PodoEditorAppProps) {
  const parsedComponents = useMemo(
    () => components.map((component) => parseComponentDocument(component)),
    [components]
  );
  const initialTokenDocuments = useMemo(
    () => normalizeEditorTokenDocuments(tokenDocuments),
    [tokenDocuments]
  );
  const startingState = useMemo(
    () =>
      initialState
        ? { ...initialState, components: initialState.components.map(parseComponentDocument) }
        : createEditorState({ components: parsedComponents, viewport }),
    [initialState, parsedComponents, viewport]
  );
  const [state, setState] = useState(startingState);
  const [activePanel, setActivePanel] = useState<EditorPanel>("tokens");
  const [tokenDocumentsState, setTokenDocumentsState] = useState(initialTokenDocuments);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | undefined>();
  const [tokenDraft, setTokenDraft] = useState<EditorTokenDraft>(() => createNewTokenDraft());
  const [tokenDraftError, setTokenDraftError] = useState<string | undefined>();
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(
    startingState.components[0]?.id
  );
  const [componentMetaDraft, setComponentMetaDraft] = useState<ComponentMetaDraft>(() =>
    componentMetaDraftFromComponent(startingState.components[0])
  );
  const [componentDraftError, setComponentDraftError] = useState<string | undefined>();
  const [selectedPropName, setSelectedPropName] = useState<string | undefined>(
    startingState.components[0]?.props[0]?.name
  );
  const [propDraft, setPropDraft] = useState<ComponentPropDraft>(() =>
    createNewComponentPropDraft()
  );
  const [selectedVariantName, setSelectedVariantName] = useState<string | undefined>(
    startingState.components[0]?.variants[0]?.name
  );
  const [variantDraft, setVariantDraft] = useState<ComponentVariantDraft>(() =>
    createNewComponentVariantDraft()
  );
  const [componentPreviewSelections, setComponentPreviewSelections] = useState<
    Record<string, string>
  >({});
  const [selectedColorScheme, setSelectedColorScheme] = useState<EditorColorScheme>(colorScheme);
  const [systemColorScheme, setSystemColorScheme] = useState<"light" | "dark">("light");
  const [exportPreview, setExportPreview] = useState<ComponentSpecExportFile | undefined>();
  const [propsDraft, setPropsDraft] = useState("");
  const [propsDraftNodeId, setPropsDraftNodeId] = useState<string | undefined>();
  const [propsDraftError, setPropsDraftError] = useState<string | undefined>();
  const editorRef = useRef<Editor | null>(null);
  const isApplyingStateToTldrawRef = useRef(false);
  const stateRef = useRef(startingState);
  const frame = responsiveViewports[state.viewport];
  const tokenRecords = useMemo(
    () => flattenTokenDocuments(tokenDocumentsState),
    [tokenDocumentsState]
  );
  const tokenGroups = useMemo(() => groupTokenRecordsByType(tokenRecords), [tokenRecords]);
  const effectiveColorScheme = effectiveEditorColorScheme(selectedColorScheme, systemColorScheme);
  const previewTokenLookup = useMemo(
    () => createThemedTokenLookup(tokenRecords, effectiveColorScheme),
    [effectiveColorScheme, tokenRecords]
  );
  const selectedToken = selectedTokenKey
    ? tokenRecords.find((record) => tokenRecordKey(record) === selectedTokenKey)
    : undefined;
  const selectedComponentForSpec =
    state.components.find((component) => component.id === selectedComponentId) ??
    state.components[0];
  const selectedNode = state.nodes.find((node) => node.id === state.selectedNodeId);
  const selectedComponent = selectedNode
    ? state.components.find((component) => component.id === selectedNode.componentId)
    : undefined;
  const selectedProp = selectedComponentForSpec?.props.find(
    (prop) => prop.name === selectedPropName
  );
  const selectedVariant = selectedComponentForSpec?.variants.find(
    (variant) => variant.name === selectedVariantName
  );
  const selectedTokenRecordKey = selectedToken ? tokenRecordKey(selectedToken) : "";
  const selectedPropKey = selectedProp ? JSON.stringify(selectedProp) : "";
  const selectedVariantKey = selectedVariant ? JSON.stringify(selectedVariant) : "";
  const selectedComponentVariantsKey = selectedComponentForSpec
    ? JSON.stringify(selectedComponentForSpec.variants)
    : "";
  const effectiveComponentPreviewSelections = useMemo(
    () =>
      selectedComponentForSpec
        ? {
            ...defaultPreviewSelectionsForComponent(selectedComponentForSpec),
            ...componentPreviewSelections,
          }
        : {},
    [componentPreviewSelections, selectedComponentForSpec]
  );
  const selectedNodePropsKey = selectedNode ? JSON.stringify(selectedNode.props) : "";

  useEffect(() => {
    if (!selectedTokenKey && tokenRecords[0]) {
      setSelectedTokenKey(tokenRecordKey(tokenRecords[0]));
    }
  }, [selectedTokenKey, tokenRecords]);

  useEffect(() => {
    const media = globalThis.window?.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) {
      return;
    }
    const syncSystemColorScheme = (): void => {
      setSystemColorScheme(media.matches ? "dark" : "light");
    };
    syncSystemColorScheme();
    media.addEventListener("change", syncSystemColorScheme);
    return () => media.removeEventListener("change", syncSystemColorScheme);
  }, []);

  useEffect(() => {
    setTokenDraft(selectedToken ? tokenDraftFromRecord(selectedToken) : createNewTokenDraft());
    setTokenDraftError(undefined);
  }, [selectedTokenRecordKey, selectedToken]);

  useEffect(() => {
    if (!selectedComponentForSpec) {
      return;
    }
    setSelectedComponentId(selectedComponentForSpec.id);
    setComponentMetaDraft(componentMetaDraftFromComponent(selectedComponentForSpec));
    setSelectedPropName(selectedComponentForSpec.props[0]?.name);
    setSelectedVariantName(selectedComponentForSpec.variants[0]?.name);
    setComponentDraftError(undefined);
  }, [selectedComponentForSpec?.id]);

  useEffect(() => {
    if (!selectedComponentForSpec) {
      return;
    }
    setComponentPreviewSelections(defaultPreviewSelectionsForComponent(selectedComponentForSpec));
  }, [selectedComponentForSpec?.id, selectedComponentVariantsKey]);

  useEffect(() => {
    setPropDraft(
      selectedProp ? componentPropDraftFromProp(selectedProp) : createNewComponentPropDraft()
    );
    setComponentDraftError(undefined);
  }, [selectedComponentForSpec?.id, selectedPropName, selectedPropKey, selectedProp]);

  useEffect(() => {
    setVariantDraft(
      selectedVariant
        ? componentVariantDraftFromVariant(selectedVariant)
        : createNewComponentVariantDraft()
    );
    setComponentDraftError(undefined);
  }, [selectedComponentForSpec?.id, selectedVariantName, selectedVariantKey, selectedVariant]);

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
  const commitTokenDocuments = (nextDocuments: TokenDocument[]): void => {
    setTokenDocumentsState(nextDocuments);
    onSpecsChange?.({ components: stateRef.current.components, tokenDocuments: nextDocuments });
  };
  const commitComponentSpec = (component: ComponentDocument): void => {
    const parsed = parseComponentDocument(component);
    const nextComponents = state.components.map((item) => (item.id === parsed.id ? parsed : item));
    const nextState = {
      ...state,
      components: nextComponents,
      nodes: state.nodes.map((node) =>
        node.componentId === parsed.id ? normalizeNodeForComponent(node, parsed) : node
      ),
    };
    commitState(nextState);
    onSpecsChange?.({ components: nextComponents, tokenDocuments: tokenDocumentsState });
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
    const component = state.components.find((item) => item.id === componentId);
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
  const saveTokenDraft = (): void => {
    try {
      const documentIndex = tokenDraft.documentIndex ?? selectedToken?.documentIndex ?? 0;
      const normalizedPath = normalizeTokenPathLabel(tokenDraft.path);
      const nextDocuments = moveTokenInDocuments(tokenDocumentsState, {
        documentIndex,
        ...(selectedToken ? { fromPath: selectedToken.path } : {}),
        toDraft: { ...tokenDraft, documentIndex, path: normalizedPath },
      });
      commitTokenDocuments(nextDocuments);
      setSelectedTokenKey(`${documentIndex}:${normalizedPath}`);
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Token draft is invalid.");
    }
  };
  const deleteSelectedToken = (): void => {
    if (!selectedToken) {
      return;
    }
    try {
      const nextDocuments = deleteTokenFromDocuments(
        tokenDocumentsState,
        selectedToken.documentIndex,
        selectedToken.path
      );
      commitTokenDocuments(nextDocuments);
      setSelectedTokenKey(undefined);
      setTokenDraft(createNewTokenDraft());
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Token could not be deleted.");
    }
  };
  const saveComponentMetaDraft = (): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      commitComponentSpec(updateComponentMeta(selectedComponentForSpec, componentMetaDraft));
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Component meta is invalid.");
    }
  };
  const savePropDraft = (): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      const defaultValue = parsePropDefaultInput(propDraft.kind, propDraft.defaultValue);
      const prop: ComponentDocument["props"][number] = {
        name: propDraft.name.trim(),
        type: createComponentPropType(propDraft.kind, propDraft.valuesText),
        required: propDraft.required,
        ...(defaultValue !== undefined ? { default: defaultValue } : {}),
        ...(propDraft.description.trim() ? { description: propDraft.description.trim() } : {}),
      };
      const baseComponent =
        selectedPropName && selectedPropName !== prop.name
          ? deleteComponentProp(selectedComponentForSpec, selectedPropName)
          : selectedComponentForSpec;
      commitComponentSpec(upsertComponentProp(baseComponent, prop));
      setSelectedPropName(prop.name);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Prop draft is invalid.");
    }
  };
  const deleteSelectedProp = (): void => {
    if (!selectedComponentForSpec || !selectedPropName) {
      return;
    }
    try {
      commitComponentSpec(deleteComponentProp(selectedComponentForSpec, selectedPropName));
      setSelectedPropName(undefined);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Prop could not be deleted.");
    }
  };
  const saveVariantDraft = (): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      const baseComponent =
        selectedVariantName && selectedVariantName !== variantDraft.name.trim()
          ? deleteComponentVariant(selectedComponentForSpec, selectedVariantName)
          : selectedComponentForSpec;
      const nextComponent = upsertComponentVariant(baseComponent, variantDraft);
      commitComponentSpec(nextComponent);
      setSelectedVariantName(variantDraft.name.trim());
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Variant draft is invalid.");
    }
  };
  const deleteSelectedVariant = (): void => {
    if (!selectedComponentForSpec || !selectedVariantName) {
      return;
    }
    try {
      commitComponentSpec(deleteComponentVariant(selectedComponentForSpec, selectedVariantName));
      setSelectedVariantName(undefined);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(
        error instanceof Error ? error.message : "Variant could not be deleted."
      );
    }
  };

  return (
    <div style={editorShellStyle}>
      <header style={topBarStyle}>
        <strong style={productTitleStyle}>Podo Editor</strong>
        <div style={panelTabsStyle}>
          {editorPanels.map((panel) => (
            <button
              key={panel}
              type="button"
              style={{
                ...panelTabStyle,
                ...(activePanel === panel ? panelTabActiveStyle : {}),
              }}
              onClick={() => setActivePanel(panel)}
            >
              {panel}
            </button>
          ))}
        </div>
        <div style={topBarControlStyle}>
          <span style={topBarControlLabelStyle}>Scheme</span>
          <div style={schemeSegmentedStyle}>
            {editorColorSchemes.map((scheme) => (
              <button
                key={scheme}
                type="button"
                style={{
                  ...schemeButtonStyle,
                  ...(selectedColorScheme === scheme ? schemeButtonActiveStyle : {}),
                }}
                onClick={() => setSelectedColorScheme(scheme)}
              >
                {scheme}
              </button>
            ))}
          </div>
          <span style={topBarControlValueStyle}>{effectiveColorScheme}</span>
        </div>
      </header>
      <aside style={sidebarStyle}>
        {activePanel === "tokens" ? (
          <>
            <div style={sidebarTitleStyle}>Tokens</div>
            <button
              type="button"
              style={toolbarButtonStyle}
              onClick={() => {
                setSelectedTokenKey(undefined);
                setTokenDraft(createNewTokenDraft());
              }}
            >
              New token
            </button>
            <div style={listStyle}>
              {tokenGroups.map((group) => (
                <section key={group.type} style={tokenGroupStyle}>
                  <div style={tokenGroupHeaderStyle}>
                    <span>{group.type}</span>
                    <small style={tokenGroupCountStyle}>{group.count}</small>
                  </div>
                  {group.sections.map((section) => (
                    <div key={section.parentPath} style={tokenVariationGroupStyle}>
                      <div style={tokenVariationHeaderStyle}>
                        <span>{section.parentPath}</span>
                        <small style={tokenGroupCountStyle}>{section.records.length}</small>
                      </div>
                      {section.records.map((record) => (
                        <button
                          key={tokenRecordKey(record)}
                          type="button"
                          title={record.path}
                          style={{
                            ...tokenVariationButtonStyle,
                            ...(selectedTokenKey === tokenRecordKey(record)
                              ? tokenVariationButtonActiveStyle
                              : {}),
                          }}
                          onClick={() => setSelectedTokenKey(tokenRecordKey(record))}
                        >
                          <span style={tokenVariationNameStyle}>
                            {tokenVariationName(record.path)}
                          </span>
                          <small style={tokenVariationValueStyle}>
                            {formatTokenListValue(record.token.$value)}
                          </small>
                        </button>
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </>
        ) : null}
        {activePanel === "components" ? (
          <>
            <div style={sidebarTitleStyle}>Components</div>
            <div style={listStyle}>
              {state.components.map((component) => (
                <button
                  key={component.id}
                  type="button"
                  style={{
                    ...listButtonStyle,
                    ...(selectedComponentForSpec?.id === component.id ? listButtonActiveStyle : {}),
                  }}
                  onClick={() => setSelectedComponentId(component.id)}
                >
                  <span>{component.name}</span>
                  <small>{component.id}</small>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {activePanel === "canvas" ? (
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
                  onClick={() =>
                    setExportPreview(createComponentSpecExportFile(state, selectedNode.id))
                  }
                >
                  Export node
                </button>
                {exportPreview ? (
                  <textarea style={textareaStyle} readOnly value={exportPreview.contents} />
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
        {activePanel === "export" ? (
          <>
            <div style={sidebarTitleStyle}>Export</div>
            <div style={summaryListStyle}>
              <span>{tokenRecords.length} tokens</span>
              <span>{state.components.length} components</span>
              <span>{state.nodes.length} canvas nodes</span>
            </div>
          </>
        ) : null}
      </aside>
      <main style={workspaceStyle}>
        {activePanel === "tokens" ? (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h1 style={sectionTitleStyle}>Tokens</h1>
                <p style={sectionMetaStyle}>{tokenRecords.length} JSON token specs</p>
              </div>
              <div style={rowStyle}>
                <button type="button" style={smallButtonStyle} onClick={saveTokenDraft}>
                  Save token
                </button>
                <button
                  type="button"
                  style={dangerButtonStyle}
                  disabled={!selectedToken}
                  onClick={deleteSelectedToken}
                >
                  Delete
                </button>
              </div>
            </div>
            <div style={formGridStyle}>
              <label style={fieldStyle}>
                Path
                <input
                  style={inputStyle}
                  value={tokenDraft.path}
                  onChange={(event) => {
                    const path = event.currentTarget.value;
                    setTokenDraft((draft) => ({ ...draft, path }));
                  }}
                />
              </label>
              <label style={fieldStyle}>
                Type
                <select
                  style={selectStyle}
                  value={tokenDraft.type}
                  onChange={(event) => {
                    const type = event.currentTarget.value as EditorTokenDraft["type"];
                    setTokenDraft((draft) => ({
                      ...draft,
                      type,
                    }));
                  }}
                >
                  {editorTokenTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                Value
                <textarea
                  style={{ ...textareaStyle, minHeight: 120 }}
                  value={tokenDraft.valueText}
                  onChange={(event) => {
                    const valueText = event.currentTarget.value;
                    setTokenDraft((draft) => ({ ...draft, valueText }));
                  }}
                />
              </label>
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                Description
                <input
                  style={inputStyle}
                  value={tokenDraft.description ?? ""}
                  onChange={(event) => {
                    const description = event.currentTarget.value;
                    setTokenDraft((draft) => ({
                      ...draft,
                      description,
                    }));
                  }}
                />
              </label>
            </div>
            {tokenDraftError ? <div style={errorBannerStyle}>{tokenDraftError}</div> : null}
            <div style={previewPanelStyle}>
              <strong>Preview</strong>
              {renderTokenDraftPreview(tokenDraft, previewTokenLookup)}
            </div>
            <div style={previewPanelStyle}>
              <strong>Document JSON</strong>
              <textarea
                style={{ ...textareaStyle, minHeight: 220 }}
                readOnly
                value={JSON.stringify(tokenDocumentsState, null, 2)}
              />
            </div>
          </section>
        ) : null}
        {activePanel === "components" && selectedComponentForSpec ? (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h1 style={sectionTitleStyle}>{selectedComponentForSpec.name}</h1>
                <p style={sectionMetaStyle}>{selectedComponentForSpec.id}.component.json</p>
              </div>
              <button type="button" style={smallButtonStyle} onClick={saveComponentMetaDraft}>
                Save component
              </button>
            </div>
            <div style={formGridStyle}>
              <label style={fieldStyle}>
                Name
                <input
                  style={inputStyle}
                  value={componentMetaDraft.name}
                  onChange={(event) => {
                    const name = event.currentTarget.value;
                    setComponentMetaDraft((draft) => ({
                      ...draft,
                      name,
                    }));
                  }}
                />
              </label>
              <label style={fieldStyle}>
                Category
                <select
                  style={selectStyle}
                  value={componentMetaDraft.category}
                  onChange={(event) => {
                    const category = event.currentTarget.value as ComponentDocument["category"];
                    setComponentMetaDraft((draft) => ({
                      ...draft,
                      category,
                    }));
                  }}
                >
                  {componentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label style={fieldStyle}>
                Status
                <select
                  style={selectStyle}
                  value={componentMetaDraft.status}
                  onChange={(event) => {
                    const status = event.currentTarget.value as ComponentDocument["status"];
                    setComponentMetaDraft((draft) => ({
                      ...draft,
                      status,
                    }));
                  }}
                >
                  {componentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                Description
                <input
                  style={inputStyle}
                  value={componentMetaDraft.description}
                  onChange={(event) => {
                    const description = event.currentTarget.value;
                    setComponentMetaDraft((draft) => ({
                      ...draft,
                      description,
                    }));
                  }}
                />
              </label>
            </div>
            <div style={previewPanelStyle}>
              <div style={cardHeaderStyle}>
                <strong>Preview</strong>
                <div style={previewControlRowStyle}>
                  {selectedComponentForSpec.variants.map((variant) => (
                    <label key={variant.name} style={compactFieldStyle}>
                      {variant.name}
                      <select
                        style={compactSelectStyle}
                        value={
                          effectiveComponentPreviewSelections[variant.name] ??
                          variant.default ??
                          variant.values[0] ??
                          ""
                        }
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setComponentPreviewSelections((selections) => ({
                            ...selections,
                            [variant.name]: value,
                          }));
                        }}
                      >
                        {variant.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
              {renderComponentPreview(
                selectedComponentForSpec,
                effectiveComponentPreviewSelections,
                previewTokenLookup
              )}
            </div>
            <div style={splitPanelStyle}>
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <strong>Props</strong>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => {
                      setSelectedPropName(undefined);
                      setPropDraft(createNewComponentPropDraft());
                    }}
                  >
                    New prop
                  </button>
                </div>
                <div style={tableStyle}>
                  {selectedComponentForSpec.props.map((prop) => (
                    <button
                      key={prop.name}
                      type="button"
                      style={{
                        ...tableRowStyle,
                        ...(selectedPropName === prop.name ? tableRowActiveStyle : {}),
                      }}
                      onClick={() => setSelectedPropName(prop.name)}
                    >
                      <span>{prop.name}</span>
                      <small>{prop.type.kind}</small>
                    </button>
                  ))}
                </div>
                <div style={editorFormStyle}>
                  <label style={fieldStyle}>
                    Name
                    <input
                      style={inputStyle}
                      value={propDraft.name}
                      onChange={(event) => {
                        const name = event.currentTarget.value;
                        setPropDraft((draft) => ({ ...draft, name }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    Type
                    <select
                      style={selectStyle}
                      value={propDraft.kind}
                      onChange={(event) => {
                        const kind = event.currentTarget.value as ComponentPropDraft["kind"];
                        setPropDraft((draft) => ({
                          ...draft,
                          kind,
                        }));
                      }}
                    >
                      {editorPropKinds.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={fieldStyle}>
                    Values
                    <input
                      style={inputStyle}
                      value={propDraft.valuesText}
                      onChange={(event) => {
                        const valuesText = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          valuesText,
                        }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    Default
                    <input
                      style={inputStyle}
                      value={propDraft.defaultValue}
                      onChange={(event) => {
                        const defaultValue = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          defaultValue,
                        }));
                      }}
                    />
                  </label>
                  <label style={checkboxFieldStyle}>
                    <input
                      type="checkbox"
                      checked={propDraft.required}
                      onChange={(event) => {
                        const required = event.currentTarget.checked;
                        setPropDraft((draft) => ({
                          ...draft,
                          required,
                        }));
                      }}
                    />
                    Required
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    Description
                    <input
                      style={inputStyle}
                      value={propDraft.description}
                      onChange={(event) => {
                        const description = event.currentTarget.value;
                        setPropDraft((draft) => ({
                          ...draft,
                          description,
                        }));
                      }}
                    />
                  </label>
                  <div style={rowStyle}>
                    <button type="button" style={smallButtonStyle} onClick={savePropDraft}>
                      Save prop
                    </button>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={!selectedPropName}
                      onClick={deleteSelectedProp}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <strong>Variants</strong>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => {
                      setSelectedVariantName(undefined);
                      setVariantDraft(createNewComponentVariantDraft());
                    }}
                  >
                    New variant
                  </button>
                </div>
                <div style={tableStyle}>
                  {selectedComponentForSpec.variants.map((variant) => (
                    <button
                      key={variant.name}
                      type="button"
                      style={{
                        ...tableRowStyle,
                        ...(selectedVariantName === variant.name ? tableRowActiveStyle : {}),
                      }}
                      onClick={() => setSelectedVariantName(variant.name)}
                    >
                      <span>{variant.name}</span>
                      <small>{variant.values.join(", ")}</small>
                    </button>
                  ))}
                </div>
                <div style={editorFormStyle}>
                  <label style={fieldStyle}>
                    Name
                    <input
                      style={inputStyle}
                      value={variantDraft.name}
                      onChange={(event) => {
                        const name = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          name,
                        }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    Values
                    <input
                      style={inputStyle}
                      value={variantDraft.valuesText}
                      onChange={(event) => {
                        const valuesText = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          valuesText,
                        }));
                      }}
                    />
                  </label>
                  <label style={fieldStyle}>
                    Default
                    <input
                      style={inputStyle}
                      value={variantDraft.defaultValue}
                      onChange={(event) => {
                        const defaultValue = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          defaultValue,
                        }));
                      }}
                    />
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    Token bindings JSON
                    <textarea
                      style={textareaStyle}
                      value={variantDraft.tokensText}
                      onChange={(event) => {
                        const tokensText = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          tokensText,
                        }));
                      }}
                    />
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    Description
                    <input
                      style={inputStyle}
                      value={variantDraft.description}
                      onChange={(event) => {
                        const description = event.currentTarget.value;
                        setVariantDraft((draft) => ({
                          ...draft,
                          description,
                        }));
                      }}
                    />
                  </label>
                  <div style={rowStyle}>
                    <button type="button" style={smallButtonStyle} onClick={saveVariantDraft}>
                      Save variant
                    </button>
                    <button
                      type="button"
                      style={dangerButtonStyle}
                      disabled={!selectedVariantName}
                      onClick={deleteSelectedVariant}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {componentDraftError ? <div style={errorBannerStyle}>{componentDraftError}</div> : null}
            <div style={previewPanelStyle}>
              <strong>Component JSON</strong>
              <textarea
                style={{ ...textareaStyle, minHeight: 220 }}
                readOnly
                value={JSON.stringify(selectedComponentForSpec, null, 2)}
              />
            </div>
          </section>
        ) : null}
        {activePanel === "canvas" ? (
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
                    editor.sideEffects.registerAfterChangeHandler("shape", () =>
                      syncFromTldraw(editor)
                    ),
                    editor.sideEffects.registerAfterDeleteHandler("shape", () =>
                      syncFromTldraw(editor)
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
          </section>
        ) : null}
        {activePanel === "export" ? (
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
        ) : null}
      </main>
    </div>
  );
}

function tokenRecordKey(record: EditorTokenRecord): string {
  return `${record.documentIndex}:${record.path}`;
}

function groupTokenRecordsByType(records: EditorTokenRecord[]): Array<{
  type: DesignToken["$type"];
  count: number;
  sections: Array<{ parentPath: string; records: EditorTokenRecord[] }>;
}> {
  const buckets = new Map<DesignToken["$type"], EditorTokenRecord[]>();
  for (const record of records) {
    const bucket = buckets.get(record.token.$type) ?? [];
    bucket.push(record);
    buckets.set(record.token.$type, bucket);
  }
  return editorTokenTypes.flatMap((type) => {
    const typedRecords = buckets.get(type) ?? [];
    return typedRecords.length
      ? [
          {
            type,
            count: typedRecords.length,
            sections: groupTokenRecordsByParentPath(typedRecords),
          },
        ]
      : [];
  });
}

function groupTokenRecordsByParentPath(
  records: EditorTokenRecord[]
): Array<{ parentPath: string; records: EditorTokenRecord[] }> {
  const buckets = new Map<string, EditorTokenRecord[]>();
  for (const record of records) {
    const parentPath = tokenParentPath(record.path);
    const bucket = buckets.get(parentPath) ?? [];
    bucket.push(record);
    buckets.set(parentPath, bucket);
  }
  return [...buckets.entries()].map(([parentPath, sectionRecords]) => ({
    parentPath,
    records: sectionRecords,
  }));
}

function tokenParentPath(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts.slice(0, -1).join(".") : "root";
}

function tokenVariationName(path: string): string {
  return path.split(".").at(-1) ?? path;
}

function formatTokenListValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.length}]`;
  }
  if (value && typeof value === "object") {
    return "{...}";
  }
  return "";
}

function normalizeTokenPathLabel(path: string): string {
  const normalized = path
    .split(/[./]/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(".");
  if (!normalized) {
    throw new Error("Token path is required.");
  }
  return normalized;
}

function createNewTokenDraft(documentIndex = 0): EditorTokenDraft {
  return {
    documentIndex,
    path: "component.example.value",
    type: "color",
    valueText: "#3366ff",
    description: "",
  };
}

function tokenDraftFromRecord(record: EditorTokenRecord): EditorTokenDraft {
  return {
    documentIndex: record.documentIndex,
    path: record.path,
    type: record.token.$type,
    valueText: serializeEditorTokenValue(record.token.$value),
    description: record.token.$description ?? "",
  };
}

function componentMetaDraftFromComponent(component?: ComponentDocument): ComponentMetaDraft {
  return {
    name: component?.name ?? "",
    category: component?.category ?? "atom",
    status: component?.status ?? "draft",
    description: component?.description ?? "",
  };
}

function createNewComponentPropDraft(): ComponentPropDraft {
  return {
    name: "label",
    kind: "string",
    valuesText: "",
    defaultValue: "",
    required: false,
    description: "",
  };
}

function componentPropDraftFromProp(prop: ComponentDocument["props"][number]): ComponentPropDraft {
  return {
    name: prop.name,
    kind: prop.type.kind,
    valuesText: componentPropValuesText(prop),
    defaultValue: serializePropDefaultInput(prop.default),
    required: prop.required,
    description: prop.description ?? "",
  };
}

function createNewComponentVariantDraft(): ComponentVariantDraft {
  return {
    name: "tone",
    valuesText: "default, emphasis",
    defaultValue: "default",
    description: "",
    tokensText: "",
  };
}

function componentVariantDraftFromVariant(
  variant: ComponentDocument["variants"][number]
): ComponentVariantDraft {
  return {
    name: variant.name,
    valuesText: componentVariantValuesText(variant),
    defaultValue: variant.default ?? variant.values[0] ?? "",
    description: variant.description ?? "",
    tokensText: variant.tokens ? JSON.stringify(variant.tokens, null, 2) : "",
  };
}

function normalizeNodeForComponent(
  node: EditorComponentNode,
  component: ComponentDocument
): EditorComponentNode {
  const allowedProps = new Set(component.props.map((prop) => prop.name));
  const propDefaults = defaultPropsForComponent(component);
  const retainedProps = Object.fromEntries(
    Object.entries(node.props).filter(([propName]) => allowedProps.has(propName))
  );
  const variantValues = component.variants.flatMap((variant) => variant.values);
  const fallbackVariant =
    component.variants[0]?.default ?? component.variants[0]?.values[0] ?? "default";
  return {
    ...node,
    name: component.name,
    variant: node.variant && variantValues.includes(node.variant) ? node.variant : fallbackVariant,
    props: { ...propDefaults, ...retainedProps },
    slots: {
      ...defaultSlotsForComponent(component),
      ...Object.fromEntries(
        Object.entries(node.slots).filter(([slotName]) =>
          component.slots.some((slot) => slot.name === slotName)
        )
      ),
    },
  };
}

export type TokenLookup = Map<string, DesignToken>;

export function effectiveEditorColorScheme(
  colorScheme: EditorColorScheme,
  systemColorScheme: "light" | "dark" = "light"
): "light" | "dark" {
  return colorScheme === "auto" ? systemColorScheme : colorScheme;
}

export function createThemedTokenLookup(
  records: EditorTokenRecord[],
  colorScheme: "light" | "dark"
): TokenLookup {
  const projections = records.flatMap((record, order) => {
    const projection = projectColorSchemeTokenPath(record.path, colorScheme);
    return projection ? [{ ...projection, order, token: record.token }] : [];
  });
  projections.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
  return new Map(projections.map((projection) => [projection.path, projection.token]));
}

function projectColorSchemeTokenPath(
  path: string,
  colorScheme: "light" | "dark"
): { path: string; specificity: number } | undefined {
  const projected: string[] = [];
  let specificity = 0;
  for (const segment of path.split(".")) {
    if (segment === "light" || segment === "dark") {
      if (segment !== colorScheme) {
        return undefined;
      }
      specificity += 1;
      continue;
    }
    projected.push(segment);
  }
  return { path: projected.join("."), specificity };
}

function renderTokenDraftPreview(draft: EditorTokenDraft, lookup: TokenLookup) {
  try {
    const value = resolveTokenValue(lookup, parseEditorTokenValue(draft.type, draft.valueText));
    if (draft.type === "color" || isCssColorValue(value)) {
      const color = String(value);
      return (
        <div style={tokenColorPreviewStyle}>
          <span style={{ ...tokenSwatchStyle, background: color }} />
          <code style={codeStyle}>{color}</code>
        </div>
      );
    }
    if (draft.type === "typography" && isTypographyValue(value)) {
      return (
        <div style={tokenTypographyPreviewStyle}>
          <span style={typographyToCss(value)}>The quick brown fox jumps over the lazy dog.</span>
          <code style={codeStyle}>{JSON.stringify(value)}</code>
        </div>
      );
    }
    if (draft.type === "spacing" || draft.type === "dimension" || draft.type === "radius") {
      const cssValue = String(value);
      return (
        <div style={tokenScalePreviewStyle}>
          <span
            style={{
              ...tokenScaleBoxStyle,
              width: draft.type === "radius" ? 96 : cssValue,
              height: draft.type === "spacing" || draft.type === "dimension" ? 24 : 72,
              borderRadius: draft.type === "radius" ? cssValue : 4,
            }}
          />
          <code style={codeStyle}>{cssValue}</code>
        </div>
      );
    }
    return <code style={codeBlockStyle}>{JSON.stringify(value, null, 2)}</code>;
  } catch (error) {
    return (
      <span style={errorTextStyle}>
        {error instanceof Error ? error.message : "Preview value is invalid."}
      </span>
    );
  }
}

function renderComponentPreview(
  component: ComponentDocument,
  selections: Record<string, string>,
  lookup: TokenLookup
) {
  const stageStyle = componentPreviewStageStyleFromTokens(lookup);
  if (component.id === "button") {
    const style = buttonPreviewStyleFromTokens(selections, lookup);
    return (
      <div style={stageStyle}>
        <button type="button" style={style}>
          Submit
        </button>
        <div style={previewMetaGridStyle}>
          {Object.entries(buttonPreviewTokenReferences(selections)).map(([name, path]) => (
            <span key={name}>
              {name}: <code style={codeStyle}>{path}</code>
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={stageStyle}>
      <div style={genericComponentPreviewStyle}>
        <strong>{component.name}</strong>
        <span>{component.props.length} props</span>
        <span>{component.variants.length} variants</span>
      </div>
    </div>
  );
}

function componentPreviewStageStyleFromTokens(lookup: TokenLookup): CSSProperties {
  return {
    ...componentPreviewStageStyle,
    background: cssToken(lookup, "color.bg.elevation", "#f8fafc"),
    color: cssToken(lookup, "color.text.body", "#171a20"),
  };
}

function buttonPreviewStyleFromTokens(
  selections: Record<string, string>,
  lookup: TokenLookup
): CSSProperties {
  const theme = selections.theme ?? "primary";
  const variant = selections.variant ?? "solid";
  const size = selections.size ?? "sm";
  const textAlign = selections["text-align"] ?? "center";
  const typography = resolveTokenPath(lookup, `component.button.size.${size}.typography`);
  const typographyStyle = isTypographyValue(typography) ? typographyToCss(typography) : {};
  const background = cssToken(
    lookup,
    `component.button.theme.${theme}.${variant}.background`,
    "#7c3aed"
  );
  const color = cssToken(lookup, `component.button.theme.${theme}.${variant}.color`, "#ffffff");
  const borderColor = cssToken(
    lookup,
    `component.button.theme.${theme}.${variant}.border`,
    background
  );
  return {
    ...buttonBasePreviewStyle,
    ...typographyStyle,
    height: cssToken(lookup, `component.button.size.${size}.height`, "42px"),
    padding: `${cssToken(lookup, `component.button.size.${size}.paddingY`, "0px")} ${cssToken(
      lookup,
      `component.button.size.${size}.paddingX`,
      "8px"
    )}`,
    borderRadius: cssToken(lookup, `component.button.size.${size}.radius`, "6px"),
    gap: cssToken(lookup, "component.button.gap", "4px"),
    background,
    color,
    justifyContent:
      textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
    border:
      variant === "text"
        ? "1px solid transparent"
        : `${cssToken(lookup, "component.button.borderWidth", "1px")} solid ${borderColor}`,
    boxShadow: `0 0 0 ${cssToken(lookup, "component.button.focusWidth", "4px")} ${cssToken(
      lookup,
      `component.button.theme.${theme}.outline`,
      "rgba(124, 58, 237, 0.3)"
    )}`,
  };
}

function buttonPreviewTokenReferences(selections: Record<string, string>): Record<string, string> {
  const theme = selections.theme ?? "primary";
  const variant = selections.variant ?? "solid";
  const size = selections.size ?? "sm";
  return {
    background: `component.button.theme.${theme}.${variant}.background`,
    color: `component.button.theme.${theme}.${variant}.color`,
    border: `component.button.theme.${theme}.${variant}.border`,
    height: `component.button.size.${size}.height`,
    typography: `component.button.size.${size}.typography`,
  };
}

function defaultPreviewSelectionsForComponent(
  component: ComponentDocument
): Record<string, string> {
  return Object.fromEntries(
    component.variants.map((variant) => [variant.name, variant.default ?? variant.values[0] ?? ""])
  );
}

function cssToken(lookup: TokenLookup, path: string, fallback: string): string {
  const value = resolveTokenPath(lookup, path);
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function resolveTokenPath(lookup: TokenLookup, path: string, seen = new Set<string>()): unknown {
  if (seen.has(path)) {
    return undefined;
  }
  seen.add(path);
  const token = lookup.get(path);
  return token ? resolveTokenValue(lookup, token.$value, seen) : undefined;
}

function resolveTokenValue(lookup: TokenLookup, value: unknown, seen = new Set<string>()): unknown {
  if (typeof value === "string") {
    const match = value.match(/^\{([^}]+)\}$/);
    if (match?.[1]) {
      return resolveTokenPath(lookup, match[1], seen);
    }
  }
  return value;
}

function isCssColorValue(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (/^#(?:[0-9a-fA-F]{3,8})$/.test(value) || /^rgba?\(/.test(value) || value === "transparent")
  );
}

function isTypographyValue(value: unknown): value is {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string | number;
  letterSpacing: string;
} {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    value !== null &&
    "fontFamily" in value &&
    "fontSize" in value &&
    "lineHeight" in value &&
    "fontWeight" in value &&
    "letterSpacing" in value
  );
}

function typographyToCss(value: {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string | number;
  letterSpacing: string;
}): CSSProperties {
  return {
    fontFamily: `${value.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
    fontSize: value.fontSize,
    lineHeight: value.lineHeight,
    fontWeight: value.fontWeight,
    letterSpacing: value.letterSpacing,
  };
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
  height: "100vh",
  display: "grid",
  gridTemplateRows: "56px minmax(0, 1fr)",
  gridTemplateColumns: "320px minmax(0, 1fr)",
  overflow: "hidden",
  background: "#f4f6f8",
  color: "#171a20",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const topBarStyle: CSSProperties = {
  gridColumn: "1 / -1",
  borderBottom: "1px solid #d8dde6",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "0 16px",
};

const productTitleStyle: CSSProperties = { fontSize: 15 };

const panelTabsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(92px, 1fr))",
  gap: 4,
};

const panelTabStyle: CSSProperties = {
  height: 34,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#4e5968",
};

const panelTabActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
  color: "#153e75",
};

const topBarControlStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto auto auto",
  alignItems: "center",
  gap: 8,
  minWidth: 280,
};

const topBarControlLabelStyle: CSSProperties = {
  color: "#5d6775",
  fontSize: 12,
  fontWeight: 600,
};

const topBarControlValueStyle: CSSProperties = {
  minWidth: 42,
  color: "#3f4a5a",
  fontSize: 12,
  textAlign: "right",
};

const schemeSegmentedStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 54px)",
  gap: 3,
};

const schemeButtonStyle: CSSProperties = {
  height: 28,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#4e5968",
  padding: 0,
  fontSize: 12,
};

const schemeButtonActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
  color: "#153e75",
};

const sidebarStyle: CSSProperties = {
  minHeight: 0,
  borderRight: "1px solid #d8dde6",
  background: "#ffffff",
  padding: 12,
  display: "grid",
  alignContent: "start",
  gap: 12,
  overflowX: "hidden",
  overflowY: "auto",
  overscrollBehavior: "contain",
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

const listStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const tokenGroupStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const tokenGroupHeaderStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  minHeight: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "0 8px",
  background: "#ffffff",
  color: "#4e5968",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
};

const tokenGroupCountStyle: CSSProperties = {
  minWidth: 24,
  height: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  background: "#eef2f7",
  color: "#5d6775",
  fontWeight: 500,
};

const tokenVariationGroupStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  marginLeft: 10,
  paddingLeft: 12,
  borderLeft: "1px solid #dfe5ee",
};

const tokenVariationHeaderStyle: CSSProperties = {
  minHeight: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  margin: "2px 0 2px -6px",
  padding: "0 8px",
  borderRadius: 6,
  background: "#f6f8fb",
  color: "#3f4a5a",
  fontSize: 11,
  fontWeight: 700,
};

const listButtonStyle: CSSProperties = {
  minHeight: 44,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  color: "#171a20",
  padding: "6px 8px",
  display: "grid",
  gap: 2,
  textAlign: "left",
};

const listButtonActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#f3f7ff",
};

const tokenVariationButtonStyle: CSSProperties = {
  minHeight: 34,
  border: "1px solid transparent",
  borderRadius: 6,
  background: "transparent",
  color: "#171a20",
  padding: "6px 8px 6px 12px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  columnGap: 10,
  textAlign: "left",
};

const tokenVariationButtonActiveStyle: CSSProperties = {
  border: "1px solid #8fb3f4",
  background: "#f3f7ff",
};

const tokenVariationNameStyle: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontWeight: 600,
};

const tokenVariationValueStyle: CSSProperties = {
  maxWidth: 112,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "#6b7280",
  fontSize: 11,
};

const summaryListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#4e5968",
  fontSize: 13,
};

const smallButtonStyle: CSSProperties = {
  minHeight: 28,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 8px",
  textAlign: "left",
};

const dangerButtonStyle: CSSProperties = {
  ...smallButtonStyle,
  color: "#b42318",
  border: "1px solid #f0b8b2",
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
  border: "1px solid #8fb3f4",
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

const checkboxFieldStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minHeight: 34,
  fontSize: 12,
  color: "#5d6775",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 34,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  padding: "0 8px",
  fontSize: 13,
  color: "#171a20",
  background: "#ffffff",
};

const selectStyle: CSSProperties = {
  ...inputStyle,
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

const errorBannerStyle: CSSProperties = {
  border: "1px solid #f0b8b2",
  borderRadius: 6,
  padding: 10,
  color: "#b42318",
  background: "#fff4f2",
  fontSize: 13,
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

const legacyGridPanelStyle: CSSProperties = {
  marginTop: 8,
  borderTop: "1px solid #e2e7ef",
  paddingTop: 8,
  display: "grid",
  gap: 4,
  color: "#5d6775",
  fontSize: 12,
};

const workspaceStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  overflow: "auto",
  padding: 16,
};

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  maxWidth: 1280,
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: 16,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  lineHeight: 1.2,
  fontWeight: 700,
};

const sectionMetaStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#5d6775",
  fontSize: 13,
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
  gap: 12,
};

const splitPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const cardStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  background: "#ffffff",
  display: "grid",
  alignContent: "start",
  gap: 12,
  padding: 12,
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const tableStyle: CSSProperties = {
  display: "grid",
  border: "1px solid #e2e7ef",
  borderRadius: 6,
  overflow: "hidden",
};

const tableRowStyle: CSSProperties = {
  minHeight: 36,
  border: 0,
  borderBottom: "1px solid #e2e7ef",
  background: "#ffffff",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 8,
  alignItems: "center",
  padding: "0 8px",
  textAlign: "left",
};

const tableRowActiveStyle: CSSProperties = {
  background: "#f3f7ff",
  color: "#153e75",
};

const editorFormStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const previewPanelStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  background: "#ffffff",
  padding: 12,
  display: "grid",
  gap: 10,
};

const previewControlRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

const compactFieldStyle: CSSProperties = {
  display: "grid",
  gap: 3,
  minWidth: 112,
  fontSize: 11,
  color: "#5d6775",
};

const compactSelectStyle: CSSProperties = {
  height: 30,
  border: "1px solid #d8dde6",
  borderRadius: 6,
  background: "#ffffff",
  padding: "0 8px",
  fontSize: 12,
};

const tokenColorPreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const tokenSwatchStyle: CSSProperties = {
  width: 56,
  height: 56,
  border: "1px solid #d8dde6",
  borderRadius: 8,
};

const tokenTypographyPreviewStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const tokenScalePreviewStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 80,
};

const tokenScaleBoxStyle: CSSProperties = {
  display: "block",
  minWidth: 2,
  maxWidth: 240,
  border: "1px solid #8fb3f4",
  background: "#eaf1ff",
};

const componentPreviewStageStyle: CSSProperties = {
  minHeight: 180,
  border: "1px solid #e2e7ef",
  borderRadius: 8,
  background: "#f8fafc",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: 16,
  padding: 24,
};

const buttonBasePreviewStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 120,
  cursor: "default",
  outline: "none",
};

const genericComponentPreviewStyle: CSSProperties = {
  border: "1px solid #d8dde6",
  borderRadius: 8,
  background: "#ffffff",
  minWidth: 220,
  minHeight: 96,
  padding: 16,
  display: "grid",
  gap: 6,
  justifyItems: "start",
};

const previewMetaGridStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  color: "#5d6775",
  fontSize: 12,
};

const codeStyle: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 12,
};

const codeBlockStyle: CSSProperties = {
  ...codeStyle,
  display: "block",
  whiteSpace: "pre-wrap",
  border: "1px solid #e2e7ef",
  borderRadius: 6,
  background: "#f8fafc",
  padding: 10,
};

const canvasShellStyle: CSSProperties = {
  minWidth: 0,
  overflow: "auto",
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
