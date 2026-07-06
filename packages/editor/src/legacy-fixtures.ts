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

interface LegacyComponentInput {
  id: string;
  name: string;
  category: ComponentDocument["category"];
  description: string;
  // A part is either a bare name (flat) or { name, parent } for Figma-style
  // nesting (e.g. the datepicker's calendar nests under its dropdown).
  anatomy?: Array<string | { name: string; parent?: string }>;
  slots?: Array<Partial<ComponentDocument["slots"][number]> & { name: string }>;
  props?: ComponentDocument["props"];
  variants?: ComponentDocument["variants"];
  states?: ComponentDocument["states"];
  tokens?: ComponentDocument["tokens"];
  examples?: ComponentDocument["examples"];
  accessibility?: Partial<ComponentDocument["accessibility"]>;
}

function legacyComponent(input: LegacyComponentInput): ComponentDocument {
  return parseComponentDocument({
    schemaVersion: PODO_SCHEMA_VERSION,
    kind: "component",
    id: input.id,
    name: input.name,
    category: input.category,
    status: "stable",
    description: input.description,
    anatomy: (input.anatomy ?? ["root"]).map((entry) =>
      typeof entry === "string" ? { name: entry } : entry
    ),
    slots: input.slots ?? [],
    props: input.props ?? [],
    variants: input.variants ?? [],
    states: input.states ?? [],
    tokens: input.tokens ?? legacyBaseComponentTokens(),
    targets,
    accessibility: {
      aria: [],
      keyboard: [],
      ...input.accessibility,
    },
    examples: input.examples ?? [
      {
        target: "react",
        title: input.name,
        code: `<${input.name.replace(/\s+/g, "")} />`,
      },
    ],
  });
}

function legacyBaseComponentTokens(): ComponentDocument["tokens"] {
  // Intentionally empty: the vendored v1 CSS already drives every component's
  // base styling (colors, radius, gap, typography) through its own classes, and
  // componentAppearanceCss emits these bindings as `.podo-design-target X { … !important }`
  // which OVERRODE the v1 styling in the single preview — e.g. root.radius=6px
  // squared off the toggle's 9999px pill, and root.typography froze size-variant
  // font sizes. The matrix (includeBase=false) already renders correctly from v1
  // alone, so leaving the base empty makes the single preview match it. Components
  // that need a real non-default value bind it explicitly (e.g. form fields →
  // root.background {color.bg.block}; button → root.height).
  return {};
}

function enumProp(
  name: string,
  values: string[],
  options: { required?: boolean; default?: string; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "enum", values },
    required: options.required ?? false,
    ...(options.default !== undefined ? { default: options.default } : {}),
    ...(options.description ? { description: options.description } : {}),
  };
}

function stringProp(
  name: string,
  options: { required?: boolean; default?: string; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "string" },
    required: options.required ?? false,
    ...(options.default !== undefined ? { default: options.default } : {}),
    ...(options.description ? { description: options.description } : {}),
  };
}

function booleanProp(
  name: string,
  options: { required?: boolean; default?: boolean; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "boolean" },
    required: options.required ?? false,
    ...(options.default !== undefined ? { default: options.default } : {}),
    ...(options.description ? { description: options.description } : {}),
  };
}

function numberProp(
  name: string,
  options: { required?: boolean; default?: number; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "number" },
    required: options.required ?? false,
    ...(options.default !== undefined ? { default: options.default } : {}),
    ...(options.description ? { description: options.description } : {}),
  };
}

function objectProp(
  name: string,
  options: { required?: boolean; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "object" },
    required: options.required ?? false,
    ...(options.description ? { description: options.description } : {}),
  };
}

function eventProp(
  name: string,
  options: { required?: boolean; description?: string } = {}
): ComponentDocument["props"][number] {
  return {
    name,
    type: { kind: "event" },
    required: options.required ?? false,
    ...(options.description ? { description: options.description } : {}),
  };
}

// Basic ("기본") colors reference the base palette so the semantic layer is built
// from base color (Figma 색상 → 베이스 색상). Hue mapping matches Figma:
// primary→royal-blue, info/link→blue, success→green, warning→gold, danger→red,
// default/bg/border/text→gray.
const baseRef = (hue: string, step: number): string => `{color.base.${hue}.${step}}`;
const lightTone = (hue: string): Record<string, string> => ({
  base: baseRef(hue, 50),
  hover: baseRef(hue, 60),
  pressed: baseRef(hue, 70),
  focus: baseRef(hue, 60),
  fill: baseRef(hue, 5),
  reverse: baseRef("gray", 0),
  outline: baseRef(hue, 20),
});
const darkTone = (hue: string): Record<string, string> => ({
  base: baseRef(hue, 50),
  hover: baseRef(hue, 40),
  pressed: baseRef(hue, 50),
  focus: baseRef(hue, 40),
  fill: baseRef("gray", 90),
  reverse: baseRef("gray", 0),
  outline: baseRef(hue, 30),
});

const legacyColorValues = {
  primary: lightTone("royal-blue"),
  default: {
    base: baseRef("gray", 10),
    hover: baseRef("gray", 20),
    pressed: baseRef("gray", 30),
    focus: baseRef("gray", 30),
    fill: baseRef("gray", 10),
    reverse: baseRef("gray", 80),
    outline: baseRef("gray", 30),
  },
  "default-deep": {
    base: baseRef("gray", 60),
    hover: baseRef("gray", 70),
    pressed: baseRef("gray", 80),
    focus: baseRef("gray", 70),
    fill: baseRef("gray", 10),
    reverse: baseRef("gray", 0),
    outline: baseRef("gray", 40),
  },
  info: lightTone("blue"),
  link: lightTone("blue"),
  success: lightTone("green"),
  warning: lightTone("gold"),
  danger: lightTone("red"),
};

const systemColorValues = {
  bg: {
    modal: baseRef("gray", 0),
    disabled: baseRef("gray", 20),
    toggle: baseRef("gray", 40),
    indicator: baseRef("alpha-black", 10),
    block: baseRef("gray", 0),
    "reverse-wb": baseRef("gray", 0),
    "reverse-bw": baseRef("gray", 100),
    elevation: baseRef("gray", 5),
    "elevation-1": baseRef("gray", 0),
    "elevation-2": baseRef("gray", 0),
    "elevation-3": baseRef("gray", 0),
  },
  border: {
    base: baseRef("gray", 20),
    hover: baseRef("gray", 30),
    pressed: baseRef("gray", 40),
    focus: baseRef("gray", 30),
    disabled: baseRef("alpha-black", 10),
    alpha: baseRef("alpha-black", 20),
  },
  text: {
    header: baseRef("gray", 90),
    body: baseRef("gray", 80),
    sub: baseRef("gray", 50),
    action: baseRef("gray", 50),
    "action-hover": baseRef("gray", 60),
    "action-pressed": baseRef("gray", 70),
    "action-focus": baseRef("gray", 60),
    "action-disabled": baseRef("gray", 40),
    "action-reverse": baseRef("gray", 0),
  },
};

const legacyDarkColorValues = {
  primary: darkTone("royal-blue"),
  default: {
    base: baseRef("gray", 80),
    hover: baseRef("gray", 70),
    pressed: baseRef("gray", 80),
    focus: baseRef("gray", 70),
    fill: baseRef("gray", 80),
    reverse: baseRef("gray", 0),
    outline: baseRef("gray", 60),
  },
  "default-deep": {
    base: baseRef("gray", 40),
    hover: baseRef("gray", 30),
    pressed: baseRef("gray", 40),
    focus: baseRef("gray", 30),
    fill: baseRef("gray", 60),
    reverse: baseRef("gray", 80),
    outline: baseRef("gray", 30),
  },
  info: darkTone("blue"),
  link: darkTone("blue"),
  success: darkTone("green"),
  warning: darkTone("gold"),
  danger: darkTone("red"),
};

