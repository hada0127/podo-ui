import React, {
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  useContext,
  type ReactNode,
} from "react";
import { createButtonBehavior, createFieldA11y, createInputBehavior } from "@podo/core";

export type NativeHostComponent = string | React.ComponentType<Record<string, unknown>>;

export interface NativeHost {
  Pressable: NativeHostComponent;
  Text: NativeHostComponent;
  TextInput: NativeHostComponent;
  View: NativeHostComponent;
}

export interface NativeTheme {
  theme: string;
  colorScheme: "light" | "dark";
  tokens?: Record<string, unknown>;
}

export interface NativeThemeProviderProps extends NativeTheme {
  children: ReactNode;
}

export interface NativeButtonProps {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

export interface NativeInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: (value: string) => void;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string;
  accessibilityDescribedBy?: string;
  accessibilityState?: Record<string, unknown>;
  testID?: string;
}

export interface NativeFieldProps {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  testID?: string;
}

export interface NativeIconProps {
  name: string;
  glyph?: string;
  testID?: string;
}

export interface NativeComponents {
  Button: (props: NativeButtonProps) => React.ReactElement;
  Input: (props: NativeInputProps) => React.ReactElement;
  Field: (props: NativeFieldProps) => React.ReactElement;
  Icon: (props: NativeIconProps) => React.ReactElement;
}

export type NativeStyle = Record<string, string | number | undefined>;

export const defaultNativeHost: NativeHost = {
  Pressable: "Pressable",
  Text: "Text",
  TextInput: "TextInput",
  View: "View",
};

const NativeThemeContext = createContext<NativeTheme>({
  theme: "landing",
  colorScheme: "light",
});

export function PodoNativeThemeProvider({
  theme,
  colorScheme,
  tokens,
  children,
}: NativeThemeProviderProps): React.ReactElement {
  const value =
    typeof tokens === "undefined" ? { theme, colorScheme } : { theme, colorScheme, tokens };

  return <NativeThemeContext.Provider value={value}>{children}</NativeThemeContext.Provider>;
}

export function usePodoNativeTheme(): NativeTheme {
  return useContext(NativeThemeContext);
}

export function adaptReactNativeTokens(value: unknown): unknown {
  if (typeof value === "string") {
    const px = value.match(/^(-?(?:\d+|\d*\.\d+))px$/);
    if (px?.[1]) {
      return Number(px[1]);
    }

    const rem = value.match(/^(-?(?:\d+|\d*\.\d+))rem$/);
    if (rem?.[1]) {
      return Number(rem[1]) * 16;
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map(adaptReactNativeTokens);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, adaptReactNativeTokens(child)])
    );
  }

  return value;
}

export function createNativeComponents(host: NativeHost = defaultNativeHost): NativeComponents {
  return {
    Button: (props) => {
      const theme = usePodoNativeTheme();
      const styles = createNativeThemeStyles(theme);
      const behavior = createButtonBehavior({ disabled: props.disabled, loading: props.loading });
      return createElement(
        host.Pressable,
        {
          accessibilityRole: "button",
          accessibilityState: { disabled: !behavior.pressable, busy: behavior.loading },
          disabled: !behavior.pressable,
          onPress: behavior.pressable ? props.onPress : undefined,
          style: {
            ...styles.button,
            opacity: behavior.pressable ? 1 : 0.56,
          },
          testID: props.testID,
          "data-variant": props.variant ?? "solid",
          "data-size": props.size ?? "md",
        },
        props.leftIcon,
        createElement(host.Text, { style: styles.buttonLabel }, props.children),
        props.rightIcon
      );
    },
    Input: (props) => {
      const theme = usePodoNativeTheme();
      const styles = createNativeThemeStyles(theme);
      const behavior = createInputBehavior({
        value: props.value,
        defaultValue: props.defaultValue,
        disabled: props.disabled,
        invalid: props.invalid,
        required: props.required,
      });
      return createElement(host.TextInput, {
        accessibilityLabel: props.accessibilityLabel,
        accessibilityLabelledBy: props.accessibilityLabelledBy,
        accessibilityDescribedBy: props.accessibilityDescribedBy,
        accessibilityState: {
          ...props.accessibilityState,
          disabled: behavior.disabled,
          invalid: behavior.invalid || Boolean(props.accessibilityState?.invalid),
        },
        editable: !behavior.disabled,
        defaultValue: props.defaultValue,
        value: props.value,
        placeholder: props.placeholder,
        onChangeText: props.onValueChange,
        style: styles.input,
        testID: props.testID,
      });
    },
    Field: (props) => {
      const theme = usePodoNativeTheme();
      const styles = createNativeThemeStyles(theme);
      const a11y = createFieldA11y({
        id: props.id,
        invalid: props.invalid,
        required: props.required,
        hasDescription: Boolean(props.description),
        hasError: Boolean(props.error),
      });
      return createElement(
        host.View,
        {
          accessibilityState: { disabled: Boolean(props.disabled) },
          style: styles.field,
          testID: props.testID,
        },
        createElement(host.Text, { nativeID: a11y.ids.labelId, style: styles.label }, props.label),
        wireNativeControl(props.children, a11y),
        props.description
          ? createElement(
              host.Text,
              { nativeID: a11y.ids.descriptionId, style: styles.description },
              props.description
            )
          : null,
        props.error
          ? createElement(
              host.Text,
              { nativeID: a11y.ids.errorId, style: styles.error },
              props.error
            )
          : null
      );
    },
    Icon: (props) => {
      const theme = usePodoNativeTheme();
      const styles = createNativeThemeStyles(theme);
      return createElement(
        host.Text,
        { accessibilityElementsHidden: true, style: styles.icon, testID: props.testID },
        props.glyph ?? props.name
      );
    },
  };
}

