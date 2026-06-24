// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { renderComponentInstance } from "./previews.js";
import { legacyComponents } from "./legacy-fixtures.js";
import type { TokenLookup } from "./token-lookup.js";

afterEach(cleanup);

const lookup: TokenLookup = new Map();

function pick(id: string) {
  const component = legacyComponents.find((item) => item.id === id);
  if (!component) throw new Error(`fixture component "${id}" not found`);
  return component;
}

describe("component preview controls feed runtime props", () => {
  it("applies a custom text selection to the button preview", () => {
    render(<>{renderComponentInstance(pick("button"), { text: "Click me" }, lookup)}</>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("falls back to the demo text when no text is set", () => {
    render(<>{renderComponentInstance(pick("button"), {}, lookup)}</>);
    expect(screen.getByText("Submit")).toBeDefined();
  });

  it("applies a custom icon selection to the button preview", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("button"), { icon: "icon-plus" }, lookup)}</>
    );
    expect(container.querySelector(".icon-plus")).not.toBeNull();
  });

  it("applies a custom text selection to the chip preview", () => {
    render(<>{renderComponentInstance(pick("chip"), { text: "Beta" }, lookup)}</>);
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("applies a custom text selection to the label preview", () => {
    render(<>{renderComponentInstance(pick("label"), { text: "Your name" }, lookup)}</>);
    expect(screen.getByText("Your name")).toBeDefined();
  });

  it("falls back to the demo text when the text is blank/whitespace", () => {
    render(<>{renderComponentInstance(pick("button"), { text: "   " }, lookup)}</>);
    expect(screen.getByText("Submit")).toBeDefined();
  });

  it("applies a custom rightIcon selection to the button preview", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("button"), { rightIcon: "icon-chevron" }, lookup)}</>
    );
    expect(container.querySelector(".icon-chevron")).not.toBeNull();
  });

  it("applies a custom icon selection to the chip preview", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("chip"), { icon: "icon-star" }, lookup)}</>
    );
    expect(container.querySelector(".icon-star")).not.toBeNull();
  });

  it("applies a custom icon selection to the avatar preview (type=icon)", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("avatar"), { type: "icon", icon: "icon-bell" }, lookup)}</>
    );
    expect(container.querySelector(".icon-bell")).not.toBeNull();
  });
});
