import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { serve, type ServerType } from "@hono/node-server";
import {
  collectTokenPaths,
  parseComponentDocument,
  parseIconManifest,
  parsePageDocument,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  PODO_SCHEMA_VERSION,
  validateComponentTokenBindings,
  validateIconManifest,
  validatePageComponents,
  type ComponentDocument,
  type IconDefinition,
  type IconManifest,
  type PageDocument,
  type PodoConfig,
  type PodoLock,
  type TokenDocument,
  type ValidationIssue,
} from "@podo/spec";
import {
  mergeTokenDocuments,
  resolveTokenDocument,
  validateTokenBuild,
  type ResolvedToken,
  type TokenSource,
} from "@podo/tokens";
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
import { Hono } from "hono";

export const packageName = "@podo/studio";

export type StudioTarget = "web" | "react" | "hono" | "native";

export interface StudioIO {
  stdout: Pick<typeof console, "log">;
  stderr: Pick<typeof console, "error">;
}

export interface StudioSetupInput {
  target: StudioTarget;
  theme: string;
  darkMode: boolean;
  outDir: string;
  iconGroups: string[];
  force?: boolean;
  dryRun?: boolean;
}

export interface StudioBuildInput {
  target?: StudioTarget;
  outDir?: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface StudioValidateInput {
  report?: string;
}

export interface StudioMigrationInput {
  manifest?: unknown;
  to?: string;
}

export interface StudioActions {
  initialize?: (input: StudioSetupInput) => Promise<unknown>;
  build?: (input: StudioBuildInput) => Promise<unknown>;
  validate?: (input: StudioValidateInput) => Promise<StudioValidationReport>;
}

export interface StudioServerOptions {
  root: string;
  host?: string;
  port?: number;
  actions?: StudioActions;
  io?: StudioIO;
}

export interface StudioServer {
  url: string;
  close: () => Promise<void>;
}

export interface StudioFileSummary {
  path: string;
  kind: "config" | "lock" | "token" | "theme" | "component" | "page" | "icon" | "svg" | "generated";
  status: "valid" | "invalid" | "unparsed";
  issues: ValidationIssue[];
}

export interface StudioComponentSummary {
  id: string;
  name: string;
  category: string;
  status: string;
  source: "package" | "project";
  path: string;
  props: ComponentDocument["props"];
  variants: ComponentDocument["variants"];
  states: ComponentDocument["states"];
  slots: ComponentDocument["slots"];
  tokens: ComponentDocument["tokens"];
  targets: ComponentDocument["targets"];
  document: ComponentDocument;
}

export interface StudioIconSummary {
  fontFamily: string;
  icons: Array<IconDefinition & { name: string }>;
  groups: Record<string, string[]>;
}

export interface StudioGeneratedPreview {
  path: string;
  bytes: number;
  preview: string;
}

export interface StudioContext {
  root: string;
  initialized: boolean;
  detectedTarget: StudioTarget;
  files: StudioFileSummary[];
  tokenPaths: string[];
  resolvedTokens: Array<ResolvedToken & { source: "package" | "project" }>;
  components: StudioComponentSummary[];
  pages: PageDocument[];
  generatedPreview: StudioGeneratedPreview[];
  issues: ValidationIssue[];
  config?: PodoConfig;
  lock?: PodoLock;
  icons?: StudioIconSummary;
}

export interface StudioValidationReport {
  ok: boolean;
  root: string;
  issues: ValidationIssue[];
}

interface JsonFileRecord {
  path: string;
  contents: string;
  json?: unknown;
  issues: ValidationIssue[];
}

const defaultHost = "127.0.0.1";
const defaultPort = 4873;

export function createStudioApp(options: StudioServerOptions): Hono {
  const root = resolve(options.root);
  const actions = options.actions ?? {};
  const app = new Hono();

  app.onError((error, context) => {
    return context.json(errorPayload("studio.error", error.message), 500);
  });

  app.get("/", (context) => context.html(renderStudioHtml()));

  app.get("/api/context", async (context) => {
    return context.json({ ok: true, context: await loadStudioContext(root) });
  });

  app.get("/api/files", async (context) => {
    const requestedPath = context.req.query("path");
    if (!requestedPath) {
      return context.json(errorPayload("studio.file.path", "Missing path query."), 400);
    }

    const filePath = resolvePodoPath(root, requestedPath);
    const contents = await readText(filePath);
    return context.json({
      ok: true,
      path: relativePath(root, filePath),
      exists: contents !== undefined,
      contents: contents ?? "",
    });
  });

  app.put("/api/files", async (context) => {
    const body = await context.req.json<{
      path?: string;
      contents?: string;
      dryRun?: boolean;
      force?: boolean;
    }>();
    if (!body.path || typeof body.contents !== "string") {
      return context.json(errorPayload("studio.file.body", "Expected path and contents."), 400);
    }

    const filePath = resolvePodoPath(root, body.path);
    const issues = validateWritableFile(body.path, body.contents);
    if (issues.length) {
      return context.json({ ok: false, dryRun: Boolean(body.dryRun), issues }, 400);
    }
    const previousContents = await readText(filePath);
    const filePlan = createFileWritePlan(
      relativePath(root, filePath),
      previousContents,
      body.contents
    );

    if (!body.dryRun) {
      await writeProjectFile(filePath, body.contents, Boolean(body.force));
    }

    return context.json({
      ok: true,
      dryRun: Boolean(body.dryRun),
      path: relativePath(root, filePath),
      action: body.dryRun ? filePlan.action : "written",
      filePlan,
    });
  });

  app.post("/api/tokens/override", async (context) => {
    const body = await context.req.json<{
      path?: string;
      type?: string;
      value?: string;
      dryRun?: boolean;
      force?: boolean;
    }>();
    if (!body.path || !body.type || typeof body.value !== "string") {
      return context.json(
        errorPayload("studio.token.body", "Expected token path, type, and value."),
        400
      );
    }

    const result = await writeTokenOverride(root, {
      path: body.path,
      type: body.type,
      value: body.value,
      dryRun: Boolean(body.dryRun),
      force: Boolean(body.force),
    });
    return context.json(result);
  });

  app.post("/api/setup", async (context) => {
    const input = normalizeSetupInput(await context.req.json<Partial<StudioSetupInput>>());
    if (input.dryRun) {
      return context.json({ ok: true, dryRun: true, input });
    }

    if (actions.initialize) {
      await actions.initialize(input);
    } else {
      await writeSetupFiles(root, input);
    }
    await writeIconManifestGroups(root, input.iconGroups);
    const build = actions.build
      ? await actions.build({ target: input.target, outDir: input.outDir })
      : undefined;

    return context.json({
      ok: true,
      build,
      context: await loadStudioContext(root),
    });
  });

  app.post("/api/build", async (context) => {
    const input = normalizeBuildInput(await context.req.json<Partial<StudioBuildInput>>());
    if (!actions.build) {
      return context.json(
        errorPayload("studio.build.missing", "No build action is registered."),
        501
      );
    }

    return context.json({ ok: true, result: await actions.build(input) });
  });

  app.post("/api/validate", async (context) => {
    const input = await context.req.json<StudioValidateInput>().catch(() => ({}));
    const report = actions.validate
      ? await actions.validate(input)
      : await validateStudioProject(root);
    return context.json({ ok: report.ok, report }, report.ok ? 200 : 422);
  });

  app.post("/api/migration/plan", async (context) => {
    const input = await context.req.json<StudioMigrationInput>().catch(() => ({}));
    const plan = await createStudioMigrationPlan(root, input, true);
    return context.json({ ok: true, plan });
  });

  app.post("/api/migration/apply", async (context) => {
    const input = await context.req.json<StudioMigrationInput>().catch(() => ({}));
    const plan = await createStudioMigrationPlan(root, input, false);
    const blocking = plan.conflicts.filter((conflict) => conflict.severity === "blocking");
    if (blocking.length) {
      return context.json(
        {
          ok: false,
          plan,
          issues: blocking.map((conflict) => ({
            code: conflict.code,
            path: conflict.path,
            message: conflict.message,
          })),
        },
        409
      );
    }

    await applyStudioMigration(root, plan);
    return context.json({ ok: true, plan, context: await loadStudioContext(root) });
  });

  app.post("/api/components/local", async (context) => {
    const body = await context.req.json<{
      template?: "gnb" | "lng";
      id?: string;
      name?: string;
      dryRun?: boolean;
      force?: boolean;
    }>();
    const template = body.template === "lng" ? "lng" : "gnb";
    const id = normalizeIdentifier(body.id ?? template);
    const document = createComponentTemplate(template, id, body.name);
    const contents = `${JSON.stringify(document, null, 2)}\n`;
    const filePath = resolvePodoPath(root, `.podo/components/local/${id}.component.json`);

    if (!body.dryRun) {
      await writeProjectFile(filePath, contents, Boolean(body.force));
    }

    return context.json({
      ok: true,
      dryRun: Boolean(body.dryRun),
      path: relativePath(root, filePath),
      component: document,
    });
  });

  app.post("/api/icons/svg", async (context) => {
    const body = await context.req.json<{
      path?: string;
      contents?: string;
      dryRun?: boolean;
      force?: boolean;
    }>();
    if (!body.path || typeof body.contents !== "string") {
      return context.json(errorPayload("studio.svg.body", "Expected path and contents."), 400);
    }

    const sourcePath = body.path.replace(/^\.podo\/icons\/svg\//, "");
    const filePath = resolvePodoPath(root, `.podo/icons/svg/${sourcePath}`);
    const issues = validateSvgContents(relativePath(root, filePath), body.contents);
    if (issues.length) {
      return context.json({ ok: false, issues }, 400);
    }
    if (!body.dryRun) {
      await writeProjectFile(
        filePath,
        body.contents.endsWith("\n") ? body.contents : `${body.contents}\n`,
        Boolean(body.force)
      );
    }

    return context.json({
      ok: true,
      dryRun: Boolean(body.dryRun),
      path: relativePath(root, filePath),
    });
  });

  app.put("/api/icons/groups", async (context) => {
    const body = await context.req.json<{ groups?: Record<string, string[]>; dryRun?: boolean }>();
    if (!body.groups || typeof body.groups !== "object") {
      return context.json(errorPayload("studio.icons.groups", "Expected groups object."), 400);
    }

    const manifest = await loadIconManifest(root);
    const nextManifest: IconManifest = { ...manifest, groups: body.groups };
    const issues = validateIconManifest(nextManifest);
    if (issues.length) {
      return context.json({ ok: false, issues }, 400);
    }
    if (!body.dryRun) {
      await writeProjectFile(
        resolvePodoPath(root, ".podo/icons/manifest.json"),
        `${JSON.stringify(nextManifest, null, 2)}\n`,
        true
      );
    }

    return context.json({ ok: true, dryRun: Boolean(body.dryRun), manifest: nextManifest });
  });

  return app;
}

export async function startStudioServer(options: StudioServerOptions): Promise<StudioServer> {
  const host = options.host ?? defaultHost;
  const port = options.port ?? defaultPort;
  const app = createStudioApp(options);
  let server: ServerType | undefined;
  let actualPort = port;
  await new Promise<void>((resolveListen, rejectListen) => {
    server = serve({ fetch: app.fetch, hostname: host, port }, (info) => {
      actualPort = info.port;
      resolveListen();
    }) as ServerType;
    server.once("error", rejectListen);
  });
  if (!server) {
    throw new Error("Podo Studio server did not start.");
  }
  const runningServer = server;
  const url = `http://${host}:${actualPort}`;
  options.io?.stdout.log(`[podo:ui] Studio listening at ${url}`);

  return {
    url,
    close: () =>
      new Promise((resolveClose, reject) => {
        runningServer.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolveClose();
        });
      }),
  };
}

