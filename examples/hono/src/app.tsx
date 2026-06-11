/** @jsxImportSource hono/jsx */

import { Hono } from "hono";
import { Button, Field, Input, renderCriticalCss } from "@podo/hono";

export const app = new Hono();

app.get("/", (c) =>
  c.html(
    <html>
      <head>{renderCriticalCss({ theme: "dashboard", colorScheme: "light" })}</head>
      <body>
        <Field id="email" label="Email" description="Work email">
          <Input name="email" placeholder="team@podo.dev" />
        </Field>
        <Button type="submit">Save</Button>
      </body>
    </html>
  )
);
