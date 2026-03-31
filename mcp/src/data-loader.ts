import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  AiIndex,
  Overview,
  ComponentData,
  SystemData,
  CssClassIndexEntry,
} from "./types.js";

// Resolve to podo-ui/public/ai/ (two levels up from mcp/dist/)
const packageRoot = join(fileURLToPath(import.meta.url), "../../..");
const dataDir = join(packageRoot, "public/ai");

let index: AiIndex;
let overview: Overview;
const components = new Map<string, ComponentData>();
const systems = new Map<string, SystemData>();
const cssClassIndex = new Map<string, CssClassIndexEntry[]>();

export function loadData(): void {
  index = JSON.parse(readFileSync(join(packageRoot, "public/ai.json"), "utf-8"));
  overview = JSON.parse(readFileSync(join(dataDir, "overview.json"), "utf-8"));

  // Load components
  const compDir = join(dataDir, "components");
  for (const file of readdirSync(compDir)) {
    if (!file.endsWith(".json")) continue;
    const key = basename(file, ".json");
    const data: ComponentData = JSON.parse(
      readFileSync(join(compDir, file), "utf-8")
    );
    components.set(key, data);

    // Build CSS class index
    if (Array.isArray(data.cssClasses)) {
      for (const entry of data.cssClasses) {
        indexCssClass(entry.class, {
          sourceName: data.name,
          sourceType: "component",
          class: entry.class,
          description: entry.description,
        });
      }
    }
  }

  // Load systems
  const sysDir = join(dataDir, "systems");
  for (const file of readdirSync(sysDir)) {
    if (!file.endsWith(".json")) continue;
    const key = basename(file, ".json");
    const data: SystemData = JSON.parse(
      readFileSync(join(sysDir, file), "utf-8")
    );
    systems.set(key, data);

    // Index system CSS classes if present
    if (
      data.cssClasses &&
      Array.isArray(data.cssClasses)
    ) {
      for (const entry of data.cssClasses as Array<{
        class: string;
        description: string;
      }>) {
        indexCssClass(entry.class, {
          sourceName: data.name,
          sourceType: "system",
          class: entry.class,
          description: entry.description,
        });
      }
    }
  }
}

function indexCssClass(classStr: string, entry: CssClassIndexEntry): void {
  // Index each word in the class string
  const words = classStr.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (!cssClassIndex.has(word)) {
      cssClassIndex.set(word, []);
    }
    cssClassIndex.get(word)!.push(entry);
  }
  // Also index the full class string
  const full = classStr.toLowerCase();
  if (!cssClassIndex.has(full)) {
    cssClassIndex.set(full, []);
  }
  cssClassIndex.get(full)!.push(entry);
}

export function getIndex(): AiIndex {
  return index;
}

export function getOverviewData(): Overview {
  return overview;
}

export function getComponent(name: string): ComponentData | undefined {
  const lower = name.toLowerCase();
  // Exact key match
  if (components.has(lower)) return components.get(lower);
  // Match by component name field
  for (const [, comp] of components) {
    if (comp.name.toLowerCase() === lower) return comp;
  }
  // Partial match
  for (const [key, comp] of components) {
    if (key.includes(lower) || comp.name.toLowerCase().includes(lower))
      return comp;
  }
  return undefined;
}

export function getAllComponents(): ComponentData[] {
  return Array.from(components.values());
}

export function getSystem(name: string): SystemData | undefined {
  return systems.get(name.toLowerCase());
}

export function getAllSystems(): SystemData[] {
  return Array.from(systems.values());
}

export function searchCssClasses(className: string): CssClassIndexEntry[] {
  const lower = className.toLowerCase().trim();
  const results: CssClassIndexEntry[] = [];
  const seen = new Set<string>();

  // Exact word match
  const exact = cssClassIndex.get(lower);
  if (exact) {
    for (const entry of exact) {
      const key = `${entry.sourceName}:${entry.class}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(entry);
      }
    }
  }

  // Partial match across all indexed entries
  if (results.length === 0) {
    for (const [word, entries] of cssClassIndex) {
      if (word.includes(lower) || lower.includes(word)) {
        for (const entry of entries) {
          const key = `${entry.sourceName}:${entry.class}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push(entry);
          }
        }
      }
    }
  }

  return results;
}

export function searchExamples(
  query: string,
  framework?: string
): Array<{ source: string; title: string; code: string }> {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  const results: Array<{ source: string; title: string; code: string }> = [];

  for (const [, comp] of components) {
    if (!comp.examples) continue;
    for (const ex of comp.examples) {
      const text = `${ex.title} ${ex.code}`.toLowerCase();
      const matches = tokens.filter((t) => text.includes(t));
      if (matches.length > 0) {
        if (framework) {
          const codeLower = ex.code.toLowerCase();
          if (framework === "react" && !codeLower.includes("import")) continue;
          if (framework === "svelte" && !codeLower.includes("script"))
            continue;
          if (framework === "scss" && !codeLower.includes("@use")) continue;
          if (
            framework === "html" &&
            (codeLower.includes("import") || codeLower.includes("@use"))
          )
            continue;
        }
        results.push({ source: comp.name, title: ex.title, code: ex.code });
      }
    }
  }

  for (const [, sys] of systems) {
    if (!sys.examples) continue;
    for (const ex of sys.examples) {
      const text = `${ex.title} ${ex.code}`.toLowerCase();
      const matches = tokens.filter((t) => text.includes(t));
      if (matches.length > 0) {
        results.push({ source: sys.name, title: ex.title, code: ex.code });
      }
    }
  }

  return results;
}
