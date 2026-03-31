import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAllComponents } from "../data-loader.js";

export function registerSearchComponent(server: McpServer): void {
  server.tool(
    "search_component",
    "Search podo-ui components by name or keyword. Returns matching components with name, category, and description.",
    { query: z.string().describe("Component name or keyword (e.g., 'input', 'form', 'validation', 'date')") },
    async ({ query }) => {
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      const comps = getAllComponents();

      const scored = comps
        .map((comp) => {
          let score = 0;
          const name = comp.name.toLowerCase();
          const desc = comp.description.toLowerCase();
          const cat = comp.category.toLowerCase();
          const related = comp.related.join(" ").toLowerCase();

          for (const token of tokens) {
            if (name === token) score += 10;
            else if (name.includes(token)) score += 5;
            if (desc.includes(token)) score += 3;
            if (cat.includes(token)) score += 2;
            if (related.includes(token)) score += 2;
          }

          return { comp, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No components found for "${query}". Available: ${comps.map((c) => c.name).join(", ")}`,
            },
          ],
        };
      }

      const text = scored
        .map(
          (r) =>
            `- **${r.comp.name}** (${r.comp.category}): ${r.comp.description}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${scored.length} component(s) for "${query}":\n\n${text}\n\nUse get_component for details.`,
          },
        ],
      };
    }
  );
}
