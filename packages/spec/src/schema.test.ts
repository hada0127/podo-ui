import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectTokenPaths,
  computeIconsHash,
  mergePodoOverrides,
  parseComponentDocument,
  parseIconManifest,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  validateComponentTokenBindings,
  validateIconManifest,
  validateInlineSvg,
  validateTokenReferences,
  type ComponentDocument,
  type IconManifest,
} from "./index.js";

const sampleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../samples");

function loadSample<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(sampleRoot, relativePath), "utf8")) as T;
}

describe("Podo spec schemas", () => {
  it("parses valid token sample documents", () => {
    const typography = parseTokenDocument(loadSample("tokens/typography.tokens.json"));
    const color = parseTokenDocument(loadSample("tokens/color.tokens.json"));
    const foundation = parseTokenDocument(loadSample("tokens/foundation.tokens.json"));

    expect(typography.category).toBe("semantic");
    expect(color.category).toBe("semantic");
    expect(foundation.category).toBe("primitive");
    expect(validateTokenReferences(typography)).toEqual([]);
    expect(validateTokenReferences(color)).toEqual([]);
    expect(validateTokenReferences(foundation)).toEqual([]);
  });

  it("parses css color values used by legacy tokens", () => {
    const document = parseTokenDocument({
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "semantic",
      tokens: {
        color: {
          overlay: { $type: "color", $value: "rgba(0, 0, 0, 0.09)" },
          clear: { $type: "color", $value: "transparent" },
        },
      },
    });

    expect(document.tokens.color).toBeDefined();
  });

  it("parses embedded font assets on font family tokens", () => {
    const document = parseTokenDocument({
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "theme",
      tokens: {
        font: {
          family: {
            podo: {
              $type: "fontFamily",
              $value: "Podo Sans",
              $extensions: {
                podo: {
                  fontAsset: {
                    kind: "font",
                    source: "embedded",
                    family: "Podo Sans",
                    fileName: "podo-sans.woff2",
                    format: "woff2",
                    mimeType: "font/woff2",
                    dataUrl: "data:font/woff2;base64,AAAA",
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(JSON.stringify(document.tokens)).toContain("podo-sans.woff2");
  });

  it("parses valid component sample documents", () => {
    const button = parseComponentDocument(loadSample("components/button.component.json"));
    const input = parseComponentDocument(loadSample("components/input.component.json"));
    const field = parseComponentDocument(loadSample("components/field.component.json"));
    const icon = parseComponentDocument(loadSample("components/icon.component.json"));
    const typography = parseComponentDocument(loadSample("components/typography.component.json"));

    expect(button.slots.some((slot) => slot.name === "children" && slot.required)).toBe(true);
    expect(input.states.some((state) => state.name === "invalid")).toBe(true);
    expect(field.slots.some((slot) => slot.name === "control" && slot.required)).toBe(true);
    expect(icon.props.some((prop) => prop.name === "name" && prop.required)).toBe(true);
    expect(typography.tokens["heading.typography"]).toBe("{typography.heading.xlarge}");
  });

  it("parses valid icon and .podo sample documents", () => {
    const manifest = parseIconManifest(loadSample("icons/podo-icons.json"));
    const config = parsePodoConfig(loadSample("podo/config.json"));
    const lock = parsePodoLock(loadSample("podo/lock.json"));

    expect(validateIconManifest(manifest)).toEqual([]);
    expect(config.environment).toBe("react");
    expect(lock.generatedHash).toHaveLength(32);
  });

  it("reports invalid sample shapes with explicit errors", () => {
    expect(() =>
      parseTokenDocument({
        schemaVersion: "9.9.9",
        kind: "tokens",
        category: "semantic",
        tokens: {},
      })
    ).toThrow(/Invalid input/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          color: {
            bad: { $type: "color", $value: "not-a-color" },
          },
        },
      })
    ).toThrow(/Color tokens must use a color value or alias reference/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "theme",
        tokens: {
          typography: {
            bad: { $type: "typography", $value: { fontFamily: "Pretendard", fontSize: "16px" } },
          },
        },
      })
    ).toThrow(/Typography tokens must include/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          shadow: {
            bad: { $type: "shadow", $value: { x: "0px" } },
          },
        },
      })
    ).toThrow(/Shadow tokens must include/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          easing: {
            bad: { $type: "cubicBezier", $value: [0.2, 0, 2, 1] },
          },
        },
      })
    ).toThrow(/Cubic bezier tokens must be an array/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          border: {
            bad: { $type: "border", $value: {} },
          },
        },
      })
    ).toThrow(/Border tokens must include/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          motion: {
            bad: { $type: "motion", $value: "nonsense" },
          },
        },
      })
    ).toThrow(/Motion tokens must include/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          spacing: {
            bad: { $type: "spacing", $value: "wide" },
          },
        },
      })
    ).toThrow(/spacing tokens must use an allowed unit/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          weight: {
            bad: { $type: "fontWeight", $value: {} },
          },
        },
      })
    ).toThrow(/Font weight tokens must use/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          color: {
            bad: { $type: "color", $value: "{color.text" },
          },
        },
      })
    ).toThrow(/Alias references must use/);

    expect(() =>
      parseTokenDocument({
        schemaVersion: "2.0.0",
        kind: "tokens",
        category: "semantic",
        tokens: {
          color: {
            bad: { $type: "color", $value: {} },
          },
        },
      })
    ).toThrow(/Color tokens must use a color value or alias reference/);

    expect(() =>
      parseComponentDocument({
        schemaVersion: "2.0.0",
        kind: "component",
        id: "BadComponent",
        name: "",
        category: "atom",
        status: "stable",
        anatomy: [],
        targets: {},
        accessibility: {},
      })
    ).toThrow();
  });

  it("detects missing token aliases and circular token aliases", () => {
    const missingReference = parseTokenDocument({
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "semantic",
      tokens: {
        color: {
          text: {
            default: { $type: "color", $value: "{color.missing}" },
          },
        },
      },
    });

    expect(validateTokenReferences(missingReference)).toEqual([
      expect.objectContaining({ code: "token.reference.missing", path: "color.text.default" }),
    ]);

    const circularReference = parseTokenDocument({
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "semantic",
      tokens: {
        color: {
          a: { $type: "color", $value: "{color.b}" },
          b: { $type: "color", $value: "{color.a}" },
        },
      },
    });

    expect(validateTokenReferences(circularReference)).toEqual([
      expect.objectContaining({ code: "token.reference.circular" }),
    ]);
  });

  it("detects broken component token bindings", () => {
    const color = parseTokenDocument(loadSample("tokens/color.tokens.json"));
    const foundation = parseTokenDocument(loadSample("tokens/foundation.tokens.json"));
    const typography = parseTokenDocument(loadSample("tokens/typography.tokens.json"));
    const button = parseComponentDocument(loadSample("components/button.component.json"));
    const input = parseComponentDocument(loadSample("components/input.component.json"));
    const field = parseComponentDocument(loadSample("components/field.component.json"));
    const icon = parseComponentDocument(loadSample("components/icon.component.json"));
    const text = parseComponentDocument(loadSample("components/typography.component.json"));
    const tokenPaths = [color, foundation, typography].flatMap((document) =>
      collectTokenPaths(document.tokens)
    );

    expect(validateComponentTokenBindings(button, tokenPaths)).toEqual([]);
    expect(validateComponentTokenBindings(input, tokenPaths)).toEqual([]);
    expect(validateComponentTokenBindings(field, tokenPaths)).toEqual([]);
    expect(validateComponentTokenBindings(icon, tokenPaths)).toEqual([]);
    expect(validateComponentTokenBindings(text, tokenPaths)).toEqual([]);

    const brokenButton: ComponentDocument = {
      ...button,
      tokens: {
        ...button.tokens,
        "root.borderColor": "{component.button.missing}",
      },
    };

    expect(validateComponentTokenBindings(brokenButton, tokenPaths)).toEqual([
      expect.objectContaining({
        code: "component.tokenBinding.missing",
        path: "button.tokens.root.borderColor",
      }),
    ]);
  });

  it("detects icon group and codepoint lock problems", () => {
    const manifest = parseIconManifest(loadSample("icons/podo-icons.json"));
    const brokenManifest: IconManifest = {
      ...manifest,
      groups: {
        ...manifest.groups,
        navigation: ["chevron-left", "chevron-left", "missing-icon"],
      },
      codepointLock: {
        ...manifest.codepointLock,
        "chevron-left": "E999",
      },
    };

    expect(validateIconManifest(brokenManifest)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "icon.group.duplicate" }),
        expect.objectContaining({ code: "icon.group.missing" }),
        expect.objectContaining({ code: "icon.codepointLock.mismatch" }),
      ])
    );
  });

  const INLINE_SVG_A =
    '<svg viewBox="0 0 1000 1000"><path d="M100 100 L900 900 Z" fill="currentColor"/></svg>';
  const INLINE_SVG_B =
    '<svg viewBox="0 0 1000 1000"><path d="M0 0 H1000 V1000 H0 Z" fill="currentColor"/></svg>';

  function embeddedIconManifest(): IconManifest {
    const parsed = parseIconManifest({
      schemaVersion: "2.0.0",
      kind: "icons",
      fontFamily: "PodoIcons",
      icons: {
        alpha: { svg: INLINE_SVG_A, codepoint: "E900", tags: [] },
        beta: { svg: INLINE_SVG_B, codepoint: "E901", tags: [] },
      },
      groups: { all: ["alpha", "beta"] },
      codepointLock: { alpha: "E900", beta: "E901" },
    });
    return {
      ...parsed,
      fontAsset: {
        kind: "font",
        source: "embedded",
        family: "PodoIcons",
        fileName: "PodoIcons.woff2",
        format: "woff2",
        mimeType: "font/woff2",
        dataUrl: "data:font/woff2;base64,d09GMgABAAAAAAA",
      },
      fontBuild: { iconsHash: computeIconsHash(parsed), unitsPerEm: 1000, glyphCount: 3 },
    };
  }

  it("accepts a valid embedded (inline-svg + woff2) icon manifest", () => {
    const manifest = embeddedIconManifest();
    expect(validateIconManifest(manifest)).toEqual([]);
    expect(manifest.fontBuild?.iconsHash).toBe(computeIconsHash(manifest));
  });

  it("requires exactly one of source or inline svg", () => {
    const both = embeddedIconManifest();
    both.icons.alpha = { ...both.icons.alpha!, source: "svg/alpha.svg" };
    expect(validateIconManifest(both)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.source.ambiguous" })])
    );

    const neither = embeddedIconManifest();
    neither.icons.beta = { codepoint: "E901", tags: [] };
    expect(validateIconManifest(neither)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.source.missing" })])
    );
  });

  it("flags a non-woff2 embed, stale build, and missing font", () => {
    const notWoff2 = embeddedIconManifest();
    notWoff2.fontAsset = { ...notWoff2.fontAsset!, format: "woff", mimeType: "font/woff" };
    expect(validateIconManifest(notWoff2)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.fontAsset.notWoff2" })])
    );

    const stale = embeddedIconManifest();
    stale.icons.alpha = {
      ...stale.icons.alpha!,
      svg: '<svg viewBox="0 0 1000 1000"><path d="M0 0 L500 500 Z" fill="currentColor"/></svg>',
    };
    expect(validateIconManifest(stale)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.fontBuild.stale" })])
    );

    const noFont = embeddedIconManifest();
    delete noFont.fontAsset;
    delete noFont.fontBuild;
    expect(validateIconManifest(noFont)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.fontAsset.missing" })])
    );
  });

  it("validates inline svg shape rules", () => {
    const fixed = embeddedIconManifest();
    fixed.icons.alpha = {
      ...fixed.icons.alpha!,
      svg: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M0 0Z" fill="currentColor"/></svg>',
    };
    fixed.fontBuild = { ...fixed.fontBuild!, iconsHash: computeIconsHash(fixed) };
    expect(validateIconManifest(fixed)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "icon.svg.fixedSize" })])
    );

    expect(
      validateInlineSvg("noViewBox", '<svg><path d="M0 0Z" fill="currentColor"/></svg>')
    ).toEqual([expect.objectContaining({ code: "icon.svg.missingViewBox" })]);
    expect(
      validateInlineSvg("noColor", '<svg viewBox="0 0 24 24"><path d="M0 0Z" fill="#000"/></svg>')
    ).toEqual([expect.objectContaining({ code: "icon.svg.missingCurrentColor" })]);
    expect(
      validateInlineSvg(
        "ok",
        '<svg viewBox="0 0 24 24"><path d="M0 0Z" fill="currentColor"/></svg>'
      )
    ).toEqual([]);
  });

  it("rejects inline svg with XSS vectors", () => {
    const unsafeSvgs = [
      '<svg viewBox="0 0 1 1" fill="currentColor"><image href="x" onerror="alert(1)"/></svg>',
      '<svg viewBox="0 0 1 1" fill="currentColor"><animate onbegin="alert(1)"/></svg>',
      '<svg viewBox="0 0 1 1" fill="currentColor"><script>alert(1)</script></svg>',
      '<svg viewBox="0 0 1 1" fill="currentColor"><foreignObject><body>x</body></foreignObject></svg>',
      '<svg viewBox="0 0 1 1" fill="currentColor"><a href="javascript:alert(1)"><path d="M0 0Z"/></a></svg>',
    ];
    for (const svg of unsafeSvgs) {
      expect(validateInlineSvg("evil", svg).map((entry) => entry.code)).toContain(
        "icon.svg.unsafe"
      );
    }
    // Canonical geometry-only svg is not flagged unsafe.
    expect(
      validateInlineSvg(
        "safe",
        '<svg viewBox="0 0 1000 1000"><path d="M100 100H900V900H100Z" fill="currentColor"/></svg>'
      )
    ).toEqual([]);
  });

  it("deep merges .podo overrides while replacing arrays", () => {
    const base = parsePodoConfig(loadSample("podo/config.json"));
    const merged = mergePodoOverrides(base, {
      themes: {
        default: "landing",
        available: ["landing"],
      },
      build: {
        targets: ["web"],
        outDir: "src/generated/podo",
      },
    });

    expect(merged.environment).toBe("react");
    expect(merged.themes).toEqual({ default: "landing", available: ["landing"] });
    expect(merged.build).toEqual({ targets: ["web"], outDir: "src/generated/podo" });
  });
});
