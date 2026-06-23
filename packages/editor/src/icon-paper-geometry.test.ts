import { describe, expect, it } from "vitest";
import { validateInlineSvg } from "@podo/spec";
import { pathsToIconSvg, roundPathData } from "./icon-paper-geometry.js";

// The paper.js geometry engine (boolean ops, SVG import/export) runs in the
// browser canvas and is exercised in the live editor; these cover the pure
// path-data → canonical-icon-svg helpers that paper output flows through.
describe("icon-paper-geometry", () => {
  it("rounds floating-point path coordinates", () => {
    expect(roundPathData("M100.12345 200.6L300 400.999")).toBe("M100.12 200.6L300 401");
    expect(roundPathData("M0 0H1000V1000H0Z")).toBe("M0 0H1000V1000H0Z");
  });

  it("wraps a single path into a valid canonical icon svg", () => {
    const svg = pathsToIconSvg(["M100 100H900V900H100Z"]);
    expect(svg).toContain('viewBox="0 0 1000 1000"');
    expect(svg).toContain("currentColor");
    expect(validateInlineSvg("box", svg)).toEqual([]);
  });

  it("concatenates multiple objects (compound shape with a hole) into one path", () => {
    const svg = pathsToIconSvg(["M100 100H900V900H100Z", "M300 300H700V700H300Z"]);
    expect((svg.match(/<path/g) ?? []).length).toBe(1);
    expect(svg).toContain("M100 100H900V900H100ZM300 300H700V700H300Z");
    expect(validateInlineSvg("ring", svg)).toEqual([]);
  });
});
