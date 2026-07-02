import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION } from "./shared.js";
import {
  parseComponentDocument,
  validateComponentTokenBindings,
  type ComponentDocument,
} from "./components.js";

function buttonWith(variant: Record<string, unknown>): unknown {
  return {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    anatomy: [{ name: "root" }],
    variants: [variant],
    targets: {
      web: { supported: true },
      react: { supported: true },
      hono: { supported: true },
      native: { supported: true },
    },
    accessibility: {},
  };
}

describe("component variant valueTokens", () => {
  it("parses per-value token bindings whose keys are declared values", () => {
    const component = parseComponentDocument(
      buttonWith({
        name: "variant",
        values: ["solid", "soft"],
        default: "solid",
        valueTokens: { soft: { "root.background": "{color.soft.background}" } },
      })
    );
    expect(component.variants[0]?.valueTokens?.soft?.["root.background"]).toBe(
      "{color.soft.background}"
    );
  });

  it("rejects a valueTokens key that is not a declared variant value", () => {
    expect(() =>
      parseComponentDocument(
        buttonWith({
          name: "variant",
          values: ["solid", "soft"],
          valueTokens: { ghost: { "root.background": "{color.ghost.background}" } },
        })
      )
    ).toThrow();
  });

  it("accepts a JSON Pointer alias in a per-value binding (normalized)", () => {
    const component = parseComponentDocument(
      buttonWith({
        name: "variant",
        values: ["solid", "soft"],
        valueTokens: { soft: { "root.background": "#/color/soft/background/$value" } },
      })
    ) as ComponentDocument;
    // The pointer normalizes to color.soft.background; present -> no missing issue.
    const issues = validateComponentTokenBindings(component, ["color.soft.background"]);
    expect(issues).toEqual([]);
  });

  it("rejects a binding key that is not a dotted path", () => {
    expect(() =>
      parseComponentDocument(
        buttonWith({
          name: "variant",
          values: ["solid"],
          valueTokens: { solid: { "root background": "{color.brand}" } },
        })
      )
    ).toThrow();
  });

  it("flags a missing token referenced by a per-value binding", () => {
    const component = parseComponentDocument(
      buttonWith({
        name: "variant",
        values: ["solid", "soft"],
        valueTokens: { soft: { "root.background": "{color.soft.background}" } },
      })
    ) as ComponentDocument;
    const issues = validateComponentTokenBindings(component, ["color.brand"]);
    expect(
      issues.some(
        (issue) =>
          issue.code === "component.tokenBinding.missing" &&
          issue.message.includes("variants.variant.soft.root.background")
      )
    ).toBe(true);
  });
});

function componentWithAnatomy(anatomy: unknown): unknown {
  return {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    anatomy,
    variants: [{ name: "variant", values: ["a"], default: "a" }],
    targets: {
      web: { supported: true },
      react: { supported: true },
      hono: { supported: true },
      native: { supported: true },
    },
    accessibility: {},
  };
}

describe("component anatomy schema validation", () => {
  it("rejects duplicate anatomy part names", () => {
    expect(() =>
      parseComponentDocument(
        componentWithAnatomy([{ name: "root" }, { name: "icon" }, { name: "icon" }])
      )
    ).toThrow(/unique/i);
  });

  it("rejects a part that is its own parent", () => {
    expect(() =>
      parseComponentDocument(
        componentWithAnatomy([{ name: "root" }, { name: "icon", parent: "icon" }])
      )
    ).toThrow(/own parent/i);
  });

  it("rejects a missing parent", () => {
    expect(() =>
      parseComponentDocument(
        componentWithAnatomy([{ name: "root" }, { name: "icon", parent: "ghost" }])
      )
    ).toThrow(/does not exist/i);
  });

  it("rejects a parent cycle", () => {
    expect(() =>
      parseComponentDocument(
        componentWithAnatomy([
          { name: "root" },
          { name: "a", parent: "b" },
          { name: "b", parent: "a" },
        ])
      )
    ).toThrow(/cycle/i);
  });

  it("accepts a valid anatomy hierarchy", () => {
    expect(() =>
      parseComponentDocument(
        componentWithAnatomy([
          { name: "root" },
          { name: "icon", parent: "root" },
          { name: "label", parent: "root" },
        ])
      )
    ).not.toThrow();
  });

  it("accepts and preserves hidden/locked layer flags", () => {
    const parsed = parseComponentDocument(
      componentWithAnatomy([
        { name: "root", locked: true },
        { name: "icon", parent: "root", hidden: true },
      ])
    ) as { anatomy: Array<{ name: string; hidden?: boolean; locked?: boolean }> };
    expect(parsed.anatomy[0]?.locked).toBe(true);
    expect(parsed.anatomy[1]?.hidden).toBe(true);
    expect(parsed.anatomy[1]?.locked).toBeUndefined();
  });

  it("rejects non-boolean hidden/locked flags", () => {
    expect(() =>
      parseComponentDocument(componentWithAnatomy([{ name: "root", hidden: "yes" }]))
    ).toThrow();
  });

  it("accepts compound variant combinations and validates axes/values", () => {
    const base = componentWithAnatomy([{ name: "root" }]) as Record<string, unknown>;
    const withCombo = {
      ...base,
      variants: [
        { name: "variant", values: ["a", "b"], default: "a" },
        { name: "size", values: ["sm", "lg"], default: "sm" },
      ],
      combinations: [
        { when: { variant: "b", size: "lg" }, tokens: { "root.background": "#000000" } },
      ],
    };
    const parsed = parseComponentDocument(withCombo) as {
      combinations: Array<{ when: Record<string, string> }>;
    };
    expect(parsed.combinations[0]?.when).toEqual({ variant: "b", size: "lg" });
    expect(() =>
      parseComponentDocument({
        ...withCombo,
        combinations: [{ when: { ghost: "x" }, tokens: {} }],
      })
    ).toThrow(/unknown variant/i);
    expect(() =>
      parseComponentDocument({
        ...withCombo,
        combinations: [{ when: { size: "xl" }, tokens: {} }],
      })
    ).toThrow(/not declared/i);
  });

  it("attaches an i18n code to anatomy validation issues", () => {
    try {
      parseComponentDocument(
        componentWithAnatomy([{ name: "root" }, { name: "icon" }, { name: "icon" }])
      );
      throw new Error("expected parse to throw");
    } catch (error) {
      const issues = (
        error as { issues?: Array<{ message?: string; params?: Record<string, unknown> }> }
      ).issues;
      const issue = issues?.find((item) => /unique/i.test(item.message ?? ""));
      expect(issue?.params?.i18n).toBe("spec.anatomyUnique");
    }
  });
});
