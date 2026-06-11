import { createRoot } from "react-dom/client";
import { PODO_SCHEMA_VERSION, type ComponentDocument } from "@podo/spec";
import { PodoEditorApp } from "./index.js";

const targets: ComponentDocument["targets"] = {
  web: { supported: true, limitations: [] },
  react: { supported: true, limitations: [] },
  hono: { supported: true, limitations: [] },
  native: { supported: true, limitations: [] },
};

const components: ComponentDocument[] = [
  {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    anatomy: [{ name: "root" }],
    slots: [{ name: "children", required: true, repeated: false }],
    props: [{ name: "disabled", type: { kind: "boolean" }, required: false, default: false }],
    variants: [{ name: "variant", values: ["solid", "soft"], default: "solid" }],
    states: [],
    tokens: { "root.background": "{color.brand}" },
    targets,
    accessibility: { aria: [], keyboard: [] },
    examples: [],
  },
  {
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "gnb",
    name: "Global Navigation",
    category: "organism",
    status: "draft",
    anatomy: [{ name: "root" }, { name: "item" }],
    slots: [
      { name: "brand", required: true, repeated: false },
      { name: "primary", required: true, repeated: true },
    ],
    props: [{ name: "sticky", type: { kind: "boolean" }, required: false, default: false }],
    variants: [],
    states: [],
    tokens: { "root.background": "{color.brand}" },
    targets,
    accessibility: { role: "navigation", aria: ["aria-label"], keyboard: ["Tab"] },
    examples: [],
  },
];

createRoot(document.getElementById("root") as HTMLElement).render(
  <PodoEditorApp components={components} />
);
