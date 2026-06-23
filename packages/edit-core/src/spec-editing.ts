import {
  PODO_SCHEMA_VERSION,
  PodoEditError,
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
    throw new PodoEditError(
      "editCore.tokenDocNotFound",
      `Token document "${documentIndex}" was not found.`,
      { index: documentIndex }
    );
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
      throw new PodoEditError("editCore.tokenExtObject", "Token extensions must be a JSON object.");
    }
    return parsed as DesignToken["$extensions"];
  } catch (error) {
    if (error instanceof Error && error.message === "Token extensions must be a JSON object.") {
      throw error;
    }
    throw new PodoEditError("editCore.tokenExtJson", "Token extensions must be valid JSON.");
  }
}

export function parseEditorTokenValue(type: DesignToken["$type"], valueText: string): unknown {
  const trimmed = valueText.trim();
  if (!trimmed) {
    throw new PodoEditError("editCore.tokenValueRequired", "Token value is required.");
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
      throw new PodoEditError(
        "editCore.tokenValueInvalid",
        `${type} token values must be valid JSON or a valid token alias.`,
        { type }
      );
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

/**
 * Sets (or clears, when `reference` is empty) a `<part>.<property>` appearance
 * binding in a component's base token map. Powers the Figma-style design editor.
 */
export function upsertComponentTokenBinding(
  component: ComponentDocument,
  key: string,
  reference: string
): ComponentDocument {
  const tokens = { ...component.tokens };
  if (reference.trim()) {
    tokens[key] = reference.trim();
  } else {
    delete tokens[key];
  }
  return parseComponentDocument({ ...component, tokens });
}

export function deleteComponentTokenBinding(
  component: ComponentDocument,
  key: string
): ComponentDocument {
  const tokens = { ...component.tokens };
  delete tokens[key];
  return parseComponentDocument({ ...component, tokens });
}

/**
 * Sets (or clears) a per-variant-VALUE appearance binding, i.e.
 * `variant.valueTokens[value][<part>.<prop>] = reference`. Lets the design editor
 * style one variant (e.g. theme=primary) without touching base tokens.
 */
export function upsertComponentVariantValueTokenBinding(
  component: ComponentDocument,
  variantName: string,
  value: string,
  key: string,
  reference: string
): ComponentDocument {
  const variants = (component.variants ?? []).map((variant) => {
    if (variant.name !== variantName) return variant;
    const valueTokens: Record<string, Record<string, string>> = { ...(variant.valueTokens ?? {}) };
    const bucket: Record<string, string> = { ...(valueTokens[value] ?? {}) };
    if (reference.trim()) {
      bucket[key] = reference.trim();
    } else {
      delete bucket[key];
    }
    if (Object.keys(bucket).length) {
      valueTokens[value] = bucket;
    } else {
      delete valueTokens[value];
    }
    return { ...variant, valueTokens };
  });
  return parseComponentDocument({ ...component, variants });
}

// Migrates `<part>.<prop>` keys from one part name to another, across every
// token-bearing map (used by rename so no binding is orphaned).
function migrateBindingKeys<T>(
  tokens: Record<string, T> | undefined,
  fromName: string,
  toName: string
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(tokens ?? {})) {
    const dot = key.indexOf(".");
    const part = dot < 0 ? key : key.slice(0, dot);
    out[part === fromName && dot >= 0 ? `${toName}${key.slice(dot)}` : key] = value;
  }
  return out;
}

// Applies token-key migration to base tokens + every variant.tokens/valueTokens +
// state.tokens for a part rename.
function migrateComponentBindings(
  component: ComponentDocument,
  fromName: string,
  toName: string
): Pick<ComponentDocument, "tokens" | "variants" | "states"> {
  return {
    tokens: migrateBindingKeys(component.tokens as Record<string, string>, fromName, toName),
    variants: (component.variants ?? []).map((variant) => ({
      ...variant,
      ...(variant.tokens ? { tokens: migrateBindingKeys(variant.tokens, fromName, toName) } : {}),
      ...(variant.valueTokens
        ? {
            valueTokens: Object.fromEntries(
              Object.entries(variant.valueTokens).map(([value, map]) => [
                value,
                migrateBindingKeys(map, fromName, toName),
              ])
            ),
          }
        : {}),
    })),
    states: (component.states ?? []).map((state) => ({
      ...state,
      ...(state.tokens ? { tokens: migrateBindingKeys(state.tokens, fromName, toName) } : {}),
    })),
  } as Pick<ComponentDocument, "tokens" | "variants" | "states">;
}

/**
 * Renames an anatomy part (layer): migrates its `<part>.<prop>` token keys across
 * all maps and repoints any child parts whose `parent` referenced it.
 */
export function renameComponentAnatomyPart(
  component: ComponentDocument,
  fromName: string,
  toName: string
): ComponentDocument {
  const next = toName.trim();
  if (!next || next === fromName) {
    return component;
  }
  // Reject a rename that collides with another existing layer name.
  if (component.anatomy.some((entry) => entry.name === next)) {
    throw new PodoEditError("editCore.layerExists", `A layer named "${next}" already exists.`, {
      name: next,
    });
  }
  const anatomy = component.anatomy.map((entry) => {
    const renamed = entry.name === fromName ? { ...entry, name: next } : entry;
    return renamed.parent === fromName ? { ...renamed, parent: next } : renamed;
  });
  return parseComponentDocument({
    ...component,
    anatomy,
    ...migrateComponentBindings(component, fromName, next),
  });
}

/** Adds a new anatomy part (layer), optionally nested under `parent`. */
export function addComponentAnatomyPart(
  component: ComponentDocument,
  name: string,
  parent?: string
): ComponentDocument {
  const base = name.trim();
  if (!base) {
    return component;
  }
  // Ensure a unique name so repeated "add child"/"duplicate" never silently no-op.
  const existing = new Set(component.anatomy.map((entry) => entry.name));
  let partName = base;
  for (let suffix = 2; existing.has(partName); suffix += 1) {
    partName = `${base}-${suffix}`;
  }
  const part = parent ? { name: partName, parent } : { name: partName };
  return parseComponentDocument({ ...component, anatomy: [...component.anatomy, part] });
}

/** Removes an anatomy part and its descendants, deleting their token bindings. */
export function removeComponentAnatomyPart(
  component: ComponentDocument,
  partName: string
): ComponentDocument {
  // Collect the part + all descendants.
  const doomed = new Set<string>([partName]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const entry of component.anatomy) {
      if (entry.parent && doomed.has(entry.parent) && !doomed.has(entry.name)) {
        doomed.add(entry.name);
        grew = true;
      }
    }
  }
  const anatomy = component.anatomy.filter((entry) => !doomed.has(entry.name));
  if (!anatomy.length) {
    return component; // never leave a component with zero layers
  }
  const dropKeys = (tokens: Record<string, string> | undefined): Record<string, string> =>
    Object.fromEntries(
      Object.entries(tokens ?? {}).filter(([key]) => {
        const dot = key.indexOf(".");
        return !(dot >= 0 && doomed.has(key.slice(0, dot)));
      })
    );
  return parseComponentDocument({
    ...component,
    anatomy,
    tokens: dropKeys(component.tokens as Record<string, string>),
    variants: (component.variants ?? []).map((variant) => ({
      ...variant,
      ...(variant.tokens ? { tokens: dropKeys(variant.tokens) } : {}),
      ...(variant.valueTokens
        ? {
            valueTokens: Object.fromEntries(
              Object.entries(variant.valueTokens).map(([value, map]) => [value, dropKeys(map)])
            ),
          }
        : {}),
    })),
    states: (component.states ?? []).map((state) => ({
      ...state,
      ...(state.tokens ? { tokens: dropKeys(state.tokens) } : {}),
    })),
  });
}