export const { Button, Input, Field, Icon } = createNativeComponents();

function wireNativeControl(
  children: ReactNode,
  a11y: ReturnType<typeof createFieldA11y>
): ReactNode {
  return React.Children.map(children, (child) => {
    if (!isValidElement<Record<string, unknown>>(child)) {
      return child;
    }

    return cloneElement(child, {
      accessibilityLabelledBy: a11y.ids.labelId,
      accessibilityDescribedBy: a11y.control["aria-describedby"] as string | undefined,
      accessibilityState: {
        ...(child.props.accessibilityState as Record<string, unknown> | undefined),
        invalid: a11y.control["aria-invalid"] === "true",
        required: a11y.control["aria-required"] === "true",
      },
    });
  });
}

function createNativeThemeStyles(
  theme: NativeTheme
): Record<
  "button" | "buttonLabel" | "description" | "error" | "field" | "icon" | "input" | "label",
  NativeStyle
> {
  const tokens = adaptReactNativeTokens(theme.tokens);
  const textColor = stringToken(tokens, ["color", "text"]) ?? defaultNativeTextColor(theme);
  const backgroundColor =
    stringToken(tokens, ["color", "background"]) ?? defaultNativeBackgroundColor(theme);
  const dangerColor = stringToken(tokens, ["color", "danger"]) ?? "#D92D20";
  const gap = numberToken(tokens, ["spacing", "controlGap"]) ?? 8;
  const borderColor = theme.colorScheme === "dark" ? "#61708A" : "#9AA8BD";
  const accentColor = theme.colorScheme === "dark" ? "#9DB7FF" : "#305CDE";

  return {
    field: { gap, padding: gap },
    label: { color: textColor, fontWeight: "600" },
    description: { color: textColor, opacity: 0.72 },
    error: { color: dangerColor },
    input: {
      backgroundColor,
      borderColor,
      borderRadius: 8,
      borderWidth: 1,
      color: textColor,
      minHeight: 40,
      paddingHorizontal: 12,
    },
    button: {
      alignItems: "center",
      backgroundColor: accentColor,
      borderRadius: 8,
      flexDirection: "row",
      gap: 6,
      minHeight: 40,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    buttonLabel: { color: theme.colorScheme === "dark" ? "#101828" : "#FFFFFF", fontWeight: "600" },
    icon: { color: textColor },
  };
}

function defaultNativeTextColor(theme: NativeTheme): string {
  return theme.colorScheme === "dark" ? "#F8FAFC" : "#111827";
}

function defaultNativeBackgroundColor(theme: NativeTheme): string {
  return theme.colorScheme === "dark" ? "#101828" : "#FFFFFF";
}

function stringToken(root: unknown, path: string[]): string | undefined {
  const value = nestedToken(root, path);
  return typeof value === "string" ? value : undefined;
}

function numberToken(root: unknown, path: string[]): number | undefined {
  const value = nestedToken(root, path);
  return typeof value === "number" ? value : undefined;
}

function nestedToken(root: unknown, path: string[]): unknown {
  let current = root;
  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