const darkSystemColorValues = {
  bg: {
    modal: baseRef("gray", 80),
    disabled: baseRef("gray", 80),
    toggle: baseRef("gray", 60),
    indicator: baseRef("alpha-white", 40),
    block: baseRef("alpha-black", 10),
    "reverse-wb": baseRef("gray", 100),
    "reverse-bw": baseRef("gray", 0),
    wt: baseRef("gray", 0),
    bk: baseRef("gray", 100),
    elevation: baseRef("gray", 90),
    "elevation-1": baseRef("gray", 90),
    "elevation-2": baseRef("gray", 80),
    "elevation-3": baseRef("gray", 80),
  },
  border: {
    base: baseRef("gray", 60),
    hover: baseRef("gray", 50),
    pressed: baseRef("gray", 60),
    focus: baseRef("gray", 50),
    disabled: baseRef("alpha-white", 10),
    alpha: baseRef("alpha-white", 20),
  },
  text: {
    header: baseRef("gray", 10),
    body: baseRef("gray", 20),
    sub: baseRef("gray", 40),
    action: baseRef("gray", 30),
    "action-hover": baseRef("gray", 10),
    "action-pressed": baseRef("gray", 30),
    "action-focus": baseRef("gray", 10),
    "action-disabled": baseRef("gray", 60),
    "action-reverse": baseRef("gray", 0),
  },
};

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

// Tuple layout: [name, fontSize, fontWeight, mobileFontSize, lineHeight].
// Display ships the v1 display scale; paragraph ships the v1 p1~p5 (+semibold)
// scale so components can bind to the same typography v1 uses. Headings stay
// project-set (see the Typography tokens screen).
// Figma v2 type scale (size-only; tag binding is project/theme work). fontSize is
// responsive (pc/tablet/mobile); line-height is a percentage that scales with it.
const typographyMixins = {
  display: [
    ["xlarge", { pc: "60px", tablet: "48px", mobile: "36px" }, 700, "120%"],
    ["large", { pc: "52px", tablet: "42px", mobile: "32px" }, 700, "120%"],
    ["medium", { pc: "44px", tablet: "36px", mobile: "28px" }, 700, "120%"],
    ["small", { pc: "38px", tablet: "34px", mobile: "26px" }, 700, "120%"],
    ["xsmall", { pc: "34px", tablet: "30px", mobile: "24px" }, 700, "120%"],
  ],
  heading: [
    ["xlarge", { pc: "32px", tablet: "28px", mobile: "24px" }, 700, "120%"],
    ["large", { pc: "28px", tablet: "24px", mobile: "20px" }, 700, "120%"],
    ["medium", { pc: "24px", tablet: "20px", mobile: "18px" }, 700, "120%"],
    ["small", { pc: "20px", tablet: "18px", mobile: "16px" }, 700, "120%"],
    ["xsmall", { pc: "16px", tablet: "16px", mobile: "14px" }, 700, "120%"],
    ["xxsmall", { pc: "14px", tablet: "14px", mobile: "13px" }, 700, "120%"],
  ],
  body: [
    ["xlarge", { pc: "20px", tablet: "20px", mobile: "18px" }, 400, "150%"],
    ["xlarge-bold", { pc: "20px", tablet: "20px", mobile: "18px" }, 600, "150%"],
    ["large", { pc: "18px", tablet: "18px", mobile: "16px" }, 400, "160%"],
    ["large-bold", { pc: "18px", tablet: "18px", mobile: "16px" }, 600, "160%"],
    ["medium", { pc: "16px", tablet: "16px", mobile: "14px" }, 400, "160%"],
    ["medium-bold", { pc: "16px", tablet: "16px", mobile: "14px" }, 600, "160%"],
    ["small", { pc: "14px", tablet: "14px", mobile: "13px" }, 400, "160%"],
    ["small-bold", { pc: "14px", tablet: "14px", mobile: "13px" }, 600, "160%"],
    ["xsmall", { pc: "13px", tablet: "13px", mobile: "12px" }, 400, "160%"],
    ["xsmall-bold", { pc: "13px", tablet: "13px", mobile: "12px" }, 600, "160%"],
  ],
} as const;

const legacyButtonThemes = [
  "default",
  "primary",
  "default-deep",
  "info",
  "link",
  "success",
  "warning",
  "danger",
] as const;

const legacyButtonVariants = ["solid", "fill", "border", "text"] as const;
const legacyButtonStateVariants = ["hover", "active"] as const;

type LegacyButtonTheme = (typeof legacyButtonThemes)[number];
type LegacyButtonVariant = (typeof legacyButtonVariants)[number];
type LegacyButtonStateVariant = (typeof legacyButtonStateVariants)[number];

interface ButtonStyleRefs {
  background: string;
  color: string;
  border: string;
}

function buttonToken(value: string) {
  return { $type: "color" as const, $value: value };
}

function buttonStyleTokens(style: ButtonStyleRefs) {
  return {
    background: buttonToken(style.background),
    color: buttonToken(style.color),
    border: buttonToken(style.border),
  };
}

function legacyButtonThemeTokens(theme: LegacyButtonTheme) {
  return {
    ...Object.fromEntries(
      legacyButtonVariants.map((variant) => [
        variant,
        {
          ...buttonStyleTokens(buttonStyleRefs(theme, variant)),
          ...Object.fromEntries(
            legacyButtonStateVariants.map((state) => [
              state,
              buttonStyleTokens(buttonStyleRefs(theme, variant, state)),
            ])
          ),
        },
      ])
    ),
    outline: buttonToken(`{color.${theme}.outline}`),
  };
}

function buttonStyleRefs(
  theme: LegacyButtonTheme,
  variant: LegacyButtonVariant,
  state?: LegacyButtonStateVariant
): ButtonStyleRefs {
  const tone = state === "hover" ? "hover" : state === "active" ? "pressed" : "base";
  const themeColor = `{color.${theme}.${tone}}`;
  const baseThemeColor = `{color.${theme}.base}`;
  const reverse = `{color.${theme}.reverse}`;
  const fill = `{color.${theme}.fill}`;

  if (theme === "default") {
    return defaultButtonStyleRefs(variant, state);
  }

  if (theme === "default-deep") {
    return defaultDeepButtonStyleRefs(variant, state);
  }

  if (variant === "solid") {
    return {
      background: state ? themeColor : baseThemeColor,
      color: reverse,
      border: baseThemeColor,
    };
  }

  if (variant === "fill") {
    return {
      background: fill,
      color: state ? themeColor : baseThemeColor,
      border: state ? themeColor : baseThemeColor,
    };
  }

  if (variant === "border") {
    return {
      background: "transparent",
      color: state ? themeColor : baseThemeColor,
      border: state ? themeColor : baseThemeColor,
    };
  }

  return {
    background: "transparent",
    color: state ? themeColor : baseThemeColor,
    border: "transparent",
  };
}

