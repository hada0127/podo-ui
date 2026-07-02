import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION, parseComponentDocument, parseTokenDocument } from "@podo/spec";
import {
  addComponentAnatomyPart,
  addComponentVariantAxis,
  addComponentVariantValue,
  createEditStore,
  createInMemoryAdapter,
  createStudioHttpAdapter,
  deleteComponentSlot,
  deleteComponentVariant,
  duplicateComponentAnatomyPart,
  moveComponentAnatomyPart,
  removeComponentAnatomyPart,
  removeComponentVariantValue,
  renameComponentAnatomyPart,
  renameComponentVariantAxis,
  renameComponentVariantValue,
  reorderComponentAnatomyPart,
  reparentComponentAnatomyPart,
  setComponentAnatomyPartFlags,
  setComponentVariantDefault,
  upsertComponentCombinationTokenBinding,
  upsertComponentSlot,
  upsertComponentStateTokenBinding,
  upsertComponentTokenBinding,
  upsertComponentVariant,
  upsertComponentVariantValueTokenBinding,
  validateWorkspace,
} from "./index.js";

const demoComponent = parseComponentDocument({
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "demo",
  name: "Demo",
  category: "atom",
  status: "stable",
  anatomy: [{ name: "root" }],
  targets: {
    web: { supported: true },
    react: { supported: true },
    hono: { supported: true },
    native: { supported: true },
  },
  accessibility: {},
  tokens: { "root.background": "{color.brand}" },
});

const MISSING = "component.tokenBinding.missing";

describe("validateWorkspace", () => {
  it("flags component bindings that reference missing tokens", () => {
    const issues = validateWorkspace({ tokenDocuments: [], components: [demoComponent] });
    expect(issues.some((item) => item.code === MISSING)).toBe(true);
  });

  it("resolves token references across documents via the merged graph", () => {
    const primitive = parseTokenDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "tokens",
      category: "primitive",
      tokens: { color: { brand: { $type: "color", $value: "#5b5bd6" } } },
    });
    const semantic = parseTokenDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "tokens",
      category: "semantic",
      tokens: { color: { action: { $type: "color", $value: "{color.brand}" } } },
    });
    const issues = validateWorkspace({
      tokenDocuments: [primitive, semantic],
      components: [],
    });
    // A per-document check would falsely report {color.brand} as missing in the
    // semantic document; merged validation must not.
    expect(issues.some((item) => item.code.startsWith("token.reference"))).toBe(false);
  });

  it("does not throw on a schema-invalid token document; it reports it", () => {
    const issues = validateWorkspace({
      tokenDocuments: [{ not: "a token document" } as never],
      components: [demoComponent],
    });
    expect(issues.some((item) => item.code === "token.schema.invalid")).toBe(true);
  });
});

describe("createEditStore", () => {
  it("commits token edits, clears the missing-binding issue, and undoes/redoes", () => {
    const store = createEditStore({ components: [demoComponent] });
    expect(store.getSnapshot().canUndo).toBe(false);
    expect(store.getSnapshot().issues.some((item) => item.code === MISSING)).toBe(true);

    store.upsertToken({ path: "color.brand", type: "color", valueText: "#5b5bd6" });
    expect(store.getSnapshot().canUndo).toBe(true);
    expect(store.getSnapshot().issues.some((item) => item.code === MISSING)).toBe(false);

    store.undo();
    expect(store.getSnapshot().issues.some((item) => item.code === MISSING)).toBe(true);

    store.redo();
    expect(store.getSnapshot().issues.some((item) => item.code === MISSING)).toBe(false);
  });

  it("rejects an invalid mutation without changing state", () => {
    const store = createEditStore();
    expect(() => store.upsertToken({ path: "", type: "color", valueText: "#fff" })).toThrow();
    expect(store.getSnapshot().canUndo).toBe(false);
  });

  it("returns a stable snapshot reference until a mutation occurs", () => {
    const store = createEditStore();
    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);
    store.upsertToken({ path: "color.brand", type: "color", valueText: "#5b5bd6" });
    expect(store.getSnapshot()).not.toBe(first);
  });
});

