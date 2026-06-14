import {
  PODO_SCHEMA_VERSION,
  parseComponentDocument,
  parseTokenDocument,
  type ComponentDocument,
  type TokenDocument,
} from "@podo/spec";

const targets: ComponentDocument["targets"] = {
  web: { supported: true, limitations: [] },
  react: { supported: true, limitations: [] },
  hono: { supported: true, limitations: ["Events render as attributes only in SSR output."] },
  native: { supported: true, limitations: ["Slots map to named props."] },
};

const legacyColorValues = {
  primary: {
    base: "#7c3aed",
    hover: "#6d28d9",
    pressed: "#5b21b6",
    focus: "#6d28d9",
    fill: "#f3e8ff",
    reverse: "#ffffff",
    outline: "rgba(124, 58, 237, 0.3)",
  },
  default: {
    base: "#f4f4f5",
    hover: "#ececef",
    pressed: "#e3e3e8",
    focus: "#d1d1d7",
    fill: "#f4f4f5",
    reverse: "#2c2c31",
    outline: "rgba(209, 209, 215, 0.3)",
  },
  "default-deep": {
    base: "#52525b",
    hover: "#3f3f46",
    pressed: "#2c2c31",
    focus: "#3f3f46",
    fill: "#f4f4f5",
    reverse: "#ffffff",
    outline: "rgba(63, 63, 70, 0.3)",
  },
  info: {
    base: "#1890ff",
    hover: "#0a73eb",
    pressed: "#144de1",
    focus: "#0a73eb",
    fill: "#eef6ff",
    reverse: "#ffffff",
    outline: "rgba(10, 115, 235, 0.3)",
  },
  link: {
    base: "#0ea5e9",
    hover: "#0284c7",
    pressed: "#0369a1",
    focus: "#0284c7",
    fill: "#f0f9ff",
    reverse: "#ffffff",
    outline: "rgba(2, 132, 199, 0.3)",
  },
  success: {
    base: "#0d9488",
    hover: "#0f766e",
    pressed: "#115e59",
    focus: "#0f766e",
    fill: "#f0fdfa",
    reverse: "#ffffff",
    outline: "rgba(15, 118, 110, 0.3)",
  },
  warning: {
    base: "#f19b0b",
    hover: "#e8840f",
    pressed: "#cd740b",
    focus: "#e8840f",
    fill: "#fffbeb",
    reverse: "#ffffff",
    outline: "rgba(232, 132, 15, 0.3)",
  },
  danger: {
    base: "#f04646",
    hover: "#dc2626",
    pressed: "#b91c1c",
    focus: "#dc2626",
    fill: "#fef2f2",
    reverse: "#ffffff",
    outline: "rgba(220, 38, 38, 0.3)",
  },
} as const;

const systemColorValues = {
  bg: {
    modal: "#ffffff",
    disabled: "#e4e4e7",
    toggle: "#a1a1aa",
    indicator: "rgba(0, 0, 0, 0.09)",
    block: "#ffffff",
    "reverse-wb": "#ffffff",
    "reverse-bw": "#000000",
    elevation: "#fafafa",
    "elevation-1": "#ffffff",
    "elevation-2": "#ffffff",
    "elevation-3": "#ffffff",
  },
  border: {
    base: "#e4e4e7",
    hover: "#d1d1d7",
    pressed: "#a1a1aa",
    focus: "#d1d1d7",
    disabled: "rgba(0, 0, 0, 0.09)",
    alpha: "rgba(0, 0, 0, 0.18)",
  },
  text: {
    header: "#1c1c20",
    body: "#2c2c31",
    sub: "#71717a",
    action: "#71717a",
    "action-hover": "#52525b",
    "action-pressed": "#3f3f46",
    "action-focus": "#52525b",
    "action-disabled": "#a1a1aa",
    "action-reverse": "#ffffff",
  },
} as const;

