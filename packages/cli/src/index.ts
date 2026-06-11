#!/usr/bin/env node

import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as nodeStdin, stdout as nodeStdout } from "node:process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseComponentDocument,
  parseIconManifest,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  validateComponentTokenBindings,
  validateIconManifest,
  collectTokenPaths,
  PODO_SCHEMA_VERSION,
  type ComponentDocument,
  type IconManifest,
  type PodoConfig,
  type PodoLock,
  type TokenDocument,
  type ValidationIssue,
} from "@podo/spec";
import {
  emitCssVariables,
  emitReactNativeTokens,
  emitTokenJsonBundle,
  emitTypeScriptTokens,
  loadTokenDocuments,
  mergeTokenDocuments,
  resolveTokenDocument,
  validateTokenBuild,
  type TokenSource,
} from "@podo/tokens";
import { buildIconAssets, emitIconCss, emitIconTypes, emitNativeGlyphMap } from "@podo/icons";
import { generateComponentFiles, generateIndexFile, type CodegenTarget } from "@podo/codegen";

export const packageName = "@podo/cli";

export type CliCommandName = "init" | "build" | "validate" | "ui" | "update" | "migrate" | "mcp";

export interface CliIO {
  cwd: string;
  stdout: Pick<typeof console, "log">;
  stderr: Pick<typeof console, "error">;
  stdin?: NodeJS.ReadStream;
}

export interface ParsedArgs {
  command?: CliCommandName | undefined;
  options: Record<string, string | boolean>;
  positionals: string[];
}

export interface InitOptions {
  environment: PodoConfig["environment"];
  target: CodegenTarget;
  theme: string;
  darkMode: boolean;
  outDir: string;
  force: boolean;
}

export interface BuildPlan {
  dryRun: boolean;
  skipped: boolean;
  hash: string;
  files: Array<{ path: string; action: "create" | "update" }>;
}

export interface ValidationReport {
  ok: boolean;
  root: string;
  issues: ValidationIssue[];
}

const commandNames: CliCommandName[] = [
  "init",
  "build",
  "validate",
  "ui",
  "update",
  "migrate",
  "mcp",
];

export async function runCli(
  argv = process.argv.slice(2),
  io: CliIO = defaultIo()
): Promise<number> {
  const args = parseArgs(argv);
  if (!args.command || args.options.help) {
    io.stdout.log(helpText());
    return 0;
  }

  try {
    if (args.command === "init") {
      await initProject(args, io);
      return 0;
    }
    if (args.command === "build") {
      await buildProject(args, io);
      return 0;
    }
    if (args.command === "validate") {
      const report = await validateProject(args, io);
      if (!report.ok) {
        logIssues(report.issues, io);
        return 1;
      }
      io.stdout.log(formatInfo("validate", "No validation issues found."));
      return 0;
    }

    io.stdout.log(
      formatInfo(args.command, `${args.command} is registered but not implemented in Phase 4.`)
    );
    return 0;
  } catch (error) {
    io.stderr.error(formatError(args.command, error));
    return 1;
  }
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [maybeCommand, ...rest] = argv;
  const command = commandNames.includes(maybeCommand as CliCommandName)
    ? (maybeCommand as CliCommandName)
    : undefined;
  const tokens = command ? rest : argv;
  const options: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token?.startsWith("--")) {
      if (token) {
        positionals.push(token);
      }
      continue;
    }

    const key = token.slice(2);
    const next = tokens[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }

  return { command, options, positionals };
}

export async function findProjectRoot(start: string): Promise<string> {
  let current = resolve(start);
  while (true) {
    if ((await exists(join(current, "package.json"))) || (await exists(join(current, ".git")))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return resolve(start);
    }
    current = parent;
  }
}

export async function loadConfig(root: string): Promise<PodoConfig> {
  const configPath = join(root, ".podo/config.json");
  if (!(await exists(configPath))) {
    throw new Error(
      ".podo/config.json was not found. Run `podo init --target react --theme dashboard` first."
    );
  }

  return parsePodoConfig(JSON.parse(await readFile(configPath, "utf8")));
}

