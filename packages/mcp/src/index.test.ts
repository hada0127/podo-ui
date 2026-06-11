import { mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION } from "@podo/spec";
import {
  createPodoMcpServer,
  explainMigration,
  getComponentExample,
  getComponentSpec,
  getSystemOverview,
  getToken,
  loadMcpProject,
  searchComponents,
  searchTokens,
  suggestComponentSpec,
  validatePodoProject,
  type McpToolContext,
} from "./index.js";

describe("@podo/mcp", () => {
  it("loads package defaults and project .podo overrides", async () => {
    const root = await createProject();
    const context = await loadMcpProject(root);

    expect(context.config?.build.targets).toEqual(["react"]);
    expect(context.tokens.some((token) => token.path === "component.button.background")).toBe(true);
    expect(context.components.some((component) => component.id === "banner")).toBe(true);
    expect(context.issues).toEqual([]);
  });

  it("serves read tools for overview, tokens, components, validation, and migration", async () => {
    const root = await createProject();
    const toolContext: McpToolContext = { load: () => loadMcpProject(root) };

    await expect(getSystemOverview(toolContext)).resolves.toMatchObject({ ok: true });
    await expect(searchTokens(toolContext, { query: "brand" })).resolves.toMatchObject({
      ok: true,
    });
    await expect(searchTokens(toolContext, { query: "cta" })).resolves.toMatchObject({
      ok: true,
      data: { count: 1 },
    });
    await expect(
      getToken(toolContext, { path: "component.button.background" })
    ).resolves.toMatchObject({
      ok: true,
      data: {
        roles: ["cta"],
        themeValues: {
          landing: {
            light: {
              value: "#14151A",
            },
          },
        },
      },
    });
    await expect(getToken(toolContext, { path: "typography.h1.dashboard" })).resolves.toMatchObject(
      {
        ok: true,
        data: { themeValues: { dashboard: { light: { value: { fontSize: "28px" } } } } },
      }
    );
    await expect(searchComponents(toolContext, { query: "banner" })).resolves.toMatchObject({
      ok: true,
    });
    await expect(getComponentSpec(toolContext, { id: "banner" })).resolves.toMatchObject({
      ok: true,
    });
    await expect(
      getComponentExample(toolContext, { id: "button", target: "react" })
    ).resolves.toMatchObject({
      ok: true,
    });
    await expect(validatePodoProject(toolContext)).resolves.toMatchObject({ ok: true });
    await expect(explainMigration(toolContext)).resolves.toMatchObject({ ok: true });
  });

  it("suggests component specs without writing files and creates an SDK server", async () => {
    const root = await createProject();
    const toolContext: McpToolContext = { load: () => loadMcpProject(root) };
    const suggestion = (await suggestComponentSpec(toolContext, {
      id: "marketing-card",
      props: ["title", "href"],
      slots: ["media", "children"],
    })) as { ok: boolean; data: { component: { id: string }; writes: unknown[] } };

    expect(suggestion.ok).toBe(true);
    expect(suggestion.data.component.id).toBe("marketing-card");
    expect(suggestion.data.writes).toEqual([]);
    await expect(
      stat(join(root, ".podo/components/local/marketing-card.component.json"))
    ).rejects.toThrow();
    expect(createPodoMcpServer({ root })).toBeDefined();
  });

  it("serves tools through the MCP protocol", async () => {
    const root = await createProject();
    const server = createPodoMcpServer({ root });
    const client = new Client({ name: "podo-mcp-test", version: "0.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    const tools = await client.listTools();
    expect(tools.tools.some((tool) => tool.name === "get_system_overview")).toBe(true);
    const result = await client.callTool({
      name: "search_components",
      arguments: { query: "button", target: "react" },
    });
    expect(result.content[0]?.type).toBe("text");

    await client.close();
    await server.close();
  });
});

async function createProject(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "podo-mcp-"));
  await mkdir(join(root, ".podo/themes"), { recursive: true });
  await mkdir(join(root, ".podo/components/local"), { recursive: true });
  await mkdir(join(root, ".podo/icons"), { recursive: true });
  await writeFile(join(root, "package.json"), `${JSON.stringify({ name: "fixture" })}\n`);
  await writeFile(
    join(root, ".podo/config.json"),
    `${JSON.stringify(
      {
        schemaVersion: PODO_SCHEMA_VERSION,
        environment: "react",
        darkMode: { enabled: true, strategy: "data-attribute" },
        themes: { default: "dashboard", available: ["landing", "dashboard"] },
        build: { targets: ["react"], outDir: "src/podo" },
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(root, ".podo/lock.json"),
    `${JSON.stringify(
      {
        schemaVersion: PODO_SCHEMA_VERSION,
        packageVersion: "0.0.0",
        migrations: [],
        generatedHash: "a".repeat(64),
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(root, ".podo/themes/button.tokens.json"),
    `${JSON.stringify(
      {
        schemaVersion: PODO_SCHEMA_VERSION,
        kind: "tokens",
        category: "theme",
        tokens: {
          component: {
            button: {
              background: {
                $type: "color",
                $value: "{color.text}",
                $extensions: { podo: { roles: ["cta"] } },
              },
            },
          },
        },
      },
      null,
      2
    )}\n`
  );
  await writeFile(
    join(root, ".podo/components/local/banner.component.json"),
    `${JSON.stringify(
      {
        schemaVersion: PODO_SCHEMA_VERSION,
        kind: "component",
        id: "banner",
        name: "Banner",
        category: "organism",
        status: "draft",
        anatomy: [{ name: "root" }, { name: "content" }],
        slots: [{ name: "children", required: true }],
        props: [{ name: "tone", type: { kind: "enum", values: ["info", "danger"] } }],
        variants: [],
        states: [{ name: "focusVisible" }],
        tokens: { "root.background": "{component.button.background}" },
        targets: {
          web: { supported: true, limitations: [] },
          react: { supported: true, limitations: [] },
          hono: { supported: true, limitations: [] },
          native: { supported: true, limitations: [] },
        },
        accessibility: { aria: ["aria-label"], keyboard: ["Tab"] },
        examples: [{ target: "react", title: "React banner", code: "<Banner>Notice</Banner>" }],
      },
      null,
      2
    )}\n`
  );
  return root;
}
