import { z } from 'zod';
import styles from './field.module.scss';
import { useCallback, useEffect, useState } from 'react';

interface Props {
  label?: string;
  labelClass?: string;
  required?: boolean;
  helper?: string;
  helperClass?: string;
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
  children,
  validator,
  value,
  setClassName,
  className,
}: Props) => {
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

  return (
    <div className={`${styles.style} ${className || ''}`}>
      {label && (
        <label className={labelClass}>
          {label}

          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="child">{children}</div>
      {helper ||
        (validator && message !== '' && (
          <div className={`helper ${helperClass || ''}`}>
            {message || helper}
          </div>
        ))}
    </div>
  );
};

export default Field;
