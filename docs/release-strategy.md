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

## Release Verification

Run the release gate before publishing:

```sh
pnpm check
pnpm test:studio:e2e
pnpm build
pnpm release:verify
pnpm changeset:dry-run
```

`pnpm release:verify` checks package `exports`, TypeScript declaration entries, npm `files` allowlists, CLI/MCP bin shebangs and executable bits, root README/CHANGELOG/LICENSE files, and a dry-run MCP launch path. `pnpm changeset:dry-run` runs `changeset status --verbose` and `pnpm --filter './packages/*' pack --dry-run` to inspect version impact and tarball contents without publishing.

## Canary Policy

Canary releases use npm dist-tags and must not replace `latest`.

1. Run the release gate above on `v2`.
2. Run `pnpm changeset version --snapshot canary` on a disposable release branch or CI workspace.
3. Run `pnpm build && pnpm release:verify && pnpm changeset:dry-run`.
4. Publish with `changeset publish --tag canary --no-git-tag`.
5. Install in a sample project with `npm install @podo/cli@canary @podo/react@canary` and run `podo init`, `podo build --dry-run`, and `podo validate`.

Installing directly from `main` is allowed only for canary validation. Reproducible project installs should use npm versions or explicit git tags.
