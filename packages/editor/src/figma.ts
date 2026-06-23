import {
  PODO_SCHEMA_VERSION,
  PodoEditError,
  parseTokenDocument,
  type DesignToken,
  type TokenDocument,
  type TokenTree,
} from "@podo/spec";

export interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variables: FigmaVariable[];
}

export interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  description?: string;
  valuesByMode: Record<string, unknown>;
}

export interface FigmaVariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}

export interface FigmaVariableExport {
  collectionName: string;
  variables: FigmaVariable[];
}

export function importFigmaVariables(input: FigmaVariableCollection): TokenDocument {
  const tokens: TokenTree = {};
  const defaultMode = input.modes[0]?.modeId;
  if (!defaultMode) {
    throw new PodoEditError(
      "figma.collectionMode",
      "Figma variable collection must include at least one mode."
    );
  }

  const aliases = new Map(
    input.variables.map((variable) => [variable.id, normalizeFigmaPath(variable.name).join(".")])
  );
  for (const variable of input.variables) {
    setTokenAtPath(
      tokens,
      normalizeFigmaPath(variable.name),
      figmaVariableToToken(input, variable, defaultMode, aliases)
    );
  }

  return parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens,
  });
}

export function exportFigmaVariables(document: TokenDocument): FigmaVariableExport {
  const parsed = parseTokenDocument(document);
  const variables: FigmaVariable[] = [];
  collectTokens(parsed.tokens, [], (path, token) => {
    variables.push(tokenToFigmaVariable(path, token));
  });
  return {
    collectionName: "Podo Tokens",
    variables,
  };
}

export const githubSyncStrategy = {
  decision: "ci-managed-sync",
  recommendation:
    "Run Figma import/export in a GitHub Action that opens a pull request with token JSON changes; the editor should not push directly from a browser session.",
  requiredSecrets: ["FIGMA_TOKEN", "GITHUB_TOKEN"],
  checks: ["pnpm check", "pnpm build", "podo update --dry-run"],
} as const;

function figmaAliasFromTokenValue(value: unknown): FigmaVariableAlias | undefined {
  if (typeof value === "string" && /^\{[^}]+\}$/.test(value)) {
    return { type: "VARIABLE_ALIAS", id: `podo:${value.slice(1, -1)}` };
  }
  return undefined;
}

function normalizeFigmaPath(name: string): string[] {
  return name
    .split(/[/.]/g)
    .map((part) =>
      part
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean);
}

function figmaVariableToToken(
  collection: FigmaVariableCollection,
  variable: FigmaVariable,
  defaultMode: string,
  aliases: Map<string, string>
): DesignToken {
  const tokenType = inferTokenType(variable);
  const modes = Object.fromEntries(
    collection.modes.map((mode) => [
      mode.name,
      convertFigmaValue(
        variable.resolvedType,
        variable.valuesByMode[mode.modeId],
        tokenType,
        aliases
      ),
    ])
  );
  return {
    $type: tokenType,
    $value: convertFigmaValue(
      variable.resolvedType,
      variable.valuesByMode[defaultMode],
      tokenType,
      aliases
    ),
    ...(variable.description ? { $description: variable.description } : {}),
    $extensions: {
      podo: { themeable: collection.modes.length > 1 },
      figma: {
        collectionId: collection.id,
        variableId: variable.id,
        modes,
      },
    },
  };
}

function inferTokenType(variable: FigmaVariable): DesignToken["$type"] {
  if (variable.resolvedType === "COLOR") {
    return "color";
  }
  if (variable.resolvedType === "FLOAT") {
    const path = variable.name.toLowerCase();
    if (path.includes("radius")) {
      return "radius";
    }
    if (path.includes("space") || path.includes("gap") || path.includes("spacing")) {
      return "spacing";
    }
    return "number";
  }
  if (variable.resolvedType === "BOOLEAN") {
    return "string";
  }
  return "string";
}

function convertFigmaValue(
  type: FigmaVariable["resolvedType"],
  value: unknown,
  tokenType: DesignToken["$type"],
  aliases: Map<string, string>
): unknown {
  if (isFigmaAlias(value)) {
    const alias = aliases.get(value.id);
    if (!alias) {
      throw new PodoEditError(
        "figma.aliasUnresolved",
        `Figma alias "${value.id}" does not point to an imported variable.`,
        { id: value.id }
      );
    }
    return `{${alias}}`;
  }
  if (type === "COLOR" && isFigmaColor(value)) {
    return figmaColorToHex(value);
  }
  if (type === "FLOAT" && typeof value === "number") {
    return ["spacing", "radius", "dimension"].includes(tokenType) ? `${value}px` : value;
  }
  if (type === "BOOLEAN") {
    return String(Boolean(value));
  }
  return typeof value === "string" || typeof value === "number" ? value : String(value ?? "");
}