describe("createInMemoryAdapter", () => {
  it("persists token saves and reloads them with no schema issues", async () => {
    const adapter = createInMemoryAdapter({ components: [demoComponent] });
    const dry = await adapter.saveToken({
      path: "color.brand",
      type: "color",
      value: "#5b5bd6",
      dryRun: true,
    });
    expect(dry.dryRun).toBe(true);

    await adapter.saveToken({ path: "color.brand", type: "color", value: "#5b5bd6" });
    const context = await adapter.loadContext();
    const issues = await adapter.validate();

    expect(context.tokenDocuments.length).toBeGreaterThan(0);
    expect(issues.filter((item) => item.code.endsWith(".schema.invalid"))).toHaveLength(0);
    expect(issues.some((item) => item.code === MISSING)).toBe(false);
  });

  it("stores and reloads page documents", async () => {
    const adapter = createInMemoryAdapter();
    await adapter.savePage!({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "page",
      id: "home",
      name: "Home",
      root: { type: "text", id: "t", value: "hi" } as never,
    } as never);
    const context = await adapter.loadContext();
    expect(context.pages?.map((page) => page.id)).toContain("home");
  });
});

describe("createStudioHttpAdapter", () => {
  interface RecordedCall {
    url: string;
    method?: string;
    body?: Record<string, unknown>;
  }

  const editorTokenDoc = {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens: { color: { brand: { $type: "color", $value: "#5b5bd6" } } },
  };

  // Mirrors the REAL studio route shapes: /api/context returns component
  // summaries with the document nested at `.document` and a `files` list (no raw
  // tokenDocuments); raw token docs are fetched via GET /api/files.
  function mockStudio() {
    const calls: RecordedCall[] = [];
    const fetch = async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      const body = init?.body
        ? (JSON.parse(init.body as string) as Record<string, unknown>)
        : undefined;
      calls.push({ url, method, body });
      let payload: unknown = { ok: true, path: "written" };
      if (url.includes("/api/context")) {
        payload = {
          ok: true,
          context: {
            components: [{ document: demoComponent }],
            pages: [{ id: "home", kind: "page" }],
            files: [{ path: ".podo/tokens/editor.tokens.json", kind: "token" }],
          },
        };
      } else if (url.includes("/api/files") && method === "GET") {
        payload = { ok: true, contents: `${JSON.stringify(editorTokenDoc)}\n` };
      } else if (url.includes("/api/validate")) {
        payload = { ok: true, report: { ok: true, issues: [] } };
      }
      return { ok: true, status: 200, json: async () => payload };
    };
    return { fetch, calls };
  }

  it("writes tokens and components through the studio routes", async () => {
    const { fetch, calls } = mockStudio();
    const adapter = createStudioHttpAdapter({ fetch });

    await adapter.saveToken({ path: "color.brand", type: "color", value: "#5b5bd6" });
    await adapter.saveComponent(demoComponent);
    await adapter.saveTokenDocuments!([
      parseTokenDocument({
        schemaVersion: PODO_SCHEMA_VERSION,
        kind: "tokens",
        category: "theme",
        tokens: {},
      }),
    ]);

    const tokenCall = calls.find((call) => call.url.endsWith("/api/tokens/override"));
    expect(tokenCall?.body).toMatchObject({ path: "color.brand", type: "color", value: "#5b5bd6" });

    const componentCall = calls.find(
      (call) =>
        call.url.endsWith("/api/files") && String(call.body?.path).includes("components/local")
    );
    expect(componentCall?.body?.path).toBe(".podo/components/local/demo.component.json");

    const tokenDocCall = calls.find(
      (call) => call.url.endsWith("/api/files") && String(call.body?.path).includes("tokens/editor")
    );
    expect(tokenDocCall?.body?.path).toBe(".podo/tokens/editor.tokens.json");

    await adapter.savePage!({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "page",
      id: "home",
      name: "Home",
      root: { type: "text", id: "t", value: "hi", overrides: [] } as never,
    } as never);
    const pageCall = calls.find(
      (call) => call.url.includes("/api/files") && String(call.body?.path).includes("pages/")
    );
    expect(pageCall?.body?.path).toBe(".podo/pages/home.page.json");
  });

  it("maps the real studio context shape and returns validation issues", async () => {
    const { fetch } = mockStudio();
    const adapter = createStudioHttpAdapter({ fetch });
    const context = await adapter.loadContext();
    expect(context.capabilities.pageDesign).toBe(true);
    // component is unwrapped from the summary `.document`
    expect(context.components.map((component) => component.id)).toContain("demo");
    // raw token document is loaded from the token file, not the resolved context
    expect(context.tokenDocuments).toHaveLength(1);
    expect(context.tokenDocuments[0]?.category).toBe("theme");
    // pages come straight from the context payload
    expect(context.pages?.map((page) => page.id)).toContain("home");
    expect(await adapter.validate()).toEqual([]);
  });

  it("overwrites existing .podo files on repeat saves (force defaults true)", async () => {
    const { fetch, calls } = mockStudio();
    const adapter = createStudioHttpAdapter({ fetch });
    await adapter.saveComponent(demoComponent);
    await adapter.saveComponent(demoComponent);
    const putCalls = calls.filter(
      (call) => call.url.includes("/api/files") && call.method === "PUT"
    );
    expect(putCalls).toHaveLength(2);
    expect(putCalls.every((call) => call.body?.force === true)).toBe(true);
  });

  it("throws when validate hits a server error with no report", async () => {
    const fetch = async () => ({
      ok: false,
      status: 500,
      json: async () => ({ ok: false, error: { message: "boom" } }),
    });
    const adapter = createStudioHttpAdapter({ fetch });
    await expect(adapter.validate()).rejects.toThrow(/Studio validate failed/);
  });
});

