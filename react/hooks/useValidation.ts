import { useState, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationResult {
  message: string;
  statusClass: string;
  validate: (value: string | number | undefined) => void;
  reset: () => void;
}

/**
 * Custom hook for Zod validation
 * @param validator - Zod schema for validation
 * @returns Validation state and handlers
 */
export const useValidation = (
  validator?: z.ZodType<unknown>
): ValidationResult => {
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');

  const reset = useCallback(() => {
    setMessage('');
    setStatusClass('');
  }, []);

  const validate = useCallback(
    (value: string | number | undefined) => {
      reset();

      if (!validator || !value) {
        return;
      }

      try {
        validator.parse(value);
        setStatusClass('success');
      } catch (e) {
        if (e instanceof z.ZodError) {
          setMessage(e.errors[0].message);
          setStatusClass('danger');
        }
      }
    },
    [validator, reset]
  );

  return { message, statusClass, validate, reset };
};

export default useValidation;
