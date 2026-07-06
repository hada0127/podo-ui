import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  parseComponentDocument,
  type ComponentDocument,
  type IconManifest,
  type TokenDocument,
} from "@podo/spec";
import { PodoEditorApp, editorPanels, type EditorPanel } from "./index.js";
import { legacyComponents, legacyTokenDocuments } from "./legacy-fixtures.js";

// Minimal dependency-free hash router: the active panel AND (for the components
// panel) the selected component live in the URL hash — e.g. "#components/tab" —
// so the full selection survives reloads and works with browser back/forward.
function parseHash(): { panel: EditorPanel | undefined; component: string | undefined } {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [panelPart, componentPart] = raw.split("/");
  const panel =
    panelPart && (editorPanels as string[]).includes(panelPart)
      ? (panelPart as EditorPanel)
      : undefined;
  return { panel, component: componentPart || undefined };
}

// --- Dev persistence -------------------------------------------------------
// The dev shell saves every spec edit to localStorage so reloads keep your
// work. `?reset` in the URL reseeds from the built-in fixtures.
const WORKSPACE_STORE_KEY = "podo-dev-workspace.v1";

interface StoredWorkspace {
  components?: unknown[];
  tokenDocuments?: TokenDocument[];
  iconManifest?: IconManifest;
}

interface WorkspaceSeed {
  components: ComponentDocument[];
  tokenDocuments: TokenDocument[];
  iconManifest?: IconManifest;
}

function loadWorkspaceSeed(): WorkspaceSeed {
  const fixtures: WorkspaceSeed = {
    components: legacyComponents,
    tokenDocuments: legacyTokenDocuments,
  };
  try {
    if (new URLSearchParams(window.location.search).has("reset")) {
      window.localStorage.removeItem(WORKSPACE_STORE_KEY);
      // Strip ?reset so a later manual reload doesn't wipe new work again.
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      return fixtures;
    }
    const raw = window.localStorage.getItem(WORKSPACE_STORE_KEY);
    if (!raw) {
      return fixtures;
    }
    const stored = JSON.parse(raw) as StoredWorkspace;
    // ABSENT fields fall back to fixtures; PRESENT-but-empty is an honest saved
    // state and must round-trip (never resurrect fixtures over a deliberate
    // empty). Validate EVERY stored component through the schema; any parse
    // failure falls back wholesale so we never boot a half-valid workspace.
    if (!stored.components) {
      return fixtures;
    }
    const components = stored.components.map((entry) => parseComponentDocument(entry));
    return {
      components,
      tokenDocuments: stored.tokenDocuments ?? legacyTokenDocuments,
      ...(stored.iconManifest ? { iconManifest: stored.iconManifest } : {}),
    };
  } catch (error) {
    console.warn("podo dev: ignoring saved workspace (failed to load)", error);
    return fixtures;
  }
}

// Writes are debounced: color drags commit dozens of times per second and a
// synchronous multi-hundred-KB setItem per commit would jank the drag. The
// trailing write lands 250ms after the burst; beforeunload flushes it so an
// immediate reload can't lose the last edit.
let pendingPatch: Partial<StoredWorkspace> | null = null;
let pendingTimer: number | undefined;

function flushStoredWorkspace(): void {
  if (!pendingPatch) {
    return;
  }
  const patch = pendingPatch;
  pendingPatch = null;
  window.clearTimeout(pendingTimer);
  // A corrupt existing record must not block future saves — start fresh instead.
  let current: StoredWorkspace = {};
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORE_KEY);
    if (raw) {
      current = JSON.parse(raw) as StoredWorkspace;
    }
  } catch {
    current = {};
  }
  try {
    window.localStorage.setItem(WORKSPACE_STORE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch (error) {
    // Quota/serialization failures must never break editing — warn and move on.
    console.warn("podo dev: failed to save workspace", error);
  }
}

function patchStoredWorkspace(patch: Partial<StoredWorkspace>): void {
  pendingPatch = { ...pendingPatch, ...patch };
  window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(flushStoredWorkspace, 250);
}

// Single beforeunload listener that always calls the LATEST module's flush:
// under HMR a re-evaluated module must not leave a stale-closure listener that
// could overwrite newer saves (entry modules full-reload in Vite, but cheap to
// be safe).
declare global {
  interface Window {
    __podoDevFlush?: () => void;
  }
}
const flushAlreadyRegistered = Boolean(window.__podoDevFlush);
window.__podoDevFlush = flushStoredWorkspace;
if (!flushAlreadyRegistered) {
  window.addEventListener("beforeunload", () => window.__podoDevFlush?.());
}

function DevApp() {
  const initial = parseHash();
  // Seed once per boot; edits after that flow through the change callbacks.
  const [seed] = useState(loadWorkspaceSeed);
  const [panel, setPanel] = useState<EditorPanel>(initial.panel ?? "tokens");
  const [component, setComponent] = useState<string | undefined>(initial.component);

  useEffect(() => {
    const syncFromHash = (): void => {
      const next = parseHash();
      if (next.panel) {
        setPanel(next.panel);
      }
      setComponent(next.component);
    };
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const writeHash = (nextPanel: EditorPanel, nextComponent: string | undefined): void => {
    const target =
      nextPanel === "components" && nextComponent ? `${nextPanel}/${nextComponent}` : nextPanel;
    if (window.location.hash.replace(/^#\/?/, "") !== target) {
      window.location.hash = target;
    }
  };

  const handlePanelChange = (next: EditorPanel): void => {
    setPanel(next);
    writeHash(next, component);
  };

  const handleSelectComponent = (id: string): void => {
    setComponent(id);
    writeHash(panel, id);
  };

  return (
    <PodoEditorApp
      components={seed.components}
      tokenDocuments={seed.tokenDocuments}
      {...(seed.iconManifest ? { iconManifest: seed.iconManifest } : {})}
      onSpecsChange={(specs) =>
        patchStoredWorkspace({
          components: specs.components,
          tokenDocuments: specs.tokenDocuments,
        })
      }
      // Canvas-side component creation (custom layout, save-node-as-component)
      // commits through commitState WITHOUT onSpecsChange — persist components
      // from here too so those survive reloads. Canvas nodes stay session-only.
      onStateChange={(state) => patchStoredWorkspace({ components: state.components })}
      onIconsChange={(manifest) => patchStoredWorkspace({ iconManifest: manifest })}
      panel={panel}
      onPanelChange={handlePanelChange}
      {...(component ? { selectedComponentId: component } : {})}
      onSelectComponent={handleSelectComponent}
    />
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<DevApp />);
