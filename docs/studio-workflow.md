# Studio Workflow

Phase 5 introduces `@podo/studio`, the installed-project lightweight Web UI served by `podo ui`.

## Runtime

- `@podo/studio` exposes a Hono app and a Node server helper.
- `@podo/cli` starts Studio through `podo ui` and injects CLI-backed setup, build, and validation actions.
- The default URL is `http://127.0.0.1:4873`.

## Project Safety

- Studio file reads and writes are restricted to `.podo`.
- Writable formats are JSON specs and SVG icon sources.
- JSON writes are parsed and validated before writing when the path maps to config, lock, token, component, or icon manifest schemas.
- `PUT /api/files` dry-runs return create/update/unchanged status, content hashes, and before/after
  previews so users can inspect diffs before writing.
- SVG writes reject missing `<svg>` roots and script tags.
- Build actions support dry-run plans through the CLI build action.

## UI Scope

- Setup: environment target, theme, dark mode, outDir, icon groups, save-and-build.
- Tokens: color swatches, typography, spacing, radius, token reference picker, project override write.
- Components: package/project component list, props, variants, states, slots, gnb/lng local templates.
- Icons: group JSON editor, SVG import, codepoint preview, rebuild action.
- Build: validation panel, dry-run file diff, target generated file preview.
- Migration: target version, optional manifest JSON, conflict report, file update preview, apply.

## API

- `GET /api/context`: project config, files, resolved tokens, components, icons, generated previews, validation issues.
- `GET /api/files?path=.podo/...`: read a `.podo` file.
- `PUT /api/files`: validate and plan/write a `.podo` JSON/SVG file. Editor component exports
  should be saved at `.podo/components/editor/{component-id}.component.json` after a dry-run diff
  preview has been reviewed.
- `POST /api/tokens/override`: merge a single token override into `.podo/themes/studio-overrides.tokens.json`.
- `POST /api/setup`: write initial setup and run the first build through injected actions.
- `POST /api/build`: run build or build dry-run through injected actions.
- `POST /api/validate`: run validation through injected actions or local Studio validation.
- `POST /api/migration/plan`: create a dry-run migration plan using the shared migration runner.
- `POST /api/migration/apply`: apply a reviewed migration to `.podo` and update the lockfile.
- `POST /api/components/local`: create gnb/lng local component specs.
- `POST /api/icons/svg`: import SVG icon sources.
- `PUT /api/icons/groups`: update icon manifest groups.
