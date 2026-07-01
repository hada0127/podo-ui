// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createInMemoryAdapter, type PodoSaveAdapter } from "@podo/edit-core";
import {
  PodoEditorApp,
  TOKEN_REFERENCE_LIST_ID,
  tokenReferenceOptions,
  applyEditorStateToTldraw,
  composeSlot,
  createPageDocumentExportFile,
  createPageDocumentFromCanvas,
  type EditorCanvasState,
  createComponentNode,
  createComponentSpecExportFile,
  colorCounterpartPath,
  colorToHex,
  createColorComparisonMatrix,
  formatColorValue,
  hsvToRgb,
  parseColor,
  rgbToHsv,
  createComponentTokenEditorModel,
  createEmbeddedFontAsset,
  createThemedTokenLookup,
  createEditorState,
  createTokenMatrix,
  createTypographyWorkspaceModel,
  DEFAULT_NODE_LAYOUT,
  normalizeEditorNodeLayout,
  renameNodeSlot,
  updateComponentNodeLayout,
  componentPreviewKind,
  describeLayoutSpecBoundary,
  dropComponentOnCanvas,
  editorLegacyGridContract,
  effectiveEditorColorScheme,
  editorColorSchemes,
  exportComponentSpecFromNode,
  exportFigmaVariables,
  filterComponentsForEditor,
  githubSyncStrategy,
  importFigmaVariables,
  fontFormatFromFileName,
  isEmbeddedFontAsset,
  legacyComponentPreviewIds,
  responsiveViewports,
  renderComponentPreview,
  selectResponsivePreview,
  syncEditorStateFromTldraw,
  updateComponentNodeProps,
  upsertEmbeddedFontAssetExtension,
  type FigmaVariableCollection,
  type PodoComponentShapeInput,
  type PodoTldrawStateWriter,
} from "./index.js";
import {
  createTokenFromDraft,
  createComponentPropType,
  createEmptyTokenDocument,
  deleteComponentProp,
  deleteComponentVariant,
  deleteTokenFromDocuments,
  flattenTokenDocuments,
  moveTokenInDocuments,
  parsePropDefaultInput,
  upsertComponentProp,
  upsertComponentVariant,
} from "./spec-editing.js";
import { legacyComponents, legacyTokenDocuments } from "./legacy-fixtures.js";
import {
  parseIconManifest,
  validateIconManifest,
  PODO_SCHEMA_VERSION,
  type ComponentDocument,
  type IconManifest,
} from "@podo/spec";
import { legacyGridContract } from "@podo/tokens";

