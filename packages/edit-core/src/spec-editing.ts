import {
  PODO_SCHEMA_VERSION,
  parseComponentDocument,
  parseTokenDocument,
  type ComponentDocument,
  type DesignToken,
  type TokenDocument,
  type TokenTree,
} from "@podo/spec";

export const editorTokenTypes: DesignToken["$type"][] = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "string",
  "shadow",
  "typography",
  "spacing",
  "radius",
  "motion",
  "border",
  "asset",
];

export const editorPropKinds: ComponentDocument["props"][number]["type"]["kind"][] = [
  "boolean",
  "string",
  "number",
  "enum",
  "union",
  "object",
  "event",
];

export interface EditorTokenRecord {
  documentIndex: number;
  path: string;
  token: DesignToken;
}

export interface EditorTokenDraft {
  documentIndex?: number;
  path: string;
  type: DesignToken["$type"];
  valueText: string;
  description?: string;
  extensionsText?: string;
}

export function createEmptyTokenDocument(): TokenDocument {
  return parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens: {},
  });
}

export function normalizeEditorTokenDocuments(documents: TokenDocument[] = []): TokenDocument[] {
  return documents.length
    ? documents.map((document) => parseTokenDocument(document))
    : [createEmptyTokenDocument()];
}

export function flattenTokenDocuments(documents: TokenDocument[]): EditorTokenRecord[] {
  return documents.flatMap((document, documentIndex) => {
    const records: EditorTokenRecord[] = [];
    collectEditorTokens(document.tokens, [], (path, token) => {
      records.push({ documentIndex, path: path.join("."), token });
    });
    return records;
  });
}

export function createTokenFromDraft(draft: EditorTokenDraft): DesignToken {
  const extensions = parseEditorTokenExtensions(draft.extensionsText);
  const token: DesignToken = {
    $type: draft.type,
    $value: parseEditorTokenValue(draft.type, draft.valueText),
    ...(draft.description?.trim() ? { $description: draft.description.trim() } : {}),
    ...(extensions ? { $extensions: extensions } : {}),
  };
  return token;
}

export function upsertTokenInDocuments(
  documents: TokenDocument[],
  draft: EditorTokenDraft
): TokenDocument[] {
  const documentIndex = draft.documentIndex ?? 0;
  const currentDocument = documents[documentIndex] ?? createEmptyTokenDocument();
  const path = parseEditorPath(draft.path);
  const nextTokens = cloneTokenTree(currentDocument.tokens);
  setTokenAtPath(nextTokens, path, createTokenFromDraft(draft));
  return replaceTokenDocument(documents, documentIndex, {
    ...currentDocument,
    tokens: nextTokens,
  });
}

export function moveTokenInDocuments(
  documents: TokenDocument[],
  input: {
    documentIndex: number;
    fromPath?: string;
    toDraft: EditorTokenDraft;
  }
): TokenDocument[] {
  const fromPath = input.fromPath?.trim();
  const toPath = input.toDraft.path.trim();
  const shouldDeleteFirst = fromPath && fromPath !== toPath;
  const withoutPrevious = shouldDeleteFirst
    ? deleteTokenFromDocuments(documents, input.documentIndex, fromPath)
    : documents;
  return upsertTokenInDocuments(withoutPrevious, {
    ...input.toDraft,
    documentIndex: input.documentIndex,
  });
}

export function deleteTokenFromDocuments(
  documents: TokenDocument[],
  documentIndex: number,
  path: string
): TokenDocument[] {
  const document = documents[documentIndex];
  if (!document) {
    throw new Error(`Token document "${documentIndex}" was not found.`);
  }
  const nextTokens = cloneTokenTree(document.tokens);
  deleteTokenAtPath(nextTokens, parseEditorPath(path));
  return replaceTokenDocument(documents, documentIndex, { ...document, tokens: nextTokens });
}

export function serializeEditorTokenValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function serializeEditorTokenExtensions(value: DesignToken["$extensions"]): string {
  return value ? JSON.stringify(value, null, 2) : "";
}

export function parseEditorTokenExtensions(
  valueText: string | undefined
): DesignToken["$extensions"] | undefined {
  const trimmed = valueText?.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Token extensions must be a JSON object.");
    }
    return parsed as DesignToken["$extensions"];
  } catch (error) {
    if (error instanceof Error && error.message === "Token extensions must be a JSON object.") {
      throw error;
    }
    throw new Error("Token extensions must be valid JSON.");
  }
}

export function parseEditorTokenValue(type: DesignToken["$type"], valueText: string): unknown {
  const trimmed = valueText.trim();
  if (!trimmed) {
    throw new Error("Token value is required.");
  }

  if (["number", "fontWeight"].includes(type) && /^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (
    ["typography", "shadow", "motion", "border"].includes(type) ||
    trimmed.startsWith("{") ||
    trimmed.startsWith("[")
  ) {
    try {
      return JSON.parse(trimmed) as unknown;
    } catch {
      if (/^\{[^}]+\}$/.test(trimmed)) {
        return trimmed;
      }
      throw new Error(`${type} token values must be valid JSON or a valid token alias.`);
    }
  }
  return trimmed;
}

export function updateComponentMeta(
  component: ComponentDocument,
  input: Pick<ComponentDocument, "name" | "category" | "status"> & { description?: string }
): ComponentDocument {
  return parseComponentDocument({
    ...component,
    name: input.name,
    category: input.category,
    status: input.status,
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  });
}

