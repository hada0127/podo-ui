// VENDORED VERBATIM from main `react/atom/input.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { useEffect } from 'react';
import { z } from 'zod';
const styles: Record<string, string> = new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : '') });
import { useValidation } from './v1-useValidation.js';

export interface InputWrapperProps extends React.ComponentProps<'input'> {
  value?: string | number;
  className?: string;
  validator?: z.ZodType<unknown>;
  withIcon?: string;
  withRightIcon?: string;
  unit?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** ID of element describing the input */
  'aria-describedby'?: string;
}

const Input: React.FC<InputWrapperProps> = ({
  validator,
  value,
  className,
  withIcon,
  withRightIcon,
  unit,
  type = 'text',
  id,
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = `${inputId}-error`;
  const { message, statusClass, validate } = useValidation(validator);

  useEffect(() => {
    validate(value);
  }, [validate, value]);

  return (
    <div className={`${styles.style} ${className || ''}`}>
      <div
        className={`${className || ''} ${withIcon ? 'with-icon' : ''} ${withRightIcon ? 'with-right-icon' : ''}`}
      >
        {withIcon && <i className={withIcon} />}
        <input
          id={inputId}
          type={type}
          {...rest}
          value={value ?? ''}
          className={`${statusClass} ${className || ''}`}
          aria-invalid={statusClass === 'danger' ? true : undefined}
          aria-describedby={message ? errorId : rest['aria-describedby']}
        />
        {withRightIcon && <i className={withRightIcon} />}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {validator && message !== '' && (
        <div id={errorId} className="validator" role="alert">
          {message}
        </div>
      )}
    </div>
  );
};

export default Input;
