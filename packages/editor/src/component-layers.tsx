import { useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ComponentDocument } from "@podo/spec";
import { useT } from "./i18n/context.js";
import {
  layerDisclosureStyle,
  layerDropIndicatorStyle,
  layerFilterInputStyle,
  layerFlagButtonOnStyle,
  layerFlagButtonStyle,
  layerIconStyle,
  layerMenuItemStyle,
  layerMenuStyle,
  layerNameStyle,
  layerRenameInputStyle,
  layerRowActiveStyle,
  layerRowStyle,
  layerTreeStyle,
} from "./styles.js";

function humanizeLabel(name: string): string {
  return name.replace(/[-_.]/g, " ").replace(/^\w/, (char) => char.toUpperCase());
}

function layerGlyph(part: string): string {
  if (/text|label|message|header/i.test(part)) return "T";
  if (/icon/i.test(part)) return "◇";
  if (/image|avatar|thumb/i.test(part)) return "▦";
  if (/ring|indicator|dot/i.test(part)) return "◎";
  if (/button|action|close/i.test(part)) return "▭";
  if (/root|frame|container|wrap|provider|viewport/i.test(part)) return "▣";
  return "▢";
}

// Figma-style eye / lock glyphs as tiny inline SVGs (1.5px strokes to match the
// editor chrome), so the toggles read as icons rather than emoji.
function EyeIcon({ off }: { off?: boolean }): ReactNode {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      {off ? <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" /> : null}
    </svg>
  );
}