const legacyDarkColorValues = {
  primary: {
    base: "#7c3aed",
    hover: "#8b5cf6",
    pressed: "#7c3aed",
    focus: "#8b5cf6",
    fill: "#111827",
    reverse: "#ffffff",
    outline: "rgba(158, 115, 254, 0.3)",
  },
  default: {
    base: "#34343a",
    hover: "#3f3f46",
    pressed: "#34343a",
    focus: "#3f3f46",
    fill: "#34343a",
    reverse: "#ffffff",
    outline: "rgba(63, 63, 70, 0.3)",
  },
  "default-deep": {
    base: "#a1a1aa",
    hover: "#d1d1d7",
    pressed: "#a1a1aa",
    focus: "#d1d1d7",
    fill: "#52525b",
    reverse: "#2c2c31",
    outline: "rgba(209, 209, 215, 0.3)",
  },
  info: {
    base: "#0a73eb",
    hover: "#1890ff",
    pressed: "#0a73eb",
    focus: "#1890ff",
    fill: "#1c1c20",
    reverse: "#ffffff",
    outline: "rgba(24, 144, 255, 0.3)",
  },
  link: {
    base: "#0284c7",
    hover: "#0ea5e9",
    pressed: "#0284c7",
    focus: "#0ea5e9",
    fill: "#1c1c20",
    reverse: "#ffffff",
    outline: "rgba(14, 165, 233, 0.3)",
  },
  success: {
    base: "#0d9488",
    hover: "#1bb0a2",
    pressed: "#0d9488",
    focus: "#1bb0a2",
    fill: "#1c1c20",
    reverse: "#ffffff",
    outline: "rgba(27, 176, 162, 0.3)",
  },
  warning: {
    base: "#e8840f",
    hover: "#f19b0b",
    pressed: "#e8840f",
    focus: "#f19b0b",
    fill: "#1c1c20",
    reverse: "#ffffff",
    outline: "rgba(241, 155, 11, 0.3)",
  },
  danger: {
    base: "#f04646",
    hover: "#f25959",
    pressed: "#f04646",
    focus: "#f25959",
    fill: "#1c1c20",
    reverse: "#ffffff",
    outline: "rgba(242, 89, 89, 0.3)",
  },
} as const;

const darkSystemColorValues = {
  bg: {
    modal: "#2c2c31",
    disabled: "#2c2c31",
    toggle: "#52525b",
    indicator: "rgba(255, 255, 255, 0.36)",
    block: "rgba(0, 0, 0, 0.09)",
    "reverse-wb": "#000000",
    "reverse-bw": "#ffffff",
    wt: "#ffffff",
    bk: "#000000",
    elevation: "#09090b",
    "elevation-1": "#18181b",
    "elevation-2": "#242429",
    "elevation-3": "#2c2c31",
  },
  border: {
    base: "#52525b",
    hover: "#71717a",
    pressed: "#52525b",
    focus: "#71717a",
    disabled: "rgba(255, 255, 255, 0.09)",
    alpha: "rgba(255, 255, 255, 0.18)",
  },
  text: {
    header: "#f4f4f5",
    body: "#e4e4e7",
    sub: "#a1a1aa",
    action: "#d1d1d7",
    "action-hover": "#f4f4f5",
    "action-pressed": "#d1d1d7",
    "action-focus": "#f4f4f5",
    "action-disabled": "#52525b",
    "action-reverse": "#ffffff",
  },
} as const;

const spacingScale = {
  "0": "0px",
  "1": "2px",
  "2": "4px",
  "3": "8px",
  "4": "12px",
  "5": "16px",
  "6": "24px",
  "7": "32px",
  "8": "40px",
  "9": "48px",
  "10": "64px",
  "11": "80px",
  "12": "96px",
  "13": "160px",
} as const;

const radiusScale = {
  "0": "0px",
  "1": "2px",
  "2": "4px",
  "3": "6px",
  "4": "8px",
  "5": "12px",
  "6": "20px",
  full: "9999px",
} as const;

