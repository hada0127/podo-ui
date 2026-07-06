import { useMemo, useRef, useState } from "react";
import { AnchoredPortal } from "./popover.js";
import {
  inputStyle,
  railTextInputStyle,
  rowStyle,
  tokenPickerDropdownStyle,
  tokenPickerEmptyStyle,
  tokenPickerLabelStyle,
  tokenPickerOptionStyle,
  tokenPickerSwatchEmptyStyle,
  tokenPickerSwatchStyle,
  tokenPickerValueStyle,
  tokenPickerWrapStyle,
} from "./styles.js";
import { useT } from "./i18n/context.js";

export interface TokenPickerOption {
  /** Insertable reference, e.g. `{color.primary.base}`. */
  ref: string;
  /** Human label (token path), e.g. `color.primary.base`. */
  label: string;
  /** Serialized raw token value. */
  value: string;
  /** Resolved color (css color string) when the token is a color, else undefined. */
  swatch?: string;
  /** The token's `$type` (color, spacing, radius, typography, …) for filtering. */
  type?: string;
}

/**
 * Searchable token reference picker. A native <datalist> cannot render a color
 * swatch, so this is a custom dropdown showing `name (value)` and, for color
 * tokens, `name (code, swatch)`. Picking an option inserts its reference.
 */
export function TokenPicker({
  options,
  onPick,
  onCancel,
  placeholder,
  autoFocus = false,
  compact = false,
}: {
  options: TokenPickerOption[];
  onPick: (reference: string) => void;
  /** Fires on Escape / blur-away so the host can close an inline picker. */
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** 24px input for the Figma-density inspector rail. */
  compact?: boolean;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q)
        )
      : options;
    return matches.slice(0, 50);
  }, [query, options]);

  return (
    <div style={tokenPickerWrapStyle} ref={wrapRef}>
      <div style={rowStyle}>
        <input
          aria-label={t("tokenPicker.ariaLabel")}
          placeholder={placeholder ?? t("tokenPicker.placeholder")}
          autoFocus={autoFocus}
          style={compact ? { ...railTextInputStyle, flex: 1 } : { ...inputStyle, flex: 1 }}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() =>
            window.setTimeout(() => {
              setOpen(false);
              onCancel?.();
            }, 150)
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              onCancel?.();
            }
          }}
        />
      </div>
      {open ? (
        // Portaled + fixed: the inspector rail's overflow can never clip the list.
        <AnchoredPortal anchor={wrapRef.current} width="anchor" estimatedHeight={240}>
          <div style={{ ...tokenPickerDropdownStyle, position: "static", width: "100%" }}>
            {filtered.length ? (
              filtered.map((option) => (
                <button
                  key={option.ref}
                  type="button"
                  style={tokenPickerOptionStyle}
                  // Prevent the input's blur from closing the list before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onPick(option.ref);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  {option.swatch ? (
                    <span style={{ ...tokenPickerSwatchStyle, background: option.swatch }} />
                  ) : (
                    <span style={tokenPickerSwatchEmptyStyle} />
                  )}
                  <span style={tokenPickerLabelStyle}>{option.label}</span>
                  <span style={tokenPickerValueStyle}>{option.value}</span>
                </button>
              ))
            ) : (
              <div style={tokenPickerEmptyStyle}>{t("tokenPicker.empty")}</div>
            )}
          </div>
        </AnchoredPortal>
      ) : null}
    </div>
  );
}
