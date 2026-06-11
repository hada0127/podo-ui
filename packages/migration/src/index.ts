import { createHash } from "node:crypto";
import { z } from "zod";
import {
  isDesignToken,
  isPlainObject,
  parseComponentDocument,
  parsePodoLock,
  parseTokenDocument,
  PODO_SCHEMA_VERSION,
  type DesignToken,
  type PodoLock,
  type ValidationIssue,
} from "@podo/spec";

export const jsonPointerSchema = z
  .string()
  .refine((value) => value === "" || value.startsWith("/"), {
    message: "Use a JSON Pointer path.",
  });

const dottedPathSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/, "Use dotted Podo paths.");

const jsonPatchScopeSchema = {
  files: z.array(z.string().min(1)).optional(),
};

export const jsonPatchOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("add"),
    path: jsonPointerSchema,
    value: z.unknown(),
    ...jsonPatchScopeSchema,
  }),
  z.object({ op: z.literal("remove"), path: jsonPointerSchema, ...jsonPatchScopeSchema }),
  z.object({
    op: z.literal("replace"),
    path: jsonPointerSchema,
    value: z.unknown(),
    ...jsonPatchScopeSchema,
  }),
  z.object({
    op: z.literal("move"),
    from: jsonPointerSchema,
    path: jsonPointerSchema,
    ...jsonPatchScopeSchema,
  }),
  z.object({
    op: z.literal("copy"),
    from: jsonPointerSchema,
    path: jsonPointerSchema,
    ...jsonPatchScopeSchema,
  }),
  z.object({
    op: z.literal("test"),
    path: jsonPointerSchema,
    value: z.unknown(),
    ...jsonPatchScopeSchema,
  }),
]);

export const migrationOperationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("renameToken"),
    from: dottedPathSchema,
    to: dottedPathSchema,
    notes: z.string().min(1).optional(),
  }),
  z.object({
    op: z.literal("moveComponentProp"),
    component: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    notes: z.string().min(1).optional(),
  }),
  z.object({
    op: z.literal("removeDeprecatedToken"),
    path: dottedPathSchema,
    replacement: dottedPathSchema.optional(),
    notes: z.string().min(1).optional(),
  }),
  ...jsonPatchOperationSchema.options,
]);

export const migrationManifestSchema = z.object({
  schemaVersion: z.literal(PODO_SCHEMA_VERSION),
  kind: z.literal("migration-manifest"),
  packageName: z.string().min(1).default("@podo/ui"),
  packageVersion: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  riskLevel: z.enum(["low", "medium", "high"]).default("low"),
  notes: z.array(z.string().min(1)).default([]),
  operations: z.array(migrationOperationSchema).default([]),
});

export type JsonPatchOperation = z.infer<typeof jsonPatchOperationSchema>;
export type MigrationOperation = z.infer<typeof migrationOperationSchema>;
export type MigrationManifest = z.infer<typeof migrationManifestSchema>;
export type MigrationFileKind = "token" | "component" | "lock" | "config" | "icon" | "unknown";

export interface MigrationFile {
  path: string;
  document: unknown;
  kind?: MigrationFileKind;
}

export interface MigrationConflict {
  code: string;
  path: string;
  message: string;
  severity: "blocking" | "warning";
  operation: MigrationOperation["op"];
}

export interface MigrationPlanFile {
  path: string;
  kind: MigrationFileKind;
  action: "unchanged" | "update";
  beforeHash: string;
  afterHash: string;
  operations: JsonPatchOperation[];
  before: unknown;
  after: unknown;
}

export interface MigrationPlan {
  manifest: MigrationManifest;
  dryRun: boolean;
  hasChanges: boolean;
  files: MigrationPlanFile[];
  conflicts: MigrationConflict[];
}

export function parseMigrationManifest(input: unknown): MigrationManifest {
  return migrationManifestSchema.parse(input);
}

export function createDefaultMigrationManifest(input: {
  from: string;
  to: string;
  packageVersion?: string;
}): MigrationManifest {
  return parseMigrationManifest({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "migration-manifest",
    packageName: "@podo/ui",
    packageVersion: input.packageVersion ?? input.to,
    from: input.from,
    to: input.to,
    riskLevel: "low",
    notes: [
      "Default Podo migration keeps legacy token and prop aliases compatible when they exist.",
    ],
    operations: [
      { op: "renameToken", from: "color.primary", to: "color.brand" },
      { op: "removeDeprecatedToken", path: "color.legacy", replacement: "color.brand" },
      { op: "moveComponentProp", component: "button", from: "isDisabled", to: "disabled" },
    ],
  });
}

