import type { DesignToken } from "@podo/spec";
import { editorTokenTypes, type EditorTokenRecord } from "./spec-editing.js";
import { tokenVariationName } from "./token-lookup.js";

// Shared <datalist> id for typed token-reference autocomplete (report.md P0 #5).
// Any value input that accepts a `{token.path}` alias references this list so the
// browser offers existing token paths; the App renders the datalist with options.
export const TOKEN_REFERENCE_LIST_ID = "podo-token-references";

export function tokenReferenceOptions(records: EditorTokenRecord[]): string[] {
  return Array.from(new Set(records.map((record) => `{${record.path}}`))).sort();
}

export function tokenRecordKey(record: EditorTokenRecord): string {
  return `${record.documentIndex}:${record.path}`;
}

interface TokenMatrixRow {
  id: string;
  label: string;
  cells: Record<string, EditorTokenRecord | undefined>;
}

export interface TokenMatrixModel {
  type: DesignToken["$type"];
  columns: string[];
  rows: TokenMatrixRow[];
  totalRecords: number;
}

export interface TypographyWorkspaceModel {
  families: EditorTokenRecord[];
  weights: EditorTokenRecord[];
  sizes: EditorTokenRecord[];
  styles: EditorTokenRecord[];
}

/**
 * A single color variation paired across color schemes so the editor can render
 * light (left) and dark (right) next to each other for easy comparison. Either
 * side may be missing (a light-only or dark-only token).
 */
export interface ColorComparisonCell {
  light?: EditorTokenRecord;
  dark?: EditorTokenRecord;
}

export interface ColorComparisonRow {
  /** Neutralized (scheme-stripped) parent path, e.g. "color.bg". */
  id: string;
  /** Display label with the leading "color." removed, e.g. "bg". */
  label: string;
  cells: Record<string, ColorComparisonCell>;
}

export interface ColorComparisonMatrixModel {
  columns: string[];
  rows: ColorComparisonRow[];
  totalRecords: number;
}

/**
 * Build a single matrix where each color variation pairs its light and dark
 * records into one cell. Light tokens live at `color.*`; dark tokens live at
 * `dark.color.*`. Both project to the same neutral path (the `dark.` prefix is
 * stripped) so they line up in the same row/column. See report.md theming model.
 */
export function createColorComparisonMatrix(
  records: EditorTokenRecord[],
  options: { include?: "basic" | "base" | "all" } = {}
): ColorComparisonMatrixModel {
  const include = options.include ?? "all";
  const columns: string[] = [];
  const rows = new Map<string, ColorComparisonRow>();
  let totalRecords = 0;
  for (const record of records) {
    if (record.token.$type !== "color") {
      continue;
    }
    const isDark = record.path.startsWith("dark.color.");
    const isLight = record.path.startsWith("color.");
    if (!isDark && !isLight) {
      continue;
    }
    const neutralPath = isDark ? record.path.slice("dark.".length) : record.path;
    // Basic colors ("기본 컬러") and the base palette ("베이스 컬러") are managed in
    // separate sections, so each matrix takes only its own kind.
    const isBase = isBaseColorTokenPath(neutralPath);
    if ((include === "basic" && isBase) || (include === "base" && !isBase)) {
      continue;
    }
    const parentPath = tokenParentPath(neutralPath);
    const column = tokenVariationName(neutralPath);
    if (!columns.includes(column)) {
      columns.push(column);
    }
    const row = rows.get(parentPath) ?? {
      id: parentPath,
      label: colorComparisonRowLabel(parentPath),
      cells: {},
    };
    const cell = row.cells[column] ?? {};
    if (isDark) {
      cell.dark = record;
    } else {
      cell.light = record;
    }
    row.cells[column] = cell;
    rows.set(parentPath, row);
    totalRecords += 1;
  }
  return {
    columns: sortTokenMatrixColumns(columns, "color"),
    // Base palette ("베이스 컬러") is managed separately: its color sets sort below
    // the basic colors so they read as a distinct group at the bottom of the editor.
    rows: [...rows.values()].sort(
      (a, b) => Number(isBaseColorTokenPath(a.id)) - Number(isBaseColorTokenPath(b.id))
    ),
    totalRecords,
  };
}

/**
 * Whether a color token belongs to the base palette ("베이스 컬러" — the raw colors
 * the basic colors are built from), identified by a `color.base.*` path. Used to
 * keep base colors grouped after the basic colors in the editor and the picker.
 */
export function isBaseColorTokenPath(path: string): boolean {
  const neutral = path.startsWith("dark.") ? path.slice("dark.".length) : path;
  return neutral.startsWith("color.base.");
}

/** Derive the dark counterpart path for a light color path (and vice versa). */
export function colorCounterpartPath(neutralColorPath: string, scheme: "light" | "dark"): string {
  return scheme === "dark" ? `dark.${neutralColorPath}` : neutralColorPath;
}

