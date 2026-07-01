import {
  collectTokenPaths,
  extractAliasReferences,
  isDesignToken,
  validateTokenReferences,
  type DesignToken,
  type TokenDocument,
  type TokenTree,
  type ValidationIssue,
} from "@podo/spec";

export { emitLegacyGridCss, emitLegacyGridScss, legacyGridContract } from "./legacy-grid.js";

export type TokenSourceTier = "package" | "project";

export interface TokenSource {
  document: TokenDocument;
  filePath: string;
  tier: TokenSourceTier;
}

export interface LoadTokenDocumentsOptions {
  packageTokensDir: string;
  projectTokensDir?: string;
}

export interface TokenOrigin {
  filePath: string;
  tier: TokenSourceTier;
}

export interface MergedTokenDocument {
  schemaVersion: "2.0.0";
  kind: "tokens";
  category: "theme";
  tokens: TokenTree;
  origins: Record<string, TokenOrigin>;
}

export interface ResolvedToken {
  path: string;
  type: DesignToken["$type"];
  value: unknown;
  rawValue: unknown;
  references: string[];
  origin?: TokenOrigin;
}

export interface ResolvedTokenBundle {
  tokens: Record<string, ResolvedToken>;
  origins: Record<string, TokenOrigin>;
}

export interface ThemeSelection {
  theme: string;
  colorScheme: "light" | "dark";
  knownThemes?: string[];
  knownColorSchemes?: Array<"light" | "dark">;
}

const resolvedSourceDocuments = new WeakMap<ResolvedTokenBundle, MergedTokenDocument>();

export function mergeTokenDocuments(sources: TokenSource[]): MergedTokenDocument {
  const tokens: TokenTree = {};
  const origins: Record<string, TokenOrigin> = {};

  for (const source of sources) {
    mergeTokenTree(tokens, source.document.tokens, [], source, origins);
  }

  return {
    schemaVersion: "2.0.0",
    kind: "tokens",
    category: "theme",
    tokens,
    origins,
  };
}

