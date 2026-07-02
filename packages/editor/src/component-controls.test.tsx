// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  renderComponentInstance,
  renderComponentPreview,
  renderComponentPreviewMatrix,
  resolveComponentAppearance,
} from "./previews.js";
import { LayersPanel } from "./component-layers.js";
import { legacyComponents } from "./legacy-fixtures.js";
import type { TokenLookup } from "./token-lookup.js";
import type { Translate } from "./i18n/context.js";

// The matrix only uses t() for header labels; identity is enough for these assertions.
const t = ((key: string) => key) as Translate;

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

  it("checkbox/radio root has no background so the box does not bleed outside the border", () => {
    // root maps to the bare <input>; the v1 box is a ::before SVG, so any input
    // background would bleed around it. The override clears it.
    const appearance = resolveComponentAppearance(pick("checkbox-radio"), {});
    expect(appearance["root.background"]).toBe("transparent");
  });

  it("chip does not bind root color tokens, so v1 theme/type classes drive its colors", () => {
    // Binding root.background/color/borderColor would override the vendored v1
    // .chip.blue/.fill/.border classes with !important and freeze the single
    // preview on the default theme.
    const appearance = resolveComponentAppearance(pick("chip"), {});
    expect(appearance["root.background"]).toBeUndefined();
    expect(appearance["root.color"]).toBeUndefined();
    expect(appearance["root.borderColor"]).toBeUndefined();
  });

  it("input invalid prop adds the v1 danger class (red border)", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("input"), { invalid: "true" }, lookup)}</>
    );
    expect(container.querySelector("input.danger")).not.toBeNull();
  });

  it("input disabled prop disables the field", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("input"), { disabled: "true" }, lookup)}</>
    );
    expect(container.querySelector("input")?.disabled).toBe(true);
  });

  it("input base tokens do not bind border/background (v1 CSS drives focus/danger)", () => {
    const appearance = resolveComponentAppearance(pick("input"), {});
    expect(appearance["root.background"]).toBeUndefined();
    expect(appearance["root.borderColor"]).toBeUndefined();
  });

  it("button consumes the disabled boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("button"), { disabled: "true" }, lookup)}</>
    );
    expect(container.querySelector("button")?.disabled).toBe(true);
  });

  it("button consumes the loading boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("button"), { loading: "true" }, lookup)}</>
    );
    expect(container.querySelector(".icon-loading")).not.toBeNull();
  });

  it("toggle consumes the checked boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("toggle"), { checked: "true" }, lookup)}</>
    );
    expect(container.querySelector("input")?.checked).toBe(true);
  });

  it("file consumes the disabled boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("file"), { disabled: "true" }, lookup)}</>
    );
    expect(container.querySelector("input")?.disabled).toBe(true);
  });

  it("chip consumes the round boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("chip"), { round: "true" }, lookup)}</>
    );
    expect(container.querySelector(".chip.round")).not.toBeNull();
  });

  it("avatar consumes the activityRing boolean prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("avatar"), { type: "icon", activityRing: "true" }, lookup)}</>
    );
    expect(container.querySelector(".activityRing")).not.toBeNull();
  });

  it("select consumes the value string prop", () => {
    const { container } = render(
      <>{renderComponentInstance(pick("select"), { value: "design" }, lookup)}</>
    );
    expect(container.querySelector("select")?.value).toBe("design");
  });

  it("toggle root radius is unbound so the v1 9999px pill shape is preserved", () => {
    // root.radius=6px (formerly in the base tokens) squared off the toggle's
    // 9999px pill; the base is now empty so the v1 pill shows. (Avatar keeps its
    // own explicit root.radius={radius.scale.full} for the circle, so it was fine.)
    expect(resolveComponentAppearance(pick("toggle"), {})["root.radius"]).toBeUndefined();
  });

  it("button/chip/input bind no size/shape tokens so v1 size & shape variants apply", () => {
    // These !important bindings used to freeze the single preview: button every
    // size→sm, chip .round→6px, input vertical padding→0 / md·lg radius→6px.
    const button = resolveComponentAppearance(pick("button"), {});
    expect(button["root.height"]).toBeUndefined();
    expect(button["root.radius"]).toBeUndefined();
    expect(resolveComponentAppearance(pick("chip"), {})["root.radius"]).toBeUndefined();
    const input = resolveComponentAppearance(pick("input"), {});
    expect(input["root.paddingY"]).toBeUndefined();
    expect(input["root.radius"]).toBeUndefined();
  });

  it("variant matrix ignores preview test overrides (renders default content)", () => {
    const { container } = render(
      <>
        {renderComponentPreviewMatrix({
          component: pick("button"),
          selections: { text: "OVERRIDE", icon: "icon-plus", state: "loading" },
          lookup,
          onSelect: () => {},
          t,
        })}
      </>
    );
    // Cells show the canonical default ("Submit"), never the preview's overrides.
    expect(container.textContent).toContain("Submit");
    expect(container.textContent).not.toContain("OVERRIDE");
    expect(container.querySelector(".icon-plus")).toBeNull();
  });
});

