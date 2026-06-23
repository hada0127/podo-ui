import { useState, type DragEvent } from "react";
import { createPortal } from "react-dom";
import type { ComponentDocument } from "@podo/spec";
import { useT } from "./i18n/context.js";
import {
  layerDisclosureStyle,
  layerDropIndicatorStyle,
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

interface LayerNode {
  name: string;
  parent: string | undefined;
  children: LayerNode[];
  depth: number;
}

function buildLayerTree(anatomy: ComponentDocument["anatomy"]): LayerNode[] {
  const byName = new Map<string, LayerNode>(
    anatomy.map((part) => [
      part.name,
      { name: part.name, parent: part.parent, children: [], depth: 0 },
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
 *  to reorder/nest. Operates on the flat `component.anatomy` + `parent` model. */
export function LayersPanel({
  anatomy,
  selectedPart,
  onSelect,
  onRename,
  onAdd,
  onRemove,
  onReorder,
  onReparent,
  onMove,
}: {
  anatomy: ComponentDocument["anatomy"];
  selectedPart: string;
  onSelect: (part: string) => void;
  onRename: (from: string, to: string) => void;
  onAdd: (name: string, parent?: string) => void;
  onRemove: (part: string) => void;
  onReorder: (part: string, beforeName: string | null) => void;
  onReparent: (part: string, newParent: string | null) => void;
  onMove: (part: string, newParent: string | null, beforeName: string | null) => void;
}) {
  const t = useT();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [menu, setMenu] = useState<LayerMenu | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ part: string; zone: DropZone } | null>(null);

  const roots = buildLayerTree(anatomy);
  const visible: LayerNode[] = [];
  const walk = (nodes: LayerNode[]): void => {
    for (const node of nodes) {
      visible.push(node);
      if (!collapsed.has(node.name)) walk(node.children);
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

  const menuActions: Array<{ label: string; run: (part: string) => void }> = [
    { label: t("layers.menuRename"), run: (part) => setRenaming(part) },
    { label: t("layers.menuAddChild"), run: (part) => onAdd(`${part}-child`, part) },
    {
      label: t("layers.menuAddSibling"),
      run: (part) => {
        const node = visible.find((item) => item.name === part);
        onAdd(`${part}-sibling`, node?.parent);
      },
    },
    {
      label: t("layers.menuDuplicate"),
      run: (part) => {
        const node = visible.find((item) => item.name === part);
        onAdd(`${part}-copy`, node?.parent);
      },
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

  return (
    <div style={layerTreeStyle}>
      {visible.map((node) => {
        const hasChildren = node.children.length > 0;
        const isActive = node.name === selectedPart;
        const hint = dropHint?.part === node.name ? dropHint.zone : null;
        return (
          <div
            key={node.name}
            role="treeitem"
            aria-selected={isActive}
            draggable={renaming !== node.name}
            style={{
              ...layerRowStyle,
              ...(isActive ? layerRowActiveStyle : {}),
              paddingLeft: 6 + node.depth * 14,
              position: "relative",
              ...(hint === "inside" ? { outline: "2px solid #c4b5fd", outlineOffset: -2 } : {}),
            }}
            onClick={() => onSelect(node.name)}
            onDoubleClick={() => setRenaming(node.name)}
            onContextMenu={(event) => {
              event.preventDefault();
              onSelect(node.name);
              setMenu({ x: event.clientX, y: event.clientY, part: node.name });
            }}
            onDragStart={() => setDragging(node.name)}
            onDragEnd={() => {
              setDragging(null);
              setDropHint(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDropHint({ part: node.name, zone: dropZoneFor(event) });
            }}
            onDrop={(event) => {
              event.preventDefault();
              commitDrop(node, dropZoneFor(event));
              setDropHint(null);
            }}
          >
            {hint === "before" ? <span style={{ ...layerDropIndicatorStyle, top: -1 }} /> : null}
            {hint === "after" ? <span style={{ ...layerDropIndicatorStyle, bottom: -1 }} /> : null}
            <button
              type="button"
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
              <span style={layerNameStyle}>{humanizeLabel(node.name)}</span>
            )}
          </div>
        );
      })}
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
                {menuActions.map((action) => (
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
                ))}
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
