import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
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

function DevApp() {
  const initial = parseHash();
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
      components={legacyComponents}
      tokenDocuments={legacyTokenDocuments}
      panel={panel}
      onPanelChange={handlePanelChange}
      {...(component ? { selectedComponentId: component } : {})}
      onSelectComponent={handleSelectComponent}
    />
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<DevApp />);