function LockIcon({ open }: { open?: boolean }): ReactNode {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      {open ? (
        <path d="M8 10V7a4 4 0 0 1 7.8-1.3" stroke="currentColor" strokeWidth="2" />
      ) : (
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

type AnatomyPart = ComponentDocument["anatomy"][number];

interface LayerNode {
  name: string;
  parent: string | undefined;
  children: LayerNode[];
  depth: number;
  hidden: boolean;
  locked: boolean;
}

function buildLayerTree(anatomy: ComponentDocument["anatomy"]): LayerNode[] {
  const byName = new Map<string, LayerNode>(
    anatomy.map((part: AnatomyPart) => [
      part.name,
      {
        name: part.name,
        parent: part.parent,
        children: [],
        depth: 0,
        hidden: part.hidden === true,
        locked: part.locked === true,
      },
    ])
  );
  const roots: LayerNode[] = [];
  for (const part of anatomy) {
    const node = byName.get(part.name);
    if (!node) continue;
    const parentNode = part.parent ? byName.get(part.parent) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const assignDepth = (nodes: LayerNode[], depth: number): void => {
    for (const node of nodes) {
      node.depth = depth;
      assignDepth(node.children, depth + 1);
    }
  };
  assignDepth(roots, 0);
  return roots;
}

type DropZone = "before" | "inside" | "after";

function dropZoneFor(event: DragEvent<HTMLElement>): DropZone {
  const rect = event.currentTarget.getBoundingClientRect();
  const offset = event.clientY - rect.top;
  if (offset < rect.height * 0.3) return "before";
  if (offset > rect.height * 0.7) return "after";
  return "inside";
}

interface LayerMenu {
  x: number;
  y: number;
  part: string;
}

/** Figma-style hierarchical layers panel: select, rename, right-click menu, drag
 *  to reorder/nest, eye/lock toggles, keyboard navigation, and a name filter.
 *  Operates on the flat `component.anatomy` + `parent` model. With
 *  `structureLocked` (style-only components like the datepicker) the tree is a
 *  pure selection surface: no rename/drag/menu/flag edits. */
export function LayersPanel({
  anatomy,
  selectedParts,
  highlightPart,
  structureLocked = false,
  onSelect,
  onHover,
  onRename,
  onAdd,
  onDuplicate,
  onRemove,
  onReorder,
  onReparent,
  onMove,
  onToggleHidden,
  onToggleLocked,
  onCopyAppearance,
  onPasteAppearance,
}: {
  anatomy: ComponentDocument["anatomy"];
  // Ordered multi-selection; the LAST entry is the primary part (Figma-style
  // Shift+click range / Cmd+click toggle).
  selectedParts: string[];
  // Row to tint while its preview element is hovered (preview → layers sync).
  highlightPart?: string | null;
  structureLocked?: boolean;
  onSelect: (part: string, options?: { toggle?: boolean; range?: string[] }) => void;
  onHover?: (part: string | null) => void;
  onRename: (from: string, to: string) => void;
  onAdd: (name: string, parent?: string) => void;
  onDuplicate: (part: string) => void;
  onRemove: (part: string) => void;
  onReorder: (part: string, beforeName: string | null) => void;
  onReparent: (part: string, newParent: string | null) => void;
  onMove: (part: string, newParent: string | null, beforeName: string | null) => void;
  onToggleHidden: (part: string, hidden: boolean) => void;
  onToggleLocked: (part: string, locked: boolean) => void;
  // Figma copy/paste appearance (Cmd+Alt+C / Cmd+Alt+V + context menu).
  onCopyAppearance?: (part: string) => void;
  onPasteAppearance?: (part: string) => void;
}) {
  const t = useT();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [menu, setMenu] = useState<LayerMenu | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ part: string; zone: DropZone } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const roots = buildLayerTree(anatomy);
  // Name filter (Figma layers search): a node stays visible when it or any
  // descendant matches; matching subtrees ignore collapse so results show.
  const query = filter.trim().toLowerCase();
  const matches = (node: LayerNode): boolean =>
    node.name.toLowerCase().includes(query) ||
    humanizeLabel(node.name).toLowerCase().includes(query);
  const subtreeMatches = (node: LayerNode): boolean =>
    matches(node) || node.children.some(subtreeMatches);
  const visible: LayerNode[] = [];
  const walk = (nodes: LayerNode[]): void => {
    for (const node of nodes) {
      if (query && !subtreeMatches(node)) continue;
      visible.push(node);
      if (query || !collapsed.has(node.name)) walk(node.children);
    }
  };
  walk(roots);

  const toggleCollapse = (name: string): void =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const siblingsOf = (node: LayerNode): LayerNode[] => {
    const parentNode = node.parent
      ? (visible.find((item) => item.name === node.parent) ?? null)
      : null;
    return parentNode ? parentNode.children : roots;
  };

  const commitDrop = (target: LayerNode, zone: DropZone): void => {
    if (!dragging || dragging === target.name) return;
    if (zone === "inside") {
      onReparent(dragging, target.name);
    } else {
      // Reparent + reorder in a SINGLE commit so neither move clobbers the other.
      const sibs = siblingsOf(target);
      const index = sibs.findIndex((item) => item.name === target.name);
      const before = zone === "before" ? target.name : (sibs[index + 1]?.name ?? null);
      onMove(dragging, target.parent ?? null, before);
    }
  };

  const menuActionsFor = (
    node: LayerNode
  ): Array<{ label: string; run: (part: string) => void }> => [
    { label: t("layers.menuRename"), run: (part) => setRenaming(part) },
    { label: t("layers.menuAddChild"), run: (part) => onAdd(`${part}-child`, part) },
    {
      label: t("layers.menuAddSibling"),
      run: (part) => {
        const item = visible.find((entry) => entry.name === part);
        onAdd(`${part}-sibling`, item?.parent);
      },
    },
    { label: t("layers.menuDuplicate"), run: (part) => onDuplicate(part) },
    ...(onCopyAppearance
      ? [{ label: t("layers.menuCopyAppearance"), run: (part: string) => onCopyAppearance(part) }]
      : []),
    ...(onPasteAppearance
      ? [{ label: t("layers.menuPasteAppearance"), run: (part: string) => onPasteAppearance(part) }]
      : []),
    {
      label: node.hidden ? t("layers.menuShow") : t("layers.menuHide"),
      run: (part) => onToggleHidden(part, !node.hidden),
    },
    {
      label: node.locked ? t("layers.menuUnlock") : t("layers.menuLock"),
      run: (part) => onToggleLocked(part, !node.locked),
    },
    { label: t("layers.menuMoveOut"), run: (part) => onReparent(part, null) },
    { label: t("layers.menuMoveUp"), run: (part) => moveSibling(part, -1) },
    { label: t("layers.menuMoveDown"), run: (part) => moveSibling(part, 1) },
    { label: t("layers.menuDelete"), run: (part) => onRemove(part) },
  ];

  const moveSibling = (part: string, direction: 1 | -1): void => {
    const node = visible.find((item) => item.name === part);
    if (!node) return;
    const sibs = siblingsOf(node);
    const index = sibs.findIndex((item) => item.name === part);
    const target = index + direction;
    if (target < 0 || target >= sibs.length) return;
    if (direction < 0) {
      onReorder(part, sibs[target]?.name ?? null);
    } else {
      onReorder(part, sibs[target + 1]?.name ?? null);
    }
  };

  // Figma-style keys on a focused row: Enter renames, Delete removes, arrows
  // navigate (left/right collapse/expand a branch), Cmd+D duplicates,
  // Cmd+Shift+H / Cmd+Shift+L toggle hide/lock, [ / ] reorder among siblings,
  // Cmd+Alt+C / Cmd+Alt+V copy/paste appearance.
  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, node: LayerNode): void => {
    if (event.target !== event.currentTarget) return; // ignore keys inside the rename input
    const index = visible.findIndex((item) => item.name === node.name);
    const focusRow = (name: string | undefined): void => {
      if (!name) return;
      onSelect(name);
      const row = event.currentTarget.parentElement?.querySelector<HTMLElement>(
        `[data-layer-row="${CSS.escape(name)}"]`
      );
      row?.focus();
    };
    const command = event.metaKey || event.ctrlKey;
    if (command && event.altKey && event.code === "KeyC") {
      event.preventDefault();
      onCopyAppearance?.(node.name);
      return;
    }
    if (command && event.altKey && event.code === "KeyV") {
      event.preventDefault();
      onPasteAppearance?.(node.name);
      return;
    }
    if (command && !event.shiftKey && event.code === "KeyD") {
      event.preventDefault();
      if (!structureLocked) onDuplicate(node.name);
      return;
    }
    if (command && event.shiftKey && event.code === "KeyH") {
      event.preventDefault();
      if (!structureLocked) onToggleHidden(node.name, !node.hidden);
      return;
    }
    if (command && event.shiftKey && event.code === "KeyL") {
      event.preventDefault();
      if (!structureLocked) onToggleLocked(node.name, !node.locked);
      return;
    }
    if (event.code === "BracketLeft" || event.code === "BracketRight") {
      event.preventDefault();
      if (!structureLocked) moveSibling(node.name, event.code === "BracketLeft" ? -1 : 1);
      return;
    }
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        if (!structureLocked) setRenaming(node.name);
        break;
      case "Delete":
      case "Backspace":
        event.preventDefault();
        if (!structureLocked) onRemove(node.name);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusRow(visible[index - 1]?.name);
        break;
      case "ArrowDown":
        event.preventDefault();
        focusRow(visible[index + 1]?.name);
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (node.children.length && !collapsed.has(node.name)) toggleCollapse(node.name);
        else focusRow(node.parent);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (node.children.length && collapsed.has(node.name)) toggleCollapse(node.name);
        else focusRow(node.children[0]?.name);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {anatomy.length > 6 ? (
        <input
          aria-label={t("layers.filter")}
          placeholder={t("layers.filter")}
          style={layerFilterInputStyle}
          value={filter}
          onChange={(event) => setFilter(event.currentTarget.value)}
        />
      ) : null}
      <div style={layerTreeStyle} role="tree">
        {visible.map((node) => {
          const hasChildren = node.children.length > 0;
          const isActive = selectedParts.includes(node.name);
          const isPrimary = selectedParts.at(-1) === node.name;
          const isHovered = hovered === node.name;
          const hint = dropHint?.part === node.name ? dropHint.zone : null;
          return (
            <div
              key={node.name}
              role="treeitem"
              aria-selected={isActive}
              tabIndex={0}
              data-layer-row={node.name}
              // No drag while filtering: the visible list is not the real sibling
              // order, so a drop would compute the wrong "before" target.
              draggable={!structureLocked && renaming !== node.name && !query}
              style={{
                ...layerRowStyle,
                ...(node.name === highlightPart && !isActive ? { background: "#f1f5fb" } : {}),
                ...(isActive ? layerRowActiveStyle : {}),
                ...(isActive && !isPrimary ? { border: "1px solid transparent" } : {}),
                paddingLeft: 6 + node.depth * 14,
                position: "relative",
                ...(node.hidden ? { opacity: 0.45 } : {}),
                ...(hint === "inside" ? { outline: "2px solid #c4b5fd", outlineOffset: -2 } : {}),
              }}
              onClick={(event) => {
                if (event.shiftKey && selectedParts.length) {
                  // Figma Shift+click: contiguous range over the VISIBLE rows
                  // from the primary selection to the clicked row.
                  const anchor = selectedParts.at(-1) as string;
                  const anchorIndex = visible.findIndex((item) => item.name === anchor);
                  const targetIndex = visible.findIndex((item) => item.name === node.name);
                  if (anchorIndex >= 0 && targetIndex >= 0) {
                    const [low, high] =
                      anchorIndex < targetIndex
                        ? [anchorIndex, targetIndex]
                        : [targetIndex, anchorIndex];
                    const range = visible.slice(low, high + 1).map((item) => item.name);
                    // Clicked row last = primary.
                    const ordered = [...range.filter((name) => name !== node.name), node.name];
                    onSelect(node.name, { range: ordered });
                    return;
                  }
                }
                if (event.metaKey || event.ctrlKey) {
                  onSelect(node.name, { toggle: true });
                  return;
                }
                onSelect(node.name);
              }}
              onDoubleClick={() => {
                if (!structureLocked) setRenaming(node.name);
              }}
              onKeyDown={(event) => handleRowKeyDown(event, node)}
              onMouseEnter={() => {
                setHovered(node.name);
                onHover?.(node.name);
              }}
              onMouseLeave={() => {
                setHovered((current) => (current === node.name ? null : current));
                onHover?.(null);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                if (structureLocked) return;
                onSelect(node.name);
                setMenu({ x: event.clientX, y: event.clientY, part: node.name });
              }}
              onDragStart={() => setDragging(node.name)}
              onDragEnd={() => {
                setDragging(null);
                setDropHint(null);
              }}
              onDragOver={(event) => {
                if (structureLocked) return;
                event.preventDefault();
                setDropHint({ part: node.name, zone: dropZoneFor(event) });
              }}
              onDrop={(event) => {
                if (structureLocked) return;
                event.preventDefault();
                commitDrop(node, dropZoneFor(event));
                setDropHint(null);
              }}
            >
              {hint === "before" ? <span style={{ ...layerDropIndicatorStyle, top: -1 }} /> : null}
              {hint === "after" ? (
                <span style={{ ...layerDropIndicatorStyle, bottom: -1 }} />
              ) : null}
              <button
                type="button"
                tabIndex={-1}
                aria-label={hasChildren ? t("layers.toggleLayer") : undefined}
                style={layerDisclosureStyle}
                onClick={(event) => {
                  event.stopPropagation();
                  if (hasChildren) toggleCollapse(node.name);
                }}
              >
                {hasChildren ? (collapsed.has(node.name) ? "›" : "⌄") : ""}
              </button>
              <span style={layerIconStyle}>{layerGlyph(node.name)}</span>
              {renaming === node.name ? (
                <input
                  autoFocus
                  defaultValue={node.name}
                  style={layerRenameInputStyle}
                  onClick={(event) => event.stopPropagation()}
                  onBlur={(event) => {
                    onRename(node.name, event.currentTarget.value);
                    setRenaming(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") setRenaming(null);
                  }}
                />
              ) : (
                <span style={layerNameStyle} title={humanizeLabel(node.name)}>
                  {humanizeLabel(node.name)}
                </span>
              )}
              {structureLocked ? null : (
                <>
                  {/* Lock first, then eye — matching Figma's trailing controls.
                      Tabbable, and focusing reveals them (keyboard-only parity
                      with the hover reveal). */}
                  <button
                    type="button"
                    aria-label={node.locked ? t("layers.unlockLayer") : t("layers.lockLayer")}
                    aria-pressed={node.locked}
                    style={{
                      ...layerFlagButtonStyle,
                      ...(node.locked ? layerFlagButtonOnStyle : {}),
                      // Reserve the slot; reveal on row hover/focus or when on.
                      // opacity (not visibility) keeps the button keyboard-focusable
                      // while invisible — focusing it reveals it via onFocus.
                      opacity: node.locked || isHovered ? 1 : 0,
                    }}
                    onFocus={() => setHovered(node.name)}
                    onBlur={() => setHovered((current) => (current === node.name ? null : current))}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleLocked(node.name, !node.locked);
                    }}
                  >
                    <LockIcon open={!node.locked} />
                  </button>
                  <button
                    type="button"
                    aria-label={node.hidden ? t("layers.showLayer") : t("layers.hideLayer")}
                    aria-pressed={node.hidden}
                    style={{
                      ...layerFlagButtonStyle,
                      ...(node.hidden ? layerFlagButtonOnStyle : {}),
                      opacity: node.hidden || isHovered ? 1 : 0,
                    }}
                    onFocus={() => setHovered(node.name)}
                    onBlur={() => setHovered((current) => (current === node.name ? null : current))}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleHidden(node.name, !node.hidden);
                    }}
                  >
                    <EyeIcon off={node.hidden} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
      {menu
        ? createPortal(
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 80 }}
                onPointerDown={() => setMenu(null)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setMenu(null);
                }}
              />
              <div role="menu" style={{ ...layerMenuStyle, left: menu.x, top: menu.y }}>
                {(() => {
                  const node = visible.find((item) => item.name === menu.part);
                  if (!node) return null;
                  return menuActionsFor(node).map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      role="menuitem"
                      style={layerMenuItemStyle}
                      onClick={() => {
                        action.run(menu.part);
                        setMenu(null);
                      }}
                    >
                      {action.label}
                    </button>
                  ));
                })()}
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
