export {
  ICON_FONT_UNITS_PER_EM,
  ICON_FONT_ASCENDER,
  ICON_FONT_DESCENDER,
  ICON_CANONICAL_VIEWBOX,
} from "./constants.js";
export {
  buildIconFontTtf,
  buildIconFontWoff2,
  extractSvgPathData,
  parseSvgViewBox,
  pathDataToGlyphPath,
  type IconFontBuildResult,
  type IconGlyphInput,
  type ViewBox,
} from "./font.js";
export { canNormalizeIconSvg, normalizeIconSvg, sanitizeIconSvg } from "./svg.js";
export { svgToFillPathData } from "./stroke.js";

// Re-export the shared validators so icon hosts depend on one source of truth.
export { computeIconsHash, validateInlineSvg } from "@podo/spec";

export const packageName = "@podo/icon-build";
