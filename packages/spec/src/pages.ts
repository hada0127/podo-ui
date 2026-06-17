import { z } from "zod";
import {
  aliasReferenceSchema,
  identifierSchema,
  issue,
  schemaVersionSchema,
  type ValidationIssue,
} from "./shared.js";
import type { ComponentDocument } from "./components.js";

/**
 * Page/layout spec (installed-project only). A page INSTANTIATES design-system
 * components and arranges them; it never redefines a component's API. Style
 * values are token references only (no raw hex/px). See report.md §8.
 */

export const pageBreakpointSchema = z.enum(["desktop", "tablet", "mobile"]);
export type PageBreakpoint = z.infer<typeof pageBreakpointSchema>;

export const pageOverrideLayerSchema = z.object({
  appliesWhen: z.object({
    breakpoint: pageBreakpointSchema.optional(),
    variant: z.string().min(1).optional(),
  }),
  props: z.record(z.string(), z.unknown()).optional(),
  style: z.record(z.string(), aliasReferenceSchema).optional(),
});
export type PageOverrideLayer = z.infer<typeof pageOverrideLayerSchema>;

export interface ComponentInstanceNode {
  type: "component-instance";
  id?: string | undefined;
  component: string;
  props: Record<string, unknown>;
  slots: Record<string, PageNode[]>;
  overrides: PageOverrideLayer[];
}

export interface LayoutNode {
  type: "layout";
  id?: string | undefined;
  layout: {
    mode: "flex" | "grid";
    direction?: "row" | "column" | undefined;
    gap?: string | undefined;
    padding?: string | undefined;
    columns?: number | undefined;
    // Flex alignment. `align` maps to CSS align-items (counter axis); `justify`
    // maps to CSS justify-content (primary axis). Token-free enums keep codegen a
    // direct passthrough. Optional so existing layout nodes serialize unchanged.
    align?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
    justify?: "start" | "center" | "end" | "space-between" | "space-around" | undefined;
    wrap?: boolean | undefined;
  };
  children: PageNode[];
}

export interface TextNode {
  type: "text";
  id?: string | undefined;
  value: string;
}

export type PageNode = ComponentInstanceNode | LayoutNode | TextNode;

const componentInstanceNodeSchema = z.object({
  type: z.literal("component-instance"),
  id: identifierSchema.optional(),
  component: identifierSchema,
  props: z.record(z.string(), z.unknown()).default({}),
  slots: z.record(z.string(), z.array(z.lazy(() => pageNodeSchema))).default({}),
  overrides: z.array(pageOverrideLayerSchema).default([]),
});

const layoutNodeSchema = z.object({
  type: z.literal("layout"),
  id: identifierSchema.optional(),
  layout: z.object({
    mode: z.enum(["flex", "grid"]),
    direction: z.enum(["row", "column"]).optional(),
    gap: aliasReferenceSchema.optional(),
    padding: aliasReferenceSchema.optional(),
    columns: z.number().int().positive().optional(),
    align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
    justify: z.enum(["start", "center", "end", "space-between", "space-around"]).optional(),
    wrap: z.boolean().optional(),
  }),
  children: z.array(z.lazy(() => pageNodeSchema)).default([]),
});

const textNodeSchema = z.object({
  type: z.literal("text"),
  id: identifierSchema.optional(),
  value: z.string(),
});

// Recursive schema: annotate only the top-level lazy so the discriminated union
// members keep their discriminable typing.
export const pageNodeSchema: z.ZodType<PageNode> = z.lazy(() =>
  z.discriminatedUnion("type", [componentInstanceNodeSchema, layoutNodeSchema, textNodeSchema])
);

export const pageFramesSchema = z.object({
  desktop: z
    .object({ width: z.number().positive(), columns: z.number().int().positive() })
    .optional(),
  tablet: z
    .object({ width: z.number().positive(), columns: z.number().int().positive() })
    .optional(),
  mobile: z
    .object({ width: z.number().positive(), columns: z.number().int().positive() })
    .optional(),
});

export const pageDocumentSchema = z.object({
  schemaVersion: schemaVersionSchema,
  kind: z.literal("page"),
  id: identifierSchema,
  name: z.string().min(1),
  route: z.string().optional(),
  frames: pageFramesSchema.optional(),
  root: pageNodeSchema,
});
export type PageDocument = z.infer<typeof pageDocumentSchema>;

export function parsePageDocument(input: unknown): PageDocument {
  return pageDocumentSchema.parse(input);
}

/** Depth-first walk over a page node tree. */
export function walkPageNodes(node: PageNode, visit: (node: PageNode) => void): void {
  visit(node);
  if (node.type === "layout") {
    for (const child of node.children) {
      walkPageNodes(child, visit);
    }
  } else if (node.type === "component-instance") {
    for (const fill of Object.values(node.slots)) {
      for (const child of fill) {
        walkPageNodes(child, visit);
      }
    }
  }
}

/** Every component id a page instantiates. */
export function collectPageComponentRefs(page: PageDocument): string[] {
  const refs: string[] = [];
  walkPageNodes(page.root, (node) => {
    if (node.type === "component-instance") {
      refs.push(node.component);
    }
  });
  return refs;
}

/**
 * Validate a page against the available components: every instantiated component
 * must exist, and every slot fill must target a slot the component declares.
 */
export function validatePageComponents(
  page: PageDocument,
  components: Iterable<ComponentDocument>
): ValidationIssue[] {
  const byId = new Map<string, ComponentDocument>();
  for (const component of components) {
    byId.set(component.id, component);
  }
  const issues: ValidationIssue[] = [];
  walkPageNodes(page.root, (node) => {
    if (node.type !== "component-instance") {
      return;
    }
    const where = `${page.id}.${node.id ?? node.component}`;
    const component = byId.get(node.component);
    if (!component) {
      issues.push(
        issue(
          "page.component.missing",
          where,
          `Page "${page.id}" references missing component "${node.component}".`
        )
      );
      return;
    }
    const slotNames = new Set(component.slots.map((slot) => slot.name));
    for (const slotName of Object.keys(node.slots)) {
      if (!slotNames.has(slotName)) {
        issues.push(
          issue(
            "page.slot.unknown",
            `${where}.${slotName}`,
            `Page "${page.id}" fills unknown slot "${slotName}" on component "${node.component}".`
          )
        );
      }
    }
  });
  return issues;
}
