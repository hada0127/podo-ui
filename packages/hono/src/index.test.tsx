/** @jsxImportSource hono/jsx */

import { renderToString } from "hono/jsx/dom/server";
import { describe, expect, it } from "vitest";
import { Button, Field, Icon, Input, Typography, renderCriticalCss } from "./index.js";

describe("@podo/hono", () => {
  it("renders static SSR HTML for form components", () => {
    const html = renderToString(
      <Field id="email" label="Email" description="Work email" error="Required" invalid required>
        <Input name="email" value="team@podo.dev" invalid required />
      </Field>
    );

    expect(html).toContain('class="podo-field"');
    expect(html).toContain('for="email-control"');
    expect(html).toContain('id="email-control"');
    expect(html).toContain('aria-describedby="email-description email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('name="email"');
  });

  it("renders button, icon, typography, and critical css helpers", () => {
    const html = renderToString(
      <>
        {renderCriticalCss({
          theme: "dashboard",
          colorScheme: "dark",
          css: ".podo-button{color:var(--podo-component-button-text)}",
        })}
        <Button loading>
          <Icon name="menu" /> Save
        </Button>
        <Typography as="h1">Dashboard</Typography>
      </>
    );

    expect(html).toContain("data-podo-critical");
    expect(html).toContain("dashboard");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("podo-icon-menu");
    expect(html).toContain("podo-text--h1");
    expect(html).toMatchSnapshot();
  });
});
