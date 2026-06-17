import { describe, expect, it } from "vitest";
import { PODO_SCHEMA_VERSION } from "./shared.js";
import { parseComponentDocument, type ComponentDocument } from "./components.js";
import {
  collectPageComponentRefs,
  parsePageDocument,
  validatePageComponents,
  type PageDocument,
} from "./pages.js";

const button: ComponentDocument = parseComponentDocument({
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "component",
  id: "button",
  name: "Button",
  category: "atom",
  status: "stable",
  anatomy: [{ name: "root" }],
  slots: [{ name: "children", required: true }],
  targets: {
    web: { supported: true },
    react: { supported: true },
    hono: { supported: true },
    native: { supported: true },
  },
  accessibility: {},
});

const page: PageDocument = parsePageDocument({
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "page",
  id: "dashboard-home",
  name: "Dashboard Home",
  route: "/dashboard",
  root: {
    type: "layout",
    layout: { mode: "grid", gap: "{spacing.scale-2}", columns: 12 },
    children: [
      {
        type: "component-instance",
        id: "hero-cta",
        component: "button",
        props: { variant: "solid", size: "lg" },
        slots: { children: [{ type: "text", value: "Save" }] },
      },
    ],
  },
});

describe("pageDocumentSchema", () => {
  it("parses a recursive page node tree", () => {
    expect(page.root.type).toBe("layout");
    expect(collectPageComponentRefs(page)).toEqual(["button"]);
  });

  it("rejects raw (non-token) style values", () => {
    expect(() =>
      parsePageDocument({
        schemaVersion: PODO_SCHEMA_VERSION,
        kind: "page",
        id: "bad",
        name: "Bad",
        root: { type: "layout", layout: { mode: "flex", gap: "8px" }, children: [] },
      })
    ).toThrow();
  });

  it("accepts flex alignment fields and rejects invalid enum values", () => {
    const flexPage = {
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "page" as const,
      id: "flex",
      name: "Flex",
      root: {
        type: "layout" as const,
        layout: {
          mode: "flex" as const,
          direction: "row" as const,
          align: "center",
          justify: "space-between",
          wrap: true,
        },
        children: [],
      },
    };
    expect(() => parsePageDocument(flexPage)).not.toThrow();
    expect(() =>
      parsePageDocument({
        ...flexPage,
        root: { ...flexPage.root, layout: { mode: "flex", align: "bogus" } },
      })
    ).toThrow();
  });

  it("passes validation when every component instance resolves", () => {
    expect(validatePageComponents(page, [button])).toEqual([]);
  });

  it("flags a missing component reference", () => {
    const issues = validatePageComponents(page, []);
    expect(issues.some((item) => item.code === "page.component.missing")).toBe(true);
  });

  it("flags a slot fill that the component does not declare", () => {
    const withBadSlot = parsePageDocument({
      schemaVersion: PODO_SCHEMA_VERSION,
      kind: "page",
      id: "p",
      name: "P",
      root: {
        type: "component-instance",
        component: "button",
        slots: { nonexistent: [{ type: "text", value: "x" }] },
      },
    });
    const issues = validatePageComponents(withBadSlot, [button]);
    expect(issues.some((item) => item.code === "page.slot.unknown")).toBe(true);
  });
});
