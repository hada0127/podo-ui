import svgpathFactory from "svgpath";

/**
 * Convert an icon SVG's geometry into deterministic *fill-only* path data that
 * the glyph builder ({@link pathDataToGlyphPath}) can map into the em.
 *
 * Icon fonts can only render filled outlines, but the Podo icon set is authored
 * as **stroke** SVGs (24px outline icons, `stroke-width` ~1.2, round caps/joins)
 * so designers edit centerlines, not pre-expanded fills. This module expands the
 * strokes into fills at *build time* only, leaving the stored source as strokes.
 *
 * Strategy (all pure, fixed-resolution → reproducible):
 * - `<path>` with a visible fill and *nonzero* rule → passed through unchanged
 *   (v1 fill glyphs round-trip byte-for-byte; smooth curves keep their `C`/`Q`).
 * - `<path>` with `fill-rule="evenodd"` → flattened and re-wound so the TrueType
 *   nonzero rule reproduces the even-odd result (nested holes alternate winding).
 * - `<path>` with a visible stroke → expanded to a filled outline as a union of
 *   per-segment rectangles + round caps/joins, every contour wound the same way
 *   so nonzero fills the union solidly.
 */

type Point = [number, number];
interface Subpath {
  points: Point[];
  closed: boolean;
}

// Fixed resolution constants — changing them changes every generated glyph, so
// they are constants, never options, and are shared by the browser editor build
// and the Node generator so both produce identical fonts.
const CURVE_STEPS = 18; // flattening steps per cubic/quadratic bezier
const DISC_SEGMENTS = 16; // polygon segments for a round cap / round join disc
const CORNER_ANGLE = 0.4; // rad; sharper joins get a round disc, smoother ones a cheap wedge
const DEPTH_SAMPLE_EPS = 0.05; // inward nudge (user units) for even-odd nesting tests
const COORD_DECIMALS = 2;

