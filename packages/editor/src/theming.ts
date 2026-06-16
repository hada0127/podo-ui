import type { ComponentDocument } from "@podo/spec";
import type { EditorTokenRecord } from "./spec-editing.js";
import type { TokenLookup } from "./token-lookup.js";
import type { EditorColorScheme } from "./viewport.js";

export function effectiveEditorColorScheme(
  colorScheme: EditorColorScheme,
  systemColorScheme: "light" | "dark" = "light"
): "light" | "dark" {
  return colorScheme === "auto" ? systemColorScheme : colorScheme;
}

export function filterComponentsForEditor(
  components: ComponentDocument[],
  query: string
): ComponentDocument[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return components;
  }

  return components.filter((component) => {
    const searchableValues = [
      component.id,
      component.name,
      component.category,
      component.status,
      component.description ?? "",
      ...component.anatomy.map((part) => part.name),
      ...component.slots.map((slot) => slot.name),
      ...component.props.map((prop) => prop.name),
      ...component.variants.flatMap((variant) => [variant.name, ...variant.values]),
      ...component.states.map((state) => state.name),
    ];

    return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function createThemedTokenLookup(
  records: EditorTokenRecord[],
  colorScheme: "light" | "dark"
): TokenLookup {
  const projections = records.flatMap((record, order) => {
    const projection = projectColorSchemeTokenPath(record.path, colorScheme);
    return projection ? [{ ...projection, order, token: record.token }] : [];
  });
  projections.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
  return new Map(projections.map((projection) => [projection.path, projection.token]));
}

function projectColorSchemeTokenPath(
  path: string,
  colorScheme: "light" | "dark"
): { path: string; specificity: number } | undefined {
  const projected: string[] = [];
  let specificity = 0;
  for (const segment of path.split(".")) {
    if (segment === "light" || segment === "dark") {
      if (segment !== colorScheme) {
        return undefined;
      }
      specificity += 1;
      continue;
    }
    projected.push(segment);
  }
  return { path: projected.join("."), specificity };
}