function colorComparisonRowLabel(parentPath: string): string {
  return parentPath.startsWith("color.") ? parentPath.slice("color.".length) : parentPath;
}

export interface ComponentTokenEditorModel {
  componentId: string;
  records: EditorTokenRecord[];
  groups: Array<{ type: DesignToken["$type"]; records: EditorTokenRecord[] }>;
}

// fontSize is responsive: the base field edits the pc value; `fontSize.tablet` /
// `fontSize.mobile` edit the breakpoint overrides (dotted so the commit handler
// stays a single `(record, field, value)` signature).
export type TypographyTokenField =
  | "fontFamily"
  | "fontSize"
  | "fontSize.tablet"
  | "fontSize.mobile"
  | "lineHeight"
  | "fontWeight"
  | "letterSpacing"
  | "paragraphSpacing";

const typographyWorkspaceTypes = new Set<DesignToken["$type"]>([
  "fontFamily",
  "fontWeight",
  "typography",
]);
const componentLocalTokenTypes = new Set<DesignToken["$type"]>(["dimension", "number", "string"]);

export function createTypographyWorkspaceModel(
  records: EditorTokenRecord[]
): TypographyWorkspaceModel {
  return {
    families: records.filter((record) => record.token.$type === "fontFamily"),
    weights: records.filter((record) => record.token.$type === "fontWeight"),
    sizes: records.filter(isFontSizeTokenRecord),
    styles: records.filter((record) => record.token.$type === "typography"),
  };
}

export function isTypographyWorkspaceType(type: DesignToken["$type"]): boolean {
  return typographyWorkspaceTypes.has(type);
}

function isFontSizeTokenRecord(record: EditorTokenRecord): boolean {
  if (record.token.$type !== "dimension") {
    return false;
  }
  const roles = record.token.$extensions?.podo?.roles;
  return (
    record.path.startsWith("font.size.") ||
    Boolean(roles?.includes("font") && roles.includes("size"))
  );
}

export function createComponentTokenEditorModel(
  records: EditorTokenRecord[],
  componentId: string
): ComponentTokenEditorModel {
  const componentRecords = records.filter((record) =>
    isComponentLocalEditableTokenRecord(record, componentId)
  );
  return {
    componentId,
    records: componentRecords,
    groups: editorTokenTypes.flatMap((type) => {
      const typedRecords = componentRecords.filter((record) => record.token.$type === type);
      return typedRecords.length ? [{ type, records: typedRecords }] : [];
    }),
  };
}

function isComponentScopedTokenRecord(record: EditorTokenRecord, componentId?: string): boolean {
  if (!record.path.startsWith("component.")) {
    return false;
  }
  return componentId ? record.path.startsWith(`component.${componentId}.`) : true;
}

function isComponentLocalEditableTokenRecord(
  record: EditorTokenRecord,
  componentId?: string
): boolean {
  return (
    isComponentScopedTokenRecord(record, componentId) &&
    componentLocalTokenTypes.has(record.token.$type)
  );
}

export function createTokenMatrix(
  records: EditorTokenRecord[],
  type: DesignToken["$type"]
): TokenMatrixModel {
  const matrixRecords = records.filter((record) => shouldIncludeTokenInMatrix(record, type));
  const columns: string[] = [];
  const rows = new Map<string, TokenMatrixRow>();

  for (const record of matrixRecords) {
    const parentPath = tokenParentPath(record.path);
    const column = tokenVariationName(record.path);
    if (!columns.includes(column)) {
      columns.push(column);
    }
    const row = rows.get(parentPath) ?? {
      id: parentPath,
      label: tokenMatrixRowLabel(parentPath, type),
      cells: {},
    };
    row.cells[column] = record;
    rows.set(parentPath, row);
  }

  return {
    type,
    columns: sortTokenMatrixColumns(columns, type),
    rows: [...rows.values()],
    totalRecords: matrixRecords.length,
  };
}

function shouldIncludeTokenInMatrix(
  record: EditorTokenRecord,
  type: DesignToken["$type"]
): boolean {
  if (record.token.$type !== type) {
    return false;
  }
  if (type === "color") {
    return record.path.startsWith("color.") || record.path.startsWith("dark.color.");
  }
  if (type === "dimension") {
    return !isFontSizeTokenRecord(record) && !isComponentLocalEditableTokenRecord(record);
  }
  if (type === "number" || type === "string") {
    return !isComponentLocalEditableTokenRecord(record);
  }
  return true;
}

