import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION, parseComponentDocument } from "@podo/spec";
import { createRepoFsAdapter } from "./node.js";

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

async function setup(): Promise<{ tokensDir: string; componentsDir: string }> {
  const root = await mkdtemp(join(tmpdir(), "podo-edit-core-"));
  const tokensDir = join(root, "tokens");
  const componentsDir = join(root, "components");
  await mkdir(tokensDir, { recursive: true });
  await mkdir(componentsDir, { recursive: true });
  return { tokensDir, componentsDir };
}

describe("createRepoFsAdapter", () => {
  it("persists components and tokens to repo spec files and reloads them", async () => {
    const { tokensDir, componentsDir } = await setup();
    const adapter = createRepoFsAdapter({ tokensDir, componentsDir });

    await adapter.saveComponent(demoComponent);
    await adapter.saveToken({ path: "color.brand", type: "color", value: "#5b5bd6" });

    const context = await adapter.loadContext();
    expect(context.capabilities.pageDesign).toBe(false);
    expect(context.capabilities.writeMode).toBe("repo");
    expect(context.components.map((component) => component.id)).toContain("demo");
    expect(context.tokenDocuments.length).toBeGreaterThan(0);
    await expect(stat(join(componentsDir, "demo.component.json"))).resolves.toBeDefined();
    await expect(stat(join(tokensDir, "editor.tokens.json"))).resolves.toBeDefined();
  });

  it("plans without writing on dry run", async () => {
    const { tokensDir, componentsDir } = await setup();
    const adapter = createRepoFsAdapter({ tokensDir, componentsDir });
    const result = await adapter.saveComponent(demoComponent, { dryRun: true });
    expect(result.dryRun).toBe(true);
    await expect(stat(join(componentsDir, "demo.component.json"))).rejects.toThrow();
  });

  it("upserts only the canonical token file, leaving other token files untouched", async () => {
    const { tokensDir, componentsDir } = await setup();
    // A token file whose name sorts BEFORE editor.tokens.json.
    await writeFile(
      join(tokensDir, "color.tokens.json"),
      `${JSON.stringify(
        {
          schemaVersion: PODO_SCHEMA_VERSION,
          kind: "tokens",
          category: "primitive",
          tokens: { color: { accent: { $type: "color", $value: "#000000" } } },
        },
        null,
        2
      )}\n`
    );
    const adapter = createRepoFsAdapter({ tokensDir, componentsDir });
    await adapter.saveToken({ path: "color.brand", type: "color", value: "#5b5bd6" });

    const colorDoc = JSON.parse(await readFile(join(tokensDir, "color.tokens.json"), "utf8")) as {
      tokens: { color: Record<string, { $value?: string }> };
    };
    expect(colorDoc.tokens.color.accent?.$value).toBe("#000000");
    expect(colorDoc.tokens.color.brand).toBeUndefined();

    const editorDoc = JSON.parse(await readFile(join(tokensDir, "editor.tokens.json"), "utf8")) as {
      tokens: { color: Record<string, { $value?: string }> };
    };
    expect(editorDoc.tokens.color.brand?.$value).toBe("#5b5bd6");
  });

  it("skips malformed JSON files instead of aborting the load", async () => {
    const { tokensDir, componentsDir } = await setup();
    await writeFile(join(tokensDir, "broken.json"), "{ not valid json");
    const adapter = createRepoFsAdapter({ tokensDir, componentsDir });
    const context = await adapter.loadContext();
    expect(context.tokenDocuments).toHaveLength(0);
  });

  it("reports and then clears a missing token binding via validate", async () => {
    const { tokensDir, componentsDir } = await setup();
    const adapter = createRepoFsAdapter({ tokensDir, componentsDir });

    await adapter.saveComponent(demoComponent);
    const before = await adapter.validate();
    expect(before.some((item) => item.code === "component.tokenBinding.missing")).toBe(true);

    await adapter.saveToken({ path: "color.brand", type: "color", value: "#5b5bd6" });
    const after = await adapter.validate();
    expect(after.some((item) => item.code === "component.tokenBinding.missing")).toBe(false);
  });
});
