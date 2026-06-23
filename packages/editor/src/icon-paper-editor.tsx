import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ICON_CANONICAL_VIEWBOX } from "@podo/icon-build";
import { pathsToIconSvg } from "./icon-paper-geometry.js";
import { iconDrawApplyButtonStyle, toolbarButtonStyle } from "./styles.js";
import { useT } from "./i18n/context.js";

const VB = ICON_CANONICAL_VIEWBOX;
const GRID = 50;
const FILL = "#1f2937";
const ACCENT = "#2563eb";
const DEFAULT_WEIGHT = 60;
const MIN_SIZE = 8;

// Keyline guide lines in 0..VB space, derived from Keyline.svg (119 box). Used as
// snap targets while the keyline background is shown: the fine 24-division grid
// plus the circle / square / portrait keyline-box edges and the center.
const KEYLINE_UNIT = VB / 119;
const keylineGridLines = (): number[] => {
  const lines: number[] = [];
  for (let k = 0; k <= 24; k += 1) lines.push((0.5 + (k * 117.756) / 24) * KEYLINE_UNIT);
  return lines;
};
const KEYLINE_GUIDE_X = [
  ...keylineGridLines(),
  ...[10.063, 14.969, 19.876, 98.88, 103.787, 108.693].map((v) => v * KEYLINE_UNIT),
  VB / 2,
];
const KEYLINE_GUIDE_Y = [
  ...keylineGridLines(),
  ...[10.063, 14.969, 103.787, 108.693].map((v) => v * KEYLINE_UNIT),
  VB / 2,
];

type Tool = "move" | "node" | "pen" | "scissors" | "rect" | "ellipse" | "line" | "polygon" | "star";
type BooleanOp = "unite" | "subtract" | "intersect" | "exclude";
type AlignKind =
  | "canvas"
  | "canvasH"
  | "canvasV"
  | "left"
  | "hcenter"
  | "right"
  | "top"
  | "vcenter"
  | "bottom";
type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

// paper's classes live in an ambient `paper` namespace; we hold the scope loosely
// because the module is dynamically imported (lazy + jsdom-safe).
/* eslint-disable @typescript-eslint/no-explicit-any */
type PaperScope = any;
type PaperItem = any;
type PaperPoint = any;
type ToolEvent = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface IconPaperEditorProps {
  initialSvg: string;
  title: string;
  onApply: (svg: string) => void;
  onClose: () => void;
}

const TOOL_META: Record<Tool, { labelKey: string; key?: string; icon: string }> = {
  move: { labelKey: "iconEditor.toolMove", key: "V", icon: "M5 3l13 6-5.5 1.7-2.2 5.6z" },
  node: {
    labelKey: "iconEditor.toolNode",
    key: "A",
    icon: "M5 9h4v4H5zM15 11h4v4h-4zM9 11h6M17 13v-2",
  },
  pen: {
    labelKey: "iconEditor.toolPen",
    key: "P",
    icon: "M4 20l3-.7L17 9.3 14.7 7 4.7 17z M15.6 5.4l1.7-1.7a1.3 1.3 0 0 1 1.9 0l.6.6a1.3 1.3 0 0 1 0 1.9l-1.7 1.7z",
  },
  scissors: {
    labelKey: "iconEditor.toolScissors",
    key: "C",
    icon: "M14.5 13.5L20 19M14.5 10.5L20 5M6 9a2 2 0 1 0 0-.01zM6 17a2 2 0 1 0 0-.01zM7.5 9.5L20 12 7.5 14.5",
  },
  rect: { labelKey: "iconEditor.toolRect", key: "R", icon: "M4 6h16v12H4z" },
  ellipse: {
    labelKey: "iconEditor.toolEllipse",
    key: "O",
    icon: "M12 6c4 0 7 2.7 7 6s-3 6-7 6-7-2.7-7-6 3-6 7-6z",
  },
  line: { labelKey: "iconEditor.toolLine", key: "L", icon: "M5 19L19 5" },
  polygon: { labelKey: "iconEditor.toolPolygon", icon: "M12 4l7 4v8l-7 4-7-4V8z" },
  star: {
    labelKey: "iconEditor.toolStar",
    icon: "M12 3l2.5 6 6.4.5-4.9 4.2 1.5 6.3L12 16.8 6 20l1.5-6.3L2.6 9.5 9 9z",
  },
};

const barStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
  background: "#f6f8fb",
  border: "1px solid #e2e7ef",
  borderRadius: 10,
  padding: "6px 8px",
};
const groupStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 4 };
const dividerStyle: CSSProperties = {
  width: 1,
  height: 22,
  background: "#dbe2ec",
  margin: "0 4px",
};
const groupLabelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#8a96a8",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginRight: 2,
};
const toolBtnStyle: CSSProperties = {
  width: 34,
  height: 30,
  display: "grid",
  placeItems: "center",
  border: "1px solid transparent",
  borderRadius: 7,
  background: "transparent",
  color: "#3a4658",
  cursor: "pointer",
  padding: 0,
};
const toolBtnActiveStyle: CSSProperties = {
  ...toolBtnStyle,
  border: `1px solid ${ACCENT}`,
  background: ACCENT,
  color: "#ffffff",
};
const chipStyle: CSSProperties = {
  height: 28,
  border: "1px solid #ccd6e3",
  borderRadius: 7,
  background: "#ffffff",
  color: "#3a4658",
  padding: "0 9px",
  fontSize: 12,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};
const chipActiveStyle: CSSProperties = {
  ...chipStyle,
  border: `1px solid ${ACCENT}`,
  background: "#eef4ff",
  color: "#1d4ed8",
  fontWeight: 600,
};
const chipDisabledStyle: CSSProperties = { ...chipStyle, opacity: 0.45, cursor: "default" };

