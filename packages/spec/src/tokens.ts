import { z } from "zod";
import {
  PODO_SCHEMA_VERSION,
  aliasReferenceSchema,
  dottedPathSchema,
  extractAliasReferences,
  issue,
  normalizeAliasReference,
  schemaHeaderSchema,
  type ValidationIssue,
} from "./shared.js";

const unitValueSchema = z
  .string()
  .regex(
    /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vh|vw|s|ms)?$/,
    "Use a numeric design value with an allowed unit."
  );

const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Use a hex color value.");

const rgbaColorSchema = z
  .string()
  .regex(
    /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/,
    "Use an rgb() or rgba() color value."
  );

const colorValueSchema = z.union([hexColorSchema, rgbaColorSchema, z.literal("transparent")]);

const cubicBezierValueSchema = z.tuple([
  z.number().min(0).max(1),
  z.number().min(0).max(1),
  z.number().min(0).max(1),
  z.number().min(0).max(1),
]);

const dimensionOrAliasSchema = z.union([unitValueSchema, aliasReferenceSchema]);

const colorOrAliasSchema = z.union([colorValueSchema, aliasReferenceSchema]);

export const borderValueSchema = z.object({
  color: colorOrAliasSchema,
  width: dimensionOrAliasSchema,
  style: z.enum(["solid", "dashed", "dotted", "none"]),
});

export const motionValueSchema = z.object({
  duration: dimensionOrAliasSchema,
  easing: z.union([cubicBezierValueSchema, aliasReferenceSchema]),
  delay: dimensionOrAliasSchema.optional(),
});

export const tokenScopeSchema = z.enum(["primitive", "semantic", "component", "theme"]);

export const embeddedFontAssetSchema = z.object({
  kind: z.literal("font"),
  source: z.literal("embedded"),
  family: z.string().min(1),
  fileName: z.string().min(1),
  format: z.enum(["woff2", "woff", "truetype", "opentype"]),
  mimeType: z.string().min(1),
  dataUrl: z.string().regex(/^data:[^,]+;base64,/, "Use a base64 data URL for embedded fonts."),
});

export const tokenTypeSchema = z.enum([
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "string",
  "shadow",
  "typography",
  "spacing",
  "radius",
  "motion",
  "border",
  "asset",
]);

export const podoTokenExtensionSchema = z.object({
  fontAsset: embeddedFontAssetSchema.optional(),
  themeable: z.boolean().optional(),
  roles: z.array(z.string().min(1)).optional(),
  // For a fontFamily token: the numeric font weights this family ships/supports
  // (e.g. [400, 700]). Lets each font enable/disable weights independently.
  weights: z.array(z.number().int().min(1).max(1000)).optional(),
  scope: tokenScopeSchema.optional(),
  deprecated: z
    .union([
      z.boolean(),
      z.object({
        since: z.string().min(1),
        replacement: dottedPathSchema.optional(),
        reason: z.string().min(1).optional(),
      }),
    ])
    .optional(),
  migration: z
    .object({
      from: z.array(dottedPathSchema).optional(),
      to: dottedPathSchema.optional(),
      notes: z.string().min(1).optional(),
    })
    .optional(),
});

export type EmbeddedFontAsset = z.infer<typeof embeddedFontAssetSchema>;

export const tokenExtensionsSchema = z
  .object({
    podo: podoTokenExtensionSchema.optional(),
  })
  .catchall(z.unknown());

// A size that can vary by breakpoint. `pc` (desktop) is the base/required value;
// `tablet`/`mobile` are optional overrides emitted as CSS media queries. A plain
// unit string stays valid, so non-responsive sizes need no change.
export const responsiveDimensionSchema = z.object({
  pc: unitValueSchema,
  tablet: unitValueSchema.optional(),
  mobile: unitValueSchema.optional(),
});

const responsiveOrUnitSchema = z.union([unitValueSchema, responsiveDimensionSchema]);

