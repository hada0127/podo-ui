import { describe, expect, it } from "vitest";
import { parseComponentDocument, parseTokenDocument, PODO_SCHEMA_VERSION } from "@podo/spec";
import {
  collectTokenUsages,
  renameTokenGroupInDocuments,
  rewriteTokenReferences,
} from "./token-usage.js";
import { flattenTokenDocuments } from "@podo/edit-core";

function tokenDoc() {
  return parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens: {
      color: {
        primary: {
          base: { $type: "color", $value: "#7c3aed" },
          hover: { $type: "color", $value: "{color.primary.base}" },
        },
        accent: { base: { $type: "color", $value: "#0ea5e9" } },
      },
      component: {
        button: { background: { $type: "color", $value: "{color.primary.base}" } },
      },
    },
  });
}

function buttonComponent() {
  return parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    description: "Button",
    anatomy: [{ name: "root" }],
    slots: [],
    props: [],
    variants: [],
    states: [],
    tokens: { "root.color": "{color.primary.base}", "root.border": "{color.accent.base}" },
    targets: {
      web: { supported: true, limitations: [] },
      react: { supported: true, limitations: [] },
      hono: { supported: true, limitations: [] },
      native: { supported: true, limitations: [] },
    },
    accessibility: { aria: [], keyboard: [] },
    examples: [{ target: "react", title: "Button", code: "<Button />" }],
  });
}

describe("collectTokenUsages", () => {
  it("finds token aliases and component bindings that reference a color", () => {
    const usages = collectTokenUsages({
      targets: ["color.primary.base"],
      documents: [tokenDoc()],
      components: [buttonComponent()],
    });
    const owners = usages.map((usage) => `${usage.source}:${usage.ownerId}.${usage.field}`).sort();
    expect(owners).toEqual([
      "component:button.root.color",
      "token:color.primary.hover.$value",
      "token:component.button.background.$value",
    ]);
  });

  it("excludes owners that are themselves being deleted", () => {
    // Deleting the whole primary group: its internal hover→base alias must not
    // count as external usage.
    const usages = collectTokenUsages({
      targets: ["color.primary.base"],
      documents: [tokenDoc()],
      components: [],
      excludeOwners: ["color.primary.base", "color.primary.hover"],
    });
    expect(usages).toEqual([
      {
        source: "token",
        ownerId: "component.button.background",
        field: "$value",
        reference: "color.primary.base",
      },
    ]);
  });
});

describe("renameTokenGroupInDocuments", () => {
  it("renames a color set in place, keeping its position among siblings", () => {
    const [renamed] = renameTokenGroupInDocuments({
      documents: [tokenDoc()],
      fromPath: "color.primary",
      toPath: "color.brand",
    });
    const colorGroups = Object.keys((renamed?.tokens as { color: Record<string, unknown> }).color);
    // `primary` was first, `accent` second — after rename `brand` stays first.
    expect(colorGroups).toEqual(["brand", "accent"]);
    const paths = flattenTokenDocuments(renamed ? [renamed] : []).map((record) => record.path);
    expect(paths).toContain("color.brand.base");
    expect(paths).toContain("color.brand.hover");
    expect(paths).not.toContain("color.primary.base");
  });
});

describe("rewriteTokenReferences", () => {
  it("repoints references to the replacement across tokens and components", () => {
    const { documents, components } = rewriteTokenReferences({
      mapping: new Map([["color.primary.base", "color.accent.base"]]),
      documents: [tokenDoc()],
      components: [buttonComponent()],
    });
    const remaining = collectTokenUsages({
      targets: ["color.primary.base"],
      documents,
      components,
      excludeOwners: ["color.primary.base", "color.primary.hover"],
    });
    expect(remaining).toEqual([]);
    expect(components[0]?.tokens?.["root.color"]).toBe("{color.accent.base}");
    // A longer sibling path is never partially matched.
    expect(JSON.stringify(documents)).not.toContain("color.accent.baseline");
  });

  it("finds and repoints spacing references inside canvas node layout fields", () => {
    const nodes = [{ id: "n1", layout: { gap: "{spacing.scale.5}", padding: "" } }];
    const usages = collectTokenUsages({
      targets: ["spacing.scale.5"],
      documents: [tokenDoc()],
      components: [],
      nodes,
    });
    expect(usages).toEqual([
      { source: "node", ownerId: "n1", field: "layout", reference: "spacing.scale.5" },
    ]);
    const rewritten = rewriteTokenReferences({
      mapping: new Map([["spacing.scale.5", "spacing.scale.4"]]),
      documents: [tokenDoc()],
      components: [],
      nodes,
    });
    expect((rewritten.nodes[0] as { layout: { gap: string } }).layout.gap).toBe(
      "{spacing.scale.4}"
    );
  });
});
