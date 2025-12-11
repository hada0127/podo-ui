import { useEffect } from 'react';
import { z } from 'zod';
import styles from './input.module.scss';
import { useValidation } from '../hooks/useValidation';

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
