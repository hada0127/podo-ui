import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getIndex, getOverviewData, getAllComponents } from "../data-loader.js";

export function registerGetOverview(server: McpServer): void {
  server.tool(
    "get_overview",
    "Get podo-ui overview: version, component list, installation, import methods, themes, and tech stack",
    {},
    async () => {
      const idx = getIndex();
      const ov = getOverviewData();
      const comps = getAllComponents();

      const atoms = comps
        .filter((c) => c.category === "atom")
        .map((c) => c.name);
      const molecules = comps
        .filter((c) => c.category === "molecule")
        .map((c) => c.name);

      const text = `# podo-ui v${idx.version}
${ov.tagline}

## Philosophy
${ov.philosophy.core} — ${ov.philosophy.principle}

## Components (${comps.length})
**Atoms (${atoms.length}):** ${atoms.join(", ")}
**Molecules (${molecules.length}):** ${molecules.join(", ")}

## Installation
${Object.entries(ov.installation)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}

## Imports
${Object.entries(ov.imports)
  .map(
    ([framework, methods]) =>
      `**${framework}:**\n${Object.entries(methods)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n")}`
  )
  .join("\n")}

## Themes
${Object.entries(ov.themes)
  .map(
    ([group, modes]) =>
      `**${group}:** ${Object.entries(modes)
        .map(([k, v]) => `${k} → ${v}`)
        .join(", ")}`
  )
  .join("\n")}

## Breakpoints
${Object.entries(ov.breakpoints)
  .map(([k, v]) => `${k}: ${v}`)
  .join("\n")}

## Systems
color, spacing, typography, grid, icon, button
Use get_system tool for details.`;

      return { content: [{ type: "text", text }] };
    }
  );
}
