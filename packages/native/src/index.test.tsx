// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  PodoNativeThemeProvider,
  adaptReactNativeTokens,
  createNativeComponents,
  usePodoNativeTheme,
} from "./index.js";

const domNative = createNativeComponents({
  Pressable: TestPressable,
  Text: TestText,
  TextInput: TestTextInput,
  View: TestView,
});

describe("@podo/native", () => {
  it("adapts token units for React Native", () => {
    expect(
      adaptReactNativeTokens({
        size: "16px",
        gap: "1.5rem",
        color: "#FFFFFF",
        nested: ["8px"],
      })
    ).toEqual({ size: 16, gap: 24, color: "#FFFFFF", nested: [8] });
  });

  it("renders Pressable, TextInput, Field, and Icon through injected native hosts", () => {
    render(
      <domNative.Field label="Email" error="Required" invalid>
        <domNative.Input accessibilityLabel="Email" value="team@podo.dev" invalid />
        <domNative.Button>
          <domNative.Icon name="menu" glyph="≡" /> Save
        </domNative.Button>
      </domNative.Field>
    );

    expect(screen.getByLabelText("Email").getAttribute("value")).toBe("team@podo.dev");
    expect(screen.getByLabelText("Email").getAttribute("data-labelledby")).toBe(
      "podo-field-control-label"
    );
    expect(screen.getByLabelText("Email").getAttribute("data-describedby")).toBe(
      "podo-field-control-error"
    );
    expect(screen.getByRole("button").getAttribute("data-variant")).toBe("solid");
    expect(screen.getByText("≡")).toBeDefined();
    expect(screen.getByText("Required")).toBeDefined();
  });

  it("provides native theme context", () => {
    function Probe(): React.ReactElement {
      const theme = usePodoNativeTheme();
      return <span data-testid="native-theme">{`${theme.theme}:${theme.colorScheme}`}</span>;
    }

    render(
      <PodoNativeThemeProvider theme="dashboard" colorScheme="dark">
        <Probe />
      </PodoNativeThemeProvider>
    );

    expect(screen.getByTestId("native-theme").textContent).toBe("dashboard:dark");
  });
});

function TestPressable({
  children,
  onPress,
  testID,
  ...props
}: Record<string, unknown> & { children?: React.ReactNode }): React.ReactElement {
  return (
    <button
      data-testid={testID as string | undefined}
      data-size={props["data-size"] as string | undefined}
      data-variant={props["data-variant"] as string | undefined}
      disabled={Boolean(props.disabled)}
      onClick={() => {
        if (typeof onPress === "function") {
          onPress();
        }
      }}
    >
      {children}
    </button>
  );
}

function TestText({
  children,
  testID,
}: Record<string, unknown> & { children?: React.ReactNode }): React.ReactElement {
  return <span data-testid={testID as string | undefined}>{children}</span>;
}

function TestTextInput(props: Record<string, unknown>): React.ReactElement {
  return (
    <input
      aria-label={props.accessibilityLabel as string | undefined}
      data-labelledby={props.accessibilityLabelledBy as string | undefined}
      data-describedby={props.accessibilityDescribedBy as string | undefined}
      data-testid={props.testID as string | undefined}
      readOnly
      value={(props.value ?? props.defaultValue ?? "") as string}
    />
  );
}

function TestView({
  children,
  testID,
}: Record<string, unknown> & { children?: React.ReactNode }): React.ReactElement {
  return <div data-testid={testID as string | undefined}>{children}</div>;
}