function ToolGlyph({ d }: { d: string }) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export function IconPaperEditor({ initialSvg, title, onApply, onClose }: IconPaperEditorProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeRef = useRef<PaperScope | undefined>(undefined);
  const iconLayerRef = useRef<PaperItem | undefined>(undefined);
  const uiLayerRef = useRef<PaperItem | undefined>(undefined);
  const gridLayerRef = useRef<PaperItem | undefined>(undefined);
  const keylineLayerRef = useRef<PaperItem | undefined>(undefined);
  const penPathRef = useRef<PaperItem | undefined>(undefined);
  const drawUiRef = useRef<() => void>(() => {});
  const historyRef = useRef<{ stack: string[]; index: number }>({ stack: [], index: -1 });

  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState<Tool>("move");
  const [snap, setSnap] = useState(true);
  const [keyline, setKeyline] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_WEIGHT);
  const [selectionCount, setSelectionCount] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [layerCount, setLayerCount] = useState(0);
  const [selFill, setSelFill] = useState(false);
  const [selStroke, setSelStroke] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);

  const toolRef = useRef(tool);
  const snapRef = useRef(snap);
  const keylineRef = useRef(keyline);
  const widthRef = useRef(strokeWidth);
  const spaceRef = useRef(false);
  toolRef.current = tool;
  snapRef.current = snap;
  keylineRef.current = keyline;
  widthRef.current = strokeWidth;

  // --- helpers ----------------------------------------------------------------
  // Snap a single coordinate to the nearest guide within a screen-space threshold.
  const snapToGuides = (value: number, guides: number[]): number => {
    const scope = scopeRef.current;
    const threshold = 7 / (scope ? scope.view.zoom : 1);
    let best = value;
    let bestDist = threshold;
    for (const guide of guides) {
      const dist = Math.abs(value - guide);
      if (dist < bestDist) {
        bestDist = dist;
        best = guide;
      }
    }
    return best;
  };

  const snapPoint = (point: PaperPoint): PaperPoint => {
    const scope = scopeRef.current;
    if (!scope || !snapRef.current) {
      return point;
    }
    // When the keyline is shown, snap to its guide lines; otherwise the plain grid.
    if (keylineRef.current) {
      return new scope.Point(
        snapToGuides(point.x, KEYLINE_GUIDE_X),
        snapToGuides(point.y, KEYLINE_GUIDE_Y)
      );
    }
    return new scope.Point(Math.round(point.x / GRID) * GRID, Math.round(point.y / GRID) * GRID);
  };

  const iconItems = (): PaperItem[] => {
    const layer = iconLayerRef.current;
    return layer ? [...layer.children] : [];
  };
  const selectedItems = (): PaperItem[] => iconItems().filter((item) => item.selected);
  const selectionBounds = (items: PaperItem[]): PaperItem | undefined => {
    if (items.length === 0) {
      return undefined;
    }
    let bounds = items[0].bounds;
    for (let i = 1; i < items.length; i += 1) {
      bounds = bounds.unite(items[i].bounds);
    }
    return bounds;
  };

  const styleFilled = (path: PaperItem): PaperItem => {
    const scope = scopeRef.current;
    path.fillColor = new scope.Color(FILL);
    path.strokeColor = null;
    return path;
  };
  const styleStroked = (path: PaperItem): PaperItem => {
    const scope = scopeRef.current;
    path.fillColor = null;
    path.strokeColor = new scope.Color(FILL);
    path.strokeWidth = widthRef.current;
    path.strokeCap = "round";
    path.strokeJoin = "round";
    return path;
  };

  const handlePoints = (bounds: PaperItem): Record<HandleId, PaperPoint> => {
    const scope = scopeRef.current;
    const P = (x: number, y: number): PaperPoint => new scope.Point(x, y);
    const { left, right, top, bottom, center } = bounds;
    return {
      nw: P(left, top),
      n: P(center.x, top),
      ne: P(right, top),
      e: P(right, center.y),
      se: P(right, bottom),
      s: P(center.x, bottom),
      sw: P(left, bottom),
      w: P(left, center.y),
    };
  };
  const handleAnchor: Record<HandleId, HandleId> = {
    nw: "se",
    n: "s",
    ne: "sw",
    e: "w",
    se: "nw",
    s: "n",
    sw: "ne",
    w: "e",
  };
  const handleAxes: Record<HandleId, { x: boolean; y: boolean }> = {
    nw: { x: true, y: true },
    n: { x: false, y: true },
    ne: { x: true, y: true },
    e: { x: true, y: false },
    se: { x: true, y: true },
    s: { x: false, y: true },
    sw: { x: true, y: true },
    w: { x: true, y: false },
  };

  // Draw the selection box + resize handles (move tool) into the UI layer.
  const drawSelectionUi = (guides?: { x?: number; y?: number }): void => {
    const scope = scopeRef.current;
    const ui = uiLayerRef.current;
    if (!scope || !ui) {
      return;
    }
    ui.removeChildren();
    const zoom = scope.view.zoom;
    if (guides) {
      if (guides.x != null) {
        const line = new scope.Path.Line(
          new scope.Point(guides.x, 0),
          new scope.Point(guides.x, VB)
        );
        line.strokeColor = new scope.Color("#ef4444");
        line.strokeWidth = 1 / zoom;
        line.guide = true;
      }
      if (guides.y != null) {
        const line = new scope.Path.Line(
          new scope.Point(0, guides.y),
          new scope.Point(VB, guides.y)
        );
        line.strokeColor = new scope.Color("#ef4444");
        line.strokeWidth = 1 / zoom;
        line.guide = true;
      }
    }
    if (toolRef.current !== "move") {
      scope.view.update();
      return;
    }
    const bounds = selectionBounds(selectedItems());
    if (!bounds) {
      scope.view.update();
      return;
    }
    const box = new scope.Path.Rectangle(bounds);
    box.strokeColor = new scope.Color(ACCENT);
    box.strokeWidth = 1 / zoom;
    box.guide = true;
    const size = 9 / zoom;
    for (const point of Object.values(handlePoints(bounds))) {
      const handle = new scope.Path.Rectangle(
        new scope.Rectangle(point.x - size / 2, point.y - size / 2, size, size)
      );
      handle.fillColor = new scope.Color("#ffffff");
      handle.strokeColor = new scope.Color(ACCENT);
      handle.strokeWidth = 1.2 / zoom;
      handle.guide = true;
    }
    scope.view.update();
  };
  drawUiRef.current = () => drawSelectionUi();

  const syncUi = (): void => {
    const layer = iconLayerRef.current;
    const selected = layer ? layer.children.filter((c: PaperItem) => c.selected) : [];
    setSelectionCount(selected.length);
    setLayerCount(layer ? layer.children.length : 0);
    setSelFill(selected.some((item: PaperItem) => Boolean(item.fillColor)));
    setSelStroke(selected.some((item: PaperItem) => Boolean(item.strokeColor)));
    let nodes = 0;
    for (const item of iconItems()) {
      if (item.segments) {
        nodes += item.segments.filter((s: PaperItem) => s.selected).length;
      }
    }
    setNodeCount(nodes);
    const history = historyRef.current;
    setCanUndo(history.index > 0);
    setCanRedo(history.index < history.stack.length - 1);
    const scope = scopeRef.current;
    if (scope) {
      setZoomPct(Math.round(scope.view.zoom * (scope.view.viewSize.width / VB) * 100));
    }
    drawSelectionUi();
  };

  const pushHistory = (): void => {
    const layer = iconLayerRef.current;
    if (!layer) {
      return;
    }
    const json = layer.exportJSON({ asString: true });
    const history = historyRef.current;
    history.stack = history.stack.slice(0, history.index + 1);
    history.stack.push(json);
    history.index = history.stack.length - 1;
    syncUi();
  };

  const restoreHistory = (delta: number): void => {
    const layer = iconLayerRef.current;
    const history = historyRef.current;
    const next = history.index + delta;
    if (!layer || next < 0 || next >= history.stack.length) {
      return;
    }
    penPathRef.current = undefined;
    history.index = next;
    layer.removeChildren();
    const json = history.stack[next];
    if (json) {
      layer.importJSON(json);
      for (const child of layer.children) {
        child.selected = false;
        child.fullySelected = false;
      }
    }
    syncUi();
  };

  const flattenToSvg = (): string => {
    const scope = scopeRef.current;
    if (!scope) {
      return pathsToIconSvg([]);
    }
    const parts: string[] = [];
    for (const item of iconItems()) {
      if (typeof item.pathData !== "string" || !item.pathData) {
        continue;
      }
      const hasFill = Boolean(item.fillColor);
      const hasStroke = Boolean(item.strokeColor) && item.strokeWidth > 0;
      if (hasFill || !hasStroke) {
        parts.push(item.pathData);
      }
      if (hasStroke) {
        const outline = strokeOutlineData(scope, item, item.strokeWidth);
        if (outline) {
          parts.push(outline);
        }
      }
    }
    return pathsToIconSvg(parts);
  };

  // --- paper setup ------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== "function" || !canvas.getContext("2d")) {
      return; // no 2d context (e.g. jsdom) — render chrome only
    }
    let disposed = false;
    let scope: PaperScope | undefined;
    void (async () => {
      const paper = (await import("paper")).default as PaperScope;
      if (disposed) {
        return;
      }
      scope = new paper.PaperScope();
      scope.setup(canvas);
      scope.settings.handleSize = 8;
      scope.settings.hitTolerance = 0;
      scopeRef.current = scope;

      const size = Math.min(canvas.clientWidth || 540, 540);
      scope.view.viewSize = new scope.Size(size, size);
      scope.view.zoom = size / VB;
      scope.view.center = new scope.Point(VB / 2, VB / 2);

      // Both guide backdrops are drawn directly in paper as 1px screen-space
      // strokes (hairline-crisp at any DPI, and they track zoom/pan with the art).
      const kw = 1 / scope.view.zoom;

      // Plain dotted grid (shown when the keyline is toggled off).
      const guides = new scope.Layer();
      gridLayerRef.current = guides;
      const frame = new scope.Path.Rectangle(new scope.Rectangle(0, 0, VB, VB));
      frame.strokeColor = new scope.Color("#cbd5e1");
      frame.strokeWidth = kw;
      frame.guide = true;
      for (let g = GRID; g < VB; g += GRID) {
        for (const line of [
          new scope.Path.Line(new scope.Point(g, 0), new scope.Point(g, VB)),
          new scope.Path.Line(new scope.Point(0, g), new scope.Point(VB, g)),
        ]) {
          line.strokeColor = new scope.Color(g % (GRID * 2) === 0 ? "#e2e8f0" : "#eef2f7");
          line.strokeWidth = kw;
          line.guide = true;
        }
      }
      guides.visible = !keylineRef.current;

      // Material keyline template, reconstructed from Keyline.svg geometry as crisp
      // paper strokes (importSVG mangles its rotated rects, so we draw it directly).
      const keylineLayer = new scope.Layer();
      keylineLayerRef.current = keylineLayer;
      const s = VB / 119;
      const c = new scope.Point(VB / 2, VB / 2);
      const ink = (alpha: number): PaperPoint => new scope.Color(0, 0, 0, alpha);
      const stroke = (item: PaperItem, alpha: number): void => {
        item.strokeColor = ink(alpha);
        item.strokeWidth = kw;
        item.guide = true;
        item.locked = true;
      };
      stroke(new scope.Path.Rectangle(new scope.Rectangle(0, 0, VB, VB)), 0.14);
      const klStep = (117.756 / 24) * s;
      const klStart = 0.5 * s;
      for (let k = 0; k <= 24; k += 1) {
        const p = klStart + k * klStep;
        stroke(new scope.Path.Line(new scope.Point(p, 0), new scope.Point(p, VB)), 0.13);
        stroke(new scope.Path.Line(new scope.Point(0, p), new scope.Point(VB, p)), 0.13);
      }
      const rrx = 5.15651 * s;
      const roundedBox = (w: number, h: number): void => {
        const rect = new scope.Rectangle(c.x - w / 2, c.y - h / 2, w, h);
        stroke(new scope.Path.Rectangle(rect, rrx), 0.18);
      };
      roundedBox(79.0041 * s, 98.6301 * s); // portrait keyline
      roundedBox(98.6301 * s, 79.0041 * s); // landscape keyline
      roundedBox(88.818 * s, 88.818 * s); // square keyline
      stroke(new scope.Path.Circle(c, 49.3151 * s), 0.18); // circle keyline
      stroke(new scope.Path.Line(new scope.Point(0, 0), new scope.Point(VB, VB)), 0.12);
      stroke(new scope.Path.Line(new scope.Point(0, VB), new scope.Point(VB, 0)), 0.12);
      keylineLayer.visible = keylineRef.current;

      const iconLayer = new scope.Layer();
      iconLayer.activate();
      iconLayerRef.current = iconLayer;
      uiLayerRef.current = new scope.Layer(); // selection box / handles / guides

      if (initialSvg.trim()) {
        try {
          const imported = scope.project.importSVG(initialSvg, {
            expandShapes: true,
            insert: false,
          });
          absorbImported(scope, iconLayer, imported);
        } catch {
          // Ignore an unparseable source; start blank.
        }
      }

      setupTool(scope);
      historyRef.current = { stack: [iconLayer.exportJSON({ asString: true })], index: 0 };
      scope.view.update();
      setReady(true);
      syncUi();
    })();

    return () => {
      disposed = true;
      if (scope) {
        scope.remove();
      }
      scopeRef.current = undefined;
      iconLayerRef.current = undefined;
      uiLayerRef.current = undefined;
      penPathRef.current = undefined;
    };
  }, []);

  const finishPen = (): void => {
    const pen = penPathRef.current;
    if (pen) {
      pen.fullySelected = false;
      if (pen.segments.length < 2) {
        pen.remove();
      }
      penPathRef.current = undefined;
      pushHistory();
    }
  };
  useEffect(() => {
    finishPen();
    drawUiRef.current();
  }, [tool]);

  // Toggle the keyline template vs. the plain grid (both drawn in paper).
  useEffect(() => {
    const scope = scopeRef.current;
    if (keylineLayerRef.current) keylineLayerRef.current.visible = keyline;
    if (gridLayerRef.current) gridLayerRef.current.visible = !keyline;
    scope?.view.update();
  }, [keyline]);

  // --- interaction tool -------------------------------------------------------
  function setupTool(scope: PaperScope): void {
    const tool = new scope.Tool();
    let drag:
      | { kind: "move" }
      | { kind: "scale"; handle: HandleId; anchor: PaperPoint; lastW: number; lastH: number }
      | { kind: "segment" | "handle-in" | "handle-out"; segment: PaperItem }
      | { kind: "shape"; item: PaperItem; start: PaperPoint; stroked: boolean }
      | { kind: "pen"; segment: PaperItem }
      | { kind: "pan" }
      | { kind: "marquee"; rect: PaperItem; start: PaperPoint }
      | undefined;
    let cursor: PaperItem | undefined; // pen point indicator

    const tol = (): number => 8 / scope.view.zoom;
    const hit = (point: PaperPoint, options: object): PaperItem | undefined =>
      iconLayerRef.current?.hitTest(point, { tolerance: tol(), ...options }) ?? undefined;
    const deselectAll = (): void => {
      for (const item of iconItems()) {
        item.selected = false;
        item.fullySelected = false;
      }
    };
    const hitHandle = (point: PaperPoint): HandleId | undefined => {
      const bounds = selectionBounds(selectedItems());
      if (!bounds) {
        return undefined;
      }
      const radius = 16 / scope.view.zoom;
      for (const [id, hp] of Object.entries(handlePoints(bounds))) {
        if (point.getDistance(hp) <= radius) {
          return id as HandleId;
        }
      }
      return undefined;
    };

    tool.onMouseMove = (event: ToolEvent): void => {
      if (toolRef.current !== "pen") {
        if (cursor) {
          cursor.remove();
          cursor = undefined;
        }
        return;
      }
      const point = snapPoint(event.point);
      if (!cursor) {
        cursor = new scope.Path.Circle(point, 5 / scope.view.zoom);
        cursor.strokeColor = new scope.Color(ACCENT);
        cursor.strokeWidth = 1.5 / scope.view.zoom;
        cursor.fillColor = new scope.Color("#ffffff");
        cursor.guide = true;
        uiLayerRef.current.addChild(cursor);
      }
      cursor.position = point;
      scope.view.update();
    };

    tool.onMouseDown = (event: ToolEvent): void => {
      const mode = toolRef.current;
      if (spaceRef.current) {
        drag = { kind: "pan" };
        return;
      }
      if (mode === "scissors") {
        const stroke = hit(event.point, { stroke: true, fill: false });
        if (stroke?.location && stroke.item) {
          const piece = stroke.item.splitAt(stroke.location);
          if (piece && piece !== stroke.item) {
            piece.fillColor = stroke.item.fillColor;
            piece.strokeColor = stroke.item.strokeColor;
            piece.strokeWidth = stroke.item.strokeWidth;
            iconLayerRef.current.addChild(piece);
          }
          pushHistory();
        }
        return;
      }
      if (mode === "pen") {
        const point = snapPoint(event.point);
        let pen = penPathRef.current;
        if (pen && pen.segments.length >= 2) {
          const first = pen.firstSegment.point;
          if (point.getDistance(first) <= 14 / scope.view.zoom) {
            pen.closed = true;
            pen.fullySelected = false;
            penPathRef.current = undefined;
            pushHistory();
            return;
          }
        }
        if (!pen) {
          pen = styleStroked(new scope.Path());
          iconLayerRef.current.addChild(pen);
          penPathRef.current = pen;
        }
        const segment = pen.add(point);
        pen.fullySelected = true;
        drag = { kind: "pen", segment };
        return;
      }
      if (mode === "move") {
        // Resize handles take priority over object hits.
        const handleId = hitHandle(event.point);
        if (handleId) {
          const bounds = selectionBounds(selectedItems());
          const anchor = handlePoints(bounds)[handleAnchor[handleId]];
          drag = {
            kind: "scale",
            handle: handleId,
            anchor,
            lastW: bounds.width,
            lastH: bounds.height,
          };
          return;
        }
        const found = hit(event.point, { fill: true, stroke: true });
        if (found?.item) {
          if (!event.modifiers.shift && !found.item.selected) {
            deselectAll();
          }
          found.item.selected = true;
          // Alt+drag duplicates (Figma): clone the selection, drag the clones.
          if (event.modifiers.alt) {
            for (const item of selectedItems()) {
              const clone = item.clone();
              item.selected = false;
              clone.selected = true;
            }
          }
          drag = { kind: "move" };
        } else {
          if (!event.modifiers.shift) {
            deselectAll();
          }
          const rect = new scope.Path.Rectangle(event.point, new scope.Size(0, 0));
          rect.strokeColor = new scope.Color(ACCENT);
          rect.strokeWidth = 1 / scope.view.zoom;
          rect.dashArray = [4 / scope.view.zoom, 4 / scope.view.zoom];
          rect.guide = true;
          uiLayerRef.current.addChild(rect);
          drag = { kind: "marquee", rect, start: event.point };
        }
        syncUi();
        return;
      }
      if (mode === "node") {
        for (const item of selectedItems()) {
          item.fullySelected = true;
        }
        const handle = hit(event.point, { handles: true });
        if (handle && (handle.type === "handle-in" || handle.type === "handle-out")) {
          drag = { kind: handle.type, segment: handle.segment };
          return;
        }
        const seg = hit(event.point, { segments: true });
        if (seg?.segment) {
          if (!event.modifiers.shift) {
            for (const item of iconItems()) {
              for (const s of item.segments ?? []) {
                s.selected = false;
              }
            }
          }
          seg.segment.selected = true;
          drag = { kind: "segment", segment: seg.segment };
          syncUi();
          return;
        }
        const stroke = hit(event.point, { stroke: true });
        if (stroke?.location && stroke.item) {
          const curve = stroke.location.curve;
          const newCurve = curve?.divideAt(curve.getLocationOf(event.point) ?? stroke.location);
          if (newCurve?.segment1) {
            stroke.item.fullySelected = true;
            newCurve.segment1.selected = true;
            drag = { kind: "segment", segment: newCurve.segment1 };
          }
          pushHistory();
          return;
        }
        const fill = hit(event.point, { fill: true });
        deselectAll();
        if (fill?.item) {
          fill.item.fullySelected = true;
        }
        syncUi();
        return;
      }
      // shape tools (rect/ellipse/polygon/star fill; line strokes)
      const start = snapPoint(event.point);
      const stroked = mode === "line";
      const shape = makeShape(scope, mode, start, start);
      const item = stroked ? styleStroked(shape) : styleFilled(shape);
      iconLayerRef.current.addChild(item);
      drag = { kind: "shape", item, start, stroked };
    };

    tool.onMouseDrag = (event: ToolEvent): void => {
      if (!drag) {
        return;
      }
      if (drag.kind === "pan") {
        scope.view.center = scope.view.center.subtract(event.delta);
        drawSelectionUi();
        return;
      }
      if (drag.kind === "move") {
        const items = selectedItems();
        for (const item of items) {
          item.position = item.position.add(event.delta);
        }
        const guides = applyMoveSnap(items);
        drawSelectionUi(guides);
        return;
      }
      if (drag.kind === "scale") {
        const axes = handleAxes[drag.handle];
        const point = snapPoint(event.point);
        let fx = 1;
        let fy = 1;
        if (axes.x) {
          const targetW = Math.max(MIN_SIZE, Math.abs(point.x - drag.anchor.x));
          fx = targetW / drag.lastW;
          drag.lastW = targetW;
        }
        if (axes.y) {
          const targetH = Math.max(MIN_SIZE, Math.abs(point.y - drag.anchor.y));
          fy = targetH / drag.lastH;
          drag.lastH = targetH;
        }
        if (event.modifiers.shift && axes.x && axes.y) {
          const f = Math.max(fx, fy);
          fx = f;
          fy = f;
        }
        for (const item of selectedItems()) {
          item.scale(fx, fy, drag.anchor);
        }
        drawSelectionUi();
        return;
      }
      if (drag.kind === "segment") {
        drag.segment.point = snapPoint(event.point);
        return;
      }
      if (drag.kind === "handle-in" || drag.kind === "handle-out") {
        const relative = constrain45(
          scope,
          event.point.subtract(drag.segment.point),
          event.modifiers.shift
        );
        if (drag.kind === "handle-in") {
          drag.segment.handleIn = relative;
          if (!event.modifiers.alt) drag.segment.handleOut = relative.multiply(-1);
        } else {
          drag.segment.handleOut = relative;
          if (!event.modifiers.alt) drag.segment.handleIn = relative.multiply(-1);
        }
        return;
      }
      if (drag.kind === "pen") {
        const relative = constrain45(
          scope,
          event.point.subtract(drag.segment.point),
          event.modifiers.shift
        );
        drag.segment.handleOut = relative;
        drag.segment.handleIn = relative.multiply(-1);
        return;
      }
      if (drag.kind === "shape") {
        drag.item.remove();
        const shape = makeShape(scope, toolRef.current, drag.start, snapPoint(event.point));
        drag.item = drag.stroked ? styleStroked(shape) : styleFilled(shape);
        iconLayerRef.current.addChild(drag.item);
        return;
      }
      if (drag.kind === "marquee") {
        drag.rect.remove();
        drag.rect = new scope.Path.Rectangle(new scope.Rectangle(drag.start, event.point));
        drag.rect.strokeColor = new scope.Color(ACCENT);
        drag.rect.strokeWidth = 1 / scope.view.zoom;
        drag.rect.guide = true;
        uiLayerRef.current.addChild(drag.rect);
      }
    };

    tool.onMouseUp = (): void => {
      if (!drag) {
        return;
      }
      if (drag.kind === "shape") {
        const tooSmall = drag.item.bounds.width < 3 && drag.item.bounds.height < 3 && !drag.stroked;
        if (tooSmall) {
          drag.item.remove();
        } else {
          deselectAll();
          drag.item.selected = true;
          setTool("move");
          pushHistory();
        }
      } else if (drag.kind === "marquee") {
        const area = drag.rect.bounds;
        drag.rect.remove();
        for (const item of iconItems()) {
          if (item.bounds.intersects(area) || area.contains(item.bounds)) {
            item.selected = true;
          }
        }
        syncUi();
      } else if (
        drag.kind === "move" ||
        drag.kind === "scale" ||
        drag.kind === "segment" ||
        drag.kind.startsWith("handle") ||
        drag.kind === "pen"
      ) {
        pushHistory();
      }
      drag = undefined;
    };
  }

  // Snap a moving selection's center/edges to canvas + other objects (smart guides).
  const applyMoveSnap = (items: PaperItem[]): { x?: number; y?: number } => {
    const scope = scopeRef.current;
    const bounds = selectionBounds(items);
    if (!scope || !bounds) {
      return {};
    }
    const threshold = 7 / scope.view.zoom;
    const others = iconItems().filter((item) => !item.selected);
    const klOn = keylineRef.current;
    const xs = [
      VB / 2,
      ...(klOn ? KEYLINE_GUIDE_X : []),
      ...others.flatMap((o) => [o.bounds.center.x, o.bounds.left, o.bounds.right]),
    ];
    const ys = [
      VB / 2,
      ...(klOn ? KEYLINE_GUIDE_Y : []),
      ...others.flatMap((o) => [o.bounds.center.y, o.bounds.top, o.bounds.bottom]),
    ];
    // Snap the selection's center or either edge to the nearest guide line.
    const snapEdge = (
      edges: number[],
      candidates: number[]
    ): { line: number; delta: number } | undefined => {
      for (const edge of edges) {
        for (const candidate of candidates) {
          if (Math.abs(edge - candidate) <= threshold) {
            return { line: candidate, delta: candidate - edge };
          }
        }
      }
      return undefined;
    };
    const sx = snapEdge([bounds.center.x, bounds.left, bounds.right], xs);
    const sy = snapEdge([bounds.center.y, bounds.top, bounds.bottom], ys);
    if (sx)
      for (const item of items) item.position = item.position.add(new scope.Point(sx.delta, 0));
    if (sy)
      for (const item of items) item.position = item.position.add(new scope.Point(0, sy.delta));
    return { ...(sx ? { x: sx.line } : {}), ...(sy ? { y: sy.line } : {}) };
  };

  // --- toolbar actions --------------------------------------------------------
  const setSelectionFill = (on: boolean): void => {
    const scope = scopeRef.current;
    const items = selectedItems();
    if (!scope || items.length === 0) {
      return;
    }
    for (const item of items) {
      item.fillColor = on ? new scope.Color(FILL) : null;
    }
    pushHistory();
  };
  const setSelectionStroke = (on: boolean): void => {
    const scope = scopeRef.current;
    const items = selectedItems();
    if (!scope || items.length === 0) {
      return;
    }
    for (const item of items) {
      if (on) {
        item.strokeColor = new scope.Color(FILL);
        item.strokeWidth = widthRef.current;
        item.strokeCap = "round";
        item.strokeJoin = "round";
      } else {
        item.strokeColor = null;
      }
    }
    pushHistory();
  };
  // Swap fill ↔ stroke (면 ↔ 선) on the selection.
  const swapFillStroke = (): void => {
    const scope = scopeRef.current;
    const items = selectedItems();
    if (!scope || items.length === 0) {
      return;
    }
    for (const item of items) {
      if (item.strokeColor && !item.fillColor) {
        item.fillColor = new scope.Color(FILL);
        item.strokeColor = null;
      } else {
        item.fillColor = null;
        item.strokeColor = new scope.Color(FILL);
        item.strokeWidth = widthRef.current;
        item.strokeCap = "round";
        item.strokeJoin = "round";
      }
    }
    pushHistory();
  };
  const applyStrokeWidth = (value: number): void => {
    setStrokeWidth(value);
    widthRef.current = value;
    const scope = scopeRef.current;
    for (const item of selectedItems()) {
      if (item.strokeColor) {
        item.strokeWidth = value;
      }
    }
    scope?.view.update();
  };

  // Node operations on selected anchors.
  const eachSelectedSegment = (fn: (segment: PaperItem) => void): void => {
    let touched = false;
    for (const item of iconItems()) {
      for (const segment of item.segments ?? []) {
        if (segment.selected) {
          fn(segment);
          touched = true;
        }
      }
    }
    if (touched) {
      pushHistory();
    }
  };
  const smoothNodes = (): void => {
    const scope = scopeRef.current;
    if (!scope) return;
    eachSelectedSegment((segment) => {
      const prev = segment.previous;
      const next = segment.next;
      if (prev && next) {
        const dir = next.point.subtract(prev.point);
        const len = dir.length || 1;
        const unit = dir.divide(len);
        const amount =
          Math.min(prev.point.getDistance(segment.point), next.point.getDistance(segment.point)) *
          0.4;
        segment.handleIn = unit.multiply(-amount);
        segment.handleOut = unit.multiply(amount);
      }
    });
  };
  const cornerNodes = (): void => {
    const scope = scopeRef.current;
    if (!scope) return;
    eachSelectedSegment((segment) => {
      segment.handleIn = new scope.Point(0, 0);
      segment.handleOut = new scope.Point(0, 0);
    });
  };

  const booleanOp = (op: BooleanOp): void => {
    const scope = scopeRef.current;
    const layer = iconLayerRef.current;
    const items = selectedItems();
    if (!scope || !layer || items.length < 2) {
      return;
    }
    let result = items[0];
    for (let i = 1; i < items.length; i += 1) {
      result = result[op](items[i]);
    }
    for (const item of items) {
      item.remove();
    }
    result.fillColor = new scope.Color(FILL);
    result.strokeColor = null;
    layer.addChild(result);
    for (const item of iconItems()) {
      item.selected = false;
    }
    result.selected = true;
    pushHistory();
  };

  const transformSelection = (kind: "flipH" | "flipV" | "rotate"): void => {
    const items = selectedItems();
    if (items.length === 0) {
      return;
    }
    for (const item of items) {
      if (kind === "flipH") item.scale(-1, 1);
      else if (kind === "flipV") item.scale(1, -1);
      else item.rotate(90);
    }
    pushHistory();
  };

  const alignSelection = (kind: AlignKind): void => {
    const scope = scopeRef.current;
    const items = selectedItems().length ? selectedItems() : iconItems();
    const bounds = selectionBounds(items);
    if (!scope || !bounds) {
      return;
    }
    const move = (item: PaperItem, dx: number, dy: number): void => {
      item.position = item.position.add(new scope.Point(dx, dy));
    };
    if (kind === "canvas" || kind === "canvasH" || kind === "canvasV") {
      const dx = kind === "canvasV" ? 0 : VB / 2 - bounds.center.x;
      const dy = kind === "canvasH" ? 0 : VB / 2 - bounds.center.y;
      for (const item of items) move(item, dx, dy);
    } else {
      for (const item of items) {
        const b = item.bounds;
        if (kind === "left") move(item, bounds.left - b.left, 0);
        else if (kind === "hcenter") move(item, bounds.center.x - b.center.x, 0);
        else if (kind === "right") move(item, bounds.right - b.right, 0);
        else if (kind === "top") move(item, 0, bounds.top - b.top);
        else if (kind === "vcenter") move(item, 0, bounds.center.y - b.center.y);
        else move(item, 0, bounds.bottom - b.bottom);
      }
    }
    pushHistory();
  };

  const deleteSelection = (): void => {
    if (toolRef.current === "node") {
      let changed = false;
      for (const item of iconItems()) {
        if (!item.segments) continue;
        for (const seg of item.segments.filter((s: PaperItem) => s.selected)) {
          seg.remove();
          changed = true;
        }
        if (item.segments.length < 2) {
          item.remove();
        }
      }
      if (changed) {
        pushHistory();
        return;
      }
    }
    const items = selectedItems();
    if (items.length === 0) {
      return;
    }
    for (const item of items) {
      item.remove();
    }
    pushHistory();
  };

  const orderSelection = (dir: "front" | "back"): void => {
    for (const item of selectedItems()) {
      if (dir === "front") item.bringToFront();
      else item.sendToBack();
    }
    pushHistory();
  };

  const zoomFit = (): void => {
    const scope = scopeRef.current;
    if (!scope) return;
    scope.view.zoom = scope.view.viewSize.width / VB;
    scope.view.center = new scope.Point(VB / 2, VB / 2);
    syncUi();
  };

  // --- keyboard + wheel -------------------------------------------------------
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (event.key === " ") {
        spaceRef.current = true;
        return;
      }
      if (event.key === "Escape" || event.key === "Enter") {
        finishPen();
        for (const item of iconItems()) {
          item.selected = false;
          item.fullySelected = false;
        }
        syncUi();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        restoreHistory(event.shiftKey ? 1 : -1);
        return;
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        deleteSelection();
        return;
      }
      const map: Record<string, Tool> = {
        v: "move",
        a: "node",
        p: "pen",
        c: "scissors",
        r: "rect",
        o: "ellipse",
        l: "line",
      };
      const next = map[event.key.toLowerCase()];
      if (next) {
        setTool(next);
      }
    };
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.key === " ") {
        spaceRef.current = false;
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const onWheel = (event: React.WheelEvent): void => {
    const scope = scopeRef.current;
    if (!scope) {
      return;
    }
    event.preventDefault();
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    scope.view.zoom = Math.max(0.1, Math.min(8, scope.view.zoom * factor));
    syncUi();
  };

  const toolOrder: Tool[] = ["move", "node", "pen", "scissors"];
  const shapeOrder: Tool[] = ["rect", "ellipse", "line", "polygon", "star"];
  const hasSel = selectionCount > 0;
  const hasNodes = nodeCount > 0;

  const renderTool = (item: Tool) => {
    const label = t(TOOL_META[item].labelKey);
    return (
      <button
        key={item}
        type="button"
        style={tool === item ? toolBtnActiveStyle : toolBtnStyle}
        onClick={() => setTool(item)}
        title={`${label}${TOOL_META[item].key ? ` (${TOOL_META[item].key})` : ""}`}
        aria-label={label}
        aria-pressed={tool === item}
      >
        <ToolGlyph d={TOOL_META[item].icon} />
      </button>
    );
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {/* Row 1 — tools + object properties */}
      <div style={barStyle}>
        <div style={groupStyle}>{toolOrder.map(renderTool)}</div>
        <div style={dividerStyle} />
        <div style={groupStyle}>{shapeOrder.map(renderTool)}</div>
        <div style={dividerStyle} />
        <span style={groupLabelStyle}>{t("iconEditor.fillStrokeGroup")}</span>
        <button
          type="button"
          style={!hasSel ? chipDisabledStyle : selFill ? chipActiveStyle : chipStyle}
          disabled={!hasSel}
          onClick={() => setSelectionFill(!selFill)}
          title={t("iconEditor.fillToggleTitle")}
        >
          <span style={swatch(selFill)} /> {t("iconEditor.fill")}
        </button>
        <button
          type="button"
          style={!hasSel ? chipDisabledStyle : selStroke ? chipActiveStyle : chipStyle}
          disabled={!hasSel}
          onClick={() => setSelectionStroke(!selStroke)}
          title={t("iconEditor.strokeToggleTitle")}
        >
          <span style={swatch(selStroke)} /> {t("iconEditor.stroke")}
        </button>
        <button
          type="button"
          style={hasSel ? chipStyle : chipDisabledStyle}
          disabled={!hasSel}
          onClick={swapFillStroke}
          title={t("iconEditor.swapFillStrokeTitle")}
        >
          {t("iconEditor.swapFillStroke")}
        </button>
        <label
          style={{ ...chipStyle, cursor: "default", gap: 8 }}
          title={t("iconEditor.weightTitle")}
        >
          {t("iconEditor.weight")}
          <input
            type="range"
            min={6}
            max={200}
            step={2}
            value={strokeWidth}
            onChange={(event) => applyStrokeWidth(Number(event.target.value))}
            style={{ width: 96, accentColor: ACCENT }}
          />
          <span style={{ fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>
            {strokeWidth}
          </span>
        </label>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          style={keyline ? chipActiveStyle : chipStyle}
          onClick={() => setKeyline((value) => !value)}
          title={t("iconEditor.keylineTitle")}
        >
          {t("iconEditor.keyline")}
        </button>
        <button
          type="button"
          style={snap ? chipActiveStyle : chipStyle}
          onClick={() => setSnap((value) => !value)}
          title={t("iconEditor.snapTitle")}
        >
          {t("iconEditor.snap")}
        </button>
        <button
          type="button"
          style={chipStyle}
          onClick={zoomFit}
          title={t("iconEditor.zoomFitTitle")}
        >
          {zoomPct}%
        </button>
        <button
          type="button"
          style={canUndo ? chipStyle : chipDisabledStyle}
          disabled={!canUndo}
          onClick={() => restoreHistory(-1)}
          title={t("iconEditor.undoTitle")}
        >
          ↶
        </button>
        <button
          type="button"
          style={canRedo ? chipStyle : chipDisabledStyle}
          disabled={!canRedo}
          onClick={() => restoreHistory(1)}
          title={t("iconEditor.redoTitle")}
        >
          ↷
        </button>
      </div>

      {/* Row 2 — context: node edit (in node tool) or object ops */}
      {tool === "node" ? (
        <div style={barStyle}>
          <span style={groupLabelStyle}>{t("iconEditor.nodeGroup")}</span>
          <button
            type="button"
            style={hasNodes ? chipStyle : chipDisabledStyle}
            disabled={!hasNodes}
            onClick={smoothNodes}
          >
            {t("iconEditor.smoothNodes")}
          </button>
          <button
            type="button"
            style={hasNodes ? chipStyle : chipDisabledStyle}
            disabled={!hasNodes}
            onClick={cornerNodes}
          >
            {t("iconEditor.cornerNodes")}
          </button>
          <button
            type="button"
            style={hasNodes ? chipStyle : chipDisabledStyle}
            disabled={!hasNodes}
            onClick={deleteSelection}
          >
            {t("iconEditor.deleteAnchor")}
          </button>
          <span style={{ fontSize: 11, color: "#8a96a8" }}>
            {t("iconEditor.nodeHint", { count: nodeCount })}
          </span>
        </div>
      ) : (
        <div style={barStyle}>
          <span style={groupLabelStyle}>{t("iconEditor.booleanGroup")}</span>
          {(
            [
              ["unite", "iconEditor.booleanUnite"],
              ["subtract", "iconEditor.booleanSubtract"],
              ["intersect", "iconEditor.booleanIntersect"],
              ["exclude", "iconEditor.booleanExclude"],
            ] as [BooleanOp, string][]
          ).map(([op, labelKey]) => (
            <button
              key={op}
              type="button"
              style={selectionCount < 2 ? chipDisabledStyle : chipStyle}
              disabled={selectionCount < 2}
              onClick={() => booleanOp(op)}
            >
              {t(labelKey)}
            </button>
          ))}
          <div style={dividerStyle} />
          <span style={groupLabelStyle}>{t("iconEditor.transformGroup")}</span>
          <button
            type="button"
            style={hasSel ? chipStyle : chipDisabledStyle}
            disabled={!hasSel}
            onClick={() => transformSelection("flipH")}
          >
            {t("iconEditor.flipH")}
          </button>
          <button
            type="button"
            style={hasSel ? chipStyle : chipDisabledStyle}
            disabled={!hasSel}
            onClick={() => transformSelection("flipV")}
          >
            {t("iconEditor.flipV")}
          </button>
          <button
            type="button"
            style={hasSel ? chipStyle : chipDisabledStyle}
            disabled={!hasSel}
            onClick={() => transformSelection("rotate")}
          >
            {t("iconEditor.rotate90")}
          </button>
          <button
            type="button"
            style={hasSel ? chipStyle : chipDisabledStyle}
            disabled={!hasSel}
            onClick={() => orderSelection("front")}
          >
            {t("iconEditor.bringForward")}
          </button>
          <button
            type="button"
            style={hasSel ? chipStyle : chipDisabledStyle}
            disabled={!hasSel}
            onClick={() => orderSelection("back")}
          >
            {t("iconEditor.sendBackward")}
          </button>
          <div style={dividerStyle} />
          <span style={groupLabelStyle}>{t("iconEditor.alignGroup")}</span>
          <button
            type="button"
            style={chipActiveStyle}
            onClick={() => alignSelection("canvas")}
            title={t("iconEditor.alignCanvasTitle")}
          >
            {t("iconEditor.alignCanvas")}
          </button>
          <button type="button" style={chipStyle} onClick={() => alignSelection("canvasH")}>
            {t("iconEditor.alignCanvasH")}
          </button>
          <button type="button" style={chipStyle} onClick={() => alignSelection("canvasV")}>
            {t("iconEditor.alignCanvasV")}
          </button>
          {(
            [
              ["left", "iconEditor.alignLeft"],
              ["hcenter", "iconEditor.alignHCenter"],
              ["right", "iconEditor.alignRight"],
              ["top", "iconEditor.alignTop"],
              ["vcenter", "iconEditor.alignVCenter"],
              ["bottom", "iconEditor.alignBottom"],
            ] as [AlignKind, string][]
          ).map(([kind, labelKey]) => (
            <button
              key={kind}
              type="button"
              style={selectionCount < 2 ? chipDisabledStyle : chipStyle}
              disabled={selectionCount < 2}
              onClick={() => alignSelection(kind)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 520,
          aspectRatio: "1 / 1",
          justifySelf: "center",
          border: "1px solid #e2e7ef",
          borderRadius: 10,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "relative",
            display: "block",
            width: "100%",
            height: "100%",
            touchAction: "none",
            background: "transparent",
            cursor: tool === "move" ? "default" : "crosshair",
          }}
          onWheel={onWheel}
          aria-label={t("iconEditor.canvasAriaLabel")}
        />
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {t("iconEditor.statusBar", {
            title,
            layerCount,
            selectionCount,
            readyHint: ready ? "" : t("iconEditor.statusPreparing"),
          })}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" style={toolbarButtonStyle} onClick={onClose}>
          {t("iconEditor.cancel")}
        </button>
        <button
          type="button"
          style={iconDrawApplyButtonStyle}
          disabled={layerCount === 0}
          onClick={() => onApply(flattenToSvg())}
        >
          {t("iconEditor.applyToIcon")}
        </button>
      </div>
    </div>
  );
}

/** Snap a handle vector to the nearest 45° while holding Shift. */
function constrain45(scope: PaperScope, vector: PaperPoint, shift: boolean): PaperPoint {
  if (!shift) {
    return vector;
  }
  const length = vector.length;
  if (length < 0.001) {
    return vector;
  }
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(vector.y, vector.x) / step) * step;
  return new scope.Point(Math.cos(angle) * length, Math.sin(angle) * length);
}

function swatch(on: boolean): CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: 3,
    border: "1px solid #94a3b8",
    background: on ? FILL : "transparent",
    display: "inline-block",
  };
}

// --- pure paper helpers -------------------------------------------------------

function makeShape(scope: PaperScope, tool: Tool, start: PaperPoint, end: PaperPoint): PaperItem {
  if (tool === "line") {
    const path = new scope.Path();
    path.add(start);
    path.add(end);
    return path;
  }
  const rect = new scope.Rectangle(start, end);
  if (tool === "rect") {
    return new scope.Path.Rectangle(rect);
  }
  if (tool === "ellipse") {
    return new scope.Path.Ellipse(rect);
  }
  const center = rect.center;
  const radius = Math.max(rect.width, rect.height) / 2 || 1;
  if (tool === "star") {
    return new scope.Path.Star(center, 5, radius / 2, radius);
  }
  return new scope.Path.RegularPolygon(center, 6, radius);
}

/** Expand a stroked path into a filled outline (round caps/joins) for the font. */
function strokeOutlineData(scope: PaperScope, path: PaperItem, width: number): string {
  const radius = Math.max(0.5, width / 2);
  const work = path.clone({ insert: false });
  work.flatten(2);
  const points: PaperPoint[] = work.segments.map((segment: PaperItem) => segment.point);
  const closed = Boolean(work.closed);
  if (work.remove) {
    work.remove();
  }
  if (points.length === 0) {
    return "";
  }
  const pieces: PaperItem[] = [];
  const segmentCount = closed ? points.length : points.length - 1;
  for (const point of points) {
    pieces.push(new scope.Path.Circle(point, radius));
  }
  for (let i = 0; i < segmentCount; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const dir = b.subtract(a);
    if (dir.length < 0.001) {
      continue;
    }
    const normal = new scope.Point(-dir.y, dir.x).normalize(radius);
    const rect = new scope.Path([
      a.add(normal),
      b.add(normal),
      b.subtract(normal),
      a.subtract(normal),
    ]);
    rect.closed = true;
    pieces.push(rect);
  }
  let result: PaperItem | undefined;
  for (const piece of pieces) {
    if (!result) {
      result = piece;
      continue;
    }
    const united = result.unite(piece);
    result.remove();
    piece.remove();
    result = united;
  }
  const data = result ? result.pathData : "";
  if (result?.remove) {
    result.remove();
  }
  return data;
}

function absorbImported(scope: PaperScope, layer: PaperItem, imported: PaperItem): void {
  const collect: PaperItem[] = [];
  const walk = (item: PaperItem): void => {
    if (!item) {
      return;
    }
    if (item.className === "Path" || item.className === "CompoundPath") {
      collect.push(item);
    } else if (item.children) {
      for (const child of [...item.children]) {
        walk(child);
      }
    }
  };
  walk(imported);
  for (const item of collect) {
    item.fillColor = new scope.Color(FILL);
    item.strokeColor = null;
    item.selected = false;
    layer.addChild(item);
  }
  if (imported.remove) {
    imported.remove();
  }
}
