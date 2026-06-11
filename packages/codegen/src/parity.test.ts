import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseComponentDocument, type ComponentDocument } from "@podo/spec";
import { generateComponentFiles, type CodegenTarget } from "./index.js";

const componentRoot = resolve(process.cwd(), "packages/spec/samples/components");
const targets: CodegenTarget[] = ["web", "react", "hono", "native"];

describe("cross-target component parity", () => {
  it("keeps Button props, slots, and token bindings aligned across all targets", () => {
    const button = loadComponent("button");
    const files = generateComponentFiles({ specs: [button], targets, outDir: ".podo/generated" });

    expect(files.map((file) => file.path)).toEqual(
      targets.map((target) => `.podo/generated/${target}/button.${target}.ts`).sort()
    );
    for (const target of targets) {
      expect(button.targets[target]?.supported).toBe(true);
      expect(files.find((file) => file.path.includes(`/${target}/`))?.contents).toContain("Button");
    }

    expect(button.props.map((prop) => prop.name)).toEqual([
      "variant",
      "size",
      "disabled",
      "loading",
      "onPress",
    ]);
    expect(button.slots.map((slot) => slot.name)).toEqual(["leftIcon", "children", "rightIcon"]);
    expect(button.tokens).toMatchObject({
      "root.background": "{component.button.background}",
      "label.color": "{component.button.text}",
      "icon.color": "{component.button.text}",
    });
    expect(button.variants.find((variant) => variant.name === "variant")?.tokens).toMatchObject({
      "root.background": "{component.button.background}",
      "label.color": "{component.button.text}",
    });
  });
});

function loadComponent(name: string): ComponentDocument {
  return parseComponentDocument(
    JSON.parse(readFileSync(resolve(componentRoot, `${name}.component.json`), "utf8"))
  );
}
