// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createInMemoryAdapter, type PodoSaveAdapter } from "@podo/edit-core";
import {
  PodoEditorApp,
  applyEditorStateToTldraw,
  composeSlot,
  createComponentNode,
  createComponentSpecExportFile,
  createComponentTokenEditorModel,
  createEmbeddedFontAsset,
  createThemedTokenLookup,
  createEditorState,
  createTokenMatrix,
  createTypographyWorkspaceModel,
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
import { PODO_SCHEMA_VERSION, type ComponentDocument } from "@podo/spec";
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
    expect(tokenPaths).toContain("typography.paragraph.p3");
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
    expect(button?.states.find((state) => state.name === "hover")?.tokens).toMatchObject({
      "root.background": "{component.button.theme.default.solid.hover.background}",
    });
    expect(button?.states.find((state) => state.name === "disabled")?.tokens).toMatchObject({
      "root.background": "{component.button.disabled.solid.background}",
    });
    expect(button?.states.find((state) => state.name === "loading")?.tokens).toMatchObject({
      "root.opacity": "{component.button.loading.opacity}",
    });
    expect(button?.tokens).toMatchObject({
      "root.background": "{component.button.theme.default.solid.background}",
      "root.height": "{component.button.size.sm.height}",
      "root.typography": "{component.button.size.sm.typography}",
    });
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
    expect(primary?.cells.hover?.token.$value).toBe("#6d28d9");
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
    expect(workspace.styles.some((record) => record.path === "typography.heading.h1")).toBe(true);
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

    render(renderComponentPreview(legacyComponentById("select"), { state: "open" }, lookup));
    expect(screen.getByText("Operations")).not.toBeNull();
    cleanup();

    render(renderComponentPreview(legacyComponentById("input"), { state: "invalid" }, lookup));
    const inputShell = screen.getByText("team@podo.dev").parentElement;
    expect(inputShell?.style.borderColor).toBe("rgb(240, 70, 70)");
    cleanup();

    render(renderComponentPreview(legacyComponentById("table"), { display: "table" }, lookup));
    expect(screen.getByRole("table")).not.toBeNull();
    cleanup();

    render(renderComponentPreview(legacyComponentById("table"), { display: "list" }, lookup));
    expect(screen.queryByRole("table")).toBeNull();
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
    expect(lightLookup.get("color.primary.hover")?.$value).toBe("#6d28d9");
    expect(darkLookup.get("color.primary.hover")?.$value).toBe("#8b5cf6");
    expect(darkLookup.get("color.bg.elevation")?.$value).toBe("#09090b");
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
    render(<PodoEditorApp components={[buttonComponent]} adapter={adapter} />);
    fireEvent.click(screen.getByRole("button", { name: "Save token" }));
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
    render(<PodoEditorApp components={[buttonComponent]} adapter={adapter} />);
    const save = screen.getByRole("button", { name: "Save token" });
    fireEvent.click(save);
    await new Promise((resolve) => setTimeout(resolve, 0));
    // If the queue were wedged (inFlight stuck true) the second write would never run.
    fireEvent.click(save);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(calls).toBeGreaterThanOrEqual(2);
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
