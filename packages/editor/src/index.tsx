import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import {
  parseComponentDocument,
  type ComponentDocument,
  type DesignToken,
  type TokenDocument,
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
  parseEditorTokenExtensions,
  parsePropDefaultInput,
  serializeEditorTokenExtensions,
  serializeEditorTokenValue,
  serializePropDefaultInput,
  updateComponentMeta,
  upsertComponentProp,
  upsertComponentVariant,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";
import {
  createEmbeddedFontAssetFromFile,
  inferFontFamilyName,
  inferFontFamilyNameFromDraft,
  removeEmbeddedFontAssetExtension,
  renderFontAttachmentDraftEditor,
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
  createComponentTokenEditorModel,
  createTokenMatrix,
  createTypographyWorkspaceModel,
  TOKEN_REFERENCE_LIST_ID,
  tokenReferenceOptions,
} from "./token-model.js";
export type {
  ComponentTokenEditorModel,
  TokenMatrixModel,
  TypographyWorkspaceModel,
} from "./token-model.js";
import {
  normalizeTokenPathLabel,
  renderComponentTokenEditor,
  renderTokenDraftPreview,
  renderTokenMatrixEditor,
  renderTypographyTokenEditor,
} from "./token-editor.js";
import { type EditorCapabilities, type PodoSaveAdapter } from "@podo/edit-core";
import {
  canvasShellStyle,
  cardHeaderStyle,
  cardStyle,
  checkboxFieldStyle,
  compactFieldStyle,
  compactFormGridStyle,
  compactSelectStyle,
  componentEditModeBarStyle,
  componentEditModeButtonActiveStyle,
  componentEditModeButtonStyle,
  componentListButtonActiveStyle,
  componentListButtonStyle,
  componentListIdStyle,
  componentListNameStyle,
  componentListStyle,
  componentPreviewPanelStyle,
  componentStatRowStyle,
  dangerButtonStyle,
  detailPanelBodyStyle,
  disclosureStyle,
  editorFormStyle,
  editorShellStyle,
  emptyListStyle,
  errorBannerStyle,
  errorTextStyle,
  fieldStyle,
  formGridStyle,
  inputStyle,
  inspectorStyle,
  legacyGridPanelStyle,
  listStyle,
  nestedDisclosureStyle,
  nestedSummaryStyle,
  panelTabActiveStyle,
  panelTabStyle,
  panelTabsStyle,
  persistErrorStyle,
  previewControlRowStyle,
  previewFrameStyle,
  previewPanelStyle,
  productTitleStyle,
  rowStyle,
  schemeButtonActiveStyle,
  schemeButtonStyle,
  schemeSegmentedStyle,
  sectionHeaderStyle,
  sectionMetaStyle,
  sectionStyle,
  sectionTitleStyle,
  segmentedButtonActiveStyle,
  segmentedButtonStyle,
  segmentedStyle,
  selectStyle,
  sidebarStyle,
  sidebarTitleStyle,
  slotRowStyle,
  smallButtonStyle,
  splitPanelStyle,
  summaryListStyle,
  summaryStyle,
  tableCellMetaStyle,
  tableCellTextStyle,
  tableRowActiveStyle,
  tableRowStyle,
  tableStyle,
  textareaStyle,
  tokenColorInputStyle,
  tokenTypeButtonActiveStyle,
  tokenTypeButtonStyle,
  tokenTypeMetaStyle,
  tokenTypeNameStyle,
  tokenValueEditorPlainStyle,
  tokenValueEditorStyle,
  toolbarButtonStyle,
  toolbarStyle,
  topBarControlLabelStyle,
  topBarControlStyle,
  topBarControlValueStyle,
  topBarStyle,
  viewportPanelStyle,
  workspaceStyle,
} from "./styles.js";
import { isHexColorInputValue, isTypographyValue, type TokenLookup } from "./token-lookup.js";
export type { TokenLookup } from "./token-lookup.js";

export const packageName = "@podo/editor";

const PODO_COMPONENT_DRAG_TYPE = "application/x-podo-component";

import {
  defaultPreviewSelectionsForComponent,
  renderComponentPreview,
  renderComponentPreviewMatrix,
} from "./previews.js";
export {
  componentPreviewKind,
  legacyComponentPreviewIds,
  renderComponentPreview,
} from "./previews.js";

import {
  editorColorSchemes,
  editorLegacyGridContract,
  responsiveViewports,
  type EditorColorScheme,
  type ResponsiveViewportName,
} from "./viewport.js";
export { editorColorSchemes, editorLegacyGridContract, responsiveViewports } from "./viewport.js";
export type { EditorColorScheme, ResponsiveViewport, ResponsiveViewportName } from "./viewport.js";

import {
  applyEditorStateToTldraw,
  composeSlot,
  createComponentSpecExportFile,
  createEditorState,
  createPageDocumentExportFile,
  defaultPropsForComponent,
  defaultSlotsForComponent,
  dropComponentOnCanvas,
  editorNodeToTldrawShape,
  parseJsonRecord,
  podoShapeUtils,
  selectResponsivePreview,
  syncEditorStateFromTldraw,
  updateComponentNodeProps,
  type ComponentSpecExportFile,
  type EditorCanvasState,
  type EditorComponentNode,
  type PageDocumentExportFile,
} from "./canvas.js";
export {
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
  podoShapeUtils,
  selectResponsivePreview,
  syncEditorStateFromTldraw,
  updateComponentNodeProps,
} from "./canvas.js";
export type {
  ComponentSpecExportFile,
  EditorCanvasState,
  EditorComponentNode,
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
}

type EditorPanel = "tokens" | "components" | "canvas" | "export";
type ComponentEditMode = "props" | "variants" | "tokens";

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
  adapter,
  capabilities,
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
  const [componentSearch, setComponentSearch] = useState("");
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
  const tokenGroups = useMemo(() => groupTokenRecordsByType(tokenRecords), [tokenRecords]);
  const tokenMatrix = useMemo(
    () => createTokenMatrix(tokenRecords, tokenDraft.type),
    [tokenDraft.type, tokenRecords]
  );
  const typographyWorkspace = useMemo(
    () => createTypographyWorkspaceModel(tokenRecords),
    [tokenRecords]
  );
  const typographyWorkspaceActive = isTypographyWorkspaceType(tokenDraft.type);
  const filteredComponents = useMemo(
    () => filterComponentsForEditor(state.components, componentSearch),
    [componentSearch, state.components]
  );
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
  const selectTokenType = (type: DesignToken["$type"]): void => {
    const firstRecord =
      type === "typography"
        ? tokenRecords.find(isTypographyWorkspaceTokenRecord)
        : tokenRecords.find((record) => record.token.$type === type);
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
  const attachFontAssetToDraft = async (file: File): Promise<void> => {
    try {
      const family = inferFontFamilyNameFromDraft(tokenDraft);
      const asset = await createEmbeddedFontAssetFromFile(file, family);
      const extensions = parseEditorTokenExtensions(tokenDraft.extensionsText);
      setTokenDraft((draft) => ({
        ...draft,
        valueText: family,
        extensionsText: serializeEditorTokenExtensions(
          upsertEmbeddedFontAssetExtension(extensions, asset)
        ),
      }));
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Font file could not be read.");
    }
  };
  const removeFontAssetFromDraft = (): void => {
    try {
      const extensions = parseEditorTokenExtensions(tokenDraft.extensionsText);
      setTokenDraft((draft) => ({
        ...draft,
        extensionsText: serializeEditorTokenExtensions(
          removeEmbeddedFontAssetExtension(extensions)
        ),
      }));
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(error instanceof Error ? error.message : "Font attachment is invalid.");
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
        {persistError ? (
          <span role="alert" style={persistErrorStyle}>
            {persistError}
          </span>
        ) : null}
      </header>
      <aside style={sidebarStyle}>
        {effectiveActivePanel === "tokens" ? (
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
              {tokenGroups.map((group) => {
                const active =
                  group.type === "typography"
                    ? typographyWorkspaceActive
                    : tokenDraft.type === group.type;
                return (
                  <button
                    key={group.type}
                    type="button"
                    style={{
                      ...tokenTypeButtonStyle,
                      ...(active ? tokenTypeButtonActiveStyle : {}),
                    }}
                    onClick={() => selectTokenType(group.type)}
                  >
                    <span style={tokenTypeNameStyle}>{group.label}</span>
                    <small style={tokenTypeMetaStyle}>
                      {group.count} tokens / {group.sections.length} groups
                    </small>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        {effectiveActivePanel === "components" ? (
          <>
            <div style={sidebarTitleStyle}>Components</div>
            <input
              aria-label="Search components"
              placeholder="Search components"
              style={inputStyle}
              value={componentSearch}
              onChange={(event) => setComponentSearch(event.currentTarget.value)}
            />
            <div style={componentListStyle}>
              {filteredComponents.map((component) => (
                <button
                  key={component.id}
                  type="button"
                  title={`${component.name} / ${component.id}`}
                  style={{
                    ...componentListButtonStyle,
                    ...(selectedComponentForSpec?.id === component.id
                      ? componentListButtonActiveStyle
                      : {}),
                  }}
                  onClick={() => setSelectedComponentId(component.id)}
                >
                  <span style={componentListNameStyle}>{component.name}</span>
                  <small style={componentListIdStyle}>{component.id}</small>
                </button>
              ))}
              {filteredComponents.length ? null : (
                <span style={emptyListStyle}>No components match this search.</span>
              )}
            </div>
          </>
        ) : null}
        {effectiveActivePanel === "canvas" ? (
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
        ) : null}
        {effectiveActivePanel === "export" ? (
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
        {effectiveActivePanel === "tokens" ? (
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
            {typographyWorkspaceActive
              ? renderTypographyTokenEditor({
                  model: typographyWorkspace,
                  selectedTokenKey,
                  lookup: previewTokenLookup,
                  onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                  onCommitValue: updateTokenMatrixCell,
                  onCommitTypographyField: updateTypographyTokenField,
                  onAttachFont: attachFontAssetToRecord,
                  onRemoveFontAsset: removeFontAssetFromRecord,
                })
              : renderTokenMatrixEditor({
                  matrix: tokenMatrix,
                  selectedTokenKey,
                  onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                  onCommitValue: updateTokenMatrixCell,
                })}
            {tokenDraftError ? <div style={errorBannerStyle}>{tokenDraftError}</div> : null}
            <details style={disclosureStyle}>
              <summary style={summaryStyle}>Selected token detail</summary>
              <div style={detailPanelBodyStyle}>
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
                    <div
                      style={
                        tokenDraft.type === "color"
                          ? tokenValueEditorStyle
                          : tokenValueEditorPlainStyle
                      }
                    >
                      {tokenDraft.type === "color" ? (
                        <input
                          aria-label="Color value"
                          type="color"
                          style={tokenColorInputStyle}
                          value={
                            isHexColorInputValue(tokenDraft.valueText)
                              ? tokenDraft.valueText
                              : "#000000"
                          }
                          onChange={(event) => {
                            const valueText = event.currentTarget.value;
                            setTokenDraft((draft) => ({ ...draft, valueText }));
                          }}
                        />
                      ) : null}
                      <textarea
                        style={{
                          ...textareaStyle,
                          minHeight: tokenDraft.type === "typography" ? 120 : 72,
                        }}
                        value={tokenDraft.valueText}
                        onChange={(event) => {
                          const valueText = event.currentTarget.value;
                          setTokenDraft((draft) => ({ ...draft, valueText }));
                        }}
                      />
                      {tokenDraft.type === "fontFamily"
                        ? renderFontAttachmentDraftEditor({
                            draft: tokenDraft,
                            onAttach: attachFontAssetToDraft,
                            onRemove: removeFontAssetFromDraft,
                          })
                        : null}
                    </div>
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
                  <details style={{ ...nestedDisclosureStyle, gridColumn: "1 / -1" }}>
                    <summary style={nestedSummaryStyle}>Extensions JSON</summary>
                    <textarea
                      style={{ ...textareaStyle, minHeight: 120, marginTop: 8 }}
                      value={tokenDraft.extensionsText ?? ""}
                      onChange={(event) => {
                        const extensionsText = event.currentTarget.value;
                        setTokenDraft((draft) => ({
                          ...draft,
                          extensionsText,
                        }));
                      }}
                    />
                  </details>
                </div>
                <div style={previewPanelStyle}>
                  <strong>Preview</strong>
                  {renderTokenDraftPreview(tokenDraft, previewTokenLookup)}
                </div>
              </div>
            </details>
            <details style={disclosureStyle}>
              <summary style={summaryStyle}>Document JSON</summary>
              <textarea
                style={{ ...textareaStyle, minHeight: 220 }}
                readOnly
                value={JSON.stringify(tokenDocumentsState, null, 2)}
              />
            </details>
          </section>
        ) : null}
        {effectiveActivePanel === "components" && selectedComponentForSpec ? (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h1 style={sectionTitleStyle}>{selectedComponentForSpec.name}</h1>
                <p style={sectionMetaStyle}>{selectedComponentForSpec.id}.component.json</p>
              </div>
              <div style={componentStatRowStyle}>
                <span>{selectedComponentForSpec.props.length} props</span>
                <span>{selectedComponentForSpec.variants.length} variants</span>
                <span>{selectedComponentForSpec.states.length} states</span>
              </div>
            </div>
            <details style={disclosureStyle}>
              <summary style={summaryStyle}>Details</summary>
              <div style={compactFormGridStyle}>
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
                <div style={rowStyle}>
                  <button type="button" style={smallButtonStyle} onClick={saveComponentMetaDraft}>
                    Save
                  </button>
                </div>
              </div>
            </details>
            <div style={componentPreviewPanelStyle}>
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
                  {selectedComponentForSpec.states.length ? (
                    <label style={compactFieldStyle}>
                      state
                      <select
                        style={compactSelectStyle}
                        value={effectiveComponentPreviewSelections.state ?? "default"}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setComponentPreviewSelections((selections) => ({
                            ...selections,
                            state: value,
                          }));
                        }}
                      >
                        <option value="default">default</option>
                        {selectedComponentForSpec.states.map((stateItem) => (
                          <option key={stateItem.name} value={stateItem.name}>
                            {stateItem.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              </div>
              {renderComponentPreview(
                selectedComponentForSpec,
                effectiveComponentPreviewSelections,
                previewTokenLookup
              )}
              {renderComponentPreviewMatrix({
                component: selectedComponentForSpec,
                selections: effectiveComponentPreviewSelections,
                lookup: previewTokenLookup,
                onSelect: setComponentPreviewSelections,
              })}
            </div>
            <div style={componentEditModeBarStyle}>
              {(["props", "variants", "tokens"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  style={{
                    ...componentEditModeButtonStyle,
                    ...(componentEditMode === mode ? componentEditModeButtonActiveStyle : {}),
                  }}
                  onClick={() => setComponentEditMode(mode)}
                >
                  {mode === "props" ? `Props (${selectedComponentForSpec.props.length})` : null}
                  {mode === "variants"
                    ? `Variants (${selectedComponentForSpec.variants.length})`
                    : null}
                  {mode === "tokens"
                    ? `Tokens (${selectedComponentTokenModel.records.length})`
                    : null}
                </button>
              ))}
            </div>
            {componentEditMode === "props" ? (
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
                      <span style={tableCellTextStyle}>{prop.name}</span>
                      <small style={tableCellMetaStyle}>{prop.type.kind}</small>
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
            ) : null}
            {componentEditMode === "variants" ? (
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
                      <span style={tableCellTextStyle}>{variant.name}</span>
                      <small style={tableCellMetaStyle}>{variant.values.join(", ")}</small>
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
            ) : null}
            {componentEditMode === "tokens"
              ? renderComponentTokenEditor({
                  model: selectedComponentTokenModel,
                  selectedTokenKey,
                  lookup: previewTokenLookup,
                  onSelect: (record) => setSelectedTokenKey(tokenRecordKey(record)),
                  onCommitValue: updateTokenMatrixCell,
                })
              : null}
            {componentDraftError ? <div style={errorBannerStyle}>{componentDraftError}</div> : null}
            <details style={disclosureStyle}>
              <summary style={summaryStyle}>Component JSON</summary>
              <textarea
                style={{ ...textareaStyle, minHeight: 220 }}
                readOnly
                value={JSON.stringify(selectedComponentForSpec, null, 2)}
              />
            </details>
          </section>
        ) : null}
        {effectiveActivePanel === "canvas" ? (
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
        {effectiveActivePanel === "export" ? (
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

function createNewTokenDraft(documentIndex = 0): EditorTokenDraft {
  return {
    documentIndex,
    path: "component.example.value",
    type: "color",
    valueText: "#3366ff",
    description: "",
    extensionsText: "",
  };
}

function tokenDraftFromRecord(record: EditorTokenRecord): EditorTokenDraft {
  return {
    documentIndex: record.documentIndex,
    path: record.path,
    type: record.token.$type,
    valueText: serializeEditorTokenValue(record.token.$value),
    description: record.token.$description ?? "",
    extensionsText: serializeEditorTokenExtensions(record.token.$extensions),
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

export function effectiveEditorColorScheme(
  colorScheme: EditorColorScheme,
  systemColorScheme: "light" | "dark" = "light"
): "light" | "dark" {
  return colorScheme === "auto" ? systemColorScheme : colorScheme;
}

export function filterComponentsForEditor(
  components: ComponentDocument[],
  query: string
): ComponentDocument[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return components;
  }

  return components.filter((component) => {
    const searchableValues = [
      component.id,
      component.name,
      component.category,
      component.status,
      component.description ?? "",
      ...component.anatomy.map((part) => part.name),
      ...component.slots.map((slot) => slot.name),
      ...component.props.map((prop) => prop.name),
      ...component.variants.flatMap((variant) => [variant.name, ...variant.values]),
      ...component.states.map((state) => state.name),
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
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
