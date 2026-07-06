import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import type { Editor } from "tldraw";
import "tldraw/tldraw.css";
import {
  parseComponentDocument,
  validateIconManifest,
  type ComponentDocument,
  type DesignToken,
  type EmbeddedFontAsset,
  type IconManifest,
  type TokenDocument,
} from "@podo/spec";
import { buildIconFontWoff2, sanitizeIconSvg } from "@podo/icon-build";
import {
  collectTokenUsages,
  renameTokenGroupInDocuments,
  rewriteTokenReferences,
  type TokenUsage,
} from "./token-usage.js";
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
  addComponentAnatomyPart,
  addComponentVariantAxis,
  addComponentVariantValue,
  duplicateComponentAnatomyPart,
  moveComponentAnatomyPart,
  removeComponentAnatomyPart,
  removeComponentVariantValue,
  renameComponentVariantAxis,
  renameComponentVariantValue,
  reorderComponentAnatomyPart,
  reparentComponentAnatomyPart,
  renameComponentAnatomyPart,
  serializeEditorTokenValue,
  setComponentAnatomyPartFlags,
  setComponentVariantDefault,
  updateComponentMeta,
  upsertComponentProp,
  upsertComponentSlot,
  upsertComponentCombinationTokenBinding,
  upsertComponentStateTokenBinding,
  upsertComponentTokenBinding,
  upsertComponentVariant,
  upsertComponentVariantValueTokenBinding,
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
  isBaseColorTokenPath,
  TOKEN_REFERENCE_LIST_ID,
  tokenReferenceOptions,
  isTypographyWorkspaceTokenRecord,
  isTypographyWorkspaceType,
  tokenRecordKey,
  type TokenTypeGroup,
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
import { TokenDeleteDialog, normalizeTokenPathLabel } from "./token-editor.js";
import { type EditorCapabilities, type PodoSaveAdapter } from "@podo/edit-core";
import {
  editorShellStyle,
  panelTabActiveStyle,
  panelTabStyle,
  panelTabsStyle,
  persistErrorStyle,
  productTitleStyle,
  schemeButtonActiveStyle,
  localeControlStyle,
  localeSegmentedStyle,
  localeButtonStyle,
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
import { ComponentsPanelWorkspace } from "./components-panel.js";
import { ProjectPanelControls, ProjectPanelWorkspace } from "./project-panel.js";
import { IconsPanelControls, IconsPanelWorkspace, type IconBuildStatus } from "./icons-panel.js";
import {
  addIcon,
  createGroup,
  deleteGroup,
  deleteIcon,
  fromIconManifest,
  iconGlyphsFromModel,
  iconSetHash,
  renameIcon,
  replaceIconSvg,
  setIconGroupMembership,
  toIconManifest,
  updateIconDescription,
  updateIconTags,
  type EditorIconManifest,
} from "./icons-model.js";
import { DEFAULT_ICON_CODEPOINT_FLOOR, DEFAULT_ICON_MANIFEST } from "./default-icons.generated.js";
import { LocaleProvider, translate, type Translate } from "./i18n/context.js";
import {
  detectLocale,
  writeStoredLocale,
  LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "./i18n/locale.js";
import { localizeError } from "./i18n/errors.js";
export {
  fromIconManifest,
  toIconManifest,
  addIcon,
  renameIcon,
  deleteIcon,
  nextFreeCodepoint,
} from "./icons-model.js";
export type { EditorIcon, EditorIconManifest } from "./icons-model.js";

export interface PodoEditorAppProps {
  components: ComponentDocument[];
  tokenDocuments?: TokenDocument[];
  /** Icon set to edit. Defaults to the v1-derived default manifest. */
  iconManifest?: IconManifest;
  /** Fires with the rebuilt, validated manifest whenever the icon font is saved. */
  onIconsChange?: (manifest: IconManifest) => void;
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
  /**
   * Optional controlled selected component id. When provided, the host owns the
   * component selection (e.g. to keep it in the URL) and updates it via
   * `onSelectComponent`. When omitted, the editor manages it internally.
   */
  selectedComponentId?: string;
  /** Fires whenever the selected component in the list changes. */
  onSelectComponent?: (componentId: string) => void;
  /**
   * Optional controlled UI language. When provided, the host owns the locale.
   * When omitted, the editor resolves it from a stored choice, then the browser
   * language, and manages it internally via the in-header toggle.
   */
  locale?: Locale;
  /** Fires whenever the UI language changes (toggle click). */
  onLocaleChange?: (locale: Locale) => void;
}

export type EditorPanel = "tokens" | "icons" | "components" | "canvas" | "build" | "project";

export const editorPanels: EditorPanel[] = [
  "tokens",
  "icons",
  "components",
  "canvas",
  "build",
  "project",
];

/** A token deletion awaiting a replacement choice because it is still in use. */
// One undo/redo step for the design-editing history. Nodes are included so a
// spec-edit undo (e.g. a token rename that rewrote node gap/padding references)
// restores the canvas references paired with it; pure canvas moves never push
// history, so they stay under tldraw's own undo.
interface EditHistorySnapshot {
  components: ComponentDocument[];
  tokenDocuments: TokenDocument[];
  nodes: EditorCanvasState["nodes"];
}

interface TokenDeleteState {
  /** color-variation / color-group, or a single scalar (spacing/radius) token. */
  kind: "color-variation" | "color-group" | "scalar";
  tokenType: DesignToken["$type"];
  /** Display label (the leaf path / the group id). */
  label: string;
  /** Records to remove once references are repointed. */
  records: EditorTokenRecord[];
  /** Logical token paths being removed (e.g. `color.primary.base`). */
  targets: string[];
  usages: TokenUsage[];
  /** Replacement: a leaf path (variation/scalar) or a group id (color set). */
  replacement: string;
}

export function PodoEditorApp({
  components,
  tokenDocuments = [],
  iconManifest = DEFAULT_ICON_MANIFEST,
  onIconsChange,
  initialState,
  viewport = "desktop",
  colorScheme = "light",
  onStateChange,
  onSpecsChange,
  adapter,
  capabilities,
  panel,
  onPanelChange,
  selectedComponentId: selectedComponentIdProp,
  onSelectComponent,
  locale: localeProp,
  onLocaleChange,
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
  // UI language is controlled when `localeProp` is provided (host owns it),
  // otherwise it falls back to a stored/browser-detected internal value.
  const [internalLocale, setInternalLocale] = useState<Locale>(() => localeProp ?? detectLocale());
  const locale = localeProp ?? internalLocale;
  const setLocale = (next: Locale): void => {
    setInternalLocale(next);
    writeStoredLocale(next);
    onLocaleChange?.(next);
  };
  // PodoEditorApp sits ABOVE its own LocaleProvider, so it cannot read the
  // context here — bind `t` directly to the active locale instead.
  const t = useMemo<Translate>(() => (key, params) => translate(locale, key, params), [locale]);
  const [componentSearch, setComponentSearch] = useState("");
  const [tokenDocumentsState, setTokenDocumentsState] = useState(initialTokenDocuments);
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | undefined>();
  const [tokenDraft, setTokenDraft] = useState<EditorTokenDraft>(() => createNewTokenDraft());
  const [typographyView, setTypographyView] = useState(false);
  const [baseColorView, setBaseColorView] = useState(false);
  const [tokenDraftError, setTokenDraftError] = useState<string | undefined>();
  // Selection is controlled when `selectedComponentIdProp` is provided (host owns
  // URL routing), otherwise it falls back to internal state.
  const [internalSelectedComponentId, setInternalSelectedComponentId] = useState<
    string | undefined
  >(selectedComponentIdProp ?? startingState.components[0]?.id);
  const selectedComponentId = selectedComponentIdProp ?? internalSelectedComponentId;
  const setSelectedComponentId: Dispatch<SetStateAction<string | undefined>> = (action) => {
    const next = typeof action === "function" ? action(selectedComponentId) : action;
    setInternalSelectedComponentId(next);
    if (next) {
      onSelectComponent?.(next);
    }
  };
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
  // Canvas edit ("design") vs interactive preview ("play") mode. Ephemeral view
  // state, like selectedColorScheme — not host-controlled.
  const [canvasMode, setCanvasMode] = useState<"edit" | "preview">("edit");
  const [systemColorScheme, setSystemColorScheme] = useState<"light" | "dark">("light");
  const [exportPreview, setExportPreview] = useState<ComponentSpecExportFile | undefined>();
  const [pageIdDraft, setPageIdDraft] = useState("home");
  const [pagePreview, setPagePreview] = useState<PageDocumentExportFile | undefined>();
  const [pageExportError, setPageExportError] = useState<string | undefined>();
  const [propsDraft, setPropsDraft] = useState("");
  const [propsDraftNodeId, setPropsDraftNodeId] = useState<string | undefined>();
  const [propsDraftError, setPropsDraftError] = useState<string | undefined>();
  const [persistError, setPersistError] = useState<string | undefined>();
  // Pending usage-checked token deletion: a referenced token must be repointed
  // to a replacement before it is removed.
  const [tokenDelete, setTokenDelete] = useState<TokenDeleteState | undefined>(undefined);
  const [iconModel, setIconModel] = useState<EditorIconManifest>(() =>
    fromIconManifest(iconManifest)
  );
  const [selectedIconName, setSelectedIconName] = useState<string | undefined>(
    () => Object.keys(iconModel.icons)[0]
  );
  const [iconSearch, setIconSearch] = useState("");
  const [activeIconGroup, setActiveIconGroup] = useState<string | undefined>();
  const [iconBuildStatus, setIconBuildStatus] = useState<IconBuildStatus>("ready");
  const [iconBuildError, setIconBuildError] = useState<string | undefined>();
  const [iconDraftError, setIconDraftError] = useState<string | undefined>();
  const [iconDrawTarget, setIconDrawTarget] = useState<
    { mode: "new" } | { mode: "edit"; name: string } | undefined
  >();
  const iconModelRef = useRef<EditorIconManifest>(iconModel);
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
  // Icon editing is a host capability; the dev app (no capabilities) enables it.
  const iconEditingEnabled = capabilities ? (capabilities.iconEditing ?? false) : true;
  const availablePanels = useMemo(
    () =>
      editorPanels.filter(
        (item) =>
          (item !== "canvas" || pageDesignEnabled) && (item !== "icons" || iconEditingEnabled)
      ),
    [pageDesignEnabled, iconEditingEnabled]
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
  const basicColorMatrix = useMemo(
    () => createColorComparisonMatrix(baseTokenRecords, { include: "basic" }),
    [baseTokenRecords]
  );
  const baseColorMatrix = useMemo(
    () => createColorComparisonMatrix(baseTokenRecords, { include: "base" }),
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
          type: record.token.$type,
          ...(swatch ? { swatch } : {}),
        };
      }),
    [tokenRecords, previewTokenLookup]
  );
  // Color-only reference options for the color matrix token picker. Only tokens
  // that resolve to a color carry a swatch, which are exactly the references a
  // color value should be allowed to point at.
  const colorTokenPickerOptions = useMemo<TokenPickerOption[]>(() => {
    const colors = tokenPickerOptions.filter((option) => option.swatch !== undefined);
    // Base palette tokens are usable everywhere but are offered AFTER the basic
    // colors when picking a token reference, per the base-color contract.
    const basic = colors.filter((option) => !isBaseColorTokenPath(option.label));
    const base = colors.filter((option) => isBaseColorTokenPath(option.label));
    return [...basic, ...base];
  }, [tokenPickerOptions]);
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
  // Variant SHAPE only (names/values/defaults) — deliberately excludes
  // tokens/valueTokens so appearance edits under a variant scope don't reset the
  // preview selections mid-edit (which silently re-targeted edits to base).
  const selectedComponentVariantsKey = selectedComponentForSpec
    ? JSON.stringify(
        selectedComponentForSpec.variants.map((variant) => [
          variant.name,
          variant.values,
          variant.default ?? null,
        ])
      )
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
    if (selectedComponentForSpec.id !== selectedComponentId) {
      setSelectedComponentId(selectedComponentForSpec.id);
    }
    setComponentMetaDraft(componentMetaDraftFromComponent(selectedComponentForSpec));
    setSelectedPropName(selectedComponentForSpec.props[0]?.name);
    setSelectedVariantName(selectedComponentForSpec.variants[0]?.name);
    setSelectedSlotName(selectedComponentForSpec.slots[0]?.name);
    setComponentDraftError(undefined);
  }, [selectedComponentForSpec?.id]);

  // Full reset when switching components (never leak another component's picks).
  useEffect(() => {
    if (!selectedComponentForSpec) {
      return;
    }
    setComponentPreviewSelections(defaultPreviewSelectionsForComponent(selectedComponentForSpec));
  }, [selectedComponentForSpec?.id]);

  // When the variant SHAPE changes (value added/renamed/removed, axis
  // renamed/deleted), PRUNE stale selections instead of wiping everything —
  // the state pin / preview text / slot picks survive inline variant editing.
  const previousVariantAxesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedComponentForSpec) {
      return;
    }
    const previousAxes = previousVariantAxesRef.current;
    previousVariantAxesRef.current = new Set(
      selectedComponentForSpec.variants.map((variant) => variant.name)
    );
    setComponentPreviewSelections((previous) => {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(previous)) {
        const axis = selectedComponentForSpec.variants.find((variant) => variant.name === key);
        if (axis) {
          if (axis.values.includes(value)) next[key] = value; // value renamed/removed → drop
          continue;
        }
        if (previousAxes.has(key)) continue; // axis renamed/removed → stale key
        next[key] = value; // non-axis keys (state pin, text, slot:*) survive
      }
      return next;
    });
  }, [selectedComponentVariantsKey]);

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
          (error: unknown) => setPersistError(localizeError(error, t, "chrome.error.saveFailed"))
        )
        .finally(() => {
          current.inFlight = false;
          run();
        });
    };
    run();
  };
  // ---- Figma-style undo/redo (Cmd+Z / Shift+Cmd+Z) over spec + token edits ----
  // Snapshot history: every commit first pushes the PREVIOUS {components, token
  // documents}; bursts within 400ms (color-picker drags, arrow scrubbing)
  // coalesce into one undo step. Canvas node moves keep tldraw's own history.
  const tokenDocumentsRef = useRef(tokenDocumentsState);
  tokenDocumentsRef.current = tokenDocumentsState;
  const editHistoryRef = useRef<{
    past: EditHistorySnapshot[];
    future: EditHistorySnapshot[];
    lastPushAt: number;
  }>({ past: [], future: [], lastPushAt: 0 });
  const pushEditHistory = (): void => {
    const history = editHistoryRef.current;
    const now = Date.now();
    if (now - history.lastPushAt < 400 && history.past.length) {
      history.lastPushAt = now;
      history.future = [];
      return;
    }
    history.past.push({
      components: stateRef.current.components,
      tokenDocuments: tokenDocumentsRef.current,
      nodes: stateRef.current.nodes,
    });
    if (history.past.length > 100) history.past.shift();
    history.future = [];
    history.lastPushAt = now;
  };
  // Restores a snapshot and persists only what actually changed.
  const applyEditHistorySnapshot = (snapshot: EditHistorySnapshot): void => {
    const previousComponents = stateRef.current.components;
    const previousTokens = tokenDocumentsRef.current;
    commitState({ ...stateRef.current, components: snapshot.components, nodes: snapshot.nodes });
    setTokenDocumentsState(snapshot.tokenDocuments);
    tokenDocumentsRef.current = snapshot.tokenDocuments;
    onSpecsChange?.({
      components: snapshot.components,
      tokenDocuments: snapshot.tokenDocuments,
    });
    if (adapter?.saveComponent) {
      const saveComponent = adapter.saveComponent.bind(adapter);
      for (const component of snapshot.components) {
        const before = previousComponents.find((item) => item.id === component.id);
        if (!before || JSON.stringify(before) !== JSON.stringify(component)) {
          enqueueHostWrite(`component:${component.id}`, () => saveComponent(component));
        }
      }
    }
    if (
      adapter?.saveTokenDocuments &&
      JSON.stringify(previousTokens) !== JSON.stringify(snapshot.tokenDocuments)
    ) {
      const saveTokenDocuments = adapter.saveTokenDocuments.bind(adapter);
      enqueueHostWrite("tokens", () => saveTokenDocuments(snapshot.tokenDocuments));
    }
  };
  const undoEdit = (): void => {
    const history = editHistoryRef.current;
    const snapshot = history.past.pop();
    if (!snapshot) return;
    history.future.push({
      components: stateRef.current.components,
      tokenDocuments: tokenDocumentsRef.current,
      nodes: stateRef.current.nodes,
    });
    history.lastPushAt = 0; // the next edit after an undo starts a fresh step
    applyEditHistorySnapshot(snapshot);
  };
  const redoEdit = (): void => {
    const history = editHistoryRef.current;
    const snapshot = history.future.pop();
    if (!snapshot) return;
    history.past.push({
      components: stateRef.current.components,
      tokenDocuments: tokenDocumentsRef.current,
      nodes: stateRef.current.nodes,
    });
    history.lastPushAt = 0;
    applyEditHistorySnapshot(snapshot);
  };
  // Latest-closure ref so the once-registered window listener never goes stale.
  const undoRedoRef = useRef({ undo: undoEdit, redo: redoEdit, canvasActive: false });
  undoRedoRef.current = {
    undo: undoEdit,
    redo: redoEdit,
    canvasActive: effectiveActivePanel === "canvas",
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      // Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z or Ctrl+Y redo.
      if (key !== "z" && key !== "y") return;
      // Native text-editing undo stays native; tldraw keeps its own history.
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (undoRedoRef.current.canvasActive) return;
      event.preventDefault();
      if (key === "y" || event.shiftKey) undoRedoRef.current.redo();
      else undoRedoRef.current.undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const commitTokenDocuments = (nextDocuments: TokenDocument[]): void => {
    pushEditHistory();
    setTokenDocumentsState(nextDocuments);
    tokenDocumentsRef.current = nextDocuments;
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
    pushEditHistory();
    const parsed = parseComponentDocument(component);
    // Derive from stateRef (not the render-scoped `state`): rapid event bursts
    // (color drags, arrow scrubbing) can fire before React re-renders, and a
    // stale closure here would clobber the just-committed edit.
    const currentState = stateRef.current;
    const nextComponents = currentState.components.map((item) =>
      item.id === parsed.id ? parsed : item
    );
    // On a slot rename, migrate canvas children from the old slot to the new one
    // BEFORE normalization filters node.slots to the declared set (otherwise the
    // children composed into the old slot would be silently dropped).
    const rename = options?.slotRename;
    const baseNodes =
      rename && rename.from !== rename.to
        ? renameNodeSlot(currentState.nodes, parsed.id, rename.from, rename.to)
        : currentState.nodes;
    const nextState = {
      ...currentState,
      components: nextComponents,
      nodes: baseNodes.map((node) =>
        node.componentId === parsed.id ? normalizeNodeForComponent(node, parsed) : node
      ),
    };
    commitState(nextState);
    onSpecsChange?.({ components: nextComponents, tokenDocuments: tokenDocumentsRef.current });
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
      setTokenDraftError(localizeError(error, t, "chrome.error.colorCounterpart"));
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
      setTokenDraftError(localizeError(error, t, "chrome.error.tokenCreate"));
    }
  };
  const selectTokenType = (type: DesignToken["$type"]): void => {
    setBaseColorView(false);
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
  // "color" and "base color" are separate sidebar entries (both $type "color");
  // the base-color entry switches to a dedicated view of the base palette.
  const selectTokenGroup = (group: TokenTypeGroup): void => {
    if (group.view === "baseColor") {
      setBaseColorView(true);
      setTypographyView(false);
      const firstBase = baseTokenRecords.find(
        (record) => record.token.$type === "color" && isBaseColorTokenPath(record.path)
      );
      setSelectedTokenKey(firstBase ? tokenRecordKey(firstBase) : undefined);
      return;
    }
    selectTokenType(group.type);
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
      setTokenDraftError(localizeError(error, t, "chrome.error.tokenCellValue"));
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
      setTokenDraftError(t("chrome.error.typographyStructure"));
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
    } else if (field === "fontSize" || field === "fontSize.tablet" || field === "fontSize.mobile") {
      // fontSize is responsive: edit the pc base or a breakpoint override.
      const current = nextValue.fontSize;
      const size =
        typeof current === "object" && current !== null
          ? { ...current }
          : { pc: typeof current === "string" ? current : "" };
      const text = valueText.trim();
      if (field === "fontSize") {
        size.pc = valueText;
      } else {
        const breakpoint = field === "fontSize.tablet" ? "tablet" : "mobile";
        if (text) {
          size[breakpoint] = valueText;
        } else {
          delete size[breakpoint];
        }
      }
      nextValue.fontSize = size;
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
      setTokenDraftError(localizeError(error, t, "chrome.error.fontRead"));
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
      setTokenDraftError(localizeError(error, t, "chrome.error.tokenDelete"));
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
      setTokenDraftError(localizeError(error, t, "chrome.error.tokensDelete"));
    }
  };
  // --- token usage-checked deletion / color set CRUD ------------------------
  // Commit a rewrite that may touch token documents, components, and canvas
  // nodes (a color set rename, or a usage-checked deletion that repoints refs —
  // spacing/radius are referenced by node gap/padding, so nodes change too).
  const commitTokenRewrite = (
    nextDocuments: TokenDocument[],
    nextComponents: ComponentDocument[],
    nextNodes?: EditorComponentNode[]
  ): void => {
    pushEditHistory();
    tokenDocumentsRef.current = nextDocuments;
    const previousComponents = stateRef.current.components;
    commitState({
      ...stateRef.current,
      components: nextComponents,
      ...(nextNodes ? { nodes: nextNodes } : {}),
    });
    setTokenDocumentsState(nextDocuments);
    onSpecsChange?.({ components: nextComponents, tokenDocuments: nextDocuments });
    if (adapter?.saveTokenDocuments) {
      const saveTokenDocuments = adapter.saveTokenDocuments.bind(adapter);
      enqueueHostWrite("tokens", () => saveTokenDocuments(nextDocuments));
    }
    if (adapter?.saveComponent) {
      const saveComponent = adapter.saveComponent.bind(adapter);
      for (const component of nextComponents) {
        const previous = previousComponents.find((item) => item.id === component.id);
        if (!previous || JSON.stringify(previous) !== JSON.stringify(component)) {
          enqueueHostWrite(`component:${component.id}`, () => saveComponent(component));
        }
      }
    }
  };
  // Light colors live at `color.*`; their dark counterparts at `dark.color.*`.
  // The matrix groups both under one neutral path, so the CRUD handlers below
  // operate on neutral paths for references and on both physical paths for the
  // actual token records. See createColorComparisonMatrix.
  const neutralColorPath = (path: string): string =>
    path.startsWith("dark.color.") ? path.slice("dark.".length) : path;
  const colorRecordsForGroup = (groupId: string): EditorTokenRecord[] =>
    tokenRecords.filter(
      (record) =>
        record.token.$type === "color" &&
        (record.path === groupId ||
          record.path.startsWith(`${groupId}.`) ||
          record.path === `dark.${groupId}` ||
          record.path.startsWith(`dark.${groupId}.`))
    );
  // Neutral (scheme-stripped, deduped) color leaf paths and group ids — the form
  // used by references and by the replacement picker.
  const colorLeafPaths = (): string[] => [
    ...new Set(
      tokenRecords
        .filter((record) => record.token.$type === "color")
        .map((record) => neutralColorPath(record.path))
    ),
  ];
  const colorGroupIds = (): string[] => [
    ...new Set(
      colorLeafPaths()
        .map((path) => path.slice(0, path.lastIndexOf(".")))
        .filter((id) => id)
    ),
  ];
  // Leaf paths of a flat scalar scale (spacing/radius), used as replacements.
  // Only base scale tokens — component-scoped tokens aren't offered.
  const tokenLeafPaths = (type: DesignToken["$type"]): string[] => [
    ...new Set(baseTokenRecords.filter((record) => record.token.$type === type).map((r) => r.path)),
  ];
  // A delete request: removes immediately if unused, otherwise opens the
  // replacement dialog so references can be repointed first.
  const requestDeleteColorVariation = (records: EditorTokenRecord[]): void => {
    if (!records.length) {
      return;
    }
    const targets = [...new Set(records.map((record) => neutralColorPath(record.path)))];
    const usages = collectTokenUsages({
      targets,
      documents: tokenDocumentsState,
      components: stateRef.current.components,
      excludeOwners: records.map((record) => record.path),
    });
    if (!usages.length) {
      deleteTokenRecords(records);
      return;
    }
    const replacement = colorLeafPaths().find((path) => !targets.includes(path)) ?? "";
    setTokenDelete({
      kind: "color-variation",
      tokenType: "color",
      label: targets[0] ?? "color",
      records,
      targets,
      usages,
      replacement,
    });
  };
  const requestDeleteColorGroup = (groupId: string): void => {
    const records = colorRecordsForGroup(groupId);
    if (!records.length) {
      return;
    }
    const targets = [...new Set(records.map((record) => neutralColorPath(record.path)))];
    const usages = collectTokenUsages({
      targets,
      documents: tokenDocumentsState,
      components: stateRef.current.components,
      excludeOwners: records.map((record) => record.path),
    });
    if (!usages.length) {
      deleteTokenRecords(records);
      return;
    }
    const replacement = colorGroupIds().find((id) => id !== groupId) ?? "";
    setTokenDelete({
      kind: "color-group",
      tokenType: "color",
      label: groupId,
      records,
      targets,
      usages,
      replacement,
    });
  };
  // Spacing/radius (flat scalar) deletion — also scans canvas node gap/padding.
  const requestDeleteScalarToken = (record: EditorTokenRecord): void => {
    const usages = collectTokenUsages({
      targets: [record.path],
      documents: tokenDocumentsState,
      components: stateRef.current.components,
      nodes: stateRef.current.nodes,
      excludeOwners: [record.path],
    });
    if (!usages.length) {
      deleteTokenRecord(record);
      return;
    }
    const replacement =
      tokenLeafPaths(record.token.$type).find((path) => path !== record.path) ?? "";
    setTokenDelete({
      kind: "scalar",
      tokenType: record.token.$type,
      label: record.path,
      records: [record],
      targets: [record.path],
      usages,
      replacement,
    });
  };
  const confirmTokenDelete = (): void => {
    const request = tokenDelete;
    if (!request || !request.replacement) {
      return;
    }
    const mapping = new Map<string, string>();
    if (request.kind === "color-group") {
      const replacementLeaves = colorLeafPaths()
        .filter((path) => path.startsWith(`${request.replacement}.`))
        .map((path) => path.slice(request.replacement.length + 1));
      const replacementVars = new Set(replacementLeaves);
      const fallback = replacementVars.has("base") ? "base" : replacementLeaves[0];
      for (const target of request.targets) {
        const variation = target.slice(target.lastIndexOf(".") + 1);
        const useVar = replacementVars.has(variation) ? variation : fallback;
        mapping.set(target, useVar ? `${request.replacement}.${useVar}` : request.replacement);
      }
    } else {
      for (const target of request.targets) {
        mapping.set(target, request.replacement);
      }
    }
    try {
      const rewritten = rewriteTokenReferences<EditorComponentNode>({
        mapping,
        documents: tokenDocumentsState,
        components: stateRef.current.components,
        nodes: stateRef.current.nodes,
      });
      let nextDocuments = rewritten.documents;
      for (const record of request.records) {
        nextDocuments = deleteTokenFromDocuments(nextDocuments, record.documentIndex, record.path);
      }
      commitTokenRewrite(nextDocuments, rewritten.components, rewritten.nodes);
      if (request.records.some((record) => selectedTokenKey === tokenRecordKey(record))) {
        setSelectedTokenKey(undefined);
      }
      setTokenDraftError(undefined);
      setTokenDelete(undefined);
    } catch (error) {
      setTokenDraftError(localizeError(error, t, "chrome.error.tokenDelete"));
    }
  };
  const renameColorGroup = (groupId: string, rawName: string): void => {
    const newName = rawName.trim();
    const currentName = groupId.slice(groupId.lastIndexOf(".") + 1);
    if (!newName || newName === currentName) {
      return;
    }
    const parent = groupId.slice(0, groupId.lastIndexOf("."));
    const newGroupId = parent ? `${parent}.${newName}` : newName;
    const records = colorRecordsForGroup(groupId);
    if (!records.length) {
      return;
    }
    if (colorGroupIds().includes(newGroupId)) {
      setTokenDraftError(t("chrome.error.colorSetExists", { name: newName }));
      return;
    }
    try {
      // Rename the group key in place in both the light (`color.*`) and dark
      // (`dark.color.*`) documents (preserves matrix order), then repoint the
      // neutral `{color.<old>.x}` references to `{color.<new>.x}`.
      const neutralLeaves = [...new Set(records.map((record) => neutralColorPath(record.path)))];
      const mapping = new Map<string, string>(
        neutralLeaves.map((path) => [path, `${newGroupId}${path.slice(groupId.length)}`])
      );
      let nextDocuments = renameTokenGroupInDocuments({
        documents: tokenDocumentsState,
        fromPath: groupId,
        toPath: newGroupId,
      });
      nextDocuments = renameTokenGroupInDocuments({
        documents: nextDocuments,
        fromPath: `dark.${groupId}`,
        toPath: `dark.${newGroupId}`,
      });
      const rewritten = rewriteTokenReferences({
        mapping,
        documents: nextDocuments,
        components: stateRef.current.components,
      });
      commitTokenRewrite(rewritten.documents, rewritten.components);
      setTokenDraftError(undefined);
    } catch (error) {
      setTokenDraftError(localizeError(error, t, "chrome.error.colorSetRename"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.componentMeta"));
    }
  };
  // Figma-style layer rename: renames an anatomy part + migrates its token keys.
  // Returns success so the panel only moves its selection to a name that exists.
  const renameAnatomyPart = (fromName: string, toName: string): boolean => {
    if (!selectedComponentForSpec) {
      return false;
    }
    try {
      commitComponentSpec(renameComponentAnatomyPart(selectedComponentForSpec, fromName, toName));
      setComponentDraftError(undefined);
      return true;
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.layerName"));
      return false;
    }
  };
  // Figma-style layer tree operations (add child, delete, reorder, nest).
  const runAnatomyEdit = (next: (component: ComponentDocument) => ComponentDocument): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      commitComponentSpec(next(selectedComponentForSpec));
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.layerEdit"));
    }
  };
  const addAnatomyPart = (name: string, parent?: string): void =>
    runAnatomyEdit((component) => addComponentAnatomyPart(component, name, parent));
  const reorderAnatomyPart = (partName: string, beforeName: string | null): void =>
    runAnatomyEdit((component) => reorderComponentAnatomyPart(component, partName, beforeName));
  const reparentAnatomyPart = (partName: string, newParent: string | null): void =>
    runAnatomyEdit((component) => reparentComponentAnatomyPart(component, partName, newParent));
  // Single-commit reparent+reorder for drag-drop (avoids stale-state clobbering).
  const moveAnatomyPart = (
    partName: string,
    newParent: string | null,
    beforeName: string | null
  ): void =>
    runAnatomyEdit((component) =>
      moveComponentAnatomyPart(component, partName, newParent, beforeName)
    );
  // Multi-select bulk ops: ONE derivation + ONE commit across all parts.
  const setAnatomyPartsFlags = (
    partNames: string[],
    flags: { hidden?: boolean; locked?: boolean }
  ) =>
    runAnatomyEdit((component) =>
      partNames.reduce(
        (next, partName) => setComponentAnatomyPartFlags(next, partName, flags),
        component
      )
    );
  const removeAnatomyParts = (partNames: string[]) =>
    runAnatomyEdit((component) =>
      partNames.reduce((next, partName) => removeComponentAnatomyPart(next, partName), component)
    );
  const duplicateAnatomyParts = (partNames: string[]): string[] => {
    if (!selectedComponentForSpec) return [];
    try {
      let next = selectedComponentForSpec;
      const copied: string[] = [];
      for (const partName of partNames) {
        const result = duplicateComponentAnatomyPart(next, partName);
        if (result.component !== next) copied.push(result.copiedName);
        next = result.component;
      }
      if (next === selectedComponentForSpec) return [];
      commitComponentSpec(next);
      setComponentDraftError(undefined);
      return copied;
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.layerEdit"));
      return [];
    }
  };
  // Inline (Figma Properties panel) variant axis/value operations. All commit
  // immediately; errors surface in the shared component draft banner.
  const runVariantEdit = (next: (component: ComponentDocument) => ComponentDocument): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      commitComponentSpec(next(selectedComponentForSpec));
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.variantDraft"));
    }
  };
  const addVariantAxis = (name: string, values: string[]): void =>
    runVariantEdit((component) => addComponentVariantAxis(component, name, values));
  const renameVariantAxis = (fromName: string, toName: string): void =>
    runVariantEdit((component) => renameComponentVariantAxis(component, fromName, toName));
  const removeVariantAxis = (name: string): void =>
    runVariantEdit((component) => deleteComponentVariant(component, name));
  const addVariantValue = (axisName: string, value: string): void =>
    runVariantEdit((component) => addComponentVariantValue(component, axisName, value));
  const renameVariantValue = (axisName: string, fromValue: string, toValue: string): void =>
    runVariantEdit((component) =>
      renameComponentVariantValue(component, axisName, fromValue, toValue)
    );
  const removeVariantValue = (axisName: string, value: string): void =>
    runVariantEdit((component) => removeComponentVariantValue(component, axisName, value));
  const setVariantDefault = (axisName: string, value: string): void =>
    runVariantEdit((component) => setComponentVariantDefault(component, axisName, value));
  // Applies SEVERAL bindings in one derivation + one commit. Sequential calls to
  // the single-binding handlers within one event would all derive from the same
  // stale spec and clobber each other — auto layout add/remove needs this.
  const updateComponentBindingsBatch = (
    scope:
      | { kind: "base" }
      | { kind: "variant"; axis: string; value: string }
      | { kind: "state"; state: string }
      | { kind: "combination"; when: Record<string, string> },
    entries: Array<[key: string, reference: string]>
  ): void => {
    if (!selectedComponentForSpec || !entries.length) {
      return;
    }
    try {
      let next = selectedComponentForSpec;
      for (const [key, reference] of entries) {
        next =
          scope.kind === "base"
            ? upsertComponentTokenBinding(next, key, reference)
            : scope.kind === "variant"
              ? upsertComponentVariantValueTokenBinding(
                  next,
                  scope.axis,
                  scope.value,
                  key,
                  reference
                )
              : scope.kind === "state"
                ? upsertComponentStateTokenBinding(next, scope.state, key, reference)
                : upsertComponentCombinationTokenBinding(next, scope.when, key, reference);
      }
      commitComponentSpec(next);
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.appearanceBinding"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.propDraft"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.propDelete"));
    }
  };
  const saveVariantDraft = (): void => {
    if (!selectedComponentForSpec) {
      return;
    }
    try {
      const nextName = variantDraft.name.trim();
      const isRename = Boolean(selectedVariantName) && selectedVariantName !== nextName;
      // Both the add path (no selection) and a rename can collide with an existing
      // variant. upsertComponentVariant replaces by name, so guard against silently
      // overwriting a different variant.
      if (
        nextName !== selectedVariantName &&
        selectedComponentForSpec.variants.some((variant) => variant.name === nextName)
      ) {
        setComponentDraftError(t("chrome.error.variantExists", { name: nextName }));
        return;
      }
      const baseComponent =
        isRename && selectedVariantName
          ? deleteComponentVariant(selectedComponentForSpec, selectedVariantName)
          : selectedComponentForSpec;
      const nextComponent = upsertComponentVariant(baseComponent, variantDraft);
      commitComponentSpec(nextComponent);
      setSelectedVariantName(variantDraft.name.trim());
      setComponentDraftError(undefined);
    } catch (error) {
      setComponentDraftError(localizeError(error, t, "chrome.error.variantDraft"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.variantDelete"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.slotDraft"));
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
      setComponentDraftError(localizeError(error, t, "chrome.error.slotDelete"));
    }
  };

  const applyIconModel = (model: EditorIconManifest): void => {
    iconModelRef.current = model;
    setIconModel(model);
  };
  const addIconFromSvg = (rawSvg: string, name?: string): void => {
    try {
      // Icons are stored as stroke SVG and only expanded to a fill font at build
      // time, so ingress sanitizes (keeps stroke geometry) rather than flattening.
      const svg = sanitizeIconSvg(rawSvg);
      if (!svg.trim()) {
        throw new Error("The SVG has no drawable geometry.");
      }
      const result = addIcon(iconModelRef.current, {
        name: name && name.trim() ? name : "icon",
        svg,
        floor: DEFAULT_ICON_CODEPOINT_FLOOR,
      });
      applyIconModel(result.model);
      setSelectedIconName(result.name);
      setIconDraftError(undefined);
    } catch (error) {
      setIconDraftError(localizeError(error, t, "chrome.error.svgAdd"));
    }
  };
  const renameSelectedIcon = (to: string): void => {
    if (!selectedIconName) {
      return;
    }
    const result = renameIcon(iconModelRef.current, selectedIconName, to);
    applyIconModel(result.model);
    setSelectedIconName(result.name);
  };
  const replaceSelectedIconSvg = (rawSvg: string): void => {
    if (!selectedIconName) {
      return;
    }
    const name = selectedIconName;
    try {
      const svg = sanitizeIconSvg(rawSvg);
      if (!svg.trim()) {
        throw new Error("The SVG has no drawable geometry.");
      }
      applyIconModel(replaceIconSvg(iconModelRef.current, name, svg));
      setIconDraftError(undefined);
    } catch (error) {
      setIconDraftError(localizeError(error, t, "chrome.error.svgReplace"));
    }
  };
  const updateSelectedIconTags = (tags: string[]): void => {
    if (!selectedIconName) {
      return;
    }
    applyIconModel(updateIconTags(iconModelRef.current, selectedIconName, tags));
  };
  const updateSelectedIconDescription = (description: string): void => {
    if (!selectedIconName) {
      return;
    }
    applyIconModel(updateIconDescription(iconModelRef.current, selectedIconName, description));
  };
  const deleteSelectedIcon = (): void => {
    if (!selectedIconName) {
      return;
    }
    applyIconModel(deleteIcon(iconModelRef.current, selectedIconName));
    setSelectedIconName(undefined);
  };
  const createIconGroup = (label: string): void => {
    const result = createGroup(iconModelRef.current, label);
    applyIconModel(result.model);
    setActiveIconGroup(result.name);
  };
  const deleteIconGroup = (name: string): void => {
    applyIconModel(deleteGroup(iconModelRef.current, name));
  };
  const toggleIconGroupMembership = (group: string, name: string, member: boolean): void => {
    applyIconModel(setIconGroupMembership(iconModelRef.current, group, name, member));
  };
  const openIconDrawNew = (): void => setIconDrawTarget({ mode: "new" });
  const openIconDrawEdit = (name: string): void => setIconDrawTarget({ mode: "edit", name });
  const closeIconDraw = (): void => setIconDrawTarget(undefined);
  const applyIconDraw = (svg: string): void => {
    // The drawing canvas emits the stored icon format directly (24px viewBox,
    // stroke-preserving, geometry-only markup), so no re-normalizing is needed.
    if (iconDrawTarget?.mode === "edit") {
      applyIconModel(replaceIconSvg(iconModelRef.current, iconDrawTarget.name, svg));
      setSelectedIconName(iconDrawTarget.name);
    } else {
      const result = addIcon(iconModelRef.current, {
        name: "icon",
        svg,
        floor: DEFAULT_ICON_CODEPOINT_FLOOR,
      });
      applyIconModel(result.model);
      setSelectedIconName(result.name);
    }
    setIconDrawTarget(undefined);
    setIconDraftError(undefined);
  };
  const saveIconFont = (): void => {
    const model = iconModelRef.current;
    setIconBuildStatus("building");
    void (async () => {
      try {
        const result = await buildIconFontWoff2({
          fontFamily: model.fontFamily,
          glyphs: iconGlyphsFromModel(model),
        });
        const fontAsset: EmbeddedFontAsset = {
          kind: "font",
          source: "embedded",
          family: model.fontFamily,
          fileName: `${model.fontFamily}.woff2`,
          format: "woff2",
          mimeType: "font/woff2",
          dataUrl: result.dataUrl,
        };
        const manifest = toIconManifest(model, fontAsset);
        const issues = validateIconManifest(manifest);
        if (issues.length > 0) {
          throw new Error(issues.map((issue) => issue.message).join("; "));
        }
        const builtHash = manifest.fontBuild?.iconsHash;
        // If the icon set changed while this async build ran, the snapshot font and
        // manifest no longer match the latest edits. Keep the new font as a preview
        // but leave the set marked stale and DON'T persist a behind-by-one manifest;
        // a re-save rebuilds and persists the complete set (font + manifest stay
        // derived from one identical icon set).
        const stillCurrent = iconSetHash(iconModelRef.current) === iconSetHash(model);
        applyIconModel({
          ...iconModelRef.current,
          fontAsset,
          ...(stillCurrent && builtHash ? { builtHash } : {}),
        });
        setIconBuildStatus("ready");
        setIconBuildError(undefined);
        if (stillCurrent) {
          onIconsChange?.(manifest);
          if (adapter?.saveIconManifest) {
            const saveIconManifest = adapter.saveIconManifest.bind(adapter);
            enqueueHostWrite("icons", () => saveIconManifest(manifest));
          }
        }
      } catch (error) {
        setIconBuildStatus("error");
        setIconBuildError(localizeError(error, t, "chrome.error.iconBuildFailed"));
      }
    })();
  };

  return (
    <LocaleProvider locale={locale} setLocale={setLocale}>
      <div
        style={{
          ...editorShellStyle,
          gridTemplateColumns:
            effectiveActivePanel === "components" ? "minmax(0, 1fr)" : "200px minmax(0, 1fr)",
        }}
      >
        <datalist id={TOKEN_REFERENCE_LIST_ID}>
          {tokenReferenceList.map((reference) => (
            <option key={reference} value={reference} />
          ))}
        </datalist>
        {tokenDelete ? (
          <TokenDeleteDialog
            kind={tokenDelete.kind}
            tokenType={tokenDelete.tokenType}
            label={tokenDelete.label}
            usages={tokenDelete.usages}
            options={
              tokenDelete.kind === "color-group"
                ? colorGroupIds().filter((id) => id !== tokenDelete.label)
                : tokenDelete.kind === "color-variation"
                  ? colorLeafPaths().filter((path) => !tokenDelete.targets.includes(path))
                  : tokenLeafPaths(tokenDelete.tokenType).filter(
                      (path) => !tokenDelete.targets.includes(path)
                    )
            }
            replacement={tokenDelete.replacement}
            onChangeReplacement={(value) =>
              setTokenDelete((current) => (current ? { ...current, replacement: value } : current))
            }
            onCancel={() => setTokenDelete(undefined)}
            onConfirm={confirmTokenDelete}
          />
        ) : null}
        <header style={topBarStyle}>
          <strong style={productTitleStyle}>{t("chrome.product")}</strong>
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
                {t(`chrome.panel.${panel}`)}
              </button>
            ))}
          </div>
          {effectiveActivePanel === "canvas" ? (
            <div style={topBarControlStyle}>
              <span style={topBarControlLabelStyle}>{t("chrome.scheme")}</span>
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
                    {t(`chrome.scheme.${scheme}`)}
                  </button>
                ))}
              </div>
              <span style={topBarControlValueStyle}>
                {t(`chrome.scheme.${effectiveColorScheme}`)}
              </span>
            </div>
          ) : null}
          {effectiveActivePanel === "canvas" ? (
            <div style={localeControlStyle}>
              <span style={topBarControlLabelStyle}>{t("chrome.canvasMode")}</span>
              <div style={localeSegmentedStyle}>
                {(["edit", "preview"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={canvasMode === mode}
                    style={{
                      ...localeButtonStyle,
                      textTransform: "capitalize",
                      ...(canvasMode === mode ? schemeButtonActiveStyle : {}),
                    }}
                    onClick={() => setCanvasMode(mode)}
                  >
                    {t(`chrome.canvasMode.${mode}`)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div style={localeControlStyle}>
            <span style={topBarControlLabelStyle}>{t("chrome.language")}</span>
            <div style={localeSegmentedStyle}>
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={locale === loc}
                  style={{
                    ...localeButtonStyle,
                    ...(locale === loc ? schemeButtonActiveStyle : {}),
                  }}
                  onClick={() => setLocale(loc)}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>
          </div>
          {persistError ? (
            <span role="alert" style={persistErrorStyle}>
              {persistError}
            </span>
          ) : null}
        </header>
        {effectiveActivePanel === "components" ? null : (
          <aside style={sidebarStyle}>
            {effectiveActivePanel === "tokens" ? (
              <TokensPanelControls
                tokenGroups={tokenGroups}
                tokenDraft={tokenDraft}
                typographyWorkspaceActive={typographyWorkspaceActive}
                baseColorView={baseColorView}
                onSelectGroup={selectTokenGroup}
              />
            ) : null}
            {effectiveActivePanel === "icons" ? (
              <IconsPanelControls
                model={iconModel}
                selectedIconName={selectedIconName}
                setSelectedIconName={setSelectedIconName}
                activeGroup={activeIconGroup}
                setActiveGroup={setActiveIconGroup}
                buildStatus={iconBuildStatus}
                buildError={iconBuildError}
                createIconGroup={createIconGroup}
                deleteIconGroup={deleteIconGroup}
                saveIconFont={saveIconFont}
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
        )}
        <main
          style={
            effectiveActivePanel === "components"
              ? { ...workspaceStyle, padding: 0, background: "#f5f5f5" }
              : workspaceStyle
          }
        >
          {effectiveActivePanel === "tokens" ? (
            <TokensPanelWorkspace
              tokenRecords={baseTokenRecords}
              tokenDraft={tokenDraft}
              tokenDraftError={tokenDraftError}
              selectedTokenKey={selectedTokenKey}
              setSelectedTokenKey={setSelectedTokenKey}
              typographyWorkspaceActive={typographyWorkspaceActive}
              baseColorView={baseColorView}
              typographyWorkspace={typographyWorkspace}
              tokenMatrix={tokenMatrix}
              basicColorMatrix={basicColorMatrix}
              baseColorMatrix={baseColorMatrix}
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
              requestDeleteColorVariation={requestDeleteColorVariation}
              requestDeleteColorGroup={requestDeleteColorGroup}
              requestDeleteScalarToken={requestDeleteScalarToken}
              renameColorGroup={renameColorGroup}
              toggleFamilyWeight={toggleFamilyWeight}
            />
          ) : null}
          {effectiveActivePanel === "icons" ? (
            <IconsPanelWorkspace
              model={iconModel}
              selectedIconName={selectedIconName}
              setSelectedIconName={setSelectedIconName}
              activeGroup={activeIconGroup}
              setActiveGroup={setActiveIconGroup}
              iconSearch={iconSearch}
              setIconSearch={setIconSearch}
              draftError={iconDraftError}
              addIconFromSvg={addIconFromSvg}
              renameSelectedIcon={renameSelectedIcon}
              replaceSelectedIconSvg={replaceSelectedIconSvg}
              updateSelectedIconTags={updateSelectedIconTags}
              updateSelectedIconDescription={updateSelectedIconDescription}
              deleteSelectedIcon={deleteSelectedIcon}
              toggleIconGroupMembership={toggleIconGroupMembership}
              drawTarget={iconDrawTarget}
              openDrawNew={openIconDrawNew}
              openDrawEdit={openIconDrawEdit}
              applyDraw={applyIconDraw}
              closeDraw={closeIconDraw}
            />
          ) : null}
          {effectiveActivePanel === "components" && selectedComponentForSpec ? (
            <ComponentsPanelWorkspace
              componentSearch={componentSearch}
              setComponentSearch={setComponentSearch}
              filteredComponents={filteredComponents}
              setSelectedComponentId={setSelectedComponentId}
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
              updateComponentBindingsBatch={updateComponentBindingsBatch}
              renameAnatomyPart={renameAnatomyPart}
              addAnatomyPart={addAnatomyPart}
              reorderAnatomyPart={reorderAnatomyPart}
              reparentAnatomyPart={reparentAnatomyPart}
              moveAnatomyPart={moveAnatomyPart}
              duplicateAnatomyParts={duplicateAnatomyParts}
              setAnatomyPartsFlags={setAnatomyPartsFlags}
              removeAnatomyParts={removeAnatomyParts}
              addVariantAxis={addVariantAxis}
              renameVariantAxis={renameVariantAxis}
              removeVariantAxis={removeVariantAxis}
              addVariantValue={addVariantValue}
              renameVariantValue={renameVariantValue}
              removeVariantValue={removeVariantValue}
              setVariantDefault={setVariantDefault}
              tokenPickerOptions={tokenPickerOptions}
              previewTokenLookup={previewTokenLookup}
              iconNames={Object.keys(iconModel.icons)}
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
              lookup={previewTokenLookup}
              previewMode={canvasMode === "preview"}
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
    </LocaleProvider>
  );
}
