import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getComponent, getAllComponents } from "../data-loader.js";

export function registerGetComponent(server: McpServer): void {
  server.tool(
    "get_component",
    "Get detailed info about a podo-ui component: props, CSS classes, usage examples, and related components",
    { name: z.string().describe("Component name (e.g., 'Input', 'field', 'checkbox-radio')") },
    async ({ name }) => {
      const comp = getComponent(name);
      if (!comp) {
        const all = getAllComponents().map((c) => c.name);
        return {
          content: [
            {
              type: "text",
              text: `Component "${name}" not found.\nAvailable: ${all.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(comp, null, 2) }],
      };
    }
  );
}