describe("@podo/editor", () => {
  afterEach(() => {
    cleanup();
  });

  it("creates an editor state, drops components, edits props, and composes slots", () => {
    const state = createEditorState({ components: [gnbComponent, buttonComponent] });
    const withParent = dropComponentOnCanvas(state, gnbComponent, { x: 40, y: 80 });
    const withChild = dropComponentOnCanvas(withParent, buttonComponent, { x: 120, y: 160 });
    const edited = updateComponentNodeProps(withChild, withChild.nodes[1]?.id ?? "", {
      disabled: true,
      tone: "solid",
    });
    const composed = composeSlot(
      edited,
      edited.nodes[0]?.id ?? "",
      "primary",
      edited.nodes[1]?.id ?? ""
    );

    expect(composed.nodes).toHaveLength(2);
    expect(composed.nodes[0]?.slots.primary).toEqual([composed.nodes[1]?.id]);
    expect(composed.nodes[1]?.props).toMatchObject({ disabled: true, tone: "solid" });
    expect(updateComponentNodeProps(edited, edited.nodes[1]?.id ?? "", {}).nodes[1]?.props).toEqual(
      {}
    );
    expect(() =>
      composeSlot(composed, composed.nodes[1]?.id ?? "", "children", composed.nodes[0]?.id ?? "")
    ).toThrow(/cycle/);
  });

  it("persists inspector props and slot composition through the tldraw sync loop", () => {
    const shapes = new Map<PodoComponentShapeInput["id"], PodoComponentShapeInput>();
    const writer: PodoTldrawStateWriter = {
      createShape(shape) {
        shapes.set(shape.id, shape);
      },
      updateShapes(nextShapes) {
        for (const shape of nextShapes) {
          const previous = shapes.get(shape.id);
          shapes.set(shape.id, previous ? { ...previous, ...shape, props: shape.props } : shape);
        }
      },
    };

    const initial = createEditorState({ components: [gnbComponent, buttonComponent] });
    const withParent = dropComponentOnCanvas(initial, gnbComponent, { x: 40, y: 80 });
    applyEditorStateToTldraw(writer, initial, withParent, withParent.nodes[0]);

    const withChild = dropComponentOnCanvas(withParent, buttonComponent, { x: 120, y: 160 });
    applyEditorStateToTldraw(writer, withParent, withChild, withChild.nodes[1]);

    const edited = updateComponentNodeProps(withChild, withChild.nodes[1]?.id ?? "", {
      disabled: true,
      tone: "solid",
    });
    applyEditorStateToTldraw(writer, withChild, edited);

    const composed = composeSlot(
      edited,
      edited.nodes[0]?.id ?? "",
      "primary",
      edited.nodes[1]?.id ?? ""
    );
    applyEditorStateToTldraw(writer, edited, composed);

    const movedShapes = [...shapes.values()].map((shape) =>
      shape.props.componentId === "button" ? { ...shape, x: shape.x + 24 } : shape
    );
    const selectedShape = movedShapes.find((shape) => shape.props.componentId === "button");
    const fakeEditor = {
      getCurrentPageShapes: () => movedShapes,
      getSelectedShapeIds: () => (selectedShape ? [selectedShape.id] : []),
    } as Parameters<typeof syncEditorStateFromTldraw>[1];
    const synced = syncEditorStateFromTldraw(composed, fakeEditor);
    const syncedParent = synced.nodes.find((node) => node.componentId === "gnb");
    const syncedChild = synced.nodes.find((node) => node.componentId === "button");

    expect(syncedParent?.slots.primary).toEqual([syncedChild?.id]);
    expect(syncedChild?.props).toMatchObject({ disabled: true, tone: "solid" });
    expect(syncedChild?.x).toBe(144);

    const parentOnlyEditor = {
      getCurrentPageShapes: () =>
        movedShapes.filter((shape) => shape.props.componentId !== "button"),
      getSelectedShapeIds: () => [],
    } as Parameters<typeof syncEditorStateFromTldraw>[1];
    const parentOnly = syncEditorStateFromTldraw(composed, parentOnlyEditor);

    expect(parentOnly.nodes).toHaveLength(1);
    expect(parentOnly.nodes[0]?.slots.primary).toEqual([]);
  });

  it("supports responsive preview switching and component spec export", () => {
    const node = createComponentNode(buttonComponent, { x: 20, y: 30 }, { id: "button-node" });
    const state = selectResponsivePreview(
      createEditorState({ components: [buttonComponent], nodes: [node] }),
      "mobile"
    );
    const exported = exportComponentSpecFromNode(state, "button-node");
    const exportFile = createComponentSpecExportFile(state, "button-node");

    expect(state.viewport).toBe("mobile");
    expect(responsiveViewports.mobile.columns).toBe(4);
    expect(editorLegacyGridContract).toEqual(legacyGridContract);
    expect(responsiveViewports.desktop.columns).toBe(legacyGridContract.breakpoints.pc.columns);
    expect(responsiveViewports.tablet.columns).toBe(legacyGridContract.breakpoints.tablet.columns);
    expect(responsiveViewports.mobile.columns).toBe(legacyGridContract.breakpoints.mobile.columns);
    expect(legacyGridContract.fixedColumns).toEqual({ min: 2, max: 6 });
    expect(legacyGridContract.spanColumns).toEqual({ min: 1, max: 12 });
    expect(exported.examples.at(-1)?.target).toBe("web");
    expect(exportFile.path).toBe(".podo/components/editor/button.component.json");
    expect(JSON.parse(exportFile.contents)).toMatchObject({ id: "button", kind: "component" });
    expect(exported.props.some((prop) => prop.name === "disabled")).toBe(true);
    expect(exported.variants.filter((variant) => variant.name === "editor-variant")).toHaveLength(
      0
    );
  });

  it("edits token JSON documents through add, move, update, and delete operations", () => {
    const emptyDocument = createEmptyTokenDocument();
    const withToken = moveTokenInDocuments([emptyDocument], {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "color.brand",
        type: "color",
        valueText: "#3366ff",
        description: "Brand",
      },
    });
    const moved = moveTokenInDocuments(withToken, {
      documentIndex: 0,
      fromPath: "color.brand",
      toDraft: {
        documentIndex: 0,
        path: "semantic.color.action.primary",
        type: "color",
        valueText: "{color.palette.purple.600}",
      },
    });
    const records = flattenTokenDocuments(moved);

    expect(records.map((record) => record.path)).toEqual(["semantic.color.action.primary"]);
    expect(records[0]?.token.$value).toBe("{color.palette.purple.600}");
    expect(() =>
      moveTokenInDocuments(moved, {
        documentIndex: 0,
        toDraft: {
          documentIndex: 0,
          path: "semantic.color.action.invalid",
          type: "color",
          valueText: "not-a-color",
        },
      })
    ).toThrow(/Color tokens/);
    expect(
      flattenTokenDocuments(deleteTokenFromDocuments(moved, 0, "semantic.color.action.primary"))
    ).toHaveLength(0);
  });

  it("edits component props and variants with schema validation", () => {
    const prop = {
      name: "tone",
      type: createComponentPropType("enum", "neutral, danger"),
      required: false,
      default: parsePropDefaultInput("enum", "neutral"),
      description: "Semantic tone.",
    };
    const withProp = upsertComponentProp(buttonComponent, prop);
    const renamed = upsertComponentProp(deleteComponentProp(withProp, "tone"), {
      ...prop,
      name: "intent",
    });
    const withVariant = upsertComponentVariant(renamed, {
      name: "intent",
      valuesText: "neutral, danger",
      defaultValue: "danger",
      tokensText: JSON.stringify({ "root.background": "{component.button.background}" }),
    });

    expect(withProp.props.find((item) => item.name === "tone")?.type).toMatchObject({
      kind: "enum",
      values: ["neutral", "danger"],
    });
    expect(renamed.props.map((item) => item.name)).toContain("intent");
    expect(renamed.props.map((item) => item.name)).not.toContain("tone");
    expect(withVariant.variants.find((variant) => variant.name === "intent")?.default).toBe(
      "danger"
    );
    expect(
      deleteComponentVariant(withVariant, "intent").variants.map((item) => item.name)
    ).not.toContain("intent");
    expect(() => createComponentPropType("enum", "")).toThrow(/at least one value/);
    expect(() => upsertComponentVariant(buttonComponent, { name: "tone", valuesText: "" })).toThrow(
      /at least one value/
    );
  });

  it("loads v1 color, typography, spacing, radius, and button fixtures as editable v2 specs", () => {
    const tokenRecords = flattenTokenDocuments(legacyTokenDocuments);
    const tokenPaths = tokenRecords.map((record) => record.path);
    const tokenByPath = new Map(tokenRecords.map((record) => [record.path, record.token]));
    const button = legacyComponents.find((component) => component.id === "button");
    const buttonThemes = [
      "default",
      "primary",
      "default-deep",
      "info",
      "link",
      "success",
      "warning",
      "danger",
    ];
    const buttonVariants = ["solid", "fill", "border", "text"];

    expect(tokenPaths).toContain("color.primary.base");
    expect(tokenPaths).toContain("color.primary.hover");
    expect(tokenPaths).toContain("spacing.scale.5");
    expect(tokenPaths).toContain("radius.scale.3");
    // Figma v2 Display/Heading/Body type scale (size-only); components bind to body.
    expect(tokenPaths).toContain("typography.display.xlarge");
    expect(tokenPaths.some((path) => path.startsWith("typography.heading"))).toBe(true);
    expect(tokenPaths).toContain("typography.body.medium");
    expect(tokenPaths).toContain("typography.body.medium-bold");
    // Base palette ("베이스 컬러") ships separately from the basic colors.
    expect(tokenPaths).toContain("color.base.red.50");
    expect(tokenPaths).toContain("component.button.theme.primary.solid.background");
    expect(tokenPaths).toContain("component.button.theme.primary.solid.hover.background");
    expect(tokenPaths).toContain("component.button.theme.primary.solid.active.background");
    expect(tokenPaths).toContain("component.button.theme.default.fill.hover.border");
    expect(tokenPaths).toContain("component.button.theme.default-deep.border.active.border");
    expect(tokenPaths).toContain("component.button.disabled.solid.background");
    expect(tokenPaths).toContain("component.button.disabled.border.border");
    expect(tokenPaths).toContain("component.button.loading.opacity");
    expect(tokenPaths).toContain("component.button.size.sm.height");
    expect(tokenByPath.get("component.button.theme.primary.outline")?.$type).toBe("color");
    expect(tokenRecords.some((record) => record.token.$type === "string")).toBe(false);
    expect(tokenByPath.get("component.button.theme.default-deep.fill.active.color")?.$value).toBe(
      "{color.default-deep.pressed}"
    );
    expect(tokenByPath.get("component.button.theme.default-deep.border.active.color")?.$value).toBe(
      "{color.default-deep.pressed}"
    );
    for (const theme of buttonThemes) {
      for (const variant of buttonVariants) {
        expect(tokenPaths).toContain(`component.button.theme.${theme}.${variant}.background`);
        expect(tokenPaths).toContain(`component.button.theme.${theme}.${variant}.color`);
        expect(tokenPaths).toContain(`component.button.theme.${theme}.${variant}.border`);
        expect(tokenPaths).toContain(`component.button.theme.${theme}.${variant}.hover.background`);
        expect(tokenPaths).toContain(
          `component.button.theme.${theme}.${variant}.active.background`
        );
      }
    }
    expect(legacyComponents.map((component) => component.id)).toEqual(legacyComponentIds);
    expect(button?.props.find((prop) => prop.name === "theme")?.type).toMatchObject({
      kind: "enum",
      values: buttonThemes,
    });
    expect(button?.props.find((prop) => prop.name === "theme")?.default).toBe("default");
    expect(button?.variants.find((variant) => variant.name === "alignment")?.values).toEqual([
      "left",
      "center",
      "right",
    ]);
    // Button appearance bindings were repointed from component-local tokens to the
    // GLOBAL design tokens they resolve to (so the design editor offers the real
    // token set). Literals with no global match (e.g. opacity) stay component-local.
    expect(button?.states.find((state) => state.name === "hover")?.tokens).toMatchObject({
      "root.background": "{color.default.hover}",
    });
    expect(button?.states.find((state) => state.name === "disabled")?.tokens).toMatchObject({
      "root.background": "{color.bg.disabled}",
    });
    expect(button?.states.find((state) => state.name === "loading")?.tokens).toMatchObject({
      "root.opacity": "0.72",
    });
    // The v1 button classes drive colors AND size in the single preview; binding
    // root.* here overrode them with !important (froze theme + every size to sm),
    // so the base tokens carry only the size-independent focus outline.
    expect(button?.tokens?.["root.background"]).toBeUndefined();
    expect(button?.tokens?.["root.height"]).toBeUndefined();
    expect(button?.tokens?.["root.radius"]).toBeUndefined();
    expect(button?.tokens).toMatchObject({ "focus.outlineWidth": "4px" });
  });

  it("builds editable token matrices for natural token variation groups", () => {
    const colorMatrix = createTokenMatrix(flattenTokenDocuments(legacyTokenDocuments), "color");
    const primary = colorMatrix.rows.find((row) => row.label === "primary");
    const darkPrimary = colorMatrix.rows.find((row) => row.label === "dark / primary");

    expect(colorMatrix.columns.slice(0, 6)).toEqual([
      "base",
      "hover",
      "pressed",
      "focus",
      "fill",
      "reverse",
    ]);
    expect(primary?.cells.base?.path).toBe("color.primary.base");
    // Basic colors now reference the base palette (primary → base.royal-blue).
    expect(primary?.cells.hover?.token.$value).toBe("{color.base.royal-blue.60}");
    expect(darkPrimary?.cells.hover?.path).toBe("dark.color.primary.hover");
    expect(colorMatrix.rows.some((row) => row.id.startsWith("component.button"))).toBe(false);

    const spacingMatrix = createTokenMatrix(flattenTokenDocuments(legacyTokenDocuments), "spacing");
    expect(spacingMatrix.rows.some((row) => row.label === "scale")).toBe(true);

    const dimensionMatrix = createTokenMatrix(
      flattenTokenDocuments(legacyTokenDocuments),
      "dimension"
    );
    const numberMatrix = createTokenMatrix(flattenTokenDocuments(legacyTokenDocuments), "number");
    const buttonTokenModel = createComponentTokenEditorModel(
      flattenTokenDocuments(legacyTokenDocuments),
      "button"
    );
    expect(dimensionMatrix.rows.some((row) => row.id.startsWith("component.button"))).toBe(false);
    expect(numberMatrix.rows.some((row) => row.id.startsWith("component.button"))).toBe(false);
    expect(buttonTokenModel.records.map((record) => record.path)).toEqual(
      expect.arrayContaining([
        "component.button.borderWidth",
        "component.button.focusWidth",
        "component.button.size.sm.height",
        "component.button.loading.opacity",
      ])
    );
  });

  it("excludes component tokens from the base page and edits spacing as a scale list", () => {
    const { container } = render(
      <PodoEditorApp components={legacyComponents} tokenDocuments={legacyTokenDocuments} />
    );
    const spacingTab = screen
      .getAllByRole("button")
      .find(
        (button) =>
          /^spacing/i.test(button.textContent ?? "") && /groups/.test(button.textContent ?? "")
      );
    expect(spacingTab).toBeTruthy();
    fireEvent.click(spacingTab!);

    // The scale list (not the dense matrix) renders with an add affordance, and a
    // base spacing token is editable inline.
    expect(screen.getByRole("button", { name: "+ New spacing" })).toBeTruthy();
    expect(screen.getByLabelText("spacing.scale.2 value")).toBeTruthy();

    const valueInputs = (): HTMLInputElement[] =>
      Array.from(container.querySelectorAll('input[aria-label$=" value"]'));
    // Component-scoped spacing tokens (paddingX/paddingY) never appear on the base page.
    expect(
      valueInputs().some((input) =>
        (input.getAttribute("aria-label") ?? "").startsWith("component.")
      )
    ).toBe(false);

    // Adding appends a unique spacing.scale.* row; deleting removes it.
    const before = valueInputs().length;
    fireEvent.click(screen.getByRole("button", { name: "+ New spacing" }));
    expect(valueInputs().length).toBe(before + 1);
    cleanup();
  });

  it("toggles a font family's supported weights on and off", () => {
    render(<PodoEditorApp components={legacyComponents} tokenDocuments={legacyTokenDocuments} />);
    const typoTab = screen
      .getAllByRole("button")
      .find(
        (button) =>
          /^typography/i.test(button.textContent ?? "") && /groups/.test(button.textContent ?? "")
      );
    fireEvent.click(typoTab!);

    // A weight that is not in the defined weight set (100/thin) starts off.
    fireEvent.click(screen.getByLabelText(/thin 100 off/i));
    expect(screen.getByLabelText(/thin 100 on/i)).toBeTruthy();

    // A defined weight (700/bold) starts on; toggling removes it from the set.
    fireEvent.click(screen.getByLabelText(/bold 700 on/i));
    expect(screen.getByLabelText(/bold 700 off/i)).toBeTruthy();
    cleanup();
  });

  it("builds typography workspace groups and preserves attached font extensions", () => {
    const records = flattenTokenDocuments(legacyTokenDocuments);
    const workspace = createTypographyWorkspaceModel(records);
    const asset = createEmbeddedFontAsset({
      family: "Podo Sans",
      fileName: "podo-sans.woff2",
      mimeType: "font/woff2",
      dataUrl: "data:font/woff2;base64,AAAA",
    });
    const token = createTokenFromDraft({
      path: "font.family.podo",
      type: "fontFamily",
      valueText: "Podo Sans",
      extensionsText: JSON.stringify(upsertEmbeddedFontAssetExtension(undefined, asset)),
    });

    expect(workspace.families.some((record) => record.path === "font.family.pretendard")).toBe(
      true
    );
    expect(workspace.weights.map((record) => record.path)).toEqual(
      expect.arrayContaining(["font.weight.regular", "font.weight.bold"])
    );
    expect(workspace.sizes.some((record) => record.path.startsWith("font.size."))).toBe(true);
    expect(workspace.styles.some((record) => record.path === "typography.display.xlarge")).toBe(
      true
    );
    expect(fontFormatFromFileName("podo-sans.otf")).toBe("opentype");
    expect(isEmbeddedFontAsset(token.$extensions?.podo?.fontAsset)).toBe(true);
    expect(token.$extensions?.podo?.fontAsset?.fileName).toBe("podo-sans.woff2");
  });

  it("loads every v1 public component fixture as searchable editable specs", () => {
    expect(legacyComponents).toHaveLength(legacyComponentIds.length);
    expect([...legacyComponentPreviewIds]).toEqual(legacyComponentIds);

    for (const component of legacyComponents) {
      expect(component.schemaVersion).toBe(PODO_SCHEMA_VERSION);
      expect(component.kind).toBe("component");
      expect(component.anatomy.length).toBeGreaterThan(0);
      expect(component.targets.web.supported).toBe(true);
      expect(component.targets.react.supported).toBe(true);
      expect(componentPreviewKind(component)).toBe("dedicated");
    }

    expect(
      filterComponentsForEditor(legacyComponents, "toast").map((component) => component.id)
    ).toEqual(["toast"]);
    expect(
      filterComponentsForEditor(legacyComponents, "options").map((component) => component.id)
    ).toEqual(expect.arrayContaining(["checkbox-radio", "select"]));
    expect(
      filterComponentsForEditor(legacyComponents, "utility").map((component) => component.id)
    ).toEqual(["doc-tabs"]);
    expect(
      legacyComponents.find((component) => component.id === "doc-tabs")?.description
    ).toContain("mapped to v2 utility");
    expect(
      legacyComponents.find((component) => component.id === "field")?.props.map((prop) => prop.name)
    ).toEqual(
      expect.arrayContaining(["labelClass", "helper", "helperClass", "validator", "setClassName"])
    );
    expect(
      legacyComponents.find((component) => component.id === "input")?.props.map((prop) => prop.name)
    ).toEqual(
      expect.arrayContaining(["validator", "withIcon", "withRightIcon", "unit", "restProps"])
    );
    expect(
      legacyComponents
        .find((component) => component.id === "textarea")
        ?.props.map((prop) => prop.name)
    ).toContain("restProps");
    expect(
      legacyComponents.find((component) => component.id === "tab")?.props.map((prop) => prop.name)
    ).toContain("onChange");
    expect(
      legacyComponents
        .find((component) => component.id === "tooltip")
        ?.variants.find((variant) => variant.name === "position")?.values
    ).toContain("bottomRight");
  });

  it("renders dedicated UI-shaped previews for legacy components", () => {
    const lookup = createThemedTokenLookup(flattenTokenDocuments(legacyTokenDocuments), "light");

    for (const component of legacyComponents) {
      const { container, unmount } = render(
        renderComponentPreview(component, defaultPreviewSelections(component), lookup)
      );

      expect(container.querySelector('[data-podo-preview-kind="dedicated"]')).not.toBeNull();
      expect(container.textContent).not.toContain(`${component.props.length} props`);
      expect(container.textContent).not.toContain(`${component.variants.length} variants`);
      unmount();
    }

    render(
      renderComponentPreview(
        legacyComponentById("button"),
        { theme: "primary", variant: "solid", size: "sm" },
        lookup
      )
    );
    expect(screen.getByRole("button", { name: "Submit" }).tagName).toBe("BUTTON");
    cleanup();

    // v1 select is a native control with no custom menu; the trigger shows the value.
    render(renderComponentPreview(legacyComponentById("select"), { state: "open" }, lookup));
    expect(screen.getByText("Product team")).not.toBeNull();
    cleanup();

    // Renders the real v1 Input (native <input>); invalid maps to `.danger`.
    const { container: inputContainer } = render(
      renderComponentPreview(legacyComponentById("input"), { state: "invalid" }, lookup)
    );
    const inputEl = inputContainer.querySelector("input");
    expect(inputEl).not.toBeNull();
    expect(inputEl?.classList.contains("danger")).toBe(true);
    cleanup();

    render(renderComponentPreview(legacyComponentById("table"), { display: "table" }, lookup));
    expect(screen.getByRole("table")).not.toBeNull();
    cleanup();

    // v1 `.list` is still a <table>; it only swaps row hover/cursor, not cards.
    render(renderComponentPreview(legacyComponentById("table"), { display: "list" }, lookup));
    expect(screen.getByRole("table")).not.toBeNull();
    expect(screen.getByText("Toast")).not.toBeNull();
    cleanup();

    render(renderComponentPreview(legacyComponentById("toast"), { theme: "success" }, lookup));
    expect(screen.getByText("Changes saved")).not.toBeNull();
  });

  it("projects legacy light, dark, and auto color schemes without warm in the editor preview", () => {
    const tokenRecords = flattenTokenDocuments(legacyTokenDocuments);
    const tokenPaths = tokenRecords.map((record) => record.path);
    const lightLookup = createThemedTokenLookup(tokenRecords, "light");
    const darkLookup = createThemedTokenLookup(tokenRecords, "dark");

    expect(editorColorSchemes).toEqual(["light", "dark", "auto"]);
    expect(effectiveEditorColorScheme("auto", "dark")).toBe("dark");
    expect(effectiveEditorColorScheme("auto", "light")).toBe("light");
    expect(effectiveEditorColorScheme("dark", "light")).toBe("dark");
    expect(tokenPaths).toContain("dark.color.primary.hover");
    expect(tokenPaths.some((path) => path.startsWith("warm."))).toBe(false);
    // Basic colors reference the base palette; light/dark map to base steps.
    expect(lightLookup.get("color.primary.hover")?.$value).toBe("{color.base.royal-blue.60}");
    expect(darkLookup.get("color.primary.hover")?.$value).toBe("{color.base.royal-blue.40}");
    expect(darkLookup.get("color.bg.elevation")?.$value).toBe("{color.base.gray.90}");
    expect(darkLookup.has("dark.color.primary.hover")).toBe(false);
  });

  it("imports and exports Figma variables as token JSON", () => {
    const collection: FigmaVariableCollection = {
      id: "collection-1",
      name: "Podo",
      modes: [
        { modeId: "light", name: "light" },
        { modeId: "dark", name: "dark" },
      ],
      variables: [
        {
          id: "color-brand",
          name: "color/brand",
          resolvedType: "COLOR",
          valuesByMode: {
            light: { r: 0.2, g: 0.4, b: 1 },
            dark: { r: 0.7, g: 0.8, b: 1 },
          },
        },
        {
          id: "spacing-2",
          name: "spacing/scale/2",
          resolvedType: "FLOAT",
          valuesByMode: { light: 8, dark: 8 },
        },
        {
          id: "color-text",
          name: "color/text/default",
          resolvedType: "COLOR",
          valuesByMode: {
            light: { type: "VARIABLE_ALIAS", id: "color-brand" },
            dark: { type: "VARIABLE_ALIAS", id: "color-brand" },
          },
        },
        {
          id: "spacing-gap",
          name: "spacing/gap",
          resolvedType: "FLOAT",
          valuesByMode: {
            light: { type: "VARIABLE_ALIAS", id: "spacing-2" },
            dark: { type: "VARIABLE_ALIAS", id: "spacing-2" },
          },
        },
      ],
    };
    const document = importFigmaVariables(collection);
    const exported = exportFigmaVariables(document);

    expect(document.tokens.color).toBeDefined();
    expect(JSON.stringify(document.tokens)).toContain("#3366ff");
    expect(JSON.stringify(document.tokens)).toContain("{color.brand}");
    expect(JSON.stringify(document.tokens)).toContain("{spacing.scale.2}");
    expect(JSON.stringify(document.tokens)).toContain("8px");
    expect(exported.variables.map((variable) => variable.name)).toContain("color/brand");
    expect(
      exported.variables.find((variable) => variable.name === "color/text/default")?.valuesByMode
    ).toMatchObject({ default: { type: "VARIABLE_ALIAS", id: "podo:color.brand" } });
    expect(
      exported.variables.find((variable) => variable.name === "spacing/scale/2")?.valuesByMode
    ).toMatchObject({ default: 8 });
    expect(
      exported.variables.find((variable) => variable.name === "spacing/gap")?.valuesByMode
    ).toMatchObject({ default: { type: "VARIABLE_ALIAS", id: "podo:spacing.scale.2" } });
  });

  it("rejects Figma variable path collisions instead of overwriting tokens", () => {
    const collection: FigmaVariableCollection = {
      id: "collection-1",
      name: "Podo",
      modes: [{ modeId: "light", name: "light" }],
      variables: [
        {
          id: "color-brand",
          name: "color/brand",
          resolvedType: "COLOR",
          valuesByMode: { light: { r: 0.2, g: 0.4, b: 1 } },
        },
        {
          id: "color-brand-primary",
          name: "color/brand/primary",
          resolvedType: "COLOR",
          valuesByMode: { light: { r: 0.1, g: 0.2, b: 0.8 } },
        },
      ],
    };

    expect(() => importFigmaVariables(collection)).toThrow(/conflicts/);
  });

  it("documents the layout/page boundary and GitHub sync strategy", () => {
    const boundary = describeLayoutSpecBoundary();

    expect(boundary.componentSpecOwns).toContain("props");
    expect(boundary.layoutSpecOwns).toContain("slot composition");
    expect(githubSyncStrategy.decision).toBe("ci-managed-sync");
    expect(githubSyncStrategy.checks).toContain("pnpm check");
  });

  it("pairs light and dark color tokens into one comparison row", () => {
    const records = flattenTokenDocuments(legacyTokenDocuments);
    const matrix = createColorComparisonMatrix(records);
    const primary = matrix.rows.find((row) => row.id === "color.primary");

    expect(primary?.label).toBe("primary");
    expect(primary?.cells.hover?.light?.path).toBe("color.primary.hover");
    expect(primary?.cells.hover?.dark?.path).toBe("dark.color.primary.hover");
    // light and dark collapse into one row (no separate "dark.color.primary" row)
    expect(matrix.rows.some((row) => row.id === "dark.color.primary")).toBe(false);
    // component-scoped color tokens are excluded from the global comparison
    expect(matrix.rows.some((row) => row.id.startsWith("component."))).toBe(false);
  });

  it("validates and coerces editor node auto-layout values", () => {
    expect(
      normalizeEditorNodeLayout({
        mode: "vertical",
        gap: "{spacing.2}",
        align: "center",
        justify: "space-between",
        wrap: true,
      })
    ).toEqual({
      mode: "vertical",
      gap: "{spacing.2}",
      padding: "",
      align: "center",
      justify: "space-between",
      wrap: true,
    });
    // unknown enums fall back to defaults; wrap is forced off when mode is none
    expect(normalizeEditorNodeLayout({ mode: "bogus", align: "weird", wrap: true })).toEqual(
      DEFAULT_NODE_LAYOUT
    );
  });

  it("updates a node's auto-layout through the reducer and selects it", () => {
    const node = createComponentNode(layoutComponent, { x: 0, y: 0 }, { id: "n1" });
    const state = createEditorState({ components: [layoutComponent], nodes: [node] });
    const next = updateComponentNodeLayout(state, "n1", {
      layout: { mode: "horizontal", gap: "{spacing.1}" },
      widthSizing: "fill",
    });

    expect(next.nodes[0]?.layout?.mode).toBe("horizontal");
    expect(next.nodes[0]?.layout?.gap).toBe("{spacing.1}");
    expect(next.nodes[0]?.widthSizing).toBe("fill");
    expect(next.selectedNodeId).toBe("n1");
  });

  it("persists node auto-layout through the tldraw sync loop", () => {
    const shapes = new Map<PodoComponentShapeInput["id"], PodoComponentShapeInput>();
    const writer: PodoTldrawStateWriter = {
      createShape(shape) {
        shapes.set(shape.id, shape);
      },
      updateShapes(nextShapes) {
        for (const shape of nextShapes) {
          shapes.set(shape.id, shape);
        }
      },
    };
    const initial = createEditorState({ components: [layoutComponent] });
    const node = createComponentNode(
      layoutComponent,
      { x: 0, y: 0 },
      {
        id: "stack-node",
        layout: { ...DEFAULT_NODE_LAYOUT, mode: "vertical", gap: "{spacing.2}", align: "center" },
        widthSizing: "fill",
      }
    );
    const dropped = { ...initial, nodes: [node], selectedNodeId: node.id };
    applyEditorStateToTldraw(writer, initial, dropped, node);

    const shapeList = [...shapes.values()];
    const fakeEditor = {
      getCurrentPageShapes: () => shapeList,
      getSelectedShapeIds: () => (shapeList[0] ? [shapeList[0].id] : []),
    } as Parameters<typeof syncEditorStateFromTldraw>[1];
    const synced = syncEditorStateFromTldraw(dropped, fakeEditor);

    expect(synced.nodes[0]?.layout?.mode).toBe("vertical");
    expect(synced.nodes[0]?.layout?.gap).toBe("{spacing.2}");
    expect(synced.nodes[0]?.layout?.align).toBe("center");
    expect(synced.nodes[0]?.widthSizing).toBe("fill");
  });

  it("exports a layout-category auto-layout node as a flex LayoutNode", () => {
    const stack = createComponentNode(
      layoutComponent,
      { x: 0, y: 0 },
      {
        id: "stack",
        slots: { content: ["btn"] },
        layout: {
          ...DEFAULT_NODE_LAYOUT,
          mode: "vertical",
          gap: "{spacing.2}",
          justify: "space-between",
        },
      }
    );
    const child = createComponentNode(buttonComponent, { x: 0, y: 0 }, { id: "btn" });
    const state: EditorCanvasState = {
      ...createEditorState({ components: [layoutComponent, buttonComponent] }),
      nodes: [stack, child],
    };
    const page = createPageDocumentFromCanvas(state, { id: "home", name: "Home" });
    if (page.root.type !== "layout") {
      throw new Error("expected a layout root");
    }
    const stackNode = page.root.children[0];
    if (stackNode?.type !== "layout") {
      throw new Error("expected the stack to export as a layout node");
    }
    expect(stackNode.layout.mode).toBe("flex");
    expect(stackNode.layout.direction).toBe("column");
    expect(stackNode.layout.gap).toBe("{spacing.2}");
    expect(stackNode.layout.justify).toBe("space-between");
    // default align (stretch) is not emitted
    expect(stackNode.layout.align).toBeUndefined();
    expect(stackNode.children[0]?.type).toBe("component-instance");
  });

  it("keeps the page export byte-identical for canvases without auto-layout", () => {
    const placed = dropComponentOnCanvas(
      createEditorState({ components: [buttonComponent] }),
      buttonComponent,
      { x: 0, y: 0 }
    );
    const file = createPageDocumentExportFile(placed, { id: "landing", name: "Landing" });
    if (file.document.root.type !== "layout") {
      throw new Error("expected a layout root");
    }
    // a non-layout, non-auto-layout node still exports under a plain flex root
    expect(file.document.root.layout).toEqual({ mode: "flex" });
    expect(file.document.root.children[0]?.type).toBe("component-instance");
  });

  it("exports the primary variant axis under its real prop name without clobbering other props", () => {
    // A component whose FIRST variant axis is `theme` (not `variant`) and that also
    // has a `variant` prop: the canvas `variant` field carries the theme value and
    // must export under `theme`, never overwriting the real `variant` prop.
    const themed: ComponentDocument = {
      ...buttonComponent,
      props: [{ name: "variant", type: { kind: "string" }, default: "solid" }],
      variants: [{ name: "theme", values: ["default", "primary"], default: "default" }],
    };
    const node = createComponentNode(themed, { x: 0, y: 0 }, { id: "btn", variant: "primary" });
    const state: EditorCanvasState = {
      ...createEditorState({ components: [themed] }),
      nodes: [node],
    };
    const page = createPageDocumentFromCanvas(state, { id: "home", name: "Home" });
    if (page.root.type !== "layout") {
      throw new Error("expected a layout root");
    }
    const instance = page.root.children[0];
    if (instance?.type !== "component-instance") {
      throw new Error("expected a component-instance child");
    }
    expect(instance.props.theme).toBe("primary");
    expect(instance.props.variant).toBe("solid");
  });

  it("derives the light and dark counterpart color paths", () => {
    expect(colorCounterpartPath("color.primary.base", "dark")).toBe("dark.color.primary.base");
    expect(colorCounterpartPath("color.primary.base", "light")).toBe("color.primary.base");
  });

  it("parses and formats colors with alpha for the color picker", () => {
    expect(parseColor("#7c3aed")).toEqual({ r: 124, g: 58, b: 237, a: 1 });
    expect(parseColor("rgba(124, 58, 237, 0.3)")).toEqual({ r: 124, g: 58, b: 237, a: 0.3 });
    expect(parseColor("{color.primary.base}")).toBeUndefined();
    // the native picker shows the opaque hex regardless of alpha
    expect(colorToHex({ r: 124, g: 58, b: 237, a: 0.3 })).toBe("#7c3aed");
    // opaque -> hex; translucent -> rgba(); round-trips a token-style value
    expect(formatColorValue({ r: 124, g: 58, b: 237, a: 1 })).toBe("#7c3aed");
    expect(formatColorValue({ r: 124, g: 58, b: 237, a: 0.3 })).toBe("rgba(124, 58, 237, 0.3)");
  });

  it("round-trips RGB through HSV for the inline color picker", () => {
    expect(hsvToRgb({ h: 0, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb({ h: 120, s: 1, v: 1 })).toEqual({ r: 0, g: 255, b: 0 });
    for (const rgb of [
      { r: 124, g: 58, b: 237 },
      { r: 24, g: 144, b: 255 },
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ]) {
      expect(hsvToRgb(rgbToHsv(rgb))).toEqual(rgb);
    }
  });

  it("migrates canvas slot children when a slot is renamed", () => {
    const nodes = [
      {
        id: "p",
        componentId: "gnb",
        name: "P",
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        props: {},
        slots: { primary: ["c"] },
      },
      {
        id: "c",
        componentId: "button",
        name: "C",
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        props: {},
        slots: {},
      },
    ];
    const migrated = renameNodeSlot(nodes, "gnb", "primary", "main");
    expect(migrated[0]?.slots.main).toEqual(["c"]);
    expect(migrated[0]?.slots.primary).toBeUndefined();
    // a node of a different component keeps its slots untouched
    expect(migrated[1]?.slots).toEqual({});
  });
});

describe("canvas page export", () => {
  it("maps the canvas node graph into a page document (slotted nodes nest)", () => {
    const state = createEditorState({ components: [gnbComponent, buttonComponent] });
    const withParent = dropComponentOnCanvas(state, gnbComponent, { x: 40, y: 80 });
    const withChild = dropComponentOnCanvas(withParent, buttonComponent, { x: 120, y: 160 });
    const composed = composeSlot(
      withChild,
      withChild.nodes[0]?.id ?? "",
      "primary",
      withChild.nodes[1]?.id ?? ""
    );

    const page = createPageDocumentFromCanvas(composed, { id: "home", name: "Home" });
    expect(page.kind).toBe("page");
    expect(page.id).toBe("home");
    if (page.root.type !== "layout") {
      throw new Error("expected a layout root");
    }
    // the button is slotted under gnb, so only gnb is top-level
    expect(page.root.children).toHaveLength(1);
    const gnb = page.root.children[0];
    if (gnb?.type !== "component-instance") {
      throw new Error("expected a component instance");
    }
    expect(gnb.component).toBe("gnb");
    const slotted = gnb.slots.primary?.[0];
    if (slotted?.type !== "component-instance") {
      throw new Error("expected a slotted component instance");
    }
    expect(slotted.component).toBe("button");
  });

  it("builds a .podo/pages export path", () => {
    const state = createEditorState({ components: [buttonComponent] });
    const placed = dropComponentOnCanvas(state, buttonComponent, { x: 0, y: 0 });
    const file = createPageDocumentExportFile(placed, { id: "landing", name: "Landing" });
    expect(file.path).toBe(".podo/pages/landing.page.json");
    expect(file.document.id).toBe("landing");
  });

  it("rejects an invalid page id", () => {
    const state = createEditorState({ components: [buttonComponent] });
    expect(() => createPageDocumentFromCanvas(state, { id: "Not Valid", name: "X" })).toThrow();
  });

  it("keeps a shared slot child under every parent (no silent drop)", () => {
    const state: EditorCanvasState = {
      schemaVersion: PODO_SCHEMA_VERSION,
      viewport: "desktop",
      components: [gnbComponent, buttonComponent],
      nodes: [
        {
          id: "a",
          componentId: "gnb",
          name: "A",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
        {
          id: "c",
          componentId: "gnb",
          name: "C",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
        {
          id: "b",
          componentId: "button",
          name: "B",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: {},
        },
      ],
    };
    const page = createPageDocumentFromCanvas(state, { id: "home", name: "Home" });
    if (page.root.type !== "layout") {
      throw new Error("expected a layout root");
    }
    expect(page.root.children).toHaveLength(2);
    for (const child of page.root.children) {
      if (child.type !== "component-instance") {
        throw new Error("expected a component instance");
      }
      expect(child.slots.primary?.[0]?.type).toBe("component-instance");
    }
  });

  it("throws on a fully slotted slot cycle instead of exporting an empty page", () => {
    const state: EditorCanvasState = {
      schemaVersion: PODO_SCHEMA_VERSION,
      viewport: "desktop",
      components: [gnbComponent],
      nodes: [
        {
          id: "a",
          componentId: "gnb",
          name: "A",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
        {
          id: "b",
          componentId: "gnb",
          name: "B",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["a"] },
        },
      ],
    };
    expect(() => createPageDocumentFromCanvas(state, { id: "home", name: "Home" })).toThrow();
  });

  it("throws on a reachable slot cycle", () => {
    const state: EditorCanvasState = {
      schemaVersion: PODO_SCHEMA_VERSION,
      viewport: "desktop",
      components: [gnbComponent],
      nodes: [
        {
          id: "a",
          componentId: "gnb",
          name: "A",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
        {
          id: "b",
          componentId: "gnb",
          name: "B",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
      ],
    };
    expect(() => createPageDocumentFromCanvas(state, { id: "home", name: "Home" })).toThrow();
  });

  it("throws when a cyclic subgraph is unreachable from a top-level node", () => {
    // `root` is an independent top-level node; a<->b form an all-slotted cycle
    // that must NOT be silently dropped from the exported page.
    const state: EditorCanvasState = {
      schemaVersion: PODO_SCHEMA_VERSION,
      viewport: "desktop",
      components: [gnbComponent],
      nodes: [
        {
          id: "root",
          componentId: "gnb",
          name: "Root",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: {},
        },
        {
          id: "a",
          componentId: "gnb",
          name: "A",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["b"] },
        },
        {
          id: "b",
          componentId: "gnb",
          name: "B",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          props: {},
          slots: { primary: ["a"] },
        },
      ],
    };
    expect(() => createPageDocumentFromCanvas(state, { id: "home", name: "Home" })).toThrow(
      /unreachable/
    );
  });
});

describe("token reference picker", () => {
  afterEach(() => {
    cleanup();
  });

  it("builds sorted, de-duplicated {token.path} options", () => {
    const options = tokenReferenceOptions([
      { documentIndex: 0, path: "color.brand", token: { $type: "color", $value: "#000" } },
      { documentIndex: 1, path: "color.brand", token: { $type: "color", $value: "#111" } },
      { documentIndex: 0, path: "color.accent", token: { $type: "color", $value: "#222" } },
    ]);
    expect(options).toEqual(["{color.accent}", "{color.brand}"]);
  });

  it("renders a token-reference datalist the value inputs point at", () => {
    const tokenDocuments = [
      {
        schemaVersion: PODO_SCHEMA_VERSION,
        kind: "tokens" as const,
        category: "primitive" as const,
        tokens: {
          color: {
            brand: { $type: "color" as const, $value: "#5b5bd6" },
            accent: { $type: "color" as const, $value: "#22d3ee" },
          },
        },
      },
    ];
    const { container } = render(
      <PodoEditorApp components={[buttonComponent]} tokenDocuments={tokenDocuments} />
    );
    const datalist = container.querySelector(`#${TOKEN_REFERENCE_LIST_ID}`);
    expect(datalist).not.toBeNull();
    const options = Array.from(datalist?.querySelectorAll("option") ?? []).map(
      (option) => option.value
    );
    expect(options).toContain("{color.brand}");
    expect(options).toContain("{color.accent}");
    // a matrix value input wires itself to the shared list
    const wired = container.querySelector(`input[list="${TOKEN_REFERENCE_LIST_ID}"]`);
    expect(wired).not.toBeNull();
  });
});

describe("PodoEditorApp host wiring", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides the canvas panel when page design is not a host capability", () => {
    render(
      <PodoEditorApp
        components={[buttonComponent]}
        capabilities={{ pageDesign: false, writeMode: "overrides" }}
      />
    );
    expect(screen.queryByRole("button", { name: "canvas" })).toBeNull();
    expect(screen.getByRole("button", { name: "tokens" })).toBeTruthy();
  });

  it("shows the canvas panel when page design is enabled", () => {
    render(
      <PodoEditorApp
        components={[buttonComponent]}
        capabilities={{ pageDesign: true, writeMode: "overrides" }}
      />
    );
    expect(screen.getByRole("button", { name: "canvas" })).toBeTruthy();
  });

  it("stops offering the canvas panel when page design is revoked", () => {
    const { rerender } = render(
      <PodoEditorApp
        components={[buttonComponent]}
        capabilities={{ pageDesign: true, writeMode: "overrides" }}
      />
    );
    expect(screen.getByRole("button", { name: "canvas" })).toBeTruthy();
    rerender(
      <PodoEditorApp
        components={[buttonComponent]}
        capabilities={{ pageDesign: false, writeMode: "overrides" }}
      />
    );
    expect(screen.queryByRole("button", { name: "canvas" })).toBeNull();
  });

  // The generic "Save token" button was removed in favour of per-category inline
  // CRUD; adding a token (here via "+ New color") is the representative edit that
  // exercises the host token write path.
  const colorTokenDocuments = () =>
    moveTokenInDocuments([createEmptyTokenDocument()], {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "color.brand.base",
        type: "color",
        valueText: "#3366ff",
        description: "",
        extensionsText: "",
      },
    });

  it("persists token edits through the injected save adapter", async () => {
    let saved = 0;
    const base = createInMemoryAdapter();
    const adapter: PodoSaveAdapter = {
      ...base,
      saveTokenDocuments: async (documents) => {
        saved += 1;
        return base.saveTokenDocuments!(documents);
      },
    };
    render(
      <PodoEditorApp
        components={[buttonComponent]}
        tokenDocuments={colorTokenDocuments()}
        adapter={adapter}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "+ New color" }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(saved).toBeGreaterThan(0);
  });

  it("does not wedge the host write queue when a save fails synchronously", async () => {
    let calls = 0;
    const adapter: PodoSaveAdapter = {
      ...createInMemoryAdapter(),
      saveTokenDocuments: () => {
        calls += 1;
        throw new Error("boom"); // synchronous failure
      },
    };
    render(
      <PodoEditorApp
        components={[buttonComponent]}
        tokenDocuments={colorTokenDocuments()}
        adapter={adapter}
      />
    );
    const add = screen.getByRole("button", { name: "+ New color" });
    fireEvent.click(add);
    await new Promise((resolve) => setTimeout(resolve, 0));
    // If the queue were wedged (inFlight stuck true) the second write would never run.
    fireEvent.click(add);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(calls).toBeGreaterThanOrEqual(2);
  });

  it("exposes a build panel tab renamed from export", () => {
    render(<PodoEditorApp components={[buttonComponent]} />);
    expect(screen.getByRole("button", { name: "build" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "export" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "build" }));
    expect(screen.getByRole("heading", { name: "Build" })).toBeTruthy();
  });

  it("hides the Scheme control on every non-canvas panel", () => {
    // The Scheme toggle is gated to the canvas panel; the tokens panel now
    // compares light/dark inline so the global toggle is unnecessary elsewhere.
    // (The canvas panel mounts tldraw, which jsdom cannot render, so this asserts
    // the negative across the panels that do render.)
    render(
      <PodoEditorApp
        components={[buttonComponent]}
        capabilities={{ pageDesign: true, writeMode: "overrides" }}
      />
    );
    expect(screen.queryByText("Scheme")).toBeNull(); // default tokens panel
    fireEvent.click(screen.getByRole("button", { name: "components" }));
    expect(screen.queryByText("Scheme")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "build" }));
    expect(screen.queryByText("Scheme")).toBeNull();
  });

  it("offers a slots editor in the components panel", () => {
    render(<PodoEditorApp components={[buttonComponent]} />);
    fireEvent.click(screen.getByRole("button", { name: "components" }));
    fireEvent.click(screen.getByRole("button", { name: /^Slots \(/ }));
    expect(screen.getByRole("button", { name: "Save slot" })).toBeTruthy();
  });

  it("shows a referenced color as 'value (token name)' in the matrix field", () => {
    let documents = moveTokenInDocuments([createEmptyTokenDocument()], {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "color.info.base",
        type: "color",
        valueText: "#1890ff",
      },
    });
    documents = moveTokenInDocuments(documents, {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "color.brand.base",
        type: "color",
        valueText: "{color.info.base}",
      },
    });
    render(<PodoEditorApp components={[buttonComponent]} tokenDocuments={documents} />);
    const field = screen.getByLabelText("color.brand.base value") as HTMLInputElement;
    // resolved value first, token name in parentheses (raw alias only while editing)
    expect(field.value).toBe("#1890ff (color.info.base)");
  });

  it("resolves a non-hex dark color swatch in the comparison matrix", () => {
    // Light is a plain hex; dark is a non-hex (rgba) value. The dark swatch must
    // resolve via the scheme-neutral path against the dark lookup, not the raw
    // "dark.color.*" record path (which the dark lookup never keys).
    let documents = moveTokenInDocuments([createEmptyTokenDocument()], {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "color.brand.base",
        type: "color",
        valueText: "#112233",
      },
    });
    documents = moveTokenInDocuments(documents, {
      documentIndex: 0,
      toDraft: {
        documentIndex: 0,
        path: "dark.color.brand.base",
        type: "color",
        valueText: "rgba(1, 2, 3, 0.5)",
      },
    });
    const { container } = render(
      <PodoEditorApp components={[buttonComponent]} tokenDocuments={documents} />
    );
    // light swatch resolves the hex, dark swatch resolves the rgba (non-hex)
    expect(container.querySelector('[data-color-swatch="#112233"]')).not.toBeNull();
    expect(container.querySelector('[data-color-swatch="rgba(1, 2, 3, 0.5)"]')).not.toBeNull();
  });
});

