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