describe("component slot editing", () => {
  it("adds, updates, and removes slots", () => {
    const withSlot = upsertComponentSlot(demoComponent, {
      name: "content",
      repeated: true,
      description: "Body",
    });
    expect(withSlot.slots).toHaveLength(1);
    expect(withSlot.slots[0]).toMatchObject({
      name: "content",
      required: false,
      repeated: true,
      description: "Body",
    });

    const updated = upsertComponentSlot(withSlot, {
      name: "content",
      required: true,
      repeated: false,
    });
    expect(updated.slots).toHaveLength(1);
    expect(updated.slots[0]).toMatchObject({ name: "content", required: true, repeated: false });

    const removed = deleteComponentSlot(updated, "content");
    expect(removed.slots).toHaveLength(0);
  });

  it("rejects an empty slot name", () => {
    expect(() => upsertComponentSlot(demoComponent, { name: "  " })).toThrow();
  });

  it("preserves target-specific slot metadata on update", () => {
    const targeted = parseComponentDocument({
      ...demoComponent,
      slots: [
        { name: "content", required: false, repeated: true, targets: { web: { name: "div" } } },
      ],
    });
    const updated = upsertComponentSlot(targeted, { name: "content", required: true });
    expect(updated.slots[0]?.required).toBe(true);
    expect(updated.slots[0]?.targets).toEqual({ web: { name: "div" } });
  });
});

describe("component variant editing", () => {
  it("adds, updates, and removes variants with a valid default", () => {
    const withVariant = upsertComponentVariant(demoComponent, {
      name: "tone",
      valuesText: "default, emphasis",
      defaultValue: "emphasis",
    });
    expect(withVariant.variants).toHaveLength(1);
    expect(withVariant.variants[0]).toMatchObject({
      name: "tone",
      values: ["default", "emphasis"],
      default: "emphasis",
    });

    const removed = deleteComponentVariant(withVariant, "tone");
    expect(removed.variants).toHaveLength(0);
  });

  it("rejects empty values, duplicate values, and an out-of-range default", () => {
    expect(() =>
      upsertComponentVariant(demoComponent, { name: "tone", valuesText: " " })
    ).toThrow();
    expect(() =>
      upsertComponentVariant(demoComponent, { name: "tone", valuesText: "a, a" })
    ).toThrow(/duplicate/i);
    expect(() =>
      upsertComponentVariant(demoComponent, {
        name: "tone",
        valuesText: "a, b",
        defaultValue: "c",
      })
    ).toThrow(/default/i);
  });
});

const hierarchyComponent = parseComponentDocument({
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "hier",
  name: "Hier",
  category: "atom",
  status: "stable",
  anatomy: [{ name: "root" }, { name: "icon", parent: "root" }, { name: "dot", parent: "icon" }],
  variants: [{ name: "tone", values: ["a", "b"], default: "a" }],
  states: [{ name: "hover" }],
  targets: {
    web: { supported: true },
    react: { supported: true },
    hono: { supported: true },
    native: { supported: true },
  },
  accessibility: {},
  tokens: { "root.background": "{color.bg}", "icon.color": "{color.icon}" },
});

