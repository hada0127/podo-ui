# Spec Versioning

Podo v2 uses `schemaVersion` on every JSON contract:

- token documents
- component documents
- icon manifests
- `.podo/config.json`
- `.podo/lock.json`
- migration manifests

The first v2 schema version is `2.0.0`.

## Non-Breaking Changes

Non-breaking schema changes may ship in minor or patch releases:

- adding optional fields
- adding enum values when existing consumers can ignore unknown values
- adding new sample specs
- relaxing validation without changing emitted behavior
- adding new warning-level validation issues

## Breaking Changes

Breaking schema changes require a major schema version and a migration entry:

- removing or renaming fields
- changing required fields
- changing token path semantics
- changing alias resolution semantics
- changing component target support meaning
- changing `.podo` merge priority
- turning an existing valid document into an error

## Migration Rules

Every breaking change must include:

- source schema version
- target schema version
- machine-readable operation list
- dry-run output
- rollback guidance

Installed projects must never be silently rewritten. CLI and MCP write tools must validate, show a diff, and support dry-run before applying migrations.

The Phase 7 runner is implemented in `@podo/migration`. It supports JSON Patch plus Podo-specific operations (`renameToken`, `moveComponentProp`, `removeDeprecatedToken`), conflict detection, lockfile updates, and the rollback workflow documented in `docs/migration-workflow.md`.
