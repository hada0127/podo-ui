import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  parseComponentDocument,
  parseTokenDocument,
  type ComponentDocument,
  type TokenDocument,
} from "@podo/spec";
import {
  type EditContext,
  type EditorCapabilities,
  type PodoSaveAdapter,
  type SaveOptions,
  type SaveResult,
  type SaveTokenInput,
} from "./adapter.js";
import { upsertTokenInDocuments } from "./spec-editing.js";
import { validateWorkspace } from "./validation.js";

export interface RepoFsAdapterOptions {
  /** Directory holding design-system token documents (repo specs). */
  tokensDir: string;
  /** Directory holding design-system component documents (repo specs). */
  componentsDir: string;
  /** File written by the bulk token save. Defaults to "editor.tokens.json". */
  tokensFileName?: string;
  capabilities?: Partial<EditorCapabilities>;
}

// Context A (in-repo development) edits tokens and components only — no page design.
const DEFAULT_CAPABILITIES: EditorCapabilities = {
  pageDesign: false,
  writeMode: "repo",
  iconEditing: true,
};

async function readJsonFiles(dir: string, suffix: string): Promise<unknown[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  );
  const ordered = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const files = await Promise.all(
    ordered.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return readJsonFiles(entryPath, suffix);
      }
      if (!entry.isFile() || !entry.name.endsWith(suffix)) {
        return [];
      }
      try {
        return [JSON.parse(await readFile(entryPath, "utf8")) as unknown];
      } catch {
        // Skip malformed JSON so one bad file does not abort the whole load.
        return [];
      }
    })
  );
  return files.flat();
}

async function writeJson(filePath: string, value: unknown, dryRun: boolean): Promise<SaveResult> {
  const contents = `${JSON.stringify(value, null, 2)}\n`;
  const previous = await readFile(filePath, "utf8").catch(() => undefined);
  const changed = previous !== contents;
  if (dryRun) {
    return { ok: true, dryRun: true, path: filePath };
  }
  if (changed) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }
  return { ok: true, path: filePath };
}

/**
 * Node {@link PodoSaveAdapter} for the in-repo development editor (Context A).
 * Persists token/component edits to design-system repo spec files. Node-only:
 * lives in the `@podo/edit-core/node` subpath so the browser-safe main entry
 * carries no `node:` imports. Supports dry-run for safe writes (AGENTS.md).
 * See report.md §5.3.
 */
export function createRepoFsAdapter(options: RepoFsAdapterOptions): PodoSaveAdapter {
  const tokensFileName = options.tokensFileName ?? "editor.tokens.json";
  const capabilities: EditorCapabilities = { ...DEFAULT_CAPABILITIES, ...options.capabilities };

  async function loadTokenDocuments(): Promise<TokenDocument[]> {
    const records = await readJsonFiles(options.tokensDir, ".json");
    const documents: TokenDocument[] = [];
    for (const record of records) {
      try {
        documents.push(parseTokenDocument(record));
      } catch {
        // Skip invalid files; the validation gate surfaces them on load.
      }
    }
    return documents;
  }

  async function loadContextImpl(): Promise<EditContext> {
    const tokenDocuments = await loadTokenDocuments();
    const componentRecords = await readJsonFiles(options.componentsDir, ".component.json");
    const components: ComponentDocument[] = [];
    for (const record of componentRecords) {
      try {
        components.push(parseComponentDocument(record));
      } catch {
        // Skip invalid component files.
      }
    }
    return { tokenDocuments, components, capabilities };
  }

  return {
    loadContext: loadContextImpl,
    async saveToken(input: SaveTokenInput): Promise<SaveResult> {
      // Upsert into the canonical editor token file ONLY (never the first of all
      // token files, which could overwrite an unrelated source document).
      const filePath = join(options.tokensDir, tokensFileName);
      const existing = await readFile(filePath, "utf8").catch(() => undefined);
      let baseDocuments: TokenDocument[] = [];
      if (existing) {
        try {
          baseDocuments = [parseTokenDocument(JSON.parse(existing))];
        } catch {
          baseDocuments = [];
        }
      }
      const next = upsertTokenInDocuments(baseDocuments, {
        path: input.path,
        type: input.type,
        valueText: input.value,
      });
      return writeJson(filePath, next[0], Boolean(input.dryRun));
    },
    async saveTokenDocuments(
      documents: TokenDocument[],
      opts: SaveOptions = {}
    ): Promise<SaveResult> {
      for (let index = 0; index < documents.length; index += 1) {
        const name = documents.length === 1 ? tokensFileName : `editor-${index}.tokens.json`;
        const result = await writeJson(
          join(options.tokensDir, name),
          documents[index],
          Boolean(opts.dryRun)
        );
        if (!result.ok) {
          return result;
        }
      }
      return { ok: true, ...(opts.dryRun ? { dryRun: true } : {}) };
    },
    async saveComponent(component: ComponentDocument, opts: SaveOptions = {}): Promise<SaveResult> {
      const filePath = join(options.componentsDir, `${component.id}.component.json`);
      return writeJson(filePath, component, Boolean(opts.dryRun));
    },
    async validate() {
      const context = await loadContextImpl();
      return validateWorkspace({
        tokenDocuments: context.tokenDocuments,
        components: context.components,
      });
    },
  };
}