describe("component anatomy + token-binding editing", () => {
  it("adds a part and disambiguates duplicate names", () => {
    const once = addComponentAnatomyPart(demoComponent, "label");
    expect(once.anatomy.map((p) => p.name)).toContain("label");
    const twice = addComponentAnatomyPart(once, "label");
    expect(twice.anatomy.map((p) => p.name)).toEqual(["root", "label", "label-2"]);
  });

  it("adds a nested child under a parent", () => {
    const next = addComponentAnatomyPart(hierarchyComponent, "ring", "icon");
    expect(next.anatomy.find((p) => p.name === "ring")?.parent).toBe("icon");
  });

  it("renames a part: migrates token keys + child parent refs", () => {
    const next = renameComponentAnatomyPart(hierarchyComponent, "icon", "glyph");
    expect(next.tokens["glyph.color"]).toBe("{color.icon}");
    expect(next.tokens["icon.color"]).toBeUndefined();
    expect(next.anatomy.find((p) => p.name === "dot")?.parent).toBe("glyph");
  });

  it("rejects renaming to an existing layer name", () => {
    expect(() => renameComponentAnatomyPart(hierarchyComponent, "icon", "root")).toThrow(
      /already exists/i
    );
  });

  it("removes a part with its descendants and their bindings", () => {
    const next = removeComponentAnatomyPart(hierarchyComponent, "icon");
    expect(next.anatomy.map((p) => p.name)).toEqual(["root"]);
    expect(next.tokens["icon.color"]).toBeUndefined();
    expect(next.tokens["root.background"]).toBe("{color.bg}");
  });

  it("reparent rejects nesting a layer into its own descendant", () => {
    const next = reparentComponentAnatomyPart(hierarchyComponent, "root", "dot");
    expect(next.anatomy.find((p) => p.name === "root")?.parent).toBeUndefined();
  });

  it("reorders a sibling and moves (reparent+reorder) atomically", () => {
    const reordered = reorderComponentAnatomyPart(hierarchyComponent, "root", null);
    expect(reordered.anatomy.map((p) => p.name)).toEqual(["icon", "dot", "root"]);
    const moved = moveComponentAnatomyPart(hierarchyComponent, "dot", null, "root");
    expect(moved.anatomy.find((p) => p.name === "dot")?.parent).toBeUndefined();
    expect(moved.anatomy[0]?.name).toBe("dot");
  });

  it("upserts and deletes base token bindings", () => {
    const set = upsertComponentTokenBinding(hierarchyComponent, "root.radius", "{radius.md}");
    expect(set.tokens["root.radius"]).toBe("{radius.md}");
    const cleared = upsertComponentTokenBinding(set, "root.radius", "");
    expect(cleared.tokens["root.radius"]).toBeUndefined();
  });

  it("writes a per-variant value token binding", () => {
    const next = upsertComponentVariantValueTokenBinding(
      hierarchyComponent,
      "tone",
      "b",
      "root.background",
      "{color.accent}"
    );
    expect(next.variants[0]?.valueTokens?.b?.["root.background"]).toBe("{color.accent}");
  });

  it("deep-duplicates a subtree with unique names and copied bindings", () => {
    const { component: next, copiedName } = duplicateComponentAnatomyPart(
      hierarchyComponent,
      "icon"
    );
    expect(copiedName).toBe("icon-copy");
    expect(next.anatomy.map((p) => p.name)).toEqual(["root", "icon", "dot", "icon-copy", "dot-2"]);
    expect(next.anatomy.find((p) => p.name === "icon-copy")?.parent).toBe("root");
    expect(next.anatomy.find((p) => p.name === "dot-2")?.parent).toBe("icon-copy");
    expect(next.tokens["icon-copy.color"]).toBe("{color.icon}");
    expect(next.tokens["icon.color"]).toBe("{color.icon}");
  });

  it("duplicate never clobbers an orphan binding whose prefix matches a copy name", () => {
    const seeded = upsertComponentTokenBinding(hierarchyComponent, "dot-2.color", "{color.orphan}");
    const { component: next } = duplicateComponentAnatomyPart(seeded, "icon");
    // The copy of "dot" must skip the reserved "dot-2" prefix, not overwrite it.
    expect(next.tokens["dot-2.color"]).toBe("{color.orphan}");
    expect(next.anatomy.some((p) => p.name === "dot-3")).toBe(true);
  });

  it("sets and clears hidden/locked layer flags", () => {
    const hidden = setComponentAnatomyPartFlags(hierarchyComponent, "icon", { hidden: true });
    expect(hidden.anatomy.find((p) => p.name === "icon")?.hidden).toBe(true);
    const cleared = setComponentAnatomyPartFlags(hidden, "icon", { hidden: false, locked: true });
    const part = cleared.anatomy.find((p) => p.name === "icon");
    expect(part?.hidden).toBeUndefined();
    expect(part?.locked).toBe(true);
  });
});

