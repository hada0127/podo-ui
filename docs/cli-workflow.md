# CLI Workflow

Phase 4 implements the local `podo` CLI foundation. Phase 7 adds update and migration commands.

## Commands

- `podo init`: creates `.podo` config, lock, directories, and framework bootstrap files.
- `podo build`: builds tokens, icons, and component target files from package defaults plus project overrides.
- `podo validate`: validates `.podo` config, lock, tokens, components, and icon manifest.
- `podo ui`: starts the local Podo Studio Web UI for `.podo` setup, editing, validation, and build.
- `podo mcp`: starts the Podo MCP stdio server for AI tools.
- `podo update`: plans migrations and reports conflicts without writing files.
- `podo migrate`: applies reviewed migrations to `.podo` specs and updates `.podo/lock.json`.

## Project Safety

- `init` writes only inside `.podo`.
- `build` writes to the configured `build.outDir` or `--out-dir`.
- `build --dry-run` returns the planned file list without writing generated files.
- Build cache state is stored in `.podo/cache/build.json`; unchanged inputs are skipped unless `--force` is used.
- `ui` file writes are limited to `.podo` JSON specs and SVG icon sources.
- `update` is dry-run only; migration reports must be written inside `.podo`.
- `migrate` writes only `.podo` JSON specs and `.podo/lock.json`.

## Init Defaults

- Framework detection reads `package.json` dependencies.
- Detection priority is React Native/Expo, Hono, React, then Web.
- Non-interactive usage:

```sh
podo init --target react --theme dashboard --out-dir src/podo --yes
```

## Validation

- Validation reports can be written with `podo validate --report .podo/report.json`.
- Lock schema mismatches emit a migration-oriented issue and next action.
- Error logs use `[podo:error]`, and next actions use `[podo:next]`.

## Migration

- Default dry-run:

```sh
podo update --dry-run --to 2.1.0
```

- Explicit manifest:

```sh
podo update --dry-run --manifest .podo/migrations/2.1.0.json
podo migrate --manifest .podo/migrations/2.1.0.json
```

- Blocking conflicts stop `podo migrate`; warnings are reported but do not block apply.
- See `docs/migration-workflow.md` for manifest shape, conflict rules, lockfile updates, and rollback.

## Studio

- Start Studio:

```sh
podo ui --host 127.0.0.1 --port 4873
```

- CI and smoke checks can use `podo ui --dry-run`.
- `podo ui --once` starts the Hono server and immediately closes it after startup validation.
- Studio setup calls the same init/build pipeline as the CLI, so saved settings and generated outputs remain reproducible from `.podo` JSON.

## MCP

- Smoke check:

```sh
podo mcp --dry-run
```

- Claude Code registration:

```sh
claude mcp add podo -- npx podo mcp
```
