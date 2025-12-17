import type { HTMLInputAttributes } from 'svelte/elements';
import type { z } from 'zod';
interface Props extends HTMLInputAttributes {
    /** Input value */
    value?: string | number;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Left icon class name */
    withIcon?: string;
    /** Right icon class name */
    withRightIcon?: string;
    /** Unit text (e.g., "원", "kg") */
    unit?: string;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
}
declare const Input: import("svelte").Component<Props, {}, "value" | "element">;
type Input = ReturnType<typeof Input>;
export default Input;