export function runMigrationPlan(input: {
  manifest: MigrationManifest;
  files: MigrationFile[];
  dryRun?: boolean;
}): MigrationPlan {
  const manifest = parseMigrationManifest(input.manifest);
  const conflicts = detectMigrationConflicts(input.files, manifest);
  const blocking = conflicts.some((conflict) => conflict.severity === "blocking");
  const files = input.files.map((file): MigrationPlanFile => {
    const kind = file.kind ?? inferMigrationFileKind(file.path, file.document);
    const before = cloneJson(file.document);
    let current = cloneJson(file.document);
    const operations: JsonPatchOperation[] = [];

    if (!blocking) {
      for (const operation of manifest.operations) {
        if (operationTargetsOtherFile(operation, file.path)) {
          continue;
        }
        const patches = compileMigrationOperation(current, kind, operation);
        if (!patches.length) {
          continue;
        }
        current = applyJsonPatch(current, patches);
        operations.push(...patches);
      }
    }

    const beforeHash = hashJson(before);
    const afterHash = hashJson(current);
    return {
      path: file.path,
      kind,
      action: beforeHash === afterHash ? "unchanged" : "update",
      beforeHash,
      afterHash,
      operations,
      before,
      after: current,
    };
  });

  return {
    manifest,
    dryRun: Boolean(input.dryRun),
    hasChanges: files.some((file) => file.action === "update"),
    files,
    conflicts,
  };
}

export function detectMigrationConflicts(
  files: MigrationFile[],
  manifest: MigrationManifest
): MigrationConflict[] {
  const conflicts: MigrationConflict[] = [];
  const tokenIndex = buildTokenIndex(files);
  for (const file of files) {
    const kind = file.kind ?? inferMigrationFileKind(file.path, file.document);
    for (const operation of manifest.operations) {
      if (operation.op === "renameToken") {
        const sources = tokenIndex.get(operation.from) ?? [];
        const targets = tokenIndex.get(operation.to) ?? [];
        for (const source of sources) {
          const target = targets.find((item) => !jsonEquals(item.value, source.value));
          if (!target) {
            continue;
          }
          conflicts.push({
            code: "migration.token.renameTargetExists",
            path: source.path,
            message: `Cannot rename token "${operation.from}" to "${operation.to}" because the target already exists with a different value.`,
            severity: "blocking",
            operation: operation.op,
          });
        }
      }

      if (operation.op === "removeDeprecatedToken") {
        if (!operation.replacement && documentContainsAlias(file.document, operation.path)) {
          conflicts.push({
            code: "migration.token.removeReferenced",
            path: file.path,
            message: `Token "${operation.path}" is still referenced and has no replacement.`,
            severity: "blocking",
            operation: operation.op,
          });
        }
        if (kind === "token") {
          const token = getByPointer(file.document, tokenPathToPointer(operation.path));
          if (token.exists && isDesignToken(token.value) && !isDeprecatedToken(token.value)) {
            conflicts.push({
              code: "migration.token.removeNotDeprecated",
              path: file.path,
              message: `Token "${operation.path}" is not marked deprecated; review before removal.`,
              severity: "warning",
              operation: operation.op,
            });
          }
        }
      }

      if (operation.op === "moveComponentProp" && kind === "component") {
        const parsed = parseAsComponent(file.document);
        if (parsed?.id !== operation.component) {
          continue;
        }
        const source = parsed.props.find((prop) => prop.name === operation.from);
        const target = parsed.props.find((prop) => prop.name === operation.to);
        if (source && target) {
          conflicts.push({
            code: "migration.component.propTargetExists",
            path: file.path,
            message: `Component "${operation.component}" already has prop "${operation.to}".`,
            severity: "blocking",
            operation: operation.op,
          });
        }
      }
    }
  }
  return conflicts;
}

