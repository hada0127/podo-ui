import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  collectTokenPaths,
  mergePodoOverrides,
  parseComponentDocument,
  parseIconManifest,
  parsePodoConfig,
  parsePodoLock,
  parseTokenDocument,
  validateComponentTokenBindings,
  validateIconManifest,
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

    expect(typography.category).toBe("theme");
    expect(color.category).toBe("semantic");
    expect(foundation.category).toBe("primitive");
    expect(validateTokenReferences(typography)).toEqual([]);
    expect(validateTokenReferences(color)).toEqual([]);
    expect(validateTokenReferences(foundation)).toEqual([]);
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
    expect(typography.tokens["heading.typography"]).toBe("{typography.h1.dashboard}");
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
    ).toThrow(/Color tokens must use a hex color or alias reference/);

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
    ).toThrow(/Color tokens must use a hex color or alias reference/);

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
