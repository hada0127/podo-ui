import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ComponentDocument } from "@podo/spec";
import type { McpToolContext } from "../types.js";
import { fail, ok, textMatches, toTextResult } from "./shared.js";

export async function searchComponents(
  context: McpToolContext,
  input: {
    query: string;
    target?: keyof ComponentDocument["targets"] | undefined;
    limit?: number | undefined;
  }
): Promise<unknown> {
  const project = await context.load();
  const limit = input.limit ?? 20;
  const results = project.components
    .filter((component) => {
      const targetMatches = input.target ? component.targets[input.target].supported : true;
      return (
        targetMatches &&
        textMatches(
          [
            component.id,
            component.name,
            component.category,
            component.description,
            component.props.map((prop) => prop.name).join(" "),
            component.slots.map((slot) => slot.name).join(" "),
          ],
          input.query
        )
      );
    })
    .slice(0, limit)
    .map((component) => ({
      id: component.id,
      name: component.name,
      category: component.category,
      status: component.status,
      description: component.description,
      props: component.props,
      slots: component.slots,
      targets: component.targets,
    }));
  return ok({ query: input.query, count: results.length, results });
}

export async function getComponentSpec(
  context: McpToolContext,
  input: { id: string }
): Promise<unknown> {
  const component = await findComponent(context, input.id);
  return component ? ok(component) : fail(`Component "${input.id}" was not found.`);
}

export async function getComponentExample(
  context: McpToolContext,
  input: { id: string; target?: ComponentDocument["examples"][number]["target"] | undefined }
): Promise<unknown> {
  const component = await findComponent(context, input.id);
  if (!component) {
    return fail(`Component "${input.id}" was not found.`);
  }
  const examples = input.target
    ? component.examples.filter((example) => example.target === input.target)
    : component.examples;
  return ok({ id: component.id, target: input.target, examples });
}

export function registerComponentTools(server: McpServer, context: McpToolContext): void {
  server.tool(
    "search_components",
    "Search Podo components by name, category, slot, prop, or target.",
    {
      query: z.string().min(1),
      target: z.enum(["web", "react", "hono", "native"]).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => toTextResult(await searchComponents(context, input))
  );
  server.tool(
    "get_component_spec",
    "Return a component JSON spec by id.",
    { id: z.string().min(1) },
    async (input) => toTextResult(await getComponentSpec(context, input))
  );
  server.tool(
    "get_component_example",
    "Return target-specific component usage examples.",
    {
      id: z.string().min(1),
      target: z.enum(["web", "react", "hono", "native"]).optional(),
    },
    async (input) => toTextResult(await getComponentExample(context, input))
  );
}

async function findComponent(
  context: McpToolContext,
  id: string
): Promise<ComponentDocument | undefined> {
  const project = await context.load();
  const normalized = id.toLowerCase();
  return project.components.find(
    (component) =>
      component.id.toLowerCase() === normalized || component.name.toLowerCase() === normalized
  );
}
