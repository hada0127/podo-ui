/**
 * Generate the editor's default icon set from the vendored v1 PodoIcons font.
 *
 * v1 ships icons only as a woff font + a name list (no SVG sources). This script
 * extracts each glyph's outline with opentype.js, emits a canonical single-path
 * SVG (viewBox 0 0 1000 1000, currentColor), builds the always-woff2 artifact with
 * the shared @podo/icon-build pipeline, and writes a deterministic, committed
 * `src/default-icons.generated.ts`. Run with `--check` to fail when the committed
 * output is stale.
 *
 * Usage:
 *   pnpm --filter @podo/editor gen:default-icons
 *   pnpm --filter @podo/editor gen:default-icons:check
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import { buildIconFontWoff2, ICON_FONT_UNITS_PER_EM } from "@podo/icon-build";
import {
  computeIconsHash,
  parseIconManifest,
  validateIconManifest,
  type IconManifest,
} from "@podo/spec";

const here = dirname(fileURLToPath(import.meta.url));
const woffPath = resolve(here, "vendor/v1-icon.woff");
const outPath = resolve(here, "../src/default-icons.generated.ts");
const checkMode = process.argv.includes("--check");

const UPM = ICON_FONT_UNITS_PER_EM;

function codepointHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

type PointTransform = (x: number, y: number) => [number, number];

/** Bounding box over a glyph's on- and off-curve points (font units, y-up). */
function glyphBBox(glyph: opentype.Glyph): BBox | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number): void => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const command of glyph.path.commands) {
    if (command.type === "M" || command.type === "L") {
      add(command.x ?? 0, command.y ?? 0);
    } else if (command.type === "C") {
      add(command.x1 ?? 0, command.y1 ?? 0);
      add(command.x2 ?? 0, command.y2 ?? 0);
      add(command.x ?? 0, command.y ?? 0);
    } else if (command.type === "Q") {
      add(command.x1 ?? 0, command.y1 ?? 0);
      add(command.x ?? 0, command.y ?? 0);
    }
  }
  return maxX < minX ? null : { minX, minY, maxX, maxY };
}

function glyphToCanonicalPathData(glyph: opentype.Glyph, transform: PointTransform): string {
  let data = "";
  const at = (x: number, y: number): string => {
    const [tx, ty] = transform(x, y);
    return `${tx} ${ty}`;
  };
  for (const command of glyph.path.commands) {
    switch (command.type) {
      case "M":
        data += `M${at(command.x ?? 0, command.y ?? 0)}`;
        break;
      case "L":
        data += `L${at(command.x ?? 0, command.y ?? 0)}`;
        break;
      case "C":
        data +=
          `C${at(command.x1 ?? 0, command.y1 ?? 0)} ` +
          `${at(command.x2 ?? 0, command.y2 ?? 0)} ` +
          `${at(command.x ?? 0, command.y ?? 0)}`;
        break;
      case "Q":
        data += `Q${at(command.x1 ?? 0, command.y1 ?? 0)} ${at(command.x ?? 0, command.y ?? 0)}`;
        break;
      case "Z":
        data += "Z";
        break;
      default:
        break;
    }
  }
  return data;
}

interface ExtractedIcon {
  name: string;
  codepoint: number;
  svg: string;
}

