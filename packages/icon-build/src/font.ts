import svgpathFactory from "svgpath";
import type { Glyph, Path } from "opentype.js";
import { ICON_FONT_ASCENDER, ICON_FONT_DESCENDER, ICON_FONT_UNITS_PER_EM } from "./constants.js";
import { svgToFillPathData } from "./stroke.js";

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface IconGlyphInput {
  name: string;
  /** Uppercase hexadecimal codepoint, e.g. "E900". */
  codepoint: string;
  /** Stored inline SVG markup (canonical `viewBox="0 0 1000 1000"`, y-down). */
  svg: string;
}

export interface IconFontBuildResult {
  /** Raw woff2 bytes. */
  woff2: Uint8Array;
  /** `data:font/woff2;base64,...` for embedding in JSON or a @font-face src. */
  dataUrl: string;
  glyphCount: number;
  unitsPerEm: number;
}

const DEFAULT_VIEW_BOX: ViewBox = {
  minX: 0,
  minY: 0,
  width: ICON_FONT_UNITS_PER_EM,
  height: ICON_FONT_UNITS_PER_EM,
};

/** Read the `viewBox` of an SVG string, falling back to the canonical em box. */
export function parseSvgViewBox(svg: string): ViewBox {
  const match = svg.match(/\bviewBox\s*=\s*"([^"]+)"/i);
  if (!match || !match[1]) {
    return { ...DEFAULT_VIEW_BOX };
  }
  const parts = match[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const [minX, minY, width, height] = parts;
  if (
    parts.length !== 4 ||
    [minX, minY, width, height].some((value) => value === undefined || Number.isNaN(value)) ||
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0
  ) {
    return { ...DEFAULT_VIEW_BOX };
  }
  return { minX: minX ?? 0, minY: minY ?? 0, width, height };
}

/** Concatenate every `<path d="...">` in an SVG into one path-data string. */
export function extractSvgPathData(svg: string): string {
  const segments: string[] = [];
  const re = /<path\b[^>]*\bd\s*=\s*"([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    const data = match[1]?.trim();
    if (data) {
      segments.push(data);
    }
  }
  return segments.join(" ");
}

const NUMBER_RE = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function readNumbers(input: string): number[] {
  const matches = input.match(NUMBER_RE);
  return matches ? matches.map(Number) : [];
}

/**
 * Convert SVG path data into an opentype glyph path, mapping the viewBox into
 * the em with a pure Y-flip and integer-rounded coordinates. The data is first
 * normalized with svgpath (relative → absolute, arcs → cubics, shorthands
 * expanded) so editor-drawn and uploaded paths parse the same as generated ones.
 * No dependency on opentype's own `fromSVG` (whose default transform is opaque
 * and version-dependent), so output is deterministic.
 */
export function pathDataToGlyphPath(rawPathData: string, viewBox: ViewBox, path: Path): Path {
  const pathData = svgpathFactory(rawPathData).unshort().unarc().abs().toString();
  const scaleX = ICON_FONT_UNITS_PER_EM / viewBox.width;
  const scaleY = ICON_FONT_UNITS_PER_EM / viewBox.height;
  const fx = (x: number): number => Math.round((x - viewBox.minX) * scaleX);
  const fy = (y: number): number => Math.round((viewBox.minY + viewBox.height - y) * scaleY);

  const commandRe = /([MLHVCQZ])([^MLHVCQZ]*)/gi;
  let cursorX = 0;
  let cursorY = 0;
  let startX = 0;
  let startY = 0;
  let match: RegExpExecArray | null;
  while ((match = commandRe.exec(pathData)) !== null) {
    const command = match[1]?.toUpperCase();
    const args = readNumbers(match[2] ?? "");
    switch (command) {
      case "M": {
        cursorX = args[0] ?? cursorX;
        cursorY = args[1] ?? cursorY;
        startX = cursorX;
        startY = cursorY;
        path.moveTo(fx(cursorX), fy(cursorY));
        for (let index = 2; index + 1 < args.length; index += 2) {
          cursorX = args[index] ?? cursorX;
          cursorY = args[index + 1] ?? cursorY;
          path.lineTo(fx(cursorX), fy(cursorY));
        }
        break;
      }
      case "L": {
        for (let index = 0; index + 1 < args.length; index += 2) {
          cursorX = args[index] ?? cursorX;
          cursorY = args[index + 1] ?? cursorY;
          path.lineTo(fx(cursorX), fy(cursorY));
        }
        break;
      }
      case "H": {
        for (const value of args) {
          cursorX = value;
          path.lineTo(fx(cursorX), fy(cursorY));
        }
        break;
      }
      case "V": {
        for (const value of args) {
          cursorY = value;
          path.lineTo(fx(cursorX), fy(cursorY));
        }
        break;
      }
      case "C": {
        for (let index = 0; index + 5 < args.length; index += 6) {
          path.curveTo(
            fx(args[index] ?? cursorX),
            fy(args[index + 1] ?? cursorY),
            fx(args[index + 2] ?? cursorX),
            fy(args[index + 3] ?? cursorY),
            fx(args[index + 4] ?? cursorX),
            fy(args[index + 5] ?? cursorY)
          );
          cursorX = args[index + 4] ?? cursorX;
          cursorY = args[index + 5] ?? cursorY;
        }
        break;
      }
      case "Q": {
        for (let index = 0; index + 3 < args.length; index += 4) {
          path.quadTo(
            fx(args[index] ?? cursorX),
            fy(args[index + 1] ?? cursorY),
            fx(args[index + 2] ?? cursorX),
            fy(args[index + 3] ?? cursorY)
          );
          cursorX = args[index + 2] ?? cursorX;
          cursorY = args[index + 3] ?? cursorY;
        }
        break;
      }
      case "Z": {
        path.close();
        cursorX = startX;
        cursorY = startY;
        break;
      }
      default:
        break;
    }
  }
  return path;
}

