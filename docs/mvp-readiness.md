# MVP Readiness

This document maps the first MVP completion checklist to concrete repository evidence.

| Checklist item                                  | Evidence                                                                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON schemas                                    | `@podo/spec` exports token, component, icon, `.podo/config.json`, and `.podo/lock.json` parsers with validation tests in `packages/spec/src/schema.test.ts`.                 |
| Button/Input/Field/Icon/Typography sample specs | Component samples live in `packages/spec/samples/components`; icon manifest lives in `packages/spec/samples/icons/podo-icons.json`; typography tokens live in token samples. |
| Landing/dashboard and light/dark token builds   | `packages/tokens/src/index.test.ts` snapshots CSS, TypeScript, React Native, and JSON bundle output across theme and color-scheme combinations.                              |
| Icon WOFF and manifest generation               | `packages/icons/src/index.test.ts` builds deterministic `PodoIcons.woff`, `PodoIcons.woff2`, CSS, TypeScript names, native glyph map, and metadata from the manifest.        |
| Web/React/Hono Button rendering                 | `packages/web/src/index.test.ts`, `packages/react/src/index.test.tsx`, and `packages/hono/src/index.test.tsx` render Button behavior and snapshots.                          |
| `podo init`, `podo validate`, `podo build`      | `packages/cli/src/index.test.ts` initializes temp projects, validates `.podo`, dry-runs builds, writes generated outputs, and verifies cache behavior.                       |
| `.podo` config and generated output             | CLI tests assert `.podo/config.json`, `.podo/lock.json`, icon manifest, generated token files, component files, and icon font outputs are created from project config.       |
| MCP read tools                                  | `packages/mcp/src/index.test.ts` covers `search_tokens`, `get_token`, `search_components`, and `get_component_spec` through direct tools and in-memory MCP transport.        |
| Installation and MCP guides                     | `docs/installation-guide.md` and `docs/mcp-usage.md` cover setup, build, framework integration, and agent access.                                                            |

Required local checks:

```sh
pnpm check
pnpm test:studio:e2e
pnpm build
```
