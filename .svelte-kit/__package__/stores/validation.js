import { writable } from 'svelte/store';
import { z } from 'zod';
/**
 * Create a validation store for Zod schema validation
 * @param validator - Zod schema for validation
 * @returns Validation store with message, statusClass, validate, and reset
 */
export function createValidation(validator) {
    var message = writable('');
    var statusClass = writable('');
    var reset = function () {
        message.set('');
        statusClass.set('');
    };
    var validate = function (value) {
        reset();
        if (!validator || !value) {
            return;
        }
        try {
            validator.parse(value);
            statusClass.set('success');
        }
        catch (e) {
            if (e instanceof z.ZodError) {
                message.set(e.errors[0].message);
                statusClass.set('danger');
            }
        }
    };
    return {
        message: { subscribe: message.subscribe },
        statusClass: { subscribe: statusClass.subscribe },
        validate: validate,
        reset: reset,
    };
}
export default createValidation;
