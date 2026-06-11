# Component Spec Authoring Guide

Component specs are JSON contracts used by codegen, Studio, editor tooling, and MCP.

## File Shape

```json
{
  "schemaVersion": "2.0.0",
  "kind": "component",
  "id": "button",
  "name": "Button",
  "category": "atom",
  "status": "stable",
  "anatomy": [{ "name": "root" }, { "name": "label" }],
  "slots": [{ "name": "children", "required": true }],
  "props": [],
  "variants": [],
  "states": [],
  "tokens": {},
  "targets": {
    "web": { "supported": true, "limitations": [] },
    "react": { "supported": true, "limitations": [] },
    "hono": { "supported": true, "limitations": [] },
    "native": { "supported": true, "limitations": [] }
  },
  "accessibility": { "aria": [], "keyboard": [] },
  "examples": []
}
```

## Props

Supported prop kinds include `boolean`, `string`, `number`, `enum`, `union`, `object`, and `event`.

```json
{
  "name": "variant",
  "type": { "kind": "enum", "values": ["solid", "soft", "outline", "ghost"] },
  "default": "solid"
}
```

Events should describe payload shape, not a framework-specific callback signature.

## Slots

Slots describe composition points. Use `required` when the component is invalid without content and `repeated` when multiple children can be composed.

```json
{
  "name": "primary",
  "required": true,
  "repeated": true,
  "targets": {
    "web": { "name": "primary" },
    "react": { "name": "primary" },
    "native": { "name": "primary" }
  }
}
```

Slot-heavy components such as GNB/LNB should keep navigation data and child placement outside the base component renderer. The editor exports composition separately when layout/page specs are introduced.

## Variants And States

Variants describe author-controlled modes. States describe runtime conditions.

```json
{
  "name": "variant",
  "values": ["solid", "soft"],
  "default": "solid",
  "tokens": {
    "root.background": "{component.button.background}"
  }
}
```

Common states are `hover`, `active`, `focusVisible`, `disabled`, `loading`, `invalid`, and `checked`.

## Anatomy And Tokens

Anatomy names stable parts such as `root`, `label`, `icon`, `control`, `helper`, or `error`. Token bindings should use anatomy paths:

```json
{
  "root.background": "{component.button.background}",
  "label.color": "{component.button.text}"
}
```

## Accessibility

Document role, aria attributes, keyboard behavior, and focus management. This is required for functional components.

```json
{
  "role": "button",
  "aria": ["aria-disabled", "aria-busy"],
  "keyboard": ["Enter activates", "Space activates"],
  "focusManagement": "Use focus-visible state for keyboard focus."
}
```

## Target Support

Every spec declares support for `web`, `react`, `hono`, and `native`. Put limitations in the spec instead of hiding them in renderer code.

```json
{
  "native": {
    "supported": true,
    "limitations": ["Slots map to named props."]
  }
}
```
