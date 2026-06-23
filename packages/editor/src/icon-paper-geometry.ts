import { ICON_CANONICAL_VIEWBOX } from "@podo/icon-build";

const VB = ICON_CANONICAL_VIEWBOX;

/** Round floating-point coordinates in SVG path data to 2 decimals. */
export function roundPathData(data: string): string {
  return data.replace(/-?\d+\.\d+/g, (match) =>
    String(Math.round(Number.parseFloat(match) * 100) / 100)
  );
}

/**
 * Combine the path data of every editor object into one canonical icon SVG:
 * a single `<path>` filled with `currentColor` in the 0..1000 viewBox. Multiple
 * subpaths are concatenated so compound shapes (holes via winding) survive.
 */
export function pathsToIconSvg(pathDataList: string[]): string {
  const data = pathDataList
    .map((entry) => roundPathData(entry))
    .join("")
    .trim();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}">` +
    `<path d="${data}" fill="currentColor"/></svg>`
  );
}
