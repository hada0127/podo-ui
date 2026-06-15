import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION, parseComponentDocument, parseTokenDocument } from "@podo/spec";
import {
  createEditStore,
  createInMemoryAdapter,
  createStudioHttpAdapter,
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
