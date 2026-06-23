// Fixed icon-font metrics. These match the v1 PodoIcons font so imported v1
// glyphs round-trip byte-for-byte, and they are the single source of truth for
// every build path (browser editor and Node). Changing them changes every
// generated font, so they are constants, never options.
export const ICON_FONT_UNITS_PER_EM = 1000;
export const ICON_FONT_ASCENDER = 758;
export const ICON_FONT_DESCENDER = -137;

/**
 * The canonical viewBox edge for a stored icon SVG. Every icon the editor saves
 * (v1 import or normalized upload) uses `viewBox="0 0 1000 1000"`, so the build
 * maps it 1:1 into the em with a pure Y-flip.
 */
export const ICON_CANONICAL_VIEWBOX = 1000;