export type ResponsiveDimension = z.infer<typeof responsiveDimensionSchema>;

export const typographyValueSchema = z.object({
  fontFamily: z.string().min(1),
  // Type scale is responsive (pc/tablet/mobile); other metrics are not — line
  // height is a percentage that scales with the font size at every breakpoint.
  fontSize: responsiveOrUnitSchema,
  lineHeight: unitValueSchema,
  fontWeight: z.union([z.number().int().min(1), z.string().min(1)]),
  letterSpacing: unitValueSchema,
  paragraphSpacing: unitValueSchema.optional(),
});

export const shadowValueSchema = z.object({
  x: unitValueSchema,
  y: unitValueSchema,
  blur: unitValueSchema,
  spread: unitValueSchema.optional(),
  color: z.string().min(1),
});

export const tokenValueSchema: z.ZodType<unknown> = z.union([
  z.string().min(1),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  typographyValueSchema,
  shadowValueSchema,
  borderValueSchema,
  motionValueSchema,
  z.record(z.string(), z.unknown()),
]);

export const designTokenSchema = z
  .object({
    $type: tokenTypeSchema,
    $value: tokenValueSchema,
    $description: z.string().optional(),
    $extensions: tokenExtensionsSchema.optional(),
  })
  .superRefine((token, ctx) => {
    const valueIsAlias =
      typeof token.$value === "string" && aliasReferenceSchema.safeParse(token.$value).success;

    if (typeof token.$value === "string" && token.$value.startsWith("{") && !valueIsAlias) {
      ctx.addIssue({
        code: "custom",
        path: ["$value"],
        message: "Alias references must use {token.path} format.",
        params: { i18n: "spec.aliasFormat" },
      });
      return;
    }

    if (valueIsAlias) {
      return;
    }

    const requireString = (message: string, params: Record<string, string | number>): boolean => {
      if (typeof token.$value !== "string") {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message,
          params,
        });
        return false;
      }
      return true;
    };

    if (token.$type === "color") {
      if (
        !requireString("Color tokens must use a color value or alias reference.", {
          i18n: "spec.colorValue",
        })
      ) {
        return;
      }

      if (!colorValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Color tokens must use a color value or alias reference.",
          params: { i18n: "spec.colorValue" },
        });
      }
      return;
    }

    if (["dimension", "spacing", "radius", "duration"].includes(token.$type)) {
      if (
        !requireString(`${token.$type} tokens must use an allowed unit or alias reference.`, {
          i18n: "spec.unitValue",
          type: token.$type,
        })
      ) {
        return;
      }

      if (!unitValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: `${token.$type} tokens must use an allowed unit or alias reference.`,
          params: { i18n: "spec.unitValue", type: token.$type },
        });
      }
      return;
    }

    if (token.$type === "typography") {
      if (!typographyValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message:
            "Typography tokens must include fontFamily, fontSize, lineHeight, fontWeight, letterSpacing, and optional paragraphSpacing.",
          params: { i18n: "spec.typographyInclude" },
        });
      }
      return;
    }

    if (token.$type === "shadow") {
      if (!shadowValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Shadow tokens must include x, y, blur, optional spread, and color.",
          params: { i18n: "spec.shadowInclude" },
        });
      }
      return;
    }

    if (token.$type === "cubicBezier") {
      if (!cubicBezierValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Cubic bezier tokens must be an array of four numbers between 0 and 1.",
          params: { i18n: "spec.cubicBezier" },
        });
      }
      return;
    }

    if (token.$type === "border") {
      if (!borderValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Border tokens must include color, width, and style.",
          params: { i18n: "spec.borderInclude" },
        });
      }
      return;
    }

    if (token.$type === "motion") {
      if (!motionValueSchema.safeParse(token.$value).success) {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Motion tokens must include duration, easing, and optional delay.",
          params: { i18n: "spec.motionInclude" },
        });
      }
      return;
    }

    if (token.$type === "number" && typeof token.$value !== "number") {
      ctx.addIssue({
        code: "custom",
        path: ["$value"],
        message: "Number tokens must use a numeric value or alias reference.",
        params: { i18n: "spec.numberValue" },
      });
      return;
    }

    if (token.$type === "fontWeight") {
      if (typeof token.$value !== "number" && typeof token.$value !== "string") {
        ctx.addIssue({
          code: "custom",
          path: ["$value"],
          message: "Font weight tokens must use a number, string, or alias reference.",
          params: { i18n: "spec.fontWeightValue" },
        });
      }
      return;
    }

    if (
      ["fontFamily", "string", "asset"].includes(token.$type) &&
      typeof token.$value !== "string"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["$value"],
        message: `${token.$type} tokens must use a string value or alias reference.`,
        params: { i18n: "spec.stringValue", type: token.$type },
      });
    }
  });

