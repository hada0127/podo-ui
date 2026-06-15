import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION, parseComponentDocument, parseTokenDocument } from "@podo/spec";
import { createEditStore, createInMemoryAdapter, validateWorkspace } from "./index.js";

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
});
