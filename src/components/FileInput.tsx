import { InputHTMLAttributes, useRef, ChangeEvent } from 'react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onFileSelect?: (files: File[]) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({
  onFileSelect,
  onChange,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && onFileSelect) {
      onFileSelect(Array.from(files));
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="file"
      onChange={handleChange}
      {...props}
    />
  );
}
