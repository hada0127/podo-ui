import type { ComponentDocument, TokenDocument } from "@podo/spec";
import {
  type EditContext,
  type EditorCapabilities,
  type PodoSaveAdapter,
  type SaveOptions,
  type SaveResult,
  type SaveTokenInput,
} from "./adapter.js";
import { normalizeEditorTokenDocuments, upsertTokenInDocuments } from "./spec-editing.js";
import { validateWorkspace } from "./validation.js";

export interface InMemoryAdapterInit {
  tokenDocuments?: TokenDocument[];
  components?: ComponentDocument[];
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
  const capabilities: EditorCapabilities = { ...DEFAULT_CAPABILITIES, ...init.capabilities };

  return {
    async loadContext(): Promise<EditContext> {
      return { tokenDocuments, components, capabilities };
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
    async saveComponent(component: ComponentDocument, options: SaveOptions = {}): Promise<SaveResult> {
      if (options.dryRun) {
        return { ok: true, dryRun: true, path: `${component.id}.component.json` };
      }
      components = components.some((item) => item.id === component.id)
        ? components.map((item) => (item.id === component.id ? component : item))
        : [...components, component];
      return { ok: true, path: `${component.id}.component.json` };
    },
    async validate() {
      return validateWorkspace({ tokenDocuments, components });
    },
  };
}
