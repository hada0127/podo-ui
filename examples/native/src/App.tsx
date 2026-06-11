import React from "react";
import { Button, Field, Input, PodoNativeThemeProvider } from "@podo/native";

export function App(): React.ReactElement {
  return (
    <PodoNativeThemeProvider theme="dashboard" colorScheme="light">
      <Field label="Email" description="Work email">
        <Input accessibilityLabel="Email" placeholder="team@podo.dev" />
      </Field>
      <Button>Save</Button>
    </PodoNativeThemeProvider>
  );
}
