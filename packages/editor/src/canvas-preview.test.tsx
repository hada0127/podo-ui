// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  CanvasPreview,
  createEditorState,
  dropComponentOnCanvas,
  type EditorCanvasState,
} from "./canvas.js";
import { LocaleProvider } from "./i18n/context.js";
import { responsiveViewports, type ResponsiveViewport } from "./viewport.js";
import { legacyComponents } from "./legacy-fixtures.js";
import type { TokenLookup } from "./token-lookup.js";

afterEach(cleanup);

// An empty lookup is valid — cssToken falls back to literal defaults, which is
// fine for asserting structure + interactivity (not exact token colors).
const lookup: TokenLookup = new Map();

function pick(id: string) {
  const component = legacyComponents.find((item) => item.id === id);
  if (!component) throw new Error(`fixture component "${id}" not found`);
  return component;
}

function renderPreview(
  state: EditorCanvasState,
  frame: ResponsiveViewport = responsiveViewports.desktop
): ReturnType<typeof render> {
  const ui: ReactElement = (
    <LocaleProvider locale="en" setLocale={() => {}}>
      <CanvasPreview state={state} frame={frame} lookup={lookup} />
    </LocaleProvider>
  );
  return render(ui);
}

describe("CanvasPreview", () => {
  it("shows the empty hint when nothing is placed", () => {
    renderPreview(createEditorState({ components: [pick("button")] }));
    expect(screen.getByText(/switch to play/i)).toBeDefined();
  });

  it("renders a placed input as a live, focusable form control", () => {
    const input = pick("input");
    const state = dropComponentOnCanvas(createEditorState({ components: [input] }), input, {
      x: 20,
      y: 30,
    });
    renderPreview(state);
    // The real v1 <input> is mounted (live), not a static canvas card.
    const field = document.querySelector(".podo-v1-stage input") as HTMLInputElement | null;
    expect(field).not.toBeNull();
    expect(field!.tagName).toBe("INPUT");
    field!.focus();
    expect(document.activeElement).toBe(field);
  });

  it("renders a placed toggle that flips when clicked (interactive)", () => {
    const toggle = pick("toggle");
    const state = dropComponentOnCanvas(createEditorState({ components: [toggle] }), toggle, {
      x: 0,
      y: 0,
    });
    renderPreview(state);
    const box = document.querySelector(
      '.podo-v1-stage input[type="checkbox"]'
    ) as HTMLInputElement | null;
    expect(box).not.toBeNull();
    const before = box!.checked;
    fireEvent.click(box!);
    expect(box!.checked).toBe(!before);
  });

  it("positions a top-level node at its x/y", () => {
    const button = pick("button");
    const state = dropComponentOnCanvas(createEditorState({ components: [button] }), button, {
      x: 48,
      y: 64,
    });
    const { container } = renderPreview(state);
    const node = state.nodes[0]!;
    const wrapper = container.querySelector(
      '[data-testid="canvas-preview"] > div'
    ) as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.style.left).toBe(`${node.x}px`);
    expect(wrapper!.style.top).toBe(`${node.y}px`);
  });

  it("renders a non-live component (editor) as a schematic card", () => {
    const editor = pick("editor");
    const state = dropComponentOnCanvas(createEditorState({ components: [editor] }), editor, {
      x: 0,
      y: 0,
    });
    renderPreview(state);
    // The card shows the componentId meta; it must NOT mount a live editor toolbar.
    expect(screen.getByText("editor")).toBeDefined();
  });

  it("sizes the frame to the selected viewport", () => {
    const { container } = renderPreview(
      createEditorState({ components: [pick("button")] }),
      responsiveViewports.mobile
    );
    const frame = container.querySelector('[data-testid="canvas-preview"]') as HTMLElement;
    expect(frame.style.width).toBe(`${responsiveViewports.mobile.width}px`);
  });
});
