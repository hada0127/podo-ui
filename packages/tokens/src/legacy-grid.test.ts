import { describe, expect, it } from "vitest";
import { emitLegacyGridCss, emitLegacyGridScss, legacyGridContract } from "./legacy-grid.js";

describe("legacy grid compatibility", () => {
  it("keeps the v1 grid contract", () => {
    expect(legacyGridContract).toMatchInlineSnapshot(`
      {
        "breakpoints": {
          "mobile": {
            "columns": 4,
            "gap": "16px",
            "maxWidth": "767px",
            "paddingInline": "16px",
          },
          "pc": {
            "columns": 12,
            "gap": "24px",
            "minWidth": "1280px",
            "paddingInline": "24px",
          },
          "tablet": {
            "columns": 6,
            "gap": "16px",
            "maxWidth": "1279px",
            "minWidth": "768px",
            "paddingInline": "16px",
          },
        },
        "fixedColumns": {
          "max": 6,
          "min": 2,
        },
        "pixelWidth": {
          "max": 5000,
          "min": 0,
        },
        "spanColumns": {
          "max": 12,
          "min": 1,
        },
      }
    `);
  });

  it("emits the old grid selectors and responsive rules", () => {
    const css = emitLegacyGridCss({ pixelMax: 12 });

    expect(css).toContain("grid-template-columns: repeat(12, 1fr);");
    expect(css).toContain("@media screen and (min-width: 768px) and (max-width: 1279px)");
    expect(css).toContain("@media screen and (max-width: 767px)");
    expect(css).toContain(".grid.grid-fix-6");
    expect(css).toContain(".grid > .w-12");
    expect(css).toContain(".grid > .w-full");
    expect(css).toContain("*:not(.grid) > .w-12");
    expect(css).toContain("*.w-12px");
    expect(css).toMatchSnapshot("legacy-grid-css");
  });

  it("emits SCSS compatible with the v1 source contract", () => {
    const scss = emitLegacyGridScss();

    expect(scss).toContain("$grid-pc: 12;");
    expect(scss).toContain("$grid-tb: 6;");
    expect(scss).toContain("$grid-mo: 4;");
    expect(scss).toContain("@for $i from 0 through 5000");
    expect(scss).toMatchSnapshot("legacy-grid-scss");
  });
});
