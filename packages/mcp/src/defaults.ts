import {
  parseComponentDocument,
  PODO_SCHEMA_VERSION,
  type ComponentDocument,
  type IconManifest,
  type TokenDocument,
} from "@podo/spec";

export const defaultMcpTokens: TokenDocument = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "tokens",
  category: "theme",
  tokens: {
    color: {
      brand: { $type: "color", $value: "#5B5BD6" },
      text: { $type: "color", $value: "#14151A" },
      inverse: { $type: "color", $value: "#FFFFFF" },
      danger: { $type: "color", $value: "#D92D20" },
    },
    semantic: {
      color: {
        text: {
          default: { $type: "color", $value: "{color.text}" },
          inverse: { $type: "color", $value: "{color.inverse}" },
          danger: { $type: "color", $value: "{color.danger}" },
        },
      },
    },
    component: {
      button: {
        background: { $type: "color", $value: "{color.brand}" },
        text: { $type: "color", $value: "{color.inverse}" },
      },
      input: {
        background: { $type: "color", $value: "{color.inverse}" },
        border: { $type: "color", $value: "{color.text}" },
      },
    },
    spacing: {
      scale: {
        "1": { $type: "spacing", $value: "4px" },
        "2": { $type: "spacing", $value: "8px" },
        "4": { $type: "spacing", $value: "16px" },
      },
    },
    radius: {
      control: {
        md: { $type: "radius", $value: "8px" },
      },
    },
    typography: {
      h1: {
        landing: {
          $type: "typography",
          $value: {
            fontFamily: "Pretendard",
            fontSize: "64px",
            lineHeight: "72px",
            fontWeight: 700,
            letterSpacing: "0px",
          },
        },
        dashboard: {
          $type: "typography",
          $value: {
            fontFamily: "Pretendard",
            fontSize: "28px",
            lineHeight: "36px",
            fontWeight: 600,
            letterSpacing: "0px",
          },
        },
      },
    },
  },
};

export const defaultMcpComponents: ComponentDocument[] = [
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    description: "Action trigger with variants, slots, and token-bound states.",
    anatomy: [{ name: "root" }, { name: "label" }],
    slots: [{ name: "children", required: true }],
    props: [
      { name: "variant", type: { kind: "enum", values: ["solid", "soft", "outline"] } },
      { name: "disabled", type: { kind: "boolean" }, default: false },
    ],
    variants: [{ name: "variant", values: ["solid", "soft", "outline"], default: "solid" }],
    states: [{ name: "disabled" }, { name: "loading" }, { name: "focusVisible" }],
    tokens: {
      "root.background": "{component.button.background}",
      "label.color": "{component.button.text}",
    },
    targets: supportedTargets(),
    accessibility: { role: "button", aria: ["aria-disabled"], keyboard: ["Enter", "Space"] },
    examples: [
      {
        target: "react",
        title: "React button",
        code: 'import { Button } from "@podo/react";\n\n<Button>Save</Button>',
      },
      {
        target: "hono",
        title: "Hono button",
        code: 'import { Button } from "@podo/hono";\n\n<Button>Save</Button>',
      },
      { target: "web", title: "Web button", code: "<podo-button>Save</podo-button>" },
      {
        target: "native",
        title: "Native button",
        code: 'import { Button } from "@podo/native";\n\n<Button>Save</Button>',
      },
    ],
  }),
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "input",
    name: "Input",
    category: "atom",
    status: "stable",
    description: "Text entry control with invalid and disabled states.",
    anatomy: [{ name: "root" }, { name: "control" }],
    slots: [],
    props: [
      { name: "value", type: { kind: "string" } },
      { name: "invalid", type: { kind: "boolean" }, default: false },
    ],
    variants: [],
    states: [{ name: "disabled" }, { name: "invalid" }, { name: "focusVisible" }],
    tokens: {
      "root.background": "{component.input.background}",
      "root.borderColor": "{component.input.border}",
    },
    targets: supportedTargets(),
    accessibility: { aria: ["aria-invalid", "aria-required", "aria-describedby"] },
    examples: [
      {
        target: "react",
        title: "React input",
        code: 'import { Input } from "@podo/react";\n\n<Input />',
      },
      {
        target: "hono",
        title: "Hono input",
        code: 'import { Input } from "@podo/hono";\n\n<Input name="email" />',
      },
    ],
  }),
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "field",
    name: "Field",
    category: "molecule",
    status: "stable",
    description: "Form field wrapper for labels, controls, descriptions, and errors.",
    anatomy: [{ name: "root" }, { name: "label" }, { name: "control" }, { name: "error" }],
    slots: [
      { name: "label", required: true },
      { name: "control", required: true },
      { name: "error" },
    ],
    props: [{ name: "invalid", type: { kind: "boolean" }, default: false }],
    variants: [],
    states: [{ name: "invalid" }],
    tokens: {
      "label.color": "{semantic.color.text.default}",
      "error.color": "{semantic.color.text.danger}",
    },
    targets: supportedTargets(),
    accessibility: { aria: ["aria-describedby", "aria-invalid", "aria-required"] },
    examples: [
      {
        target: "react",
        title: "React field",
        code: 'import { Field, Input } from "@podo/react";\n\n<Field label="Email"><Input /></Field>',
      },
    ],
  }),
];

export const defaultMcpIconManifest: IconManifest = {
  schemaVersion: PODO_SCHEMA_VERSION,
  kind: "icons",
  fontFamily: "PodoIcons",
  icons: {
    menu: { codepoint: "E001", source: "navigation/menu.svg", tags: ["navigation"] },
    "chevron-left": {
      codepoint: "E002",
      source: "navigation/chevron-left.svg",
      tags: ["navigation"],
    },
  },
  groups: { navigation: ["menu", "chevron-left"] },
  codepointLock: { menu: "E001", "chevron-left": "E002" },
};

function supportedTargets(): ComponentDocument["targets"] {
  return {
    web: { supported: true, limitations: [] },
    react: { supported: true, limitations: [] },
    hono: { supported: true, limitations: [] },
    native: { supported: true, limitations: [] },
  };
}
