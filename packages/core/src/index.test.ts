import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseComponentDocument, type ComponentDocument } from "@podo/spec";
import {
  createButtonBehavior,
  createComponentRegistry,
  createFieldA11y,
  createInputBehavior,
  isActivationKey,
  partClass,
} from "./index.js";

const componentRoot = resolve(process.cwd(), "packages/spec/samples/components");

describe("@podo/core", () => {
  it("indexes component specs by id, name, category, and target", () => {
    const registry = createComponentRegistry(loadComponents());

    expect(registry.byId("button")?.name).toBe("Button");
    expect(registry.byName("input")?.id).toBe("input");
    expect(registry.byCategory("atom").map((entry) => entry.id)).toEqual(["button", "input"]);
    expect(registry.byTarget("native").map((entry) => entry.id)).toEqual([
      "button",
      "field",
      "input",
    ]);
  });

  it("creates reusable field accessibility wiring", () => {
    const a11y = createFieldA11y({
      id: "email",
      invalid: true,
      required: true,
      hasDescription: true,
      hasError: true,
    });

    expect(a11y.control).toMatchObject({
      id: "email-control",
      "aria-labelledby": "email-label",
      "aria-describedby": "email-description email-error",
      "aria-invalid": "true",
      "aria-required": "true",
      required: true,
    });
    expect(a11y.label).toEqual({ id: "email-label", for: "email-control" });
  });

  it("separates behavior state from renderer output", () => {
    expect(createButtonBehavior({ loading: true }).root).toMatchObject({
      type: "button",
      disabled: true,
      ariaBusy: "true",
      tabIndex: -1,
    });
    expect(createInputBehavior({ value: "a", invalid: true }).controlled).toBe(true);
    expect(isActivationKey("Enter")).toBe(true);
    expect(isActivationKey("Escape")).toBe(false);
    expect(partClass("button", "label")).toBe("podo-button__label");
  });
});

function loadComponents(): ComponentDocument[] {
  return ["button", "input", "field"].map((name) =>
    parseComponentDocument(
      JSON.parse(readFileSync(resolve(componentRoot, `${name}.component.json`), "utf8"))
    )
  );
}
