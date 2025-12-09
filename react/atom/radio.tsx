import React, { forwardRef } from 'react';

export interface RadioProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Checked state */
  checked?: boolean;
  /** Group name (required for grouping) */
  name: string;
  /** Radio value */
  value: string;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface RadioGroupOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group name */
  name: string;
  /** Current selected value */
  value?: string;
  /** Option list */
  options: RadioGroupOption[];
  /** Vertical layout */
  vertical?: boolean;
  /** Change callback */
  onChange?: (value: string) => void;
  /** Additional class name */
  className?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ checked, name, value, label, disabled, className, onChange, ...rest }, ref) => {
    const input = (
      <input
        ref={ref}
        type="radio"
        name={name}
        value={value}
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
) as React.ForwardRefExoticComponent<
  RadioProps & React.RefAttributes<HTMLInputElement>
> & {
  Group: React.FC<RadioGroupProps>;
};

Radio.displayName = 'Radio';

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  vertical,
  onChange,
  className,
}) => {
  const groupClass = ['radio-group', vertical && 'vertical', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClass || undefined}>
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          disabled={option.disabled}
          onChange={() => onChange?.(option.value)}
        />
      ))}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';

Radio.Group = RadioGroup;

export default Radio;
