import { PodoEditError } from "@podo/spec";
import { ICON_CANONICAL_VIEWBOX } from "./constants.js";
import type { ViewBox } from "./font.js";

/** Whether the current environment can flatten an SVG (needs DOMParser). */
export function canNormalizeIconSvg(): boolean {
  return typeof DOMParser !== "undefined";
}

// Icons are authored as stroke outlines, so the safelist keeps stroke geometry
// (stroke, stroke-width, round caps/joins) and the basic shape elements — not
// just filled <path>. Geometry is preserved exactly; only non-geometry markup
// (scripts, handlers, external refs) is stripped.
const SANITIZE_SAFE_TAGS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);
const SANITIZE_SAFE_ATTRS = new Set([
  "viewbox",
  "d",
  "fill",
  "fill-rule",
  "clip-rule",
  "transform",
  "xmlns",
  "width",
  "height",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "opacity",
  "fill-opacity",
  "stroke-opacity",
  // shape geometry attributes
  "x",
  "y",
  "rx",
  "ry",
  "cx",
  "cy",
  "r",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
]);

function sanitizeElement(element: Element): void {
  for (const attr of Array.from(element.attributes)) {
    if (!SANITIZE_SAFE_ATTRS.has(attr.name.toLowerCase())) {
      element.removeAttribute(attr.name);
    }
  }
  for (const child of Array.from(element.children)) {
    if (SANITIZE_SAFE_TAGS.has(child.localName.toLowerCase())) {
      sanitizeElement(child);
    } else {
      child.remove();
    }
  }
}

function stripUnsafeSvgMarkup(svg: string): string {
  return svg
    .replace(
      /<\s*(script|foreignobject|object|iframe|image|use|a|animate|set|embed)\b[\s\S]*?>/gi,
      ""
    )
    .replace(/<\/\s*(script|foreignobject|object|iframe|use|a|animate|set|embed)\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s(?:xlink:href|href|src)\s*=\s*("[^"]*"|'[^']*')/gi, "");
}

/** Drop fixed width/height from the *root* <svg> only (icons must scale to em). */
function stripRootSvgSize(svg: string): string {
  return svg.replace(/<svg\b[^>]*?>/i, (tag) =>
    tag.replace(/\s+(?:width|height)\s*=\s*"[^"]*"/gi, "")
  );
}

/**
 * Strip everything but icon geometry from an SVG: keeps only geometry elements
 * (`<svg>/<g>/<path>` plus the basic shapes) and a safelist of geometry attributes
 * (including stroke), dropping event handlers, `<script>/<foreignObject>/<image>/
 * <use>/<a>`, and external references. Stroke-authored icons keep their strokes;
 * the font build expands them at build time. Sync, so it can run at model ingress;
 * falls back to a denylist strip without a DOM.
 */
export function sanitizeIconSvg(svg: string): string {
  if (typeof DOMParser === "undefined" || typeof XMLSerializer === "undefined") {
    return stripRootSvgSize(stripUnsafeSvgMarkup(svg));
  }
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  } catch {
    return "";
  }
  const root = doc.documentElement;
  if (
    !root ||
    root.localName.toLowerCase() !== "svg" ||
    doc.getElementsByTagName("parsererror").length > 0
  ) {
    return "";
  }
  sanitizeElement(root);
  // Icons must be scalable: width/height belongs to child shapes (rect), never the
  // root, where it would conflict with the viewBox-only contract the font assumes.
  root.removeAttribute("width");
  root.removeAttribute("height");
  return new XMLSerializer().serializeToString(root);
}

const SKIP_TAGS = new Set([
  "defs",
  "clippath",
  "mask",
  "marker",
  "pattern",
  "symbol",
  "title",
  "desc",
  "metadata",
  "style",
]);

