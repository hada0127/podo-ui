import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PODO_SCHEMA_VERSION, parseComponentDocument, type ComponentDocument } from "@podo/spec";
import type { ComponentSuggestionInput, McpToolContext } from "../types.js";
import { ok, toTextResult } from "./shared.js";

export async function suggestComponentSpec(
  _context: McpToolContext,
  input: ComponentSuggestionInput
): Promise<unknown> {
  const id = normalizeId(input.id);
  const props = (input.props ?? []).map((name) => ({
    name: normalizePropName(name),
    type: { kind: "string" as const },
    required: false,
  }));
  const slots = (input.slots ?? ["children"]).map((name) => ({
    name: normalizePropName(name),
    required: name === "children",
    repeated: false,
  }));
  const document = parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id,
    name: input.name ?? titleCase(id),
    category: input.category ?? "molecule",
    status: "draft",
    description: `Draft component spec for ${input.name ?? titleCase(id)}.`,
    anatomy: [{ name: "root" }, { name: "content" }],
    slots,
    props,
    variants: [{ name: "variant", values: ["default"], default: "default" }],
    states: [{ name: "disabled" }, { name: "focusVisible" }],
    tokens: {
      "root.background": "{color.inverse}",
      "content.color": "{semantic.color.text.default}",
    },
    targets: supportedTargets(),
    accessibility: { aria: ["aria-label"], keyboard: ["Tab"] },
    examples: [],
  });
  return ok({
    dryRun: true,
    writes: [],
    component: document,
    policy:
      "suggest_component_spec never writes files. Use a future write_* tool with dry-run and validation.",
  });
}

export function registerSuggestTools(server: McpServer, context: McpToolContext): void {
  server.tool(
    "suggest_component_spec",
    "Return a draft component spec without writing files.",
    {
      id: z.string().min(1),
      name: z.string().min(1).optional(),
      category: z
        .enum(["atom", "molecule", "organism", "template", "layout", "utility"])
        .optional(),
      slots: z.array(z.string().min(1)).optional(),
      props: z.array(z.string().min(1)).optional(),
    },
    async (input) => toTextResult(await suggestComponentSpec(context, input))
  );
}

function normalizeId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePropName(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
    .replace(/^[^a-z]+/i, "");
  return normalized.charAt(0).toLowerCase() + normalized.slice(1);
}

function titleCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function supportedTargets(): ComponentDocument["targets"] {
  return {
    web: { supported: true, limitations: [] },
    react: { supported: true, limitations: [] },
    hono: { supported: true, limitations: [] },
    native: { supported: true, limitations: [] },
  };
}