describe("inline variant axis/value operations", () => {
  it("adds a variant axis with a default", () => {
    const next = addComponentVariantAxis(demoComponent, "size", ["sm", "md"]);
    expect(next.variants[0]).toMatchObject({ name: "size", values: ["sm", "md"], default: "sm" });
    expect(() => addComponentVariantAxis(next, "size", ["a"])).toThrow(/already exists/i);
    expect(() => addComponentVariantAxis(next, " ", ["a"])).toThrow(/required/i);
    expect(() => addComponentVariantAxis(next, "tone", [" "])).toThrow(/at least one/i);
    expect(() => addComponentVariantAxis(next, "tone", ["a", "a"])).toThrow(/duplicate/i);
  });

  it("renames an axis in place, preserving order and valueTokens", () => {
    const seeded = upsertComponentVariantValueTokenBinding(
      hierarchyComponent,
      "tone",
      "b",
      "root.background",
      "{color.accent}"
    );
    const withSecond = addComponentVariantAxis(seeded, "size", ["sm"]);
    const next = renameComponentVariantAxis(withSecond, "tone", "theme");
    expect(next.variants.map((v) => v.name)).toEqual(["theme", "size"]);
    expect(next.variants[0]?.valueTokens?.b?.["root.background"]).toBe("{color.accent}");
    expect(() => renameComponentVariantAxis(next, "theme", "size")).toThrow(/already exists/i);
  });

  it("adds a value and rejects duplicates/blank", () => {
    const next = addComponentVariantValue(hierarchyComponent, "tone", "c");
    expect(next.variants[0]?.values).toEqual(["a", "b", "c"]);
    expect(() => addComponentVariantValue(next, "tone", "c")).toThrow(/duplicate/i);
    expect(() => addComponentVariantValue(next, "tone", " ")).toThrow(/at least one/i);
    expect(() => addComponentVariantValue(next, "ghost", "x")).toThrow(/not found/i);
  });

  it("renames a value, migrating valueTokens and the default", () => {
    const seeded = upsertComponentVariantValueTokenBinding(
      hierarchyComponent,
      "tone",
      "a",
      "root.background",
      "{color.accent}"
    );
    const next = renameComponentVariantValue(seeded, "tone", "a", "primary");
    expect(next.variants[0]?.values).toEqual(["primary", "b"]);
    expect(next.variants[0]?.default).toBe("primary");
    expect(next.variants[0]?.valueTokens?.primary?.["root.background"]).toBe("{color.accent}");
    expect(next.variants[0]?.valueTokens?.a).toBeUndefined();
    expect(() => renameComponentVariantValue(next, "tone", "primary", "b")).toThrow(/duplicate/i);
  });

  it("removes a value (never the last), fixing the default and valueTokens", () => {
    const seeded = upsertComponentVariantValueTokenBinding(
      hierarchyComponent,
      "tone",
      "a",
      "root.background",
      "{color.accent}"
    );
    const next = removeComponentVariantValue(seeded, "tone", "a");
    expect(next.variants[0]?.values).toEqual(["b"]);
    expect(next.variants[0]?.default).toBe("b");
    expect(next.variants[0]?.valueTokens).toBeUndefined();
    expect(() => removeComponentVariantValue(next, "tone", "b")).toThrow(/at least one/i);
  });

  it("sets the axis default only to an existing value", () => {
    const next = setComponentVariantDefault(hierarchyComponent, "tone", "b");
    expect(next.variants[0]?.default).toBe("b");
    expect(() => setComponentVariantDefault(next, "tone", "zzz")).toThrow(/default/i);
  });
});