export async function initProject(args: ParsedArgs, io: CliIO): Promise<void> {
  const root = await findProjectRoot(io.cwd);
  const options = await resolveInitOptions(args, root, io);
  const podoRoot = join(root, ".podo");
  const directories = [
    podoRoot,
    join(podoRoot, "tokens"),
    join(podoRoot, "themes"),
    join(podoRoot, "components"),
    join(podoRoot, "icons"),
    join(podoRoot, "icons/svg"),
    join(podoRoot, "generated"),
    join(podoRoot, "cache"),
    join(podoRoot, "bootstrap"),
  ];

  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }

  const config: PodoConfig = {
    schemaVersion: PODO_SCHEMA_VERSION,
    environment: options.environment,
    darkMode: {
      enabled: options.darkMode,
      strategy: options.environment === "react-native" ? "native" : "data-attribute",
    },
    themes: {
      default: options.theme,
      available: ["landing", "dashboard", "custom"],
    },
    build: {
      targets: [options.target],
      outDir: options.outDir,
    },
  };
  const lock: PodoLock = {
    schemaVersion: PODO_SCHEMA_VERSION,
    packageVersion: "0.0.0",
    migrations: [],
    generatedHash: hashJson(config),
  };

  await writeJson(join(podoRoot, "config.json"), config, options.force);
  await writeJson(join(podoRoot, "lock.json"), lock, options.force);
  await writeBootstrapFiles(root, options, options.force);
  io.stdout.log(formatInfo("init", `Initialized .podo for ${options.environment}.`));
}

export async function buildProject(args: ParsedArgs, io: CliIO): Promise<BuildPlan> {
  const root = await findProjectRoot(io.cwd);
  const config = await loadConfig(root);
  const targetOption = stringOption(args, "target");
  const targets = targetOption ? [toTarget(targetOption)] : config.build.targets.map(toTarget);
  const outDir = stringOption(args, "out-dir") ?? config.build.outDir;
  const dryRun = Boolean(args.options["dry-run"]);
  const force = Boolean(args.options.force);
  const absoluteOutDir = resolve(root, outDir);
  const podoRoot = join(root, ".podo");
  const tokenSources = await loadBuildTokenSources(root);
  const tokenIssues = validateTokenBuild(tokenSources);
  if (tokenIssues.length) {
    throw new Error(`Token build failed:\n${tokenIssues.map((issue) => issue.message).join("\n")}`);
  }

  const merged = mergeTokenDocuments(tokenSources);
  const resolved = resolveTokenDocument(merged);
  const components = await loadBuildComponents(root);
  const iconManifest = await loadBuildIconManifest(root);
  const generated = [
    {
      path: join(absoluteOutDir, "tokens.css"),
      contents: emitCssVariables(resolved, {
        themes: config.themes.available,
        colorSchemes: config.darkMode.enabled ? ["light", "dark"] : ["light"],
      }),
    },
    { path: join(absoluteOutDir, "tokens.ts"), contents: emitTypeScriptTokens(resolved) },
    { path: join(absoluteOutDir, "tokens.native.ts"), contents: emitReactNativeTokens(resolved) },
    { path: join(absoluteOutDir, "tokens.json"), contents: emitTokenJsonBundle(resolved) },
    {
      path: join(absoluteOutDir, "icons/PodoIcons.css"),
      contents: emitIconCss(iconManifest),
    },
    {
      path: join(absoluteOutDir, "icons/PodoIcons.icons.ts"),
      contents: emitIconTypes(Object.keys(iconManifest.icons).sort()),
    },
    {
      path: join(absoluteOutDir, "icons/PodoIcons.native.ts"),
      contents: emitNativeGlyphMap(iconManifest),
    },
    ...generateComponentFiles({
      specs: components,
      targets,
      outDir: join(outDir, "components"),
    }).map((file) => ({ path: resolve(root, file.path), contents: file.contents })),
  ];
  generated.push({
    path: resolve(root, join(outDir, "components/index.ts")),
    contents: generateIndexFile(
      generated
        .filter((file) => file.path.includes(`${outDir}/components/`))
        .map((file) => ({ path: relativePath(root, file.path), contents: file.contents })),
      join(outDir, "components")
    ).contents,
  });

  const buildHash = hashJson({
    config,
    targets,
    iconInput: await readIconInputHash(root, iconManifest),
    generated: generated.map((file) => file.contents),
  });
  const cachePath = join(podoRoot, "cache/build.json");
  const cached = await readJson<{ hash?: string }>(cachePath);
  const plan: BuildPlan = {
    dryRun,
    skipped: !force && cached?.hash === buildHash,
    hash: buildHash,
    files: await Promise.all(
      [
        ...generated.map((file) => file.path),
        join(absoluteOutDir, "icons/PodoIcons.woff"),
        join(absoluteOutDir, "icons/PodoIcons.woff2"),
        join(absoluteOutDir, "icons/PodoIcons.metadata.json"),
      ].map(async (filePath) => ({
        path: relativePath(root, filePath),
        action: (await exists(filePath)) ? "update" : "create",
      }))
    ),
  };

  if (plan.skipped) {
    io.stdout.log(formatInfo("build", "Skipped because input hash did not change."));
    return plan;
  }

  if (dryRun) {
    io.stdout.log(formatInfo("build", `Dry run planned ${plan.files.length} files.`));
    for (const file of plan.files) {
      io.stdout.log(`[podo:plan] ${file.action} ${file.path}`);
    }
    return plan;
  }

  await mkdir(absoluteOutDir, { recursive: true });
  for (const file of generated) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.contents);
  }
  const iconSvgRoot = await resolveIconSvgRoot(root, iconManifest);
  await buildIconAssets({
    manifest: iconManifest,
    svgRoot: iconSvgRoot,
    outDir: join(absoluteOutDir, "icons"),
    fontTypes: ["woff", "woff2"],
  });
  await writeJson(cachePath, { hash: buildHash, files: plan.files }, true);
  await writeJson(
    join(podoRoot, "lock.json"),
    {
      schemaVersion: PODO_SCHEMA_VERSION,
      packageVersion: "0.0.0",
      migrations: [],
      generatedHash: buildHash,
    } satisfies PodoLock,
    true
  );
  io.stdout.log(formatInfo("build", `Generated ${plan.files.length} files in ${outDir}.`));
  return plan;
}

