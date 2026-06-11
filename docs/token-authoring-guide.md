# Token Authoring Guide

Podo token files use DTCG-style JSON and are validated by `@podo/spec`.

## File Shape

```json
{
  "schemaVersion": "2.0.0",
  "kind": "tokens",
  "category": "theme",
  "tokens": {
    "color": {
      "brand": {
        "$type": "color",
        "$value": "#305cde",
        "$description": "Primary brand color"
      }
    }
  }
}
```

Required token fields are `$type` and `$value`. Optional fields include `$description` and `$extensions`.

## Aliases

Use `{token.path}` aliases when a token depends on another token.

```json
{
  "semantic": {
    "color": {
      "action": {
        "$type": "color",
        "$value": "{color.brand}"
      }
    }
  }
}
```

The resolver also accepts JSON Pointer references shaped like `#/tokens/color/brand/$value`. Alias cycles are validation errors.

## Theme Overrides

Theme-specific segments are projected during build.

```json
{
  "typography": {
    "h1": {
      "landing": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "64px",
          "lineHeight": "72px",
          "fontWeight": 700,
          "letterSpacing": "0px",
          "paragraphSpacing": "24px"
        }
      },
      "dashboard": {
        "$type": "typography",
        "$value": {
          "fontFamily": "{font.family.sans}",
          "fontSize": "28px",
          "lineHeight": "36px",
          "fontWeight": 600,
          "letterSpacing": "0px",
          "paragraphSpacing": "12px"
        }
      }
    }
  }
}
```

Color scheme segments use `light` and `dark`. Project-specific files live in `.podo/tokens`.

## Podo Extensions

```json
{
  "$extensions": {
    "podo": {
      "themeable": true,
      "roles": ["heading", "dashboard"],
      "scope": "theme",
      "deprecated": false
    }
  }
}
```

Use `scope` to mark `primitive`, `semantic`, `component`, or `theme` ownership. Use `migration` metadata when a token is renamed or removed.

## Naming Rules

- Use lowercase path segments.
- Prefer nouns for primitives: `color.brand`, `spacing.scale.2`.
- Prefer role names for semantic tokens: `semantic.color.text.default`.
- Prefer component ownership for component tokens: `component.button.background`.
- Do not encode target frameworks in token names; target differences belong in builders.
