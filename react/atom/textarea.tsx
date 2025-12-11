import { z } from 'zod';
import styles from './textarea.module.scss';
import { useValidation } from '../hooks/useValidation';

export interface TextareaWrapperProps extends React.ComponentProps<'textarea'> {
  value: string;
  className?: string;
  validator?: z.ZodType<unknown>;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** ID of element describing the textarea */
  'aria-describedby'?: string;
}

const Textarea: React.FC<TextareaWrapperProps> = ({
  validator,
  value,
  className,
  id,
  ...rest
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  const errorId = `${textareaId}-error`;
  const { message, statusClass, validate } = useValidation(validator);

  return (
    <div className={`${styles.style} ${className}`}>
      <textarea
        id={textareaId}
        {...rest}
        value={value}
        className={`${statusClass} ${className}`}
        onKeyUp={() => validate(value)}
        aria-invalid={statusClass === 'danger' ? true : undefined}
        aria-describedby={message ? errorId : rest['aria-describedby']}
      />
      {validator && message !== '' && (
        <div id={errorId} className="validator" role="alert">
          {message}
        </div>
      )}
    </div>
  );
};

export default Textarea;
