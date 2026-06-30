# Agent Instructions

This repository is the `v2` orphan branch for Podo UI. Follow these instructions when working in this repository.

## Mission

Build Podo v2 as a JSON-spec-first TypeScript design system:

- Design tokens, component specs, icon metadata, themes, project overrides, builders, editor tooling, and MCP access are driven by validated JSON.
- The source planning documents are `plan.md` and `todo.md`.
- Work through `todo.md` in order unless the user explicitly changes priority.

## Required Workflow

1. Implement the next unchecked scope in `todo.md`.
2. Run local verification for that scope.
3. Ask both Claude Code and Agy for strict review.
4. Fix every blocking review finding.
5. Only after both reviews pass, update `todo.md` checkboxes for the completed scope.
6. Commit the passing scope.
7. Push the branch.
8. Continue to the next scope.

Do not check a task in `todo.md` before review approval. Do not commit unreviewed implementation work unless the user explicitly asks for a checkpoint commit.

## Scope Gates

Use the Phase sections in `todo.md` as the default review gate. If a Phase is too large, split it into a smaller contiguous scope and document the split in the final message or commit body.

## Branch And Git Rules

- Work on branch `v2`.
- Do not merge from `main` unless the user asks.
- You may inspect `main` with read-only commands such as `git show main:<path>`.
- Do not run destructive git commands.
- Preserve user changes.

## Project Constraints

- Use TypeScript as the default implementation language.
- Use pnpm workspaces.
- Prefer `@podo/*` scoped packages for v2.
- Keep JSON specs as the source of truth.
- Generated outputs must be reproducible from JSON specs and TypeScript source.
- Keep installed-project state inside `.podo`.
- CLI and MCP write operations must support dry-run and validation before writing.

## Quality Commands

Use these commands as the baseline when available:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm check
```

If a command cannot run because dependencies are not installed or the current phase has not implemented the required package yet, state that clearly in the review request and final update.

For ad-hoc visual checks of the running editor UI (not regression tests), use the `agent-browser` CLI per `docs/browser-testing.md`. Reproducible regression stays in Playwright/Vitest.

## Review Standard

Claude Code and Agy reviews must be strict. Ask reviewers to focus on:

- incorrect architecture decisions
- missed `todo.md` completion criteria
- broken or missing validation
- package/export/config mistakes
- generated-output reproducibility
- unsafe file writes
- migration/update risks
- test gaps that should block the current scope

Only non-blocking suggestions may remain unresolved before checking `todo.md`.

## Known Agent CLI Invocations

Use `--` before the prompt when invoking Claude Code with `--tools`; otherwise the prompt can be parsed as another tool value.

```bash
claude -p --permission-mode dontAsk --tools "Read,Grep,Bash" -- "Strictly review the current Podo v2 repository scope. Do not edit files. Return PASS only if the scope can be checked in todo.md."
```

If Claude Code tool-enabled print mode hangs in this repository, first verify the CLI itself with the safe-mode smoke command, then use safe-mode for a prompt-only review fallback.

```bash
claude -p --safe-mode --permission-mode dontAsk -- "Reply with OK only."
```

The `cc-telegram` project at `/Users/ourteam/project/cc-telegram` invokes Claude by starting `claude --dangerously-skip-permissions` and writing the prompt to stdin. This method was tested in this repository and should be the first fallback when `claude -p` hangs.

```bash
printf '%s' "Strictly review the current Podo v2 repository scope. Do not edit files. Return PASS only if the scope can be checked in todo.md." | claude --dangerously-skip-permissions
```

When tool-enabled Claude print mode keeps hanging but the model itself responds, disable tools and stream the result. This works for prompt-only reviews when the prompt already includes the needed evidence; if a report file is required, manually save the returned markdown.

```bash
claude -p --safe-mode --no-session-persistence --verbose --model sonnet --tools "" --output-format stream-json --include-partial-messages -- "Return a strict markdown review based only on the facts in this prompt."
```

For Agy print mode, put `--print-timeout` after the prompt.

```bash
agy --sandbox --print "Strictly review the current Podo v2 repository scope. Do not edit files. Return PASS only if the scope can be checked in todo.md." --print-timeout 10m
```

## Documentation Rules

- Keep `plan.md` as architecture intent.
- Keep `todo.md` as execution state.
- Put operational details in `docs/`.
- When the implementation diverges from `plan.md`, update the plan or document the decision before review.
