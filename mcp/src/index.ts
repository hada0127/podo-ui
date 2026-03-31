#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadData } from "./data-loader.js";
import { registerGetOverview } from "./tools/get-overview.js";
import { registerSearchComponent } from "./tools/search-component.js";
import { registerGetComponent } from "./tools/get-component.js";
import { registerGetSystem } from "./tools/get-system.js";
import { registerSearchCssClass } from "./tools/search-css-class.js";
import { registerGetExample } from "./tools/get-example.js";

loadData();

const server = new McpServer({
  name: "podo-ui-mcp",
  version: "1.0.0",
});

registerGetOverview(server);
registerSearchComponent(server);
registerGetComponent(server);
registerGetSystem(server);
registerSearchCssClass(server);
registerGetExample(server);

const transport = new StdioServerTransport();
await server.connect(transport);
