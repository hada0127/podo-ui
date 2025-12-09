import { forwardRef } from 'react';

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.ComponentProps<'select'>, 'children'> {
  /** Current value */
  value?: string;
  /** Option list */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Left icon class name */
  withIcon?: string;
  /** Additional class name */
  className?: string;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Select dropdown component with customizable options.
 * Supports placeholder, disabled state, and optional left icon.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value,
      options,
      placeholder,
      disabled,
      withIcon,
      className,
      onChange,
      ...rest
    },
    ref
  ) => {
    const selectElement = (
      <select
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={className}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );

    if (withIcon) {
      return (
        <div className="with-icon">
          <i className={withIcon} />
          {selectElement}
        </div>
      );
    }

    return selectElement;
  }
);

Select.displayName = 'Select';

export default Select;
