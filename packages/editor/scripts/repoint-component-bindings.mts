// One-off migration: repoint component appearance bindings that reference
// component-LOCAL tokens (`{component.*}`) to the GLOBAL design token they resolve
// to (closest match), across every component. Prints a `{component.X}` -> `{global}`
// replacement map; the bindings are literal strings in legacy-fixtures.ts so the
// caller string-replaces them.
import { legacyTokenDocuments, legacyComponents } from "../src/legacy-fixtures.ts";

type Token = { $type?: string; $value?: unknown };
const tokens = new Map<string, Token>();

function flatten(tree: Record<string, unknown>, prefix: string[]): void {
  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const node = value as Record<string, unknown>;
    if (node && typeof node === "object" && "$value" in node) {
      tokens.set([...prefix, key].join("."), node as Token);
    } else if (node && typeof node === "object") {
      flatten(node, [...prefix, key]);
    }
  }
}
for (const doc of legacyTokenDocuments) flatten(doc.tokens as Record<string, unknown>, []);

const isAlias = (v: unknown): v is string => typeof v === "string" && /^\{[^}]+\}$/.test(v);
const aliasPath = (v: string): string => v.slice(1, -1);

// Resolve a token path to a final concrete value (following alias chains).
function finalValue(path: string, seen = new Set<string>()): unknown {
  if (seen.has(path)) return undefined;
  seen.add(path);
  const token = tokens.get(path);
  if (!token) return undefined;
  return isAlias(token.$value) ? finalValue(aliasPath(token.$value), seen) : token.$value;
}

// Reverse index: (type|stringified-final-value) -> shortest GLOBAL token path.
const globalByTypeValue = new Map<string, string>();
for (const [path, token] of tokens) {
  if (path.startsWith("component.")) continue;
  const key = `${token.$type}|${JSON.stringify(finalValue(path))}`;
  const existing = globalByTypeValue.get(key);
  if (!existing || path.length < existing.length) globalByTypeValue.set(key, path);
}

// Resolve a component-local reference to a GLOBAL alias: prefer a direct alias
// chain to a global token; else the closest global token by type+value.
function toGlobalAlias(ref: string): string | null {
  let path = aliasPath(ref);
  const seen = new Set<string>();
  while (path.startsWith("component.")) {
    if (seen.has(path)) return null;
    seen.add(path);
    const token = tokens.get(path);
    if (!token) return null;
    if (isAlias(token.$value)) {
      const inner = aliasPath(token.$value);
      if (!inner.startsWith("component.")) return `{${inner}}`;
      path = inner;
      continue;
    }
    // Literal value — find the closest global token of the same type+value.
    const match = globalByTypeValue.get(`${token.$type}|${JSON.stringify(token.$value)}`);
    return match ? `{${match}}` : null;
  }
  return `{${path}}`;
}

// Collect every {component.*} reference used in component appearance bindings.
const refs = new Set<string>();
const scan = (map: Record<string, string> | undefined): void => {
  for (const value of Object.values(map ?? {})) {
    if (typeof value === "string" && value.startsWith("{component.")) refs.add(value);
  }
};
for (const component of legacyComponents) {
  scan(component.tokens as Record<string, string>);
  for (const variant of component.variants) {
    scan(variant.tokens as Record<string, string> | undefined);
    for (const bucket of Object.values(variant.valueTokens ?? {})) {
      scan(bucket as Record<string, string>);
    }
  }
  for (const state of component.states) scan(state.tokens as Record<string, string> | undefined);
}

const mapping: Record<string, string> = {};
const unresolved: string[] = [];
for (const ref of [...refs].sort()) {
  const next = toGlobalAlias(ref);
  if (next) mapping[ref] = next;
  else unresolved.push(ref);
}

console.log(JSON.stringify({ mapping, unresolved }, null, 2));