async function build(): Promise<string> {
  const buffer = readFileSync(woffPath);
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const font = opentype.parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  );

  const drawable: Array<{ name: string; codepoint: number; glyph: opentype.Glyph }> = [];
  for (let index = 0; index < font.glyphs.length; index += 1) {
    const glyph = font.glyphs.get(index);
    if (glyph.unicode == null || glyph.name === ".notdef") {
      continue;
    }
    const name = (glyph.name || `u${glyph.unicode.toString(16)}`).replace(/_/g, "-").toLowerCase();
    drawable.push({ name, codepoint: glyph.unicode, glyph });
  }

  // Fit the whole v1 set into the canonical box with a uniform scale + centering
  // so no glyph's descender is clipped and relative sizes are preserved. v1 places
  // glyphs on a baseline (content below baseline overflowed the 0..1000 box).
  const MARGIN = 64;
  const target = UPM - 2 * MARGIN;
  let gMinX = Infinity;
  let gMinY = Infinity;
  let gMaxX = -Infinity;
  let gMaxY = -Infinity;
  for (const item of drawable) {
    const box = glyphBBox(item.glyph);
    if (!box) continue;
    if (box.minX < gMinX) gMinX = box.minX;
    if (box.minY < gMinY) gMinY = box.minY;
    if (box.maxX > gMaxX) gMaxX = box.maxX;
    if (box.maxY > gMaxY) gMaxY = box.maxY;
  }
  const globalWidth = gMaxX - gMinX || 1;
  const globalHeight = gMaxY - gMinY || 1;
  const scale = target / Math.max(globalWidth, globalHeight);
  const offsetX = MARGIN + (target - globalWidth * scale) / 2;
  const offsetY = MARGIN + (target - globalHeight * scale) / 2;
  // Font units (y-up) -> canonical SVG box (y-down), fit + centered.
  const transform: PointTransform = (x, y) => [
    Math.round(offsetX + (x - gMinX) * scale),
    Math.round(offsetY + (gMaxY - y) * scale),
  ];

  const extracted: ExtractedIcon[] = drawable.map((item) => ({
    name: item.name,
    codepoint: item.codepoint,
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${UPM} ${UPM}">` +
      `<path d="${glyphToCanonicalPathData(item.glyph, transform)}" fill="currentColor"/></svg>`,
  }));
  extracted.sort((a, b) => a.codepoint - b.codepoint);

  const icons: IconManifest["icons"] = {};
  const codepointLock: IconManifest["codepointLock"] = {};
  for (const icon of extracted) {
    icons[icon.name] = { svg: icon.svg, codepoint: codepointHex(icon.codepoint), tags: [] };
    codepointLock[icon.name] = codepointHex(icon.codepoint);
  }

  // Default starter groups: a prefix shared by >= 3 icons (deterministic, sorted).
  const byPrefix = new Map<string, string[]>();
  for (const icon of extracted) {
    const prefix = icon.name.split("-")[0] ?? icon.name;
    const list = byPrefix.get(prefix) ?? [];
    list.push(icon.name);
    byPrefix.set(prefix, list);
  }
  const groups: IconManifest["groups"] = {};
  for (const prefix of [...byPrefix.keys()].sort()) {
    const members = byPrefix.get(prefix);
    if (members && members.length >= 3) {
      groups[prefix] = [...members].sort((a, b) => a.localeCompare(b));
    }
  }

  const floor = Math.max(...extracted.map((icon) => icon.codepoint)) + 1;

  const built = await buildIconFontWoff2({
    fontFamily: "PodoIcons",
    glyphs: extracted.map((icon) => ({
      name: icon.name,
      codepoint: codepointHex(icon.codepoint),
      svg: icon.svg,
    })),
  });

  const baseManifest = parseIconManifest({
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: "PodoIcons",
    icons,
    groups,
    codepointLock,
  });
  const manifest: IconManifest = {
    schemaVersion: "2.0.0",
    kind: "icons",
    fontFamily: "PodoIcons",
    icons,
    groups,
    codepointLock,
    fontAsset: {
      kind: "font",
      source: "embedded",
      family: "PodoIcons",
      fileName: "PodoIcons.woff2",
      format: "woff2",
      mimeType: "font/woff2",
      dataUrl: built.dataUrl,
    },
    fontBuild: {
      iconsHash: computeIconsHash(baseManifest),
      unitsPerEm: UPM,
      glyphCount: built.glyphCount,
    },
  };

  const issues = validateIconManifest(manifest);
  if (issues.length > 0) {
    throw new Error(
      `Generated default icon manifest is invalid:\n${issues
        .map((issue) => `- ${issue.code} ${issue.message}`)
        .join("\n")}`
    );
  }

  return (
    `// AUTO-GENERATED by scripts/generate-default-icons.mts — DO NOT EDIT BY HAND.\n` +
    `// Regenerate with: pnpm --filter @podo/editor gen:default-icons\n` +
    `// Source: scripts/vendor/v1-icon.woff (sha256 ${sha256})\n` +
    `// ${extracted.length} icons imported from the v1 PodoIcons font.\n` +
    `import type { IconManifest } from "@podo/spec";\n\n` +
    `/** Next free PUA codepoint above the v1 set; new icons allocate from here. */\n` +
    `export const DEFAULT_ICON_CODEPOINT_FLOOR = 0x${floor.toString(16).toUpperCase()};\n\n` +
    `export const DEFAULT_ICON_MANIFEST: IconManifest = ${JSON.stringify(manifest, null, 2)};\n`
  );
}

const output = await build();
if (checkMode) {
  let current = "";
  try {
    current = readFileSync(outPath, "utf8");
  } catch {
    current = "";
  }
  if (current !== output) {
    console.error(
      "default-icons.generated.ts is out of date. Run `pnpm --filter @podo/editor gen:default-icons`."
    );
    process.exit(1);
  }
  console.log("default-icons.generated.ts is up to date.");
} else {
  writeFileSync(outPath, output);
  console.log(`Wrote ${outPath}`);
}