export function createComponentPropType(
  kind: ComponentDocument["props"][number]["type"]["kind"],
  valuesText = ""
): ComponentDocument["props"][number]["type"] {
  if (kind === "enum" || kind === "union") {
    const values = parseCsv(valuesText);
    if (!values.length) {
      throw new Error(`${kind} props require at least one value.`);
    }
    return { kind, values };
  }
  if (kind === "number") {
    return { kind: "number" };
  }
  if (kind === "object") {
    return { kind: "object" };
  }
  if (kind === "event") {
    return { kind: "event" };
  }
  return { kind };
}

export function parsePropDefaultInput(
  kind: ComponentDocument["props"][number]["type"]["kind"],
  valueText: string
): unknown {
  const trimmed = valueText.trim();
  if (!trimmed) {
    return undefined;
  }
  if (kind === "boolean") {
    if (trimmed !== "true" && trimmed !== "false") {
      throw new Error("Boolean defaults must be true or false.");
    }
    return trimmed === "true";
  }
  if (kind === "number") {
    const value = Number(trimmed);
    if (!Number.isFinite(value)) {
      throw new Error("Number defaults must be numeric.");
    }
    return value;
  }
  if (kind === "object") {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Object defaults must be JSON objects.");
    }
    return parsed;
  }
  return trimmed;
}

export function serializePropDefaultInput(value: unknown): string {
  if (value === undefined) {
    return "";
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

export function upsertComponentProp(
  component: ComponentDocument,
  prop: ComponentDocument["props"][number]
): ComponentDocument {
  const props = component.props.some((item) => item.name === prop.name)
    ? component.props.map((item) => (item.name === prop.name ? prop : item))
    : [...component.props, prop];
  return parseComponentDocument({ ...component, props });
}

export function deleteComponentProp(
  component: ComponentDocument,
  propName: string
): ComponentDocument {
  return parseComponentDocument({
    ...component,
    props: component.props.filter((prop) => prop.name !== propName),
  });
}

export function upsertComponentVariant(
  component: ComponentDocument,
  input: {
    name: string;
    valuesText: string;
    defaultValue?: string;
    description?: string;
    tokensText?: string;
  }
): ComponentDocument {
  const values = parseCsv(input.valuesText);
  if (!values.length) {
    throw new Error("Variants require at least one value.");
  }
  const defaultValue = input.defaultValue?.trim();
  const variant: ComponentDocument["variants"][number] = {
    name: input.name.trim(),
    values,
    default: defaultValue && values.includes(defaultValue) ? defaultValue : values[0],
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    ...parseVariantTokensInput(input.tokensText),
  };
  const variants = component.variants.some((item) => item.name === variant.name)
    ? component.variants.map((item) => (item.name === variant.name ? variant : item))
    : [...component.variants, variant];
  return parseComponentDocument({ ...component, variants });
}

export function deleteComponentVariant(
  component: ComponentDocument,
  variantName: string
): ComponentDocument {
  return parseComponentDocument({
    ...component,
    variants: component.variants.filter((variant) => variant.name !== variantName),
  });
}

export function componentVariantValuesText(variant: ComponentDocument["variants"][number]): string {
  return variant.values.join(", ");
}

export function componentPropValuesText(prop: ComponentDocument["props"][number]): string {
  return "values" in prop.type ? prop.type.values.join(", ") : "";
}

function replaceTokenDocument(
  documents: TokenDocument[],
  documentIndex: number,
  document: TokenDocument
): TokenDocument[] {
  const nextDocuments = [...documents];
  nextDocuments[documentIndex] = parseTokenDocument(document);
  return nextDocuments;
}

function parseEditorPath(path: string): string[] {
  const parts = path
    .split(/[./]/g)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) {
    throw new Error("Token path is required.");
  }
  return parts;
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseVariantTokensInput(tokensText = ""): {
  tokens?: ComponentDocument["variants"][number]["tokens"];
} {
  if (!tokensText.trim()) {
    return {};
  }
  const parsed = JSON.parse(tokensText) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Variant token bindings must be a JSON object.");
  }
  return { tokens: parsed as ComponentDocument["variants"][number]["tokens"] };
}

function cloneTokenTree(tree: TokenTree): TokenTree {
  return JSON.parse(JSON.stringify(tree)) as TokenTree;
}

function collectEditorTokens(
  tree: TokenTree,
  path: string[],
  visitor: (path: string[], token: DesignToken) => void
): void {
  for (const [key, value] of Object.entries(tree)) {
    if (isDesignTokenLike(value)) {
      visitor([...path, key], value);
    } else {
      collectEditorTokens(value as TokenTree, [...path, key], visitor);
    }
  }
}

function setTokenAtPath(target: TokenTree, path: string[], token: DesignToken): void {
  const [head, ...tail] = path;
  if (!head) {
    throw new Error("Token path is required.");
  }
  if (tail.length === 0) {
    target[head] = token;
    return;
  }
  const current = target[head];
  if (isDesignTokenLike(current)) {
    throw new Error(`Token path "${path.join(".")}" conflicts with existing token "${head}".`);
  }
  if (!current) {
    target[head] = {};
  }
  setTokenAtPath(target[head] as TokenTree, tail, token);
}

function deleteTokenAtPath(target: TokenTree, path: string[]): boolean {
  const [head, ...tail] = path;
  if (!head || !(head in target)) {
    return false;
  }
  if (tail.length === 0) {
    delete target[head];
    return true;
  }
  const current = target[head];
  if (!current || isDesignTokenLike(current)) {
    return false;
  }
  const deleted = deleteTokenAtPath(current as TokenTree, tail);
  if (deleted && !Object.keys(current as TokenTree).length) {
    delete target[head];
  }
  return deleted;
}

function isDesignTokenLike(value: unknown): value is DesignToken {
  return Boolean(value && typeof value === "object" && "$type" in value && "$value" in value);
}