/** Reparents (nests) a layer under `newParent`, or to the top level when null. */
export function reparentComponentAnatomyPart(
  component: ComponentDocument,
  partName: string,
  newParent: string | null
): ComponentDocument {
  const names = new Set(component.anatomy.map((entry) => entry.name));
  if (!names.has(partName)) return component;
  if (newParent === partName) return component;
  if (newParent) {
    if (!names.has(newParent)) return component;
    // Reject nesting into own descendant (cycle).
    const parentOf = new Map(component.anatomy.map((entry) => [entry.name, entry.parent]));
    let cursor: string | undefined = newParent;
    while (cursor) {
      if (cursor === partName) return component;
      cursor = parentOf.get(cursor);
    }
  }
  const anatomy = component.anatomy.map((entry) => {
    if (entry.name !== partName) return entry;
    const rest = { ...entry };
    delete (rest as { parent?: string }).parent;
    return newParent ? { ...rest, parent: newParent } : rest;
  });
  return parseComponentDocument({ ...component, anatomy });
}

/**
 * Reparents AND reorders a layer in a single derivation, so a drag-drop commit
 * applies both moves to the same spec (avoids one update clobbering the other via
 * stale React state).
 */
export function moveComponentAnatomyPart(
  component: ComponentDocument,
  partName: string,
  newParent: string | null,
  beforeName: string | null
): ComponentDocument {
  const reparented = reparentComponentAnatomyPart(component, partName, newParent);
  return reorderComponentAnatomyPart(reparented, partName, beforeName);
}

