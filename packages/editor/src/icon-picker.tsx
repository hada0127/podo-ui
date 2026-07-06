import { useMemo, useRef, useState } from "react";
import { useT } from "./i18n/context.js";
import { AnchoredPortal } from "./popover.js";
import {
  iconPickerCellActiveStyle,
  iconPickerCellGlyphStyle,
  iconPickerCellNameStyle,
  iconPickerCellStyle,
  iconPickerGridStyle,
  iconPickerPopoverStyle,
  iconPickerSwatchStyle,
  railTextInputStyle,
  rowStyle,
  tokenPickerEmptyStyle,
  tokenPickerWrapStyle,
} from "./styles.js";

// Searchable icon picker with live glyph previews. The stored value is the v1
// icon class (icon-<name>) the components render; an empty value clears the icon.
// The v1 icon font CSS (`[class^=icon-]::before`) is global, so glyphs render here
// without a `.podo-v1-stage` wrapper.
export function IconPicker({
  value,
  iconNames,
  onChange,
}: {
  value: string;
  iconNames: string[];
  onChange: (value: string) => void;
}) {
  const t = useT();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // The popover lives in a portal (outside wrapperRef), so focus containment
  // must check both containers or Tabbing into the grid would close it.
  const popoverRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const names = q ? iconNames.filter((name) => name.toLowerCase().includes(q)) : iconNames;
    return names.slice(0, 300);
  }, [query, iconNames]);
  const pick = (next: string) => {
    onChange(next);
    setQuery("");
    setOpen(false);
  };
  return (
    <div
      style={tokenPickerWrapStyle}
      ref={wrapperRef}
      // Close only when focus leaves the whole picker, so keyboard users can Tab
      // from the search input into the grid buttons (and Enter to pick) without
      // the popover closing under them.
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (!wrapperRef.current?.contains(next) && !popoverRef.current?.contains(next)) {
          setOpen(false);
        }
      }}
    >
      <div style={rowStyle}>
        <span style={iconPickerSwatchStyle} aria-hidden>
          {value ? <i className={value} /> : "—"}
        </span>
        <input
          aria-label={t("components.iconSearch")}
          placeholder={t("components.iconSearch")}
          style={{ ...railTextInputStyle, flex: 1 }}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            } else if (event.key === "Enter" && filtered[0]) {
              // Enter picks the top match so the search box alone is operable.
              event.preventDefault();
              pick(`icon-${filtered[0]}`);
            }
          }}
        />
      </div>
      {open ? (
        // Portaled + fixed: never clipped by the rail's overflow scrolling.
        <AnchoredPortal anchor={wrapperRef.current} width="anchor" estimatedHeight={260}>
          <div
            ref={popoverRef}
            style={{ ...iconPickerPopoverStyle, position: "static", width: "100%" }}
            // Keep focus-leave symmetric: blurring OUT of the portal closes too.
            onBlur={(event) => {
              const next = event.relatedTarget as Node | null;
              if (!wrapperRef.current?.contains(next) && !popoverRef.current?.contains(next)) {
                setOpen(false);
              }
            }}
          >
            <button
              type="button"
              style={{ ...iconPickerCellStyle, flexDirection: "row", width: "100%" }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick("")}
            >
              <span style={iconPickerCellGlyphStyle}>—</span>
              <span style={iconPickerCellNameStyle}>{t("components.iconNone")}</span>
            </button>
            {filtered.length ? (
              <div style={iconPickerGridStyle}>
                {filtered.map((name) => {
                  const className = `icon-${name}`;
                  const active = value === className;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      style={
                        active
                          ? { ...iconPickerCellStyle, ...iconPickerCellActiveStyle }
                          : iconPickerCellStyle
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pick(className)}
                    >
                      <i className={className} style={iconPickerCellGlyphStyle} aria-hidden />
                      <span style={iconPickerCellNameStyle}>{name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={tokenPickerEmptyStyle}>{t("tokenPicker.empty")}</div>
            )}
          </div>
        </AnchoredPortal>
      ) : null}
    </div>
  );
}
