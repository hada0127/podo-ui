# MCP Usage

Phase 6 adds `@podo/mcp`, a Model Context Protocol stdio server for Podo v2 specs.

## Start

```sh
podo mcp
```

The package also exposes:

```sh
podo-mcp
```

Claude Code registration:

```sh
claude mcp add podo -- npx podo mcp
```

Codex can use the MCP server when MCP configuration is available. Configure the command as `podo mcp` or `npx podo mcp` with the project root as the working directory. When MCP is not available, agents can fall back to reading `.podo/config.json`, `.podo/tokens`, `.podo/themes`, `.podo/components`, and `.podo/icons/manifest.json` directly.

Smoke check:

```sh
podo mcp --dry-run
```

## Read Tools

- `get_system_overview`: version, schema, targets, themes, components, icons, validation count.
- `search_tokens`: search by token path, type, value, or references.
- `get_token`: raw value, resolved value, references, origin metadata.
- `search_components`: search by name, category, prop, slot, or target.
- `get_component_spec`: complete component JSON spec.
- `get_component_example`: target-specific usage examples.
- `validate_podo_project`: validate `.podo` config, tokens, themes, components, and icons.
- `explain_migration`: explain lock schema mismatch and migration state.

## Suggest Tool

- `suggest_component_spec`: returns a draft component spec and never writes files.

## Prompt Examples

```text
Use Podo MCP to find the Button component spec and generate a React usage example with the correct import.
```

```text
Search Podo tokens for dashboard typography and explain which token controls h1 size.
```

```text
Suggest a local component spec for a gnb with brand, primary navigation, and actions slots. Do not write files.
```

## Claude Code Examples

Review a local token change:

```text
Use the Podo MCP server. Run validate_podo_project, then explain any token alias or component token binding issues. Do not edit files.
```

Generate a component draft:

```text
Use suggest_component_spec to draft a command menu component with trigger, content, item, and empty slots. Return JSON only and do not write files.
```

Explain an update:

```text
Use explain_migration for the current project and summarize whether podo update --dry-run is safe to apply.
```

## Codex Examples

Implementation-oriented prompt:

```text
Use Podo MCP to inspect get_component_spec for Button and Field, then update the local React screen to use their supported props only. Run podo validate after changes.
```

Token lookup prompt:

```text
Search tokens for dashboard typography and color-scheme-specific text colors. Use get_token for each match before editing CSS.
```

Migration prompt:

```text
Run validate_podo_project and explain_migration. If conflicts exist, prepare a dry-run-only migration report under .podo/reports without modifying token or component specs.
```

## Write Safety

The current MCP surface is read-first. `suggest_component_spec` returns a draft and does not write. Any future write tool must support validation and dry-run output before it writes under `.podo`.
