// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import opentype from "opentype.js";
import {
  buildIconFontWoff2,
  buildIconFontTtf,
  computeIconsHash,
  extractSvgPathData,
  normalizeIconSvg,
  parseSvgViewBox,
  sanitizeIconSvg,
  validateInlineSvg,
  type IconGlyphInput,
} from "./index.js";

const triangle: IconGlyphInput = {
  name: "triangle",
  codepoint: "E901",
  svg: '<svg viewBox="0 0 1000 1000"><path d="M500 100L900 900L100 900Z" fill="currentColor"/></svg>',
};
const box: IconGlyphInput = {
  name: "box",
  codepoint: "E900",
  svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
};

function woff2Signature(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes.subarray(0, 4));
}

describe("@podo/icon-build", () => {
  it("builds a valid, deterministic woff2", async () => {
    const first = await buildIconFontWoff2({ fontFamily: "PodoIcons", glyphs: [triangle, box] });
    const second = await buildIconFontWoff2({ fontFamily: "PodoIcons", glyphs: [box, triangle] });

    expect(woff2Signature(first.woff2)).toBe("wOF2");
    expect(first.dataUrl.startsWith("data:font/woff2;base64,")).toBe(true);
    expect(first.glyphCount).toBe(3); // 2 icons + .notdef
    // Same icon set (regardless of input order) → byte-identical output.
    expect(Buffer.compare(Buffer.from(first.woff2), Buffer.from(second.woff2))).toBe(0);
  });

  it("is deterministic regardless of wall-clock time", async () => {
    // opentype.js stamps head.created/modified from the clock; the builder freezes
    // it. Different ambient clocks around each build must still produce identical bytes.
    const realGetTime = Date.prototype.getTime;
    try {
      Date.prototype.getTime = (): number => 1000;
      const a = await buildIconFontTtf({ fontFamily: "PodoIcons", glyphs: [triangle, box] });
      Date.prototype.getTime = (): number => 999_999_999_999;
      const b = await buildIconFontTtf({ fontFamily: "PodoIcons", glyphs: [triangle, box] });
      expect(Buffer.compare(Buffer.from(a), Buffer.from(b))).toBe(0);
    } finally {
      Date.prototype.getTime = realGetTime;
    }
  });

  it("round-trips glyphs and codepoints through the font", async () => {
    const ttf = await buildIconFontTtf({ fontFamily: "PodoIcons", glyphs: [triangle, box] });
    const font = opentype.parse(ttf);
    const codepoints = new Set<number>();
    for (let index = 0; index < font.glyphs.length; index += 1) {
      const glyph = font.glyphs.get(index);
      if (glyph.unicode != null) {
        codepoints.add(glyph.unicode);
      }
    }
    expect(codepoints.has(0xe900)).toBe(true);
    expect(codepoints.has(0xe901)).toBe(true);
  });

  it("flattens nested groups, transforms, and shapes into one canonical path", async () => {
    const raw =
      '<svg viewBox="0 0 24 24"><g transform="translate(2 2)">' +
      '<rect x="0" y="0" width="8" height="8" rx="2"/>' +
      '<circle cx="14" cy="14" r="4"/></g></svg>';
    const normalized = await normalizeIconSvg(raw);

    expect(normalized).toContain('viewBox="0 0 1000 1000"');
    expect(normalized).toContain("currentColor");
    expect(normalized).toMatch(/<path d="M/);
    expect((normalized.match(/<path/g) ?? []).length).toBe(1);
    // Validates against the shared inline-svg rules and builds a real font.
    expect(validateInlineSvg("shape", normalized)).toEqual([]);
    const result = await buildIconFontWoff2({
      fontFamily: "PodoIcons",
      glyphs: [{ name: "shape", codepoint: "E900", svg: normalized }],
    });
    expect(woff2Signature(result.woff2)).toBe("wOF2");
  });

  it("rejects SVG with no drawable geometry", async () => {
    await expect(
      normalizeIconSvg('<svg viewBox="0 0 24 24"><title>empty</title></svg>')
    ).rejects.toThrow();
  });

  it("flattens every supported shape into a buildable canonical path", async () => {
    const shapes = [
      '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>',
      '<svg viewBox="0 0 24 24"><line x1="2" y1="2" x2="22" y2="22"/><line x1="2" y1="22" x2="22" y2="2"/></svg>',
      '<svg viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22"/></svg>',
      '<svg viewBox="0 0 24 24"><polyline points="2,2 12,12 22,2 12,22"/></svg>',
    ];
    for (const shape of shapes) {
      const normalized = await normalizeIconSvg(shape);
      expect(normalized).toContain('viewBox="0 0 1000 1000"');
      expect((normalized.match(/<path/g) ?? []).length).toBe(1);
      expect(validateInlineSvg("shape", normalized)).toEqual([]);
      const result = await buildIconFontWoff2({
        fontFamily: "PodoIcons",
        glyphs: [{ name: "shape", codepoint: "E900", svg: normalized }],
      });
      expect(woff2Signature(result.woff2)).toBe("wOF2");
    }
  });

  it("sanitizes unsafe inline svg to geometry only", () => {
    const cleaned = sanitizeIconSvg(
      '<svg viewBox="0 0 24 24"><image href="x" onerror="alert(1)"/>' +
        '<path d="M0 0H24V24H0Z" fill="currentColor" onclick="alert(1)"/>' +
        "<script>alert(1)</script></svg>"
    );
    expect(cleaned).not.toMatch(/onerror|onclick|<image|<script/i);
    expect(cleaned).toContain("<path");
    expect(cleaned).toContain('d="M0 0H24V24H0Z"');
    // A canonical svg is preserved (geometry + currentColor survive).
    const canonical = sanitizeIconSvg(
      '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>'
    );
    expect(canonical).toContain('d="M100 100H900V900H100Z"');
    expect(canonical).toContain("currentColor");
  });

  it("parses viewBox and extracts path data", () => {
    expect(parseSvgViewBox('<svg viewBox="0 0 24 48">')).toEqual({
      minX: 0,
      minY: 0,
      width: 24,
      height: 48,
    });
    expect(parseSvgViewBox("<svg>")).toEqual({ minX: 0, minY: 0, width: 1000, height: 1000 });
    expect(extractSvgPathData('<svg><path d="M0 0Z"/><path d="M1 1Z"/></svg>')).toBe("M0 0Z M1 1Z");
  });

  it("keeps the shared content hash stable", () => {
    const manifest = {
      schemaVersion: "2.0.0" as const,
      kind: "icons" as const,
      fontFamily: "PodoIcons",
      icons: { box: { svg: box.svg, codepoint: "E900", tags: [] } },
      groups: {},
      codepointLock: { box: "E900" },
    };
    expect(computeIconsHash(manifest)).toBe(computeIconsHash(manifest));
  });
});
