import React, { useMemo, useState } from "react";
import { Button, Field, Icon, Input, PodoThemeProvider, Typography } from "@podo/react";

export function ReactExampleApp(): React.ReactElement {
  const [darkMode, setDarkMode] = useState(false);
  const colorScheme = darkMode ? "dark" : "light";
  const status = useMemo(() => (darkMode ? "Dark mode enabled" : "Light mode enabled"), [darkMode]);

  return (
    <PodoThemeProvider theme="dashboard" colorScheme={colorScheme}>
      <style>{reactExampleCss}</style>
      <section className="podo-react-example" aria-label="Podo React example">
        <Typography as="h1">Dashboard settings</Typography>
        <Typography>{status}</Typography>
        <Field
          id="workspace-email"
          label="Workspace email"
          description="Provider, Field, Input, and Button use the same dashboard theme context."
          required
        >
          <Input name="email" placeholder="team@podo.dev" required />
        </Field>
        <Button
          variant="solid"
          leftIcon={<Icon name="menu" />}
          onPress={() => setDarkMode((current) => !current)}
        >
          Toggle dark mode
        </Button>
      </section>
    </PodoThemeProvider>
  );
}

export default ReactExampleApp;

export const reactExampleCss = `
[data-podo-theme="dashboard"][data-color-scheme="light"] {
  --podo-component-button-background: #305cde;
  --podo-component-button-text: #ffffff;
  --podo-component-input-background: #ffffff;
  --podo-component-input-border: #9aa8bd;
  --podo-semantic-color-text-default: #111827;
}

[data-podo-theme="dashboard"][data-color-scheme="dark"] {
  --podo-component-button-background: #9db7ff;
  --podo-component-button-text: #101828;
  --podo-component-input-background: #101828;
  --podo-component-input-border: #61708a;
  --podo-semantic-color-text-default: #f8fafc;
}

.podo-react-example {
  color: var(--podo-semantic-color-text-default);
  display: grid;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  gap: 16px;
  max-width: 640px;
  padding: 40px;
}

.podo-button {
  align-items: center;
  background: var(--podo-component-button-background);
  border: 0;
  border-radius: 8px;
  color: var(--podo-component-button-text);
  display: inline-flex;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
}

.podo-field {
  display: grid;
  gap: 6px;
}

.podo-input {
  background: var(--podo-component-input-background);
  border: 1px solid var(--podo-component-input-border);
  border-radius: 8px;
  color: var(--podo-semantic-color-text-default);
  min-height: 40px;
  padding: 0 12px;
}
`;
