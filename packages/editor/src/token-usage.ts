import {
  parseComponentDocument,
  parseTokenDocument,
  type ComponentDocument,
  type TokenDocument,
} from "@podo/spec";
import { flattenTokenDocuments } from "@podo/edit-core";

/**
 * A single place where a token is referenced — another token's value (an alias
 * or a component-scoped token), a component's token binding, or a canvas node's
 * layout field (e.g. a spacing reference in `gap`/`padding`). Used to block and
 * guide deletion: a referenced token must be repointed to a replacement before
 * it can be removed, so nothing is left dangling.
 */
export interface TokenUsage {
  source: "token" | "component" | "node";
  /** The token path, component id, or node id that holds the reference. */
  ownerId: string;
  /** The field within the owner (`$value`, a component token key, or layout key). */
  field: string;
  /** The full referenced token path, e.g. `color.primary.base`. */
  reference: string;
}

/** Every `{token.path}` reference contained in a string. */
function extractReferences(text: string): string[] {
  const refs: string[] = [];
  const pattern = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const ref = match[1];
    if (ref) {
      refs.push(ref);
    }
  }
  return refs;
}

/** Walk any token value (string / array / object) collecting references. */
function collectReferences(value: unknown, into: (reference: string) => void): void {
  if (typeof value === "string") {
    for (const reference of extractReferences(value)) {
      into(reference);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectReferences(entry, into);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      collectReferences(entry, into);
    }
  }
}

/** Map every string contained in a value through `transform`, preserving shape. */
function mapStrings(value: unknown, transform: (text: string) => string): unknown {
  if (typeof value === "string") {
    return transform(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => mapStrings(entry, transform));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, mapStrings(entry, transform)])
    );
  }
  return value;
}

/**
 * Find every reference to any of `targets` across token values, component token
 * bindings, and canvas node layout fields (spacing refs in `gap`/`padding`).
 * Owners listed in `excludeOwners` (the tokens being deleted themselves) are
 * skipped so a group's internal aliases don't count as usage.
 */
export function collectTokenUsages(input: {
  targets: Iterable<string>;
  documents: TokenDocument[];
  components: ComponentDocument[];
  nodes?: readonly unknown[];
  excludeOwners?: Iterable<string>;
}): TokenUsage[] {
  const targetSet = new Set(input.targets);
  const exclude = new Set(input.excludeOwners ?? []);
  const usages: TokenUsage[] = [];
  for (const record of flattenTokenDocuments(input.documents)) {
    if (exclude.has(record.path)) {
      continue;
    }
    collectReferences(record.token.$value, (reference) => {
      if (targetSet.has(reference)) {
        usages.push({ source: "token", ownerId: record.path, field: "$value", reference });
      }
    });
  }
  for (const component of input.components) {
    for (const [field, value] of Object.entries(component.tokens ?? {})) {
      if (typeof value !== "string") {
        continue;
      }
      for (const reference of extractReferences(value)) {
        if (targetSet.has(reference)) {
          usages.push({ source: "component", ownerId: component.id, field, reference });
        }
      }
    }
  }
  for (const node of input.nodes ?? []) {
    if (!node || typeof node !== "object") {
      continue;
    }
    const record = node as Record<string, unknown>;
    const ownerId = typeof record.id === "string" ? record.id : "node";
    for (const [field, value] of Object.entries(record)) {
      collectReferences(value, (reference) => {
        if (targetSet.has(reference)) {
          usages.push({ source: "node", ownerId, field, reference });
        }
      });
    }
  }
  return usages;
}

/**
 * Rename a group key in place across documents, preserving sibling order (so a
 * renamed color set keeps its position in the matrix instead of jumping to the
 * end, which delete-then-append would cause). Only renames the key — references
 * are repointed separately via `rewriteTokenReferences`.
 */
export function renameTokenGroupInDocuments(input: {
  documents: TokenDocument[];
  fromPath: string;
  toPath: string;
}): TokenDocument[] {
  const fromSegments = input.fromPath.split(".");
  const toSegments = input.toPath.split(".");
  const oldKey = fromSegments.at(-1);
  const newKey = toSegments.at(-1);
  const parentSegments = fromSegments.slice(0, -1);
  if (!oldKey || !newKey) {
    return input.documents;
  }
  const renameInParent = (node: unknown, depth: number): unknown => {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      return node;
    }
    const entries = Object.entries(node as Record<string, unknown>);
    if (depth === parentSegments.length) {
      return Object.fromEntries(
        entries.map(([key, value]) => [key === oldKey ? newKey : key, value])
      );
    }
    const head = parentSegments[depth];
    return Object.fromEntries(
      entries.map(([key, value]) => [key, key === head ? renameInParent(value, depth + 1) : value])
    );
  };
  return input.documents.map((document) =>
    parseTokenDocument({
      ...document,
      tokens: renameInParent(document.tokens, 0) as TokenDocument["tokens"],
    })
  );
}

/**
 * Rewrite `{from}` references to `{to}` for every entry in `mapping`, across all
 * token documents, components, and (when provided) canvas nodes. Paths are
 * brace-delimited, so a plain literal swap never matches a longer sibling path
 * (`{color.x.base}` ≠ `{color.x.baseline}`).
 */
export function rewriteTokenReferences<TNode = unknown>(input: {
  mapping: Map<string, string>;
  documents: TokenDocument[];
  components: ComponentDocument[];
  nodes?: readonly TNode[];
}): { documents: TokenDocument[]; components: ComponentDocument[]; nodes: TNode[] } {
  const entries = [...input.mapping];
  const replace = (text: string): string => {
    let next = text;
    for (const [from, to] of entries) {
      next = next.split(`{${from}}`).join(`{${to}}`);
    }
    return next;
  };
  return {
    documents: input.documents.map((document) =>
      parseTokenDocument(mapStrings(document, replace) as TokenDocument)
    ),
    components: input.components.map((component) =>
      parseComponentDocument(mapStrings(component, replace) as ComponentDocument)
    ),
    nodes: (input.nodes ?? []).map((node) => mapStrings(node, replace) as TNode),
  };
}
