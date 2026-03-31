import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchCssClasses } from "../data-loader.js";

export function registerSearchCssClass(server: McpServer): void {
  server.tool(
    "search_css_class",
    "Search podo-ui CSS class names to find which component or system defines them (e.g., 'has-error' → Field component)",
    { className: z.string().describe("CSS class name to search (e.g., 'has-error', 'fill', 'p-5')") },
    async ({ className }) => {
      const results = searchCssClasses(className);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No CSS class matching "${className}" found in any component or system.`,
            },
          ],
        };
      }

      const text = results
        .map(
          (r) =>
            `- **${r.sourceName}** (${r.sourceType}): \`${r.class}\` — ${r.description}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} match(es) for "${className}":\n\n${text}`,
          },
        ],
      };
    }
  );
}
