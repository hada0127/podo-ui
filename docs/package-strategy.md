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

## ESM/CJS Support

Podo v2 is ESM-only for the first release. Every publishable package sets `type: module` and exposes `exports["."].import` plus `exports["."].types`.

CommonJS output is intentionally not generated in the MVP. If downstream projects require CJS later, add it as a separate compatibility target with explicit `exports["."].require`, tests, and size budget impact review.

Generated files are never edited manually. Source JSON and TypeScript modules must be enough to reproduce build outputs.
