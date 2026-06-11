import { createHash } from "node:crypto";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
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
});

async function fileHash(filePath: string): Promise<string> {
  return createHash("sha256")
    .update(await readFile(filePath))
    .digest("hex");
}
