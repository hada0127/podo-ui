import { createHash } from "node:crypto";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildIconFontWoff2 } from "@podo/icon-build";
import { computeIconsHash, parseIconManifest } from "@podo/spec";
import {
  buildIconAssets,
  emitIconCss,
  emitIconTypes,
  emitNativeGlyphMap,
  loadIconManifest,
  optimizeSvg,
  selectIconNames,
  validateSvgSource,
} from "./index.js";

const manifestPath = resolve(process.cwd(), "packages/spec/samples/icons/podo-icons.json");
const svgRoot = resolve(process.cwd(), "packages/icons/samples");

describe("@podo/icons", () => {
  it("validates SVG source rules and optimizes SVG input", () => {
    const validSvg = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M0 0H24V24H0z"/></svg>';
    const invalidSvg = '<svg width="24" height="24"><path fill="red" d="M0 0H24V24H0z"/></svg>';

    expect(validateSvgSource("valid", validSvg).issues).toEqual([]);
    expect(validateSvgSource("invalid", invalidSvg).issues.map((issue) => issue.code)).toEqual([
      "icon.svg.missingViewBox",
      "icon.svg.fixedSize",
      "icon.svg.missingCurrentColor",
    ]);
    expect(optimizeSvg(validSvg)).toContain("viewBox");
  });

  it("emits CSS, TypeScript icon names, native glyph maps, and subsets", async () => {
    const manifest = await loadIconManifest(manifestPath);
    const navigationIcons = selectIconNames(manifest, ["navigation"]);
    const css = emitIconCss(manifest, { icons: navigationIcons, prefix: "podo-icon" });
    const types = emitIconTypes(navigationIcons);
    const native = emitNativeGlyphMap(manifest, navigationIcons);

    expect(navigationIcons).toEqual(["chevron-left", "chevron-right", "menu"]);
    expect(css).toMatchSnapshot("icon-css");
    expect(types).toMatchSnapshot("icon-types");
    expect(native).toMatchSnapshot("native-glyph-map");
  });

  it("builds deterministic WOFF and WOFF2 icon font assets", async () => {
    const manifest = await loadIconManifest(manifestPath);
    const outDir = await mkdtemp(join(tmpdir(), "podo-icons-"));
    const secondOutDir = await mkdtemp(join(tmpdir(), "podo-icons-"));
    const result = await buildIconAssets({
      manifest,
      svgRoot,
      outDir,
      groups: ["navigation"],
    });
    await buildIconAssets({
      manifest,
      svgRoot,
      outDir: secondOutDir,
      groups: ["navigation"],
    });

    const woff = await stat(join(outDir, "PodoIcons.woff"));
    const woff2 = await stat(join(outDir, "PodoIcons.woff2"));
    const css = await readFile(join(outDir, "PodoIcons.css"), "utf8");
    const metadata = JSON.parse(
      await readFile(join(outDir, "PodoIcons.metadata.json"), "utf8")
    ) as {
      fontFiles: string[];
      woff2: boolean;
    };

    expect(woff.size).toBeGreaterThan(0);
    expect(woff2.size).toBeGreaterThan(0);
    expect(await fileHash(join(outDir, "PodoIcons.woff"))).toBe(
      await fileHash(join(secondOutDir, "PodoIcons.woff"))
    );
    expect(await fileHash(join(outDir, "PodoIcons.woff2"))).toBe(
      await fileHash(join(secondOutDir, "PodoIcons.woff2"))
    );
    expect(result.icons).toEqual(["chevron-left", "chevron-right", "menu"]);
    expect(result.metadata.woff2).toBe(true);
    expect(metadata.fontFiles).toEqual(["woff", "woff2"]);
    expect(css).toContain(".podo-icon-chevron-left::before");
  });

  it("builds inline manifests as woff2 via the shared pipeline, byte-identical to the editor", async () => {
    const icons = {
      box: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
        codepoint: "E900",
        tags: [],
      },
      bar: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M100 400H900V600H100Z" fill="currentColor"/></svg>',
        codepoint: "E901",
        tags: [],
      },
    };
    const built = await buildIconFontWoff2({
      fontFamily: "PodoIcons",
      glyphs: Object.entries(icons).map(([name, def]) => ({
        name,
        codepoint: def.codepoint,
        svg: def.svg,
      })),
    });
    const base = parseIconManifest({
      schemaVersion: "2.0.0",
      kind: "icons",
      fontFamily: "PodoIcons",
      icons,
      groups: { all: ["box", "bar"] },
      codepointLock: { box: "E900", bar: "E901" },
    });
    const manifest = {
      ...base,
      fontAsset: {
        kind: "font" as const,
        source: "embedded" as const,
        family: "PodoIcons",
        fileName: "PodoIcons.woff2",
        format: "woff2" as const,
        mimeType: "font/woff2",
        dataUrl: built.dataUrl,
      },
      fontBuild: {
        iconsHash: computeIconsHash(base),
        unitsPerEm: 1000,
        glyphCount: built.glyphCount,
      },
    };

    const outDir = await mkdtemp(join(tmpdir(), "podo-icons-inline-"));
    const result = await buildIconAssets({ manifest, svgRoot, outDir });

    // Only the always-woff2 artifact is emitted (no legacy woff).
    await expect(stat(join(outDir, "PodoIcons.woff"))).rejects.toThrow();
    const writtenWoff2 = await readFile(join(outDir, "PodoIcons.woff2"));
    // The Node build's bytes match the editor's @podo/icon-build output exactly.
    expect(Buffer.compare(writtenWoff2, Buffer.from(built.woff2))).toBe(0);
    expect(result.metadata.fontFiles).toEqual(["woff2"]);
    expect(result.metadata.woff2).toBe(true);
  });
});

async function fileHash(filePath: string): Promise<string> {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}