describe("Figma-style layer flags, slot content, and variant add", () => {
  it("hidden anatomy parts emit display:none into the preview CSS", () => {
    const button = pick("button");
    const withHidden = {
      ...button,
      anatomy: button.anatomy.map((part) =>
        part.name === "left-icon" ? { ...part, hidden: true } : part
      ),
    };
    const { container } = render(<>{renderComponentPreview(withHidden, {}, lookup)}</>);
    const css = Array.from(container.querySelectorAll("style"))
      .map((style) => style.textContent)
      .join("\n");
    expect(css).toContain("display: none !important");
  });

  it("scopes EVERY comma alternative of a part selector (no document-wide leak)", () => {
    // checkbox-radio root is "input[type=checkbox]:not(.toggle), input[type=radio]";
    // a naive prefix would leave the radio half unscoped and hide every radio in
    // the editor document (e.g. the variant default pickers).
    const checkbox = pick("checkbox-radio");
    const withHidden = {
      ...checkbox,
      anatomy: checkbox.anatomy.map((part) =>
        part.name === "root" ? { ...part, hidden: true } : part
      ),
    };
    const { container } = render(<>{renderComponentPreview(withHidden, {}, lookup)}</>);
    const css = Array.from(container.querySelectorAll("style"))
      .map((style) => style.textContent)
      .join("\n");
    for (const line of css.split("\n").filter((rule) => rule.includes("display: none"))) {
      for (const alternative of line.slice(0, line.indexOf("{")).split(",")) {
        expect(alternative.trim().startsWith(".podo-design-target")).toBe(true);
      }
    }
  });

  it("auto layout flex bindings reach the preview CSS", () => {
    const button = pick("button");
    const withAutoLayout = {
      ...button,
      tokens: {
        ...button.tokens,
        "root.display": "flex",
        "root.flex-direction": "column",
        "root.justify-content": "space-between",
        "root.align-items": "center",
        "root.flex-wrap": "wrap",
      },
    };
    const { container } = render(<>{renderComponentPreview(withAutoLayout, {}, lookup)}</>);
    const css = Array.from(container.querySelectorAll("style"))
      .map((style) => style.textContent)
      .join("\n");
    expect(css).toContain("flex-direction: column !important");
    expect(css).toContain("justify-content: space-between !important");
    expect(css).toContain("align-items: center !important");
    expect(css).toContain("flex-wrap: wrap !important");
    expect(css).toContain("display: flex !important");
  });

  it("field control slot content is swappable via slot:control", () => {
    const field = pick("field");
    const asSelect = render(
      <>{renderComponentPreview(field, { "slot:control": "select" }, lookup)}</>
    );
    expect(asSelect.container.querySelector("select")).not.toBeNull();
    cleanup();
    const asTextarea = render(
      <>{renderComponentPreview(field, { "slot:control": "textarea" }, lookup)}</>
    );
    expect(asTextarea.container.querySelector("textarea")).not.toBeNull();
    cleanup();
    const asDefault = render(<>{renderComponentPreview(field, {}, lookup)}</>);
    expect(asDefault.container.querySelector("input")).not.toBeNull();
  });

  it("matrix header offers +value per axis and reports the axis name", () => {
    const added: string[] = [];
    render(
      <>
        {renderComponentPreviewMatrix({
          component: pick("button"),
          selections: {},
          lookup,
          onSelect: () => {},
          onAddValue: (axis) => added.push(axis),
          t,
        })}
      </>
    );
    const buttons = screen.getAllByLabelText("previews.addValue");
    expect(buttons.length).toBe(2); // row axis + column axis
    fireEvent.click(buttons[0] as HTMLElement);
    expect(added).toEqual([pick("button").variants[0]?.name]);
  });

  it("matrix without onAddValue renders no add buttons (style-only components)", () => {
    render(
      <>
        {renderComponentPreviewMatrix({
          component: pick("button"),
          selections: {},
          lookup,
          onSelect: () => {},
          t,
        })}
      </>
    );
    expect(screen.queryByLabelText("previews.addValue")).toBeNull();
  });
});

