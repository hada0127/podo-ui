#!/usr/bin/env node

import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as nodeStdin, stdout as nodeStdout } from "node:process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseComponentDocument,
  parseIconManifest,
  parsePageDocument,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  validateComponentTokenBindings,
  validateIconManifest,
  validatePageComponents,
  collectTokenPaths,
  PODO_SCHEMA_VERSION,
  type ComponentDocument,
  type IconManifest,
  type PageDocument,
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
  mergeTokenDocuments,
  resolveTokenDocument,
  validateTokenBuild,
  type TokenSource,
} from "@podo/tokens";
import { loadTokenDocuments } from "@podo/tokens/node";
import { buildIconAssets, emitIconCss, emitIconTypes, emitNativeGlyphMap } from "@podo/icons";
import {
  emitComponentTokenCss,
  generateComponentFiles,
  generateIndexFile,
  type CodegenTarget,
} from "@podo/codegen";
import {
  createDefaultMigrationManifest,
  hashJson as hashMigrationJson,
  parseMigrationManifest,
  runMigrationPlan,
  updateLockAfterMigration,
  validateMigrationFile,
  type MigrationFile,
  type MigrationManifest,
  type MigrationPlan,
} from "@podo/migration";
import { startMcpServer } from "@podo/mcp";
import {
  startStudioServer,
  type StudioBuildInput,
  type StudioSetupInput,
  type StudioServer,
} from "@podo/studio";

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
  files: Array<{ path: string; action: "create" | "update"; preview?: string }>;
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
    if (args.command === "ui") {
      await startUi(args, io);
      return 0;
    }
    if (args.command === "update") {
      await updateProject(args, io);
      return 0;
    }
    if (args.command === "migrate") {
      await migrateProject(args, io);
      return 0;
    }
    if (args.command === "mcp") {
      await startMcp(args, io);
      return 0;
    }
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
  // Validate against the MERGED token tree, not the union of source paths: a
  // project token can shadow a package subtree, so a path present in some source
  // may not exist after merge/resolve (and thus not in tokens.css).
  const componentTokenPaths = collectTokenPaths(merged.tokens);
  const componentIssues = components.flatMap((component) =>
    validateComponentTokenBindings(component, componentTokenPaths)
  );
  if (componentIssues.length) {
    throw new Error(
      `Component build failed:\n${componentIssues.map((issue) => issue.message).join("\n")}`
    );
  }
  const pages = await loadBuildPages(root);
  const pageIssues = pages.flatMap((page) => validatePageComponents(page, components));
  if (pageIssues.length) {
    throw new Error(`Page build failed:\n${pageIssues.map((issue) => issue.message).join("\n")}`);
  }
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
    // Always emit pages.json (empty array when there are no pages) so deleting
    // all pages reflects in the build output rather than leaving a stale bundle.
    { path: join(absoluteOutDir, "pages.json"), contents: `${JSON.stringify(pages, null, 2)}\n` },
    // Spec-driven component token CSS: variant/state token edits reflect here.
    { path: join(absoluteOutDir, "components.css"), contents: emitComponentTokenCss(components) },
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
        ...generated.map((file) => ({ path: file.path, preview: file.contents.slice(0, 4000) })),
        { path: join(absoluteOutDir, "icons/PodoIcons.woff") },
        { path: join(absoluteOutDir, "icons/PodoIcons.woff2") },
        { path: join(absoluteOutDir, "icons/PodoIcons.metadata.json") },
      ].map(async (file) => ({
        path: relativePath(root, file.path),
        action: (await exists(file.path)) ? "update" : "create",
        ...("preview" in file ? { preview: file.preview } : {}),
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

  const updates = plan.files.filter((file) => file.action === "update");
  if (updates.length && !force) {
    throw new Error(
      `Build would update ${updates.length} existing file${
        updates.length === 1 ? "" : "s"
      }. Run \`podo build --dry-run\` and rerun with \`--force\` after reviewing the file plan.`
    );
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
  // Validate against the merged token tree so shadowed package paths are not
  // counted as available (consistent with buildProject + the emitted tokens).
  const tokenPaths = collectTokenPaths(mergeTokenDocuments(tokenSources).tokens);
  for (const component of components) {
    issues.push(...validateComponentTokenBindings(component, tokenPaths));
  }

  try {
    const pages = await loadBuildPages(root);
    for (const page of pages) {
      issues.push(...validatePageComponents(page, components));
    }
  } catch (error) {
    issues.push({
      code: "podo.page.invalid",
      path: ".podo/pages",
      message: error instanceof Error ? error.message : "A page document is invalid.",
    });
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

export async function startUi(args: ParsedArgs, io: CliIO): Promise<void> {
  const root = await findProjectRoot(io.cwd);
  const host = stringOption(args, "host") ?? "127.0.0.1";
  const port = parsePort(stringOption(args, "port") ?? "4873");
  if (args.options["dry-run"]) {
    io.stdout.log(
      formatInfo("ui", `Would start Podo Studio at http://${host}:${port} for ${root}.`)
    );
    return;
  }

  const server = await startStudioServer({
    root,
    host,
    port,
    io,
    actions: {
      initialize: async (input) =>
        initProject(parseArgs(studioSetupArgs(input)), { ...io, cwd: root }),
      build: async (input) => buildProject(parseArgs(studioBuildArgs(input)), { ...io, cwd: root }),
      validate: async (input) =>
        validateProject(
          parseArgs(["validate", ...(input.report ? ["--report", input.report] : [])]),
          {
            ...io,
            cwd: root,
          }
        ),
    },
  });
  io.stdout.log(formatInfo("ui", `Open ${server.url}.`));

  if (args.options.once) {
    await server.close();
    return;
  }

  await waitForUiShutdown(server);
}

export async function startMcp(args: ParsedArgs, io: CliIO): Promise<void> {
  const root = await findProjectRoot(io.cwd);
  if (args.options["dry-run"]) {
    io.stdout.log(formatInfo("mcp", `Would start Podo MCP stdio server for ${root}.`));
    return;
  }
  await startMcpServer({ root });
}

export async function updateProject(args: ParsedArgs, io: CliIO): Promise<MigrationPlan> {
  const root = await findProjectRoot(io.cwd);
  const plan = await createProjectMigrationPlan(root, args, true);
  logMigrationPlan("update", plan, io);
  const reportPath = stringOption(args, "report");
  if (reportPath) {
    await writeMigrationReport(root, reportPath, plan);
  }
  io.stdout.log(formatInfo("update", "Dry-run only. Run `podo migrate` to apply changes."));
  return plan;
}

export async function migrateProject(args: ParsedArgs, io: CliIO): Promise<MigrationPlan> {
  const root = await findProjectRoot(io.cwd);
  const dryRun = Boolean(args.options["dry-run"]);
  const plan = await createProjectMigrationPlan(root, args, dryRun);
  logMigrationPlan("migrate", plan, io);
  const reportPath = stringOption(args, "report");
  if (reportPath) {
    await writeMigrationReport(root, reportPath, plan);
  }
  const blocking = plan.conflicts.filter((conflict) => conflict.severity === "blocking");
  if (blocking.length) {
    throw new Error(
      `Migration has ${blocking.length} blocking conflict${blocking.length === 1 ? "" : "s"}.`
    );
  }
  if (dryRun) {
    return plan;
  }

  for (const file of plan.files.filter((item) => item.action === "update")) {
    const filePath = resolvePodoFilePath(root, file.path);
    await writeFile(filePath, `${JSON.stringify(file.after, null, 2)}\n`);
  }

  const lockPath = resolvePodoFilePath(root, ".podo/lock.json");
  const lock = await readJson<PodoLock>(lockPath);
  if (!lock) {
    throw new Error(".podo/lock.json was not found. Run `podo init` first.");
  }
  const migratedLock = updateLockAfterMigration({
    lock,
    manifest: plan.manifest,
    generatedHash: hashMigrationJson({
      manifest: plan.manifest,
      files: plan.files.map((file) => ({ path: file.path, afterHash: file.afterHash })),
    }),
  });
  await writeFile(lockPath, `${JSON.stringify(migratedLock, null, 2)}\n`);
  io.stdout.log(
    formatInfo("migrate", `Applied migration ${plan.manifest.from} -> ${plan.manifest.to}.`)
  );
  return plan;
}

async function createProjectMigrationPlan(
  root: string,
  args: ParsedArgs,
  dryRun: boolean
): Promise<MigrationPlan> {
  const lockPath = resolvePodoFilePath(root, ".podo/lock.json");
  const lock = await readJson<PodoLock>(lockPath);
  if (!lock) {
    throw new Error(".podo/lock.json was not found. Run `podo init` first.");
  }

  const manifest = await loadProjectMigrationManifest(root, args, lock);
  const files = await loadProjectMigrationFiles(root);
  const issues = files.flatMap(validateMigrationFile);
  if (issues.length) {
    throw new Error(
      `Migration input validation failed:\n${issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`
    );
  }
  return runMigrationPlan({ manifest, files, dryRun });
}

async function loadProjectMigrationManifest(
  root: string,
  args: ParsedArgs,
  lock: PodoLock
): Promise<MigrationManifest> {
  const manifestPath = stringOption(args, "manifest") ?? args.positionals[0];
  if (manifestPath) {
    const manifest = await readJson<unknown>(resolve(root, manifestPath));
    if (!manifest) {
      throw new Error(`Migration manifest was not found at ${manifestPath}.`);
    }
    return parseMigrationManifest(manifest);
  }

  const targetVersion = stringOption(args, "to") ?? lock.packageVersion;
  return createDefaultMigrationManifest({
    from: lock.packageVersion,
    to: targetVersion,
    packageVersion: targetVersion,
  });
}

async function loadProjectMigrationFiles(root: string): Promise<MigrationFile[]> {
  const files: MigrationFile[] = [];
  for (const relative of [".podo/config.json", ".podo/lock.json", ".podo/icons/manifest.json"]) {
    const document = await readJson<unknown>(resolvePodoFilePath(root, relative));
    if (document !== undefined) {
      files.push({ path: relative, document });
    }
  }

  files.push(
    ...(await readProjectJsonFiles(root, ".podo/tokens")),
    ...(await readProjectJsonFiles(root, ".podo/themes")),
    ...(await readProjectJsonFiles(root, ".podo/components"))
  );
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function readProjectJsonFiles(
  root: string,
  relativeDirectory: string
): Promise<MigrationFile[]> {
  const directory = resolvePodoFilePath(root, relativeDirectory);
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return [] as Dirent[];
      }
      throw error;
    }
  );
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = join(directory, entry.name);
      const relative = relativePath(root, absolute);
      if (entry.isDirectory()) {
        return readProjectJsonFiles(root, relative);
      }
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        return [] as MigrationFile[];
      }
      return [{ path: relative, document: JSON.parse(await readFile(absolute, "utf8")) }];
    })
  );
  return nested.flat();
}

