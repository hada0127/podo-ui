import type { Dirent } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  collectTokenPaths,
  parseComponentDocument,
  parseIconManifest,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  PODO_SCHEMA_VERSION,
  validateComponentTokenBindings,
  validateIconManifest,
  type ComponentDocument,
  type ValidationIssue,
} from "@podo/spec";
import {
  flattenTokenTree,
  mergeTokenDocuments,
  resolveTokenDocument,
  validateTokenBuild,
  type ResolvedTokenBundle,
  type TokenSource,
} from "@podo/tokens";
import { defaultMcpComponents, defaultMcpIconManifest, defaultMcpTokens } from "./defaults.js";
import type { McpProjectContext, McpTokenMetadata } from "./types.js";

export async function loadMcpProject(root = process.cwd()): Promise<McpProjectContext> {
  const projectRoot = await findProjectRoot(root);
  const issues: ValidationIssue[] = [];
  const config = await readParsed(join(projectRoot, ".podo/config.json"), parsePodoConfig, issues);
  const lock = await readParsed(join(projectRoot, ".podo/lock.json"), parsePodoLock, issues);
  if (lock && lock.schemaVersion !== PODO_SCHEMA_VERSION) {
    issues.push({
      code: "podo.lock.schemaMismatch",
      path: ".podo/lock.json",
      message: `Lock schema ${lock.schemaVersion} does not match ${PODO_SCHEMA_VERSION}. Run podo migrate.`,
    });
  }

  const tokenSources = await loadTokenSources(projectRoot, issues);
  const tokenIssues = validateTokenBuild(tokenSources);
  issues.push(...tokenIssues);
  const tokenBundle: ResolvedTokenBundle | undefined =
    tokenIssues.length === 0 ? resolveTokenDocument(mergeTokenDocuments(tokenSources)) : undefined;
  const resolvedTokens = tokenBundle ? Object.values(tokenBundle.tokens) : [];
  const tokenMetadata = collectTokenMetadata(tokenSources);
  const tokenPaths = tokenSources
    .flatMap((source) => collectTokenPaths(source.document.tokens))
    .sort();
  const components = await loadComponents(projectRoot, tokenPaths, issues);
  const icons =
    (await readParsed(join(projectRoot, ".podo/icons/manifest.json"), parseIconManifest, issues)) ??
    defaultMcpIconManifest;
  issues.push(...validateIconManifest(icons));

  return {
    root: projectRoot,
    version: "0.0.0",
    schemaVersion: PODO_SCHEMA_VERSION,
    tokenSources,
    tokens: resolvedTokens,
    ...(tokenBundle ? { tokenBundle } : {}),
    tokenMetadata,
    tokenPaths,
    components,
    icons,
    issues,
    ...(config ? { config } : {}),
    ...(lock ? { lock } : {}),
  };
}

function collectTokenMetadata(sources: TokenSource[]): Record<string, McpTokenMetadata> {
  const metadata: Record<string, McpTokenMetadata> = {};
  for (const source of sources) {
    for (const [path, token] of Object.entries(flattenTokenTree(source.document.tokens))) {
      metadata[path] = {
        roles: token.$extensions?.podo?.roles ?? [],
        ...(token.$description ? { description: token.$description } : {}),
      };
    }
  }
  return metadata;
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

async function loadTokenSources(root: string, issues: ValidationIssue[]): Promise<TokenSource[]> {
  const sources: TokenSource[] = [
    { document: defaultMcpTokens, filePath: "podo:mcp-default-tokens", tier: "package" },
  ];
  for (const directory of [join(root, ".podo/tokens"), join(root, ".podo/themes")]) {
    for (const filePath of await findJsonFiles(directory)) {
      const document = await readParsed(filePath, parseTokenDocument, issues);
      if (document) {
        sources.push({ document, filePath: relativePodoPath(root, filePath), tier: "project" });
      }
    }
  }
  return sources;
}

async function loadComponents(
  root: string,
  tokenPaths: string[],
  issues: ValidationIssue[]
): Promise<ComponentDocument[]> {
  const components = new Map<string, ComponentDocument>();
  for (const component of defaultMcpComponents) {
    components.set(component.id, component);
  }
  for (const filePath of await findJsonFiles(join(root, ".podo/components"))) {
    const component = await readParsed(filePath, parseComponentDocument, issues);
    if (component) {
      components.set(component.id, component);
      issues.push(...validateComponentTokenBindings(component, tokenPaths));
    }
  }
  return [...components.values()];
}

async function readParsed<T>(
  filePath: string,
  parser: (input: unknown) => T,
  issues: ValidationIssue[]
): Promise<T | undefined> {
  const text = await readText(filePath);
  if (text === undefined) {
    return undefined;
  }
  try {
    return parser(JSON.parse(text));
  } catch (error) {
    issues.push({
      code: "mcp.project.invalidJson",
      path: filePath,
      message: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

async function findJsonFiles(directory: string): Promise<string[]> {
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
        return findJsonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
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

function relativePodoPath(root: string, filePath: string): string {
  return filePath.replace(resolve(root), "").replace(/^\/+/, "");
}
