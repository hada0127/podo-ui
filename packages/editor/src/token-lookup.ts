import type { CSSProperties } from "react";
import type { DesignToken } from "@podo/spec";

export type TokenLookup = Map<string, DesignToken>;

export function cssToken(lookup: TokenLookup, path: string, fallback: string): string {
  const value = resolveTokenPath(lookup, path);
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return fallback;
}

export function resolveTokenPath(
  lookup: TokenLookup,
  path: string,
  seen = new Set<string>()
): unknown {
  if (seen.has(path)) {
    return undefined;
  }
  seen.add(path);
  const token = lookup.get(path);
  return token ? resolveTokenValue(lookup, token.$value, seen) : undefined;
}

export function resolveTokenValue(
  lookup: TokenLookup,
  value: unknown,
  seen = new Set<string>()
): unknown {
  if (typeof value === "string") {
    const match = value.match(/^\{([^}]+)\}$/);
    if (match?.[1]) {
      return resolveTokenPath(lookup, match[1], seen);
    }
  }
  return value;
}

export function isCssColorValue(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (/^#(?:[0-9a-fA-F]{3,8})$/.test(value) || /^rgba?\(/.test(value) || value === "transparent")
  );
}

export function isHexColorInputValue(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

/** A typography size: a single unit string or a responsive `{ pc, tablet?, mobile? }`. */
export type ResponsiveSize = string | { pc: string; tablet?: string; mobile?: string };

export interface TypographyValue {
  fontFamily: string;
  fontSize: ResponsiveSize;
  lineHeight: string;
  fontWeight: string | number;
  letterSpacing: string;
  paragraphSpacing?: string;
}

export function isTypographyValue(value: unknown): value is TypographyValue {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    value !== null &&
    "fontFamily" in value &&
    "fontSize" in value &&
    "lineHeight" in value &&
    "fontWeight" in value &&
    "letterSpacing" in value
  );
}

/** The desktop (`pc`) value of a size, or the value itself when it is scalar. */
export function responsiveSizePc(size: ResponsiveSize): string {
  return typeof size === "object" && size !== null ? (size.pc ?? "") : String(size ?? "");
}

export function typographyToCss(value: TypographyValue): CSSProperties {
  return {
    fontFamily: `${value.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
    fontSize: responsiveSizePc(value.fontSize),
    lineHeight: value.lineHeight,
    fontWeight: value.fontWeight,
    letterSpacing: value.letterSpacing,
  };
}

export function tokenVariationName(path: string): string {
  return path.split(".").at(-1) ?? path;
}

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));
const clampAlpha = (value: number): number => Math.max(0, Math.min(1, value));

/**
 * Parse a hex (#rgb / #rrggbb / #rrggbbaa) or rgb()/rgba() string into RGBA
 * channels. Returns undefined for aliases or unparseable values so callers can
 * decide whether to seed an editor from a resolved color instead.
 */
export function parseColor(value: unknown): RgbaColor | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const text = value.trim();
  const hex = /^#([0-9a-fA-F]{3,8})$/.exec(text);
  if (hex?.[1]) {
    let digits = hex[1];
    if (digits.length === 3) {
      digits = digits
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (digits.length !== 6 && digits.length !== 8) {
      return undefined;
    }
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? clampAlpha(parseInt(digits.slice(6, 8), 16) / 255) : 1,
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
    text
  );
  if (rgb) {
    return {
      r: clampChannel(Number(rgb[1])),
      g: clampChannel(Number(rgb[2])),
      b: clampChannel(Number(rgb[3])),
      a: rgb[4] !== undefined ? clampAlpha(Number(rgb[4])) : 1,
    };
  }
  return undefined;
}

/** The opaque `#rrggbb` form of a color, for a native `<input type="color">`. */
export function colorToHex(color: RgbaColor): string {
  const channel = (value: number): string => clampChannel(value).toString(16).padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

export interface HsvColor {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
}

/** Convert RGB (0..255) to HSV for an inline color picker. */
export function rgbToHsv(color: { r: number; g: number; b: number }): HsvColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

/** Convert HSV back to RGB (0..255). */
export function hsvToRgb(color: HsvColor): { r: number; g: number; b: number } {
  const h = ((color.h % 360) + 360) % 360;
  const c = color.v * color.s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = color.v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Serialize RGBA back to a token value: an opaque color stays `#rrggbb`; a
 * translucent color becomes `rgba(r, g, b, a)` (alpha trimmed to 2 decimals),
 * matching the existing token style.
 */
export function formatColorValue(color: RgbaColor): string {
  const alpha = clampAlpha(color.a);
  if (alpha >= 1) {
    return colorToHex(color);
  }
  const trimmed = Number(alpha.toFixed(2));
  return `rgba(${clampChannel(color.r)}, ${clampChannel(color.g)}, ${clampChannel(color.b)}, ${trimmed})`;
}
