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

Codex can use the MCP server when MCP configuration is available. When MCP is not available, agents can fall back to reading `.podo/config.json`, `.podo/tokens`, `.podo/themes`, `.podo/components`, and `.podo/icons/manifest.json` directly.

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
