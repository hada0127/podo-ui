import { createRoot } from "react-dom/client";
import { PodoEditorApp } from "./index.js";
import { legacyComponents, legacyTokenDocuments } from "./legacy-fixtures.js";

createRoot(document.getElementById("root") as HTMLElement).render(
  <PodoEditorApp components={legacyComponents} tokenDocuments={legacyTokenDocuments} />
);
