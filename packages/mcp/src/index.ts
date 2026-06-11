#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { loadMcpProject } from "./data-loader.js";
import { registerPodoTools } from "./tools/index.js";

export const packageName = "@podo/mcp";

export interface McpServerOptions {
  root?: string;
}

export function createPodoMcpServer(options: McpServerOptions = {}): McpServer {
  const root = options.root ? resolve(options.root) : process.cwd();
  const server = new McpServer({
    name: "podo-v2-mcp",
    version: "0.0.0",
  });
  registerPodoTools(server, { load: () => loadMcpProject(root) });
  return server;
}

export async function startMcpServer(options: McpServerOptions = {}): Promise<void> {
  const server = createPodoMcpServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await startMcpServer();
}

export * from "./data-loader.js";
export * from "./tools/index.js";
export * from "./types.js";
