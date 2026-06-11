import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpToolContext } from "../types.js";
import { registerComponentTools } from "./components.js";
import { registerOverviewTools } from "./overview.js";
import { registerSuggestTools } from "./suggest.js";
import { registerTokenTools } from "./tokens.js";
import { registerValidationTools } from "./validation.js";

export { getComponentExample, getComponentSpec, searchComponents } from "./components.js";
export { getSystemOverview } from "./overview.js";
export { suggestComponentSpec } from "./suggest.js";
export { getToken, searchTokens } from "./tokens.js";
export { explainMigration, validatePodoProject } from "./validation.js";

export function registerPodoTools(server: McpServer, context: McpToolContext): void {
  registerOverviewTools(server, context);
  registerTokenTools(server, context);
  registerComponentTools(server, context);
  registerValidationTools(server, context);
  registerSuggestTools(server, context);
}
