// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IconsPanelControls, IconsPanelWorkspace } from "./icons-panel.js";
import type { EditorIconManifest } from "./icons-model.js";
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

function model(): EditorIconManifest {
  return {
    fontFamily: "PodoIcons",
    icons: {
      star: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M500 100L900 900L100 900Z" fill="currentColor"/></svg>',
        codepoint: "E900",
        tags: ["shape"],
      },
      heart: {
        svg: '<svg viewBox="0 0 1000 1000"><path d="M500 800L100 400L900 400Z" fill="currentColor"/></svg>',
        codepoint: "E901",
        tags: [],
      },
    },
    groups: { shapes: ["star"] },
    builtHash: "deadbeef",
  };
}

function workspaceProps(overrides: Partial<Parameters<typeof IconsPanelWorkspace>[0]> = {}) {
  return {
    model: model(),
    selectedIconName: undefined,
    setSelectedIconName: vi.fn(),
    activeGroup: undefined,
    setActiveGroup: vi.fn(),
    iconSearch: "",
    setIconSearch: vi.fn(),
    draftError: undefined,
    addIconFromSvg: vi.fn(),
    renameSelectedIcon: vi.fn(),
    replaceSelectedIconSvg: vi.fn(),
    updateSelectedIconTags: vi.fn(),
    updateSelectedIconDescription: vi.fn(),
    deleteSelectedIcon: vi.fn(),
    toggleIconGroupMembership: vi.fn(),
    drawTarget: undefined,
    openDrawNew: vi.fn(),
    openDrawEdit: vi.fn(),
    applyDraw: vi.fn(),
    closeDraw: vi.fn(),
    ...overrides,
  };
}

describe("IconsPanelWorkspace", () => {
  it("renders icon tiles with names and codepoints", () => {
    renderKo(<IconsPanelWorkspace {...workspaceProps()} />);
    expect(screen.getByText("star")).toBeDefined();
    expect(screen.getByText("heart")).toBeDefined();
    expect(screen.getAllByText(/U\+E90/).length).toBeGreaterThanOrEqual(2);
  });

  it("selects an icon when its tile is clicked", () => {
    const setSelectedIconName = vi.fn();
    renderKo(<IconsPanelWorkspace {...workspaceProps({ setSelectedIconName })} />);
    fireEvent.click(screen.getByTitle("star (U+E900)"));
    expect(setSelectedIconName).toHaveBeenCalledWith("star");
  });

  it("adds an icon from pasted SVG markup", () => {
    const addIconFromSvg = vi.fn();
    renderKo(<IconsPanelWorkspace {...workspaceProps({ addIconFromSvg })} />);
    const textarea = screen.getByLabelText("SVG 코드 붙여넣기");
    const svg = '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20"/></svg>';
    fireEvent.change(textarea, { target: { value: svg } });
    fireEvent.click(screen.getByText("붙여넣은 SVG 추가"));
    expect(addIconFromSvg).toHaveBeenCalledWith(svg, undefined);
  });

  it("shows the inspector and deletes the selected icon", () => {
    const deleteSelectedIcon = vi.fn();
    renderKo(
      <IconsPanelWorkspace {...workspaceProps({ selectedIconName: "star", deleteSelectedIcon })} />
    );
    expect(screen.getByLabelText("star 상세")).toBeDefined();
    fireEvent.click(screen.getByText("아이콘 삭제"));
    expect(deleteSelectedIcon).toHaveBeenCalled();
  });

  it("filters tiles by the search query", () => {
    renderKo(<IconsPanelWorkspace {...workspaceProps({ iconSearch: "heart" })} />);
    expect(screen.queryByText("heart")).not.toBeNull();
    expect(screen.queryByText("star")).toBeNull();
  });

  it("opens the vector drawing canvas for a new icon", () => {
    const openDrawNew = vi.fn();
    renderKo(<IconsPanelWorkspace {...workspaceProps({ openDrawNew })} />);
    fireEvent.click(screen.getByText("+ 벡터로 그리기"));
    expect(openDrawNew).toHaveBeenCalled();
  });

  it("shows the drawing canvas with tools when a draw target is active", () => {
    renderKo(
      <IconsPanelWorkspace {...workspaceProps({ drawTarget: { mode: "edit", name: "star" } })} />
    );
    expect(screen.getByText('"star" 편집')).toBeDefined();
    expect(screen.getByLabelText("펜")).toBeDefined();
    expect(screen.getByLabelText("사각형")).toBeDefined();
    expect(screen.getByText("아이콘에 적용")).toBeDefined();
  });
});

describe("IconsPanelControls", () => {
  function controlsProps(overrides: Partial<Parameters<typeof IconsPanelControls>[0]> = {}) {
    return {
      model: model(),
      selectedIconName: undefined,
      setSelectedIconName: vi.fn(),
      activeGroup: undefined,
      setActiveGroup: vi.fn(),
      buildStatus: "ready" as const,
      buildError: undefined,
      createIconGroup: vi.fn(),
      deleteIconGroup: vi.fn(),
      saveIconFont: vi.fn(),
      ...overrides,
    };
  }

  it("shows the group list and a stale-aware save action", () => {
    renderKo(<IconsPanelControls {...controlsProps()} />);
    // builtHash !== current hash → stale → save enabled.
    expect(screen.getByText("저장 필요")).toBeDefined();
    expect(screen.getByText("shapes")).toBeDefined();
    expect(screen.getByText("전체 아이콘")).toBeDefined();
  });

  it("triggers the icon font build on save", () => {
    const saveIconFont = vi.fn();
    renderKo(<IconsPanelControls {...controlsProps({ saveIconFont })} />);
    fireEvent.click(screen.getByText("woff2 빌드·저장"));
    expect(saveIconFont).toHaveBeenCalled();
  });

  it("creates a new group", () => {
    const createIconGroup = vi.fn();
    renderKo(<IconsPanelControls {...controlsProps({ createIconGroup })} />);
    fireEvent.change(screen.getByLabelText("새 그룹 이름"), { target: { value: "outlines" } });
    fireEvent.click(screen.getByText("+ 그룹 추가"));
    expect(createIconGroup).toHaveBeenCalledWith("outlines");
  });
});
