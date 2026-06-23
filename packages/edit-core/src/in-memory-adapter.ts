import type { ComponentDocument, IconManifest, PageDocument, TokenDocument } from "@podo/spec";
import {
  type EditContext,
  type EditorCapabilities,
  type PodoSaveAdapter,
  type SaveOptions,
  type SaveResult,
  type SaveTokenInput,
} from "./adapter.js";
import {
  deleteTokenFromDocuments,
  normalizeEditorTokenDocuments,
  upsertTokenInDocuments,
} from "./spec-editing.js";
import { validateWorkspace } from "./validation.js";

export interface InMemoryAdapterInit {
  tokenDocuments?: TokenDocument[];
  components?: ComponentDocument[];
  pages?: PageDocument[];
  iconManifest?: IconManifest;
  capabilities?: Partial<EditorCapabilities>;
}

const DEFAULT_CAPABILITIES: EditorCapabilities = {
  pageDesign: false,
  writeMode: "overrides",
  iconEditing: false,
};

/**
 * A non-persisting adapter that keeps edits in memory. Used by the dev app and
 * by tests so the editing engine runs without a filesystem or HTTP host.
 */
export function createInMemoryAdapter(init: InMemoryAdapterInit = {}): PodoSaveAdapter {
  let tokenDocuments = normalizeEditorTokenDocuments(init.tokenDocuments ?? []);
  let components = init.components ? [...init.components] : [];
  let pages = init.pages ? [...init.pages] : [];
  let iconManifest = init.iconManifest;
  const capabilities: EditorCapabilities = { ...DEFAULT_CAPABILITIES, ...init.capabilities };

  return {
    async loadContext(): Promise<EditContext> {
      // iconManifest is conditionally spread so the key is omitted (not set to
      // undefined) when no manifest exists — required by exactOptionalPropertyTypes.
      return {
        tokenDocuments,
        components,
        pages,
        capabilities,
        ...(iconManifest ? { iconManifest } : {}),
      };
    },
    async saveToken(input: SaveTokenInput): Promise<SaveResult> {
      if (input.dryRun) {
        return { ok: true, dryRun: true, path: input.path };
      }
      tokenDocuments = upsertTokenInDocuments(tokenDocuments, {
        path: input.path,
        type: input.type,
        valueText: input.value,
      });
      return { ok: true, path: input.path };
    },
    async saveTokenDocuments(documents, options = {}): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true };
      }
      tokenDocuments = normalizeEditorTokenDocuments(documents);
      return { ok: true };
    },
    async deleteToken(documentIndex, path, options = {}): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true, path };
      }
      tokenDocuments = deleteTokenFromDocuments(tokenDocuments, documentIndex, path);
      return { ok: true, path };
    },
    async saveComponent(
      component: ComponentDocument,
      options: SaveOptions = {}
    ): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true, path: `${component.id}.component.json` };
      }
      components = components.some((item) => item.id === component.id)
        ? components.map((item) => (item.id === component.id ? component : item))
        : [...components, component];
      return { ok: true, path: `${component.id}.component.json` };
    },
    async savePage(page: PageDocument, options: SaveOptions = {}): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true, path: `${page.id}.page.json` };
      }
      pages = pages.some((item) => item.id === page.id)
        ? pages.map((item) => (item.id === page.id ? page : item))
        : [...pages, page];
      return { ok: true, path: `${page.id}.page.json` };
    },
    async saveIconManifest(manifest: IconManifest, options: SaveOptions = {}): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true, path: "icons.manifest.json" };
      }
      iconManifest = manifest;
      return { ok: true, path: "icons.manifest.json" };
    },
    async validate() {
      return validateWorkspace({ tokenDocuments, components });
    },
  };
}
