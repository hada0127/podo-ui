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
