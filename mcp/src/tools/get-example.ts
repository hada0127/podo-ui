import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchExamples } from "../data-loader.js";

export function registerGetExample(server: McpServer): void {
  server.tool(
    "get_example",
    "Search podo-ui usage examples by pattern or keyword (e.g., 'form validation', 'dark theme', 'icon button')",
    {
      query: z.string().describe("Usage pattern to search"),
      framework: z
        .enum(["react", "svelte", "scss", "html"])
        .optional()
        .describe("Filter by framework"),
    },
    async ({ query, framework }) => {
      const results = searchExamples(query, framework);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No examples found for "${query}"${framework ? ` (${framework})` : ""}. Try broader keywords.`,
            },
          ],
        };
      }

      const text = results
        .map(
          (r) => `### ${r.source} — ${r.title}\n\`\`\`\n${r.code}\n\`\`\``
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${results.length} example(s) for "${query}":\n\n${text}`,
          },
        ],
      };
    }
  );
}
