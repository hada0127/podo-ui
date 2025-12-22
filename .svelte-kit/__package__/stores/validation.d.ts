import { type Readable } from 'svelte/store';
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
export declare function createValidation(validator?: z.ZodType<unknown>): ValidationStore;
export default createValidation;
