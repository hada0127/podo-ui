// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { podoWebComponentCss, registerPodoElements } from "./index.js";

describe("@podo/web", () => {
  it("registers standard custom elements once", () => {
    registerPodoElements();
    registerPodoElements();

    expect(customElements.get("podo-button")).toBeDefined();
    expect(customElements.get("podo-input")).toBeDefined();
    expect(podoWebComponentCss).toContain("--podo-component-button-background");
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
    expect(icon.shadowRoot?.innerHTML).toMatchSnapshot("icon");
    expect(text.shadowRoot?.innerHTML).toMatchSnapshot("text");
  });
});
