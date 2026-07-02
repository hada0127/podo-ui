import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION, parseComponentDocument, type ComponentDocument } from "@podo/spec";
import {
  assertIdempotent,
  emitComponentTokenCss,
  generateComponentFiles,
  generateIndexFile,
  generatedFileHeader,
} from "./index.js";

const componentRoot = resolve(process.cwd(), "packages/spec/samples/components");

describe("@podo/codegen", () => {
  it("generates deterministic target files from component specs", () => {
    const specs = loadComponents();
    const first = generateComponentFiles({
      specs,
      targets: ["web", "react", "hono", "native"],
      outDir: ".podo/generated/components",
    });
    const second = generateComponentFiles({
      specs: [...specs].reverse(),
      targets: ["native", "hono", "react", "web"],
      outDir: ".podo/generated/components",
    });

    assertIdempotent(first, second);
    expect(first.map((file) => file.path)).toMatchSnapshot("paths");
    expect(first.find((file) => file.path.endsWith("web/button.web.ts"))?.contents).toMatchSnapshot(
      "web button output"
    );
    expect(
      first.find((file) => file.path.endsWith("react/button.react.ts"))?.contents
    ).toMatchSnapshot("react button output");
    expect(
      first.find((file) => file.path.endsWith("hono/button.hono.ts"))?.contents
    ).toMatchSnapshot("hono button output");
    expect(
      first.find((file) => file.path.endsWith("native/button.native.ts"))?.contents
    ).toMatchSnapshot("native button output");
    expect(first.find((file) => file.path.endsWith("react/button.react.ts"))?.contents).toContain(
      'export { Button } from "@podo/react";'
    );
    expect(first.every((file) => file.contents.startsWith(generatedFileHeader))).toBe(true);
  });

  it("generates an idempotent barrel file", () => {
    const files = generateComponentFiles({
      specs: loadComponents(),
      targets: ["react"],
    });
    const index = generateIndexFile(files);

    expect(index.path).toBe("generated/index.ts");
    expect(index.contents).toMatchSnapshot();
  });

  it("emits base, per-variant-value, and per-state CSS overrides", () => {
    const component = parseComponentDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "component",
      id: "button",
      name: "Button",
      category: "atom",
      status: "stable",
      anatomy: [{ name: "root" }],
      tokens: { "root.background": "{component.button.background}" },
      variants: [
        {
          name: "variant",
          values: ["solid", "soft"],
          default: "solid",
          valueTokens: { soft: { "root.background": "{component.button.soft.background}" } },
        },
      ],
      states: [
        {
          name: "disabled",
          tokens: { "root.background": "{component.button.disabled.background}" },
        },
      ],
      targets: {
        web: { supported: true },
        react: { supported: true },
        hono: { supported: true },
        native: { supported: true },
      },
      accessibility: {},
    });
    const css = emitComponentTokenCss([component]);
    expect(css).toContain(".podo-button {");
    expect(css).toContain(
      "--podo-button-root-background: var(--podo-component-button-background);"
    );
    expect(css).toContain('.podo-button[data-variant="soft"] {');
    expect(css).toContain(
      "--podo-button-root-background: var(--podo-component-button-soft-background);"
    );
    expect(css).toContain('.podo-button[data-state="disabled"] {');
    expect(css).toContain("var(--podo-component-button-disabled-background)");
    // deterministic
    expect(emitComponentTokenCss([component])).toBe(css);
  });

  it("emits hidden-layer display rules and compound-combination overrides", () => {
    const component = parseComponentDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "component",
      id: "button",
      name: "Button",
      category: "atom",
      status: "stable",
      anatomy: [{ name: "root" }, { name: "left-icon", parent: "root", hidden: true }],
      tokens: {},
      variants: [
        { name: "theme", values: ["default", "primary"], default: "default" },
        { name: "size", values: ["sm", "lg"], default: "sm" },
      ],
      combinations: [
        {
          when: { theme: "primary", size: "lg" },
          tokens: { "root.background": "{component.button.combo.background}" },
        },
      ],
      targets: {
        web: { supported: true },
        react: { supported: true },
        hono: { supported: true },
        native: { supported: true },
      },
      accessibility: {},
    });
    const css = emitComponentTokenCss([component]);
    // Figma eye toggle survives to build output as a real display rule.
    expect(css).toContain('.podo-button [data-part="left-icon"] {\n  display: none;\n}');
    // Compound conditions constrain every named axis (sorted).
    expect(css).toContain('.podo-button[data-size="lg"][data-theme="primary"] {');
    expect(css).toContain("var(--podo-component-button-combo-background)");
    expect(emitComponentTokenCss([component])).toBe(css);
  });

  it("folds variant-level tokens into the base rule and escapes variant values", () => {
    const component = parseComponentDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "component",
      id: "card",
      name: "Card",
      category: "atom",
      status: "stable",
      anatomy: [{ name: "root" }],
      tokens: {},
      variants: [
        {
          name: "tone",
          values: ["solid", 'a"b'],
          tokens: { "root.padding": "{space.md}" },
          valueTokens: { 'a"b': { "root.background": "{color.brand}" } },
        },
      ],
      states: [],
      targets: {
        web: { supported: true },
        react: { supported: true },
        hono: { supported: true },
        native: { supported: true },
      },
      accessibility: {},
    });
    const css = emitComponentTokenCss([component]);
    // variant-level tokens fold into the base rule
    expect(css).toContain(".podo-card {");
    expect(css).toContain("--podo-card-root-padding: var(--podo-space-md);");
    // variant value with a quote is escaped in the attribute selector
    expect(css).toContain('data-tone="a\\"b"');
  });

  it("omits empty component CSS blocks but keeps the generated header", () => {
    const css = emitComponentTokenCss([]);
    expect(css.startsWith(generatedFileHeader)).toBe(true);
    expect(css).not.toContain(".podo-");
  });
});

function loadComponents(): ComponentDocument[] {
  return ["button", "input", "field"].map((name) =>
    parseComponentDocument(
      JSON.parse(readFileSync(resolve(componentRoot, `${name}.component.json`), "utf8"))
    )
  );
}
