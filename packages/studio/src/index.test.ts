import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createStudioApp,
  loadStudioContext,
  startStudioServer,
  validateStudioProject,
  type StudioBuildInput,
} from "./index.js";

describe("@podo/studio", () => {
  it("serves the shell and loads uninitialized project context", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const app = createStudioApp({ root });

    const htmlResponse = await app.request("/");
    const html = await htmlResponse.text();
    expect(html).toContain("Podo Studio");
    expect(html).toContain("/api/context");
    expect(html).toContain("/api/migration/plan");
    expect(html).toContain('<option value="{');

    const contextResponse = await app.request("/api/context");
    const payload = (await contextResponse.json()) as {
      context: { initialized: boolean; detectedTarget: string };
    };
    expect(payload.context.initialized).toBe(false);
    expect(payload.context.detectedTarget).toBe("react");
  });

  it("writes setup, project specs, icon sources, and local component templates", async () => {
    const root = await createProject({ dependencies: { hono: "^4.0.0" } });
    const buildCalls: StudioBuildInput[] = [];
    const app = createStudioApp({
      root,
      actions: {
        build: async (input) => {
          buildCalls.push(input);
          return {
            dryRun: Boolean(input.dryRun),
            skipped: false,
            hash: "studio-test",
            files: [{ path: "src/podo/tokens.css", action: "create" }],
          };
        },
      },
    });

    await expect(
      app.request("/api/setup", {
        method: "POST",
        body: JSON.stringify({
          target: "hono",
          theme: "landing",
          darkMode: true,
          outDir: "src/podo",
          iconGroups: ["navigation"],
          force: true,
        }),
        headers: { "content-type": "application/json" },
      })
    ).resolves.toMatchObject({ status: 200 });
    expect(buildCalls).toHaveLength(1);
    await expect(stat(join(root, ".podo/config.json"))).resolves.toBeDefined();
    await expect(stat(join(root, ".podo/icons/manifest.json"))).resolves.toBeDefined();

    const tokenContents = `${JSON.stringify(
      {
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "theme",
        tokens: {
          component: {
            button: {
              background: { $type: "color", $value: "{color.text}" },
            },
          },
        },
      },
      null,
      2
    )}\n`;
    const dryRun = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/themes/button.tokens.json",
        contents: tokenContents,
        dryRun: true,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(dryRun.status).toBe(200);
    await expect(stat(join(root, ".podo/themes/button.tokens.json"))).rejects.toThrow();

    const writeToken = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/themes/button.tokens.json",
        contents: tokenContents,
        force: true,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(writeToken.status).toBe(200);
    await expect(stat(join(root, ".podo/themes/button.tokens.json"))).resolves.toBeDefined();

    const colorOverride = await app.request("/api/tokens/override", {
      method: "POST",
      body: JSON.stringify({
        path: "component.button.text",
        type: "color",
        value: "#ffffff",
      }),
      headers: { "content-type": "application/json" },
    });
    expect(colorOverride.status).toBe(200);
    const typographyOverride = await app.request("/api/tokens/override", {
      method: "POST",
      body: JSON.stringify({
        path: "typography.h1.dashboard",
        type: "typography",
        value: JSON.stringify({
          fontFamily: "Pretendard",
          fontSize: "30px",
          lineHeight: "38px",
          fontWeight: 700,
          letterSpacing: "0px",
        }),
      }),
      headers: { "content-type": "application/json" },
    });
    expect(typographyOverride.status).toBe(200);
    const overrideDocument = JSON.parse(
      await readFile(join(root, ".podo/themes/studio-overrides.tokens.json"), "utf8")
    ) as {
      tokens: {
        component: { button: { text: { $value: string } } };
        typography: { h1: { dashboard: { $value: { fontSize: string } } } };
      };
    };
    expect(overrideDocument.tokens.component.button.text.$value).toBe("#ffffff");
    expect(overrideDocument.tokens.typography.h1.dashboard.$value.fontSize).toBe("30px");

    const component = await app.request("/api/components/local", {
      method: "POST",
      body: JSON.stringify({ template: "gnb", id: "main-gnb", force: true }),
      headers: { "content-type": "application/json" },
    });
    expect(component.status).toBe(200);
    expect(
      await readFile(join(root, ".podo/components/local/main-gnb.component.json"), "utf8")
    ).toContain("Global Navigation");
    const componentDocument = JSON.parse(
      await readFile(join(root, ".podo/components/local/main-gnb.component.json"), "utf8")
    ) as {
      props: Array<{ name: string; type: { kind: "boolean" } }>;
      tokens: Record<string, string>;
    };
    componentDocument.props.push({ name: "condensed", type: { kind: "boolean" } });
    componentDocument.tokens["item.color"] = "{color.brand}";
    const saveComponent = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/components/local/main-gnb.component.json",
        contents: `${JSON.stringify(componentDocument, null, 2)}\n`,
        force: true,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(saveComponent.status).toBe(200);

    await writeFile(
      join(root, ".podo/themes/legacy.tokens.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "tokens",
          category: "theme",
          tokens: {
            color: {
              primary: { $type: "color", $value: "#3366ff" },
              text: { $type: "color", $value: "{color.primary}" },
            },
          },
        },
        null,
        2
      )}\n`
    );
    await writeFile(
      join(root, ".podo/components/button.component.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "component",
          id: "button",
          name: "Button",
          category: "atom",
          status: "stable",
          anatomy: [{ name: "root" }],
          slots: [],
          props: [{ name: "isDisabled", type: { kind: "boolean" } }],
          variants: [],
          states: [],
          tokens: { "root.background": "{color.primary}" },
          targets: {
            web: { supported: true, limitations: [] },
            react: { supported: true, limitations: [] },
            hono: { supported: true, limitations: [] },
            native: { supported: true, limitations: [] },
          },
          accessibility: { aria: [], keyboard: [] },
          examples: [],
        },
        null,
        2
      )}\n`
    );
    const migrationPlanResponse = await app.request("/api/migration/plan", {
      method: "POST",
      body: JSON.stringify({ to: "2.1.0" }),
      headers: { "content-type": "application/json" },
    });
    expect(migrationPlanResponse.status).toBe(200);
    const migrationPlan = (await migrationPlanResponse.json()) as {
      plan: { files: Array<{ path: string; action: string }> };
    };
    expect(migrationPlan.plan.files.some((file) => file.action === "update")).toBe(true);
    const migrationApply = await app.request("/api/migration/apply", {
      method: "POST",
      body: JSON.stringify({ to: "2.1.0" }),
      headers: { "content-type": "application/json" },
    });
    expect(migrationApply.status).toBe(200);
    const migratedTokens = JSON.parse(
      await readFile(join(root, ".podo/themes/legacy.tokens.json"), "utf8")
    ) as { tokens: { color: Record<string, { $value: string }> } };
    const migratedButton = JSON.parse(
      await readFile(join(root, ".podo/components/button.component.json"), "utf8")
    ) as { props: Array<{ name: string }>; tokens: Record<string, string> };
    const migratedLock = JSON.parse(await readFile(join(root, ".podo/lock.json"), "utf8")) as {
      packageVersion: string;
    };
    expect(migratedTokens.tokens.color.brand?.$value).toBe("#3366ff");
    expect(migratedTokens.tokens.color.text?.$value).toBe("{color.brand}");
    expect(migratedButton.props[0]?.name).toBe("disabled");
    expect(migratedButton.tokens["root.background"]).toBe("{color.brand}");
    expect(migratedLock.packageVersion).toBe("2.1.0");

    const svg = await app.request("/api/icons/svg", {
      method: "POST",
      body: JSON.stringify({
        path: "custom/triangle.svg",
        contents: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4l8 16H4z"/></svg>',
        force: true,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(svg.status).toBe(200);
    await expect(stat(join(root, ".podo/icons/svg/custom/triangle.svg"))).resolves.toBeDefined();

    const context = await loadStudioContext(root);
    expect(context.initialized).toBe(true);
    expect(context.tokenPaths).toContain("component.button.background");
    expect(
      context.components.some((item) => item.id === "main-gnb" && item.source === "project")
    ).toBe(true);
    expect(context.components.find((item) => item.id === "main-gnb")?.tokens["item.color"]).toBe(
      "{color.brand}"
    );
    expect(context.files.some((file) => file.path === ".podo/themes/button.tokens.json")).toBe(
      true
    );
    await expect(validateStudioProject(root)).resolves.toMatchObject({ ok: true });

    await app.request("/api/components/local", {
      method: "POST",
      body: JSON.stringify({ template: "gnb", id: "button", force: true }),
      headers: { "content-type": "application/json" },
    });
    const dedupedContext = await loadStudioContext(root);
    const buttons = dedupedContext.components.filter((item) => item.id === "button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.source).toBe("project");
  });

  it("validates and surfaces installed-project pages in the context", async () => {
    const root = await createProject({});
    const app = createStudioApp({ root });
    await app.request("/api/components/local", {
      method: "POST",
      body: JSON.stringify({ template: "gnb", id: "gnb" }),
      headers: { "content-type": "application/json" },
    });

    const page = {
      schemaVersion: "2.0.0",
      kind: "page",
      id: "home",
      name: "Home",
      root: { type: "component-instance", component: "gnb" },
    };
    const put = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({ path: ".podo/pages/home.page.json", contents: JSON.stringify(page) }),
      headers: { "content-type": "application/json" },
    });
    expect(put.status).toBe(200);
    await expect(stat(join(root, ".podo/pages/home.page.json"))).resolves.toBeDefined();

    const context = await loadStudioContext(root);
    expect(context.pages.some((item) => item.id === "home")).toBe(true);
    expect(
      context.files.some(
        (file) => file.path === ".podo/pages/home.page.json" && file.kind === "page"
      )
    ).toBe(true);

    // A schema-invalid page is rejected by the write validation.
    const bad = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/pages/bad.page.json",
        contents: JSON.stringify({ kind: "page" }),
      }),
      headers: { "content-type": "application/json" },
    });
    expect(bad.status).toBe(400);
  });

  it("connects validate and build APIs and rejects writes outside .podo", async () => {
    const root = await createProject({});
    const app = createStudioApp({
      root,
      actions: {
        build: async (input) => ({
          dryRun: Boolean(input.dryRun),
          skipped: false,
          hash: "hash",
          files: [{ path: "src/podo/icons/PodoIcons.woff2", action: "create" }],
        }),
        validate: async () => ({ ok: true, root, issues: [] }),
      },
    });

    const unsafe = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({ path: "package.json", contents: "{}" }),
      headers: { "content-type": "application/json" },
    });
    expect(unsafe.status).toBe(500);

    const editorExportContents = `${JSON.stringify(createEditorExportedComponent("banner"), null, 2)}\n`;
    const editorDryRun = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/components/editor/banner.component.json",
        contents: editorExportContents,
        dryRun: true,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(editorDryRun.status).toBe(200);
    const editorDryRunPayload = (await editorDryRun.json()) as {
      dryRun: boolean;
      filePlan: {
        path: string;
        action: string;
        changed: boolean;
        preview: { before: string; after: string };
      };
    };
    expect(editorDryRunPayload.dryRun).toBe(true);
    expect(editorDryRunPayload.filePlan).toMatchObject({
      path: ".podo/components/editor/banner.component.json",
      action: "create",
      changed: true,
    });
    expect(editorDryRunPayload.filePlan.preview.after).toContain('"id": "banner"');
    await expect(
      stat(join(root, ".podo/components/editor/banner.component.json"))
    ).rejects.toThrow();

    const editorWrite = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/components/editor/banner.component.json",
        contents: editorExportContents,
      }),
      headers: { "content-type": "application/json" },
    });
    expect(editorWrite.status).toBe(200);
    await expect(
      stat(join(root, ".podo/components/editor/banner.component.json"))
    ).resolves.toBeDefined();

    const editorOverwriteDryRun = await app.request("/api/files", {
      method: "PUT",
      body: JSON.stringify({
        path: ".podo/components/editor/banner.component.json",
        contents: `${JSON.stringify(createEditorExportedComponent("banner", "Banner Updated"), null, 2)}\n`,
        dryRun: true,
      }),
      headers: { "content-type": "application/json" },
    });
    const editorOverwritePayload = (await editorOverwriteDryRun.json()) as {
      filePlan: { action: string; preview: { before: string; after: string } };
    };
    expect(editorOverwritePayload.filePlan.action).toBe("update");
    expect(editorOverwritePayload.filePlan.preview.before).toContain('"name": "Banner"');
    expect(editorOverwritePayload.filePlan.preview.after).toContain('"name": "Banner Updated"');

    const validation = await app.request("/api/validate", {
      method: "POST",
      body: "{}",
      headers: { "content-type": "application/json" },
    });
    expect(validation.status).toBe(200);

    const buildResponse = await app.request("/api/build", {
      method: "POST",
      body: JSON.stringify({ dryRun: true }),
      headers: { "content-type": "application/json" },
    });
    const build = (await buildResponse.json()) as { result: { files: Array<{ path: string }> } };
    expect(build.result.files[0]?.path).toContain("PodoIcons.woff2");
  });

  it("starts and closes a local Hono server", async () => {
    const root = await createProject({});
    const server = await startStudioServer({ root, port: 0 });
    expect(server.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    await server.close();
  });
});

async function createProject(packageJson: Record<string, unknown>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "podo-studio-"));
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({ name: "fixture", type: "module", ...packageJson }, null, 2)}\n`
  );
  return root;
}

function createEditorExportedComponent(id: string, name = "Banner") {
  return {
    schemaVersion: "2.0.0",
    kind: "component",
    id,
    name,
    category: "atom",
    status: "stable",
    anatomy: [{ name: "root" }],
    slots: [],
    props: [{ name: "title", type: { kind: "string" }, required: true }],
    variants: [],
    states: [],
    tokens: {},
    targets: {
      web: { supported: true, limitations: [] },
      react: { supported: true, limitations: [] },
      hono: { supported: true, limitations: [] },
      native: { supported: true, limitations: [] },
    },
    accessibility: { aria: [], keyboard: [] },
    examples: [
      {
        target: "web",
        title: `${name} editor export`,
        code: `<podo-${id}></podo-${id}>`,
      },
    ],
  };
}
