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
      const behavior = createButtonBehavior({ disabled: props.disabled, loading: props.loading });
      return createElement(
        host.Pressable,
        {
          accessibilityRole: "button",
          accessibilityState: { disabled: !behavior.pressable, busy: behavior.loading },
          disabled: !behavior.pressable,
          onPress: behavior.pressable ? props.onPress : undefined,
          testID: props.testID,
          "data-variant": props.variant ?? "solid",
          "data-size": props.size ?? "md",
        },
        props.leftIcon,
        createElement(host.Text, null, props.children),
        props.rightIcon
      );
    },
    Input: (props) => {
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
        testID: props.testID,
      });
    },
    Field: (props) => {
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
          testID: props.testID,
        },
        createElement(host.Text, { nativeID: a11y.ids.labelId }, props.label),
        wireNativeControl(props.children, a11y),
        props.description
          ? createElement(host.Text, { nativeID: a11y.ids.descriptionId }, props.description)
          : null,
        props.error ? createElement(host.Text, { nativeID: a11y.ids.errorId }, props.error) : null
      );
    },
    Icon: (props) =>
      createElement(
        host.Text,
        { accessibilityElementsHidden: true, testID: props.testID },
        props.glyph ?? props.name
      ),
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
