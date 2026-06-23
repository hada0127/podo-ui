// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IconPaperEditor } from "./icon-paper-editor.js";
import { LocaleProvider } from "./i18n/context.js";

afterEach(cleanup);

// These assertions cover the Korean UI; render under an explicit ko locale so
// they do not depend on the jsdom navigator language.
const renderKo = (ui: ReactElement): ReturnType<typeof render> =>
  render(
    <LocaleProvider locale="ko" setLocale={() => {}}>
      {ui}
    </LocaleProvider>
  );

// jsdom has no canvas 2d context, so paper does not initialize; the component
// still renders its full tool/action chrome, which is what these assertions cover.
describe("IconPaperEditor", () => {
  it("renders the full tool palette and editing actions", () => {
    renderKo(
      <IconPaperEditor initialSvg="" title="새 아이콘" onApply={vi.fn()} onClose={vi.fn()} />
    );
    for (const label of [
      "이동/크기",
      "노드 편집",
      "펜",
      "가위 컷",
      "사각형",
      "타원",
      "선",
      "다각형",
      "별",
    ]) {
      expect(screen.getByLabelText(label)).toBeDefined();
    }
    for (const label of ["합치기", "빼기", "교차", "제외", "좌우반전", "90°", "캔버스 중앙"]) {
      expect(screen.getByText(label)).toBeDefined();
    }
    // Properties: fill/stroke/swap + stroke-weight.
    expect(screen.getByText("채움")).toBeDefined();
    expect(screen.getByText("면↔선")).toBeDefined();
    expect(screen.getByText("굵기")).toBeDefined();
  });

  it("cancels via the close action", () => {
    const onClose = vi.fn();
    renderKo(
      <IconPaperEditor initialSvg="" title="새 아이콘" onApply={vi.fn()} onClose={onClose} />
    );
    fireEvent.click(screen.getByText("취소"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows node-editing actions when the node tool is active", () => {
    renderKo(
      <IconPaperEditor initialSvg="" title="새 아이콘" onApply={vi.fn()} onClose={vi.fn()} />
    );
    fireEvent.click(screen.getByLabelText("노드 편집"));
    for (const label of ["둥글게", "뾰족하게", "앵커 삭제"]) {
      expect(screen.getByText(label)).toBeDefined();
    }
  });

  it("disables boolean ops until two objects are selected", () => {
    renderKo(
      <IconPaperEditor initialSvg="" title="새 아이콘" onApply={vi.fn()} onClose={vi.fn()} />
    );
    expect((screen.getByText("합치기") as HTMLButtonElement).disabled).toBe(true);
  });
});