const fontSizeScale = {
  "12": "12px",
  "14": "14px",
  "16": "16px",
  "18": "18px",
  "20": "20px",
  "24": "24px",
  "28": "28px",
  "32": "32px",
  "36": "36px",
  "42": "42px",
  "48": "48px",
  "54": "54px",
  "60": "60px",
} as const;

const typographyMixins = {
  heading: [
    ["h1", "54px", 600, "24px"],
    ["h2", "42px", 600, "18px"],
    ["h3", "36px", 600, "16px"],
  ],
  display: [
    ["display1", "60px", 600, "36px"],
    ["display2", "54px", 600, "32px"],
    ["display3", "48px", 600, "28px"],
    ["display4", "42px", 600, "24px"],
    ["display5", "36px", 600, "20px"],
    ["display6", "24px", 600, "18px"],
    ["display7", "20px", 600, "16px"],
  ],
  paragraph: [
    ["p1", "24px", 400, "20px"],
    ["p2", "20px", 400, "16px"],
    ["p3", "16px", 400, "14px"],
    ["p3-semibold", "16px", 600, "14px"],
    ["p4", "14px", 400, "12px"],
    ["p4-semibold", "14px", 600, "12px"],
    ["p5", "12px", 400, "12px"],
    ["p5-semibold", "12px", 600, "12px"],
  ],
} as const;