export async function validateProject(args: ParsedArgs, io: CliIO): Promise<ValidationReport> {
  const root = await findProjectRoot(io.cwd);
  const issues: ValidationIssue[] = [];
  const podoRoot = join(root, ".podo");
  await validateJsonFile(join(podoRoot, "config.json"), "podo.config", parsePodoConfig, issues);
  const rawLock = await readJson<Record<string, unknown>>(join(podoRoot, "lock.json"));
  if (rawLock?.schemaVersion && rawLock.schemaVersion !== PODO_SCHEMA_VERSION) {
    issues.push({
      code: "podo.lock.schemaMismatch",
      path: ".podo/lock.json",
      message: `Lock schema ${String(rawLock.schemaVersion)} does not match ${PODO_SCHEMA_VERSION}. Run podo migrate.`,
    });
  } else {
    await validateJsonFile(join(podoRoot, "lock.json"), "podo.lock", parsePodoLock, issues);
  }

  const tokenSources = await loadBuildTokenSources(root);
  issues.push(...validateTokenBuild(tokenSources));

  const components = await loadBuildComponents(root);
  const tokenPaths = tokenSources.flatMap((source) => collectTokenPaths(source.document.tokens));
  for (const component of components) {
    issues.push(...validateComponentTokenBindings(component, tokenPaths));
  }

  const manifest = await loadBuildIconManifest(root);
  issues.push(...validateIconManifest(manifest));

  const report = { ok: issues.length === 0, root, issues };
  const reportPath = stringOption(args, "report");
  if (reportPath) {
    await mkdir(dirname(resolve(root, reportPath)), { recursive: true });
    await writeFile(resolve(root, reportPath), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (report.ok) {
    io.stdout.log(formatInfo("validate", "No validation issues found."));
  }
  return report;
}

export function detectFramework(packageJson: Record<string, unknown>): InitOptions["target"] {
  const dependencies = {
    ...(isRecord(packageJson.dependencies) ? packageJson.dependencies : {}),
    ...(isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {}),
  };
  if ("react-native" in dependencies || "expo" in dependencies) {
    return "native";
  }
  if ("hono" in dependencies) {
    return "hono";
  }
  if ("react" in dependencies) {
    return "react";
  }
  return "web";
}

async function resolveInitOptions(args: ParsedArgs, root: string, io: CliIO): Promise<InitOptions> {
  const packageJson = (await readJson<Record<string, unknown>>(join(root, "package.json"))) ?? {};
  const detected = detectFramework(packageJson);
  const target = toTarget(stringOption(args, "target") ?? detected);
  const base: InitOptions = {
    target,
    environment: target === "native" ? "react-native" : target,
    theme: stringOption(args, "theme") ?? "dashboard",
    darkMode: parseBooleanOption(args.options["dark-mode"], true),
    outDir: stringOption(args, "out-dir") ?? "src/podo",
    force: Boolean(args.options.force),
  };

  if (args.options.yes || args.options.target || !io.stdin?.isTTY) {
    return base;
  }

  const rl = createInterface({ input: io.stdin, output: nodeStdout });
  try {
    const targetAnswer = await rl.question(`Target (${base.target}): `);
    const themeAnswer = await rl.question(`Theme (${base.theme}): `);
    const darkAnswer = await rl.question(`Dark mode (${base.darkMode ? "yes" : "no"}): `);
    const outDirAnswer = await rl.question(`Out dir (${base.outDir}): `);
    const interactiveTarget = toTarget(targetAnswer.trim() || base.target);
    return {
      target: interactiveTarget,
      environment: interactiveTarget === "native" ? "react-native" : interactiveTarget,
      theme: themeAnswer.trim() || base.theme,
      darkMode: parseBooleanOption(darkAnswer.trim() || undefined, base.darkMode),
      outDir: outDirAnswer.trim() || base.outDir,
      force: base.force,
    };
  } finally {
    rl.close();
  }
}

async function loadBuildTokenSources(root: string): Promise<TokenSource[]> {
  const projectTokensDir = join(root, ".podo/tokens");
  const projectThemesDir = join(root, ".podo/themes");
  const sources: TokenSource[] = [
    {
      document: parseTokenDocument(defaultTokenDocument),
      filePath: "podo:default-tokens",
      tier: "package",
    },
  ];
  const projectTokens = await loadTokenDocuments({
    packageTokensDir: "__podo_missing_package_tokens__",
    projectTokensDir,
  });
  const projectThemes = await loadTokenDocuments({
    packageTokensDir: "__podo_missing_package_tokens__",
    projectTokensDir: projectThemesDir,
  });
  sources.push(
    ...[...projectTokens, ...projectThemes].filter((source) => source.tier === "project")
  );
  return sources;
}

async function loadBuildComponents(root: string): Promise<ComponentDocument[]> {
  const localComponents = await readJsonFiles(join(root, ".podo/components"));
  return [
    ...defaultComponentDocuments.map((document) => parseComponentDocument(document)),
    ...localComponents.map((document) => parseComponentDocument(document)),
  ];
}

async function loadBuildIconManifest(root: string): Promise<IconManifest> {
  const projectManifest = await readJson<unknown>(join(root, ".podo/icons/manifest.json"));
  return parseIconManifest(projectManifest ?? defaultIconManifest);
}

async function resolveIconSvgRoot(root: string, manifest: IconManifest): Promise<string> {
  const projectSvgRoot = join(root, ".podo/icons/svg");
  if (await hasIconSources(projectSvgRoot, manifest)) {
    return projectSvgRoot;
  }

  return ensureDefaultIconSvgs(root);
}

async function ensureDefaultIconSvgs(root: string): Promise<string> {
  const svgRoot = join(root, ".podo/cache/default-icons/svg");
  for (const [file, contents] of Object.entries(defaultIconSvgs)) {
    const filePath = join(svgRoot, file);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }
  return svgRoot;
}

async function readIconInputHash(root: string, manifest: IconManifest): Promise<string> {
  const projectSvgRoot = join(root, ".podo/icons/svg");
  if (await hasIconSources(projectSvgRoot, manifest)) {
    const files = await Promise.all(
      Object.values(manifest.icons)
        .map((icon) => icon.source)
        .sort()
        .map(async (source) => [source, await readFile(join(projectSvgRoot, source), "utf8")])
    );
    return hashJson({ manifest, files });
  }

  return hashJson({ manifest, files: defaultIconSvgs });
}

async function hasIconSources(svgRoot: string, manifest: IconManifest): Promise<boolean> {
  const sources = Object.values(manifest.icons).map((icon) => join(svgRoot, icon.source));
  return (await Promise.all(sources.map((source) => exists(source)))).every(Boolean);
}

async function writeBootstrapFiles(
  root: string,
  options: InitOptions,
  force: boolean
): Promise<void> {
  const base = join(root, ".podo/bootstrap");
  const files: Record<string, string> = {
    "react.tsx": `import { PodoThemeProvider } from "@podo/react";\n\nexport const podoTheme = { theme: ${JSON.stringify(
      options.theme
    )}, colorScheme: "light" as const };\n\nexport { PodoThemeProvider };\n`,
    "hono.tsx": `import { renderCriticalCss } from "@podo/hono";\n\nexport function podoHead() {\n  return renderCriticalCss({ theme: ${JSON.stringify(
      options.theme
    )}, colorScheme: "light" });\n}\n`,
    "native.tsx": `import { PodoNativeThemeProvider } from "@podo/native";\n\nexport const podoNativeTheme = { theme: ${JSON.stringify(
      options.theme
    )}, colorScheme: "light" as const };\n\nexport { PodoNativeThemeProvider };\n`,
    "web.ts": `import { registerPodoElements } from "@podo/web";\n\nexport function registerPodo() {\n  registerPodoElements();\n}\n`,
  };
  for (const [file, contents] of Object.entries(files)) {
    await writeText(join(base, file), contents, force);
  }
}

async function validateJsonFile<T>(
  filePath: string,
  code: string,
  parser: (value: unknown) => T,
  issues: ValidationIssue[]
): Promise<void> {
  try {
    parser(JSON.parse(await readFile(filePath, "utf8")));
  } catch (error) {
    issues.push({
      code,
      path: filePath,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function logIssues(issues: ValidationIssue[], io: CliIO): void {
  for (const issue of issues) {
    io.stderr.error(`[podo:error] ${issue.code} ${issue.path} - ${issue.message}`);
  }
  io.stderr.error("[podo:next] Fix validation errors and rerun `podo validate`.");
}

function formatInfo(scope: string, message: string): string {
  return `[podo:${scope}] ${message}`;
}

function formatError(scope: string | undefined, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `[podo:error] ${scope ?? "cli"} - ${message}\n[podo:next] Run \`podo --help\` for available commands.`;
}

function helpText(): string {
  return [
    "podo <command> [options]",
    "",
    "Commands:",
    "  init       Create .podo config, lock, directories, and bootstrap files",
    "  build      Build tokens, icons, and component target files",
    "  validate   Validate .podo config, tokens, components, and icons",
    "  ui         Registered for Phase 5",
    "  update     Registered for update workflow",
    "  migrate    Registered for schema migrations",
    "  mcp        Registered for MCP server integration",
  ].join("\n");
}

function toTarget(value: string): CodegenTarget {
  if (value === "web" || value === "react" || value === "hono" || value === "native") {
    return value;
  }
  if (value === "react-native") {
    return "native";
  }
  throw new Error(`Unsupported target "${value}". Use web, react, hono, or native.`);
}

function stringOption(args: ParsedArgs, key: string): string | undefined {
  const value = args.options[key];
  return typeof value === "string" ? value : undefined;
}

function parseBooleanOption(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true" || value === "yes") {
    return true;
  }
  if (value === "false" || value === "no") {
    return false;
  }
  return fallback;
}

async function writeJson(filePath: string, value: unknown, force: boolean): Promise<void> {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`, force);
}

async function writeText(filePath: string, contents: string, force: boolean): Promise<void> {
  if (!force && (await exists(filePath))) {
    return;
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function readJsonFiles(dir: string): Promise<unknown[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return [] as Dirent[];
      }
      throw error;
    }
  );
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return readJsonFiles(entryPath);
      }
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        return [];
      }
      return [JSON.parse(await readFile(entryPath, "utf8"))];
    })
  );
  return files.flat();
}

async function exists(path: string): Promise<boolean> {
  return stat(path)
    .then(() => true)
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    });
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function relativePath(root: string, filePath: string): string {
  return filePath.replace(resolve(root), "").replace(/^\/+/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function defaultIo(): CliIO {
  return { cwd: process.cwd(), stdout: console, stderr: console, stdin: nodeStdin };
}

const defaultTokenDocument: TokenDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "tokens",
  category: "theme",
  tokens: {
    color: {
      brand: { $type: "color", $value: "#5B5BD6" },
      text: { $type: "color", $value: "#14151A" },
      inverse: { $type: "color", $value: "#FFFFFF" },
      danger: { $type: "color", $value: "#D92D20" },
    },
    semantic: {
      color: {
        text: {
          default: { $type: "color", $value: "{color.text}" },
          inverse: { $type: "color", $value: "{color.inverse}" },
          danger: { $type: "color", $value: "{color.danger}" },
        },
      },
    },
    component: {
      button: {
        background: { $type: "color", $value: "{color.brand}" },
        text: { $type: "color", $value: "{color.inverse}" },
      },
      input: {
        background: { $type: "color", $value: "{color.inverse}" },
        border: { $type: "color", $value: "{color.text}" },
      },
    },
    spacing: {
      scale: {
        "1": { $type: "spacing", $value: "4px" },
        "2": { $type: "spacing", $value: "8px" },
      },
      component: {
        "field-gap": { $type: "spacing", $value: "{spacing.scale.2}" },
      },
    },
    radius: {
      control: {
        md: { $type: "radius", $value: "8px" },
      },
    },
    typography: {
      h1: {
        landing: {
          $type: "typography",
          $value: {
            fontFamily: "Pretendard",
            fontSize: "64px",
            lineHeight: "72px",
            fontWeight: 700,
            letterSpacing: "0px",
          },
        },
        dashboard: {
          $type: "typography",
          $value: {
            fontFamily: "Pretendard",
            fontSize: "28px",
            lineHeight: "36px",
            fontWeight: 600,
            letterSpacing: "0px",
          },
        },
      },
    },
  },
};

const defaultComponentDocuments: unknown[] = [
  {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    anatomy: [{ name: "root" }, { name: "label" }],
    slots: [{ name: "children", required: true }],
    props: [{ name: "disabled", type: { kind: "boolean" }, default: false }],
    variants: [
      { name: "variant", values: ["solid", "soft", "outline", "ghost"], default: "solid" },
    ],
    states: [{ name: "disabled" }, { name: "loading" }],
    tokens: {
      "root.background": "{component.button.background}",
      "label.color": "{component.button.text}",
    },
    targets: supportedTargets(),
    accessibility: { role: "button", aria: ["aria-disabled"], keyboard: ["Enter", "Space"] },
  },
  {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "input",
    name: "Input",
    category: "atom",
    status: "stable",
    anatomy: [{ name: "root" }, { name: "control" }],
    slots: [],
    props: [{ name: "value", type: { kind: "string" } }],
    variants: [],
    states: [{ name: "disabled" }, { name: "invalid" }],
    tokens: {
      "root.background": "{component.input.background}",
      "root.borderColor": "{component.input.border}",
    },
    targets: supportedTargets(),
    accessibility: { aria: ["aria-invalid", "aria-required", "aria-describedby"] },
  },
  {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "field",
    name: "Field",
    category: "molecule",
    status: "stable",
    anatomy: [{ name: "root" }, { name: "label" }, { name: "control" }, { name: "error" }],
    slots: [
      { name: "label", required: true },
      { name: "control", required: true },
    ],
    props: [{ name: "invalid", type: { kind: "boolean" }, default: false }],
    variants: [],
    states: [{ name: "invalid" }],
    tokens: {
      "label.color": "{semantic.color.text.default}",
      "error.color": "{semantic.color.text.danger}",
    },
    targets: supportedTargets(),
    accessibility: { aria: ["aria-describedby", "aria-invalid", "aria-required"] },
  },
];

const defaultIconManifest: IconManifest = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "icons",
  fontFamily: "PodoIcons",
  icons: {
    menu: {
      codepoint: "E001",
      source: "navigation/menu.svg",
      tags: ["navigation"],
    },
    "chevron-left": {
      codepoint: "E002",
      source: "navigation/chevron-left.svg",
      tags: ["navigation"],
    },
  },
  groups: { navigation: ["menu", "chevron-left"] },
  codepointLock: { menu: "E001", "chevron-left": "E002" },
};

const defaultIconSvgs = {
  "navigation/menu.svg":
    '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>',
  "navigation/chevron-left.svg":
    '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 5 8.5 12l7 7-1.5 1.5L5.5 12 14 3.5 15.5 5z"/></svg>',
};

function supportedTargets(): ComponentDocument["targets"] {
  return {
    web: { supported: true, limitations: [] },
    react: { supported: true, limitations: [] },
    hono: { supported: true, limitations: [] },
    native: { supported: true, limitations: [] },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runCli().then((code) => {
    process.exitCode = code;
  });
}
