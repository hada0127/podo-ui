# Icon Source Rules

Podo icon sources are SVG files that can be converted into icon fonts and native glyph maps.

## Required SVG Shape

Every source SVG must:

- include a root `<svg>` element
- include a `viewBox`
- omit fixed `width` and `height` on the root `<svg>`
- use `currentColor` for fill or stroke paint
- keep paths deterministic enough for snapshot builds

Recommended source form:

```xml
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="currentColor"/>
</svg>
```

## Build Flow

1. Validate source SVG rules.
2. Optimize SVG with SVGO while preserving `viewBox`.
3. Build WOFF and WOFF2 from the optimized SVG set.
4. Emit CSS classes, TypeScript icon-name unions, native glyph maps, and metadata.
5. Verify codepoint lock values before writing assets.

## Groups

Icon groups are declared in the icon manifest. Group builds create subsets by selecting only the icons in the requested groups. The source codepoint lock remains global so a subset cannot change the codepoint of an existing icon.
