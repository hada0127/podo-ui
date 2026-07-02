import { describe, expect, it } from "vitest";
import { validateInlineSvg } from "@podo/spec";
import { roundPathData, strokeIconSvg } from "./icon-paper-geometry.js";

// The paper.js geometry engine (boolean ops, SVG import/export) runs in the
// browser canvas and is exercised in the live editor; these cover the pure
// editor-objects → stored-icon-svg emitter that paper output flows through.
describe("icon-paper-geometry", () => {
  it("rounds floating-point path coordinates", () => {
    expect(roundPathData("M10.12345 20.6L3 4.999")).toBe("M10.12 20.6L3 5");
    expect(roundPathData("M0 0H24V24H0Z")).toBe("M0 0H24V24H0Z");
  });

  it("emits a stroke path in the stored 24px stroke-icon format", () => {
    const svg = strokeIconSvg([{ d: "M6 6L18 18", fill: false, strokeWidth: 1.2 }]);
    expect(svg).toContain('viewBox="0 0 24 24"');
    expect(svg).toContain('stroke="currentColor" stroke-width="1.2"');
    expect(svg).toContain('stroke-linecap="round" stroke-linejoin="round"');
    expect(svg).toContain('fill="none"');
    expect(validateInlineSvg("line", svg)).toEqual([]);
  });

  it("emits fill paths and keeps per-path stroke widths separate", () => {
    const svg = strokeIconSvg([
      { d: "M4 4H20V20H4Z", fill: true },
      { d: "M8 12H16", fill: false, strokeWidth: 2 },
    ]);
    expect((svg.match(/<path/g) ?? []).length).toBe(2);
    expect(svg).toContain('<path d="M4 4H20V20H4Z" fill="currentColor"/>');
    expect(svg).toContain('stroke-width="2"');
    expect(validateInlineSvg("mixed", svg)).toEqual([]);
  });

  it("drops empty path data", () => {
    const svg = strokeIconSvg([{ d: "  ", fill: true }]);
    expect(svg).not.toContain("<path");
  });
});