function legacyComponentById(id: string): ComponentDocument {
  const component = legacyComponents.find((item) => item.id === id);
  if (!component) {
    throw new Error(`Missing legacy component fixture: ${id}`);
  }
  return component;
}

function defaultPreviewSelections(component: ComponentDocument): Record<string, string> {
  return Object.fromEntries(
    component.variants.map((variant) => [variant.name, variant.default ?? variant.values[0] ?? ""])
  );
}

const legacyComponentIds = [
  "avatar",
  "button",
  "checkbox-radio",
  "chip",
  "datepicker",
  "doc-tabs",
  "editor",
  "field",
  "file",
  "input",
  "label",
  "pagination",
  "select",
  "tab",
  "table",
  "textarea",
  "toast",
  "toggle",
  "tooltip",
];

const supportedTargets: ComponentDocument["targets"] = {
  web: { supported: true, limitations: [] },
  react: { supported: true, limitations: [] },
  hono: { supported: true, limitations: [] },
  native: { supported: true, limitations: [] },
};

const buttonComponent: ComponentDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "button",
  name: "Button",
  category: "atom",
  status: "stable",
  anatomy: [{ name: "root" }],
  slots: [{ name: "children", required: true }],
  props: [{ name: "disabled", type: { kind: "boolean" }, default: false }],
  variants: [{ name: "variant", values: ["solid", "soft"], default: "solid" }],
  states: [],
  tokens: { "root.background": "{color.brand}" },
  targets: supportedTargets,
  accessibility: { aria: [], keyboard: [] },
  examples: [],
};

