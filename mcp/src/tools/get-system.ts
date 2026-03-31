import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSystem, getAllSystems } from "../data-loader.js";

export function registerGetSystem(server: McpServer): void {
  server.tool(
    "get_system",
    "Get podo-ui SCSS system details: color tokens, spacing scale, typography, grid, icons, or button styles",
    {
      name: z
        .enum(["color", "spacing", "typography", "grid", "icon", "button"])
        .describe("System name"),
    },
    async ({ name }) => {
      const sys = getSystem(name);
      if (!sys) {
        const all = getAllSystems().map((s) => s.name);
        return {
          content: [
            {
              type: "text",
              text: `System "${name}" not found.\nAvailable: ${all.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(sys, null, 2) }],
      };
    }
  );
}