/** Reorders a layer to just before `beforeName` (or to the end when null). */
export function reorderComponentAnatomyPart(
  component: ComponentDocument,
  partName: string,
  beforeName: string | null
): ComponentDocument {
  const moving = component.anatomy.find((entry) => entry.name === partName);
  if (!moving || partName === beforeName) return component;
  const rest = component.anatomy.filter((entry) => entry.name !== partName);
  const index = beforeName ? rest.findIndex((entry) => entry.name === beforeName) : -1;
  const anatomy =
    index >= 0 ? [...rest.slice(0, index), moving, ...rest.slice(index)] : [...rest, moving];
  return parseComponentDocument({ ...component, anatomy });
}

export function createComponentPropType(
  kind: ComponentDocument["props"][number]["type"]["kind"],
  valuesText = ""
): ComponentDocument["props"][number]["type"] {
  if (kind === "enum" || kind === "union") {
    const values = parseCsv(valuesText);
    if (!values.length) {
      throw new PodoEditError(
        "editCore.propValuesRequired",
        `${kind} props require at least one value.`,
        { kind }
      );
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
      throw new PodoEditError("editCore.boolDefault", "Boolean defaults must be true or false.");
    }
    return trimmed === "true";
  }
  if (kind === "number") {
    const value = Number(trimmed);
    if (!Number.isFinite(value)) {
      throw new PodoEditError("editCore.numberDefault", "Number defaults must be numeric.");
    }
    return value;
  }
  if (kind === "object") {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new PodoEditError("editCore.objectDefault", "Object defaults must be JSON objects.");
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
    throw new PodoEditError(
      "editCore.variantValuesRequired",
      "Variants require at least one value."
    );
  }
  const duplicate = values.find((value, index) => values.indexOf(value) !== index);
  if (duplicate) {
    throw new PodoEditError(
      "editCore.variantDuplicate",
      `Duplicate variant value "${duplicate}".`,
      { value: duplicate }
    );
  }
  const defaultValue = input.defaultValue?.trim();
  if (defaultValue && !values.includes(defaultValue)) {
    throw new PodoEditError(
      "editCore.variantDefaultInvalid",
      `Default "${defaultValue}" is not one of the variant values.`,
      { value: defaultValue }
    );
  }
  const variant: ComponentDocument["variants"][number] = {
    name: input.name.trim(),
    values,
    default: defaultValue ? defaultValue : values[0],
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

export function upsertComponentSlot(
  component: ComponentDocument,
  input: {
    name: string;
    required?: boolean;
    repeated?: boolean;
    fallback?: string;
    description?: string;
  }
): ComponentDocument {
  const name = input.name.trim();
  if (!name) {
    throw new PodoEditError("editCore.slotNameRequired", "Slot name is required.");
  }
  const existing = component.slots.find((item) => item.name === name);
  const slot: ComponentDocument["slots"][number] = {
    name,
    required: input.required ?? false,
    repeated: input.repeated ?? false,
    ...(input.fallback?.trim() ? { fallback: input.fallback.trim() } : {}),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    // Preserve target-specific slot metadata (e.g. web/react/native element
    // mappings) that the editor draft cannot express, so editing a slot's
    // name/flags never silently drops codegen-relevant `targets`.
    ...(existing?.targets ? { targets: existing.targets } : {}),
  };
  const slots = existing
    ? component.slots.map((item) => (item.name === slot.name ? slot : item))
    : [...component.slots, slot];
  return parseComponentDocument({ ...component, slots });
}

export function deleteComponentSlot(
  component: ComponentDocument,
  slotName: string
): ComponentDocument {
  return parseComponentDocument({
    ...component,
    slots: component.slots.filter((slot) => slot.name !== slotName),
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
    throw new PodoEditError("editCore.tokenPathRequired", "Token path is required.");
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
    throw new PodoEditError(
      "editCore.variantBindingObject",
      "Variant token bindings must be a JSON object."
    );
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
    throw new PodoEditError("editCore.tokenPathRequired", "Token path is required.");
  }
  if (tail.length === 0) {
    target[head] = token;
    return;
  }
  const current = target[head];
  if (isDesignTokenLike(current)) {
    throw new PodoEditError(
      "editCore.tokenPathConflict",
      `Token path "${path.join(".")}" conflicts with existing token "${head}".`,
      { path: path.join("."), head }
    );
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
