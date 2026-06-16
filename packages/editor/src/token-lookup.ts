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

export function isTypographyValue(value: unknown): value is {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string | number;
  letterSpacing: string;
  paragraphSpacing?: string;
} {
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

export function typographyToCss(value: {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: string | number;
  letterSpacing: string;
  paragraphSpacing?: string;
}): CSSProperties {
  return {
    fontFamily: `${value.fontFamily}, ui-sans-serif, system-ui, sans-serif`,
    fontSize: value.fontSize,
    lineHeight: value.lineHeight,
    fontWeight: value.fontWeight,
    letterSpacing: value.letterSpacing,
  };
}

export function tokenVariationName(path: string): string {
  return path.split(".").at(-1) ?? path;
}