function setTokenAtPath(target: TokenTree, path: string[], token: DesignToken): void {
  const [head, ...tail] = path;
  if (!head) {
    throw new PodoEditError("figma.tokenPathEmpty", "Token path cannot be empty.");
  }
  if (tail.length === 0) {
    const existing = target[head];
    if (existing && !isDesignTokenLike(existing)) {
      throw new PodoEditError(
        "figma.pathGroupConflict",
        `Figma variable path "${path.join(".")}" conflicts with a token group.`,
        { path: path.join(".") }
      );
    }
    target[head] = token;
    return;
  }
  const current = target[head];
  if (isDesignTokenLike(current)) {
    throw new PodoEditError(
      "figma.pathTokenConflict",
      `Figma variable path "${path.join(".")}" conflicts with token "${head}".`,
      { path: path.join("."), head }
    );
  }
  if (!current || Array.isArray(current)) {
    target[head] = {};
  }
  setTokenAtPath(target[head] as TokenTree, tail, token);
}

function collectTokens(
  tree: TokenTree,
  path: string[],
  visitor: (path: string[], token: DesignToken) => void
): void {
  for (const [key, value] of Object.entries(tree)) {
    if (isDesignTokenLike(value)) {
      visitor([...path, key], value);
    } else {
      collectTokens(value as TokenTree, [...path, key], visitor);
    }
  }
}

function tokenToFigmaVariable(path: string[], token: DesignToken): FigmaVariable {
  const resolvedType = tokenTypeToFigmaType(token.$type);
  return {
    id: `podo:${path.join(".")}`,
    name: path.join("/"),
    resolvedType,
    ...(token.$description ? { description: token.$description } : {}),
    valuesByMode: {
      default:
        resolvedType === "COLOR"
          ? tokenValueToFigmaColor(token.$value)
          : tokenValueToFigmaValue(token.$value, resolvedType),
    },
  };
}

function tokenTypeToFigmaType(type: DesignToken["$type"]): FigmaVariable["resolvedType"] {
  if (type === "color") {
    return "COLOR";
  }
  if (type === "number" || type === "spacing" || type === "radius" || type === "dimension") {
    return "FLOAT";
  }
  return "STRING";
}

function isFigmaColor(value: unknown): value is { r: number; g: number; b: number; a?: number } {
  return (
    value !== null && typeof value === "object" && "r" in value && "g" in value && "b" in value
  );
}

function isFigmaAlias(value: unknown): value is FigmaVariableAlias {
  return (
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    (value as { type?: unknown }).type === "VARIABLE_ALIAS" &&
    "id" in value &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function figmaColorToHex(value: { r: number; g: number; b: number; a?: number }): string {
  const alpha = value.a ?? 1;
  return `#${[value.r, value.g, value.b, alpha]
    .filter((_, index) => index < 3 || alpha < 1)
    .map((channel) =>
      Math.round(clamp01(channel) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function tokenValueToFigmaColor(
  value: unknown
): { r: number; g: number; b: number; a: number } | FigmaVariableAlias {
  const alias = figmaAliasFromTokenValue(value);
  if (alias) {
    return alias;
  }
  if (typeof value !== "string") {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  if (value === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const rgba = value.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/
  );
  if (rgba) {
    return {
      r: clampRgb(Number(rgba[1])) / 255,
      g: clampRgb(Number(rgba[2])) / 255,
      b: clampRgb(Number(rgba[3])) / 255,
      a: rgba[4] === undefined ? 1 : clamp01(Number(rgba[4])),
    };
  }
  if (!/^#[0-9a-fA-F]{6,8}$/.test(value)) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  const hex = value.slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16) / 255,
    g: Number.parseInt(hex.slice(2, 4), 16) / 255,
    b: Number.parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function tokenValueToFigmaValue(value: unknown, type: FigmaVariable["resolvedType"]): unknown {
  const alias = figmaAliasFromTokenValue(value);
  if (alias) {
    return alias;
  }
  if (type === "FLOAT" && typeof value === "string") {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return value;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampRgb(value: number): number {
  return Math.min(255, Math.max(0, value));
}

function isDesignTokenLike(value: unknown): value is DesignToken {
  return Boolean(value && typeof value === "object" && "$type" in value && "$value" in value);
}
