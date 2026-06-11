# Second MVP Readiness

This document maps the second MVP completion checklist to repository evidence.

| Checklist item                         | Evidence                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native basic components          | `packages/native/src/index.test.tsx` renders Button, Input, Field, and Icon through injected React Native hosts and verifies theme context/token style propagation. |
| Studio setup and token/theme editing   | `packages/studio/e2e/studio.spec.ts` drives setup, dark/light token edits, and build from the browser UI; `packages/studio/src/index.test.ts` covers API writes.    |
| Studio component slot/variant editing  | `packages/studio/src/index.test.ts` creates local GNB/LNB-style components, edits JSON props/tokens, and reloads project component summaries.                       |
| Studio icon group management/rebuild   | `packages/studio/src/index.test.ts` updates icon groups, imports SVG sources, and verifies build API wiring; `docs/studio-workflow.md` documents the UI scope.      |
| `podo update --dry-run` migration flow | `packages/cli/src/index.test.ts` writes a migration report, plans updates, applies migration, and updates `.podo/lock.json`; guides document conflict handling.     |
| Claude Code/Codex MCP usage            | `docs/mcp-usage.md`, `docs/mcp-security.md`, and `AGENTS.md` document MCP registration, safe read tools, and Claude/Codex usage prompts.                            |

Required local checks:

```sh
pnpm check
pnpm test:studio:e2e
pnpm build
```
