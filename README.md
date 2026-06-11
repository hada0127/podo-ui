# Podo UI v2

Podo UI v2 is a JSON-spec-first TypeScript design system. Design tokens, component specifications, icon metadata, themes, project overrides, builders, editor tooling, and MCP access are built around validated JSON contracts.

## Packages

- `@podo/spec`: JSON schemas, parsers, and TypeScript contracts.
- `@podo/tokens`: token loading, merging, resolving, and target emitters.
- `@podo/icons`: icon manifest validation and font/native asset builders.
- `@podo/core`: shared behavior, accessibility, registry, and state helpers.
- `@podo/web`, `@podo/react`, `@podo/hono`, `@podo/native`: runtime component targets.
- `@podo/editor` and `@podo/studio`: design-system authoring and installed-project UI tools.
- `@podo/cli`: `podo` project setup/build/update command.
- `@podo/mcp`: Model Context Protocol server for AI tool access to Podo specs.

## Local Workflow

```sh
pnpm install
pnpm check
pnpm test:studio:e2e
pnpm build
pnpm release:verify
```

Use `pnpm examples:build` to compile only the example projects. Use `pnpm changeset:dry-run` before publishing to inspect Changesets version impact and npm tarball contents without publishing.

## Installed Projects

```sh
podo init --target react --theme dashboard
podo build --dry-run
podo build
```

Project-local Podo state lives under `.podo`. The CLI, Studio, and MCP tools must validate JSON specs before writing and keep generated outputs reproducible from JSON source.

## Documentation

See [plan.md](./plan.md) and [todo.md](./todo.md) for the current architecture and execution checklist. Operational guides live in [docs](./docs).
