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
