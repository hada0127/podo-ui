// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IconPicker } from "./icon-picker.js";
import { LocaleProvider } from "./i18n/context.js";

afterEach(cleanup);

const names = ["star", "star-fill", "arrow-down", "bell"];

function renderPicker(props: {
  value: string;
  iconNames: string[];
  onChange: (value: string) => void;
}): ReturnType<typeof render> {
  const ui: ReactElement = (
    <LocaleProvider locale="en" setLocale={() => {}}>
      <IconPicker {...props} />
    </LocaleProvider>
  );
  return render(ui);
}

describe("IconPicker", () => {
  it("opens on focus and filters by the search query", () => {
    renderPicker({ value: "", iconNames: names, onChange: () => {} });
    const search = screen.getByLabelText("Search icons");
    fireEvent.focus(search);
    expect(screen.getByTitle("bell")).toBeDefined();
    fireEvent.change(search, { target: { value: "star" } });
    expect(screen.getByTitle("star")).toBeDefined();
    expect(screen.getByTitle("star-fill")).toBeDefined();
    expect(screen.queryByTitle("bell")).toBeNull();
  });

  it("picks an icon as a v1 icon class", () => {
    const onChange = vi.fn();
    renderPicker({ value: "", iconNames: names, onChange });
    fireEvent.focus(screen.getByLabelText("Search icons"));
    fireEvent.click(screen.getByTitle("arrow-down"));
    expect(onChange).toHaveBeenCalledWith("icon-arrow-down");
  });

  it("picks the top match on Enter (keyboard path)", () => {
    const onChange = vi.fn();
    renderPicker({ value: "", iconNames: names, onChange });
    const search = screen.getByLabelText("Search icons");
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: "bell" } });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("icon-bell");
  });

  it("keeps the popover open while focus moves into the grid (keyboard Tab)", () => {
    renderPicker({ value: "", iconNames: names, onChange: () => {} });
    const search = screen.getByLabelText("Search icons");
    fireEvent.focus(search);
    const cell = screen.getByTitle("star");
    // Tabbing from the input to a grid button blurs the input toward a node still
    // inside the picker, so the popover must stay open (not close under the user).
    fireEvent.blur(search, { relatedTarget: cell });
    expect(screen.getByTitle("star")).toBeDefined();
  });

  it("clears the selection via None", () => {
    const onChange = vi.fn();
    renderPicker({ value: "icon-star", iconNames: names, onChange });
    fireEvent.focus(screen.getByLabelText("Search icons"));
    fireEvent.click(screen.getByText("None"));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
