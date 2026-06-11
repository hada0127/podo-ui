# Icon Guide

Podo icons are built from SVG sources into WOFF/WOFF2 font assets, CSS classes, TypeScript icon names, and React Native glyph maps.

## SVG Source Rules

Each SVG must:

- include a root `<svg>` element
- include `viewBox`
- use `currentColor` for paint
- avoid fixed root `width` and `height`

Example:

```svg
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 12h16" stroke="currentColor" stroke-width="2" />
</svg>
```

## Manifest

```json
{
  "schemaVersion": "2.0.0",
  "kind": "icons",
  "fontFamily": "PodoIcons",
  "icons": {
    "menu": {
      "source": "navigation/menu.svg",
      "codepoint": "E003",
      "tags": ["navigation"]
    }
  },
  "groups": {
    "navigation": ["menu"]
  },
  "codepointLock": {
    "menu": "E003"
  }
}
```

## Groups

Groups let the icon builder emit a subset font:

```ts
import { buildIconAssets } from "@podo/icons";

await buildIconAssets({
  manifest,
  svgRoot: ".podo/icons/svg",
  outDir: ".podo/generated/icons",
  groups: ["navigation"],
  fontTypes: ["woff", "woff2"],
});
```

Use stable group names such as `navigation`, `editor`, `commerce`, or product-specific feature names.

## Codepoint Lock

`codepointLock` prevents accidental glyph remapping. Changing an existing icon codepoint should be treated as a migration because users may cache font files and CSS.

## WOFF Build

The icon builder emits:

- `PodoIcons.woff`
- `PodoIcons.woff2`
- `PodoIcons.css`
- `PodoIcons.icons.ts`
- `PodoIcons.native.ts`
- `PodoIcons.metadata.json`

Project builds use the icon manifest under `.podo/icons/manifest.json`:

```sh
podo build
```

The CSS class shape is:

```css
.podo-icon-menu::before {
  content: "\E003";
}
```

Web and React renderers use the font class. React Native uses the generated glyph map as the MVP default; target-specific SVG component adapters can be added later for multi-color or per-icon tree-shaking needs.
