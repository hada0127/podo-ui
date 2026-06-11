# Agent Review Protocol

Each completed scope must pass both Claude Code and Agy review before `todo.md` is checked and before the scope is committed.

## Default Scope

The default scope is one Phase from `todo.md`. If a Phase is too large, use a smaller contiguous slice and state the slice explicitly in the review prompt.

## Claude Code Review Command Template

```bash
claude -p --permission-mode dontAsk --tools "Read,Grep,Bash" -- \
  "Strictly review the current Podo v2 repository scope. Read AGENTS.md, plan.md, todo.md, and the git diff. Do not edit files. Focus on blockers against the current todo scope, architecture risks, missing validation, package/config mistakes, and unsafe writes. Return PASS only if the scope can be checked in todo.md; otherwise list blocking findings with file/line references."
```

The `--` separator before the prompt is required when `--tools` is present. Without it, Claude Code may treat the prompt as part of the tools list and fail with `Input must be provided either through stdin or as a prompt argument when using --print`.

If a tool-enabled Claude Code print review hangs, verify the CLI path with safe mode before retrying:

```bash
claude -p --safe-mode --permission-mode dontAsk -- "Reply with OK only."
```

In this repository, that smoke command has returned `OK`. A prompt-only safe-mode review can be used as a fallback when the tool-enabled review is blocked, but the prompt must include the current scope, local verification results, and the relevant diff or implementation summary.

## Agy Review Command Template

```bash
agy --sandbox --print \
  "Strictly review the current Podo v2 repository scope. Read AGENTS.md, plan.md, todo.md, and the git diff. Do not edit files. Focus on blockers against the current todo scope, architecture risks, missing validation, package/config mistakes, and unsafe writes. Return PASS only if the scope can be checked in todo.md; otherwise list blocking findings with file/line references."
```

## Pass Criteria

- The implemented scope satisfies its `todo.md` completion criteria.
- Local verification has run or any skipped verification is justified.
- Both review outputs say the scope can pass.
- Blocking findings are fixed and re-reviewed.

## Commit Criteria

Commit only after:

1. local verification passes,
2. Claude Code review passes,
3. Agy review passes,
4. `todo.md` is updated for the completed scope.

Use concise commit messages:

```text
chore: initialize v2 workspace
feat(spec): add token schema
feat(cli): add podo validate
```
