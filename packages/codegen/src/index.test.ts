import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseComponentDocument, type ComponentDocument } from "@podo/spec";
import {
  assertIdempotent,
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
});

function loadComponents(): ComponentDocument[] {
  return ["button", "input", "field"].map((name) =>
    parseComponentDocument(
      JSON.parse(readFileSync(resolve(componentRoot, `${name}.component.json`), "utf8"))
    )
  );
}
