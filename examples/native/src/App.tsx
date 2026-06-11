import React, { useMemo, useState } from "react";
import {
  Button,
  Field,
  Icon,
  Input,
  PodoNativeThemeProvider,
  usePodoNativeTheme,
} from "@podo/native";

export function App(): React.ReactElement {
  const [darkMode, setDarkMode] = useState(false);
  const colorScheme = darkMode ? "dark" : "light";
  const tokens = useMemo(
    () => ({
      color: {
        text: colorScheme === "dark" ? "#f8fafc" : "#111827",
        background: colorScheme === "dark" ? "#101828" : "#ffffff",
      },
      spacing: { controlGap: 12 },
    }),
    [colorScheme]
  );

  return (
    <PodoNativeThemeProvider theme="dashboard" colorScheme={colorScheme} tokens={tokens}>
      <ExampleContent onToggleScheme={() => setDarkMode((current) => !current)} />
    </PodoNativeThemeProvider>
  );
}

function ExampleContent({ onToggleScheme }: { onToggleScheme: () => void }): React.ReactElement {
  const theme = usePodoNativeTheme();

  return (
    <>
      <Field
        label={`Email (${theme.theme}/${theme.colorScheme})`}
        description="Theme provider, Field and Input share one native context."
        required
      >
        <Input accessibilityLabel="Email" placeholder="team@podo.dev" required />
      </Field>
      <Button leftIcon={<Icon name="menu" />} onPress={onToggleScheme}>
        Toggle dark mode
      </Button>
    </>
  );
}