async function writeMigrationReport(
  root: string,
  reportPath: string,
  plan: MigrationPlan
): Promise<void> {
  const filePath = resolvePodoFilePath(root, reportPath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(plan, null, 2)}\n`);
}

function logMigrationPlan(scope: "update" | "migrate", plan: MigrationPlan, io: CliIO): void {
  const changed = plan.files.filter((file) => file.action === "update");
  const blocking = plan.conflicts.filter((conflict) => conflict.severity === "blocking");
  io.stdout.log(
    formatInfo(
      scope,
      `${plan.dryRun ? "Dry run planned" : "Planned"} ${changed.length} file update${
        changed.length === 1 ? "" : "s"
      } for ${plan.manifest.from} -> ${plan.manifest.to}.`
    )
  );
  for (const file of changed) {
    io.stdout.log(`[podo:plan] update ${file.path} (${file.operations.length} patches)`);
  }
  for (const conflict of plan.conflicts) {
    const log = conflict.severity === "blocking" ? io.stderr.error : io.stdout.log;
    log(
      `[podo:conflict] ${conflict.severity} ${conflict.code} ${conflict.path} - ${conflict.message}`
    );
  }
  if (blocking.length) {
    io.stderr.error("[podo:next] Resolve blocking conflicts before running `podo migrate`.");
  }
}

function resolvePodoFilePath(root: string, unsafePath: string): string {
  const normalized = unsafePath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized !== ".podo" && !normalized.startsWith(".podo/")) {
    throw new Error(`Podo migration writes are limited to .podo paths. Received ${unsafePath}.`);
  }
  const podoRoot = resolve(root, ".podo");
  const absolute = resolve(root, normalized);
  if (absolute !== podoRoot && !absolute.startsWith(`${podoRoot}${sep}`)) {
    throw new Error(`Path escapes .podo: ${unsafePath}.`);
  }
  return absolute;
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
  const components = new Map<string, ComponentDocument>();
  for (const document of defaultComponentDocuments) {
    const component = parseComponentDocument(document);
    components.set(component.id, component);
  }
  for (const document of localComponents) {
    const component = parseComponentDocument(document);
    components.set(component.id, component);
  }
  return [...components.values()];
}

async function loadBuildPages(root: string): Promise<PageDocument[]> {
  const records = await readJsonFiles(join(root, ".podo/pages"));
  const pages = new Map<string, PageDocument>();
  for (const record of records) {
    const page = parsePageDocument(record);
    pages.set(page.id, page);
  }
  return [...pages.values()].sort((a, b) => a.id.localeCompare(b.id));
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
        .filter((source): source is string => source != null)
        .sort()
        .map(async (source) => [source, await readFile(join(projectSvgRoot, source), "utf8")])
    );
    return hashJson({ manifest, files });
  }

  return hashJson({ manifest, files: defaultIconSvgs });
}

async function hasIconSources(svgRoot: string, manifest: IconManifest): Promise<boolean> {
  // Inline (browser-edited) manifests carry their SVG in `svg`, not on disk; only
  // a fully file-path manifest can be hashed from project SVG files.
  const sources: string[] = [];
  for (const icon of Object.values(manifest.icons)) {
    if (icon.source == null) {
      return false;
    }
    sources.push(join(svgRoot, icon.source));
  }
  if (sources.length === 0) {
    return false;
  }
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
    "  ui         Start the local Podo Studio Web UI",
    "  update     Plan package/schema migrations without writing files",
    "  migrate    Apply reviewed migrations to .podo specs and lockfile",
    "  mcp        Start the Podo MCP stdio server",
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

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid port "${value}".`);
  }
  return port;
}

