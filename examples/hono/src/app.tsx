/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { Button, Field, Icon, Input, Typography, renderCriticalCss } from "@podo/hono";

export const app = new Hono();

const criticalCss = `
[data-podo-theme="dashboard"][data-color-scheme="light"] {
  --podo-component-button-background: #305cde;
  --podo-component-button-text: #ffffff;
  --podo-component-input-background: #ffffff;
  --podo-component-input-border: #9aa8bd;
  --podo-semantic-color-text-default: #111827;
}

body {
  color: var(--podo-semantic-color-text-default);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  margin: 0;
}

.podo-hono-page {
  display: grid;
  gap: 16px;
  max-width: 640px;
  padding: 40px;
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

.podo-icon {
  font-family: "PodoIcons";
  line-height: 1;
}
`;

app.get("/", (c) =>
  c.html(
    <html lang="en">
      <head>
        <title>Podo Hono Example</title>
        {renderCriticalCss({ theme: "dashboard", colorScheme: "light", css: criticalCss })}
      </head>
      <body>
        <main class="podo-hono-page">
          <Typography as="h1">SSR account form</Typography>
          <form method="post" action="/settings">
            <Field id="email" label="Email" description="Work email" required>
              <Input name="email" placeholder="team@podo.dev" required />
            </Field>
            <Button type="submit">
              <Icon name="menu" /> Save
            </Button>
          </form>
        </main>
      </body>
    </html>
  )
);

app.post("/settings", (c) => c.text("Saved"));
