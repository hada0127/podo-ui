# Editor Workflow

Phase 8 introduces `@podo/editor` as the design-system development editor surface.

## Runtime Shape

- The editor package exports `PodoEditorApp`, a React/tldraw prototype.
- Run the development editor with `pnpm --filter @podo/editor dev`.
- `PodoComponentShapeUtil` registers the `podo-component` custom shape.
- Shape props store component id, label, selected variant, props JSON, slots JSON, width, and height.
- The custom shape follows tldraw's ShapeUtil model: props validators, geometry, render component, resize handling, and selection indicator.
- tldraw shape changes are synchronized back into `EditorCanvasState` through shape side effects.

## Canvas Editing

- `dropComponentOnCanvas` places a component spec as an editor node.
- `updateComponentNodeProps` replaces node props without mutating the input state, so removed keys stay removed.
- `composeSlot` attaches a child node to a named slot and blocks invalid or non-repeated slot placement.
- Slot composition rejects circular parent/child graphs.
- tldraw sync drops slot child ids that no longer exist on the canvas.
- `responsiveViewports` defines desktop/tablet/mobile previews aligned with the existing 12/6/4 grid convention.
- `exportComponentSpecFromNode` converts a canvas node back to a `.component.json`-compatible component spec.
- `createComponentSpecExportFile` returns the `.component.json` path and contents that callers can write to disk.

## Layout/Page Boundary

Component specs own:

- props, slots, states, variants
- token bindings
- target support
- accessibility contracts

Layout specs should own:

- node placement
- slot composition
- responsive frames
- local editor overrides

Page specs should own route-level metadata, data requirements, SEO, and navigation order. The current MVP exports component specs directly and documents this boundary before adding a separate layout/page schema.

## Figma Variables

- `importFigmaVariables` converts a normalized Figma variable collection into Podo token JSON.
- `exportFigmaVariables` converts Podo token JSON back to a Figma variable payload.
- Color values are converted between Figma `{ r, g, b, a }` floats and hex tokens.
- Figma `VARIABLE_ALIAS` values are converted into Podo `{token.path}` aliases and exported back for color, float, and string variables.
- spacing/radius FLOAT values are imported as px values so they pass token validation.
- Path collisions such as `color/brand` plus `color/brand/primary` are rejected instead of overwritten.

## GitHub Sync Decision

Use CI-managed sync:

- Figma import/export runs in a GitHub Action.
- The action opens a pull request containing JSON token changes.
- Required checks: `pnpm check`, `pnpm build`, and `podo update --dry-run`.
- The browser editor does not push directly to GitHub in the MVP.
