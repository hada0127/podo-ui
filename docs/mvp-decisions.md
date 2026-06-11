# MVP Decisions

These decisions close the postponed v2 MVP choices in `todo.md`.

| Decision area                | MVP decision                                                                  | Rationale                                                                                                                                  | Revisit trigger                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Web Component implementation | Use direct Custom Elements, not Lit.                                          | Keeps `@podo/web` dependency-free and small while the component set is limited to Button, Input, Field, Icon, and Typography.              | Add Lit or another base only if component complexity requires controllers, async rendering, or templates. |
| React implementation         | Use native React renderers, not Web Component wrappers.                       | Controlled inputs, refs, event handlers, Testing Library coverage, and React theme context stay idiomatic.                                 | Revisit only if web/react parity costs exceed wrapper drawbacks.                                          |
| Hono Declarative Shadow DOM  | Do not include Declarative Shadow DOM in official MVP support.                | Hono is a static TSX/SSR target; interactive Web Component hydration and FOUC management need a separate client-entry design.              | Add DSD after a client hydration strategy and SSR compatibility tests exist.                              |
| React Native icons           | Use generated glyph maps as the default; SVG component adapters are optional. | The icon source remains SVG, web output remains WOFF/WOFF2, and native can consume stable codepoints without requiring a web font runtime. | Add SVG component output if teams need per-icon tree shaking or multi-color icons.                        |
| Package strategy             | Publish scoped `@podo/*` packages first.                                      | Each target has different dependencies, peer dependencies, and size budgets; a single `podo-ui` compatibility package can be added later.  | Add a compatibility package only after adoption data shows install friction.                              |
| Figma integration            | Support variable import/export and GitHub Action PR sync for MVP.             | Browser-side direct pushes and full plugin workflow add auth and review risk; CI PR sync keeps JSON changes reviewable.                    | Add plugin/REST write flows after token sync conflicts, auth, and review policies are tested.             |
| Editor canvas                | Standardize on tldraw for the MVP editor canvas.                              | The current editor already has a custom tldraw shape, resize handling, slot composition, and JSON export/import paths.                     | Compare alternatives when page/layout schema editing or higher-scale canvas performance becomes a limit.  |

Related documents:

- `docs/component-renderer-mvp.md`
- `docs/icon-guide.md`
- `docs/package-strategy.md`
- `docs/editor-workflow.md`
- `docs/release-strategy.md`
