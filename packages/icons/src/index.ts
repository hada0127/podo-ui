import { mkdir, mkdtemp, readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FontAssetType, generateFonts } from "fantasticon";
import { optimize, type Config } from "svgo";
import { compress } from "wawoff2";
import { buildIconFontWoff2 } from "@podo/icon-build";
import {
  parseIconManifest,
  validateIconManifest,
  validateInlineSvg,
  type IconManifest,
  type ValidationIssue,
} from "@podo/spec";

export interface IconBuildOptions {
  manifest: IconManifest;
  svgRoot: string;
  outDir: string;
  groups?: string[];
  fontTypes?: Array<"woff" | "woff2">;
  prefix?: string;
}

export interface IconBuildResult {
  fontFamily: string;
  icons: string[];
  css: string;
  types: string;
  native: string;
  metadata: {
    fontFiles: string[];
    codepoints: Record<string, number>;
    woff2: boolean;
  };
}

export interface SvgRuleResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export async function loadIconManifest(filePath: string): Promise<IconManifest> {
  return parseIconManifest(JSON.parse(await readFile(filePath, "utf8")));
}

export function validateIconBuild(manifest: IconManifest): ValidationIssue[] {
  return validateIconManifest(manifest);
}

export function validateSvgSource(iconName: string, svg: string): SvgRuleResult {
  // Delegates to the shared inline-svg rules in @podo/spec so the browser editor
  // and this Node build validate against one source of truth.
  const issues = validateInlineSvg(iconName, svg);
  return { valid: issues.length === 0, issues };
}

export function optimizeSvg(svg: string): string {
  const plugins = ["preset-default", "removeDimensions"] as unknown as NonNullable<
    Config["plugins"]
  >;

  const result = optimize(svg, {
    multipass: true,
    plugins,
  });

  if ("data" in result) {
    return result.data;
  }

  throw new Error("SVGO failed to optimize SVG.");
}

export function selectIconNames(manifest: IconManifest, groups?: string[]): string[] {
  if (!groups?.length) {
    return Object.keys(manifest.icons).sort();
  }

  const selected = new Set<string>();
  for (const group of groups) {
    const groupIcons = manifest.groups[group];
    if (!groupIcons) {
      throw new Error(`Icon group "${group}" does not exist.`);
    }
    for (const iconName of groupIcons) {
      selected.add(iconName);
    }
  }

  return Array.from(selected).sort();
}

