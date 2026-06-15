import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildProject,
  findProjectRoot,
  parseArgs,
  runCli,
  validateProject,
  type CliIO,
} from "./index.js";

describe("@podo/cli", () => {
  it("parses commands and finds project roots", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    expect(parseArgs(["init", "--target", "react"]).command).toBe("init");
    expect(parseArgs(["build", "--dry-run"]).options["dry-run"]).toBe(true);
    expect(await findProjectRoot(join(root, "src"))).toBe(root);
  });

  it("initializes .podo non-interactively and validates the project", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);

    await expect(
      runCli(
        ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
        io
      )
    ).resolves.toBe(0);

    const config = JSON.parse(await readFile(join(root, ".podo/config.json"), "utf8")) as {
      environment: string;
      build: { targets: string[]; outDir: string };
    };
    expect(config.environment).toBe("react");
    expect(config.build).toEqual({ targets: ["react"], outDir: "src/podo" });
    await expect(stat(join(root, ".podo/bootstrap/react.tsx"))).resolves.toBeDefined();

    const report = await validateProject(parseArgs(["validate"]), io);
    expect(report.ok).toBe(true);
  });

  it("builds tokens, icons, components, dry-runs, and uses cache", async () => {
    const root = await createProject({ dependencies: { hono: "^4.0.0" } });
    const io = createIo(root);
    await runCli(
      [
        "init",
        "--target",
        "hono",
        "--theme",
        "landing",
        "--out-dir",
        "src/generated/podo",
        "--yes",
      ],
      io
    );
    await writeFile(
      join(root, ".podo/themes/button.tokens.json"),
      `${JSON.stringify(
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
      )}\n`
    );
    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(true);

    await expect(runCli(["build", "--dry-run"], io)).resolves.toBe(0);
    expect(
      io.out.some((line) => line.includes("[podo:plan] create src/generated/podo/tokens.css"))
    ).toBe(true);

    const dryRun = await buildProject(parseArgs(["build", "--dry-run"]), io);
    expect(dryRun.dryRun).toBe(true);
    expect(dryRun.files.some((file) => file.path.endsWith("tokens.css"))).toBe(true);
    expect(dryRun.files.some((file) => file.path.endsWith("PodoIcons.woff2"))).toBe(true);
    await expect(stat(join(root, "src/generated/podo/tokens.css"))).rejects.toThrow();
    await expect(stat(join(root, ".podo/cache/default-icons"))).rejects.toThrow();

    const built = await buildProject(parseArgs(["build"]), io);
    expect(built.skipped).toBe(false);
    await expect(stat(join(root, "src/generated/podo/tokens.css"))).resolves.toBeDefined();
    expect(await readFile(join(root, "src/generated/podo/tokens.css"), "utf8")).toContain(
      "--podo-component-button-background: #14151A;"
    );
    await expect(
      stat(join(root, "src/generated/podo/components/hono/button.hono.ts"))
    ).resolves.toBeDefined();
    await expect(
      stat(join(root, "src/generated/podo/icons/PodoIcons.woff2"))
    ).resolves.toBeDefined();

    const cached = await buildProject(parseArgs(["build"]), io);
    expect(cached.skipped).toBe(true);
  });

  it("builds the react-native target and reflects token overrides", async () => {
    const root = await createProject({ dependencies: { "react-native": "^0.76.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "native", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    await writeFile(
      join(root, ".podo/themes/brand.tokens.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "tokens",
          category: "theme",
          tokens: {
            component: { button: { background: { $type: "color", $value: "#abcdef" } } },
          },
        },
        null,
        2
      )}\n`
    );
    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(true);

    const built = await buildProject(parseArgs(["build"]), io);
    expect(built.skipped).toBe(false);
    // React Native token object is generated and reflects the .podo override.
    await expect(stat(join(root, "src/podo/tokens.native.ts"))).resolves.toBeDefined();
    expect(
      (await readFile(join(root, "src/podo/tokens.native.ts"), "utf8")).toLowerCase()
    ).toContain("#abcdef");
    // The native component renderer is generated for the native target.
    await expect(
      stat(join(root, "src/podo/components/native/button.native.ts"))
    ).resolves.toBeDefined();
  });

  it("builds installed-project pages and reflects page edits", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    await mkdir(join(root, ".podo/pages"), { recursive: true });
    await writeFile(
      join(root, ".podo/pages/home.page.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "page",
          id: "home",
          name: "Home",
          route: "/",
          root: {
            type: "layout",
            layout: { mode: "grid", gap: "{spacing.scale-2}", columns: 12 },
            children: [
              {
                type: "component-instance",
                id: "cta",
                component: "button",
                props: { variant: "solid" },
              },
            ],
          },
        },
        null,
        2
      )}\n`
    );

    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(true);
    const built = await buildProject(parseArgs(["build"]), io);
    expect(built.skipped).toBe(false);
    await expect(stat(join(root, "src/podo/pages.json"))).resolves.toBeDefined();
    const pages = JSON.parse(await readFile(join(root, "src/podo/pages.json"), "utf8")) as Array<{
      id: string;
    }>;
    expect(pages[0]?.id).toBe("home");

    // Deleting all pages must reflect in the build output (no stale bundle).
    await rm(join(root, ".podo/pages/home.page.json"));
    const rebuilt = await buildProject(parseArgs(["build", "--force"]), io);
    expect(rebuilt.skipped).toBe(false);
    expect(JSON.parse(await readFile(join(root, "src/podo/pages.json"), "utf8"))).toEqual([]);
  });

  it("emits a component CSS layer reflecting variant token bindings", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    await mkdir(join(root, ".podo/components"), { recursive: true });
    await writeFile(
      join(root, ".podo/components/card.component.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "component",
          id: "card",
          name: "Card",
          category: "atom",
          status: "stable",
          anatomy: [{ name: "root" }],
          tokens: { "root.background": "{color.text}" },
          variants: [
            {
              name: "tone",
              values: ["solid", "soft"],
              default: "solid",
              valueTokens: { soft: { "root.background": "{color.text}" } },
            },
          ],
          states: [],
          targets: {
            web: { supported: true, limitations: [] },
            react: { supported: true, limitations: [] },
            hono: { supported: true, limitations: [] },
            native: { supported: true, limitations: [] },
          },
          accessibility: { aria: [], keyboard: [] },
        },
        null,
        2
      )}\n`
    );

    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(true);
    const built = await buildProject(parseArgs(["build"]), io);
    expect(built.skipped).toBe(false);
    const css = await readFile(join(root, "src/podo/components.css"), "utf8");
    expect(css).toContain(".podo-card {");
    expect(css).toContain("--podo-card-root-background: var(--podo-color-text);");
    expect(css).toContain('.podo-card[data-tone="soft"] {');
  });

  it("fails the build when a component binding references a missing token", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    await mkdir(join(root, ".podo/components"), { recursive: true });
    await writeFile(
      join(root, ".podo/components/broken.component.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "component",
          id: "broken",
          name: "Broken",
          category: "atom",
          status: "stable",
          anatomy: [{ name: "root" }],
          tokens: { "root.background": "{color.does-not-exist}" },
          variants: [],
          states: [],
          targets: {
            web: { supported: true, limitations: [] },
            react: { supported: true, limitations: [] },
            hono: { supported: true, limitations: [] },
            native: { supported: true, limitations: [] },
          },
          accessibility: { aria: [], keyboard: [] },
        },
        null,
        2
      )}\n`
    );

    await expect(buildProject(parseArgs(["build"]), io)).rejects.toThrow(/Component build failed/);
  });

  it("fails the build when a component binds a token path shadowed away by merge", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    // a-base defines color.accent.light (nested); b-override replaces color.accent
    // with a leaf, so after merge color.accent.light no longer exists.
    await writeFile(
      join(root, ".podo/tokens/a-base.tokens.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "tokens",
          category: "primitive",
          tokens: { color: { accent: { light: { $type: "color", $value: "#ffffff" } } } },
        },
        null,
        2
      )}\n`
    );
    await writeFile(
      join(root, ".podo/tokens/b-override.tokens.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "tokens",
          category: "primitive",
          tokens: { color: { accent: { $type: "color", $value: "#000000" } } },
        },
        null,
        2
      )}\n`
    );
    await mkdir(join(root, ".podo/components"), { recursive: true });
    await writeFile(
      join(root, ".podo/components/card.component.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "component",
          id: "card",
          name: "Card",
          category: "atom",
          status: "stable",
          anatomy: [{ name: "root" }],
          tokens: { "root.background": "{color.accent.light}" },
          variants: [],
          states: [],
          targets: {
            web: { supported: true, limitations: [] },
            react: { supported: true, limitations: [] },
            hono: { supported: true, limitations: [] },
            native: { supported: true, limitations: [] },
          },
          accessibility: { aria: [], keyboard: [] },
        },
        null,
        2
      )}\n`
    );

    // color.accent.light exists in a source (union) but not after merge -> must fail.
    await expect(buildProject(parseArgs(["build"]), io)).rejects.toThrow(/Component build failed/);
    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(false);
  });

  it("fails validate and build when a page references a missing component", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );
    await mkdir(join(root, ".podo/pages"), { recursive: true });
    await writeFile(
      join(root, ".podo/pages/bad.page.json"),
      `${JSON.stringify(
        {
          schemaVersion: "2.0.0",
          kind: "page",
          id: "bad",
          name: "Bad",
          root: { type: "component-instance", component: "does-not-exist" },
        },
        null,
        2
      )}\n`
    );

    expect((await validateProject(parseArgs(["validate"]), io)).ok).toBe(false);
    await expect(buildProject(parseArgs(["build"]), io)).rejects.toThrow(/Page build failed/);
  });

  it("carries editor component exports through validate, build, and update dry-run", async () => {
    const root = await createProject({ dependencies: { react: "^19.0.0" } });
    const io = createIo(root);
    await runCli(
      ["init", "--target", "react", "--theme", "dashboard", "--out-dir", "src/podo", "--yes"],
      io
    );

    const editorExport = createEditorButtonExportFile();
    await mkdir(join(root, ".podo/components/editor"), { recursive: true });
    await writeFile(join(root, editorExport.path), editorExport.contents);

    await expect(validateProject(parseArgs(["validate"]), io)).resolves.toMatchObject({
      ok: true,
    });

    const dryRun = await buildProject(parseArgs(["build", "--dry-run"]), io);
    const generatedButton = dryRun.files.find(
      (file) => file.path === "src/podo/components/react/button.react.ts"
    );
    expect(dryRun.dryRun).toBe(true);
    expect(generatedButton?.preview).toContain('export { Button } from "@podo/react";');
    await expect(stat(join(root, "src/podo/components/react/button.react.ts"))).rejects.toThrow();

    const built = await buildProject(parseArgs(["build"]), io);
    expect(built.skipped).toBe(false);
    await expect(
      stat(join(root, "src/podo/components/react/button.react.ts"))
    ).resolves.toBeDefined();

    await expect(
      runCli(["update", "--dry-run", "--to", "2.1.0", "--report", ".podo/update-report.json"], io)
    ).resolves.toBe(0);
    const updateReport = JSON.parse(
      await readFile(join(root, ".podo/update-report.json"), "utf8")
    ) as {
      dryRun: boolean;
      files: Array<{ path: string; action: string; operations: Array<{ path: string }> }>;
    };
    const editorComponentUpdate = updateReport.files.find(
      (file) => file.path === ".podo/components/editor/button.component.json"
    );
    expect(updateReport.dryRun).toBe(true);
    expect(editorComponentUpdate).toMatchObject({ action: "update" });
    expect(editorComponentUpdate?.operations[0]?.path).toBe("/props/0/name");
    expect(
      JSON.parse(await readFile(join(root, editorExport.path), "utf8")) as {
        props: Array<{ name: string }>;
      }
    ).toMatchObject({ props: [{ name: "isDisabled" }] });

    const bannerExport = createEditorBannerExportFile();
    await writeFile(join(root, bannerExport.path), bannerExport.contents);
    await expect(buildProject(parseArgs(["build"]), io)).rejects.toThrow(/Build would update/);
    const changedDryRun = await buildProject(parseArgs(["build", "--dry-run"]), io);
    expect(changedDryRun.files.some((file) => file.action === "update")).toBe(true);
    await expect(buildProject(parseArgs(["build", "--force"]), io)).resolves.toMatchObject({
      skipped: false,
    });
    await expect(
      stat(join(root, "src/podo/components/react/banner.react.ts"))
    ).resolves.toBeDefined();
  });

  it("plans and applies migrations with lockfile updates", async () => {
    const root = await createProject({});
    const io = createIo(root);
    await runCli(["init", "--target", "web", "--yes"], io);
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

    await expect(
      runCli(
        ["update", "--dry-run", "--to", "2.1.0", "--report", ".podo/migration-report.json"],
        io
      )
    ).resolves.toBe(0);
    expect(io.out.some((line) => line.includes("[podo:plan] update .podo/themes"))).toBe(true);
    const migrationReport = JSON.parse(
      await readFile(join(root, ".podo/migration-report.json"), "utf8")
    ) as { dryRun: boolean; files: Array<{ path: string; action: string }> };
    expect(migrationReport.dryRun).toBe(true);
    expect(
      migrationReport.files.some(
        (file) => file.path === ".podo/themes/legacy.tokens.json" && file.action === "update"
      )
    ).toBe(true);

    await expect(runCli(["migrate", "--to", "2.1.0"], io)).resolves.toBe(0);
    const tokenDocument = JSON.parse(
      await readFile(join(root, ".podo/themes/legacy.tokens.json"), "utf8")
    ) as { tokens: { color: Record<string, { $value: string }> } };
    const componentDocument = JSON.parse(
      await readFile(join(root, ".podo/components/button.component.json"), "utf8")
    ) as { props: Array<{ name: string }>; tokens: Record<string, string> };
    const lock = JSON.parse(await readFile(join(root, ".podo/lock.json"), "utf8")) as {
      packageVersion: string;
      migrations: Array<{ to: string; status: string }>;
    };
    expect(tokenDocument.tokens.color.brand?.$value).toBe("#3366ff");
    expect(tokenDocument.tokens.color.text?.$value).toBe("{color.brand}");
    expect(componentDocument.props[0]?.name).toBe("disabled");
    expect(componentDocument.tokens["root.background"]).toBe("{color.brand}");
    expect(lock.packageVersion).toBe("2.1.0");
    expect(lock.migrations.at(-1)).toMatchObject({ to: "2.1.0", status: "applied" });
  });

  it("writes validation reports and keeps service commands routable", async () => {
    const root = await createProject({});
    const io = createIo(root);
    await runCli(["init", "--target", "web", "--yes"], io);

    const code = await runCli(["validate", "--report", ".podo/validation-report.json"], io);
    expect(code).toBe(0);
    expect(
      JSON.parse(await readFile(join(root, ".podo/validation-report.json"), "utf8"))
    ).toMatchObject({
      ok: true,
    });
    await expect(runCli(["ui", "--dry-run"], io)).resolves.toBe(0);
    expect(io.out.some((line) => line.includes("Would start Podo Studio"))).toBe(true);
    await expect(runCli(["mcp", "--dry-run"], io)).resolves.toBe(0);
    expect(io.out.some((line) => line.includes("Would start Podo MCP"))).toBe(true);
  });
});

async function createProject(packageJson: Record<string, unknown>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "podo-cli-"));
  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify({ name: "fixture", type: "module", ...packageJson }, null, 2)}\n`
  );
  return root;
}

