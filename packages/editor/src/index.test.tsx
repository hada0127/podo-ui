// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  applyEditorStateToTldraw,
  composeSlot,
  createComponentNode,
  createComponentSpecExportFile,
  createEditorState,
  describeLayoutSpecBoundary,
  dropComponentOnCanvas,
  exportComponentSpecFromNode,
  exportFigmaVariables,
  githubSyncStrategy,
  importFigmaVariables,
  responsiveViewports,
  selectResponsivePreview,
  syncEditorStateFromTldraw,
  updateComponentNodeProps,
  type FigmaVariableCollection,
  type PodoComponentShapeInput,
  type PodoTldrawStateWriter,
} from "./index.js";
import {
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

describe("@podo/editor", () => {
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
    const tokenPaths = flattenTokenDocuments(legacyTokenDocuments).map((record) => record.path);
    const button = legacyComponents.find((component) => component.id === "button");

    expect(tokenPaths).toContain("color.primary.base");
    expect(tokenPaths).toContain("color.primary.hover");
    expect(tokenPaths).toContain("spacing.scale.5");
    expect(tokenPaths).toContain("radius.scale.3");
    expect(tokenPaths).toContain("typography.paragraph.p3");
    expect(tokenPaths).toContain("component.button.theme.primary.solid.background");
    expect(tokenPaths).toContain("component.button.size.sm.height");
    expect(legacyComponents.map((component) => component.id)).toEqual(["button", "field", "input"]);
    expect(button?.props.find((prop) => prop.name === "theme")?.type).toMatchObject({
      kind: "enum",
      values: [
        "default",
        "primary",
        "default-deep",
        "info",
        "link",
        "success",
        "warning",
        "danger",
      ],
    });
    expect(button?.tokens).toMatchObject({
      "root.background": "{component.button.theme.primary.solid.background}",
      "root.height": "{component.button.size.sm.height}",
      "root.typography": "{component.button.size.sm.typography}",
    });
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