export function compileMigrationOperation(
  document: unknown,
  kind: MigrationFileKind,
  operation: MigrationOperation
): JsonPatchOperation[] {
  if (isJsonPatchOperation(operation)) {
    return [operation];
  }

  if (operation.op === "renameToken") {
    if (kind !== "token") {
      return collectAliasReplacementPatches(document, operation.from, operation.to);
    }
    const sourcePointer = tokenPathToPointer(operation.from);
    const targetPointer = tokenPathToPointer(operation.to);
    const source = getByPointer(document, sourcePointer);
    const target = getByPointer(document, targetPointer);
    if (!source.exists || target.exists) {
      const aliasPatches = collectAliasReplacementPatches(document, operation.from, operation.to);
      if (source.exists && target.exists && jsonEquals(source.value, target.value)) {
        return [...aliasPatches, { op: "remove", path: sourcePointer }];
      }
      return aliasPatches;
    }
    const movePatches: JsonPatchOperation[] = [
      { op: "add", path: targetPointer, value: cloneJson(source.value) },
      { op: "remove", path: sourcePointer },
    ];
    const movedDocument = applyJsonPatch(document, movePatches);
    return [
      ...movePatches,
      ...collectAliasReplacementPatches(movedDocument, operation.from, operation.to),
    ];
  }

  if (operation.op === "removeDeprecatedToken") {
    if (kind !== "token") {
      return operation.replacement
        ? collectAliasReplacementPatches(document, operation.path, operation.replacement)
        : [];
    }
    const pointer = tokenPathToPointer(operation.path);
    const token = getByPointer(document, pointer);
    if (!token.exists) {
      return [];
    }
    const replacementPatches = operation.replacement
      ? collectAliasReplacementPatches(document, operation.path, operation.replacement)
      : [];
    return [...replacementPatches, { op: "remove", path: pointer }];
  }

  if (operation.op === "moveComponentProp") {
    if (kind !== "component") {
      return [];
    }
    const parsed = parseAsComponent(document);
    if (parsed?.id !== operation.component) {
      return [];
    }
    const sourceIndex = parsed.props.findIndex((prop) => prop.name === operation.from);
    const targetExists = parsed.props.some((prop) => prop.name === operation.to);
    if (sourceIndex === -1 || targetExists) {
      return [];
    }
    return [{ op: "replace", path: `/props/${sourceIndex}/name`, value: operation.to }];
  }

  return [];
}

export function applyJsonPatch<T>(document: T, operations: JsonPatchOperation[]): T {
  let current = cloneJson(document);
  for (const operation of operations) {
    if (operation.op === "add") {
      current = setByPointer(current, operation.path, cloneJson(operation.value), "add");
      continue;
    }
    if (operation.op === "replace") {
      const existing = getByPointer(current, operation.path);
      if (!existing.exists) {
        throw new Error(`Cannot replace missing JSON Pointer ${operation.path}.`);
      }
      current = setByPointer(current, operation.path, cloneJson(operation.value), "replace");
      continue;
    }
    if (operation.op === "remove") {
      current = removeByPointer(current, operation.path);
      continue;
    }
    if (operation.op === "move") {
      const source = getByPointer(current, operation.from);
      if (!source.exists) {
        throw new Error(`Cannot move missing JSON Pointer ${operation.from}.`);
      }
      current = removeByPointer(current, operation.from);
      current = setByPointer(current, operation.path, cloneJson(source.value), "add");
      continue;
    }
    if (operation.op === "copy") {
      const source = getByPointer(current, operation.from);
      if (!source.exists) {
        throw new Error(`Cannot copy missing JSON Pointer ${operation.from}.`);
      }
      current = setByPointer(current, operation.path, cloneJson(source.value), "add");
      continue;
    }
    if (operation.op === "test") {
      const target = getByPointer(current, operation.path);
      if (!target.exists || !jsonEquals(target.value, operation.value)) {
        throw new Error(`JSON Patch test failed at ${operation.path}.`);
      }
    }
  }
  return current;
}

export function updateLockAfterMigration(input: {
  lock: PodoLock | unknown;
  manifest: MigrationManifest;
  status?: "applied" | "failed" | "pending";
  generatedHash?: string;
  appliedAt?: string;
}): PodoLock {
  const lock = parsePodoLock(input.lock);
  const status = input.status ?? "applied";
  const migration = {
    from: input.manifest.from,
    to: input.manifest.to,
    status,
    ...(status === "applied" ? { appliedAt: input.appliedAt ?? new Date().toISOString() } : {}),
  } satisfies PodoLock["migrations"][number];

  return parsePodoLock({
    ...lock,
    schemaVersion: PODO_SCHEMA_VERSION,
    packageVersion: input.manifest.to,
    migrations: [...lock.migrations.filter((item) => item.to !== input.manifest.to), migration],
    generatedHash: input.generatedHash ?? lock.generatedHash,
  });
}

