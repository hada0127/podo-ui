import { describe, expect, it } from "vitest";
import { buildIconFontWoff2 } from "@podo/icon-build";
import { validateIconManifest, type EmbeddedFontAsset } from "@podo/spec";
import { DEFAULT_ICON_CODEPOINT_FLOOR, DEFAULT_ICON_MANIFEST } from "./default-icons.generated.js";
import {
  addIcon,
  createGroup,
  deleteIcon,
  fromIconManifest,
  iconGlyphsFromModel,
  isIconFontStale,
  nextFreeCodepoint,
  renameIcon,
  setIconGroupMembership,
  toIconManifest,
  type EditorIconManifest,
} from "./icons-model.js";

function baseModel(): EditorIconManifest {
  return {
    fontFamily: "PodoIcons",
    icons: {
      star: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M500 100L650 450L900 450L700 650L800 900L500 720L200 900L300 650L100 450L350 450Z" fill="currentColor"/></svg>',
        codepoint: "E900",
        tags: [],
      },
      heart: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M500 800L150 450L350 250L500 400L650 250L850 450Z" fill="currentColor"/></svg>',
        codepoint: "E901",
        tags: ["love"],
      },
    },
    groups: { shapes: ["star", "heart"] },
  };
}

async function buildFontAsset(model: EditorIconManifest): Promise<EmbeddedFontAsset> {
  const result = await buildIconFontWoff2({
    fontFamily: model.fontFamily,
    glyphs: iconGlyphsFromModel(model),
  });
  return {
    kind: "font",
    source: "embedded",
    family: model.fontFamily,
    fileName: `${model.fontFamily}.woff2`,
    format: "woff2",
    mimeType: "font/woff2",
    dataUrl: result.dataUrl,
  };
}

describe("icons-model", () => {
  it("imports the generated Figma default manifest", () => {
    const model = fromIconManifest(DEFAULT_ICON_MANIFEST);
    expect(Object.keys(model.icons).length).toBe(77);
    // Codepoints are allocated from 0xE001 in sorted-name order.
    expect(model.icons.airplane?.codepoint).toBe("E001");
    expect(model.icons.close).toBeDefined();
    expect(model.groups.arrow).toContain("arrow-left");
    expect(DEFAULT_ICON_CODEPOINT_FLOOR).toBe(0xe04e);
  });

  it("allocates fresh codepoints that never collide", () => {
    const added = addIcon(baseModel(), {
      name: "New Shape!!",
      svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
      floor: 0xe902,
    });
    expect(added.name).toBe("new-shape");
    expect(added.model.icons["new-shape"]?.codepoint).toBe("E902");

    const next = nextFreeCodepoint(added.model, 0xe900);
    expect(next).toBe("E903");
  });

  it("keeps the codepoint and updates groups on rename", () => {
    const { model, name } = renameIcon(baseModel(), "star", "Big Star");
    expect(name).toBe("big-star");
    expect(model.icons["big-star"]?.codepoint).toBe("E900");
    expect(model.icons.star).toBeUndefined();
    expect(model.groups.shapes).toContain("big-star");
    expect(model.groups.shapes).not.toContain("star");
  });

  it("removes an icon from icons and every group on delete", () => {
    const model = deleteIcon(baseModel(), "heart");
    expect(model.icons.heart).toBeUndefined();
    expect(model.groups.shapes).toEqual(["star"]);
  });

  it("keeps the codepoint lock valid after a sequence of edits", async () => {
    let model = baseModel();
    model = addIcon(model, {
      name: "box",
      svg: '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>',
      floor: 0xe902,
    }).model;
    model = renameIcon(model, "star", "asterisk").model;
    model = deleteIcon(model, "heart");
    model = createGroup(model, "Outlines").model;
    model = setIconGroupMembership(model, "outlines", "box", true);

    const fontAsset = await buildFontAsset(model);
    const manifest = toIconManifest(model, fontAsset);

    expect(validateIconManifest(manifest)).toEqual([]);
    for (const [name, def] of Object.entries(manifest.icons)) {
      expect(manifest.codepointLock[name]).toBe(def.codepoint);
    }
    expect(isIconFontStale({ ...model, builtHash: manifest.fontBuild?.iconsHash })).toBe(false);
  });
});
