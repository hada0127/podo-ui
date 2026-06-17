import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import type { Editor } from "tldraw";
import "tldraw/tldraw.css";
import {
  parseComponentDocument,
  type ComponentDocument,
  type DesignToken,
  type TokenDocument,
} from "@podo/spec";
import {
  createComponentPropType,
  deleteComponentProp,
  deleteComponentSlot,
  deleteComponentVariant,
  deleteTokenFromDocuments,
  flattenTokenDocuments,
  moveTokenInDocuments,
  normalizeEditorTokenDocuments,
  parsePropDefaultInput,
  serializeEditorTokenExtensions,
  serializeEditorTokenValue,
  updateComponentMeta,
  upsertComponentProp,
  upsertComponentSlot,
  upsertComponentVariant,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";
import {
  createEmbeddedFontAssetFromFile,
  getSupportedFontWeightsFromExtensions,
  inferFontFamilyName,
  removeEmbeddedFontAssetExtension,
  setSupportedFontWeightsExtension,
  upsertEmbeddedFontAssetExtension,
} from "./fonts.js";
export {
  createEmbeddedFontAsset,
  fontFormatFromFileName,
  isEmbeddedFontAsset,
  removeEmbeddedFontAssetExtension,
  upsertEmbeddedFontAssetExtension,
} from "./fonts.js";
import {
  createColorComparisonMatrix,
  createComponentTokenEditorModel,
  createTokenMatrix,
  createTypographyWorkspaceModel,
  groupTokenRecordsByType,
  TOKEN_REFERENCE_LIST_ID,
  tokenReferenceOptions,
  isTypographyWorkspaceTokenRecord,
  isTypographyWorkspaceType,
  tokenRecordKey,
  type TypographyTokenField,
} from "./token-model.js";
export {
  colorCounterpartPath,
  createColorComparisonMatrix,
  createComponentTokenEditorModel,
  createTokenMatrix,
  createTypographyWorkspaceModel,
  TOKEN_REFERENCE_LIST_ID,
  tokenReferenceOptions,
} from "./token-model.js";
export type {
  ColorComparisonCell,
  ColorComparisonMatrixModel,
  ColorComparisonRow,
  ComponentTokenEditorModel,
  TokenMatrixModel,
  TypographyWorkspaceModel,
} from "./token-model.js";
import { normalizeTokenPathLabel } from "./token-editor.js";
import { type EditorCapabilities, type PodoSaveAdapter } from "@podo/edit-core";
import {
  editorShellStyle,
  panelTabActiveStyle,
  panelTabStyle,
  panelTabsStyle,
  persistErrorStyle,
  productTitleStyle,
  schemeButtonActiveStyle,
  schemeButtonStyle,
  schemeSegmentedStyle,
  sidebarStyle,
  topBarControlLabelStyle,
  topBarControlStyle,
  topBarControlValueStyle,
  topBarStyle,
  workspaceStyle,
} from "./styles.js";
import { isCssColorValue, isTypographyValue, resolveTokenPath } from "./token-lookup.js";
export { colorToHex, formatColorValue, hsvToRgb, parseColor, rgbToHsv } from "./token-lookup.js";
export type { HsvColor, RgbaColor, TokenLookup } from "./token-lookup.js";
import type { TokenPickerOption } from "./token-picker.js";

export const packageName = "@podo/editor";

import { defaultPreviewSelectionsForComponent } from "./previews.js";
export {
  componentPreviewKind,
  legacyComponentPreviewIds,
  renderComponentPreview,
} from "./previews.js";

import {
  editorColorSchemes,
  responsiveViewports,
  type EditorColorScheme,
  type ResponsiveViewportName,
} from "./viewport.js";
export { editorColorSchemes, editorLegacyGridContract, responsiveViewports } from "./viewport.js";
export type { EditorColorScheme, ResponsiveViewport, ResponsiveViewportName } from "./viewport.js";

import {
  DEFAULT_NODE_LAYOUT,
  PODO_COMPONENT_DRAG_TYPE,
  applyEditorStateToTldraw,
  createComponentNode,
  createCustomComponentDocument,
  createEditorState,
  dropComponentOnCanvas,
  exportComponentSpecFromNode,
  parseJsonRecord,
  renameNodeSlot,
  syncEditorStateFromTldraw,
  updateComponentNodeProps,
  upsertEditorComponent,
  type ComponentSpecExportFile,
  type EditorCanvasState,
  type EditorComponentNode,
  type PageDocumentExportFile,
} from "./canvas.js";
export {
  DEFAULT_AXIS_SIZING,
  DEFAULT_NODE_LAYOUT,
  PODO_COMPONENT_SHAPE_TYPE,
  PodoComponentShapeUtil,
  applyEditorStateToTldraw,
  composeSlot,
  createComponentNode,
  createComponentSpecExportFile,
  createEditorState,
  createPageDocumentExportFile,
  createPageDocumentFromCanvas,
  describeLayoutSpecBoundary,
  dropComponentOnCanvas,
  exportComponentSpecFromNode,
  flexAlignToCss,
  flexJustifyToCss,
  nodeLayout,
  normalizeAxisSizing,
  normalizeEditorNodeLayout,
  podoShapeUtils,
  renameNodeSlot,
  selectResponsivePreview,
  syncEditorStateFromTldraw,
  updateComponentNodeLayout,
  updateComponentNodeProps,
} from "./canvas.js";
export type {
  AxisSizing,
  ComponentSpecExportFile,
  EditorCanvasState,
  EditorComponentNode,
  EditorNodeLayout,
  LayoutSpecDecision,
  PageDocumentExportFile,
  PageExportOptions,
  PodoComponentShape,
  PodoComponentShapeInput,
  PodoComponentShapeProps,
  PodoTldrawStateWriter,
} from "./canvas.js";
export { exportFigmaVariables, githubSyncStrategy, importFigmaVariables } from "./figma.js";
export type {
  FigmaVariable,
  FigmaVariableAlias,
  FigmaVariableCollection,
  FigmaVariableExport,
} from "./figma.js";
import {
  componentMetaDraftFromComponent,
  componentPropDraftFromProp,
  componentSlotDraftFromSlot,
  componentVariantDraftFromVariant,
  createNewComponentPropDraft,
  createNewComponentSlotDraft,
  createNewComponentVariantDraft,
  createNewTokenDraft,
  normalizeNodeForComponent,
  tokenDraftFromRecord,
  type ComponentEditMode,
  type ComponentMetaDraft,
  type ComponentPropDraft,
  type ComponentSlotDraft,
  type ComponentVariantDraft,
} from "./drafts.js";
import {
  createThemedTokenLookup,
  effectiveEditorColorScheme,
  filterComponentsForEditor,
} from "./theming.js";
export {
  createThemedTokenLookup,
  effectiveEditorColorScheme,
  filterComponentsForEditor,
} from "./theming.js";
import { BuildPanelControls, BuildPanelWorkspace } from "./build-panel.js";
import { CanvasPanelControls, CanvasPanelWorkspace } from "./canvas-panel.js";
import { TokensPanelControls, TokensPanelWorkspace } from "./tokens-panel.js";
import { ComponentsPanelControls, ComponentsPanelWorkspace } from "./components-panel.js";
import { ProjectPanelControls, ProjectPanelWorkspace } from "./project-panel.js";

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
  /**
   * Host persistence port. When provided, token/component edits are written
   * through it (repo specs or `.podo` overrides) in addition to the in-memory
   * callbacks. See report.md §5.
   */
  adapter?: PodoSaveAdapter;
  /** Host capability gating; page design (canvas) is installed-project only. */
  capabilities?: EditorCapabilities;
  /**
   * Optional controlled active panel. When provided, the host owns panel
   * navigation (e.g. to sync it with the URL) and must update it via
   * `onPanelChange`. When omitted, the editor manages the panel internally.
   */
  panel?: EditorPanel;
  /** Fires whenever the active panel changes (tab click or capability gating). */
  onPanelChange?: (panel: EditorPanel) => void;
}