function defaultButtonStyleRefs(
  variant: LegacyButtonVariant,
  state?: LegacyButtonStateVariant
): ButtonStyleRefs {
  if (variant === "solid") {
    return {
      background:
        state === "hover"
          ? "{color.default.hover}"
          : state === "active"
            ? "{color.default.pressed}"
            : "{color.default.base}",
      color: "{color.default.reverse}",
      border: "{color.default.base}",
    };
  }

  if (variant === "fill") {
    return {
      background: "{color.default.fill}",
      color: "{color.default.reverse}",
      border:
        state === "hover"
          ? "{color.border.hover}"
          : state === "active"
            ? "{color.border.pressed}"
            : "{color.border.base}",
    };
  }

  if (variant === "border") {
    return {
      background: "transparent",
      color: "{color.default.reverse}",
      border:
        state === "hover"
          ? "{color.border.hover}"
          : state === "active"
            ? "{color.border.pressed}"
            : "{color.border.base}",
    };
  }

  return {
    background: "transparent",
    color:
      state === "hover"
        ? "{color.text.action-hover}"
        : state === "active"
          ? "{color.text.action-pressed}"
          : "{color.text.action}",
    border: "transparent",
  };
}

function defaultDeepButtonStyleRefs(
  variant: LegacyButtonVariant,
  state?: LegacyButtonStateVariant
): ButtonStyleRefs {
  if (variant === "fill") {
    return {
      background: "{color.default-deep.fill}",
      color: state === "active" ? "{color.default-deep.pressed}" : "{color.text.body}",
      border:
        state === "hover"
          ? "{color.border.hover}"
          : state === "active"
            ? "{color.border.pressed}"
            : "{color.border.base}",
    };
  }

  if (variant === "border") {
    return {
      background: "transparent",
      color: state === "active" ? "{color.default-deep.pressed}" : "{color.text.body}",
      border:
        state === "hover"
          ? "{color.default-deep.hover}"
          : state === "active"
            ? "{color.default-deep.pressed}"
            : "{color.default-deep.base}",
    };
  }

  if (variant === "text") {
    return {
      background: "transparent",
      color: state === "active" ? "{color.default-deep.pressed}" : "{color.text.body}",
      border: "transparent",
    };
  }

  return {
    background:
      state === "hover"
        ? "{color.default-deep.hover}"
        : state === "active"
          ? "{color.default-deep.pressed}"
          : "{color.default-deep.base}",
    color: "{color.default-deep.reverse}",
    border: "{color.default-deep.base}",
  };
}

function buttonDisabledTokens(variant: LegacyButtonVariant) {
  if (variant === "border") {
    return buttonStyleTokens({
      background: "transparent",
      color: "{color.text.action-disabled}",
      border: "{color.border.disabled}",
    });
  }
  if (variant === "text") {
    return buttonStyleTokens({
      background: "transparent",
      color: "{color.text.action-disabled}",
      border: "transparent",
    });
  }
  return buttonStyleTokens({
    background: "{color.bg.disabled}",
    color: "{color.text.action-disabled}",
    border: variant === "fill" ? "{color.border.disabled}" : "{color.bg.disabled}",
  });
}

