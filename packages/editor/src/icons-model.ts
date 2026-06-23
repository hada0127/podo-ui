import {
  PodoEditError,
  computeIconsHash,
  type EmbeddedFontAsset,
  type IconManifest,
} from "@podo/spec";
import { ICON_FONT_UNITS_PER_EM, sanitizeIconSvg, type IconGlyphInput } from "@podo/icon-build";

/** Inline icon definition the editor works on (svg is always present). */
export interface EditorIcon {
  svg: string;
  codepoint: string;
  tags: string[];
  description?: string;
}

/**
 * Transient editing model for the icon set. It is never serialized directly;
 * {@link toIconManifest} maps it back to a validated {@link IconManifest} (with a
 * freshly built woff2) at the commit boundary. `builtHash` records the icon-set
 * hash the embedded font was last built from, so the UI can show a "stale" state.
 */
export interface EditorIconManifest {
  fontFamily: string;
  icons: Record<string, EditorIcon>;
  groups: Record<string, string[]>;
  fontAsset?: EmbeddedFontAsset;
  builtHash?: string;
}

const PUA_START = 0xe000;
const PUA_END = 0xf8ff;

function codepointHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

function cloneGroups(groups: Record<string, string[]>): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  for (const [name, members] of Object.entries(groups)) {
    next[name] = [...members];
  }
  return next;
}

export function fromIconManifest(manifest: IconManifest): EditorIconManifest {
  const icons: Record<string, EditorIcon> = {};
  for (const [name, def] of Object.entries(manifest.icons)) {
    icons[name] = {
      // A host-supplied manifest is untrusted markup that is rendered via
      // dangerouslySetInnerHTML; sanitize at ingress so the model invariant
      // "icon svg is geometry only" holds for prop-loaded sets too.
      svg: sanitizeIconSvg(def.svg ?? ""),
      codepoint: def.codepoint,
      tags: [...def.tags],
      ...(def.description ? { description: def.description } : {}),
    };
  }
  const model: EditorIconManifest = {
    fontFamily: manifest.fontFamily,
    icons,
    groups: cloneGroups(manifest.groups),
    ...(manifest.fontAsset ? { fontAsset: manifest.fontAsset } : {}),
  };
  // The embedded font's geometry is unchanged by sanitization (only non-geometry
  // markup is stripped), so a freshly loaded, already-built manifest must not read
  // as stale. Re-derive builtHash from the sanitized icon set it now matches.
  if (manifest.fontAsset) {
    model.builtHash = iconSetHash(model);
  }
  return model;
}

/**
 * Map the editing model back to a validated manifest. The codepoint lock is
 * re-derived for every icon from its own codepoint, so the lock can never drift
 * out of sync. Requires the freshly built woff2 `fontAsset` (the always-woff2
 * artifact), and stamps the matching content hash.
 */
export function toIconManifest(
  model: EditorIconManifest,
  fontAsset: EmbeddedFontAsset
): IconManifest {
  const icons: IconManifest["icons"] = {};
  const codepointLock: IconManifest["codepointLock"] = {};
  for (const [name, def] of Object.entries(model.icons)) {
    icons[name] = {
      svg: def.svg,
      codepoint: def.codepoint,
      tags: def.tags,
      ...(def.description ? { description: def.description } : {}),
    };
    codepointLock[name] = def.codepoint;
  }
  const base: IconManifest = {
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: model.fontFamily,
    icons,
    groups: cloneGroups(model.groups),
    codepointLock,
    fontAsset,
    fontBuild: {
      iconsHash: "",
      unitsPerEm: ICON_FONT_UNITS_PER_EM,
      glyphCount: Object.keys(icons).length + 1,
    },
  };
  return { ...base, fontBuild: { ...base.fontBuild!, iconsHash: computeIconsHash(base) } };
}

/** Glyph inputs for @podo/icon-build, ordered by codepoint for determinism. */
export function iconGlyphsFromModel(model: EditorIconManifest): IconGlyphInput[] {
  return Object.entries(model.icons)
    .map(([name, def]) => ({ name, codepoint: def.codepoint, svg: def.svg }))
    .sort((a, b) => Number.parseInt(a.codepoint, 16) - Number.parseInt(b.codepoint, 16));
}

/** Content hash of the current icon set (independent of the built font). */
export function iconSetHash(model: EditorIconManifest): string {
  const icons: IconManifest["icons"] = {};
  const codepointLock: IconManifest["codepointLock"] = {};
  for (const [name, def] of Object.entries(model.icons)) {
    icons[name] = { svg: def.svg, codepoint: def.codepoint, tags: def.tags };
    codepointLock[name] = def.codepoint;
  }
  return computeIconsHash({
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: model.fontFamily,
    icons,
    groups: model.groups,
    codepointLock,
  });
}

/** Whether the embedded font is out of date relative to the current icons. */
export function isIconFontStale(model: EditorIconManifest): boolean {
  return model.builtHash !== iconSetHash(model);
}

function usedCodepoints(model: EditorIconManifest): Set<number> {
  const used = new Set<number>();
  for (const def of Object.values(model.icons)) {
    used.add(Number.parseInt(def.codepoint, 16));
  }
  return used;
}