export async function loadStudioContext(root: string): Promise<StudioContext> {
  const projectRoot = resolve(root);
  const issues: ValidationIssue[] = [];
  const detectedTarget = await detectProjectTarget(projectRoot);
  const files: StudioFileSummary[] = [];
  const configRecord = await readJsonRecord(join(projectRoot, ".podo/config.json"), projectRoot);
  const lockRecord = await readJsonRecord(join(projectRoot, ".podo/lock.json"), projectRoot);
  const config = parseOptionalRecord(configRecord, parsePodoConfig, "config", files, issues);
  const lock = parseOptionalRecord(lockRecord, parsePodoLock, "lock", files, issues);
  const tokenRecords = await readJsonRecords(join(projectRoot, ".podo/tokens"), projectRoot);
  const themeRecords = await readJsonRecords(join(projectRoot, ".podo/themes"), projectRoot);
  const componentRecords = await readJsonRecords(
    join(projectRoot, ".podo/components"),
    projectRoot
  );
  const tokenSources: TokenSource[] = [
    { document: studioDefaultTokens, filePath: "podo:studio-default-tokens", tier: "package" },
  ];

  for (const record of tokenRecords) {
    const source = parseTokenRecord(record, "token", files, issues);
    if (source) {
      tokenSources.push(source);
    }
  }
  for (const record of themeRecords) {
    const source = parseTokenRecord(record, "theme", files, issues);
    if (source) {
      tokenSources.push(source);
    }
  }

  const tokenIssues = validateTokenBuild(tokenSources);
  issues.push(...tokenIssues);
  const resolvedTokens =
    tokenIssues.length === 0
      ? Object.values(resolveTokenDocument(mergeTokenDocuments(tokenSources)).tokens).map(
          (token) => ({
            ...token,
            source: token.origin?.tier ?? "package",
          })
        )
      : [];
  // Merged token paths (not the union of sources) so shadowed package paths are
  // not treated as available when validating component bindings.
  const tokenPaths = collectTokenPaths(mergeTokenDocuments(tokenSources).tokens).sort();

  const componentMap = new Map(
    studioDefaultComponents.map((component) => [
      component.id,
      summarizeComponent(component, "package"),
    ])
  );
  for (const record of componentRecords) {
    const component = parseComponentRecord(record, files, issues);
    if (component) {
      componentMap.set(component.id, summarizeComponent(component, "project", record.path));
      issues.push(...validateComponentTokenBindings(component, tokenPaths));
    }
  }
  const components = [...componentMap.values()];

  const pageRecords = await readJsonRecords(join(projectRoot, ".podo/pages"), projectRoot);
  const componentDocuments = components.map((component) => component.document);
  const pages: PageDocument[] = [];
  for (const record of pageRecords) {
    const page = parseOptionalRecord(record, parsePageDocument, "page", files, issues);
    if (page) {
      pages.push(page);
      issues.push(...validatePageComponents(page, componentDocuments));
    }
  }
  pages.sort((a, b) => a.id.localeCompare(b.id));

  const iconRecord = await readJsonRecord(
    join(projectRoot, ".podo/icons/manifest.json"),
    projectRoot
  );
  const iconManifest =
    parseOptionalRecord(iconRecord, parseIconManifest, "icon", files, issues) ??
    studioDefaultIconManifest;
  issues.push(...validateIconManifest(iconManifest));
  const svgFiles = await readTextRecords(join(projectRoot, ".podo/icons/svg"), ".svg");
  for (const file of svgFiles) {
    const svgIssues = validateSvgContents(relativePath(projectRoot, file.path), file.contents);
    files.push({
      path: relativePath(projectRoot, file.path),
      kind: "svg",
      status: svgIssues.length ? "invalid" : "valid",
      issues: svgIssues,
    });
    issues.push(...svgIssues);
  }

  return {
    root: projectRoot,
    initialized: Boolean(config),
    detectedTarget,
    files,
    tokenPaths,
    resolvedTokens,
    components,
    pages,
    generatedPreview: await readGeneratedPreview(projectRoot, config),
    issues,
    ...(config ? { config } : {}),
    ...(lock ? { lock } : {}),
    icons: summarizeIcons(iconManifest),
  };
}