function round(value: number): number {
  const factor = 10 ** COORD_DECIMALS;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function cubicAt(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

function quadAt(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

/** Flatten absolute path data (arcs/short forms expanded by svgpath) into polylines. */
function flattenPath(data: string): Subpath[] {
  const subs: Subpath[] = [];
  let current: Subpath | null = null;
  let cursor: Point = [0, 0];
  let start: Point = [0, 0];
  svgpathFactory(data)
    .unshort()
    .unarc()
    .abs()
    .iterate((segment) => {
      const command = String(segment[0]);
      const n = (index: number): number => Number(segment[index]);
      switch (command) {
        case "M": {
          if (current && current.points.length) {
            subs.push(current);
          }
          cursor = [n(1), n(2)];
          start = cursor;
          current = { points: [cursor], closed: false };
          break;
        }
        case "L": {
          cursor = [n(1), n(2)];
          current?.points.push(cursor);
          break;
        }
        case "H": {
          cursor = [n(1), cursor[1]];
          current?.points.push(cursor);
          break;
        }
        case "V": {
          cursor = [cursor[0], n(1)];
          current?.points.push(cursor);
          break;
        }
        case "C": {
          const p0 = cursor;
          const p1: Point = [n(1), n(2)];
          const p2: Point = [n(3), n(4)];
          const p3: Point = [n(5), n(6)];
          for (let i = 1; i <= CURVE_STEPS; i += 1) {
            current?.points.push(cubicAt(p0, p1, p2, p3, i / CURVE_STEPS));
          }
          cursor = p3;
          break;
        }
        case "Q": {
          const p0 = cursor;
          const p1: Point = [n(1), n(2)];
          const p2: Point = [n(3), n(4)];
          for (let i = 1; i <= CURVE_STEPS; i += 1) {
            current?.points.push(quadAt(p0, p1, p2, i / CURVE_STEPS));
          }
          cursor = p2;
          break;
        }
        case "Z": {
          if (current) {
            current.closed = true;
          }
          cursor = start;
          break;
        }
        default:
          break;
      }
    });
  if (current && (current as Subpath).points.length) {
    subs.push(current);
  }
  return subs;
}

function signedArea(points: Point[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const j = (i + 1) % points.length;
    area += points[i]![0] * points[j]![1] - points[j]![0] * points[i]![1];
  }
  return area / 2;
}

function polygon(points: Point[]): string {
  let data = `M${round(points[0]![0])} ${round(points[0]![1])}`;
  for (let i = 1; i < points.length; i += 1) {
    data += `L${round(points[i]![0])} ${round(points[i]![1])}`;
  }
  return `${data}Z`;
}

/** Emit a contour forced counter-clockwise (positive winding) for nonzero union fill. */
function emitCcw(points: Point[]): string {
  if (points.length < 3) {
    return "";
  }
  return polygon(signedArea(points) < 0 ? [...points].reverse() : points);
}

/** Emit a contour with the requested winding so nonzero can reproduce even-odd holes. */
function emitOriented(points: Point[], wantCcw: boolean): string {
  if (points.length < 3) {
    return "";
  }
  const isCcw = signedArea(points) > 0;
  return polygon(isCcw === wantCcw ? points : [...points].reverse());
}

function leftNormal(a: Point, b: Point): Point {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = Math.hypot(dx, dy) || 1;
  return [-dy / length, dx / length];
}

function disc(cx: number, cy: number, radius: number): string {
  const points: Point[] = [];
  for (let i = 0; i < DISC_SEGMENTS; i += 1) {
    const angle = (2 * Math.PI * i) / DISC_SEGMENTS;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return emitCcw(points);
}

function segmentRect(a: Point, b: Point, half: number): string {
  const [nx, ny] = leftNormal(a, b);
  const ox = nx * half;
  const oy = ny * half;
  return emitCcw([
    [a[0] + ox, a[1] + oy],
    [b[0] + ox, b[1] + oy],
    [b[0] - ox, b[1] - oy],
    [a[0] - ox, a[1] - oy],
  ]);
}

function pointInPolygon(point: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]![0];
    const yi = poly[i]![1];
    const xj = poly[j]![0];
    const yj = poly[j]![1];
    if (
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * A point guaranteed just inside `poly`, near its boundary: the midpoint of its
 * longest edge nudged inward by a tiny epsilon. Staying near the boundary keeps
 * it out of concentric sibling subpaths (a centroid can fall inside a small
 * sibling), so nesting depth is counted correctly.
 */
function interiorSample(poly: Point[]): Point {
  let bestIndex = 0;
  let bestLength = -1;
  for (let i = 0; i < poly.length; i += 1) {
    const j = (i + 1) % poly.length;
    const length = Math.hypot(poly[j]![0] - poly[i]![0], poly[j]![1] - poly[i]![1]);
    if (length > bestLength) {
      bestLength = length;
      bestIndex = i;
    }
  }
  const a = poly[bestIndex]!;
  const b = poly[(bestIndex + 1) % poly.length]!;
  const mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [nx, ny] = leftNormal(a, b);
  const sign = signedArea(poly) > 0 ? 1 : -1;
  return [mid[0] + nx * DEPTH_SAMPLE_EPS * sign, mid[1] + ny * DEPTH_SAMPLE_EPS * sign];
}

/**
 * Re-wind an even-odd fill path for the nonzero rule: a subpath nested under an
 * odd number of others becomes a hole (clockwise), an even number stays solid
 * (counter-clockwise). Curves are flattened first so winding can be reversed.
 */
function fillEvenOdd(data: string): string {
  const polys = flattenPath(data)
    .map((sub) => sub.points)
    .filter((points) => points.length >= 3);
  const samples = polys.map(interiorSample);
  let out = "";
  for (let i = 0; i < polys.length; i += 1) {
    let depth = 0;
    for (let j = 0; j < polys.length; j += 1) {
      if (i !== j && pointInPolygon(samples[i]!, polys[j]!)) {
        depth += 1;
      }
    }
    out += emitOriented(polys[i]!, depth % 2 === 0);
  }
  return out;
}

/**
 * Expand a stroked path into a filled outline: every segment becomes a rectangle,
 * every open endpoint and sharp join becomes a round disc, and smooth interior
 * vertices get a cheap wedge that fills the offset gap without bloating the glyph.
 * All contours share one winding so the nonzero rule fills their union.
 */
function outlineStroke(data: string, width: number): string {
  const half = width / 2;
  let out = "";
  for (const sub of flattenPath(data)) {
    const points: Point[] = [];
    for (const point of sub.points) {
      const last = points[points.length - 1];
      if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) > 1e-6) {
        points.push(point);
      }
    }
    let pts = points;
    if (
      sub.closed &&
      pts.length > 1 &&
      Math.hypot(pts[0]![0] - pts[pts.length - 1]![0], pts[0]![1] - pts[pts.length - 1]![1]) < 1e-6
    ) {
      pts = pts.slice(0, -1);
    }
    const n = pts.length;
    if (n === 0) {
      continue;
    }
    if (n === 1) {
      out += disc(pts[0]![0], pts[0]![1], half);
      continue;
    }
    const segmentEnd = sub.closed ? n : n - 1;
    for (let i = 0; i < segmentEnd; i += 1) {
      out += segmentRect(pts[i]!, pts[(i + 1) % n]!, half);
    }
    for (let i = 0; i < n; i += 1) {
      if (!sub.closed && (i === 0 || i === n - 1)) {
        out += disc(pts[i]![0], pts[i]![1], half); // round cap
        continue;
      }
      const a = pts[(i - 1 + n) % n]!;
      const b = pts[i]!;
      const c = pts[(i + 1) % n]!;
      const nIn = leftNormal(a, b);
      const nOut = leftNormal(b, c);
      const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      const dot = (b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1]);
      const angle = Math.abs(Math.atan2(cross, dot));
      if (angle < 1e-3) {
        continue;
      }
      if (angle > CORNER_ANGLE) {
        out += disc(b[0], b[1], half); // round join at a real corner
        continue;
      }
      const side = cross < 0 ? 1 : -1; // fill the gap on the convex side
      out += emitCcw([
        [b[0] + side * nIn[0] * half, b[1] + side * nIn[1] * half],
        [b[0], b[1]],
        [b[0] + side * nOut[0] * half, b[1] + side * nOut[1] * half],
      ]);
    }
  }
  return out;
}

const ELEMENT_RE = /<(path|rect|circle|ellipse|line|polyline|polygon)\b([^>]*?)\/?>/gi;
const ATTR = (attrs: string, name: string): string | undefined =>
  new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(attrs)?.[1];

function num(attrs: string, name: string, fallback = 0): number {
  const raw = ATTR(attrs, name);
  if (raw === undefined) {
    return fallback;
  }
  const value = Number.parseFloat(raw);
  return Number.isNaN(value) ? fallback : value;
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
  for (let i = 2; i + 1 < coords.length; i += 2) {
    data += `L${coords[i]} ${coords[i + 1]}`;
  }
  return close ? `${data}Z` : data;
}

/** Absolute path data for a drawable element (shapes become arcs, expanded later). */
function shapeToPathData(tag: string, attrs: string): string {
  switch (tag) {
    case "path":
      return ATTR(attrs, "d")?.trim() ?? "";
    case "rect": {
      const x = num(attrs, "x");
      const y = num(attrs, "y");
      const w = num(attrs, "width");
      const h = num(attrs, "height");
      if (w <= 0 || h <= 0) {
        return "";
      }
      const rxA = ATTR(attrs, "rx");
      const ryA = ATTR(attrs, "ry");
      const rx = Math.min(
        rxA != null ? num(attrs, "rx") : ryA != null ? num(attrs, "ry") : 0,
        w / 2
      );
      const ry = Math.min(
        ryA != null ? num(attrs, "ry") : rxA != null ? num(attrs, "rx") : 0,
        h / 2
      );
      if (rx <= 0 || ry <= 0) {
        return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      }
      return (
        `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}` +
        `V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}` +
        `H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}` +
        `V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
      );
    }
    case "circle": {
      const cx = num(attrs, "cx");
      const cy = num(attrs, "cy");
      const r = num(attrs, "r");
      return r <= 0
        ? ""
        : `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
    }
    case "ellipse": {
      const cx = num(attrs, "cx");
      const cy = num(attrs, "cy");
      const rx = num(attrs, "rx");
      const ry = num(attrs, "ry");
      return rx <= 0 || ry <= 0
        ? ""
        : `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }
    case "line":
      return `M${num(attrs, "x1")} ${num(attrs, "y1")}L${num(attrs, "x2")} ${num(attrs, "y2")}`;
    case "polygon":
      return pointsToPathData(ATTR(attrs, "points") ?? "", true);
    case "polyline":
      return pointsToPathData(ATTR(attrs, "points") ?? "", false);
    default:
      return "";
  }
}

/**
 * Convert an icon SVG into a single fill-path string (no `viewBox` scaling — that
 * stays in {@link pathDataToGlyphPath}). Pure-fill, nonzero `<path>` data is kept
 * verbatim (v1 glyphs round-trip); strokes, even-odd fills, and shape elements are
 * expanded deterministically into arc-free fill contours.
 */
export function svgToFillPathData(svg: string): string {
  const rootFill = /<svg\b[^>]*\bfill\s*=\s*"([^"]*)"/i.exec(svg)?.[1];
  const segments: string[] = [];
  let match: RegExpExecArray | null;
  ELEMENT_RE.lastIndex = 0;
  while ((match = ELEMENT_RE.exec(svg)) !== null) {
    const tag = match[1]!.toLowerCase();
    const attrs = match[2] ?? "";
    const data = shapeToPathData(tag, attrs);
    if (!data) {
      continue;
    }
    const fill = ATTR(attrs, "fill") ?? rootFill;
    const fillVisible = (fill ?? "#000") !== "none";
    const stroke = ATTR(attrs, "stroke");
    const strokeWidth = Number.parseFloat(ATTR(attrs, "stroke-width") ?? "1");
    const strokeVisible = !!stroke && stroke !== "none" && strokeWidth > 0;
    const evenOdd = /fill-rule\s*=\s*"evenodd"/i.test(attrs);
    if (fillVisible) {
      // A plain nonzero <path> is passed through verbatim (keeps curves, byte-for-byte
      // v1 round-trip); shapes and even-odd fills are flattened to nonzero contours.
      segments.push(tag === "path" && !evenOdd ? data : fillEvenOdd(data));
    }
    if (strokeVisible) {
      segments.push(outlineStroke(data, strokeWidth));
    }
  }
  return segments.join(" ");
}