describe("compound combination bindings", () => {
  const twoAxis = parseComponentDocument({
    ...JSON.parse(JSON.stringify(hierarchyComponent)),
    variants: [
      { name: "tone", values: ["a", "b"], default: "a" },
      { name: "size", values: ["sm", "lg"], default: "sm" },
    ],
  });

  it("creates, updates, and removes a combination entry", () => {
    const when = { tone: "b", size: "lg" };
    const set = upsertComponentCombinationTokenBinding(
      twoAxis,
      when,
      "root.background",
      "{color.combo}"
    );
    expect(set.combinations).toHaveLength(1);
    expect(set.combinations[0]?.tokens["root.background"]).toBe("{color.combo}");
    // Same `when` in a different key order updates the SAME entry.
    const updated = upsertComponentCombinationTokenBinding(
      set,
      { size: "lg", tone: "b" },
      "root.color",
      "#ffffff"
    );
    expect(updated.combinations).toHaveLength(1);
    expect(Object.keys(updated.combinations[0]?.tokens ?? {})).toHaveLength(2);
    // Clearing the last binding drops the entry entirely.
    const cleared = upsertComponentCombinationTokenBinding(
      upsertComponentCombinationTokenBinding(updated, when, "root.background", ""),
      when,
      "root.color",
      ""
    );
    expect(cleared.combinations).toHaveLength(0);
  });

  it("rejects combinations naming unknown axes/values via zod", () => {
    expect(() =>
      upsertComponentCombinationTokenBinding(twoAxis, { ghost: "x" }, "root.color", "#fff")
    ).toThrow();
  });

  it("part rename migrates combination binding keys", () => {
    const seeded = upsertComponentCombinationTokenBinding(
      twoAxis,
      { tone: "b" },
      "icon.color",
      "{color.combo}"
    );
    const renamed = renameComponentAnatomyPart(seeded, "icon", "glyph");
    expect(renamed.combinations[0]?.tokens["glyph.color"]).toBe("{color.combo}");
    expect(renamed.combinations[0]?.tokens["icon.color"]).toBeUndefined();
  });
});

describe("state token bindings", () => {
  it("writes into an existing state and cleans up empty token maps", () => {
    const set = upsertComponentStateTokenBinding(
      hierarchyComponent,
      "hover",
      "root.background",
      "{color.hover}"
    );
    expect(set.states.find((s) => s.name === "hover")?.tokens?.["root.background"]).toBe(
      "{color.hover}"
    );
    const cleared = upsertComponentStateTokenBinding(set, "hover", "root.background", "");
    expect(cleared.states.find((s) => s.name === "hover")?.tokens).toBeUndefined();
  });

  it("creates the state entry when styling a state the spec did not declare", () => {
    const next = upsertComponentStateTokenBinding(
      hierarchyComponent,
      "disabled",
      "root.opacity",
      "0.5"
    );
    expect(next.states.find((s) => s.name === "disabled")?.tokens?.["root.opacity"]).toBe("0.5");
    // Clearing a binding on a missing state is a no-op, not a creation.
    const noop = upsertComponentStateTokenBinding(hierarchyComponent, "active", "root.color", "");
    expect(noop.states.some((s) => s.name === "active")).toBe(false);
  });
});

describe("anatomy hierarchy schema validation", () => {
  const base = {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component" as const,
    id: "v",
    name: "V",
    category: "atom" as const,
    status: "stable" as const,
    targets: {
      web: { supported: true },
      react: { supported: true },
      hono: { supported: true },
      native: { supported: true },
    },
    accessibility: {},
  };

  it("rejects duplicate part names", () => {
    expect(() =>
      parseComponentDocument({ ...base, anatomy: [{ name: "root" }, { name: "root" }] })
    ).toThrow(/unique/i);
  });

  it("rejects a missing parent", () => {
    expect(() =>
      parseComponentDocument({ ...base, anatomy: [{ name: "root", parent: "ghost" }] })
    ).toThrow(/does not exist/i);
  });

  it("rejects a self-parent", () => {
    expect(() =>
      parseComponentDocument({ ...base, anatomy: [{ name: "root", parent: "root" }] })
    ).toThrow(/own parent/i);
  });

  it("rejects a parent cycle", () => {
    expect(() =>
      parseComponentDocument({
        ...base,
        anatomy: [
          { name: "a", parent: "b" },
          { name: "b", parent: "a" },
        ],
      })
    ).toThrow(/cycle/i);
  });
});