function createIo(root: string): CliIO & { out: string[]; err: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  return {
    cwd: root,
    stdout: { log: (message: string) => out.push(message) },
    stderr: { error: (message: string) => err.push(message) },
    out,
    err,
  };
}

function createEditorButtonExportFile(): { path: string; contents: string } {
  return {
    path: ".podo/components/editor/button.component.json",
    contents: `${JSON.stringify(
      {
        schemaVersion: "2.0.0",
        kind: "component",
        id: "button",
        name: "Button",
        category: "atom",
        status: "stable",
        anatomy: [{ name: "root" }, { name: "label" }],
        slots: [{ name: "children", required: true }],
        props: [{ name: "isDisabled", type: { kind: "boolean" }, default: false }],
        variants: [{ name: "variant", values: ["solid", "soft"], default: "solid" }],
        states: [{ name: "disabled" }],
        tokens: {
          "root.background": "{component.button.background}",
          "label.color": "{component.button.text}",
        },
        targets: {
          web: { supported: true, limitations: [] },
          react: { supported: true, limitations: [] },
          hono: { supported: true, limitations: [] },
          native: { supported: true, limitations: [] },
        },
        accessibility: { role: "button", aria: ["aria-disabled"], keyboard: ["Enter", "Space"] },
        examples: [
          {
            target: "web",
            title: "Button editor export",
            code: '<button data-podo-component="button">Submit</button>',
          },
        ],
      },
      null,
      2
    )}\n`,
  };
}

function createEditorBannerExportFile(): { path: string; contents: string } {
  return {
    path: ".podo/components/editor/banner.component.json",
    contents: `${JSON.stringify(
      {
        schemaVersion: "2.0.0",
        kind: "component",
        id: "banner",
        name: "Banner",
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
            title: "Banner editor export",
            code: "<podo-banner></podo-banner>",
          },
        ],
      },
      null,
      2
    )}\n`,
  };
}
