# Release Strategy

The v2 release flow keeps the useful parts of the existing `main` branch while switching the source of truth from SCSS and handwritten framework files to JSON specifications.

## Main Branch Patterns To Keep

The existing `main` branch already demonstrates several release patterns that remain useful:

- npm `exports` for framework-specific entry points
- npm `files` allowlist to avoid publishing development files
- package `bin` entries for MCP and CLI commands
- target-specific build scripts such as library, CDN, and MCP builds
- `prepublishOnly` as a final local safety net before publish
- MCP data packaged with the npm release

## v2 Changes

Podo v2 replaces SCSS-first build inputs with JSON-first build inputs:

1. Load package default token/component/icon specs.
2. Merge installed-project `.podo` overrides.
3. Validate all JSON specs.
4. Resolve tokens and component bindings.
5. Emit target-specific packages and generated project files.

## Versioning

Changesets is the default versioning and publishing tool. The root package is private. Runtime packages are public and versioned through Changesets.

The Changesets base branch is currently `v2` because this branch is an orphan rebuild branch. When v2 becomes the release base or merges back into the normal release branch, revisit `.changeset/config.json`.

## Canary Policy

Installing directly from `main` is allowed only for canary validation. Reproducible project installs should use npm versions or explicit git tags.