function tokenMatrixRowLabel(parentPath: string, type: DesignToken["$type"]): string {
  const lightPrefix = `${type}.`;
  const darkPrefix = `dark.${type}.`;
  if (parentPath.startsWith(darkPrefix)) {
    return `dark / ${parentPath.slice(darkPrefix.length)}`;
  }
  if (parentPath.startsWith(lightPrefix)) {
    return parentPath.slice(lightPrefix.length);
  }
  return parentPath;
}

function sortTokenMatrixColumns(columns: string[], type: DesignToken["$type"]): string[] {
  if (type !== "color") {
    return columns;
  }
  return [...columns].sort((a, b) => {
    const aIndex = colorMatrixColumnOrder.indexOf(a as (typeof colorMatrixColumnOrder)[number]);
    const bIndex = colorMatrixColumnOrder.indexOf(b as (typeof colorMatrixColumnOrder)[number]);
    if (aIndex >= 0 || bIndex >= 0) {
      return (
        (aIndex >= 0 ? aIndex : Number.MAX_SAFE_INTEGER) -
        (bIndex >= 0 ? bIndex : Number.MAX_SAFE_INTEGER)
      );
    }
    return a.localeCompare(b);
  });
}

const colorMatrixColumnOrder = [
  "base",
  "hover",
  "pressed",
  "focus",
  "fill",
  "reverse",
  "outline",
  "modal",
  "disabled",
  "toggle",
  "indicator",
  "block",
  "elevation",
] as const;

export interface TokenTypeGroup {
  type: DesignToken["$type"];
  label: string;
  count: number;
  sections: Array<{ parentPath: string; records: EditorTokenRecord[] }>;
  // Set on the base-palette ("base color") group so it is a distinct sidebar entry
  // from the basic "color" group even though both are $type "color".
  view?: "baseColor";
}

export function groupTokenRecordsByType(records: EditorTokenRecord[]): TokenTypeGroup[] {
  const buckets = new Map<DesignToken["$type"], EditorTokenRecord[]>();
  for (const record of records) {
    const bucket = buckets.get(record.token.$type) ?? [];
    bucket.push(record);
    buckets.set(record.token.$type, bucket);
  }
  return editorTokenTypes.flatMap((type): TokenTypeGroup[] => {
    if (type === "fontFamily" || type === "fontWeight") {
      return [];
    }
    if (type === "color") {
      // "color" (basic) and "base color" are completely separate token entries.
      const colorRecords = buckets.get("color") ?? [];
      const basic = colorRecords.filter((record) => !isBaseColorTokenPath(record.path));
      const base = colorRecords.filter((record) => isBaseColorTokenPath(record.path));
      // Base color leads the sidebar (it is the foundation the basic colors are
      // built from); the basic "color" entry follows.
      const groups: TokenTypeGroup[] = [];
      if (base.length) {
        groups.push({
          type: "color",
          label: "base color",
          view: "baseColor",
          count: base.length,
          sections: groupTokenRecordsByParentPath(base),
        });
      }
      if (basic.length) {
        groups.push({
          type: "color",
          label: "color",
          count: basic.length,
          sections: groupTokenRecordsByParentPath(basic),
        });
      }
      return groups;
    }
    const typedRecords =
      type === "typography"
        ? records.filter(isTypographyWorkspaceTokenRecord)
        : (buckets.get(type) ?? []).filter((record) =>
            shouldIncludeTokenInGlobalTypeGroup(record, type)
          );
    return typedRecords.length
      ? [
          {
            type,
            label: type,
            count: typedRecords.length,
            sections: groupTokenRecordsByParentPath(typedRecords),
          },
        ]
      : [];
  });
}

function shouldIncludeTokenInGlobalTypeGroup(
  record: EditorTokenRecord,
  type: DesignToken["$type"]
): boolean {
  if (type === "dimension") {
    return !isFontSizeTokenRecord(record) && !isComponentLocalEditableTokenRecord(record);
  }
  if (type === "number" || type === "string") {
    return !isComponentLocalEditableTokenRecord(record);
  }
  return true;
}

export function isTypographyWorkspaceTokenRecord(record: EditorTokenRecord): boolean {
  return (
    record.token.$type === "fontFamily" ||
    record.token.$type === "fontWeight" ||
    record.token.$type === "typography" ||
    isFontSizeTokenRecord(record)
  );
}

function groupTokenRecordsByParentPath(
  records: EditorTokenRecord[]
): Array<{ parentPath: string; records: EditorTokenRecord[] }> {
  const buckets = new Map<string, EditorTokenRecord[]>();
  for (const record of records) {
    const parentPath = tokenParentPath(record.path);
    const bucket = buckets.get(parentPath) ?? [];
    bucket.push(record);
    buckets.set(parentPath, bucket);
  }
  return [...buckets.entries()].map(([parentPath, sectionRecords]) => ({
    parentPath,
    records: sectionRecords,
  }));
}

function tokenParentPath(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts.slice(0, -1).join(".") : "root";
}