export function inferMigrationFileKind(path: string, document: unknown): MigrationFileKind {
  const normalized = path.replaceAll("\\", "/");
  if (normalized.endsWith(".tokens.json")) {
    return "token";
  }
  if (normalized.endsWith(".component.json")) {
    return "component";
  }
  if (normalized.endsWith(".podo/lock.json") || normalized === ".podo/lock.json") {
    return "lock";
  }
  if (normalized.endsWith(".podo/config.json") || normalized === ".podo/config.json") {
    return "config";
  }
  if (
    normalized.endsWith(".podo/icons/manifest.json") ||
    normalized === ".podo/icons/manifest.json"
  ) {
    return "icon";
  }
  if (isRecordWithKind(document, "tokens")) {
    return "token";
  }
  if (isRecordWithKind(document, "component")) {
    return "component";
  }
  if (isRecordWithKind(document, "icons")) {
    return "icon";
  }
  return "unknown";
}

export function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isJsonPatchOperation(operation: MigrationOperation): operation is JsonPatchOperation {
  return ["add", "remove", "replace", "move", "copy", "test"].includes(operation.op);
}

function operationTargetsOtherFile(operation: MigrationOperation, path: string): boolean {
  if (!isJsonPatchOperation(operation) || !operation.files?.length) {
    return false;
  }
  return !operation.files.includes(path);
}

function parseAsComponent(document: unknown) {
  try {
    return parseComponentDocument(document);
  } catch {
    return undefined;
  }
}

function tokenPathToPointer(path: string): string {
  return `/tokens/${path.split(".").map(escapePointerSegment).join("/")}`;
}

function collectAliasReplacementPatches(
  document: unknown,
  from: string,
  to: string
): JsonPatchOperation[] {
  const patches: JsonPatchOperation[] = [];
  collectStringPatches(document, "", (value, pointer) => {
    const nextValue = replaceAliasReference(value, from, to);
    if (nextValue !== value) {
      patches.push({ op: "replace", path: pointer, value: nextValue });
    }
  });
  return patches;
}

function replaceAliasReference(value: string, from: string, to: string): string {
  const dotted = value.replaceAll(`{${from}}`, `{${to}}`);
  const pointerFrom = `#/tokens/${from.split(".").map(escapePointerSegment).join("/")}`;
  const pointerTo = `#/tokens/${to.split(".").map(escapePointerSegment).join("/")}`;
  return dotted.replaceAll(pointerFrom, pointerTo);
}

function collectStringPatches(
  value: unknown,
  pointer: string,
  visitor: (value: string, pointer: string) => void
): void {
  if (typeof value === "string") {
    visitor(value, pointer);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStringPatches(item, `${pointer}/${index}`, visitor));
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      collectStringPatches(item, `${pointer}/${escapePointerSegment(key)}`, visitor);
    }
  }
}

function documentContainsAlias(document: unknown, tokenPath: string): boolean {
  let contains = false;
  collectStringPatches(document, "", (value) => {
    if (value.includes(`{${tokenPath}}`)) {
      contains = true;
    }
  });
  return contains;
}

function isDeprecatedToken(token: DesignToken): boolean {
  return Boolean(token.$extensions?.podo?.deprecated);
}

function buildTokenIndex(
  files: MigrationFile[]
): Map<string, Array<{ path: string; value: unknown }>> {
  const index = new Map<string, Array<{ path: string; value: unknown }>>();
  for (const file of files) {
    const kind = file.kind ?? inferMigrationFileKind(file.path, file.document);
    if (kind !== "token") {
      continue;
    }
    collectTokenValues(file.document, "", (path, value) => {
      const entries = index.get(path) ?? [];
      entries.push({ path: file.path, value });
      index.set(path, entries);
    });
  }
  return index;
}

function collectTokenValues(
  value: unknown,
  path: string,
  visitor: (path: string, value: unknown) => void
): void {
  if (isDesignToken(value)) {
    if (path) {
      visitor(path, value);
    }
    return;
  }
  if (!isPlainObject(value)) {
    return;
  }
  const entries =
    isPlainObject(value.tokens) && !path ? Object.entries(value.tokens) : Object.entries(value);
  for (const [key, child] of entries) {
    collectTokenValues(child, path ? `${path}.${key}` : key, visitor);
  }
}

