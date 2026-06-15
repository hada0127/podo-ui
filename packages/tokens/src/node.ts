import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { parseTokenDocument } from "@podo/spec";
import type { LoadTokenDocumentsOptions, TokenSource, TokenSourceTier } from "./index.js";

/**
 * Node-only token file loading. Kept in a separate entry (`@podo/tokens/node`)
 * so the browser-safe `@podo/tokens` main entry carries no `node:` imports and
 * can be bundled into the editor UI. See report.md §5 / §12.
 */
export async function loadTokenDocument(
  filePath: string,
  tier: TokenSourceTier = "package"
): Promise<TokenSource> {
  const document = parseTokenDocument(JSON.parse(await readFile(filePath, "utf8")));
  return { document, filePath, tier };
}

export async function loadTokenDocuments(
  options: LoadTokenDocumentsOptions
): Promise<TokenSource[]> {
  const packageFiles = await findJsonFiles(options.packageTokensDir);
  const projectFiles = options.projectTokensDir
    ? await findJsonFiles(options.projectTokensDir)
    : [];

  const sources = await Promise.all([
    ...packageFiles.map((filePath) => loadTokenDocument(filePath, "package")),
    ...projectFiles.map((filePath) => loadTokenDocument(filePath, "project")),
  ]);

  return sources.sort((a, b) => sourceSortKey(a, options).localeCompare(sourceSortKey(b, options)));
}

async function findJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  );

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return findJsonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    })
  );

  return files.flat().sort();
}

function sourceSortKey(source: TokenSource, options: LoadTokenDocumentsOptions): string {
  const baseDir =
    source.tier === "package" ? options.packageTokensDir : (options.projectTokensDir ?? "");
  const tierOrder = source.tier === "package" ? "0" : "1";
  return `${tierOrder}:${relative(baseDir, source.filePath)}`;
}
