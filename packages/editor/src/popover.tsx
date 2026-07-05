import { type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Fixed-position portal anchored to an element. Inspector-rail popovers
 * (color picker, token picker, icon picker) render through this so the rail's
 * `overflowY: auto` can never clip them; near the viewport bottom the popover
 * flips above its anchor, and it clamps inside the viewport horizontally.
 * ponytail: coordinates are captured per render, not tracked on scroll — the
 * pickers close on blur/backdrop anyway; add a scroll listener if it ever
 * needs to follow.
 */
export function AnchoredPortal({
  anchor,
  width,
  estimatedHeight,
  zIndex = 90,
  children,
}: {
  anchor: HTMLElement | null;
  /** Popover width; "anchor" matches the anchor's width (dropdown style). */
  width: number | "anchor";
  estimatedHeight: number;
  zIndex?: number;
  children: ReactNode;
}) {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const resolvedWidth = width === "anchor" ? rect.width : width;
  const fitsBelow = rect.bottom + 6 + estimatedHeight <= window.innerHeight - margin;
  const fitsAbove = rect.top - 6 - estimatedHeight >= margin;
  const openUp = !fitsBelow && fitsAbove;
  const top = openUp ? rect.top - 6 - estimatedHeight : rect.bottom + 6;
  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - resolvedWidth - margin));
  const style: CSSProperties = {
    position: "fixed",
    top: Math.max(margin, top),
    left,
    width: resolvedWidth,
    zIndex,
  };
  return createPortal(<div style={style}>{children}</div>, document.body);
}
