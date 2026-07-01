import { describe, expect, it } from "vitest";
import type { EditorTokenRecord } from "@podo/edit-core";
import { createColorComparisonMatrix, isBaseColorTokenPath } from "./token-model.js";

function colorRecord(path: string): EditorTokenRecord {
  return { documentIndex: 0, path, token: { $type: "color", $value: "#000000" } };
}

describe("base color management", () => {
  it("flags color.base.* paths in both light and dark", () => {
    expect(isBaseColorTokenPath("color.base.red.50")).toBe(true);
    expect(isBaseColorTokenPath("dark.color.base.red.50")).toBe(true);
    expect(isBaseColorTokenPath("color.gray.50")).toBe(false);
    expect(isBaseColorTokenPath("color.palette.purple.600")).toBe(false);
  });

  it("groups base color sets after the basic color sets in the matrix", () => {
    const matrix = createColorComparisonMatrix([
      colorRecord("color.base.red.50"),
      colorRecord("color.gray.50"),
      colorRecord("color.base.blue.50"),
      colorRecord("color.primary.50"),
    ]);
    const ids = matrix.rows.map((row) => row.id);
    const baseStart = ids.findIndex((id) => isBaseColorTokenPath(id));
    expect(baseStart).toBeGreaterThan(0);
    // Every row before baseStart is basic; every row from baseStart on is base.
    expect(ids.slice(0, baseStart).some(isBaseColorTokenPath)).toBe(false);
    expect(ids.slice(baseStart).every(isBaseColorTokenPath)).toBe(true);
  });
});
