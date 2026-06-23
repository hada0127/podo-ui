import { PodoEditError } from "@podo/spec";
import type { ComponentDocument, TokenDocument, ValidationIssue } from "@podo/spec";
import {
  deleteComponentProp,
  deleteComponentVariant,
  deleteTokenFromDocuments,
  moveTokenInDocuments,
  normalizeEditorTokenDocuments,
  updateComponentMeta,
  upsertComponentProp,
  upsertComponentVariant,
  upsertTokenInDocuments,
  type EditorTokenDraft,
} from "./spec-editing.js";
import { EditValidationError, blockingIssues, validateWorkspace } from "./validation.js";

export interface EditWorkspaceState {
  tokenDocuments: TokenDocument[];
  components: ComponentDocument[];
  issues: ValidationIssue[];
  canUndo: boolean;
  canRedo: boolean;
}

interface WorkspaceDocs {
  tokenDocuments: TokenDocument[];
  components: ComponentDocument[];
}

export interface EditStoreInit {
  tokenDocuments?: TokenDocument[];
  components?: ComponentDocument[];
  /** Maximum undo depth retained. Defaults to 100. */
  historyLimit?: number;
}

type ComponentVariantInput = Parameters<typeof upsertComponentVariant>[1];
type ComponentMetaInput = Parameters<typeof updateComponentMeta>[1];

/**
 * Framework-neutral reactive editing store. Every mutation routes through the
 * @podo/edit-core helpers (which schema-validate via @podo/spec parsers and
 * throw on invalid input) and the validation gate, which runs BEFORE the commit
 * is applied: a mutation that would leave the workspace schema-broken is
 * rejected with an {@link EditValidationError} and neither state nor history
 * changes. Non-blocking warnings (missing/circular references) are surfaced on
 * the snapshot. `getSnapshot`/`subscribe` are compatible with React
 * `useSyncExternalStore`; the store has no UI dependency. See report.md §5.
 */
export interface EditStore {
  getSnapshot(): EditWorkspaceState;
  subscribe(listener: () => void): () => void;
  upsertToken(draft: EditorTokenDraft): void;
  moveToken(input: { documentIndex: number; fromPath?: string; toDraft: EditorTokenDraft }): void;
  deleteToken(documentIndex: number, path: string): void;
  upsertComponentProp(componentId: string, prop: ComponentDocument["props"][number]): void;
  deleteComponentProp(componentId: string, propName: string): void;
  upsertComponentVariant(componentId: string, input: ComponentVariantInput): void;
  deleteComponentVariant(componentId: string, variantName: string): void;
  updateComponentMeta(componentId: string, input: ComponentMetaInput): void;
  replaceComponent(component: ComponentDocument): void;
  undo(): void;
  redo(): void;
}

export function createEditStore(init: EditStoreInit = {}): EditStore {
  const historyLimit = Math.max(0, init.historyLimit ?? 100);
  let present: WorkspaceDocs = {
    tokenDocuments: normalizeEditorTokenDocuments(init.tokenDocuments ?? []),
    components: init.components ? [...init.components] : [],
  };
  let past: WorkspaceDocs[] = [];
  let future: WorkspaceDocs[] = [];
  const listeners = new Set<() => void>();
  let currentIssues = validateWorkspace(present);
  let snapshot = buildSnapshot();

  function buildSnapshot(): EditWorkspaceState {
    return {
      tokenDocuments: present.tokenDocuments,
      components: present.components,
      issues: currentIssues,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
    };
  }

  function emit(): void {
    snapshot = buildSnapshot();
    for (const listener of listeners) {
      listener();
    }
  }

  function commit(next: WorkspaceDocs): void {
    const issues = validateWorkspace(next);
    const blocking = blockingIssues(issues);
    if (blocking.length) {
      throw new EditValidationError(blocking);
    }
    past = historyLimit ? [...past, present].slice(-historyLimit) : [];
    future = [];
    present = next;
    currentIssues = issues;
    emit();
  }

  function findComponent(componentId: string): ComponentDocument {
    const component = present.components.find((item) => item.id === componentId);
    if (!component) {
      throw new PodoEditError(
        "editCore.componentNotFound",
        `Component "${componentId}" was not found.`,
        { id: componentId }
      );
    }
    return component;
  }

  function withComponent(next: ComponentDocument): WorkspaceDocs {
    const exists = present.components.some((item) => item.id === next.id);
    const components = exists
      ? present.components.map((item) => (item.id === next.id ? next : item))
      : [...present.components, next];
    return { ...present, components };
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    upsertToken(draft) {
      commit({
        ...present,
        tokenDocuments: upsertTokenInDocuments(present.tokenDocuments, draft),
      });
    },
    moveToken(input) {
      commit({
        ...present,
        tokenDocuments: moveTokenInDocuments(present.tokenDocuments, input),
      });
    },
    deleteToken(documentIndex, path) {
      commit({
        ...present,
        tokenDocuments: deleteTokenFromDocuments(present.tokenDocuments, documentIndex, path),
      });
    },
    upsertComponentProp(componentId, prop) {
      commit(withComponent(upsertComponentProp(findComponent(componentId), prop)));
    },
    deleteComponentProp(componentId, propName) {
      commit(withComponent(deleteComponentProp(findComponent(componentId), propName)));
    },
    upsertComponentVariant(componentId, input) {
      commit(withComponent(upsertComponentVariant(findComponent(componentId), input)));
    },
    deleteComponentVariant(componentId, variantName) {
      commit(withComponent(deleteComponentVariant(findComponent(componentId), variantName)));
    },
    updateComponentMeta(componentId, input) {
      commit(withComponent(updateComponentMeta(findComponent(componentId), input)));
    },
    replaceComponent(component) {
      commit(withComponent(component));
    },
    undo() {
      const previous = past[past.length - 1];
      if (!previous) {
        return;
      }
      past = past.slice(0, -1);
      future = [present, ...future];
      present = previous;
      currentIssues = validateWorkspace(present);
      emit();
    },
    redo() {
      const [next, ...rest] = future;
      if (!next) {
        return;
      }
      future = rest;
      past = [...past, present];
      present = next;
      currentIssues = validateWorkspace(present);
      emit();
    },
  };
}
