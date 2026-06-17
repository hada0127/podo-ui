import type { ComponentDocument } from "@podo/spec";
import {
  componentPropValuesText,
  componentVariantValuesText,
  serializeEditorTokenExtensions,
  serializeEditorTokenValue,
  serializePropDefaultInput,
  type EditorTokenDraft,
  type EditorTokenRecord,
} from "./spec-editing.js";
import {
  defaultPropsForComponent,
  defaultSlotsForComponent,
  type EditorComponentNode,
} from "./canvas.js";

export type ComponentEditMode = "props" | "variants" | "slots" | "tokens";

export interface ComponentMetaDraft {
  name: string;
  category: ComponentDocument["category"];
  status: ComponentDocument["status"];
  description: string;
}

export interface ComponentPropDraft {
  name: string;
  kind: ComponentDocument["props"][number]["type"]["kind"];
  valuesText: string;
  defaultValue: string;
  required: boolean;
  description: string;
}

export interface ComponentVariantDraft {
  name: string;
  valuesText: string;
  defaultValue: string;
  description: string;
  tokensText: string;
}

export interface ComponentSlotDraft {
  name: string;
  required: boolean;
  repeated: boolean;
  fallback: string;
  description: string;
}

export function createNewTokenDraft(documentIndex = 0): EditorTokenDraft {
  return {
    documentIndex,
    path: "component.example.value",
    type: "color",
    valueText: "#3366ff",
    description: "",
    extensionsText: "",
  };
}

export function tokenDraftFromRecord(record: EditorTokenRecord): EditorTokenDraft {
  return {
    documentIndex: record.documentIndex,
    path: record.path,
    type: record.token.$type,
    valueText: serializeEditorTokenValue(record.token.$value),
    description: record.token.$description ?? "",
    extensionsText: serializeEditorTokenExtensions(record.token.$extensions),
  };
}

export function componentMetaDraftFromComponent(component?: ComponentDocument): ComponentMetaDraft {
  return {
    name: component?.name ?? "",
    category: component?.category ?? "atom",
    status: component?.status ?? "draft",
    description: component?.description ?? "",
  };
}

export function createNewComponentPropDraft(): ComponentPropDraft {
  return {
    name: "label",
    kind: "string",
    valuesText: "",
    defaultValue: "",
    required: false,
    description: "",
  };
}

export function componentPropDraftFromProp(
  prop: ComponentDocument["props"][number]
): ComponentPropDraft {
  return {
    name: prop.name,
    kind: prop.type.kind,
    valuesText: componentPropValuesText(prop),
    defaultValue: serializePropDefaultInput(prop.default),
    required: prop.required,
    description: prop.description ?? "",
  };
}

export function createNewComponentVariantDraft(): ComponentVariantDraft {
  return {
    name: "tone",
    valuesText: "default, emphasis",
    defaultValue: "default",
    description: "",
    tokensText: "",
  };
}

export function componentVariantDraftFromVariant(
  variant: ComponentDocument["variants"][number]
): ComponentVariantDraft {
  return {
    name: variant.name,
    valuesText: componentVariantValuesText(variant),
    defaultValue: variant.default ?? variant.values[0] ?? "",
    description: variant.description ?? "",
    tokensText: variant.tokens ? JSON.stringify(variant.tokens, null, 2) : "",
  };
}

export function createNewComponentSlotDraft(): ComponentSlotDraft {
  return {
    name: "content",
    required: false,
    repeated: true,
    fallback: "",
    description: "",
  };
}

export function componentSlotDraftFromSlot(
  slot: ComponentDocument["slots"][number]
): ComponentSlotDraft {
  return {
    name: slot.name,
    required: slot.required,
    repeated: slot.repeated,
    fallback: slot.fallback ?? "",
    description: slot.description ?? "",
  };
}

export function normalizeNodeForComponent(
  node: EditorComponentNode,
  component: ComponentDocument
): EditorComponentNode {
  const allowedProps = new Set(component.props.map((prop) => prop.name));
  const propDefaults = defaultPropsForComponent(component);
  const retainedProps = Object.fromEntries(
    Object.entries(node.props).filter(([propName]) => allowedProps.has(propName))
  );
  const variantValues = component.variants.flatMap((variant) => variant.values);
  const fallbackVariant =
    component.variants[0]?.default ?? component.variants[0]?.values[0] ?? "default";
  return {
    ...node,
    name: component.name,
    variant: node.variant && variantValues.includes(node.variant) ? node.variant : fallbackVariant,
    props: { ...propDefaults, ...retainedProps },
    slots: {
      ...defaultSlotsForComponent(component),
      ...Object.fromEntries(
        Object.entries(node.slots).filter(([slotName]) =>
          component.slots.some((slot) => slot.name === slotName)
        )
      ),
    },
  };
}