function num(value: string | null, fallback = 0): number {
  if (value == null) {
    return fallback;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function pointsToPathData(points: string, close: boolean): string {
  const coords = points
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter((value) => !Number.isNaN(value));
  if (coords.length < 4) {
    return "";
  }
  let data = `M${coords[0]} ${coords[1]}`;
  for (let index = 2; index + 1 < coords.length; index += 2) {
    data += `L${coords[index]} ${coords[index + 1]}`;
  }
  return close ? `${data}Z` : data;
}

function roundedRectPathData(
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
  ry: number
): string {
  const clampedRx = Math.min(rx, width / 2);
  const clampedRy = Math.min(ry, height / 2);
  if (clampedRx <= 0 || clampedRy <= 0) {
    return `M${x} ${y}H${x + width}V${y + height}H${x}Z`;
  }
  return (
    `M${x + clampedRx} ${y}` +
    `H${x + width - clampedRx}` +
    `A${clampedRx} ${clampedRy} 0 0 1 ${x + width} ${y + clampedRy}` +
    `V${y + height - clampedRy}` +
    `A${clampedRx} ${clampedRy} 0 0 1 ${x + width - clampedRx} ${y + height}` +
    `H${x + clampedRx}` +
    `A${clampedRx} ${clampedRy} 0 0 1 ${x} ${y + height - clampedRy}` +
    `V${y + clampedRy}` +
    `A${clampedRx} ${clampedRy} 0 0 1 ${x + clampedRx} ${y}Z`
  );
}

/** Convert a single SVG shape element to absolute path data (local coordinates). */
function shapeToPathData(element: Element, tag: string): string {
  switch (tag) {
    case "path":
      return element.getAttribute("d")?.trim() ?? "";
    case "rect": {
      const x = num(element.getAttribute("x"));
      const y = num(element.getAttribute("y"));
      const width = num(element.getAttribute("width"));
      const height = num(element.getAttribute("height"));
      if (width <= 0 || height <= 0) {
        return "";
      }
      const rxAttr = element.getAttribute("rx");
      const ryAttr = element.getAttribute("ry");
      const rx = rxAttr != null ? num(rxAttr) : ryAttr != null ? num(ryAttr) : 0;
      const ry = ryAttr != null ? num(ryAttr) : rxAttr != null ? num(rxAttr) : 0;
      return roundedRectPathData(x, y, width, height, rx, ry);
    }
    case "circle": {
      const cx = num(element.getAttribute("cx"));
      const cy = num(element.getAttribute("cy"));
      const r = num(element.getAttribute("r"));
      if (r <= 0) {
        return "";
      }
      return `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    case "ellipse": {
      const cx = num(element.getAttribute("cx"));
      const cy = num(element.getAttribute("cy"));
      const rx = num(element.getAttribute("rx"));
      const ry = num(element.getAttribute("ry"));
      if (rx <= 0 || ry <= 0) {
        return "";
      }
      return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }
    case "line": {
      const x1 = num(element.getAttribute("x1"));
      const y1 = num(element.getAttribute("y1"));
      const x2 = num(element.getAttribute("x2"));
      const y2 = num(element.getAttribute("y2"));
      return `M${x1} ${y1}L${x2} ${y2}`;
    }
    case "polygon":
      return pointsToPathData(element.getAttribute("points") ?? "", true);
    case "polyline":
      return pointsToPathData(element.getAttribute("points") ?? "", false);
    default:
      return "";
  }
}

function rootViewBox(root: Element): ViewBox {
  const attr = root.getAttribute("viewBox");
  if (attr) {
    const parts = attr
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    const [minX, minY, width, height] = parts;
    if (
      parts.length === 4 &&
      width !== undefined &&
      height !== undefined &&
      width > 0 &&
      height > 0 &&
      !parts.some((value) => Number.isNaN(value))
    ) {
      return { minX: minX ?? 0, minY: minY ?? 0, width, height };
    }
  }
  const width = num(root.getAttribute("width"), ICON_CANONICAL_VIEWBOX);
  const height = num(root.getAttribute("height"), ICON_CANONICAL_VIEWBOX);
  return {
    minX: 0,
    minY: 0,
    width: width > 0 ? width : ICON_CANONICAL_VIEWBOX,
    height: height > 0 ? height : ICON_CANONICAL_VIEWBOX,
  };
}

/**
 * Flatten arbitrary SVG markup (nested groups, transforms, shapes, arcs) into a
 * single canonical icon SVG: one `<path>` filled with `currentColor`, scaled into
 * `viewBox="0 0 1000 1000"`, ready for {@link buildIconFontWoff2}. Requires a DOM
 * (browser or jsdom); throws if the markup has no drawable geometry.
 */
export async function normalizeIconSvg(svg: string): Promise<string> {
  if (!canNormalizeIconSvg()) {
    throw new PodoEditError(
      "iconBuild.svgNoDom",
      "normalizeIconSvg requires a DOM environment (DOMParser)."
    );
  }
  const svgpath = (await import("svgpath")).default;
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new PodoEditError("iconBuild.svgParse", "The SVG could not be parsed.");
  }
  const root = doc.documentElement;
  if (!root || root.localName.toLowerCase() !== "svg") {
    throw new PodoEditError("iconBuild.svgSingle", "The icon must be a single <svg> element.");
  }

  const viewBox = rootViewBox(root);
  const collected: string[] = [];

  const walk = (element: Element, transforms: string[]): void => {
    const tag = element.localName.toLowerCase();
    if (SKIP_TAGS.has(tag)) {
      return;
    }
    const own = element.getAttribute("transform");
    const chain = own ? [...transforms, own] : transforms;
    const data = shapeToPathData(element, tag);
    if (data) {
      let path = svgpath(data);
      for (let index = chain.length - 1; index >= 0; index -= 1) {
        const transform = chain[index];
        if (transform) {
          path = path.transform(transform);
        }
      }
      const transformed = path.toString();
      if (transformed.trim()) {
        collected.push(transformed);
      }
    }
    for (const child of Array.from(element.children)) {
      walk(child, chain);
    }
  };
  walk(root, []);

  if (collected.length === 0) {
    throw new PodoEditError(
      "iconBuild.svgNoShapes",
      "The SVG has no drawable shapes (path, rect, circle, ellipse, line, polygon)."
    );
  }

  const scaleX = ICON_CANONICAL_VIEWBOX / viewBox.width;
  const scaleY = ICON_CANONICAL_VIEWBOX / viewBox.height;
  const normalized = svgpath(collected.join(" "))
    .translate(-viewBox.minX, -viewBox.minY)
    .scale(scaleX, scaleY)
    .abs()
    .unarc()
    .unshort()
    .round(4)
    .toString();

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_CANONICAL_VIEWBOX} ${ICON_CANONICAL_VIEWBOX}">` +
    `<path d="${normalized}" fill="currentColor"/></svg>`
  );
}
