import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { PodoEditorApp, editorPanels, type EditorPanel } from "./index.js";
import { legacyComponents, legacyTokenDocuments } from "./legacy-fixtures.js";

// Minimal dependency-free hash router: the active panel lives in the URL hash
// (e.g. "#canvas") so it survives reloads and works with the browser back/
// forward buttons — no router library required.
function panelFromHash(): EditorPanel | undefined {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return (editorPanels as string[]).includes(raw) ? (raw as EditorPanel) : undefined;
}

function DevApp() {
  const [panel, setPanel] = useState<EditorPanel>(() => panelFromHash() ?? "tokens");

  useEffect(() => {
    const syncFromHash = (): void => {
      const next = panelFromHash();
      if (next) {
        setPanel(next);
      }
    };
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const handlePanelChange = (next: EditorPanel): void => {
    setPanel(next);
    if (panelFromHash() !== next) {
      window.location.hash = next;
    }
  };

  return (
    <PodoEditorApp
      components={legacyComponents}
      tokenDocuments={legacyTokenDocuments}
      panel={panel}
      onPanelChange={handlePanelChange}
    />
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<DevApp />);
