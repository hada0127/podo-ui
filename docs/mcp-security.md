# MCP Security

Podo MCP is read-only by default in Phase 6.

## Write Policy

- Tool names that write files must use a `write_*` prefix.
- Write tools must accept `dryRun: true` and return the planned file list before writing.
- Write tools must restrict paths to `.podo`.
- Write tools must validate JSON or SVG content before writing.
- Write tools must return validation issues instead of partially writing invalid specs.

Phase 6 ships no file-writing MCP tools. `suggest_component_spec` only returns JSON content with `dryRun: true` and an empty `writes` list.

## Safe Registration

Claude Code:

```sh
claude mcp add podo -- npx podo mcp
```

Use the server from a trusted project root. The server reads package defaults and the current project's `.podo` files.

## Agent Boundaries

- Prefer MCP read tools for token/component lookup.
- Use CLI or Studio for file writes until a reviewed `write_*` MCP tool exists.
- For migrations, request `explain_migration` first and use `podo update --dry-run` when Phase 7 is available.