describe("LayersPanel Figma parity", () => {
  const anatomy = [
    { name: "root" },
    { name: "icon", parent: "root", hidden: true },
    { name: "label", parent: "root", locked: true },
  ];
  const noop = () => {};
  const baseProps = {
    selectedPart: "root",
    onSelect: noop,
    onRename: noop,
    onAdd: noop,
    onDuplicate: noop,
    onRemove: noop,
    onReorder: noop,
    onReparent: noop,
    onMove: noop,
    onToggleHidden: noop,
    onToggleLocked: noop,
  };

  it("shows eye/lock toggles and fires the flag callbacks", () => {
    const flags: Array<[string, string, boolean]> = [];
    render(
      <LayersPanel
        {...baseProps}
        anatomy={anatomy}
        onToggleHidden={(part, hidden) => flags.push(["hidden", part, hidden])}
        onToggleLocked={(part, locked) => flags.push(["locked", part, locked])}
      />
    );
    fireEvent.click(screen.getByLabelText("Show layer"));
    fireEvent.click(screen.getByLabelText("Unlock layer"));
    expect(flags).toEqual([
      ["hidden", "icon", false],
      ["locked", "label", false],
    ]);
  });

  it("structureLocked turns the tree into a selection-only surface", () => {
    const removed: string[] = [];
    render(
      <LayersPanel
        {...baseProps}
        anatomy={anatomy}
        structureLocked
        onRemove={(part) => removed.push(part)}
      />
    );
    expect(screen.queryByLabelText("Show layer")).toBeNull();
    expect(screen.queryByLabelText("Lock layer")).toBeNull();
    const row = screen.getAllByRole("treeitem")[0] as HTMLElement;
    expect(row.getAttribute("draggable")).toBe("false");
    fireEvent.keyDown(row, { key: "Delete" });
    expect(removed).toEqual([]);
  });

  it("Delete key removes the focused layer when structure is editable", () => {
    const removed: string[] = [];
    render(
      <LayersPanel {...baseProps} anatomy={anatomy} onRemove={(part) => removed.push(part)} />
    );
    const row = screen.getAllByRole("treeitem")[1] as HTMLElement;
    fireEvent.keyDown(row, { key: "Delete" });
    expect(removed).toEqual(["icon"]);
  });

  it("offers a filter input for deep trees and narrows rows by name", () => {
    const deep = [
      { name: "root" },
      { name: "trigger", parent: "root" },
      { name: "popup", parent: "root" },
      { name: "calendar", parent: "popup" },
      { name: "calendar-day", parent: "calendar" },
      { name: "actions", parent: "popup" },
      { name: "apply-action", parent: "actions" },
    ];
    render(<LayersPanel {...baseProps} anatomy={deep} />);
    const filter = screen.getByLabelText("Filter layers");
    fireEvent.change(filter, { target: { value: "calendar-day" } });
    const rows = screen.getAllByRole("treeitem").map((row) => row.getAttribute("data-layer-row"));
    // The match plus its ancestor chain stay visible; unrelated branches drop out.
    expect(rows).toContain("calendar-day");
    expect(rows).not.toContain("apply-action");
  });
});
