import { describe, expect, it } from "vitest";
import {
  applyJsonPatch,
  createDefaultMigrationManifest,
  detectMigrationConflicts,
  parseMigrationManifest,
  runMigrationPlan,
  updateLockAfterMigration,
  type MigrationManifest,
} from "./index.js";

describe("@podo/migration", () => {
  it("parses migration manifests and applies JSON Patch operations", () => {
    const manifest = parseMigrationManifest({
      schemaVersion: "2.0.0",
      kind: "migration-manifest",
      packageVersion: "2.1.0",
      from: "2.0.0",
      to: "2.1.0",
      operations: [{ op: "replace", path: "/name", value: "next" }],
    });

    expect(manifest.operations).toHaveLength(1);
    expect(
      applyJsonPatch({ name: "old" }, [{ op: "replace", path: "/name", value: "next" }])
    ).toEqual({
      name: "next",
    });
    expect(applyJsonPatch({ name: "old", keep: true }, [{ op: "remove", path: "/name" }])).toEqual({
      keep: true,
    });
  });

  it("renames tokens, rewrites aliases, removes deprecated tokens, and moves props", () => {
    const manifest: MigrationManifest = parseMigrationManifest({
      schemaVersion: "2.0.0",
      kind: "migration-manifest",
      packageVersion: "2.1.0",
      from: "2.0.0",
      to: "2.1.0",
      operations: [
        { op: "renameToken", from: "color.primary", to: "color.brand" },
        { op: "removeDeprecatedToken", path: "color.legacy", replacement: "color.brand" },
        { op: "moveComponentProp", component: "button", from: "isDisabled", to: "disabled" },
      ],
    });
    const tokenDocument = {
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "theme",
      tokens: {
        color: {
          primary: { $type: "color", $value: "#3366ff" },
          legacy: {
            $type: "color",
            $value: "{color.primary}",
            $extensions: { podo: { deprecated: true } },
          },
          text: { $type: "color", $value: "{color.legacy}" },
        },
      },
    };
    const componentDocument = {
      schemaVersion: "2.0.0",
      kind: "component",
      id: "button",
      name: "Button",
      category: "atom",
      status: "stable",
      anatomy: [{ name: "root" }],
      slots: [],
      props: [{ name: "isDisabled", type: { kind: "boolean" }, required: false }],
      variants: [],
      states: [],
      tokens: { "root.background": "{color.primary}" },
      targets: {
        web: { supported: true, limitations: [] },
        react: { supported: true, limitations: [] },
        hono: { supported: true, limitations: [] },
        native: { supported: true, limitations: [] },
      },
      accessibility: { aria: [], keyboard: [] },
      examples: [],
    };

    const plan = runMigrationPlan({
      manifest,
      dryRun: true,
      files: [
        { path: ".podo/themes/legacy.tokens.json", document: tokenDocument },
        { path: ".podo/components/button.component.json", document: componentDocument },
      ],
    });

    expect(plan.conflicts).toEqual([]);
    expect(plan.hasChanges).toBe(true);
    const migratedTokens = plan.files[0]?.after as {
      tokens: { color: Record<string, { $value: string }> };
    };
    expect(migratedTokens.tokens.color.brand?.$value).toBe("#3366ff");
    expect("primary" in migratedTokens.tokens.color).toBe(false);
    expect("legacy" in migratedTokens.tokens.color).toBe(false);
    expect(migratedTokens.tokens.color.text?.$value).toBe("{color.brand}");
    const migratedComponent = plan.files[1]?.after as typeof componentDocument;
    expect(migratedComponent.props[0]?.name).toBe("disabled");
    expect(migratedComponent.tokens["root.background"]).toBe("{color.brand}");
  });

  it("detects blocking conflicts and leaves files unchanged", () => {
    const manifest = createDefaultMigrationManifest({ from: "1.0.0", to: "2.0.0" });
    const sourceDocument = {
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "theme",
      tokens: {
        color: {
          primary: { $type: "color", $value: "#111111" },
        },
      },
    };
    const targetDocument = {
      schemaVersion: "2.0.0",
      kind: "tokens",
      category: "theme",
      tokens: {
        color: {
          brand: { $type: "color", $value: "#222222" },
        },
      },
    };
    const conflicts = detectMigrationConflicts(
      [
        { path: ".podo/themes/source.tokens.json", document: sourceDocument },
        { path: ".podo/themes/target.tokens.json", document: targetDocument },
      ],
      manifest
    );
    const plan = runMigrationPlan({
      manifest,
      files: [
        { path: ".podo/themes/source.tokens.json", document: sourceDocument },
        { path: ".podo/themes/target.tokens.json", document: targetDocument },
      ],
    });

    expect(conflicts.some((conflict) => conflict.severity === "blocking")).toBe(true);
    expect(plan.files[0]?.action).toBe("unchanged");
  });

  it("blocks deprecated token removal when another file still references it", () => {
    const manifest = parseMigrationManifest({
      schemaVersion: "2.0.0",
      kind: "migration-manifest",
      packageVersion: "2.1.0",
      from: "2.0.0",
      to: "2.1.0",
      operations: [{ op: "removeDeprecatedToken", path: "color.legacy" }],
    });
    const conflicts = detectMigrationConflicts(
      [
        {
          path: ".podo/themes/legacy.tokens.json",
          document: {
            schemaVersion: "2.0.0",
            kind: "tokens",
            category: "theme",
            tokens: {
              color: {
                legacy: {
                  $type: "color",
                  $value: "#111111",
                  $extensions: { podo: { deprecated: true } },
                },
              },
            },
          },
        },
        {
          path: ".podo/components/button.component.json",
          document: { kind: "component", tokens: { "root.background": "{color.legacy}" } },
          kind: "unknown",
        },
      ],
      manifest
    );

    expect(conflicts).toContainEqual(
      expect.objectContaining({
        code: "migration.token.removeReferenced",
        path: ".podo/components/button.component.json",
        severity: "blocking",
      })
    );
  });

  it("updates lock migration state after apply", () => {
    const manifest = createDefaultMigrationManifest({ from: "0.0.0", to: "2.1.0" });
    const lock = updateLockAfterMigration({
      lock: {
        schemaVersion: "2.0.0",
        packageVersion: "0.0.0",
        migrations: [],
        generatedHash: "a".repeat(64),
      },
      manifest,
      generatedHash: "b".repeat(64),
      appliedAt: "2026-06-11T00:00:00.000Z",
    });

    expect(lock.packageVersion).toBe("2.1.0");
    expect(lock.generatedHash).toBe("b".repeat(64));
    expect(lock.migrations).toEqual([
      {
        from: "0.0.0",
        to: "2.1.0",
        status: "applied",
        appliedAt: "2026-06-11T00:00:00.000Z",
      },
    ]);
  });
});