export const legacyTokenDocuments: TokenDocument[] = [
  parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "semantic",
    tokens: {
      color: {
        ...Object.fromEntries(
          Object.entries(legacyColorValues).map(([name, states]) => [
            name,
            Object.fromEntries(
              Object.entries(states).map(([state, value]) => [
                state,
                {
                  $type: value.startsWith("#") ? "color" : "string",
                  $value: value,
                  $description: `v1 --color-${name}${state === "base" ? "" : `-${state}`}`,
                  $extensions: {
                    podo: {
                      themeable: true,
                      scope: "semantic",
                      roles: ["color", name, state],
                    },
                  },
                },
              ])
            ),
          ])
        ),
        ...Object.fromEntries(
          Object.entries(systemColorValues).map(([group, values]) => [
            group,
            Object.fromEntries(
              Object.entries(values).map(([name, value]) => [
                name,
                {
                  $type: value.startsWith("#") ? "color" : "string",
                  $value: value,
                  $description: `v1 --color-${group === "border" && name === "base" ? "border" : `${group}-${name}`}`,
                  $extensions: {
                    podo: {
                      themeable: true,
                      scope: "semantic",
                      roles: ["color", group, name],
                    },
                  },
                },
              ])
            ),
          ])
        ),
      },
      component: {
        button: {
          gap: { $type: "spacing", $value: "{spacing.scale.2}" },
          borderWidth: { $type: "dimension", $value: "1px" },
          focusWidth: { $type: "dimension", $value: "4px" },
          theme: Object.fromEntries(
            Object.keys(legacyColorValues).map((theme) => [
              theme,
              {
                solid: {
                  background: { $type: "color", $value: `{color.${theme}.base}` },
                  color: { $type: "color", $value: `{color.${theme}.reverse}` },
                  border: { $type: "color", $value: `{color.${theme}.base}` },
                },
                fill: {
                  background: { $type: "color", $value: `{color.${theme}.fill}` },
                  color: { $type: "color", $value: `{color.${theme}.base}` },
                  border: { $type: "color", $value: `{color.${theme}.base}` },
                },
                border: {
                  background: { $type: "string", $value: "transparent" },
                  color: { $type: "color", $value: `{color.${theme}.base}` },
                  border: { $type: "color", $value: `{color.${theme}.base}` },
                },
                text: {
                  background: { $type: "string", $value: "transparent" },
                  color: { $type: "color", $value: `{color.${theme}.base}` },
                  border: { $type: "string", $value: "transparent" },
                },
                outline: { $type: "string", $value: `{color.${theme}.outline}` },
              },
            ])
          ),
          size: {
            xxs: {
              height: { $type: "dimension", $value: "27px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.2}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.2}" },
              typography: { $type: "typography", $value: "{typography.paragraph.p5}" },
            },
            xs: {
              height: { $type: "dimension", $value: "30px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.3}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.2}" },
              typography: { $type: "typography", $value: "{typography.paragraph.p4}" },
            },
            sm: {
              height: { $type: "dimension", $value: "42px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.3}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.3}" },
              typography: { $type: "typography", $value: "{typography.paragraph.p3}" },
            },
            md: {
              height: { $type: "dimension", $value: "56px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.4}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.5}" },
              typography: { $type: "typography", $value: "{typography.paragraph.p2}" },
            },
            lg: {
              height: { $type: "dimension", $value: "66px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.5}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.6}" },
              typography: { $type: "typography", $value: "{typography.paragraph.p1}" },
            },
          },
        },
      },
    },
  }),
  parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens: {
      dark: {
        color: {
          ...Object.fromEntries(
            Object.entries(legacyDarkColorValues).map(([name, states]) => [
              name,
              Object.fromEntries(
                Object.entries(states).map(([state, value]) => [
                  state,
                  {
                    $type: value.startsWith("#") ? "color" : "string",
                    $value: value,
                    $description: `v1 dark --color-${name}${state === "base" ? "" : `-${state}`}`,
                    $extensions: {
                      podo: {
                        themeable: true,
                        scope: "theme",
                        roles: ["color", "dark", name, state],
                      },
                    },
                  },
                ])
              ),
            ])
          ),
          ...Object.fromEntries(
            Object.entries(darkSystemColorValues).map(([group, values]) => [
              group,
              Object.fromEntries(
                Object.entries(values).map(([name, value]) => [
                  name,
                  {
                    $type: value.startsWith("#") ? "color" : "string",
                    $value: value,
                    $description: `v1 dark --color-${group === "border" && name === "base" ? "border" : `${group}-${name}`}`,
                    $extensions: {
                      podo: {
                        themeable: true,
                        scope: "theme",
                        roles: ["color", "dark", group, name],
                      },
                    },
                  },
                ])
              ),
            ])
          ),
        },
      },
    },
  }),
  parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "primitive",
    tokens: {
      spacing: {
        scale: Object.fromEntries(
          Object.entries(spacingScale).map(([name, value]) => [
            name,
            {
              $type: "spacing",
              $value: value,
              $description: `v1 s(${name})`,
              $extensions: { podo: { scope: "primitive", roles: ["spacing", "scale"] } },
            },
          ])
        ),
      },
      radius: {
        scale: Object.fromEntries(
          Object.entries(radiusScale).map(([name, value]) => [
            name,
            {
              $type: "radius",
              $value: value,
              $description: `v1 r(${name})`,
              $extensions: { podo: { scope: "primitive", roles: ["radius", "scale"] } },
            },
          ])
        ),
      },
    },
  }),
  parseTokenDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "tokens",
    category: "theme",
    tokens: {
      font: {
        family: {
          pretendard: {
            $type: "fontFamily",
            $value: "Pretendard",
            $description: "v1 default font family.",
            $extensions: { podo: { scope: "primitive", roles: ["font", "family"] } },
          },
        },
        weight: {
          regular: { $type: "fontWeight", $value: 400 },
          semibold: { $type: "fontWeight", $value: 600 },
          bold: { $type: "fontWeight", $value: 700 },
        },
        size: Object.fromEntries(
          Object.entries(fontSizeScale).map(([name, value]) => [
            name,
            {
              $type: "dimension",
              $value: value,
              $extensions: { podo: { scope: "primitive", roles: ["font", "size"] } },
            },
          ])
        ),
      },
      typography: Object.fromEntries(
        Object.entries(typographyMixins).map(([group, entries]) => [
          group,
          Object.fromEntries(
            entries.map(([name, size, weight, mobile]) => [
              name,
              {
                $type: "typography",
                $value: {
                  fontFamily: "Pretendard",
                  fontSize: size,
                  lineHeight: lineHeightForFontSize(size),
                  fontWeight: weight,
                  letterSpacing: "0px",
                  paragraphSpacing: "0px",
                },
                $description: `v1 ${name} mixin; mobile font-size ${mobile}.`,
                $extensions: {
                  podo: { themeable: true, scope: "theme", roles: ["typography", group, name] },
                },
              },
            ])
          ),
        ])
      ),
    },
  }),
];