function studioSetupArgs(input: StudioSetupInput): string[] {
  return [
    "init",
    "--target",
    input.target,
    "--theme",
    input.theme,
    "--dark-mode",
    String(input.darkMode),
    "--out-dir",
    input.outDir,
    "--yes",
    ...(input.force ? ["--force"] : []),
  ];
}

function studioBuildArgs(input: StudioBuildInput): string[] {
  return [
    "build",
    ...(input.target ? ["--target", input.target] : []),
    ...(input.outDir ? ["--out-dir", input.outDir] : []),
    ...(input.dryRun ? ["--dry-run"] : []),
    ...(input.force ? ["--force"] : []),
  ];
}

async function waitForUiShutdown(server: StudioServer): Promise<void> {
  await new Promise<void>((resolveShutdown) => {
    const close = (): void => {
      process.off("SIGINT", close);
      process.off("SIGTERM", close);
      void server.close().finally(resolveShutdown);
    };
    process.once("SIGINT", close);
    process.once("SIGTERM", close);
  });
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
  // Sort entries so traversal order is deterministic regardless of the OS
  // readdir order; this makes id-based overrides (e.g. duplicate component ids
  // across .podo files) and the build output reproducible.
  const ordered = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const files = await Promise.all(
    ordered.map(async (entry) => {
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
      "description.color": "{semantic.color.text.default}",
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
