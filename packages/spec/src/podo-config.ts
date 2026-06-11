import { z } from "zod";
import { isPlainObject, schemaVersionSchema, targetNameSchema, type JsonValue } from "./shared.js";

export const podoEnvironmentSchema = z.enum(["web", "react", "hono", "react-native"]);

export const podoDarkModeSchema = z.object({
  enabled: z.boolean(),
  strategy: z.enum(["class", "data-attribute", "media", "native"]),
});

export const podoThemeSelectionSchema = z.object({
  default: z.string().min(1),
  available: z.array(z.string().min(1)).min(1),
});

export const podoBuildConfigSchema = z.object({
  targets: z.array(targetNameSchema).min(1),
  outDir: z.string().min(1),
});

export const podoConfigSchema = z.object({
  schemaVersion: schemaVersionSchema,
  environment: podoEnvironmentSchema,
  darkMode: podoDarkModeSchema,
  themes: podoThemeSelectionSchema,
  build: podoBuildConfigSchema,
});

export const migrationStateSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  appliedAt: z.string().min(1).optional(),
  status: z.enum(["pending", "applied", "failed"]),
});

export const podoLockSchema = z.object({
  schemaVersion: schemaVersionSchema,
  packageVersion: z.string().min(1),
  migrations: z.array(migrationStateSchema).default([]),
  generatedHash: z.string().regex(/^[a-fA-F0-9]{32,128}$/),
});

export type PodoConfig = z.infer<typeof podoConfigSchema>;
export type PodoLock = z.infer<typeof podoLockSchema>;

export function parsePodoConfig(input: unknown): PodoConfig {
  return podoConfigSchema.parse(input);
}

export function parsePodoLock(input: unknown): PodoLock {
  return podoLockSchema.parse(input);
}

export function mergePodoOverrides<T extends Record<string, JsonValue>>(
  base: T,
  override: Partial<T>
): T {
  return deepMerge(base, override as Record<string, JsonValue>) as T;
}

function deepMerge(base: JsonValue, override: JsonValue | undefined): JsonValue {
  if (override === undefined) {
    return cloneJson(base);
  }

  if (Array.isArray(base) || Array.isArray(override)) {
    return cloneJson(override);
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, JsonValue> = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
    for (const key of keys) {
      result[key] = deepMerge(base[key] as JsonValue, override[key] as JsonValue | undefined);
    }
    return result;
  }

  return cloneJson(override);
}

function cloneJson<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
