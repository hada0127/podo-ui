import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpToolContext } from "../types.js";
import { ok, summarizeContext, toTextResult } from "./shared.js";

export async function getSystemOverview(context: McpToolContext): Promise<unknown> {
  const project = await context.load();
  return ok({
    ...summarizeContext(project),
    components: project.components.map((component) => ({
      id: component.id,
      name: component.name,
      category: component.category,
      status: component.status,
      targets: component.targets,
    })),
    iconGroups: project.icons.groups,
  });
}

export function registerOverviewTools(server: McpServer, context: McpToolContext): void {
  server.tool(
    "get_system_overview",
    "Return Podo project version, targets, themes, components, icon groups, and config summary.",
    {},
    async () => toTextResult(await getSystemOverview(context))
  );
}
