import { z } from "zod";
import { identifierSchema, issue, schemaVersionSchema, type ValidationIssue } from "./shared.js";

export const codepointSchema = z
  .string()
  .regex(/^[A-F0-9]{4,6}$/, "Use uppercase hexadecimal codepoints without the U+ prefix.");

export const iconDefinitionSchema = z.object({
  source: z.string().min(1),
  codepoint: codepointSchema,
  tags: z.array(z.string().min(1)).default([]),
  description: z.string().optional(),
});

export const iconManifestSchema = z.object({
  schemaVersion: schemaVersionSchema,
  kind: z.literal("icons"),
  fontFamily: z.string().min(1),
  icons: z.record(identifierSchema, iconDefinitionSchema),
  groups: z.record(identifierSchema, z.array(identifierSchema)),
  codepointLock: z.record(identifierSchema, codepointSchema),
});

export type IconManifest = z.infer<typeof iconManifestSchema>;

export function parseIconManifest(input: unknown): IconManifest {
  return iconManifestSchema.parse(input);
}

export function validateIconManifest(manifest: IconManifest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const iconNames = new Set(Object.keys(manifest.icons));

  for (const [groupName, groupIcons] of Object.entries(manifest.groups)) {
    const seenInGroup = new Set<string>();
    for (const iconName of groupIcons) {
      if (!iconNames.has(iconName)) {
        issues.push(
          issue(
            "icon.group.missing",
            `groups.${groupName}`,
            `Group "${groupName}" references missing icon "${iconName}".`
          )
        );
      }

      if (seenInGroup.has(iconName)) {
        issues.push(
          issue(
            "icon.group.duplicate",
            `groups.${groupName}`,
            `Group "${groupName}" contains duplicate icon "${iconName}".`
          )
        );
      }
      seenInGroup.add(iconName);
    }
  }

  for (const [iconName, icon] of Object.entries(manifest.icons)) {
    const lockedCodepoint = manifest.codepointLock[iconName];
    if (!lockedCodepoint) {
      issues.push(
        issue(
          "icon.codepointLock.missing",
          `icons.${iconName}`,
          `Icon "${iconName}" is missing a codepoint lock entry.`
        )
      );
      continue;
    }

    if (lockedCodepoint !== icon.codepoint) {
      issues.push(
        issue(
          "icon.codepointLock.mismatch",
          `icons.${iconName}.codepoint`,
          `Icon "${iconName}" uses ${icon.codepoint}, but lock file records ${lockedCodepoint}.`
        )
      );
    }
  }

  return issues;
}