export async function validateStudioProject(root: string): Promise<StudioValidationReport> {
  const context = await loadStudioContext(root);
  const lock = context.lock;
  const issues = [...context.issues];
  if (lock && lock.schemaVersion !== PODO_SCHEMA_VERSION) {
    issues.push({
      code: "podo.lock.schemaMismatch",
      path: ".podo/lock.json",
      message: `Lock schema ${lock.schemaVersion} does not match ${PODO_SCHEMA_VERSION}. Run podo migrate.`,
    });
  }
  return { ok: issues.length === 0, root: resolve(root), issues };
}

export async function createStudioMigrationPlan(
  root: string,
  input: StudioMigrationInput,
  dryRun: boolean
): Promise<MigrationPlan> {
  const projectRoot = resolve(root);
  const lockRecord = await readJsonRecord(join(projectRoot, ".podo/lock.json"), projectRoot);
  if (!lockRecord?.json || lockRecord.issues.length) {
    throw new Error(".podo/lock.json was not found or is invalid. Run setup first.");
  }
  const lock = parsePodoLock(lockRecord.json);
  const manifest = await loadStudioMigrationManifest(lock, input);
  const files = await loadStudioMigrationFiles(projectRoot);
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

async function loadStudioMigrationManifest(
  lock: PodoLock,
  input: StudioMigrationInput
): Promise<MigrationManifest> {
  if (input.manifest) {
    return parseMigrationManifest(input.manifest);
  }
  const targetVersion = input.to?.trim() || lock.packageVersion;
  return createDefaultMigrationManifest({
    from: lock.packageVersion,
    to: targetVersion,
    packageVersion: targetVersion,
  });
}

async function loadStudioMigrationFiles(root: string): Promise<MigrationFile[]> {
  const directRecords = (
    await Promise.all(
      [".podo/config.json", ".podo/lock.json", ".podo/icons/manifest.json"].map((path) =>
        readJsonRecord(join(root, path), root)
      )
    )
  ).filter((record): record is JsonFileRecord => Boolean(record));
  const nestedRecords = [
    ...(await readJsonRecords(join(root, ".podo/tokens"), root)),
    ...(await readJsonRecords(join(root, ".podo/themes"), root)),
    ...(await readJsonRecords(join(root, ".podo/components"), root)),
  ];
  const records = [...directRecords, ...nestedRecords];
  const invalid = records.flatMap((record) => record.issues);
  if (invalid.length) {
    throw new Error(
      `Migration input JSON is invalid:\n${invalid
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join("\n")}`
    );
  }
  return records
    .filter((record): record is JsonFileRecord & { json: unknown } => record.json !== undefined)
    .map((record) => ({ path: record.path, document: record.json }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

async function applyStudioMigration(root: string, plan: MigrationPlan): Promise<void> {
  for (const file of plan.files.filter((item) => item.action === "update")) {
    await writeProjectFile(
      resolvePodoPath(root, file.path),
      `${JSON.stringify(file.after, null, 2)}\n`,
      true
    );
  }

  const lockRecord = await readJsonRecord(join(root, ".podo/lock.json"), root);
  if (!lockRecord?.json || lockRecord.issues.length) {
    throw new Error(".podo/lock.json was not found or is invalid after migration.");
  }
  const migratedLock = updateLockAfterMigration({
    lock: lockRecord.json,
    manifest: plan.manifest,
    generatedHash: hashMigrationJson({
      manifest: plan.manifest,
      files: plan.files.map((file) => ({ path: file.path, afterHash: file.afterHash })),
    }),
  });
  await writeProjectFile(
    resolvePodoPath(root, ".podo/lock.json"),
    `${JSON.stringify(migratedLock, null, 2)}\n`,
    true
  );
}

function renderStudioHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Podo Studio</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f8f8fa;
      --panel: #ffffff;
      --panel-2: #f1f4f8;
      --line: #d8dde6;
      --text: #181b20;
      --muted: #687281;
      --accent: #2f6fdb;
      --good: #287a4b;
      --bad: #b42318;
      --warn: #9a6700;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-size: 14px; }
    button, input, select, textarea { font: inherit; }
    button { border: 1px solid var(--line); background: var(--panel); color: var(--text); height: 34px; padding: 0 12px; border-radius: 6px; cursor: pointer; }
    button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    button.danger { color: var(--bad); }
    button:disabled { opacity: .55; cursor: not-allowed; }
    input, select, textarea { border: 1px solid var(--line); border-radius: 6px; background: #fff; color: var(--text); padding: 7px 9px; min-width: 0; }
    textarea { width: 100%; min-height: 120px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.45; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border-bottom: 1px solid var(--line); padding: 8px; text-align: left; vertical-align: middle; overflow-wrap: anywhere; }
    th { color: var(--muted); font-weight: 600; background: var(--panel-2); }
    .app { min-height: 100vh; display: grid; grid-template-rows: 52px 1fr 34px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid var(--line); background: var(--panel); }
    .brand { font-weight: 700; letter-spacing: 0; }
    .root-path { color: var(--muted); font-size: 12px; max-width: 52vw; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .main { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 0; }
    .nav { border-right: 1px solid var(--line); background: #fbfcfd; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
    .nav button { width: 100%; text-align: left; background: transparent; border-color: transparent; }
    .nav button.active { background: var(--panel-2); border-color: var(--line); }
    .workspace { min-width: 0; overflow: auto; padding: 16px; display: grid; gap: 16px; align-content: start; }
    .section { display: grid; gap: 12px; }
    .section h1 { margin: 0; font-size: 22px; line-height: 1.25; }
    .section h2 { margin: 0; font-size: 15px; line-height: 1.3; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); align-items: start; }
    .panel { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); overflow: hidden; }
    .panel-head { height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 12px; border-bottom: 1px solid var(--line); background: var(--panel-2); }
    .panel-body { padding: 12px; display: grid; gap: 10px; }
    .field { display: grid; gap: 5px; }
    .field label { color: var(--muted); font-size: 12px; font-weight: 600; }
    .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 380px); gap: 12px; }
    .statusbar { display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-top: 1px solid var(--line); background: var(--panel); color: var(--muted); font-size: 12px; }
    .badge { display: inline-flex; align-items: center; min-height: 24px; border: 1px solid var(--line); border-radius: 999px; padding: 0 8px; color: var(--muted); background: #fff; }
    .badge.good { color: var(--good); border-color: #b7dbc7; background: #eef8f2; }
    .badge.bad { color: var(--bad); border-color: #f0c7c1; background: #fff3f1; }
    .swatch { width: 28px; height: 28px; border: 1px solid var(--line); border-radius: 6px; display: inline-block; vertical-align: middle; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
    .preview { border: 1px solid var(--line); border-radius: 8px; min-height: 120px; padding: 12px; background: #fff; display: grid; gap: 8px; align-content: start; }
    .preview h3 { margin: 0; font-size: 28px; line-height: 1.2; }
    .preview p { margin: 0; color: var(--muted); }
    .list { display: grid; gap: 8px; }
    .empty { color: var(--muted); padding: 14px; border: 1px dashed var(--line); border-radius: 8px; }
    [hidden] { display: none !important; }
    @media (max-width: 860px) {
      .main { grid-template-columns: 1fr; }
      .nav { border-right: 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: repeat(3, 1fr); }
      .split { grid-template-columns: 1fr; }
      .root-path { max-width: 40vw; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="brand">Podo Studio</div>
      <div class="root-path" id="rootPath"></div>
    </header>
    <main class="main">
      <nav class="nav" id="nav"></nav>
      <section class="workspace" id="workspace"></section>
    </main>
    <footer class="statusbar">
      <span id="status">Loading</span>
      <span id="validationBadge" class="badge">Validation</span>
    </footer>
  </div>
  <datalist id="tokenPaths"></datalist>
  <script>${studioClientScript()}</script>
</body>
</html>`;
}

function studioClientScript(): string {
  return String.raw`
const tabs = ["setup", "tokens", "components", "icons", "build", "migration"];
let state = { tab: "setup", context: null, validation: null, buildPlan: null, migrationPlan: null, status: "Loading" };

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error((payload.issues || []).map((issue) => issue.message).join("\\n") || payload.message || response.statusText);
  }
  return payload;
}

async function refresh() {
  state.context = (await api("/api/context")).context;
  state.status = state.context.initialized ? "Ready" : "Setup required";
  render();
}

function render() {
  $("rootPath").textContent = state.context?.root || "";
  $("status").textContent = state.status;
  $("validationBadge").textContent = state.context?.issues?.length ? state.context.issues.length + " issues" : "Valid";
  $("validationBadge").className = "badge " + (state.context?.issues?.length ? "bad" : "good");
  $("nav").innerHTML = tabs.map((tab) => '<button class="' + (state.tab === tab ? "active" : "") + '" data-tab="' + tab + '">' + tabLabel(tab) + '</button>').join("");
  $("workspace").innerHTML = renderTab();
  $("tokenPaths").innerHTML = (state.context?.tokenPaths || []).map((path) => '<option value="{' + esc(path) + '}"></option>').join("");
}

function tabLabel(tab) {
  return { setup: "Setup", tokens: "Tokens", components: "Components", icons: "Icons", build: "Build", migration: "Migration" }[tab];
}

function renderTab() {
  if (!state.context) return '<div class="empty">Loading</div>';
  if (state.tab === "setup") return renderSetup();
  if (state.tab === "tokens") return renderTokens();
  if (state.tab === "components") return renderComponents();
  if (state.tab === "icons") return renderIcons();
  if (state.tab === "migration") return renderMigration();
  return renderBuild();
}

function renderSetup() {
  const config = state.context.config || {};
  const target = (config.build?.targets || [state.context.detectedTarget])[0];
  const groups = Object.keys(state.context.icons?.groups || { navigation: [] });
  return '<div class="section"><h1>Setup</h1><div class="grid">' +
    '<div class="panel"><div class="panel-head"><h2>Project</h2><span class="badge">' + esc(state.context.detectedTarget) + '</span></div><div class="panel-body">' +
    field("Target", '<select id="setupTarget">' + ["web","react","hono","native"].map((item) => '<option value="' + item + '"' + (item === target ? " selected" : "") + '>' + item + '</option>').join("") + '</select>') +
    field("Theme", '<select id="setupTheme">' + ["landing","dashboard","custom"].map((item) => '<option value="' + item + '"' + (item === (config.themes?.default || "dashboard") ? " selected" : "") + '>' + item + '</option>').join("") + '</select>') +
    field("Dark mode", '<select id="setupDark"><option value="true"' + (config.darkMode?.enabled !== false ? " selected" : "") + '>enabled</option><option value="false"' + (config.darkMode?.enabled === false ? " selected" : "") + '>disabled</option></select>') +
    field("Out dir", '<input id="setupOutDir" value="' + esc(config.build?.outDir || "src/podo") + '">') +
    field("Icon groups", '<input id="setupGroups" value="' + esc(groups.join(",")) + '">') +
    '<div class="toolbar"><button class="primary" id="saveSetup">Save and build</button><button id="drySetup">Dry run</button></div></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Files</h2><span class="badge">' + state.context.files.length + '</span></div><div class="panel-body"><div class="list">' + fileList() + '</div></div></div>' +
    '</div></div>';
}

function renderTokens() {
  const tokens = state.context.resolvedTokens || [];
  const colorRows = tokens.filter((token) => token.type === "color").map(tokenRow).join("");
  const typeRows = tokens.filter((token) => token.type === "typography").map(tokenRow).join("");
  const scaleRows = tokens.filter((token) => ["spacing","radius"].includes(token.type)).map(tokenRow).join("");
  const lightText = tokenValue("semantic.color.text.default", tokenValue("color.text", "#181B20"));
  const darkText = tokenValue("semantic.color.dark.text.default", tokenValue("semantic.color.text.inverse", "#FFFFFF"));
  const lightSurface = tokenValue("color.inverse", "#FFFFFF");
  const darkSurface = tokenValue("semantic.color.dark.surface", "#181B20");
  const gap = tokenValue("spacing.scale.2", "8px");
  const radius = tokenValue("radius.control.md", "8px");
  return '<div class="section"><h1>Tokens</h1><div class="split"><div class="panel"><div class="panel-head"><h2>Color</h2><span class="badge">' + tokens.filter((token) => token.type === "color").length + '</span></div><div class="panel-body">' + tokenTable(colorRows) + '</div></div><div class="panel"><div class="panel-head"><h2>Dark Mode</h2><button id="saveDarkPreview">Save</button></div><div class="panel-body"><div class="grid"><div class="preview" data-color-scheme="light" style="background:' + esc(lightSurface) + ';color:' + esc(lightText) + '"><span class="badge">light</span>' + field("Text", '<input id="darkLightText" value="' + esc(lightText) + '">') + '<h3>Podo Heading</h3><p>Dashboard body text</p><button class="primary">Button</button></div><div class="preview" data-color-scheme="dark" style="background:' + esc(darkSurface) + ';color:' + esc(darkText) + '"><span class="badge">dark</span>' + field("Text", '<input id="darkDarkText" value="' + esc(darkText) + '">') + '<h3>Podo Heading</h3><p>Dashboard body text</p><button class="primary">Button</button></div></div></div></div></div>' +
    '<div class="grid"><div class="panel"><div class="panel-head"><h2>Typography</h2></div><div class="panel-body">' + tokenTable(typeRows) + '</div></div><div class="panel"><div class="panel-head"><h2>Spacing and Radius</h2><button id="saveScalePreview">Save</button></div><div class="panel-body">' + tokenTable(scaleRows) + '<div class="preview"><div class="row">' + field("Gap", '<input id="previewGap" value="' + esc(gap) + '">') + field("Radius", '<input id="previewRadius" value="' + esc(radius) + '">') + '</div><div style="display:flex;gap:' + esc(gap) + ';align-items:center"><span class="swatch"></span><span class="swatch" style="border-radius:' + esc(radius) + '"></span><span class="swatch" style="border-radius:999px"></span></div></div></div></div></div></div>';
}

function renderComponents() {
  const components = state.context.components || [];
  return '<div class="section"><h1>Components</h1><div class="toolbar"><select id="componentTemplate"><option value="gnb">gnb</option><option value="lng">lng</option></select><input id="componentId" value="gnb"><button id="createComponent" class="primary">Create</button></div>' +
    '<div class="grid">' + components.map(componentPanel).join("") + '</div></div>';
}

function renderIcons() {
  const icons = state.context.icons || { icons: [], groups: {} };
  return '<div class="section"><h1>Icons</h1><div class="grid"><div class="panel"><div class="panel-head"><h2>Groups</h2><button id="saveGroups">Save</button></div><div class="panel-body"><textarea id="groupsJson">' + esc(JSON.stringify(icons.groups, null, 2)) + '</textarea></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>SVG Import</h2><button id="uploadSvg">Import</button></div><div class="panel-body">' + field("Path", '<input id="svgPath" value="custom/icon.svg">') + field("SVG", '<textarea id="svgContents"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4l8 16H4z"/></svg></textarea>') + '</div></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Codepoints</h2><button id="rebuildIcons">Rebuild</button></div><div class="panel-body">' + iconTable(icons.icons) + '</div></div></div>';
}

function renderBuild() {
  const plan = state.buildPlan?.files || [];
  const validationIssues = state.validation?.issues || state.context.issues || [];
  return '<div class="section"><h1>Build</h1><div class="toolbar"><button id="validateProject">Validate</button><button id="buildDryRun">Dry run</button><button class="primary" id="buildProject">Build</button></div>' +
    '<div class="grid"><div class="panel"><div class="panel-head"><h2>Diff</h2><span class="badge">' + plan.length + '</span></div><div class="panel-body">' + buildPlan(plan) + '</div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Validation</h2><span class="badge ' + (validationIssues.length ? "bad" : "good") + '">' + validationIssues.length + '</span></div><div class="panel-body">' + issueList(validationIssues) + '</div></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Target Preview</h2></div><div class="panel-body">' + generatedPreview() + '</div></div></div>';
}

function renderMigration() {
  const plan = state.migrationPlan;
  const files = (plan?.files || []).filter((file) => file.action === "update");
  const conflicts = plan?.conflicts || [];
  const defaultTo = state.context.lock?.packageVersion || "0.0.0";
  return '<div class="section"><h1>Migration</h1><div class="toolbar">' +
    field("Target version", '<input id="migrationTo" value="' + esc(defaultTo) + '">') +
    '<button id="planMigration">Plan</button><button class="primary" id="applyMigration">Apply</button></div>' +
    '<div class="split"><div class="panel"><div class="panel-head"><h2>Manifest</h2><span class="badge">' + esc(plan?.manifest?.riskLevel || "default") + '</span></div><div class="panel-body"><textarea id="migrationManifest" placeholder="{ }"></textarea></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Conflicts</h2><span class="badge ' + (conflicts.some((item) => item.severity === "blocking") ? "bad" : conflicts.length ? "" : "good") + '">' + conflicts.length + '</span></div><div class="panel-body">' + migrationConflictList(conflicts) + '</div></div></div>' +
    '<div class="panel"><div class="panel-head"><h2>File Changes</h2><span class="badge">' + files.length + '</span></div><div class="panel-body">' + migrationFileList(files) + '</div></div></div>';
}

function field(label, control) {
  return '<div class="field"><label>' + label + '</label>' + control + '</div>';
}

function tokenValue(path, fallback) {
  const token = (state.context?.resolvedTokens || []).find((item) => item.path === path);
  if (!token) return fallback;
  return typeof token.value === "object" ? JSON.stringify(token.value) : token.value;
}

function fileList() {
  if (!state.context.files.length) return '<div class="empty">No .podo files</div>';
  return state.context.files.map((file) => '<div class="row"><span class="badge ' + (file.status === "valid" ? "good" : file.status === "invalid" ? "bad" : "") + '">' + esc(file.kind) + '</span><span class="mono">' + esc(file.path) + '</span></div>').join("");
}

function tokenTable(rows) {
  return rows ? '<table><thead><tr><th>Path</th><th>Value</th><th>Source</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' : '<div class="empty">No tokens</div>';
}

function tokenRow(token) {
  const id = "token_" + token.path.replace(/[^a-zA-Z0-9]/g, "_");
  const value = typeof token.value === "object" ? JSON.stringify(token.value) : token.value;
  const swatch = token.type === "color" ? '<span class="swatch" style="background:' + esc(value) + '"></span>' : "";
  return '<tr><td class="mono">' + esc(token.path) + '</td><td>' + swatch + ' <input id="' + id + '" value="' + esc(value) + '"></td><td><span class="badge">' + esc(token.source) + '</span></td><td><button data-save-token="' + esc(token.path) + '" data-token-type="' + esc(token.type) + '" data-input="' + id + '">Save</button></td></tr>';
}

function componentPanel(component) {
  const editorId = "component_json_" + component.id.replace(/[^a-zA-Z0-9]/g, "_");
  return '<div class="panel" data-component-panel="' + esc(component.id) + '"><div class="panel-head"><h2>' + esc(component.name) + '</h2><div class="row"><span class="badge">' + esc(component.source) + '</span><button data-save-component="' + esc(component.id) + '" data-component-path="' + esc(component.path) + '" data-editor="' + editorId + '">Save JSON</button></div></div><div class="panel-body">' +
    '<div class="row"><span class="badge">' + esc(component.category) + '</span><span class="badge">' + esc(component.status) + '</span></div>' +
    '<table><thead><tr><th>Props</th><th>Slots</th><th>States</th></tr></thead><tbody><tr><td>' + esc(component.props.map((prop) => prop.name).join(", ")) + '</td><td>' + esc(component.slots.map((slot) => slot.name).join(", ")) + '</td><td>' + esc(component.states.map((item) => item.name).join(", ")) + '</td></tr></tbody></table>' +
    componentBindingTable(component) +
    '<textarea id="' + editorId + '" data-component-json="' + esc(component.id) + '">' + esc(JSON.stringify(component.document, null, 2)) + '</textarea></div></div>';
}

function componentBindingTable(component) {
  const rows = [];
  Object.entries(component.tokens || {}).forEach(([key, value]) => rows.push(bindingRow(component.id, "tokens", key, value)));
  (component.variants || []).forEach((variant) => Object.entries(variant.tokens || {}).forEach(([key, value]) => rows.push(bindingRow(component.id, "variant:" + variant.name, key, value))));
  (component.states || []).forEach((state) => Object.entries(state.tokens || {}).forEach(([key, value]) => rows.push(bindingRow(component.id, "state:" + state.name, key, value))));
  if (!rows.length) return '<div class="empty">No token bindings</div>';
  return '<table><thead><tr><th>Binding</th><th>Reference</th><th></th></tr></thead><tbody>' + rows.join("") + '</tbody></table><div class="toolbar"><button data-save-bindings="' + esc(component.id) + '">Save bindings</button></div>';
}

function bindingRow(componentId, owner, key, value) {
  const id = "binding_" + [componentId, owner, key].join("_").replace(/[^a-zA-Z0-9]/g, "_");
  return '<tr><td class="mono">' + esc(owner + "." + key) + '</td><td><input id="' + id + '" data-binding-owner="' + esc(owner) + '" data-binding-key="' + esc(key) + '" list="tokenPaths" value="' + esc(value) + '"></td><td><span class="badge">reference</span></td></tr>';
}

function iconTable(icons) {
  if (!icons.length) return '<div class="empty">No icons</div>';
  const counts = icons.reduce((acc, icon) => {
    acc[icon.codepoint] = (acc[icon.codepoint] || 0) + 1;
    return acc;
  }, {});
  return '<table><thead><tr><th>Name</th><th>Codepoint</th><th>Source</th><th>Status</th></tr></thead><tbody>' + icons.map((icon) => '<tr><td>' + esc(icon.name) + '</td><td class="mono">' + esc(icon.codepoint) + '</td><td class="mono">' + esc(icon.source) + '</td><td><span class="badge ' + (counts[icon.codepoint] > 1 ? "bad" : "good") + '">' + (counts[icon.codepoint] > 1 ? "conflict" : "locked") + '</span></td></tr>').join("") + '</tbody></table>';
}

function buildPlan(files) {
  if (!files.length) return '<div class="empty">No build plan</div>';
  return files.map((file) => '<div class="preview"><div class="row"><span class="badge">' + esc(file.action) + '</span><span class="mono">' + esc(file.path) + '</span></div>' + (file.preview ? '<textarea readonly>' + esc(file.preview) + '</textarea>' : '<div class="empty">Binary or generated by icon font build</div>') + '</div>').join("");
}

function issueList(issues) {
  if (!issues.length) return '<div class="empty">No issues</div>';
  return '<table><thead><tr><th>Code</th><th>Path</th><th>Message</th></tr></thead><tbody>' + issues.map((issue) => '<tr><td class="mono">' + esc(issue.code) + '</td><td class="mono">' + esc(issue.path) + '</td><td>' + esc(issue.message) + '</td></tr>').join("") + '</tbody></table>';
}

function migrationConflictList(conflicts) {
  if (!conflicts.length) return '<div class="empty">No conflicts</div>';
  return '<table><thead><tr><th>Severity</th><th>Path</th><th>Message</th></tr></thead><tbody>' + conflicts.map((conflict) => '<tr><td><span class="badge ' + (conflict.severity === "blocking" ? "bad" : "") + '">' + esc(conflict.severity) + '</span></td><td class="mono">' + esc(conflict.path) + '</td><td>' + esc(conflict.message) + '</td></tr>').join("") + '</tbody></table>';
}

function migrationFileList(files) {
  if (!files.length) return '<div class="empty">No migration changes</div>';
  return files.map((file) => '<div class="preview"><div class="row"><span class="badge">' + esc(file.kind) + '</span><span class="mono">' + esc(file.path) + '</span><span class="badge">' + file.operations.length + ' patches</span></div><textarea readonly>' + esc(JSON.stringify(file.after, null, 2).slice(0, 4000)) + '</textarea></div>').join("");
}

function generatedPreview() {
  const files = state.context.generatedPreview || [];
  if (!files.length) return '<div class="empty">No generated preview</div>';
  return files.map((file) => '<div class="preview"><div class="row"><span class="mono">' + esc(file.path) + '</span><span class="badge">' + file.bytes + ' bytes</span></div><textarea readonly>' + esc(file.preview) + '</textarea></div>').join("");
}

function setupPayload(dryRun = false) {
  return {
    target: $("setupTarget").value,
    theme: $("setupTheme").value,
    darkMode: $("setupDark").value === "true",
    outDir: $("setupOutDir").value,
    iconGroups: $("setupGroups").value.split(",").map((item) => item.trim()).filter(Boolean),
    dryRun,
    force: true,
  };
}

function migrationPayload() {
  const manifestText = $("migrationManifest")?.value.trim() || "";
  return {
    to: $("migrationTo")?.value || undefined,
    ...(manifestText ? { manifest: JSON.parse(manifestText) } : {}),
  };
}

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (target.matches("[data-tab]")) {
    state.tab = target.dataset.tab;
    render();
    return;
  }
  try {
    if (target.id === "saveSetup" || target.id === "drySetup") {
      const payloadInput = setupPayload(target.id === "drySetup");
      state.status = "Saving setup";
      render();
      const payload = await api("/api/setup", { method: "POST", body: JSON.stringify(payloadInput) });
      state.buildPlan = payload.build;
      await refresh();
      return;
    }
    if (target.dataset.saveToken) {
      const value = document.getElementById(target.dataset.input).value;
      await saveTokenOverride(target.dataset.saveToken, target.dataset.tokenType, value);
      await refresh();
      return;
    }
    if (target.dataset.saveComponent) {
      const textarea = document.getElementById(target.dataset.editor);
      const documentJson = JSON.parse(textarea.value);
      await saveComponentDocument(target.dataset.componentPath, documentJson);
      await refresh();
      return;
    }
    if (target.dataset.saveBindings) {
      const panel = target.closest("[data-component-panel]");
      const textarea = panel.querySelector("[data-component-json]");
      const documentJson = JSON.parse(textarea.value);
      panel.querySelectorAll("[data-binding-owner]").forEach((input) => applyBinding(documentJson, input.dataset.bindingOwner, input.dataset.bindingKey, input.value));
      textarea.value = JSON.stringify(documentJson, null, 2);
      const saveButton = panel.querySelector("[data-save-component]");
      await saveComponentDocument(saveButton.dataset.componentPath, documentJson);
      await refresh();
      return;
    }
    if (target.id === "saveDarkPreview") {
      await saveTokenOverride("semantic.color.text.default", "color", $("darkLightText").value);
      await saveTokenOverride("semantic.color.dark.text.default", "color", $("darkDarkText").value);
      await refresh();
      return;
    }
    if (target.id === "saveScalePreview") {
      await saveTokenOverride("spacing.scale.2", "spacing", $("previewGap").value);
      await saveTokenOverride("radius.control.md", "radius", $("previewRadius").value);
      await refresh();
      return;
    }
    if (target.id === "createComponent") {
      await api("/api/components/local", { method: "POST", body: JSON.stringify({ template: $("componentTemplate").value, id: $("componentId").value, force: true }) });
      await refresh();
      return;
    }
    if (target.id === "saveGroups") {
      await api("/api/icons/groups", { method: "PUT", body: JSON.stringify({ groups: JSON.parse($("groupsJson").value) }) });
      await refresh();
      return;
    }
    if (target.id === "uploadSvg") {
      await api("/api/icons/svg", { method: "POST", body: JSON.stringify({ path: $("svgPath").value, contents: $("svgContents").value, force: true }) });
      await refresh();
      return;
    }
    if (target.id === "validateProject") {
      state.validation = (await api("/api/validate", { method: "POST", body: "{}" })).report;
      state.status = state.validation.ok ? "Valid" : "Validation failed";
      render();
      return;
    }
    if (target.id === "buildDryRun" || target.id === "buildProject" || target.id === "rebuildIcons") {
      state.buildPlan = (await api("/api/build", { method: "POST", body: JSON.stringify({ dryRun: target.id === "buildDryRun" }) })).result;
      state.status = target.id === "buildDryRun" ? "Dry run complete" : "Build complete";
      await refresh();
      state.tab = "build";
      render();
      return;
    }
    if (target.id === "planMigration" || target.id === "applyMigration") {
      const endpoint = target.id === "planMigration" ? "/api/migration/plan" : "/api/migration/apply";
      const payload = await api(endpoint, { method: "POST", body: JSON.stringify(migrationPayload()) });
      state.migrationPlan = payload.plan;
      state.status = target.id === "planMigration" ? "Migration planned" : "Migration applied";
      await refresh();
      state.tab = "migration";
      render();
    }
  } catch (error) {
    state.status = error.message;
    render();
  }
});

async function saveTokenOverride(path, type, value) {
  await api("/api/tokens/override", {
    method: "POST",
    body: JSON.stringify({ path, type, value, force: true }),
  });
}

async function saveComponentDocument(path, documentJson) {
  await api("/api/files", {
    method: "PUT",
    body: JSON.stringify({
      path,
      contents: JSON.stringify(documentJson, null, 2) + "\\n",
      force: true,
    }),
  });
}

function applyBinding(documentJson, owner, key, value) {
  if (owner === "tokens") {
    documentJson.tokens = documentJson.tokens || {};
    documentJson.tokens[key] = value;
    return;
  }
  const [kind, name] = owner.split(":");
  const collection = kind === "variant" ? documentJson.variants : documentJson.states;
  const item = (collection || []).find((entry) => entry.name === name);
  if (item) {
    item.tokens = item.tokens || {};
    item.tokens[key] = value;
  }
}

refresh().catch((error) => {
  state.status = error.message;
  render();
});
`;
}

function normalizeSetupInput(input: Partial<StudioSetupInput>): StudioSetupInput {
  const target = toStudioTarget(input.target ?? "react");
  const theme = input.theme?.trim() || "dashboard";
  const outDir = input.outDir?.trim() || "src/podo";
  return {
    target,
    theme,
    outDir,
    darkMode: input.darkMode ?? true,
    iconGroups: input.iconGroups?.length ? input.iconGroups : ["navigation"],
    force: Boolean(input.force),
    dryRun: Boolean(input.dryRun),
  };
}

function normalizeBuildInput(input: Partial<StudioBuildInput>): StudioBuildInput {
  return {
    ...(input.target ? { target: toStudioTarget(input.target) } : {}),
    ...(input.outDir ? { outDir: input.outDir } : {}),
    dryRun: Boolean(input.dryRun),
    force: Boolean(input.force),
  };
}

function validateWritableFile(path: string, contents: string): ValidationIssue[] {
  const normalized = path.replaceAll("\\", "/");
  if (normalized.endsWith(".svg")) {
    return validateSvgContents(normalized, contents);
  }
  if (!normalized.endsWith(".json")) {
    return [
      {
        code: "studio.file.unsupported",
        path,
        message: "Only JSON specs and SVG icon sources can be edited in Studio.",
      },
    ];
  }

  try {
    const json = JSON.parse(contents);
    if (normalized.endsWith(".podo/config.json")) {
      parsePodoConfig(json);
    } else if (normalized.endsWith(".podo/lock.json")) {
      parsePodoLock(json);
    } else if (normalized.endsWith(".tokens.json")) {
      parseTokenDocument(json);
    } else if (normalized.endsWith(".component.json")) {
      parseComponentDocument(json);
    } else if (normalized.endsWith(".page.json")) {
      parsePageDocument(json);
    } else if (normalized.endsWith(".podo/icons/manifest.json")) {
      parseIconManifest(json);
    }
    return [];
  } catch (error) {
    return [
      {
        code: "studio.file.invalid",
        path,
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}

function validateSvgContents(path: string, contents: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!contents.includes("<svg") || !contents.includes("</svg>")) {
    issues.push({
      code: "studio.svg.invalid",
      path,
      message: "SVG source must contain an svg root.",
    });
  }
  if (/<script[\s>]/i.test(contents)) {
    issues.push({
      code: "studio.svg.script",
      path,
      message: "SVG source cannot contain script tags.",
    });
  }
  return issues;
}

async function writeTokenOverride(
  root: string,
  input: { path: string; type: string; value: string; dryRun: boolean; force: boolean }
): Promise<{ ok: true; dryRun: boolean; path: string; document: TokenDocument }> {
  const filePath = resolvePodoPath(root, ".podo/themes/studio-overrides.tokens.json");
  const existing = await readJsonRecord(filePath, root);
  const base =
    existing?.json && !existing.issues.length
      ? parseTokenDocument(existing.json)
      : ({
          schemaVersion: PODO_SCHEMA_VERSION,
          kind: "tokens",
          category: "theme",
          tokens: {},
        } satisfies TokenDocument);
  setNestedToken(base.tokens as Record<string, unknown>, input.path.split("."), {
    $type: normalizeTokenType(input.type),
    $value: parseTokenInputValue(input.value),
  });
  const document = parseTokenDocument(base);
  if (!input.dryRun) {
    await writeProjectFile(filePath, `${JSON.stringify(document, null, 2)}\n`, true);
  }
  return { ok: true, dryRun: input.dryRun, path: relativePath(root, filePath), document };
}

function setNestedToken(
  target: Record<string, unknown>,
  segments: string[],
  token: { $type: string; $value: unknown }
): void {
  const [head, ...tail] = segments;
  if (!head) {
    throw new Error("Token path cannot be empty.");
  }
  if (tail.length === 0) {
    target[head] = token;
    return;
  }
  const current = target[head];
  if (!current || typeof current !== "object" || Array.isArray(current) || "$value" in current) {
    target[head] = {};
  }
  setNestedToken(target[head] as Record<string, unknown>, tail, token);
}

function parseTokenInputValue(value: string): unknown {
  const trimmed = value.trim();
  const looksLikeJson =
    (trimmed.startsWith("{") && trimmed.endsWith("}") && !/^\{[^":,{}]+\}$/.test(trimmed)) ||
    trimmed.startsWith("[") ||
    trimmed.startsWith('"');
  if (looksLikeJson) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }
  return value;
}

function normalizeTokenType(value: string): string {
  if (
    value === "color" ||
    value === "typography" ||
    value === "spacing" ||
    value === "radius" ||
    value === "shadow" ||
    value === "motion"
  ) {
    return value;
  }
  return "color";
}

async function writeSetupFiles(root: string, input: StudioSetupInput): Promise<void> {
  const podoRoot = join(root, ".podo");
  const directories = [
    podoRoot,
    join(podoRoot, "tokens"),
    join(podoRoot, "themes"),
    join(podoRoot, "components/local"),
    join(podoRoot, "icons/svg"),
    join(podoRoot, "generated"),
    join(podoRoot, "cache"),
  ];
  for (const directory of directories) {
    await mkdir(directory, { recursive: true });
  }

  const config: PodoConfig = {
    schemaVersion: PODO_SCHEMA_VERSION,
    environment: input.target === "native" ? "react-native" : input.target,
    darkMode: {
      enabled: input.darkMode,
      strategy: input.target === "native" ? "native" : "data-attribute",
    },
    themes: {
      default: input.theme,
      available: ["landing", "dashboard", "custom"],
    },
    build: {
      targets: [input.target],
      outDir: input.outDir,
    },
  };
  const lock: PodoLock = {
    schemaVersion: PODO_SCHEMA_VERSION,
    packageVersion: "0.0.0",
    migrations: [],
    generatedHash: hashJson(config),
  };

  await writeProjectFile(
    join(podoRoot, "config.json"),
    `${JSON.stringify(config, null, 2)}\n`,
    input.force ?? false
  );
  await writeProjectFile(
    join(podoRoot, "lock.json"),
    `${JSON.stringify(lock, null, 2)}\n`,
    input.force ?? false
  );
}

async function writeIconManifestGroups(root: string, groups: string[]): Promise<void> {
  const manifest = await loadIconManifest(root);
  const nextGroups: Record<string, string[]> = {};
  for (const group of groups) {
    nextGroups[group] = manifest.groups[group] ?? [];
  }
  const nextManifest: IconManifest = { ...manifest, groups: nextGroups };
  await writeProjectFile(
    join(root, ".podo/icons/manifest.json"),
    `${JSON.stringify(nextManifest, null, 2)}\n`,
    true
  );
}

async function loadIconManifest(root: string): Promise<IconManifest> {
  const record = await readJsonRecord(join(root, ".podo/icons/manifest.json"), root);
  if (!record?.json) {
    return studioDefaultIconManifest;
  }
  return parseIconManifest(record.json);
}

function createComponentTemplate(
  template: "gnb" | "lng",
  id: string,
  name?: string
): ComponentDocument {
  if (template === "lng") {
    return parseComponentDocument({
      ...baseComponentTemplate(id, name ?? "Language Navigation", "organism"),
      slots: [
        { name: "trigger", required: true, fallback: "Language" },
        { name: "items", required: true, repeated: true },
      ],
      props: [
        { name: "currentLocale", type: { kind: "string" }, required: true },
        { name: "open", type: { kind: "boolean" }, default: false },
      ],
      states: [{ name: "open" }, { name: "focusVisible" }],
      accessibility: {
        role: "navigation",
        aria: ["aria-label", "aria-expanded"],
        keyboard: ["Escape", "ArrowDown"],
      },
    });
  }

  return parseComponentDocument({
    ...baseComponentTemplate(id, name ?? "Global Navigation", "organism"),
    slots: [
      { name: "brand", required: true },
      { name: "primary", required: true, repeated: true },
      { name: "actions", repeated: true },
    ],
    props: [
      { name: "sticky", type: { kind: "boolean" }, default: false },
      { name: "currentPath", type: { kind: "string" } },
    ],
    states: [{ name: "open" }, { name: "focusVisible" }],
    accessibility: {
      role: "navigation",
      aria: ["aria-label", "aria-current"],
      keyboard: ["Tab", "Escape"],
    },
  });
}

function baseComponentTemplate(
  id: string,
  name: string,
  category: ComponentDocument["category"]
): ComponentDocument {
  return parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id,
    name,
    category,
    status: "draft",
    anatomy: [{ name: "root" }, { name: "content" }, { name: "item" }],
    slots: [],
    props: [],
    variants: [{ name: "density", values: ["compact", "comfortable"], default: "comfortable" }],
    states: [],
    tokens: {
      "root.background": "{color.inverse}",
      "item.color": "{semantic.color.text.default}",
    },
    targets: supportedTargets(),
    accessibility: { role: "navigation", aria: ["aria-label"], keyboard: ["Tab"] },
    examples: [],
  });
}

function parseOptionalRecord<T>(
  record: JsonFileRecord | undefined,
  parser: (value: unknown) => T,
  kind: StudioFileSummary["kind"],
  files: StudioFileSummary[],
  issues: ValidationIssue[]
): T | undefined {
  if (!record) {
    return undefined;
  }
  if (record.issues.length || record.json === undefined) {
    files.push({ path: record.path, kind, status: "invalid", issues: record.issues });
    issues.push(...record.issues);
    return undefined;
  }
  try {
    const parsed = parser(record.json);
    files.push({ path: record.path, kind, status: "valid", issues: [] });
    return parsed;
  } catch (error) {
    const parseIssue = {
      code: `studio.${kind}.invalid`,
      path: record.path,
      message: error instanceof Error ? error.message : String(error),
    };
    files.push({ path: record.path, kind, status: "invalid", issues: [parseIssue] });
    issues.push(parseIssue);
    return undefined;
  }
}

function parseTokenRecord(
  record: JsonFileRecord,
  kind: "token" | "theme",
  files: StudioFileSummary[],
  issues: ValidationIssue[]
): TokenSource | undefined {
  const document = parseOptionalRecord(record, parseTokenDocument, kind, files, issues);
  return document ? { document, filePath: record.path, tier: "project" } : undefined;
}

function parseComponentRecord(
  record: JsonFileRecord,
  files: StudioFileSummary[],
  issues: ValidationIssue[]
): ComponentDocument | undefined {
  return parseOptionalRecord(record, parseComponentDocument, "component", files, issues);
}

function summarizeComponent(
  component: ComponentDocument,
  source: "package" | "project",
  path = `.podo/components/local/${component.id}.component.json`
): StudioComponentSummary {
  return {
    id: component.id,
    name: component.name,
    category: component.category,
    status: component.status,
    source,
    path,
    props: component.props,
    variants: component.variants,
    states: component.states,
    slots: component.slots,
    tokens: component.tokens,
    targets: component.targets,
    document: component,
  };
}

function summarizeIcons(manifest: IconManifest): StudioIconSummary {
  return {
    fontFamily: manifest.fontFamily,
    icons: Object.entries(manifest.icons)
      .map(([name, icon]) => ({ name, ...icon }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    groups: manifest.groups,
  };
}

async function readGeneratedPreview(
  root: string,
  config: PodoConfig | undefined
): Promise<StudioGeneratedPreview[]> {
  const outDirs = [config?.build.outDir, ".podo/generated"].filter(Boolean) as string[];
  const previews: StudioGeneratedPreview[] = [];
  for (const outDir of outDirs) {
    const records = await readTextRecords(join(root, outDir), ".ts", ".tsx", ".css", ".json");
    for (const record of records.slice(0, 12 - previews.length)) {
      previews.push({
        path: relativePath(root, record.path),
        bytes: Buffer.byteLength(record.contents),
        preview: record.contents.slice(0, 4000),
      });
      if (previews.length >= 12) {
        return previews;
      }
    }
  }
  return previews;
}

async function readJsonRecord(
  filePath: string,
  root = dirname(filePath)
): Promise<JsonFileRecord | undefined> {
  const contents = await readText(filePath);
  if (contents === undefined) {
    return undefined;
  }
  const path = relativePath(root, filePath);
  try {
    return { path, contents, json: JSON.parse(contents), issues: [] };
  } catch (error) {
    return {
      path,
      contents,
      issues: [
        {
          code: "studio.json.invalid",
          path,
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

async function readJsonRecords(directory: string, root: string): Promise<JsonFileRecord[]> {
  const files = await findFiles(directory, (name) => name.endsWith(".json"));
  return (await Promise.all(files.map((filePath) => readJsonRecord(filePath, root)))).filter(
    (record): record is JsonFileRecord => Boolean(record)
  );
}

async function readTextRecords(
  directory: string,
  ...extensions: string[]
): Promise<Array<{ path: string; contents: string }>> {
  const files = await findFiles(directory, (name) =>
    extensions.some((extension) => name.endsWith(extension))
  );
  return (
    await Promise.all(
      files.map(async (filePath) => {
        const contents = await readText(filePath);
        return contents === undefined ? undefined : { path: filePath, contents };
      })
    )
  ).filter((record): record is { path: string; contents: string } => Boolean(record));
}

async function findFiles(
  directory: string,
  predicate: (name: string) => boolean
): Promise<string[]> {
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
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        return findFiles(entryPath, predicate);
      }
      return entry.isFile() && predicate(entry.name) ? [entryPath] : [];
    })
  );
  return nested.flat().sort((a, b) => a.localeCompare(b));
}

async function readText(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function createFileWritePlan(
  path: string,
  previousContents: string | undefined,
  nextContents: string
): {
  path: string;
  action: "create" | "update" | "unchanged";
  changed: boolean;
  nextHash: string;
  previousHash?: string;
  preview: { before: string; after: string };
} {
  const action =
    previousContents === undefined
      ? "create"
      : previousContents === nextContents
        ? "unchanged"
        : "update";
  return {
    path,
    action,
    changed: previousContents !== nextContents,
    ...(previousContents !== undefined ? { previousHash: hashText(previousContents) } : {}),
    nextHash: hashText(nextContents),
    preview: {
      before: previousContents?.slice(0, 4000) ?? "",
      after: nextContents.slice(0, 4000),
    },
  };
}

async function writeProjectFile(filePath: string, contents: string, force: boolean): Promise<void> {
  if (!force && (await exists(filePath))) {
    throw new Error(`${filePath} already exists. Pass force to overwrite.`);
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

async function exists(filePath: string): Promise<boolean> {
  return stat(filePath)
    .then(() => true)
    .catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    });
}

async function detectProjectTarget(root: string): Promise<StudioTarget> {
  const packageJson = await readJsonRecord(join(root, "package.json"), root);
  const value = packageJson?.json;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "web";
  }
  const record = value as Record<string, unknown>;
  const dependencies = {
    ...(isRecord(record.dependencies) ? record.dependencies : {}),
    ...(isRecord(record.devDependencies) ? record.devDependencies : {}),
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

function resolvePodoPath(root: string, unsafePath: string): string {
  const normalized = unsafePath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized !== ".podo" && !normalized.startsWith(".podo/")) {
    throw new Error(`Studio can only read and write .podo paths. Received ${unsafePath}.`);
  }
  const podoRoot = resolve(root, ".podo");
  const absolute = resolve(root, normalized);
  if (absolute !== podoRoot && !absolute.startsWith(`${podoRoot}${sep}`)) {
    throw new Error(`Path escapes .podo: ${unsafePath}.`);
  }
  return absolute;
}

function relativePath(root: string, filePath: string): string {
  return relative(root, filePath).replaceAll("\\", "/");
}

function toStudioTarget(value: string): StudioTarget {
  if (value === "web" || value === "react" || value === "hono" || value === "native") {
    return value;
  }
  if (value === "react-native") {
    return "native";
  }
  throw new Error(`Unsupported Studio target "${value}".`);
}

function normalizeIdentifier(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "component";
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function errorPayload(code: string, message: string): { ok: false; issues: ValidationIssue[] } {
  return { ok: false, issues: [{ code, path: "studio", message }] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function supportedTargets(): ComponentDocument["targets"] {
  return {
    web: { supported: true, limitations: [] },
    react: { supported: true, limitations: [] },
    hono: { supported: true, limitations: [] },
    native: { supported: true, limitations: [] },
  };
}

const studioDefaultTokens: TokenDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "tokens",
  category: "theme",
  tokens: {
    color: {
      brand: { $type: "color", $value: "#2F6FDB" },
      text: { $type: "color", $value: "#181B20" },
      inverse: { $type: "color", $value: "#FFFFFF" },
      danger: { $type: "color", $value: "#B42318" },
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
    spacing: {
      scale: {
        "1": { $type: "spacing", $value: "4px" },
        "2": { $type: "spacing", $value: "8px" },
        "4": { $type: "spacing", $value: "16px" },
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

const studioDefaultComponents: ComponentDocument[] = [
  parseComponentDocument({
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
    states: [{ name: "disabled" }, { name: "loading" }, { name: "focusVisible" }],
    tokens: {
      "root.background": "{color.brand}",
      "label.color": "{semantic.color.text.inverse}",
    },
    targets: supportedTargets(),
    accessibility: { role: "button", aria: ["aria-disabled"], keyboard: ["Enter", "Space"] },
    examples: [],
  }),
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "field",
    name: "Field",
    category: "molecule",
    status: "stable",
    anatomy: [{ name: "root" }, { name: "label" }, { name: "control" }],
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
    accessibility: { aria: ["aria-describedby", "aria-invalid"] },
    examples: [],
  }),
];

const studioDefaultIconManifest: IconManifest = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "icons",
  fontFamily: "PodoIcons",
  icons: {
    menu: { codepoint: "E001", source: "navigation/menu.svg", tags: ["navigation"] },
    "chevron-left": {
      codepoint: "E002",
      source: "navigation/chevron-left.svg",
      tags: ["navigation"],
    },
  },
  groups: { navigation: ["menu", "chevron-left"], editor: [] },
  codepointLock: { menu: "E001", "chevron-left": "E002" },
};