export type DesignToken = z.infer<typeof designTokenSchema>;

export type TokenTree = {
  [key: string]: DesignToken | TokenTree;
};

const tokenTreeSchema: z.ZodType<TokenTree> = z.lazy(() =>
  z.record(z.string(), z.union([designTokenSchema, tokenTreeSchema]))
);

export const tokenCategorySchema = z.enum(["primitive", "semantic", "component", "theme"]);

export const tokenDocumentSchema = schemaHeaderSchema.extend({
  kind: z.literal("tokens"),
  category: tokenCategorySchema,
  tokens: tokenTreeSchema,
});

export type TokenDocument = z.infer<typeof tokenDocumentSchema>;

export function parseTokenDocument(input: unknown): TokenDocument {
  return tokenDocumentSchema.parse(input);
}

export function isDesignToken(value: unknown): value is DesignToken {
  return designTokenSchema.safeParse(value).success;
}

export function collectTokenPaths(tree: TokenTree, prefix: string[] = []): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = [...prefix, key];
    return isDesignToken(value) ? [path.join(".")] : collectTokenPaths(value, path);
  });
}

export function collectTokenAliasGraph(
  tree: TokenTree,
  prefix: string[] = []
): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const [key, value] of Object.entries(tree)) {
    const path = [...prefix, key];
    if (isDesignToken(value)) {
      graph.set(
        path.join("."),
        extractAliasReferences(value.$value).map((reference) => normalizeAliasReference(reference))
      );
    } else {
      for (const [childPath, childReferences] of collectTokenAliasGraph(value, path)) {
        graph.set(childPath, childReferences);
      }
    }
  }

  return graph;
}

export function validateTokenReferences(document: TokenDocument): ValidationIssue[] {
  const paths = new Set(collectTokenPaths(document.tokens));
  const graph = collectTokenAliasGraph(document.tokens);
  const issues: ValidationIssue[] = [];

  for (const [path, references] of graph) {
    for (const reference of references) {
      if (!paths.has(reference)) {
        issues.push(
          issue(
            "token.reference.missing",
            path,
            `Token "${path}" references missing token "${reference}".`
          )
        );
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  function visit(path: string): void {
    if (visited.has(path)) {
      return;
    }

    if (visiting.has(path)) {
      const cycleStart = stack.indexOf(path);
      const cycle = [...stack.slice(Math.max(cycleStart, 0)), path].join(" -> ");
      issues.push(
        issue("token.reference.circular", path, `Circular token reference detected: ${cycle}.`)
      );
      return;
    }

    visiting.add(path);
    stack.push(path);

    for (const reference of graph.get(path) ?? []) {
      if (paths.has(reference)) {
        visit(reference);
      }
    }

    stack.pop();
    visiting.delete(path);
    visited.add(path);
  }

  for (const path of graph.keys()) {
    visit(path);
  }

  return issues;
}

export const defaultTokenDocument: Pick<TokenDocument, "schemaVersion" | "kind"> = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "tokens",
};
