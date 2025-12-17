import type { Snippet } from 'svelte';
import type { z } from 'zod';
interface Props {
    /** Label text */
    label?: string;
    /** Label additional class */
    labelClass?: string;
    /** Show required indicator (*) */
    required?: boolean;
    /** Helper text */
    helper?: string;
    /** Helper additional class */
    helperClass?: string;
    /** Field children (input, select, etc.) */
    children?: Snippet;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Value to validate */
    value?: string;
    /** Additional class name */
    class?: string;
}
declare const Field: import("svelte").Component<Props, {}, "">;
type Field = ReturnType<typeof Field>;
export default Field;
