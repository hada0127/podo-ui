# Package Strategy

Podo v2 uses scoped npm packages as the first release strategy:

- `@podo/spec`
- `@podo/tokens`
- `@podo/icons`
- `@podo/core`
- `@podo/web`
- `@podo/react`
- `@podo/hono`
- `@podo/native`
- `@podo/editor`
- `@podo/studio`
- `@podo/cli`
- `@podo/mcp`

The scoped package model is the default because each runtime has different dependency, bundle, and release constraints. A single `podo-ui` compatibility package can be added later with subpath exports if adoption requires it.

## Initial Decision

The v2 MVP will publish `@podo/*` packages. The CLI package owns the `podo` binary, and the MCP package can also be launched through `podo mcp`.

## Export Rules

Each publishable package must expose:

- ESM import entry
- TypeScript declaration entry
- explicit `files` allowlist
- stable subpath exports only when needed

Generated files are never edited manually. Source JSON and TypeScript modules must be enough to reproduce build outputs.