function codepointToNumber(codepoint: string): number {
  return Number.parseInt(codepoint, 16);
}

/**
 * Run `serialize` with a frozen clock. opentype.js stamps the `head` table's
 * `created`/`modified` fields from `new Date().getTime()` on every serialize, so
 * without this the same icon set yields different bytes each second — breaking
 * the reproducible-build gate. Synchronous and restored in `finally`.
 */
function withFrozenClock<T>(serialize: () => T): T {
  const realGetTime = Date.prototype.getTime;
  Date.prototype.getTime = function frozenGetTime(): number {
    return 0;
  };
  try {
    return serialize();
  } finally {
    Date.prototype.getTime = realGetTime;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

/**
 * Build a deterministic TrueType font from inline icon SVGs. Glyphs are ordered
 * by codepoint (then name), `.notdef` is index 0, coordinates are integer
 * rounded, and opentype.js 2.0.0 embeds no timestamps — so the same icon set
 * always yields identical bytes.
 */
export async function buildIconFontTtf(input: {
  fontFamily: string;
  glyphs: IconGlyphInput[];
}): Promise<ArrayBuffer> {
  const opentype = (await import("opentype.js")).default;
  const ordered = [...input.glyphs].sort((a, b) => {
    const delta = codepointToNumber(a.codepoint) - codepointToNumber(b.codepoint);
    return delta !== 0 ? delta : a.name.localeCompare(b.name);
  });

  const glyphs: Glyph[] = [
    new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: ICON_FONT_UNITS_PER_EM,
      path: new opentype.Path(),
    }),
  ];

  for (const icon of ordered) {
    const viewBox = parseSvgViewBox(icon.svg);
    // Expand strokes to fills (and even-odd holes to nonzero) so stroke-authored
    // icons render in the font; pure nonzero fill paths pass through unchanged.
    const pathData = svgToFillPathData(icon.svg);
    const glyphPath = pathDataToGlyphPath(pathData, viewBox, new opentype.Path());
    glyphs.push(
      new opentype.Glyph({
        name: icon.name,
        unicode: codepointToNumber(icon.codepoint),
        advanceWidth: ICON_FONT_UNITS_PER_EM,
        path: glyphPath,
      })
    );
  }

  const font = new opentype.Font({
    familyName: input.fontFamily,
    styleName: "Regular",
    unitsPerEm: ICON_FONT_UNITS_PER_EM,
    ascender: ICON_FONT_ASCENDER,
    descender: ICON_FONT_DESCENDER,
    glyphs,
  });
  return withFrozenClock(() => font.toArrayBuffer());
}

/** Build the deterministic woff2 (raw bytes + base64 data URL) for an icon set. */
export async function buildIconFontWoff2(input: {
  fontFamily: string;
  glyphs: IconGlyphInput[];
}): Promise<IconFontBuildResult> {
  const ttf = await buildIconFontTtf(input);
  const { compress } = await import("woff2-encoder");
  const woff2 = await compress(new Uint8Array(ttf));
  return {
    woff2,
    dataUrl: `data:font/woff2;base64,${bytesToBase64(woff2)}`,
    glyphCount: input.glyphs.length + 1,
    unitsPerEm: ICON_FONT_UNITS_PER_EM,
  };
}