/** Next free Private Use Area codepoint at or above `floor`, never colliding. */
export function nextFreeCodepoint(model: EditorIconManifest, floor: number): string {
  const used = usedCodepoints(model);
  let candidate = Math.max(floor, PUA_START);
  while (used.has(candidate) && candidate <= PUA_END) {
    candidate += 1;
  }
  if (candidate > PUA_END) {
    throw new PodoEditError(
      "icons.noFreeCodepoints",
      "No free Private Use Area codepoints remain for a new icon."
    );
  }
  return codepointHex(candidate);
}

/** Normalize a free-text label into a unique kebab-case icon identifier. */
export function normalizeIconName(input: string, taken: Set<string>): string {
  let base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  if (!base || !/^[a-z]/.test(base)) {
    base = base ? `icon-${base}` : "icon";
  }
  if (!taken.has(base)) {
    return base;
  }
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

function withIcons(
  model: EditorIconManifest,
  icons: Record<string, EditorIcon>
): EditorIconManifest {
  return { ...model, icons };
}

export function addIcon(
  model: EditorIconManifest,
  input: { name: string; svg: string; floor: number; tags?: string[]; description?: string }
): { model: EditorIconManifest; name: string } {
  const name = normalizeIconName(input.name, new Set(Object.keys(model.icons)));
  const codepoint = nextFreeCodepoint(model, input.floor);
  const icon: EditorIcon = {
    svg: input.svg,
    codepoint,
    tags: input.tags ?? [],
    ...(input.description ? { description: input.description } : {}),
  };
  return { model: withIcons(model, { ...model.icons, [name]: icon }), name };
}

export function renameIcon(
  model: EditorIconManifest,
  from: string,
  to: string
): { model: EditorIconManifest; name: string } {
  const existing = model.icons[from];
  if (!existing) {
    return { model, name: from };
  }
  const taken = new Set(Object.keys(model.icons).filter((name) => name !== from));
  const name = normalizeIconName(to, taken);
  if (name === from) {
    return { model, name };
  }
  // Preserve insertion order while renaming the key (keeps codepoint, so the lock
  // stays stable for every other icon).
  const icons: Record<string, EditorIcon> = {};
  for (const [key, value] of Object.entries(model.icons)) {
    icons[key === from ? name : key] = value;
  }
  const groups: Record<string, string[]> = {};
  for (const [group, members] of Object.entries(model.groups)) {
    groups[group] = members.map((member) => (member === from ? name : member));
  }
  return { model: { ...model, icons, groups }, name };
}

export function replaceIconSvg(
  model: EditorIconManifest,
  name: string,
  svg: string
): EditorIconManifest {
  const existing = model.icons[name];
  if (!existing) {
    return model;
  }
  return withIcons(model, { ...model.icons, [name]: { ...existing, svg } });
}

export function updateIconTags(
  model: EditorIconManifest,
  name: string,
  tags: string[]
): EditorIconManifest {
  const existing = model.icons[name];
  if (!existing) {
    return model;
  }
  return withIcons(model, { ...model.icons, [name]: { ...existing, tags } });
}

export function updateIconDescription(
  model: EditorIconManifest,
  name: string,
  description: string
): EditorIconManifest {
  const existing = model.icons[name];
  if (!existing) {
    return model;
  }
  const next: EditorIcon = { ...existing };
  if (description.trim()) {
    next.description = description.trim();
  } else {
    delete next.description;
  }
  return withIcons(model, { ...model.icons, [name]: next });
}

export function deleteIcon(model: EditorIconManifest, name: string): EditorIconManifest {
  if (!model.icons[name]) {
    return model;
  }
  const icons: Record<string, EditorIcon> = {};
  for (const [key, value] of Object.entries(model.icons)) {
    if (key !== name) {
      icons[key] = value;
    }
  }
  const groups: Record<string, string[]> = {};
  for (const [group, members] of Object.entries(model.groups)) {
    groups[group] = members.filter((member) => member !== name);
  }
  return { ...model, icons, groups };
}

export function createGroup(
  model: EditorIconManifest,
  label: string
): { model: EditorIconManifest; name: string } {
  const name = normalizeIconName(label, new Set(Object.keys(model.groups)));
  if (model.groups[name]) {
    return { model, name };
  }
  return { model: { ...model, groups: { ...model.groups, [name]: [] } }, name };
}

export function renameGroup(
  model: EditorIconManifest,
  from: string,
  to: string
): { model: EditorIconManifest; name: string } {
  if (!model.groups[from]) {
    return { model, name: from };
  }
  const taken = new Set(Object.keys(model.groups).filter((name) => name !== from));
  const name = normalizeIconName(to, taken);
  if (name === from) {
    return { model, name };
  }
  const groups: Record<string, string[]> = {};
  for (const [key, members] of Object.entries(model.groups)) {
    groups[key === from ? name : key] = members;
  }
  return { model: { ...model, groups }, name };
}

export function deleteGroup(model: EditorIconManifest, name: string): EditorIconManifest {
  if (!model.groups[name]) {
    return model;
  }
  const groups: Record<string, string[]> = {};
  for (const [key, members] of Object.entries(model.groups)) {
    if (key !== name) {
      groups[key] = members;
    }
  }
  return { ...model, groups };
}

export function setIconGroupMembership(
  model: EditorIconManifest,
  group: string,
  name: string,
  member: boolean
): EditorIconManifest {
  const members = model.groups[group];
  if (!members || !model.icons[name]) {
    return model;
  }
  const has = members.includes(name);
  if (member === has) {
    return model;
  }
  const next = member ? [...members, name] : members.filter((item) => item !== name);
  return { ...model, groups: { ...model.groups, [group]: next } };
}