export const legacyComponents: ComponentDocument[] = [
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "button",
    name: "Button",
    category: "atom",
    status: "stable",
    description: "v1 styled button with theme, variant, size, icon, loading, and alignment props.",
    anatomy: [
      {
        name: "root",
        targets: { web: "button", react: "button", hono: "button", native: "Pressable" },
      },
      { name: "left-icon", targets: { web: "i", react: "icon", native: "icon" } },
      {
        name: "label",
        targets: { web: "text", react: "children", hono: "children", native: "Text" },
      },
      { name: "right-icon", targets: { web: "i", react: "rightIcon", native: "rightIcon" } },
    ],
    slots: [
      {
        name: "leftIcon",
        targets: { web: { name: "icon" }, react: { name: "icon" }, native: { name: "icon" } },
      },
      {
        name: "children",
        required: true,
        targets: {
          web: { name: "default" },
          react: { name: "children" },
          hono: { name: "children" },
          native: { name: "children" },
        },
      },
      {
        name: "rightIcon",
        targets: {
          web: { name: "rightIcon" },
          react: { name: "rightIcon" },
          native: { name: "rightIcon" },
        },
      },
    ],
    props: [
      {
        name: "theme",
        type: {
          kind: "enum",
          values: [
            "default",
            "primary",
            "default-deep",
            "info",
            "link",
            "success",
            "warning",
            "danger",
          ],
        },
        default: "primary",
        description: "v1 semantic button theme color.",
      },
      {
        name: "variant",
        type: { kind: "enum", values: ["solid", "fill", "border", "text"] },
        default: "solid",
        description: "v1 visual style variant.",
      },
      {
        name: "size",
        type: { kind: "enum", values: ["xxs", "xs", "sm", "md", "lg"] },
        default: "sm",
        description: "v1 button size.",
      },
      {
        name: "icon",
        type: { kind: "string" },
        required: false,
        description: "Left icon class name.",
      },
      {
        name: "rightIcon",
        type: { kind: "string" },
        required: false,
        description: "Right icon class name.",
      },
      { name: "loading", type: { kind: "boolean" }, required: false, default: false },
      { name: "disabled", type: { kind: "boolean" }, required: false, default: false },
      {
        name: "textAlign",
        type: { kind: "enum", values: ["left", "center", "right"] },
        default: "center",
        description: "Content alignment.",
      },
    ],
    variants: [
      {
        name: "theme",
        values: [
          "default",
          "primary",
          "default-deep",
          "info",
          "link",
          "success",
          "warning",
          "danger",
        ],
        default: "primary",
      },
      { name: "variant", values: ["solid", "fill", "border", "text"], default: "solid" },
      { name: "size", values: ["xxs", "xs", "sm", "md", "lg"], default: "sm" },
      { name: "text-align", values: ["left", "center", "right"], default: "center" },
    ],
    states: [
      { name: "hover", description: "Uses v1 -hover color tokens." },
      { name: "active", description: "Uses v1 -pressed color tokens." },
      { name: "focusVisible", description: "Uses v1 4px outline ring token." },
      { name: "disabled", description: "Uses v1 disabled background/text/border tokens." },
      { name: "loading", description: "Shows pending state while preserving button size." },
    ],
    tokens: {
      "root.background": "{component.button.theme.primary.solid.background}",
      "root.color": "{component.button.theme.primary.solid.color}",
      "root.borderColor": "{component.button.theme.primary.solid.border}",
      "root.borderWidth": "{component.button.borderWidth}",
      "root.height": "{component.button.size.sm.height}",
      "root.paddingX": "{component.button.size.sm.paddingX}",
      "root.paddingY": "{component.button.size.sm.paddingY}",
      "root.radius": "{component.button.size.sm.radius}",
      "root.gap": "{component.button.gap}",
      "root.typography": "{component.button.size.sm.typography}",
      "focus.outlineWidth": "{component.button.focusWidth}",
      "focus.outlineColor": "{component.button.theme.primary.outline}",
    },
    targets,
    accessibility: {
      role: "button",
      aria: ["aria-disabled", "aria-busy"],
      keyboard: ["Enter activates", "Space activates"],
      focusManagement: "Use focus-visible state for keyboard focus.",
    },
    examples: [
      { target: "react", title: "v1 primary", code: '<Button theme="primary">Submit</Button>' },
      { target: "web", title: "v1 HTML", code: '<button class="primary">Submit</button>' },
    ],
  }),
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "field",
    name: "Field",
    category: "molecule",
    status: "stable",
    description: "Form field composition using v1 spacing and text tokens.",
    anatomy: [{ name: "root" }, { name: "label" }, { name: "control" }, { name: "message" }],
    slots: [{ name: "label" }, { name: "control", required: true }, { name: "message" }],
    props: [
      { name: "invalid", type: { kind: "boolean" }, default: false },
      { name: "required", type: { kind: "boolean" }, default: false },
    ],
    variants: [],
    states: [{ name: "invalid", tokens: { "message.color": "{color.danger.base}" } }],
    tokens: {
      "root.gap": "{spacing.scale.2}",
      "label.typography": "{typography.paragraph.p4-semibold}",
      "label.color": "{color.text.body}",
      "message.typography": "{typography.paragraph.p5}",
      "message.color": "{color.text.sub}",
    },
    targets,
    accessibility: { aria: ["aria-describedby", "aria-invalid"], keyboard: [] },
    examples: [{ target: "react", title: "Field", code: '<Field label="Email"><Input /></Field>' }],
  }),
  parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: "input",
    name: "Input",
    category: "atom",
    status: "stable",
    description: "v1 form input mapped to spacing, radius, border, and typography tokens.",
    anatomy: [
      {
        name: "root",
        targets: { web: "input", react: "input", hono: "input", native: "TextInput" },
      },
    ],
    slots: [],
    props: [
      { name: "value", type: { kind: "string" }, required: false },
      { name: "placeholder", type: { kind: "string" }, required: false },
      { name: "disabled", type: { kind: "boolean" }, default: false },
      { name: "invalid", type: { kind: "boolean" }, default: false },
    ],
    variants: [],
    states: [
      { name: "focusVisible", tokens: { "root.borderColor": "{color.border.focus}" } },
      { name: "disabled", tokens: { "root.background": "{color.bg.disabled}" } },
      { name: "invalid", tokens: { "root.borderColor": "{color.danger.base}" } },
    ],
    tokens: {
      "root.background": "{color.bg.modal}",
      "root.color": "{color.text.body}",
      "root.borderColor": "{color.border.base}",
      "root.radius": "{radius.scale.3}",
      "root.paddingX": "{spacing.scale.4}",
      "root.paddingY": "{spacing.scale.3}",
      "root.typography": "{typography.paragraph.p3}",
    },
    targets,
    accessibility: { aria: ["aria-invalid", "aria-required"], keyboard: ["Tab focuses input"] },
    examples: [{ target: "react", title: "Input", code: '<Input placeholder="Email" />' }],
  }),
];

function lineHeightForFontSize(size: string): string {
  const numeric = Number.parseInt(size, 10);
  if (numeric >= 48) return `${numeric + 12}px`;
  if (numeric >= 32) return `${numeric + 8}px`;
  if (numeric >= 20) return `${numeric + 8}px`;
  return `${numeric + 6}px`;
}
