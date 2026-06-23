// VENDORED VERBATIM from main `react/atom/toggle.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { forwardRef } from 'react';

export interface ToggleProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Checked state */
  checked?: boolean;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ checked, label, disabled, className, onChange, ...rest }, ref) => {
    const toggleClass = ['toggle', className].filter(Boolean).join(' ');

    const input = (
      <input
        ref={ref}
        type="checkbox"
        className={toggleClass}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...rest}
      />
    );

    if (label) {
      return (
        <label>
          {input}
          <span>{label}</span>
        </label>
      );
    }

    return input;
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;
