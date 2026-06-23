// VENDORED VERBATIM from main `react/atom/file.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import { forwardRef } from 'react';

export interface FileInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** Accepted file types (e.g., "image/*", ".pdf") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Change callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * File upload input component.
 * Supports file type filtering, multiple selection, and disabled state.
 */
const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({ accept, multiple, disabled, className, onChange, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className={className}
        onChange={onChange}
        {...rest}
      />
    );
  }
);

FileInput.displayName = 'File';

export { FileInput as File };
export default FileInput;
