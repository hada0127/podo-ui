import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { selectThemeTokens } from "@podo/tokens";
import type { McpToolContext } from "../types.js";
import { fail, ok, textMatches, toTextResult } from "./shared.js";

export async function searchTokens(
  context: McpToolContext,
  input: { query: string; limit?: number | undefined }
): Promise<unknown> {
  const project = await context.load();
  const limit = input.limit ?? 20;
  const results = project.tokens
    .filter((token) => {
      const metadata = project.tokenMetadata[token.path];
      return textMatches(
        [
          token.path,
          token.type,
          token.value,
          token.rawValue,
          token.references.join(" "),
          metadata?.roles.join(" "),
          metadata?.description,
        ],
        input.query
      );
    })
    .slice(0, limit)
    .map((token) => ({
      path: token.path,
      type: token.type,
      value: token.value,
      references: token.references,
      origin: token.origin,
      roles: project.tokenMetadata[token.path]?.roles ?? [],
      description: project.tokenMetadata[token.path]?.description,
    }));
  return ok({ query: input.query, count: results.length, results });
}

export async function getToken(context: McpToolContext, input: { path: string }): Promise<unknown> {
  const project = await context.load();
  const themePath = baseThemePath(input.path, project.config?.themes.available);
  const token =
    project.tokens.find((item) => item.path === input.path) ??
    project.tokens.find(
      (item) => baseThemePath(item.path, project.config?.themes.available) === themePath
    );
  const themeValues = getThemeValues(project, themePath);
  if (!token && Object.keys(themeValues).length === 0) {
    return fail(`Token "${input.path}" was not found.`);
  }
  return ok({
    path: token?.path ?? input.path,
    type: token?.type,
    value: token?.value,
    rawValue: token?.rawValue,
    references: token?.references ?? [],
    origin: token?.origin,
    roles: token ? (project.tokenMetadata[token.path]?.roles ?? []) : [],
    description: token ? project.tokenMetadata[token.path]?.description : undefined,
    themeValues,
  });
}

function getThemeValues(
  project: Awaited<ReturnType<McpToolContext["load"]>>,
  path: string
): Record<string, Record<string, unknown>> {
  if (!project.tokenBundle) {
    return {};
  }
  const themes = project.config?.themes.available ?? ["landing", "dashboard", "custom"];
  const colorSchemes = project.config?.darkMode.enabled
    ? (["light", "dark"] as const)
    : (["light"] as const);
  const result: Record<string, Record<string, unknown>> = {};
  for (const theme of themes) {
    result[theme] = {};
    for (const colorScheme of colorSchemes) {
      const selected = selectThemeTokens(project.tokenBundle, { theme, colorScheme });
      const token = selected.tokens[path];
      if (token) {
        result[theme][colorScheme] = {
          value: token.value,
          rawValue: token.rawValue,
          references: token.references,
          origin: token.origin,
        };
      }
    }
    if (Object.keys(result[theme]).length === 0) {
      delete result[theme];
    }
  }
  return result;
}

function baseThemePath(path: string, themes = ["landing", "dashboard", "custom"]): string {
  const themeSegments = new Set(themes);
  const colorSchemeSegments = new Set(["light", "dark"]);
  return path
    .split(".")
    .filter((segment) => !themeSegments.has(segment) && !colorSchemeSegments.has(segment))
    .join(".");
}

export function registerTokenTools(server: McpServer, context: McpToolContext): void {
  server.tool(
    "search_tokens",
    "Search Podo tokens by path, type, value, or reference.",
    {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async (input) => toTextResult(await searchTokens(context, input))
  );
  server.tool(
    "get_token",
    "Return a token's raw value, resolved value, references, and origin metadata.",
    { path: z.string().min(1) },
    async (input) => toTextResult(await getToken(context, input))
  );
}
