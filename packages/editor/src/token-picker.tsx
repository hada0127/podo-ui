import { useMemo, useState } from "react";
import {
  inputStyle,
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

export interface TokenPickerOption {
  /** Insertable reference, e.g. `{color.primary.base}`. */
  ref: string;
  /** Human label (token path), e.g. `color.primary.base`. */
  label: string;
  /** Serialized raw token value. */
  value: string;
  /** Resolved color (css color string) when the token is a color, else undefined. */
  swatch?: string;
}

/**
 * Searchable token reference picker. A native <datalist> cannot render a color
 * swatch, so this is a custom dropdown showing `name (value)` and, for color
 * tokens, `name (code, swatch)`. Picking an option inserts its reference.
 */
export function TokenPicker({
  options,
  onPick,
  placeholder = "Insert token…",
}: {
  options: TokenPickerOption[];
  onPick: (reference: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

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
    <div style={tokenPickerWrapStyle}>
      <div style={rowStyle}>
        <input
          aria-label="Insert token reference"
          placeholder={placeholder}
          style={{ ...inputStyle, flex: 1 }}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open ? (
        <div style={tokenPickerDropdownStyle}>
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
            <div style={tokenPickerEmptyStyle}>No tokens match.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
