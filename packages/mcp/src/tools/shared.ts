import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { McpProjectContext, ToolResponse } from "../types.js";

export function toTextResult(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
      },
    ],
  };
}

export function ok<T>(data: T): ToolResponse<T> {
  return { ok: true, data };
}

export function fail(message: string): ToolResponse {
  return { ok: false, message };
}

export function textMatches(parts: unknown[], query: string): boolean {
  const haystack = parts
    .filter((part) => part !== undefined && part !== null)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function summarizeContext(context: McpProjectContext): Record<string, unknown> {
  return {
    root: context.root,
    version: context.version,
    schemaVersion: context.schemaVersion,
    initialized: Boolean(context.config),
    config: context.config,
    themes: context.config?.themes,
    targets: context.config?.build.targets ?? [],
    tokenCount: context.tokens.length,
    componentCount: context.components.length,
    iconCount: Object.keys(context.icons.icons).length,
    issueCount: context.issues.length,
  };
}
