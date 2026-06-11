import { z } from "zod";

export const PODO_SCHEMA_VERSION = "2.0.0";

export const schemaVersionSchema = z.literal(PODO_SCHEMA_VERSION);

export const identifierSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, "Use kebab-case identifiers.");

export const dottedPathSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/, "Use dotted token paths.");

export const aliasReferenceSchema = z
  .string()
  .regex(/^\{[a-zA-Z0-9_.-]+\}$|^#\/.+$/, "Use {token.path} or JSON Pointer alias references.");

export const targetNameSchema = z.enum(["web", "react", "hono", "native"]);

export const schemaHeaderSchema = z.object({
  schemaVersion: schemaVersionSchema,
});

export const validationIssueSchema = z.object({
  code: z.string(),
  path: z.string(),
  message: z.string(),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAliasReference(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (aliasReferenceSchema.safeParse(value).success || /\{[^}]+\}/.test(value))
  );
}

export function extractAliasReferences(value: unknown): string[] {
  if (typeof value === "string") {
    const exactAlias = aliasReferenceSchema.safeParse(value);
    if (exactAlias.success && value.startsWith("#/")) {
      return [value];
    }

    return Array.from(value.matchAll(/\{([^}]+)\}/g), (match) => match[1] ?? "").filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractAliasReferences(item));
  }

  if (isPlainObject(value)) {
    return Object.values(value).flatMap((item) => extractAliasReferences(item));
  }

  return [];
}

export function normalizeAliasReference(reference: string): string {
  if (reference.startsWith("{") && reference.endsWith("}")) {
    return reference.slice(1, -1);
  }

  if (reference.startsWith("#/")) {
    return reference
      .slice(2)
      .split("/")
      .filter((segment) => segment && segment !== "$value")
      .join(".");
  }

  return reference;
}

export function issue(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message };
}
