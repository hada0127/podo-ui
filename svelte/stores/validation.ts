import { writable, type Readable } from 'svelte/store';
import { z } from 'zod';

export interface ValidationStore {
  message: Readable<string>;
  statusClass: Readable<string>;
  validate: (value: string | number | undefined) => void;
  reset: () => void;
}

/**
 * Create a validation store for Zod schema validation
 * @param validator - Zod schema for validation
 * @returns Validation store with message, statusClass, validate, and reset
 */
export function createValidation(
  validator?: z.ZodType<unknown>
): ValidationStore {
  const message = writable('');
  const statusClass = writable('');

  const reset = () => {
    message.set('');
    statusClass.set('');
  };

  const validate = (value: string | number | undefined) => {
    reset();

    if (!validator || !value) {
      return;
    }

    try {
      validator.parse(value);
      statusClass.set('success');
    } catch (e) {
      if (e instanceof z.ZodError) {
        message.set(e.errors[0].message);
        statusClass.set('danger');
      }
    }
  };

  return {
    message: { subscribe: message.subscribe },
    statusClass: { subscribe: statusClass.subscribe },
    validate,
    reset,
  };
}

export default createValidation;
