import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpToolContext } from "../types.js";
import { ok, toTextResult } from "./shared.js";

export async function validatePodoProject(context: McpToolContext): Promise<unknown> {
  const project = await context.load();
  return {
    ok: project.issues.length === 0,
    issues: project.issues,
    summary: {
      tokenCount: project.tokens.length,
      componentCount: project.components.length,
      iconCount: Object.keys(project.icons.icons).length,
    },
  };
}

export async function explainMigration(context: McpToolContext): Promise<unknown> {
  const project = await context.load();
  const schemaMismatch = project.issues.find((issue) => issue.code === "podo.lock.schemaMismatch");
  return ok({
    currentSchema: project.lock?.schemaVersion ?? "missing",
    expectedSchema: project.schemaVersion,
    migrationState: project.lock?.migrations ?? [],
    required: Boolean(schemaMismatch),
    notes: schemaMismatch
      ? [schemaMismatch.message, "Run podo migrate after reviewing .podo overrides."]
      : ["No schema migration is currently required."],
  });
}

export function registerValidationTools(server: McpServer, context: McpToolContext): void {
  server.tool(
    "validate_podo_project",
    "Validate .podo config, tokens, themes, components, and icons.",
    {},
    async () => toTextResult(await validatePodoProject(context))
  );
  server.tool(
    "explain_migration",
    "Explain schema migration state and possible update risks.",
    {},
    async () => toTextResult(await explainMigration(context))
  );
}
