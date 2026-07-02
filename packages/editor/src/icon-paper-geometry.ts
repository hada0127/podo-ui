/** The icon drawing canvas works in the icon's own 24px viewBox (stroke-first). */
export const ICON_EDIT_VIEWBOX = 24;

/** Round floating-point coordinates in SVG path data to 2 decimals. */
export function roundPathData(data: string): string {
  return data.replace(/-?\d+\.\d+/g, (match) =>
    String(Math.round(Number.parseFloat(match) * 100) / 100)
  );
}

/** One drawn object: raw path data plus its paint (fill and/or stroke). */
export interface IconDrawPart {
  d: string;
  fill: boolean;
  /** Stroke width in 24px units; 0 or undefined means no stroke. */
  strokeWidth?: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Emit the editor's objects as a stroke-preserving 24px icon SVG — the same
 * format the Figma icon set is stored in. Strokes stay strokes (round caps and
 * joins); the deterministic outliner in `@podo/icon-build` expands them to fill
 * glyphs only at font-build time.
 */
export function strokeIconSvg(parts: IconDrawPart[]): string {
  const body = parts
    .filter((part) => part.d.trim())
    .map((part) => {
      const d = roundPathData(part.d);
      const stroke = part.strokeWidth && part.strokeWidth > 0 ? round2(part.strokeWidth) : 0;
      const paints: string[] = [];
      paints.push(`fill="${part.fill ? "currentColor" : "none"}"`);
      if (stroke) {
        paints.push(
          `stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`
        );
      }
      return `<path d="${d}" ${paints.join(" ")}/>`;
    })
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_EDIT_VIEWBOX} ${ICON_EDIT_VIEWBOX}" fill="none">` +
    `${body}</svg>`
  );
}