export function validateTokenBuild(sources: TokenSource[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenByTier = new Map<string, TokenSource>();

  for (const source of sources) {
    for (const tokenPath of collectTokenPaths(source.document.tokens)) {
      const duplicateKey = `${source.tier}:${tokenPath}`;
      const existing = seenByTier.get(duplicateKey);
      if (existing) {
        issues.push({
          code: "token.duplicate",
          path: tokenPath,
          message: `Token "${tokenPath}" is duplicated in ${existing.filePath} and ${source.filePath}.`,
        });
      }
      seenByTier.set(duplicateKey, source);
    }
  }

  issues.push(...validateTokenReferences(mergeTokenDocuments(sources)));

  return issues;
}

export function resolveTokenDocument(document: MergedTokenDocument): ResolvedTokenBundle {
  const flat = flattenTokenTree(document.tokens);
  const resolved: Record<string, ResolvedToken> = {};
  const resolving = new Set<string>();

  const resolvePath = (path: string): ResolvedToken => {
    if (resolved[path]) {
      return resolved[path];
    }

    const token = flat[path];
    if (!token) {
      throw new Error(`Token "${path}" does not exist.`);
    }

    if (resolving.has(path)) {
      throw new Error(`Circular token reference detected at "${path}".`);
    }

    resolving.add(path);
    const references = extractAliasReferences(token.$value);
    const value = resolveValue(token.$value, resolvePath);
    resolving.delete(path);

    const origin = document.origins[path];
    const resolvedToken: ResolvedToken = {
      path,
      type: token.$type,
      value,
      rawValue: token.$value,
      references,
      ...(origin ? { origin } : {}),
    };

    resolved[path] = resolvedToken;
    return resolvedToken;
  };

  for (const path of Object.keys(flat)) {
    resolvePath(path);
  }

  const bundle = { tokens: resolved, origins: document.origins };
  resolvedSourceDocuments.set(bundle, document);
  return bundle;
}

export function selectThemeTokenDocument(
  document: MergedTokenDocument,
  selection: ThemeSelection
): MergedTokenDocument {
  const tokens: TokenTree = {};
  const origins: Record<string, TokenOrigin> = {};
  const projections = Object.entries(flattenTokenTree(document.tokens)).flatMap(
    ([path, token], order) => {
      const projection = projectThemePath(path, selection);
      if (projection === false) {
        return [];
      }

      return [{ order, path, projection, token }];
    }
  );

  projections.sort(
    (a, b) => a.projection.specificity - b.projection.specificity || a.order - b.order
  );

  for (const { path, projection, token } of projections) {
    setTokenAtPath(tokens, projection.path.split("."), {
      ...token,
      $value: projectAliasReferences(token.$value, selection),
    });

    const origin = document.origins[path];
    if (origin) {
      origins[projection.path] = origin;
    }
  }

  return {
    schemaVersion: document.schemaVersion,
    kind: document.kind,
    category: document.category,
    tokens,
    origins,
  };
}

export function selectThemeTokens(
  bundle: ResolvedTokenBundle,
  selection: ThemeSelection
): ResolvedTokenBundle {
  const sourceDocument = resolvedSourceDocuments.get(bundle);
  if (sourceDocument) {
    return resolveTokenDocument(selectThemeTokenDocument(sourceDocument, selection));
  }

  const selected: Record<string, ResolvedToken> = {};
  const projections = Object.values(bundle.tokens).flatMap((token, order) => {
    const projection = projectThemePath(token.path, selection);
    if (projection === false) {
      return [];
    }

    return [{ order, projection, token }];
  });

  projections.sort(
    (a, b) => a.projection.specificity - b.projection.specificity || a.order - b.order
  );

  for (const { projection, token } of projections) {
    selected[projection.path] = { ...token, path: projection.path };
  }

  return { tokens: selected, origins: bundle.origins };
}

// Breakpoints mirror the legacy grid so type scale and layout switch together:
// desktop (pc) is the base, tablet 768–1279px, mobile ≤767px.
const RESPONSIVE_BREAKPOINTS: Array<{ key: "tablet" | "mobile"; media: string }> = [
  { key: "tablet", media: "screen and (min-width: 768px) and (max-width: 1279px)" },
  { key: "mobile", media: "screen and (max-width: 767px)" },
];

export function emitCssVariables(
  bundle: ResolvedTokenBundle,
  options: { themes: string[]; colorSchemes: Array<"light" | "dark">; prefix?: string }
): string {
  const prefix = options.prefix ?? "podo";
  const blocks: string[] = [];
  for (const theme of options.themes) {
    for (const colorScheme of options.colorSchemes) {
      const scoped = selectThemeTokens(bundle, { theme, colorScheme });
      const selector = `[data-podo-theme="${theme}"][data-color-scheme="${colorScheme}"]`;
      const baseLines = flattenCssVariables(scoped, prefix).map(
        ([name, value]) => `  ${name}: ${value};`
      );
      blocks.push(`${selector} {\n${baseLines.join("\n")}\n}`);

      // Responsive sizes (e.g. typography fontSize) emit their pc value as the base
      // var above and a media-query override per breakpoint here.
      for (const breakpoint of RESPONSIVE_BREAKPOINTS) {
        const overrides = flattenResponsiveOverrides(scoped, prefix, breakpoint.key);
        if (overrides.length === 0) {
          continue;
        }
        const overrideLines = overrides.map(([name, value]) => `    ${name}: ${value};`);
        blocks.push(
          `@media ${breakpoint.media} {\n  ${selector} {\n${overrideLines.join("\n")}\n  }\n}`
        );
      }
    }
  }

  return `${blocks.join("\n\n")}\n`;
}

export function emitTypeScriptTokens(bundle: ResolvedTokenBundle, exportName = "tokens"): string {
  const nested = nestResolvedTokens(bundle);
  const paths = Object.keys(bundle.tokens)
    .sort()
    .map((path) => JSON.stringify(path))
    .join(" | ");

  return `export const ${exportName} = ${JSON.stringify(nested, null, 2)} as const;\n\nexport type TokenPath = ${paths || "never"};\n`;
}

export function emitReactNativeTokens(bundle: ResolvedTokenBundle, exportName = "tokens"): string {
  const nested = nestResolvedTokens(bundle, toReactNativeValue);
  return `export const ${exportName} = ${JSON.stringify(nested, null, 2)} as const;\n`;
}

export function emitTokenJsonBundle(bundle: ResolvedTokenBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function flattenTokenTree(
  tree: TokenTree,
  prefix: string[] = []
): Record<string, DesignToken> {
  const result: Record<string, DesignToken> = {};

  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (isDesignToken(value)) {
      result[path.join(".")] = value;
    } else {
      Object.assign(result, flattenTokenTree(value, path));
    }
  }

  return result;
}

function mergeTokenTree(
  target: TokenTree,
  source: TokenTree,
  prefix: string[],
  sourceInfo: TokenSource,
  origins: Record<string, TokenOrigin>
): void {
  for (const [key, value] of Object.entries(source)) {
    const path = [...prefix, key];
    if (isDesignToken(value)) {
      target[key] = value;
      origins[path.join(".")] = { filePath: sourceInfo.filePath, tier: sourceInfo.tier };
      continue;
    }

    const existing = target[key];
    if (!existing || isDesignToken(existing)) {
      target[key] = {};
    }
    mergeTokenTree(target[key] as TokenTree, value, path, sourceInfo, origins);
  }
}

function resolveValue(value: unknown, resolvePath: (path: string) => ResolvedToken): unknown {
  if (typeof value === "string") {
    const exactAlias = value.match(/^\{([^}]+)\}$/);
    if (exactAlias?.[1]) {
      return resolvePath(exactAlias[1]).value;
    }

    const exactPointer = value.match(/^#\/tokens\/(.+)\/\$value$/);
    if (exactPointer?.[1]) {
      return resolvePath(exactPointer[1].replaceAll("/", ".")).value;
    }

    return value.replaceAll(/\{([^}]+)\}/g, (_, tokenPath: string) =>
      String(resolvePath(tokenPath).value)
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, resolvePath));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveValue(item, resolvePath)])
    );
  }

  return value;
}

