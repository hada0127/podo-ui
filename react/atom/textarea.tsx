import { useState } from 'react';
import { z } from 'zod';
import styles from './textarea.module.scss';

interface TextareaWrapperProps extends React.ComponentProps<'textarea'> {
  value: string;
  className?: string;
  validator?: z.ZodType<unknown>;
}

const Textarea: React.FC<TextareaWrapperProps> = ({
  validator,
  value,
  className,
  ...rest
}) => {
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');

  const validateHandler = () => {
    setMessage('');
    setStatusClass('');
    if (validator && value.length > 0) {
      try {
        validator.parse(value);
        setStatusClass('success');
      } catch (e) {
        if (e instanceof z.ZodError) {
          setMessage(e.errors[0].message);
          setStatusClass('danger');
        }
      }
    }
  };

  return (
    <div className={`${styles.style} ${className}`}>
      <textarea
        {...rest}
        value={value}
        className={`${statusClass} ${className}`}
        onKeyUp={validateHandler}
      />
      {validator && message !== '' && (
        <div className="validator">{message}</div>
      )}
    </div>
  );
};

export default Textarea;
