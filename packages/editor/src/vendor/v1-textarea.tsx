// VENDORED VERBATIM from main `react/atom/textarea.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { z } from 'zod';
const styles: Record<string, string> = new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : '') });
import { useValidation } from './v1-useValidation.js';

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
