/**
 * Generate the editor's default icon set from the vendored Figma stroke SVGs.
 *
 * The Podo v2 icon set is authored in Figma as 24px **stroke** outline icons
 * (round caps/joins). Each icon's source SVG is vendored verbatim under
 * `vendor/figma-icons/` and stored as-is in the manifest, so the editor shows and
 * edits strokes. The always-woff2 artifact is built by the shared
 * `@podo/icon-build` pipeline, which expands the strokes to filled glyph outlines
 * at build time. Output is deterministic and committed to
 * `src/default-icons.generated.ts`; run with `--check` to fail when stale.
 *
 * Usage:
 *   pnpm --filter @podo/editor gen:default-icons
 *   pnpm --filter @podo/editor gen:default-icons:check
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildIconFontWoff2, ICON_FONT_UNITS_PER_EM } from "@podo/icon-build";
import {
  computeIconsHash,
  parseIconManifest,
  validateIconManifest,
  type IconManifest,
} from "@podo/spec";

const here = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(here, "vendor/figma-icons");
const outPath = resolve(here, "../src/default-icons.generated.ts");
const checkMode = process.argv.includes("--check");

const UPM = ICON_FONT_UNITS_PER_EM;
// Private Use Area start; the Figma set is allocated sequentially from here in
// sorted-name order, so codepoints are stable as long as names are unchanged.
const CODEPOINT_START = 0xe001;

function codepointHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

// Variant groups mirror the Figma "Icon-*" frames that hold more than one symbol.
// Single-icon frames stay ungrouped (they surface under "All icons").
const GROUPS: Record<string, string[]> = {
  arrow: ["arrow-left", "arrow-right", "arrow-up", "arrow-down", "arrow-up-right"],
  chevron: ["chevron-left", "chevron-right", "chevron-up", "chevron-down"],
  align: [
    "align-horizontal-left",
    "align-horizontal-center",
    "align-horizontal-right",
    "align-vertical-top",
    "align-vertical-middle",
    "align-vertical-bottom",
    "align-gap-horizontal",
    "align-gap-vertical",
  ],
  user: ["user", "user-plus", "user-minus", "users"],
  eye: ["eye", "eye-off", "eye-closed"],
  file: ["file", "file-none"],
  send: ["send", "send-right"],
  headphones: ["headphones", "headphones-line"],
  trend: ["trend-up", "trend-down"],
  lock: ["lock", "unlock"],
  "double-arrow": ["arrow-right-left", "arrow-up-down"],
};

interface VendorIcon {
  name: string;
  svg: string;
}

/** Drop fixed width/height from the root <svg> (icons must be viewBox-only to scale). */
function stripRootSvgSize(svg: string): string {
  return svg.replace(/<svg\b[^>]*?>/i, (tag) =>
    tag.replace(/\s+(?:width|height)\s*=\s*"[^"]*"/gi, "")
  );
}

function loadVendorIcons(): VendorIcon[] {
  const files = readdirSync(iconsDir)
    .filter((file) => file.endsWith(".svg"))
    .sort();
  return files.map((file) => ({
    name: file.slice(0, -4),
    svg: stripRootSvgSize(readFileSync(resolve(iconsDir, file), "utf8").trim()),
  }));
}

async function build(): Promise<string> {
  const vendor = loadVendorIcons();
  const sha256 = createHash("sha256")
    .update(vendor.map((icon) => `${icon.name}\n${icon.svg}`).join("\n"))
    .digest("hex");

  const icons: IconManifest["icons"] = {};
  const codepointLock: IconManifest["codepointLock"] = {};
  vendor.forEach((icon, index) => {
    const codepoint = codepointHex(CODEPOINT_START + index);
    icons[icon.name] = { svg: icon.svg, codepoint, tags: [] };
    codepointLock[icon.name] = codepoint;
  });

  // Keep only groups whose members all exist; sort members for stable output.
  const known = new Set(vendor.map((icon) => icon.name));
  const groups: IconManifest["groups"] = {};
  for (const groupName of Object.keys(GROUPS).sort()) {
    const members = (GROUPS[groupName] ?? []).filter((name) => known.has(name));
    if (members.length > 0) {
      groups[groupName] = [...members].sort((a, b) => a.localeCompare(b));
    }
  }

  const floor = CODEPOINT_START + vendor.length;

  const built = await buildIconFontWoff2({
    fontFamily: "PodoIcons",
    glyphs: vendor.map((icon) => ({
      name: icon.name,
      codepoint: codepointLock[icon.name]!,
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
    `// Source: scripts/vendor/figma-icons/ (sha256 ${sha256})\n` +
    `// ${vendor.length} stroke icons imported from the PODO v2 Figma icon set.\n` +
    `import type { IconManifest } from "@podo/spec";\n\n` +
    `/** Next free PUA codepoint above the Figma set; new icons allocate from here. */\n` +
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