export async function buildIconAssets(options: IconBuildOptions): Promise<IconBuildResult> {
  const issues = validateIconBuild(options.manifest);
  if (issues.length) {
    throw new Error(
      `Icon manifest is invalid:\n${issues.map((issue) => `- ${issue.message}`).join("\n")}`
    );
  }

  const prefix = options.prefix ?? "podo-icon";
  const iconNames = selectIconNames(options.manifest, options.groups);

  // Inline manifests (the browser editor's output) are built with the shared
  // deterministic @podo/icon-build pipeline so the on-disk woff2 is byte-identical
  // to the editor-embedded font (a single source of bytes). The fantasticon path
  // below stays for legacy file-path manifests with arbitrary SVG sources. A
  // manifest must be entirely one kind; reject a partial mix with a clear error.
  const inlineNames = iconNames.filter((name) => options.manifest.icons[name]?.svg != null);
  if (inlineNames.length > 0) {
    const fileNames = iconNames.filter((name) => options.manifest.icons[name]?.svg == null);
    if (fileNames.length > 0) {
      throw new Error(
        `Icon manifest mixes inline and file-path icons; file-path icons: ${fileNames.join(", ")}.`
      );
    }
    return buildInlineIconAssets(options, iconNames, prefix);
  }

  const fontTypes = options.fontTypes ?? ["woff", "woff2"];
  const inputDir = await mkdtemp(join(tmpdir(), "podo-icons-"));
  await mkdir(options.outDir, { recursive: true });

  for (const iconName of iconNames) {
    const icon = options.manifest.icons[iconName];
    if (!icon) {
      throw new Error(`Icon "${iconName}" does not exist.`);
    }
    if (icon.source == null) {
      throw new Error(`Icon "${iconName}" has neither inline svg nor a source file.`);
    }

    const rawSvg = await readFile(join(options.svgRoot, icon.source), "utf8");
    const ruleResult = validateSvgSource(iconName, rawSvg);
    if (!ruleResult.valid) {
      throw new Error(
        `Invalid SVG source:\n${ruleResult.issues.map((issue) => `- ${issue.message}`).join("\n")}`
      );
    }

    await writeFile(join(inputDir, `${iconName}.svg`), optimizeSvg(rawSvg));
  }

  const codepoints = Object.fromEntries(
    iconNames.map((iconName) => [
      iconName,
      Number.parseInt(options.manifest.icons[iconName]!.codepoint, 16),
    ])
  );

  const fantasticonFontTypes = [
    ...(fontTypes.includes("woff") ? [FontAssetType.WOFF] : []),
    ...(fontTypes.includes("woff2") ? [FontAssetType.TTF] : []),
  ];

  const result = await generateFonts({
    inputDir,
    outputDir: options.outDir,
    name: options.manifest.fontFamily,
    fontTypes: fantasticonFontTypes,
    assetTypes: [],
    codepoints,
    formatOptions: { ttf: { ts: 0 } },
    fontHeight: 512,
    normalize: true,
    prefix,
    getIconId: ({ basename: fileBaseName }) => fileBaseName,
  });

  if (fontTypes.includes("woff2")) {
    const ttfPath = join(options.outDir, `${options.manifest.fontFamily}.ttf`);
    const woff2 = await compress(await readFile(ttfPath));
    await writeFile(join(options.outDir, `${options.manifest.fontFamily}.woff2`), woff2);
    await unlink(ttfPath);
  }

  const css = emitIconCss(options.manifest, {
    icons: iconNames,
    prefix,
    fontTypes,
  });
  const types = emitIconTypes(iconNames);
  const native = emitNativeGlyphMap(options.manifest, iconNames);
  const metadata = {
    fontFiles: fontTypes.slice().sort(),
    codepoints: result.codepoints,
    woff2: fontTypes.includes("woff2"),
  };

  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.css`), css);
  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.icons.ts`), types);
  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.native.ts`), native);
  await writeFile(
    join(options.outDir, `${options.manifest.fontFamily}.metadata.json`),
    `${JSON.stringify(metadata, null, 2)}\n`
  );

  return {
    fontFamily: options.manifest.fontFamily,
    icons: iconNames,
    css,
    types,
    native,
    metadata,
  };
}

/**
 * Build an inline (browser-editor) icon manifest to disk using the shared
 * deterministic @podo/icon-build pipeline. The emitted woff2 is byte-identical to
 * the manifest's embedded `fontAsset`, and only woff2 is produced (the always-woff2
 * artifact). Inline SVGs are already normalized single-path sources.
 */
async function buildInlineIconAssets(
  options: IconBuildOptions,
  iconNames: string[],
  prefix: string
): Promise<IconBuildResult> {
  const glyphs = iconNames.map((name) => {
    const icon = options.manifest.icons[name];
    if (!icon || icon.svg == null) {
      throw new Error(`Cannot build a mix of inline and file-path icons ("${name}").`);
    }
    return { name, codepoint: icon.codepoint, svg: icon.svg };
  });

  const { woff2 } = await buildIconFontWoff2({
    fontFamily: options.manifest.fontFamily,
    glyphs,
  });

  await mkdir(options.outDir, { recursive: true });
  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.woff2`), woff2);

  const fontTypes: Array<"woff" | "woff2"> = ["woff2"];
  const css = emitIconCss(options.manifest, { icons: iconNames, prefix, fontTypes });
  const types = emitIconTypes(iconNames);
  const native = emitNativeGlyphMap(options.manifest, iconNames);
  const codepoints: Record<string, number> = {};
  for (const name of iconNames) {
    const icon = options.manifest.icons[name];
    if (icon) {
      codepoints[name] = Number.parseInt(icon.codepoint, 16);
    }
  }
  const metadata = { fontFiles: ["woff2"], codepoints, woff2: true };

  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.css`), css);
  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.icons.ts`), types);
  await writeFile(join(options.outDir, `${options.manifest.fontFamily}.native.ts`), native);
  await writeFile(
    join(options.outDir, `${options.manifest.fontFamily}.metadata.json`),
    `${JSON.stringify(metadata, null, 2)}\n`
  );

  return {
    fontFamily: options.manifest.fontFamily,
    icons: iconNames,
    css,
    types,
    native,
    metadata,
  };
}

export function emitIconCss(
  manifest: IconManifest,
  options: {
    icons?: string[];
    prefix?: string;
    fontTypes?: Array<"woff" | "woff2">;
    fontUrl?: string;
  } = {}
): string {
  const prefix = options.prefix ?? "podo-icon";
  const icons = options.icons ?? Object.keys(manifest.icons).sort();
  const fontUrl = options.fontUrl ?? ".";
  const fontTypes = options.fontTypes ?? ["woff", "woff2"];
  const sources = fontTypes
    .map((type) => {
      const format = type === "woff2" ? "woff2" : "woff";
      return `url("${fontUrl}/${manifest.fontFamily}.${type}") format("${format}")`;
    })
    .join(",\n       ");

  const classes = icons
    .map((iconName) => {
      const icon = manifest.icons[iconName];
      if (!icon) {
        throw new Error(`Icon "${iconName}" does not exist.`);
      }
      return `.${prefix}-${iconName}::before { content: "\\${icon.codepoint}"; }`;
    })
    .join("\n");

  return `@font-face {
  font-family: "${manifest.fontFamily}";
  src: ${sources};
  font-display: block;
}

.${prefix} {
  font-family: "${manifest.fontFamily}";
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
}

${classes}
`;
}

export function emitIconTypes(iconNames: string[], exportName = "PodoIconName"): string {
  const union = iconNames.map((iconName) => JSON.stringify(iconName)).join(" | ") || "never";
  return `export type ${exportName} = ${union};\n\nexport const podoIconNames = ${JSON.stringify(iconNames, null, 2)} as const;\n`;
}

export function emitNativeGlyphMap(
  manifest: IconManifest,
  iconNames = Object.keys(manifest.icons).sort()
): string {
  const map = Object.fromEntries(
    iconNames.map((iconName) => [
      iconName,
      Number.parseInt(manifest.icons[iconName]!.codepoint, 16),
    ])
  );
  return `export const podoIconGlyphMap = ${JSON.stringify(map, null, 2)} as const;\n`;
}
