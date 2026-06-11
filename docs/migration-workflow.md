# Migration Workflow

Phase 7 introduces `@podo/migration`, `podo update`, `podo migrate`, and the Studio Migration tab.

## Manifest Contract

Migration manifests are JSON specs:

```json
{
  "schemaVersion": "2.0.0",
  "kind": "migration-manifest",
  "packageName": "@podo/ui",
  "packageVersion": "2.1.0",
  "from": "2.0.0",
  "to": "2.1.0",
  "riskLevel": "low",
  "notes": ["Explain the project impact."],
  "operations": [
    { "op": "renameToken", "from": "color.primary", "to": "color.brand" },
    { "op": "moveComponentProp", "component": "button", "from": "isDisabled", "to": "disabled" },
    { "op": "removeDeprecatedToken", "path": "color.legacy", "replacement": "color.brand" }
  ]
}
```

Low-level JSON Patch operations are also supported with an optional `files` list:

```json
{ "op": "replace", "path": "/themes/default", "value": "dashboard", "files": [".podo/config.json"] }
```

## CLI Flow

- `podo update --dry-run`: loads `.podo/lock.json`, creates or reads a migration manifest, scans `.podo` JSON specs, and prints planned updates plus conflicts.
- `podo update --dry-run --manifest .podo/migrations/2.1.0.json`: uses an explicit manifest.
- `podo migrate --dry-run`: runs the same planner without writing files.
- `podo migrate --manifest .podo/migrations/2.1.0.json`: applies reviewed changes and updates `.podo/lock.json`.

Reports can be written inside `.podo`:

```sh
podo update --dry-run --report .podo/migration-report.json
```

## Conflict Rules

Blocking conflicts stop `podo migrate` and Studio apply:

- `renameToken` target exists with a different value.
- `moveComponentProp` target prop already exists.
- `removeDeprecatedToken` removes a referenced token without a replacement.

Warnings are shown but do not block apply:

- `removeDeprecatedToken` targets a token that is not marked deprecated.

## Lockfile Update

Successful apply updates `.podo/lock.json`:

- `packageVersion` is set to the manifest `to` version.
- `migrations` records `from`, `to`, `status: "applied"`, and `appliedAt`.
- `generatedHash` is recalculated from the manifest and migrated file hashes.

Run `podo build` after migration to refresh generated target outputs.

## Studio Flow

The Studio Migration tab calls:

- `POST /api/migration/plan` for dry-run plans.
- `POST /api/migration/apply` for reviewed apply.

Studio uses the same runner as the CLI and writes only `.podo` files.

## Rollback Strategy

Rollback is intentionally external and explicit:

1. Before applying, review `podo update --dry-run --report .podo/migration-report.json`.
2. Apply only on a clean git working tree or after saving unrelated work.
3. If migration output is wrong, revert the changed `.podo` files and `.podo/lock.json` with normal VCS tools.
4. Re-run `podo update --dry-run` after fixing the manifest or conflicts.
5. Re-run `podo build` only after the corrected migration has been applied.

The migration runner does not write outside `.podo`, so rollback scope is bounded to project Podo state and generated outputs rebuilt from it.
