// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  componentStyleBlock,
  podoWebComponentCss,
  registerComponentTokenCss,
  registerPodoElements,
} from "./index.js";

describe("@podo/web", () => {
  it("registers standard custom elements once", () => {
    registerPodoElements();
    registerPodoElements();

    expect(customElements.get("podo-button")).toBeDefined();
    expect(customElements.get("podo-input")).toBeDefined();
    expect(podoWebComponentCss).toContain("--podo-component-button-background");
  });

  it("reads binding-key vars, exposes data-state, and consumes the registered token CSS", () => {
    registerPodoElements();
    // base reads the binding-key var (with token-var fallback)
    expect(podoWebComponentCss).toContain("var(--podo-button-root-background,");

    const layer = '.podo-button[data-variant="soft"] { --podo-button-root-background: red; }';
    registerComponentTokenCss(layer);
    expect(componentStyleBlock()).toContain(layer);

    const button = document.createElement("podo-button");
    button.setAttribute("variant", "soft");
    button.setAttribute("disabled", "");
    document.body.append(button);
    const html = button.shadowRoot?.innerHTML ?? "";
    // the generated layer is injected into the shadow, and state is exposed
    expect(html).toContain(layer);
    expect(html).toContain('data-variant="soft"');
    expect(html).toContain('data-state="disabled"');

    // reset so other tests/snapshots see the unregistered style block
    registerComponentTokenCss("");
  });

  it("renders button slots, states, and activation event", () => {
    registerPodoElements();
    const button = document.createElement("podo-button");
    button.setAttribute("variant", "solid");
    button.textContent = "Save";
    let pressed = 0;
    button.addEventListener("podo-press", () => {
      pressed += 1;
    });
    document.body.append(button);

    button.shadowRoot?.querySelector("button")?.dispatchEvent(new MouseEvent("click"));

    expect(pressed).toBe(1);
    expect(button.shadowRoot?.innerHTML).toMatchSnapshot();
  });

  it("renders input, field, icon, and typography components", async () => {
    registerPodoElements();
    const input = document.createElement("podo-input") as HTMLElement & { value: string };
    input.setAttribute("invalid", "");
    input.value = "hello";
    document.body.append(input);
    input.shadowRoot
      ?.querySelector("input")
      ?.dispatchEvent(new InputEvent("input", { bubbles: true }));

    const field = document.createElement("podo-field");
    field.setAttribute("field-id", "email");
    field.setAttribute("invalid", "");
    field.setAttribute("required", "");
    field.innerHTML = '<span slot="label">Email</span><podo-input></podo-input>';
    document.body.append(field);
    await Promise.resolve();

    const icon = document.createElement("podo-icon");
    icon.setAttribute("name", "menu");
    document.body.append(icon);

    const text = document.createElement("podo-text");
    text.setAttribute("as", "h1");
    text.textContent = "Dashboard";
    document.body.append(text);

    expect(input.shadowRoot?.innerHTML).toMatchSnapshot("input");
    expect(field.shadowRoot?.innerHTML).toMatchSnapshot("field");
    expect(field.querySelector("podo-input")?.getAttribute("id")).toBe("email-control");
    expect(field.querySelector("podo-input")?.getAttribute("aria-describedby")).toBe(
      "email-description email-error"
    );
    expect(
      field.querySelector("podo-input")?.shadowRoot?.querySelector("input")?.getAttribute("id")
    ).toBe("email-control");
    expect(
      field
        .querySelector("podo-input")
        ?.shadowRoot?.querySelector("input")
        ?.getAttribute("aria-labelledby")
    ).toBe("email-label");
    expect(
      field
        .querySelector("podo-input")
        ?.shadowRoot?.querySelector("input")
        ?.getAttribute("aria-describedby")
    ).toBe("email-description email-error");
    expect(
      field
        .querySelector("podo-input")
        ?.shadowRoot?.querySelector("input")
        ?.getAttribute("aria-invalid")
    ).toBe("true");
    expect(
      field
        .querySelector("podo-input")
        ?.shadowRoot?.querySelector("input")
        ?.getAttribute("aria-required")
    ).toBe("true");
    expect(icon.shadowRoot?.innerHTML).toMatchSnapshot("icon");
    expect(text.shadowRoot?.innerHTML).toMatchSnapshot("text");
  });
});