export type EditorPanel = "tokens" | "components" | "canvas" | "build" | "project";

export const editorPanels: EditorPanel[] = ["tokens", "components", "canvas", "build", "project"];

export function PodoEditorApp({
  components,
  tokenDocuments = [],
  initialState,
  viewport = "desktop",
  colorScheme = "light",
  onStateChange,
  onSpecsChange,
  adapter,
  capabilities,
  panel,
  onPanelChange,
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
  // The active panel is controlled when `panel` is provided (host owns URL
  // routing), otherwise it falls back to internal state.
  const [internalPanel, setInternalPanel] = useState<EditorPanel>(panel ?? "tokens");
  const activePanel = panel ?? internalPanel;
  const setActivePanel = (next: EditorPanel): void => {
    setInternalPanel(next);
    onPanelChange?.(next);
  };
  const [componentSearch, setComponentSearch] = useState("");
  const [tokenDocumentsState, setTokenDocumentsState] = useState(initialTokenDocuments);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | undefined>();
  const [tokenDraft, setTokenDraft] = useState<EditorTokenDraft>(() => createNewTokenDraft());
  const [typographyView, setTypographyView] = useState(false);
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
  const [selectedSlotName, setSelectedSlotName] = useState<string | undefined>(
    startingState.components[0]?.slots[0]?.name
  );
  const [slotDraft, setSlotDraft] = useState<ComponentSlotDraft>(() =>
    createNewComponentSlotDraft()
  );
  const [componentPreviewSelections, setComponentPreviewSelections] = useState<
    Record<string, string>
  >({});
  const [componentEditMode, setComponentEditMode] = useState<ComponentEditMode>("props");
  const [selectedColorScheme, setSelectedColorScheme] = useState<EditorColorScheme>(colorScheme);
  const [systemColorScheme, setSystemColorScheme] = useState<"light" | "dark">("light");
  const [exportPreview, setExportPreview] = useState<ComponentSpecExportFile | undefined>();
  const [pageIdDraft, setPageIdDraft] = useState("home");
  const [pagePreview, setPagePreview] = useState<PageDocumentExportFile | undefined>();
  const [pageExportError, setPageExportError] = useState<string | undefined>();
  const [propsDraft, setPropsDraft] = useState("");
  const [propsDraftNodeId, setPropsDraftNodeId] = useState<string | undefined>();
  const [propsDraftError, setPropsDraftError] = useState<string | undefined>();
  const [persistError, setPersistError] = useState<string | undefined>();
  const editorRef = useRef<Editor | null>(null);
  const isApplyingStateToTldrawRef = useRef(false);
  const stateRef = useRef(startingState);
  const writeQueuesRef = useRef(
    new Map<string, { inFlight: boolean; pending: (() => Promise<unknown>) | undefined }>()
  );
  const frame = responsiveViewports[state.viewport];
  // Page design (the canvas) is an installed-project capability only. When a
  // host declares capabilities without page design, hide the canvas panel.
  const pageDesignEnabled = capabilities ? capabilities.pageDesign : true;
  const availablePanels = useMemo(
    () => (pageDesignEnabled ? editorPanels : editorPanels.filter((panel) => panel !== "canvas")),
    [pageDesignEnabled]
  );
  // Resolve the panel to render this frame so a now-unavailable panel (e.g. the
  // canvas after page design is revoked) is never rendered, even before the
  // effect below reconciles state.
  const effectiveActivePanel: EditorPanel = availablePanels.includes(activePanel)
    ? activePanel
    : (availablePanels[0] ?? "tokens");
  useEffect(() => {
    if (activePanel !== effectiveActivePanel) {
      setActivePanel(effectiveActivePanel);
    }
  }, [activePanel, effectiveActivePanel]);
  const tokenRecords = useMemo(
    () => flattenTokenDocuments(tokenDocumentsState),
    [tokenDocumentsState]
  );
  const tokenReferenceList = useMemo(() => tokenReferenceOptions(tokenRecords), [tokenRecords]);
  // Component-scoped tokens (component.*) belong to individual components and are
  // edited inside the Components panel. The base token editing page shows only
  // project-wide tokens, so every model that drives it works off this filtered set.
  const baseTokenRecords = useMemo(
    () => tokenRecords.filter((record) => !record.path.startsWith("component.")),
    [tokenRecords]
  );
  const tokenGroups = useMemo(() => groupTokenRecordsByType(baseTokenRecords), [baseTokenRecords]);
  const tokenMatrix = useMemo(
    () => createTokenMatrix(baseTokenRecords, tokenDraft.type),
    [tokenDraft.type, baseTokenRecords]
  );
  const typographyWorkspace = useMemo(
    () => createTypographyWorkspaceModel(baseTokenRecords),
    [baseTokenRecords]
  );
  // The typography workspace stays active for the whole "typography" sidebar
  // group, set when that group is picked — independent of which sub-token
  // (family/weight/size/style) is currently selected, so selecting, editing,
  // adding, or deleting a size never flips to the raw dimension matrix.
  const typographyWorkspaceActive = typographyView;
  const filteredComponents = useMemo(
    () => filterComponentsForEditor(state.components, componentSearch),
    [componentSearch, state.components]
  );
  const effectiveColorScheme = effectiveEditorColorScheme(selectedColorScheme, systemColorScheme);
  // Light and dark lookups are always available so the token color matrix can
  // show both schemes side by side, independent of the (canvas-only) Scheme
  // toggle. previewTokenLookup keeps its existing scheme-driven behavior.
  const lightTokenLookup = useMemo(
    () => createThemedTokenLookup(tokenRecords, "light"),
    [tokenRecords]
  );
  const darkTokenLookup = useMemo(
    () => createThemedTokenLookup(tokenRecords, "dark"),
    [tokenRecords]
  );
  const previewTokenLookup = effectiveColorScheme === "dark" ? darkTokenLookup : lightTokenLookup;
  const colorComparisonMatrix = useMemo(
    () => createColorComparisonMatrix(baseTokenRecords),
    [baseTokenRecords]
  );
  const tokenPickerOptions = useMemo<TokenPickerOption[]>(
    () =>
      tokenRecords.map((record) => {
        const resolved =
          record.token.$type === "color"
            ? resolveTokenPath(previewTokenLookup, record.path)
            : undefined;
        const swatch =
          typeof resolved === "string" && isCssColorValue(resolved) ? resolved : undefined;
        return {
          ref: `{${record.path}}`,
          label: record.path,
          value: serializeEditorTokenValue(record.token.$value),
          ...(swatch ? { swatch } : {}),
        };
      }),
    [tokenRecords, previewTokenLookup]
  );
  // Color-only reference options for the color matrix token picker. Only tokens
  // that resolve to a color carry a swatch, which are exactly the references a
  // color value should be allowed to point at.
  const colorTokenPickerOptions = useMemo<TokenPickerOption[]>(
    () => tokenPickerOptions.filter((option) => option.swatch !== undefined),
    [tokenPickerOptions]
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
  const selectedSlot = selectedComponentForSpec?.slots.find(
    (slot) => slot.name === selectedSlotName
  );
  const selectedTokenRecordKey = selectedToken ? tokenRecordKey(selectedToken) : "";
  const selectedPropKey = selectedProp ? JSON.stringify(selectedProp) : "";
  const selectedVariantKey = selectedVariant ? JSON.stringify(selectedVariant) : "";
  const selectedSlotKey = selectedSlot ? JSON.stringify(selectedSlot) : "";
  const selectedComponentVariantsKey = selectedComponentForSpec
    ? JSON.stringify(selectedComponentForSpec.variants)
    : "";
  const selectedComponentTokenModel = useMemo(
    () =>
      selectedComponentForSpec
        ? createComponentTokenEditorModel(tokenRecords, selectedComponentForSpec.id)
        : createComponentTokenEditorModel(tokenRecords, ""),
    [selectedComponentForSpec?.id, tokenRecords]
  );
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
    setSelectedSlotName(selectedComponentForSpec.slots[0]?.name);
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
    setSlotDraft(
      selectedSlot ? componentSlotDraftFromSlot(selectedSlot) : createNewComponentSlotDraft()
    );
    setComponentDraftError(undefined);
  }, [selectedComponentForSpec?.id, selectedSlotName, selectedSlotKey, selectedSlot]);

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
  // Host writes are serialized per channel and coalesced to the latest payload,
  // so rapid edits (e.g. color onChange) cannot land out of order or let an
  // older full-document write overwrite a newer one. See report.md §9 / §12.
  const enqueueHostWrite = (key: string, task: () => Promise<unknown>): void => {
    const queues = writeQueuesRef.current;
    const entry = queues.get(key) ?? { inFlight: false, pending: undefined };
    entry.pending = task;
    queues.set(key, entry);
    const run = (): void => {
      const current = queues.get(key);
      if (!current || current.inFlight || !current.pending) {
        return;
      }
      const next = current.pending;
      current.pending = undefined;
      current.inFlight = true;
      // Promise.resolve().then(next) so a synchronous throw or a non-thenable
      // return still flows through .finally and never wedges the queue.
      Promise.resolve()
        .then(next)
        .then(
          () => setPersistError(undefined),
          (error: unknown) =>
            setPersistError(error instanceof Error ? error.message : "Save to host failed.")
        )
        .finally(() => {
          current.inFlight = false;
          run();
        });
    };
    run();
  };
  const commitTokenDocuments = (nextDocuments: TokenDocument[]): void => {
    setTokenDocumentsState(nextDocuments);
    onSpecsChange?.({ components: stateRef.current.components, tokenDocuments: nextDocuments });
    if (adapter?.saveTokenDocuments) {
      const saveTokenDocuments = adapter.saveTokenDocuments.bind(adapter);
      enqueueHostWrite("tokens", () => saveTokenDocuments(nextDocuments));
    }
  };
  const commitComponentSpec = (
    component: ComponentDocument,
    options?: { slotRename?: { from: string; to: string } }
  ): void => {
    const parsed = parseComponentDocument(component);
    const nextComponents = state.components.map((item) => (item.id === parsed.id ? parsed : item));
    // On a slot rename, migrate canvas children from the old slot to the new one
    // BEFORE normalization filters node.slots to the declared set (otherwise the
    // children composed into the old slot would be silently dropped).
    const rename = options?.slotRename;
    const baseNodes =
      rename && rename.from !== rename.to
        ? renameNodeSlot(state.nodes, parsed.id, rename.from, rename.to)
        : state.nodes;
    const nextState = {
      ...state,
      components: nextComponents,
      nodes: baseNodes.map((node) =>
        node.componentId === parsed.id ? normalizeNodeForComponent(node, parsed) : node
      ),
    };
    commitState(nextState);
    onSpecsChange?.({ components: nextComponents, tokenDocuments: tokenDocumentsState });
    if (adapter?.saveComponent) {
      const saveComponent = adapter.saveComponent.bind(adapter);
      enqueueHostWrite(`component:${parsed.id}`, () => saveComponent(parsed));
    }
  };
  const placeComponent = (
    component: ComponentDocument,
    position: { x: number; y: number }
  ): void => {
    const nextState = dropComponentOnCanvas(state, component, position);
    commitState(nextState, nextState.nodes.at(-1));
  };
  const createCustomLayout = (): void => {
    let index = state.components.filter((item) => item.category === "layout").length + 1;
    let id = `layout-${index}`;
    while (state.components.some((item) => item.id === id)) {
      index += 1;
      id = `layout-${index}`;
    }
    const component = createCustomComponentDocument({ id, name: `Layout ${index}` });
    const withComponent = upsertEditorComponent(state, component);
    // New layout containers default to a vertical auto-layout frame so the
    // "content" slot stacks its children (matches Figma/pencil frame behavior).
    const node = createComponentNode(
      component,
      {
        x: 80 + withComponent.nodes.length * 28,
        y: 80 + withComponent.nodes.length * 28,
      },
      { layout: { ...DEFAULT_NODE_LAYOUT, mode: "vertical" } }
    );
    commitState(
      { ...withComponent, nodes: [...withComponent.nodes, node], selectedNodeId: node.id },
      node
    );
  };
  const saveNodeAsComponent = (nodeId: string): void => {
    const spec = exportComponentSpecFromNode(state, nodeId);
    const baseId = `${spec.id}-custom`;
    let id = baseId;
    let suffix = 1;
    while (state.components.some((item) => item.id === id)) {
      suffix += 1;
      id = `${baseId}-${suffix}`;
    }
    commitState(upsertEditorComponent(state, { ...spec, id, name: `${spec.name} (custom)` }));
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
  // Create the missing light/dark counterpart for a color token, seeded from
  // the sibling that already exists (same document, same value). Used by the
  // "+ Add light/dark" affordance in the color comparison matrix.
  const createColorCounterpart = (targetPath: string, seedRecord: EditorTokenRecord): void => {
    try {
      const documentIndex = seedRecord.documentIndex;
      const normalizedPath = normalizeTokenPathLabel(targetPath);
      const nextDocuments = moveTokenInDocuments(tokenDocumentsState, {
        documentIndex,
        toDraft: {
          documentIndex,
          path: normalizedPath,
          type: "color",
          valueText: serializeEditorTokenValue(seedRecord.token.$value),
          description: seedRecord.token.$description ?? "",
          extensionsText: serializeEditorTokenExtensions(seedRecord.token.$extensions),
        },
      });
      commitTokenDocuments(nextDocuments);
      setSelectedTokenKey(`${documentIndex}:${normalizedPath}`);
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(
        error instanceof Error ? error.message : "Color counterpart could not be created."
      );
    }
  };
  // Create a new token (used by the Project panel base roles and, later, the
  // typography scale/weight add actions). Adds into the first token document.
  const createTypographyToken = (input: {
    type: DesignToken["$type"];
    path: string;
    valueText: string;
  }): void => {
    try {
      // Co-locate the new token with an existing sibling of the same type so it
      // lands in the right category document (e.g. spacing -> primitive), instead
      // of always falling into document 0. Falls back to doc 0 when none exists.
      const documentIndex =
        baseTokenRecords.find((record) => record.token.$type === input.type)?.documentIndex ??
        tokenRecords[0]?.documentIndex ??
        0;
      const normalizedPath = normalizeTokenPathLabel(input.path);
      const nextDocuments = moveTokenInDocuments(tokenDocumentsState, {
        documentIndex,
        toDraft: {
          documentIndex,
          path: normalizedPath,
          type: input.type,
          valueText: input.valueText,
          description: "",
          extensionsText: "",
        },
      });
      commitTokenDocuments(nextDocuments);
      setSelectedTokenKey(`${documentIndex}:${normalizedPath}`);
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Token could not be created.");
    }
  };
  const selectTokenType = (type: DesignToken["$type"]): void => {
    setTypographyView(isTypographyWorkspaceType(type));
    const firstRecord =
      type === "typography"
        ? baseTokenRecords.find(isTypographyWorkspaceTokenRecord)
        : baseTokenRecords.find((record) => record.token.$type === type);
    if (firstRecord) {
      setSelectedTokenKey(tokenRecordKey(firstRecord));
      return;
    }
    setSelectedTokenKey(undefined);
    setTokenDraft({
      ...createNewTokenDraft(),
      type,
      path: `${type}.example.value`,
    });
  };
  const commitTokenRecordDraft = (
    record: EditorTokenRecord,
    input: { valueText: string; extensionsText?: string }
  ): void => {
    try {
      const nextDocuments = moveTokenInDocuments(tokenDocumentsState, {
        documentIndex: record.documentIndex,
        fromPath: record.path,
        toDraft: {
          documentIndex: record.documentIndex,
          path: record.path,
          type: record.token.$type,
          valueText: input.valueText,
          description: record.token.$description ?? "",
          extensionsText:
            input.extensionsText ?? serializeEditorTokenExtensions(record.token.$extensions),
        },
      });
      commitTokenDocuments(nextDocuments);
      setSelectedTokenKey(tokenRecordKey(record));
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Token cell value is invalid.");
    }
  };
  const updateTokenMatrixCell = (record: EditorTokenRecord, valueText: string): void => {
    commitTokenRecordDraft(record, { valueText });
  };
  const updateTypographyTokenField = (
    record: EditorTokenRecord,
    field: TypographyTokenField,
    valueText: string
  ): void => {
    if (!isTypographyValue(record.token.$value)) {
      setTokenDraftError("Typography token values must be structured before field editing.");
      return;
    }
    const nextValue = { ...record.token.$value };
    if (field === "fontWeight") {
      nextValue.fontWeight = /^-?\d+(?:\.\d+)?$/.test(valueText.trim())
        ? Number(valueText)
        : valueText;
    } else if (field === "paragraphSpacing") {
      if (valueText.trim()) {
        nextValue.paragraphSpacing = valueText;
      } else {
        delete nextValue.paragraphSpacing;
      }
    } else {
      nextValue[field] = valueText;
    }
    commitTokenRecordDraft(record, {
      valueText: JSON.stringify(nextValue, null, 2),
    });
  };
  const attachFontAssetToRecord = async (record: EditorTokenRecord, file: File): Promise<void> => {
    try {
      const family = inferFontFamilyName(record.token.$value, record.path);
      const asset = await createEmbeddedFontAssetFromFile(file, family);
      commitTokenRecordDraft(record, {
        valueText: serializeEditorTokenValue(family),
        extensionsText: serializeEditorTokenExtensions(
          upsertEmbeddedFontAssetExtension(record.token.$extensions, asset)
        ),
      });
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Font file could not be read.");
    }
  };
  const removeFontAssetFromRecord = (record: EditorTokenRecord): void => {
    commitTokenRecordDraft(record, {
      valueText: serializeEditorTokenValue(record.token.$value),
      extensionsText: serializeEditorTokenExtensions(
        removeEmbeddedFontAssetExtension(record.token.$extensions)
      ),
    });
  };
  // Toggle whether a font family supports a given numeric weight, persisting the
  // set on the family token's podo extensions. When the family has no explicit
  // set yet, `defaultWeights` (the currently defined weight tokens) is the start.
  const toggleFamilyWeight = (
    record: EditorTokenRecord,
    weightValue: number,
    defaultWeights: number[]
  ): void => {
    const current =
      getSupportedFontWeightsFromExtensions(record.token.$extensions) ?? defaultWeights;
    const next = current.includes(weightValue)
      ? current.filter((value) => value !== weightValue)
      : [...current, weightValue];
    commitTokenRecordDraft(record, {
      valueText: serializeEditorTokenValue(record.token.$value),
      extensionsText: serializeEditorTokenExtensions(
        setSupportedFontWeightsExtension(record.token.$extensions, next)
      ),
    });
  };
  const deleteTokenRecord = (record: EditorTokenRecord): void => {
    try {
      const nextDocuments = deleteTokenFromDocuments(
        tokenDocumentsState,
        record.documentIndex,
        record.path
      );
      commitTokenDocuments(nextDocuments);
      if (selectedTokenKey === tokenRecordKey(record)) {
        setSelectedTokenKey(undefined);
      }
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Token could not be deleted.");
    }
  };
  // Delete several tokens in one document transform (e.g. a color variation's
  // light + dark pair) so the second delete never runs against stale state.
  const deleteTokenRecords = (records: EditorTokenRecord[]): void => {
    if (!records.length) {
      return;
    }
    try {
      const nextDocuments = records.reduce(
        (documents, record) =>
          deleteTokenFromDocuments(documents, record.documentIndex, record.path),
        tokenDocumentsState
      );
      commitTokenDocuments(nextDocuments);
      if (records.some((record) => selectedTokenKey === tokenRecordKey(record))) {
        setSelectedTokenKey(undefined);
      }
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Tokens could not be deleted.");
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
  const saveSlotDraft = (): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      const name = slotDraft.name.trim();
      const isRename = Boolean(selectedSlotName) && selectedSlotName !== name;
      const baseComponent =
        isRename && selectedSlotName
          ? deleteComponentSlot(selectedComponentForSpec, selectedSlotName)
          : selectedComponentForSpec;
      commitComponentSpec(
        upsertComponentSlot(baseComponent, slotDraft),
        isRename && selectedSlotName
          ? { slotRename: { from: selectedSlotName, to: name } }
          : undefined
      );
      setSelectedSlotName(name);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Slot draft is invalid.");
    }
  };
  const deleteSelectedSlot = (): void => {
    if (!selectedComponentForSpec || !selectedSlotName) {
      return;
    }
    try {
      commitComponentSpec(deleteComponentSlot(selectedComponentForSpec, selectedSlotName));
      setSelectedSlotName(undefined);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(error instanceof Error ? error.message : "Slot could not be deleted.");
    }
  };

  return (
    <div style={editorShellStyle}>
      <datalist id={TOKEN_REFERENCE_LIST_ID}>
        {tokenReferenceList.map((reference) => (
          <option key={reference} value={reference} />
        ))}
      </datalist>
      <header style={topBarStyle}>
        <strong style={productTitleStyle}>Podo Editor</strong>
        <div style={panelTabsStyle}>
          {availablePanels.map((panel) => (
            <button
              key={panel}
              type="button"
              style={{
                ...panelTabStyle,
                ...(effectiveActivePanel === panel ? panelTabActiveStyle : {}),
              }}
              onClick={() => setActivePanel(panel)}
            >
              {panel}
            </button>
          ))}
        </div>
        {effectiveActivePanel === "canvas" ? (
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
        ) : null}
        {persistError ? (
          <span role="alert" style={persistErrorStyle}>
            {persistError}
          </span>
        ) : null}
      </header>
      <aside style={sidebarStyle}>
        {effectiveActivePanel === "tokens" ? (
          <TokensPanelControls
            tokenGroups={tokenGroups}
            tokenDraft={tokenDraft}
            typographyWorkspaceActive={typographyWorkspaceActive}
            selectTokenType={selectTokenType}
          />
        ) : null}
        {effectiveActivePanel === "components" ? (
          <ComponentsPanelControls
            componentSearch={componentSearch}
            setComponentSearch={setComponentSearch}
            filteredComponents={filteredComponents}
            selectedComponentForSpec={selectedComponentForSpec}
            setSelectedComponentId={setSelectedComponentId}
          />
        ) : null}
        {effectiveActivePanel === "canvas" ? (
          <CanvasPanelControls
            state={state}
            frame={frame}
            placeComponent={placeComponent}
            createCustomLayout={createCustomLayout}
            saveNodeAsComponent={saveNodeAsComponent}
            commitState={commitState}
            selectedNode={selectedNode}
            selectedComponent={selectedComponent}
            propsDraftNodeId={propsDraftNodeId}
            propsDraft={propsDraft}
            propsDraftError={propsDraftError}
            commitSelectedPropsDraft={commitSelectedPropsDraft}
            updateSelectedPropsDraft={updateSelectedPropsDraft}
            tokenPickerOptions={tokenPickerOptions}
            exportPreview={exportPreview}
            setExportPreview={setExportPreview}
            pageIdDraft={pageIdDraft}
            setPageIdDraft={setPageIdDraft}
            pagePreview={pagePreview}
            setPagePreview={setPagePreview}
            pageExportError={pageExportError}
            setPageExportError={setPageExportError}
            adapter={adapter}
            enqueueHostWrite={enqueueHostWrite}
          />
        ) : null}
        {effectiveActivePanel === "build" ? (
          <BuildPanelControls tokenRecords={tokenRecords} state={state} />
        ) : null}
        {effectiveActivePanel === "project" ? (
          <ProjectPanelControls typographyWorkspace={typographyWorkspace} />
        ) : null}
      </aside>
      <main style={workspaceStyle}>
        {effectiveActivePanel === "tokens" ? (
          <TokensPanelWorkspace
            tokenRecords={baseTokenRecords}
            tokenDraft={tokenDraft}
            tokenDraftError={tokenDraftError}
            selectedTokenKey={selectedTokenKey}
            setSelectedTokenKey={setSelectedTokenKey}
            typographyWorkspaceActive={typographyWorkspaceActive}
            typographyWorkspace={typographyWorkspace}
            tokenMatrix={tokenMatrix}
            colorComparisonMatrix={colorComparisonMatrix}
            colorTokenPickerOptions={colorTokenPickerOptions}
            previewTokenLookup={previewTokenLookup}
            lightTokenLookup={lightTokenLookup}
            darkTokenLookup={darkTokenLookup}
            updateTokenMatrixCell={updateTokenMatrixCell}
            createColorCounterpart={createColorCounterpart}
            updateTypographyTokenField={updateTypographyTokenField}
            attachFontAssetToRecord={attachFontAssetToRecord}
            removeFontAssetFromRecord={removeFontAssetFromRecord}
            createTypographyToken={createTypographyToken}
            deleteTokenRecord={deleteTokenRecord}
            deleteTokenRecords={deleteTokenRecords}
            toggleFamilyWeight={toggleFamilyWeight}
          />
        ) : null}
        {effectiveActivePanel === "components" && selectedComponentForSpec ? (
          <ComponentsPanelWorkspace
            selectedComponentForSpec={selectedComponentForSpec}
            componentEditMode={componentEditMode}
            setComponentEditMode={setComponentEditMode}
            componentMetaDraft={componentMetaDraft}
            setComponentMetaDraft={setComponentMetaDraft}
            componentDraftError={componentDraftError}
            saveComponentMetaDraft={saveComponentMetaDraft}
            propDraft={propDraft}
            setPropDraft={setPropDraft}
            selectedPropName={selectedPropName}
            setSelectedPropName={setSelectedPropName}
            savePropDraft={savePropDraft}
            deleteSelectedProp={deleteSelectedProp}
            variantDraft={variantDraft}
            setVariantDraft={setVariantDraft}
            selectedVariantName={selectedVariantName}
            setSelectedVariantName={setSelectedVariantName}
            saveVariantDraft={saveVariantDraft}
            deleteSelectedVariant={deleteSelectedVariant}
            slotDraft={slotDraft}
            setSlotDraft={setSlotDraft}
            selectedSlotName={selectedSlotName}
            setSelectedSlotName={setSelectedSlotName}
            saveSlotDraft={saveSlotDraft}
            deleteSelectedSlot={deleteSelectedSlot}
            selectedComponentTokenModel={selectedComponentTokenModel}
            selectedTokenKey={selectedTokenKey}
            setSelectedTokenKey={setSelectedTokenKey}
            updateTokenMatrixCell={updateTokenMatrixCell}
            previewTokenLookup={previewTokenLookup}
            effectiveComponentPreviewSelections={effectiveComponentPreviewSelections}
            setComponentPreviewSelections={setComponentPreviewSelections}
          />
        ) : null}
        {effectiveActivePanel === "canvas" ? (
          <CanvasPanelWorkspace
            state={state}
            frame={frame}
            handleCanvasDrop={handleCanvasDrop}
            editorRef={editorRef}
            syncFromTldraw={syncFromTldraw}
          />
        ) : null}
        {effectiveActivePanel === "build" ? (
          <BuildPanelWorkspace tokenDocumentsState={tokenDocumentsState} state={state} />
        ) : null}
        {effectiveActivePanel === "project" ? (
          <ProjectPanelWorkspace
            typographyWorkspace={typographyWorkspace}
            previewTokenLookup={previewTokenLookup}
            selectedTokenKey={selectedTokenKey}
            setSelectedTokenKey={setSelectedTokenKey}
            updateTokenMatrixCell={updateTokenMatrixCell}
            updateTypographyTokenField={updateTypographyTokenField}
            attachFontAssetToRecord={attachFontAssetToRecord}
            removeFontAssetFromRecord={removeFontAssetFromRecord}
            createTypographyToken={createTypographyToken}
          />
        ) : null}
      </main>
    </div>
  );
}