const gnbComponent: ComponentDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "gnb",
  name: "Global Navigation",
  category: "organism",
  status: "draft",
  anatomy: [{ name: "root" }, { name: "item" }],
  slots: [
    { name: "brand", required: true },
    { name: "primary", required: true, repeated: true },
  ],
  props: [{ name: "sticky", type: { kind: "boolean" }, default: false }],
  variants: [],
  states: [],
  tokens: { "root.background": "{color.brand}" },
  targets: supportedTargets,
  accessibility: { role: "navigation", aria: ["aria-label"], keyboard: ["Tab"] },
  examples: [],
};

const layoutComponent: ComponentDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "stack",
  name: "Stack",
  category: "layout",
  status: "draft",
  anatomy: [{ name: "root" }, { name: "content" }],
  slots: [{ name: "content", required: false, repeated: true }],
  props: [],
  variants: [],
  states: [],
  tokens: {},
  targets: supportedTargets,
  accessibility: { aria: [], keyboard: [] },
  examples: [],
};

function inlineIconManifest(): IconManifest {
  return parseIconManifest({
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: "PodoIcons",
    icons: {
      dot: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
        codepoint: "E900",
        tags: [],
      },
    },
    groups: {},
    codepointLock: { dot: "E900" },
  });
}

describe("@podo/editor icon editing", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the icons tab by default and renders the icon grid", () => {
    render(
      <PodoEditorApp
        components={legacyComponents}
        tokenDocuments={legacyTokenDocuments}
        iconManifest={inlineIconManifest()}
        panel="icons"
      />
    );
    expect(screen.getByText("dot")).toBeDefined();
    expect(screen.getByRole("button", { name: "icons" })).toBeDefined();
  });

  it("hides the icons tab unless the host enables icon editing", () => {
    const { rerender } = render(
      <PodoEditorApp
        components={legacyComponents}
        tokenDocuments={legacyTokenDocuments}
        capabilities={{ pageDesign: false, writeMode: "overrides", iconEditing: false }}
      />
    );
    expect(screen.queryByRole("button", { name: "icons" })).toBeNull();
    rerender(
      <PodoEditorApp
        components={legacyComponents}
        tokenDocuments={legacyTokenDocuments}
        capabilities={{ pageDesign: false, writeMode: "overrides", iconEditing: true }}
      />
    );
    expect(screen.queryByRole("button", { name: "icons" })).not.toBeNull();
  });

  it("builds and saves a valid always-woff2 manifest from edits", async () => {
    const saved: IconManifest[] = [];
    render(
      <PodoEditorApp
        components={legacyComponents}
        tokenDocuments={legacyTokenDocuments}
        iconManifest={inlineIconManifest()}
        onIconsChange={(manifest) => saved.push(manifest)}
        panel="icons"
      />
    );
    fireEvent.click(screen.getByText("Build & save woff2"));
    await waitFor(() => expect(saved.length).toBe(1));
    const manifest = saved[0]!;
    expect(manifest.fontAsset?.format).toBe("woff2");
    expect(validateIconManifest(manifest)).toEqual([]);
  });
});