// Figma "베이스 컬러" raw palette — the colors the basic colors are built from.
// Managed separately (color.base.*) and offered after basic colors in the picker.
const baseColorRamps: Record<string, Record<string, string>> = {
  red: { 5: "#FEF1F1", 10: "#FFE0DF", 20: "#FFADAD", 30: "#FF8985", 40: "#F56666", 50: "#F23B3B", 60: "#EE1818", 70: "#CD0404", 80: "#8F0000", 90: "#5F0000" }, // prettier-ignore
  rose: { 5: "#FEF1F2", 10: "#FCD9DC", 20: "#FAB7BD", 30: "#F8969E", 40: "#F66F7A", 50: "#F15764", 60: "#D63D4A", 70: "#BF3742", 80: "#992C35", 90: "#732128" }, // prettier-ignore
  green: { 5: "#ECF8EF", 10: "#C5E9CD", 20: "#A9DEB4", 30: "#81CF92", 40: "#57C16F", 50: "#3EA856", 60: "#38994E", 70: "#308242", 80: "#256533", 90: "#1C4D27" }, // prettier-ignore
  gold: { 5: "#FFF7E6", 10: "#FFEBC2", 20: "#FFD88A", 30: "#FFC654", 40: "#FFBB33", 50: "#FFAA00", 60: "#E89B00", 70: "#B57900", 80: "#8C5E00", 90: "#6B4700" }, // prettier-ignore
  orange: { 5: "#FFF4F0", 10: "#FFDACC", 20: "#FFB599", 30: "#FE9975", 40: "#FE8052", 50: "#FF6A33", 60: "#FF5212", 70: "#DB3B00", 80: "#992900", 90: "#661C00" }, // prettier-ignore
  blue: { 5: "#EBF5FF", 10: "#C7E3FF", 20: "#8FC8FF", 30: "#70B9FF", 40: "#56ACFF", 50: "#0095FF", 60: "#0074E5", 70: "#0056AA", 80: "#00407F", 90: "#002B55" }, // prettier-ignore
  "royal-blue": { 5: "#F1F4FD", 10: "#D0DBFB", 20: "#ABBEF7", 30: "#819EF3", 40: "#577DEF", 50: "#426CED", 60: "#1245E2", 70: "#123BBA", 80: "#0D2C8B", 90: "#091D5D" }, // prettier-ignore
  "classic-blue": { 5: "#F5F9FF", 10: "#E6F0FE", 20: "#CEE2FD", 30: "#A0C2EE", 40: "#76A0D8", 50: "#4A78B5", 60: "#34547E", 70: "#2D486C", 80: "#253C5A", 90: "#1E3048" }, // prettier-ignore
  gray: { 0: "#FFFFFF", 5: "#F9F9F9", 10: "#F4F4F5", 20: "#E4E4E7", 30: "#D1D2D6", 40: "#9FA2AD", 50: "#767985", 60: "#50555E", 70: "#3E424B", 80: "#27272A", 90: "#18181B", 100: "#000000" }, // prettier-ignore
  "alpha-white": { 5: "rgba(255, 255, 255, 0.05)", 10: "rgba(255, 255, 255, 0.1)", 20: "rgba(255, 255, 255, 0.25)", 30: "rgba(255, 255, 255, 0.3)", 40: "rgba(255, 255, 255, 0.4)", 50: "rgba(255, 255, 255, 0.5)", 60: "rgba(255, 255, 255, 0.6)", 70: "rgba(255, 255, 255, 0.7)", 80: "rgba(255, 255, 255, 0.8)", 90: "rgba(255, 255, 255, 0.9)" }, // prettier-ignore
  "alpha-black": { 5: "rgba(0, 0, 0, 0.05)", 10: "rgba(0, 0, 0, 0.1)", 20: "rgba(0, 0, 0, 0.25)", 30: "rgba(0, 0, 0, 0.3)", 40: "rgba(0, 0, 0, 0.4)", 50: "rgba(0, 0, 0, 0.5)", 60: "rgba(0, 0, 0, 0.6)", 70: "rgba(0, 0, 0, 0.7)", 80: "rgba(0, 0, 0, 0.8)", 90: "rgba(0, 0, 0, 0.9)" }, // prettier-ignore
};

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
                  $type: "color",
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
                  $type: "color",
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
        base: Object.fromEntries(
          Object.entries(baseColorRamps).map(([hue, steps]) => [
            hue,
            Object.fromEntries(
              Object.entries(steps).map(([step, value]) => [
                step,
                {
                  $type: "color",
                  $value: value,
                  $extensions: { podo: { scope: "primitive", roles: ["base", hue] } },
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
            legacyButtonThemes.map((theme) => [theme, legacyButtonThemeTokens(theme)])
          ),
          disabled: Object.fromEntries(
            legacyButtonVariants.map((variant) => [variant, buttonDisabledTokens(variant)])
          ),
          loading: {
            opacity: { $type: "number", $value: 0.72 },
          },
          size: {
            xxs: {
              height: { $type: "dimension", $value: "27px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.2}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.2}" },
              typography: { $type: "typography", $value: "{typography.body.xsmall}" },
            },
            xs: {
              height: { $type: "dimension", $value: "30px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.3}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.2}" },
              typography: { $type: "typography", $value: "{typography.body.small}" },
            },
            sm: {
              height: { $type: "dimension", $value: "42px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.3}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.3}" },
              typography: { $type: "typography", $value: "{typography.body.medium}" },
            },
            md: {
              height: { $type: "dimension", $value: "56px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.4}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.5}" },
              typography: { $type: "typography", $value: "{typography.body.xlarge}" },
            },
            lg: {
              height: { $type: "dimension", $value: "66px" },
              paddingX: { $type: "spacing", $value: "{spacing.scale.5}" },
              paddingY: { $type: "spacing", $value: "0px" },
              radius: { $type: "radius", $value: "{radius.scale.6}" },
              typography: { $type: "typography", $value: "{typography.body.xlarge}" },
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
                    $type: "color",
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
                    $type: "color",
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
            entries.map(([name, fontSize, weight, lineHeight]) => [
              name,
              {
                $type: "typography",
                $value: {
                  fontFamily: "Pretendard",
                  fontSize,
                  lineHeight,
                  fontWeight: weight,
                  letterSpacing: "0px",
                },
                $description: `Figma ${group} ${name} type style.`,
                $extensions: {
                  podo: { themeable: true, scope: "semantic", roles: ["typography", group, name] },
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
  legacyComponent({
    id: "avatar",
    name: "Avatar",
    category: "atom",
    description: "v1 profile image, icon, or text display component.",
    anatomy: [
      "root",
      { name: "image", parent: "root" },
      { name: "icon", parent: "root" },
      { name: "text", parent: "root" },
      { name: "activity-ring", parent: "root" },
    ],
    props: [
      enumProp("type", ["image", "icon", "text"], {
        default: "icon",
        description: "Avatar content type.",
      }),
      stringProp("src", { description: "Image URL for image avatars." }),
      stringProp("icon", { default: "icon-user", description: "Icon class name." }),
      stringProp("text", { description: "Text content; v1 displays the first two characters." }),
      enumProp("size", ["16", "20", "24", "28", "32", "36", "40", "48", "56"], {
        default: "56",
        description: "Pixel size.",
      }),
      booleanProp("activityRing", { default: false }),
      stringProp("className"),
      stringProp("alt", { default: "Avatar" }),
      eventProp("onClick", { description: "Click handler." }),
    ],
    variants: [
      { name: "type", values: ["image", "icon", "text"], default: "icon" },
      {
        name: "size",
        values: ["16", "20", "24", "28", "32", "36", "40", "48", "56"],
        default: "56",
      },
    ],
    states: [{ name: "hover", selector: ":hover" }],
    tokens: {
      ...legacyBaseComponentTokens(),
      // v1 icon/text avatars: border-token background, text-sub foreground. Pixel
      // size is driven by the `size` variant (default 56), not a token.
      "root.background": "{color.border.base}",
      "root.color": "{color.text.sub}",
      "root.radius": "{radius.scale.full}",
      "activity-ring.color": "{color.primary.base}",
    },
    accessibility: { aria: ["alt"], keyboard: ["Enter activates when clickable"] },
    examples: [{ target: "react", title: "Avatar", code: '<Avatar type="icon" size={40} />' }],
  }),
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
      { name: "left-icon", parent: "root", targets: { web: "i", react: "icon", native: "icon" } },
      {
        name: "label",
        parent: "root",
        targets: { web: "text", react: "children", hono: "children", native: "Text" },
      },
      {
        name: "right-icon",
        parent: "root",
        targets: { web: "i", react: "rightIcon", native: "rightIcon" },
      },
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
          values: [...legacyButtonThemes],
        },
        default: "default",
        description: "v1 semantic button theme color.",
      },
      {
        name: "variant",
        type: { kind: "enum", values: [...legacyButtonVariants] },
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
        values: [...legacyButtonThemes],
        default: "default",
      },
      { name: "variant", values: [...legacyButtonVariants], default: "solid" },
      { name: "size", values: ["xxs", "xs", "sm", "md", "lg"], default: "sm" },
      { name: "alignment", values: ["left", "center", "right"], default: "center" },
    ],
    states: [
      {
        name: "hover",
        description: "Uses v1 -hover color tokens for the selected theme and variant.",
        selector: ":hover",
        tokens: {
          "root.background": "{color.default.hover}",
          "root.color": "{color.default.reverse}",
          "root.borderColor": "{color.default.base}",
        },
      },
      {
        name: "active",
        description: "Uses v1 -pressed color tokens for the selected theme and variant.",
        selector: ":active",
        tokens: {
          "root.background": "{color.default.pressed}",
          "root.color": "{color.default.reverse}",
          "root.borderColor": "{color.default.base}",
        },
      },
      {
        name: "focusVisible",
        description: "Uses v1 4px outline ring token.",
        selector: ":focus-visible:not(:disabled)",
        tokens: {
          "focus.outlineWidth": "4px",
          "focus.outlineColor": "{color.default.outline}",
        },
      },
      {
        name: "disabled",
        description: "Uses v1 disabled background/text/border tokens.",
        selector: ":disabled",
        tokens: {
          "root.background": "{color.bg.disabled}",
          "root.color": "{color.text.action-disabled}",
          "root.borderColor": "{color.bg.disabled}",
        },
      },
      {
        name: "loading",
        description: "Shows pending state while preserving button size.",
        tokens: {
          "root.opacity": "0.72",
        },
      },
    ],
    tokens: {
      // The v1 button classes drive colors AND size (height / padding / radius /
      // gap / font, per theme·variant·size). Binding root.height/radius/etc. here
      // froze every size to `sm` (42px / 6px) in the single preview, so they're
      // omitted; the focus outline (no size dependence) stays.
      "focus.outlineWidth": "4px",
      "focus.outlineColor": "{color.default.outline}",
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
  legacyComponent({
    id: "checkbox-radio",
    name: "Checkbox & Radio",
    category: "atom",
    description: "v1 styled checkbox and radio inputs with grouped React component APIs.",
    anatomy: [
      "root",
      { name: "input", parent: "root" },
      { name: "control", parent: "root" },
      { name: "indicator", parent: "control" },
      { name: "label", parent: "root" },
      { name: "group", parent: "root" },
    ],
    props: [
      enumProp("control", ["checkbox", "radio", "radio-group"], {
        default: "checkbox",
        description: "Represents Checkbox, Radio, and Radio.Group from v1.",
      }),
      booleanProp("checked", { default: false }),
      booleanProp("indeterminate", {
        default: false,
        description: "Checkbox select-all state.",
      }),
      stringProp("name", { description: "Radio group name." }),
      stringProp("value", { description: "Radio value or current group value." }),
      objectProp("options", {
        description: "Radio.Group options: Array<{ value, label, disabled? }>",
      }),
      stringProp("label"),
      booleanProp("vertical", { default: false }),
      booleanProp("disabled", { default: false }),
      eventProp("onChange"),
    ],
    variants: [
      { name: "control", values: ["checkbox", "radio", "radio-group"], default: "checkbox" },
      { name: "layout", values: ["horizontal", "vertical"], default: "horizontal" },
    ],
    states: [
      // v1 checked control uses info blue (#1890ff), not primary purple.
      { name: "checked", tokens: { "control.background": "{color.info.base}" } },
      { name: "disabled", tokens: { "root.color": "{color.text.action-disabled}" } },
      { name: "focusVisible", tokens: { "control.borderColor": "{color.primary.focus}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      // The "root" part maps to the bare <input>, but the v1 checkbox/radio draws
      // its box (fill + border + check) entirely via a ::before SVG. A background
      // on the input therefore bleeds around that smaller SVG box, so clear it.
      "root.background": "transparent",
      "control.size": "{spacing.scale.6}",
      "control.borderColor": "{color.border.base}",
      "control.background": "{color.bg.modal}",
      "indicator.color": "{color.primary.reverse}",
    },
    accessibility: {
      aria: ["aria-checked", "aria-disabled"],
      keyboard: ["Space toggles checkbox", "Arrow keys move within radio group"],
    },
    examples: [
      { target: "react", title: "Checkbox", code: '<Checkbox label="Accept terms" />' },
      {
        target: "react",
        title: "Radio group",
        code: '<Radio.Group name="plan" options={[{ value: "free", label: "Free" }]} />',
      },
    ],
  }),
  legacyComponent({
    id: "chip",
    name: "Chip",
    category: "atom",
    description: "v1 tag/chip component for labels and categories.",
    anatomy: [
      "root",
      { name: "icon", parent: "root" },
      { name: "label", parent: "root" },
      { name: "delete-button", parent: "root" },
    ],
    slots: [{ name: "children", required: true }, { name: "icon" }, { name: "deleteButton" }],
    props: [
      objectProp("children", { required: true }),
      enumProp("theme", ["default", "blue", "green", "orange", "yellow", "red"], {
        default: "default",
      }),
      enumProp("type", ["default", "fill", "border"], { default: "default" }),
      enumProp("size", ["sm", "md"], { default: "md" }),
      booleanProp("round", { default: false }),
      stringProp("icon"),
      eventProp("onDelete", { description: "Shows delete affordance when present." }),
      stringProp("className"),
    ],
    variants: [
      {
        name: "theme",
        values: ["default", "blue", "green", "orange", "yellow", "red"],
        default: "default",
      },
      { name: "type", values: ["default", "fill", "border"], default: "default" },
      { name: "size", values: ["sm", "md"], default: "md" },
      { name: "shape", values: ["default", "round"], default: "default" },
    ],
    states: [{ name: "hover", selector: ":hover" }],
    tokens: {
      // Chip colors (theme + type) come entirely from the vendored v1 CSS classes
      // (.chip, .chip.blue, .chip.fill, .chip.border, …). Binding root.background/
      // color/borderColor here would override those classes with !important and
      // freeze the single preview on default. radius/padding/gap/typography are
      // ALSO v1-class-driven (.chip.round = 100px pill; .chip.sm padding/font), so
      // binding them squared off the round variant and froze size — leave it to v1.
    },
    examples: [
      { target: "react", title: "Chip", code: '<Chip theme="blue" type="fill">Status</Chip>' },
    ],
  }),
  legacyComponent({
    id: "datepicker",
    name: "DatePicker",
    category: "molecule",
    description: "v1 date/time picker with single and period selection modes.",
    // Figma-style nested anatomy: the trigger ("날짜 선택 본편") and the popup
    // ("팝업") are separate, and the calendar / time / quick-select / actions and
    // their inner pieces are individually selectable.
    anatomy: [
      "root",
      { name: "trigger", parent: "root" },
      { name: "trigger-nav-left", parent: "trigger" },
      { name: "trigger-nav-right", parent: "trigger" },
      { name: "trigger-content", parent: "trigger" },
      { name: "trigger-date", parent: "trigger-content" },
      { name: "range-separator", parent: "trigger-content" },
      { name: "time-picker", parent: "trigger-content" },
      { name: "hour-select", parent: "time-picker" },
      { name: "minute-select", parent: "time-picker" },
      { name: "trigger-icon", parent: "trigger" },
      { name: "popup", parent: "root" },
      { name: "quick-select", parent: "popup" },
      { name: "quick-select-item", parent: "quick-select" },
      { name: "calendar", parent: "popup" },
      { name: "calendar-header", parent: "calendar" },
      { name: "calendar-nav-button", parent: "calendar-header" },
      { name: "calendar-title", parent: "calendar-header" },
      { name: "calendar-grid", parent: "calendar" },
      { name: "calendar-weekday", parent: "calendar-grid" },
      { name: "calendar-day", parent: "calendar-grid" },
      { name: "calendar-today", parent: "calendar-grid" },
      { name: "calendar-selected", parent: "calendar-grid" },
      { name: "calendar-range", parent: "calendar-grid" },
      { name: "actions", parent: "popup" },
      { name: "action-summary", parent: "actions" },
      { name: "reset-action", parent: "actions" },
      { name: "apply-action", parent: "actions" },
    ],
    props: [
      enumProp("mode", ["instant", "period"], { default: "instant" }),
      enumProp("type", ["date", "time", "datetime", "hour"], { default: "date" }),
      objectProp("value", { description: "DatePickerValue." }),
      eventProp("onChange"),
      stringProp("placeholder"),
      booleanProp("disabled", { default: false }),
      booleanProp("showActions"),
      enumProp("align", ["left", "right"], { default: "left" }),
      objectProp("disable", { description: "DateCondition[] dates to disable." }),
      objectProp("enable", { description: "DateCondition[] dates to enable." }),
      objectProp("minDate"),
      objectProp("maxDate"),
      enumProp("minuteStep", ["1", "5", "10", "15", "20", "30"], { default: "1" }),
      enumProp("hourFormat", ["24", "12"], { default: "24" }),
      objectProp("disabledHours", { description: "Hours 0-23 that cannot be selected." }),
      enumProp("hourStep", ["1", "2", "3", "4", "6", "12"], { default: "1" }),
      stringProp("format"),
      objectProp("initialCalendar"),
      objectProp("yearRange"),
      booleanProp("quickSelect", { default: false }),
      booleanProp("portal", { default: false }),
      booleanProp("hideNavArrow", { default: false }),
      enumProp("direction", ["down", "up", "auto"], { default: "down" }),
      eventProp("onReset"),
      stringProp("className"),
    ],
    variants: [
      { name: "mode", values: ["instant", "period"], default: "instant" },
      { name: "type", values: ["date", "time", "datetime", "hour"], default: "date" },
      { name: "direction", values: ["down", "up", "auto"], default: "down" },
    ],
    states: [
      // root is now the whole component; the trigger is the input surface.
      { name: "open", tokens: { "trigger.borderColor": "{color.primary.base}" } },
      { name: "disabled", tokens: { "trigger.background": "{color.bg.disabled}" } },
      { name: "selected", tokens: { "calendar-selected.background": "{color.primary.fill}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      // v1 datepicker trigger surface is bg-block; the calendar popover stays modal.
      "trigger.background": "{color.bg.block}",
      "calendar.background": "{color.bg.modal}",
      "calendar.borderColor": "{color.bg.modal}",
      "calendar-selected.background": "{color.primary.base}",
      "calendar-selected.color": "{color.primary.reverse}",
    },
    accessibility: {
      aria: ["aria-expanded", "aria-controls", "aria-selected"],
      keyboard: ["Enter selects date", "Escape closes dropdown", "Arrow keys move calendar focus"],
      focusManagement: "Calendar focus remains inside the popover while open.",
    },
    examples: [
      { target: "react", title: "Date", code: '<DatePicker mode="instant" type="date" />' },
    ],
  }),
  legacyComponent({
    id: "doc-tabs",
    name: "DocTabs",
    category: "utility",
    description:
      "v1 internal documentation tab component; v1 docs category is mapped to v2 utility.",
    anatomy: [
      "root",
      { name: "tab-list", parent: "root" },
      { name: "tab", parent: "tab-list" },
      { name: "panel", parent: "root" },
    ],
    props: [
      objectProp("tabs", {
        required: true,
        description: "DocTabItem[] containing scss/react/cdn content.",
      }),
      enumProp("defaultTab", ["scss", "react", "cdn"], { default: "scss" }),
    ],
    variants: [],
    states: [{ name: "selected", tokens: { "tab.color": "{color.primary.base}" } }],
    tokens: {
      ...legacyBaseComponentTokens(),
      "tab.typography": "{typography.body.medium}",
      "panel.padding": "{spacing.scale.5}",
    },
    accessibility: {
      role: "tablist",
      aria: ["aria-selected", "aria-controls"],
      keyboard: ["Arrow keys switch tabs"],
    },
    examples: [
      { target: "react", title: "DocTabs", code: '<DocTabs tabs={tabs} defaultTab="scss" />' },
    ],
  }),
  legacyComponent({
    id: "editor",
    name: "Editor",
    category: "atom",
    description: "v1 WYSIWYG rich text editor with image and YouTube embedding.",
    anatomy: [
      "root",
      { name: "toolbar", parent: "root" },
      { name: "content", parent: "root" },
      { name: "resize-handle", parent: "content" },
    ],
    props: [
      stringProp("value", { default: "" }),
      eventProp("onChange", { required: true }),
      stringProp("width", { default: "100%" }),
      stringProp("height", { default: "400px" }),
      stringProp("minHeight"),
      stringProp("maxHeight"),
      booleanProp("resizable", { default: false }),
      stringProp("placeholder", { default: "내용을 입력하세요..." }),
      objectProp("validator"),
      objectProp("toolbar", { description: "ToolbarItem[]; default includes all v1 tools." }),
    ],
    variants: [{ name: "resize", values: ["fixed", "resizable"], default: "fixed" }],
    states: [
      { name: "focusVisible", tokens: { "root.borderColor": "{color.border.focus}" } },
      { name: "invalid", tokens: { "root.borderColor": "{color.danger.base}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      "toolbar.background": "{color.bg.elevation}",
      "content.minHeight": "{spacing.scale.13}",
      "content.typography": "{typography.body.medium}",
    },
    accessibility: {
      aria: ["aria-label", "aria-invalid"],
      keyboard: ["Toolbar buttons are reachable with Tab"],
    },
    examples: [
      {
        target: "react",
        title: "Editor",
        code: "<Editor value={content} onChange={setContent} />",
      },
    ],
  }),
  legacyComponent({
    id: "field",
    name: "Field",
    category: "molecule",
    description: "v1 form field composition using spacing and text tokens.",
    anatomy: [
      "root",
      { name: "label", parent: "root" },
      { name: "control", parent: "root" },
      { name: "message", parent: "root" },
    ],
    slots: [{ name: "label" }, { name: "control", required: true }, { name: "message" }],
    props: [
      stringProp("label"),
      stringProp("labelClass"),
      objectProp("helper", { description: "Helper text or custom element below input." }),
      stringProp("helperClass"),
      stringProp("error"),
      objectProp("children", { description: "Form control such as Input or Select." }),
      objectProp("validator", { description: "Zod validation schema." }),
      stringProp("value", { description: "Value for validation." }),
      eventProp("setClassName", { description: "Callback to set child input class." }),
      stringProp("className"),
      booleanProp("required", { default: false }),
    ],
    states: [{ name: "invalid", tokens: { "message.color": "{color.danger.base}" } }],
    tokens: {
      // v1 Field column gap is s(3)=8px.
      "root.gap": "{spacing.scale.3}",
      "label.typography": "{typography.body.small}",
      "label.color": "{color.text.body}",
      "message.typography": "{typography.body.small}",
      "message.color": "{color.text.sub}",
    },
    accessibility: { aria: ["aria-describedby", "aria-invalid", "aria-required"], keyboard: [] },
    examples: [{ target: "react", title: "Field", code: '<Field label="Email"><Input /></Field>' }],
  }),
  legacyComponent({
    id: "file",
    name: "File",
    category: "atom",
    description:
      "v1 file input wrapper for accepted types, multiple selection, and disabled state.",
    anatomy: [
      "root",
      { name: "input", parent: "root" },
      { name: "button", parent: "root" },
      { name: "file-list", parent: "root" },
    ],
    props: [
      stringProp("accept"),
      booleanProp("multiple", { default: false }),
      booleanProp("disabled", { default: false }),
      eventProp("onChange"),
    ],
    variants: [{ name: "selection", values: ["single", "multiple"], default: "single" }],
    states: [
      { name: "disabled", tokens: { "root.background": "{color.bg.disabled}" } },
      { name: "focusVisible", tokens: { "root.borderColor": "{color.border.focus}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      // v1 file surface is bg-block with a faint border; the selector button is dark deep.
      "root.background": "{color.bg.block}",
      "root.borderColor": "{color.border.disabled}",
      "button.background": "{color.default-deep.base}",
      "button.color": "{color.default-deep.reverse}",
      "button.typography": "{typography.body.medium}",
    },
    accessibility: { aria: ["aria-disabled"], keyboard: ["Enter opens file picker"] },
    examples: [{ target: "react", title: "File", code: '<File accept="image/*" multiple />' }],
  }),
  legacyComponent({
    id: "input",
    name: "Input",
    category: "atom",
    description: "v1 form input mapped to spacing, radius, border, and typography tokens.",
    anatomy: ["root"],
    props: [
      {
        name: "value",
        type: { kind: "union", values: ["string", "number"] },
        required: false,
      },
      objectProp("validator", { description: "Zod validation schema." }),
      stringProp("withIcon", { description: "Left icon class, e.g. icon-search." }),
      stringProp("withRightIcon", { description: "Right icon class." }),
      stringProp("unit", { description: "Unit suffix, e.g. km or %." }),
      stringProp("className"),
      objectProp("restProps", { description: "Normalized from v1 ...rest native input props." }),
      stringProp("placeholder"),
      booleanProp("disabled", { default: false }),
      booleanProp("invalid", { default: false }),
      eventProp("onChange"),
    ],
    variants: [
      { name: "style", values: ["border", "fill", "text", "underline"], default: "border" },
      { name: "size", values: ["sm", "md", "lg"], default: "sm" },
    ],
    states: [
      { name: "focusVisible", tokens: { "root.borderColor": "{color.primary.base}" } },
      { name: "disabled", tokens: { "root.background": "{color.bg.disabled}" } },
      { name: "invalid", tokens: { "root.borderColor": "{color.danger.base}" } },
    ],
    tokens: {
      // The v1 input CSS drives colors, borders, radius, padding and font (incl.
      // per-size). Binding root.* here overrode them: root.borderColor hid the
      // focus/danger borders, root.paddingY={spacing.scale.0} zeroed the v1 8px
      // vertical padding, and root.radius froze the md/lg radii. All omitted; the
      // focus/disabled/invalid STATE tokens (in `states`) still apply.
    },
    accessibility: { aria: ["aria-invalid", "aria-required"], keyboard: ["Tab focuses input"] },
    examples: [{ target: "react", title: "Input", code: '<Input placeholder="Email" />' }],
  }),
  legacyComponent({
    id: "label",
    name: "Label",
    category: "atom",
    description: "v1 label text component for form controls.",
    anatomy: ["root", { name: "required-mark", parent: "root" }],
    slots: [{ name: "children", required: true }],
    props: [
      objectProp("children", { required: true }),
      enumProp("size", ["lg", "md", "sm"], { default: "md" }),
      booleanProp("semibold", { default: false }),
      booleanProp("required", { default: false }),
      booleanProp("disabled", { default: false }),
      stringProp("htmlFor"),
    ],
    variants: [
      { name: "size", values: ["lg", "md", "sm"], default: "md" },
      { name: "weight", values: ["regular", "semibold"], default: "regular" },
      { name: "required", values: ["false", "true"], default: "false" },
    ],
    states: [{ name: "disabled", tokens: { "root.color": "{color.text.action-disabled}" } }],
    tokens: {
      ...legacyBaseComponentTokens(),
      "root.typography": "{typography.body.small}",
      "required-mark.color": "{color.danger.base}",
    },
    accessibility: { aria: ["for"], keyboard: [] },
    examples: [{ target: "react", title: "Label", code: "<Label required>Email</Label>" }],
  }),
  legacyComponent({
    id: "pagination",
    name: "Pagination",
    category: "molecule",
    description: "v1 page navigation with previous/next controls and visible page window.",
    anatomy: [
      "root",
      { name: "prev-button", parent: "root" },
      { name: "page-button", parent: "root" },
      { name: "next-button", parent: "root" },
    ],
    props: [
      numberProp("currentPage", { required: true }),
      numberProp("totalPages", { required: true }),
      eventProp("onPageChange", { required: true }),
      numberProp("maxVisiblePages", { default: 5 }),
      stringProp("prevIcon", { default: "icon-arrow-left" }),
      stringProp("nextIcon", { default: "icon-arrow-right" }),
    ],
    variants: [{ name: "density", values: ["default", "compact"], default: "default" }],
    states: [
      { name: "selected", tokens: { "page-button.background": "{color.primary.base}" } },
      { name: "disabled", tokens: { "page-button.color": "{color.text.action-disabled}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      "page-button.size": "{spacing.scale.8}",
      "page-button.radius": "{radius.scale.2}",
      "page-button.typography": "{typography.body.medium}",
    },
    accessibility: {
      role: "navigation",
      aria: ["aria-current", "aria-label"],
      keyboard: ["Tab moves through page controls"],
    },
    examples: [
      {
        target: "react",
        title: "Pagination",
        code: "<Pagination currentPage={1} totalPages={10} onPageChange={setPage} />",
      },
    ],
  }),
  legacyComponent({
    id: "select",
    name: "Select",
    category: "atom",
    description: "v1 select input with option list, icon support, and disabled state.",
    anatomy: [
      "root",
      { name: "trigger", parent: "root" },
      { name: "value", parent: "trigger" },
      { name: "icon", parent: "trigger" },
      { name: "option-list", parent: "root" },
      { name: "option", parent: "option-list" },
    ],
    props: [
      stringProp("value"),
      objectProp("options", { required: true, description: "Array<{ value, label, disabled? }>" }),
      stringProp("placeholder"),
      booleanProp("disabled", { default: false }),
      stringProp("withIcon", { description: "Left icon class name." }),
      eventProp("onChange"),
    ],
    variants: [{ name: "icon", values: ["none", "leading"], default: "none" }],
    states: [
      { name: "open", tokens: { "root.borderColor": "{color.primary.base}" } },
      { name: "disabled", tokens: { "root.background": "{color.bg.disabled}" } },
      { name: "focusVisible", tokens: { "root.borderColor": "{color.border.focus}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      // v1 select trigger surface is bg-block; the option list stays modal-white.
      "root.background": "{color.bg.block}",
      "trigger.paddingX": "{spacing.scale.4}",
      "option-list.background": "{color.bg.modal}",
      "option.selected.background": "{color.primary.fill}",
    },
    accessibility: {
      role: "combobox",
      aria: ["aria-expanded", "aria-controls", "aria-selected"],
      keyboard: ["Arrow keys move options", "Enter selects option", "Escape closes list"],
    },
    examples: [
      {
        target: "react",
        title: "Select",
        code: '<Select options={options} placeholder="Choose" />',
      },
    ],
  }),
  legacyComponent({
    id: "tab",
    name: "Tab",
    category: "molecule",
    description: "v1 tab navigation with active/default key support.",
    anatomy: [
      "root",
      { name: "tab-list", parent: "root" },
      { name: "tab", parent: "tab-list" },
      { name: "panel", parent: "root" },
    ],
    props: [
      objectProp("items", { required: true, description: "Tab items." }),
      stringProp("activeKey"),
      stringProp("defaultActiveKey"),
      booleanProp("fill", { default: false }),
      eventProp("onChange"),
    ],
    variants: [{ name: "width", values: ["auto", "fill"], default: "auto" }],
    states: [
      { name: "selected", tokens: { "tab.color": "{color.primary.base}" } },
      { name: "focusVisible", tokens: { "tab.borderColor": "{color.primary.focus}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      "tab.paddingX": "{spacing.scale.5}",
      "tab.typography": "{typography.body.medium}",
      "panel.padding": "{spacing.scale.5}",
    },
    accessibility: {
      role: "tablist",
      aria: ["aria-selected", "aria-controls"],
      keyboard: ["Arrow keys move tabs"],
    },
    examples: [
      { target: "react", title: "Tab", code: '<Tab items={items} defaultActiveKey="overview" />' },
    ],
  }),
  legacyComponent({
    id: "table",
    name: "Table",
    category: "molecule",
    description: "v1 data table with columns, data source, row keys, and row click support.",
    anatomy: [
      "root",
      { name: "header", parent: "root" },
      { name: "row", parent: "root" },
      { name: "cell", parent: "row" },
      { name: "empty", parent: "root" },
    ],
    props: [
      objectProp("columns", { required: true }),
      objectProp("dataSource", { required: true }),
      stringProp("rowKey", { required: true }),
      booleanProp("list", { default: false }),
      booleanProp("border", { default: false }),
      booleanProp("fill", { default: false }),
      eventProp("onRowClick"),
    ],
    variants: [
      { name: "display", values: ["table", "list"], default: "table" },
      { name: "border", values: ["none", "line"], default: "none" },
      { name: "fill", values: ["none", "row"], default: "none" },
    ],
    states: [{ name: "hover", tokens: { "row.background": "{color.bg.elevation}" } }],
    tokens: {
      ...legacyBaseComponentTokens(),
      "header.background": "{color.bg.elevation}",
      "header.typography": "{typography.body.medium}",
      "cell.paddingX": "{spacing.scale.4}",
      "cell.paddingY": "{spacing.scale.3}",
    },
    accessibility: {
      role: "table",
      aria: ["aria-rowcount", "aria-colcount"],
      keyboard: ["Tab reaches interactive cell content"],
    },
    examples: [
      {
        target: "react",
        title: "Table",
        code: '<Table columns={columns} dataSource={rows} rowKey="id" />',
      },
    ],
  }),
  legacyComponent({
    id: "textarea",
    name: "Textarea",
    category: "atom",
    description: "v1 multiline text input with validation and pass-through props.",
    anatomy: ["root"],
    props: [
      stringProp("value", { required: true }),
      objectProp("validator"),
      stringProp("className"),
      objectProp("restProps", { description: "Normalized from v1 ...rest props." }),
      stringProp("placeholder"),
      booleanProp("disabled", { default: false }),
      eventProp("onChange"),
    ],
    states: [
      { name: "focusVisible", tokens: { "root.borderColor": "{color.border.focus}" } },
      { name: "disabled", tokens: { "root.background": "{color.bg.disabled}" } },
      { name: "invalid", tokens: { "root.borderColor": "{color.danger.base}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      // v1 textarea surface is bg-block.
      "root.background": "{color.bg.block}",
      "root.minHeight": "{spacing.scale.13}",
      "root.paddingX": "{spacing.scale.4}",
      "root.paddingY": "{spacing.scale.3}",
    },
    accessibility: { aria: ["aria-invalid"], keyboard: ["Tab focuses textarea"] },
    examples: [
      { target: "react", title: "Textarea", code: "<Textarea value={body} onChange={setBody} />" },
    ],
  }),
  legacyComponent({
    id: "toast",
    name: "Toast",
    category: "molecule",
    description:
      "v1 toast provider and notification component with theme, position, and close behavior.",
    anatomy: [
      "provider",
      { name: "viewport", parent: "provider" },
      { name: "toast", parent: "viewport" },
      { name: "header", parent: "toast" },
      { name: "message", parent: "toast" },
      { name: "close-button", parent: "header" },
    ],
    props: [
      objectProp("children", { required: true, description: "ToastProvider children." }),
      stringProp("id", { required: true }),
      stringProp("message", { required: true }),
      stringProp("header"),
      enumProp("theme", ["default", "primary", "info", "success", "warning", "danger"], {
        default: "default",
      }),
      booleanProp("border", { default: false }),
      booleanProp("long", { default: false }),
      numberProp("duration", { default: 3000 }),
      stringProp("width"),
      enumProp(
        "position",
        [
          "top-left",
          "top-center",
          "top-right",
          "center-left",
          "center",
          "center-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ],
        { default: "top-right" }
      ),
      eventProp("onClose", { required: true }),
    ],
    variants: [
      {
        name: "theme",
        values: ["default", "primary", "info", "success", "warning", "danger"],
        default: "default",
      },
      {
        name: "position",
        values: [
          "top-left",
          "top-center",
          "top-right",
          "center-left",
          "center",
          "center-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ],
        default: "top-right",
      },
      { name: "length", values: ["default", "long"], default: "default" },
      { name: "border", values: ["none", "border"], default: "none" },
    ],
    states: [{ name: "open", tokens: { "toast.background": "{color.default.fill}" } }],
    tokens: {
      ...legacyBaseComponentTokens(),
      // Toast surface colors (theme) come from the v1 .toast classes; binding
      // toast.background/borderColor here froze the single preview on default.
      "toast.shadowColor": "{color.border.alpha}",
      "header.typography": "{typography.body.medium-bold}",
      "message.typography": "{typography.body.medium}",
    },
    accessibility: {
      role: "status",
      aria: ["aria-live", "aria-atomic"],
      keyboard: ["Escape closes focused toast"],
    },
    examples: [
      {
        target: "react",
        title: "Toast",
        code: '<Toast message="Saved" theme="success" onClose={close} />',
      },
    ],
  }),
  legacyComponent({
    id: "toggle",
    name: "Toggle",
    category: "atom",
    description: "v1 switch-like toggle control with checked and disabled states.",
    anatomy: [
      "root",
      { name: "track", parent: "root" },
      { name: "thumb", parent: "track" },
      { name: "label", parent: "root" },
    ],
    props: [
      booleanProp("checked", { default: false }),
      stringProp("label"),
      booleanProp("disabled", { default: false }),
      eventProp("onChange"),
    ],
    variants: [{ name: "label", values: ["hidden", "visible"], default: "visible" }],
    states: [
      // v1 checked track uses info blue (#1890ff), not primary purple.
      { name: "checked", tokens: { "track.background": "{color.info.base}" } },
      { name: "disabled", tokens: { "track.background": "{color.bg.disabled}" } },
      { name: "focusVisible", tokens: { "track.borderColor": "{color.primary.focus}" } },
    ],
    tokens: {
      ...legacyBaseComponentTokens(),
      "track.background": "{color.bg.toggle}",
      "track.radius": "{radius.scale.full}",
      "thumb.background": "{color.bg.modal}",
      "thumb.radius": "{radius.scale.full}",
    },
    accessibility: {
      role: "switch",
      aria: ["aria-checked", "aria-disabled"],
      keyboard: ["Space toggles switch"],
    },
    examples: [
      {
        target: "react",
        title: "Toggle",
        code: "<Toggle checked={enabled} onChange={setEnabled} />",
      },
    ],
  }),
  legacyComponent({
    id: "tooltip",
    name: "Tooltip",
    category: "atom",
    description:
      "v1 tooltip component with content, position, visibility, portal, and max width controls.",
    anatomy: [
      "trigger",
      { name: "content", parent: "trigger" },
      { name: "arrow", parent: "content" },
    ],
    slots: [
      { name: "children", required: true },
      { name: "content", required: true },
    ],
    props: [
      objectProp("children", { required: true }),
      objectProp("content", { required: true, description: "Tooltip content, including JSX." }),
      enumProp("variant", ["default", "info"], { default: "default" }),
      enumProp(
        "position",
        [
          "top",
          "topLeft",
          "topRight",
          "bottom",
          "bottomLeft",
          "bottomRight",
          "left",
          "leftTop",
          "leftBottom",
          "right",
          "rightTop",
          "rightBottom",
        ],
        { default: "top" }
      ),
      numberProp("offset", { default: 8 }),
      booleanProp("isVisible"),
      stringProp("className"),
      booleanProp("portal", { default: false }),
      stringProp("maxWidth"),
    ],
    variants: [
      { name: "variant", values: ["default", "info"], default: "default" },
      {
        name: "position",
        values: [
          "top",
          "topLeft",
          "topRight",
          "bottom",
          "bottomLeft",
          "bottomRight",
          "left",
          "leftTop",
          "leftBottom",
          "right",
          "rightTop",
          "rightBottom",
        ],
        default: "top",
      },
    ],
    states: [{ name: "open", tokens: { "content.background": "{color.default-deep.base}" } }],
    tokens: {
      ...legacyBaseComponentTokens(),
      "content.background": "{color.default-deep.base}",
      "content.color": "{color.default-deep.reverse}",
      "content.paddingX": "{spacing.scale.3}",
      "content.paddingY": "{spacing.scale.2}",
      "content.radius": "{radius.scale.3}",
    },
    accessibility: {
      role: "tooltip",
      aria: ["aria-describedby"],
      keyboard: ["Escape hides tooltip"],
    },
    examples: [
      {
        target: "react",
        title: "Tooltip",
        code: '<Tooltip content="Help"><button>?</button></Tooltip>',
      },
    ],
  }),
];