function getByPointer(document: unknown, pointer: string): { exists: boolean; value?: unknown } {
  if (pointer === "") {
    return { exists: true, value: document };
  }
  const segments = pointerSegments(pointer);
  let current = document;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return { exists: false };
      }
      current = current[index];
      continue;
    }
    if (!isPlainObject(current) || !(segment in current)) {
      return { exists: false };
    }
    current = current[segment];
  }
  return { exists: true, value: current };
}

function setByPointer<T>(document: T, pointer: string, value: unknown, mode: "add" | "replace"): T {
  if (pointer === "") {
    return value as T;
  }
  const root = cloneJson(document);
  const segments = pointerSegments(pointer);
  const last = segments.at(-1);
  if (!last) {
    throw new Error(`Invalid JSON Pointer ${pointer}.`);
  }
  const parent = ensurePointerParent(root, segments.slice(0, -1), pointer);
  if (Array.isArray(parent)) {
    const index = last === "-" ? parent.length : Number(last);
    if (!Number.isInteger(index) || index < 0 || index > parent.length) {
      throw new Error(`Invalid array JSON Pointer ${pointer}.`);
    }
    if (mode === "replace" && index >= parent.length) {
      throw new Error(`Cannot replace missing JSON Pointer ${pointer}.`);
    }
    parent.splice(index, mode === "replace" ? 1 : 0, value);
    return root;
  }
  if (!isPlainObject(parent)) {
    throw new Error(`Cannot set JSON Pointer ${pointer}.`);
  }
  if (mode === "replace" && !(last in parent)) {
    throw new Error(`Cannot replace missing JSON Pointer ${pointer}.`);
  }
  parent[last] = value;
  return root;
}

function removeByPointer<T>(document: T, pointer: string): T {
  if (pointer === "") {
    throw new Error("Cannot remove the document root.");
  }
  const root = cloneJson(document);
  const segments = pointerSegments(pointer);
  const last = segments.at(-1);
  if (!last) {
    throw new Error(`Invalid JSON Pointer ${pointer}.`);
  }
  const parentPointer =
    segments.length === 1 ? "" : `/${segments.slice(0, -1).map(escapePointerSegment).join("/")}`;
  const parent = getByPointer(root, parentPointer);
  if (!parent.exists) {
    return root;
  }
  if (Array.isArray(parent.value)) {
    const index = Number(last);
    if (Number.isInteger(index) && index >= 0 && index < parent.value.length) {
      parent.value.splice(index, 1);
    }
    return root;
  }
  if (isPlainObject(parent.value)) {
    delete parent.value[last];
  }
  return root;
}

function ensurePointerParent(root: unknown, segments: string[], pointer: string): unknown {
  let current = root;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        throw new Error(`Invalid array JSON Pointer ${pointer}.`);
      }
      current = current[index];
      continue;
    }
    if (!isPlainObject(current)) {
      throw new Error(`Cannot create JSON Pointer ${pointer}.`);
    }
    if (!(segment in current) || current[segment] === undefined) {
      current[segment] = {};
    }
    current = current[segment];
  }
  return current;
}

function pointerSegments(pointer: string): string[] {
  if (pointer === "") {
    return [];
  }
  if (!pointer.startsWith("/")) {
    throw new Error(`Invalid JSON Pointer ${pointer}.`);
  }
  return pointer.slice(1).split("/").map(unescapePointerSegment);
}

function escapePointerSegment(segment: string): string {
  return segment.replaceAll("~", "~0").replaceAll("/", "~1");
}

function unescapePointerSegment(segment: string): string {
  return segment.replaceAll("~1", "/").replaceAll("~0", "~");
}

function isRecordWithKind(document: unknown, kind: string): boolean {
  return isPlainObject(document) && document.kind === kind;
}

function jsonEquals(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function validateMigrationFile(file: MigrationFile): ValidationIssue[] {
  const kind = file.kind ?? inferMigrationFileKind(file.path, file.document);
  try {
    if (kind === "token") {
      parseTokenDocument(file.document);
    } else if (kind === "component") {
      parseComponentDocument(file.document);
    } else if (kind === "lock") {
      parsePodoLock(file.document);
    }
    return [];
  } catch (error) {
    return [
      {
        code: "migration.file.invalid",
        path: file.path,
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}
