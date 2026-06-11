import { mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
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

  it("writes validation reports and keeps registered future commands routable", async () => {
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
