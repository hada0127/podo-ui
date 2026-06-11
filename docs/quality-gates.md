# Quality Gates

Phase 10 defines the release quality gates for Podo v2. The commands are intentionally local-first so contributors can reproduce CI failures.

## Required Commands

```sh
pnpm check
pnpm test:studio:e2e
pnpm build
```

`pnpm check` runs typecheck, lint, unit/integration tests, and format checks. `pnpm test:studio:e2e` runs the Playwright browser workflow for the installed-project Studio. `pnpm build` verifies package and example compilation.

## Test Coverage Map

| Gate                   | Evidence                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests             | `packages/spec/src/schema.test.ts`, `packages/tokens/src/index.test.ts`, `packages/codegen/src/index.test.ts`, `packages/cli/src/index.test.ts`                                    |
| Visual regression      | `packages/web/src/__snapshots__/index.test.ts.snap`, `packages/react/src/__snapshots__/index.test.tsx.snap`                                                                        |
| Accessibility          | `packages/core/src/index.test.ts`, `packages/web/src/index.test.ts`, `packages/react/src/index.test.tsx`, `packages/hono/src/index.test.tsx`, `packages/native/src/index.test.tsx` |
| Build output snapshots | `packages/tokens/src/__snapshots__`, `packages/icons/src/__snapshots__`, `packages/codegen/src/__snapshots__`                                                                      |
| Cross-target parity    | `packages/codegen/src/parity.test.ts`                                                                                                                                              |
| CLI e2e                | `packages/cli/src/index.test.ts` creates temp projects and runs `podo init`, `podo validate`, `podo build`, `podo update`, and `podo migrate`                                      |
| Studio e2e             | `packages/studio/src/index.test.ts` covers API workflows; `packages/studio/e2e/studio.spec.ts` uses Playwright for setup, token override, and build UI workflows                   |
| MCP integration        | `packages/mcp/src/index.test.ts` exercises MCP read tools and an in-memory MCP client/server transport                                                                             |

## Package Size Budgets

Budgets are measured on published ESM output after tree-shaking/minification in CI. They are starting limits for MVP and should only be raised with a release note.

| Package        |       Budget |
| -------------- | -----------: |
| `@podo/web`    |  16 KiB gzip |
| `@podo/react`  |  18 KiB gzip |
| `@podo/native` |  18 KiB gzip |
| `@podo/cli`    | 300 KiB gzip |
| `@podo/mcp`    | 220 KiB gzip |

Rules:

- Runtime packages must not pull CLI-only dependencies.
- `@podo/react` and `@podo/native` keep React as a peer dependency.
- Binary icon fonts are budgeted as generated assets, not runtime JavaScript.

## Release Blocking Rules

- Any schema, resolver, codegen, CLI, Studio, or MCP regression test failure blocks release.
- Snapshot changes are allowed only when the source JSON or renderer contract change is intentional.
- CLI and MCP write paths must preserve dry-run or validation-first behavior.
- Example builds must stay green because they are used as installation smoke tests.
