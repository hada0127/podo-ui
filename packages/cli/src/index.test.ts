import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
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
