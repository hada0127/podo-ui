import { type CSSProperties, type ReactNode, useEffect, useReducer, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Fixed-position portal anchored to an element. Inspector-rail popovers
 * (color picker, token picker, icon picker) render through this so the rail's
 * `overflowY: auto` can never clip them; near the viewport bottom the popover
 * flips above its anchor, and it clamps inside the viewport horizontally.
 * Repositions on scroll/resize (capture phase catches the rail's own scroll)
 * so an open picker follows its anchor instead of floating away. Scrolls that
 * originate INSIDE the portal (the picker's own list) are ignored — the anchor
 * hasn't moved, and re-rendering a long list per scroll frame would jank.
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
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    const reposition = (event?: Event) => {
      if (event && contentRef.current?.contains(event.target as Node)) return;
      // rAF-coalesce: one re-render per frame however many containers scrolled.
      if (frameRef.current) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        bump();
      });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);
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
  return createPortal(
    <div ref={contentRef} style={style}>
      {children}
    </div>,
    document.body
  );
}