interface ProjectedThemePath {
  path: string;
  specificity: number;
}

function projectThemePath(path: string, selection: ThemeSelection): ProjectedThemePath | false {
  const segments = path.split(".");
  const knownThemes = new Set(selection.knownThemes ?? ["landing", "dashboard", "custom"]);
  const knownColorSchemes = new Set<string>(selection.knownColorSchemes ?? ["light", "dark"]);
  const projected: string[] = [];
  let specificity = 0;

  for (const segment of segments) {
    if (knownThemes.has(segment)) {
      if (segment !== selection.theme) {
        return false;
      }
      specificity += 1;
      continue;
    }

    if (knownColorSchemes.has(segment)) {
      if (segment !== selection.colorScheme) {
        return false;
      }
      specificity += 1;
      continue;
    }

    projected.push(segment);
  }

  return { path: projected.join("."), specificity };
}

function projectAliasReferences(value: unknown, selection: ThemeSelection): unknown {
  if (typeof value === "string") {
    const exactAlias = value.match(/^\{([^}]+)\}$/);
    if (exactAlias?.[1]) {
      return `{${projectReferencePath(exactAlias[1], selection)}}`;
    }

    const exactPointer = value.match(/^#\/tokens\/(.+)\/\$value$/);
    if (exactPointer?.[1]) {
      const path = exactPointer[1].replaceAll("/", ".");
      return `#/tokens/${projectReferencePath(path, selection).replaceAll(".", "/")}/$value`;
    }

    return value.replaceAll(/\{([^}]+)\}/g, (_, tokenPath: string) => {
      return `{${projectReferencePath(tokenPath, selection)}}`;
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) => projectAliasReferences(item, selection));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, projectAliasReferences(item, selection)])
    );
  }

  return value;
}

