// VENDORED VERBATIM from main `react/atom/checkbox.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';

export interface CheckboxProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Checked state */
  checked?: boolean;
  /** Indeterminate state (for select all pattern) */
  indeterminate?: boolean;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { checked, indeterminate, label, disabled, className, onChange, ...rest },
    ref
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);

    // Combine forwarded ref with inner ref
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    // Handle indeterminate state (DOM property only, not HTML attribute)
    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    const input = (
      <input
        ref={innerRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={className}
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
