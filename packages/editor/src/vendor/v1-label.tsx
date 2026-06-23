// VENDORED VERBATIM from main `react/atom/label.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { forwardRef } from 'react';

export interface LabelProps extends React.ComponentProps<'label'> {
  /** Label text content */
  children: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Semibold font weight */
  semibold?: boolean;
  /** Show required indicator (*) */
  required?: boolean;
  /** Disabled style */
  disabled?: boolean;
  /** Associated input id */
  htmlFor?: string;
  /** Additional class name */
  className?: string;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      size = 'md',
      semibold,
      required,
      disabled,
      htmlFor,
      className,
      ...rest
    },
    ref
  ) => {
    const labelClass = [
      size !== 'md' && size,
      semibold && 'semibold',
      disabled && 'disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={labelClass || undefined}
        {...rest}
      >
        {children}
        {required && <span className="required">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
