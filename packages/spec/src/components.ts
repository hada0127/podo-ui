import { z } from "zod";
import {
  aliasReferenceSchema,
  dottedPathSchema,
  identifierSchema,
  issue,
  normalizeAliasReference,
  schemaVersionSchema,
  targetNameSchema,
  type ValidationIssue,
} from "./shared.js";

export const propNameSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*(?:-[a-z][a-zA-Z0-9]*)*$/, "Use camelCase or kebab-case prop names.");

export const componentCategorySchema = z.enum([
  "atom",
  "molecule",
  "organism",
  "template",
  "layout",
  "utility",
]);

export const componentStatusSchema = z.enum(["draft", "experimental", "stable", "deprecated"]);

export const propTypeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("boolean") }),
  z.object({ kind: z.literal("string") }),
  z.object({
    kind: z.literal("number"),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
  }),
  z.object({ kind: z.literal("enum"), values: z.array(z.string().min(1)).min(1) }),
  z.object({ kind: z.literal("union"), values: z.array(z.string().min(1)).min(1) }),
  z.object({ kind: z.literal("object"), schema: z.record(z.string(), z.unknown()).optional() }),
  z.object({ kind: z.literal("event"), payload: z.record(z.string(), z.unknown()).optional() }),
]);

export const componentPropSchema = z.object({
  name: propNameSchema,
  type: propTypeSchema,
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  description: z.string().optional(),
});

export const targetSlotSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
});

export const componentSlotSchema = z.object({
  name: z.string().min(1),
  required: z.boolean().default(false),
  repeated: z.boolean().default(false),
  fallback: z.string().optional(),
  description: z.string().optional(),
  targets: z.partialRecord(targetNameSchema, targetSlotSchema).optional(),
});

export const anatomyPartSchema = z.object({
  name: identifierSchema,
  description: z.string().optional(),
  targets: z.partialRecord(targetNameSchema, z.string().min(1)).optional(),
});

export const componentVariantSchema = z
  .object({
    name: identifierSchema,
    values: z.array(z.string().min(1)).min(1),
    default: z.string().min(1).optional(),
    description: z.string().optional(),
    // Variant-level token bindings (apply across the whole variant axis). Keys
    // are dotted binding paths (part.prop) so they emit valid CSS custom props.
    tokens: z.record(dottedPathSchema, aliasReferenceSchema).optional(),
    // Per-value token bindings: value -> part.prop -> token alias, so a specific
    // variant value (e.g. "soft") can re-bind component tokens. Enables
    // spec-driven per-variant styling in codegen (report.md §3.2 / §6).
    valueTokens: z.record(z.string(), z.record(dottedPathSchema, aliasReferenceSchema)).optional(),
  })
  .superRefine((variant, ctx) => {
    for (const value of Object.keys(variant.valueTokens ?? {})) {
      if (!variant.values.includes(value)) {
        ctx.addIssue({
          code: "custom",
          message: `valueTokens key "${value}" is not a declared value of variant "${variant.name}".`,
          path: ["valueTokens", value],
        });
      }
    }
  });

export const componentStateSchema = z.object({
  name: z.enum([
    "hover",
    "active",
    "focusVisible",
    "disabled",
    "loading",
    "invalid",
    "selected",
    "open",
    "checked",
  ]),
  description: z.string().optional(),
  selector: z.string().optional(),
  tokens: z.record(dottedPathSchema, aliasReferenceSchema).optional(),
});

export const targetSupportSchema = z.object({
  supported: z.boolean(),
  limitations: z.array(z.string().min(1)).default([]),
});

export const accessibilitySpecSchema = z.object({
  role: z.string().optional(),
  aria: z.array(z.string().min(1)).default([]),
  keyboard: z.array(z.string().min(1)).default([]),
  focusManagement: z.string().optional(),
});

export const componentExampleSchema = z.object({
  target: targetNameSchema,
  title: z.string().min(1),
  code: z.string().min(1),
});

export const componentDocumentSchema = z.object({
  schemaVersion: schemaVersionSchema,
  kind: z.literal("component"),
  id: identifierSchema,
  name: z.string().min(1),
  category: componentCategorySchema,
  status: componentStatusSchema,
  description: z.string().optional(),
  anatomy: z.array(anatomyPartSchema).min(1),
  slots: z.array(componentSlotSchema).default([]),
  props: z.array(componentPropSchema).default([]),
  variants: z.array(componentVariantSchema).default([]),
  states: z.array(componentStateSchema).default([]),
  tokens: z.record(dottedPathSchema, aliasReferenceSchema).default({}),
  targets: z.object({
    web: targetSupportSchema,
    react: targetSupportSchema,
    hono: targetSupportSchema,
    native: targetSupportSchema,
  }),
  accessibility: accessibilitySpecSchema,
  examples: z.array(componentExampleSchema).default([]),
});

export type ComponentDocument = z.infer<typeof componentDocumentSchema>;

export function parseComponentDocument(input: unknown): ComponentDocument {
  return componentDocumentSchema.parse(input);
}

export function collectComponentTokenBindings(component: ComponentDocument): Map<string, string> {
  const bindings = new Map<string, string>();

  for (const [path, reference] of Object.entries(component.tokens)) {
    bindings.set(`tokens.${path}`, reference);
  }

  for (const variant of component.variants) {
    for (const [path, reference] of Object.entries(variant.tokens ?? {})) {
      bindings.set(`variants.${variant.name}.${path}`, reference);
    }
    for (const [value, map] of Object.entries(variant.valueTokens ?? {})) {
      for (const [path, reference] of Object.entries(map)) {
        bindings.set(`variants.${variant.name}.${value}.${path}`, reference);
      }
    }
  }

  for (const state of component.states) {
    for (const [path, reference] of Object.entries(state.tokens ?? {})) {
      bindings.set(`states.${state.name}.${path}`, reference);
    }
  }

  return bindings;
}

export function validateComponentTokenBindings(
  component: ComponentDocument,
  availableTokenPaths: Iterable<string>
): ValidationIssue[] {
  const tokenPaths = new Set(availableTokenPaths);
  const issues: ValidationIssue[] = [];

  for (const [bindingPath, reference] of collectComponentTokenBindings(component)) {
    // Normalize both `{token.path}` and `#/token/path/$value` alias forms.
    const tokenPath = normalizeAliasReference(reference);
    if (!tokenPaths.has(tokenPath)) {
      issues.push(
        issue(
          "component.tokenBinding.missing",
          `${component.id}.${bindingPath}`,
          `Component "${component.id}" binding "${bindingPath}" references missing token "${tokenPath}".`
        )
      );
    }
  }

  return issues;
}