function projectReferencePath(path: string, selection: ThemeSelection): string {
  const projection = projectThemePath(path, selection);
  return projection === false ? path : projection.path;
}

function setTokenAtPath(target: TokenTree, segments: string[], token: DesignToken): void {
  const [head, ...tail] = segments;
  if (!head) {
    throw new Error("Cannot project a token to an empty path.");
  }

  if (tail.length === 0) {
    target[head] = token;
    return;
  }

  const current = target[head];
  if (!current || isDesignToken(current)) {
    target[head] = {};
  }

  setTokenAtPath(target[head] as TokenTree, tail, token);
}

function flattenCssVariables(bundle: ResolvedTokenBundle, prefix: string): Array<[string, string]> {
  return Object.values(bundle.tokens)
    .flatMap((token) => flattenValue(token.path, token.value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, value]) => [`--${prefix}-${path.replaceAll(".", "-")}`, toCssValue(value)]);
}

const RESPONSIVE_KEYS = new Set(["pc", "tablet", "mobile"]);

/** A `{ pc, tablet?, mobile? }` breakpoint map (the base value lives under `pc`). */
function isResponsiveValue(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "pc" in (value as Record<string, unknown>) &&
    Object.keys(value as Record<string, unknown>).every((key) => RESPONSIVE_KEYS.has(key))
  );
}

function flattenValue(path: string, value: unknown): Array<[string, unknown]> {
  if (isResponsiveValue(value)) {
    // The base CSS var carries the pc value; breakpoint overrides are emitted
    // separately as media queries, so don't expand into -pc/-tablet/-mobile vars.
    return [[path, value.pc]];
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => flattenValue(`${path}.${key}`, child));
  }

  return [[path, value]];
}

function flattenResponsiveOverrides(
  bundle: ResolvedTokenBundle,
  prefix: string,
  breakpoint: "tablet" | "mobile"
): Array<[string, string]> {
  return Object.values(bundle.tokens)
    .flatMap((token) => collectResponsiveOverrides(token.path, token.value, breakpoint))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, value]) => [`--${prefix}-${path.replaceAll(".", "-")}`, toCssValue(value)]);
}

function collectResponsiveOverrides(
  path: string,
  value: unknown,
  breakpoint: "tablet" | "mobile"
): Array<[string, unknown]> {
  if (isResponsiveValue(value)) {
    const override = value[breakpoint];
    return override === undefined ? [] : [[path, override]];
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      collectResponsiveOverrides(`${path}.${key}`, child, breakpoint)
    );
  }

  return [];
}

function toCssValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

function nestResolvedTokens(
  bundle: ResolvedTokenBundle,
  mapValue: (value: unknown) => unknown = (value) => value
): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const token of Object.values(bundle.tokens)) {
    setNested(root, token.path.split("."), mapValue(token.value));
  }
  return root;
}

function setNested(target: Record<string, unknown>, segments: string[], value: unknown): void {
  const [head, ...tail] = segments;
  if (!head) {
    return;
  }

  if (tail.length === 0) {
    target[head] = value;
    return;
  }

  if (!target[head] || typeof target[head] !== "object" || Array.isArray(target[head])) {
    target[head] = {};
  }

  setNested(target[head] as Record<string, unknown>, tail, value);
}

function toReactNativeValue(value: unknown): unknown {
  if (typeof value === "string") {
    const px = value.match(/^(-?(?:\d+|\d*\.\d+))px$/);
    if (px?.[1]) {
      return Number(px[1]);
    }

    const rem = value.match(/^(-?(?:\d+|\d*\.\d+))rem$/);
    if (rem?.[1]) {
      return Number(rem[1]) * 16;
    }

    const ms = value.match(/^(-?(?:\d+|\d*\.\d+))ms$/);
    if (ms?.[1]) {
      return Number(ms[1]);
    }
  }

  if (Array.isArray(value)) {
    return value.map(toReactNativeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, toReactNativeValue(child)])
    );
  }

  return value;
}
