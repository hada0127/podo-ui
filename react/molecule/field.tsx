import { z } from 'zod';
import styles from './field.module.scss';
import { useCallback, useEffect, useState } from 'react';

export interface FieldProps {
  label?: string;
  labelClass?: string;
  required?: boolean;
  helper?: React.ReactNode;
  helperClass?: string;
  error?: string;
  children?: React.ReactNode;
  validator?: z.ZodType<unknown>;
  value?: string;
  setClassName?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const Field = ({
  label,
  labelClass,
  required,
  helper,
  helperClass,
  error,
  children,
  validator,
  value,
  setClassName,
  className,
}: FieldProps) => {
  const [message, setMessage] = useState('');

  const validateHandler = useCallback(() => {
    setMessage('');
    if (setClassName) {
      setClassName('');
    }
    if (validator && value && value.length > 0) {
      try {
        validator.parse(value);
        if (setClassName) {
          setClassName('success');
        }
      } catch (e) {
        if (e instanceof z.ZodError) {
          setMessage(e.errors[0].message);
          if (setClassName) {
            setClassName('danger');
          }
        }
      }
    }
  }, [validator, value, setClassName]);

  useEffect(() => {
    validateHandler();
  }, [validateHandler]);

  const hasError = !!error || (validator && message !== '');
  const helperText = error || message || helper;
  const helperCls = [
    'helper',
    helperClass || '',
    hasError ? 'error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`${styles.style} ${hasError ? 'has-error' : ''} ${className || ''}`}
    >
      {label && (
        <label className={labelClass}>
          {label}

          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="child">
        {children}
        {helperText && <div className={helperCls}>{helperText}</div>}
      </div>
    </div>
  );
};

export default Field;
