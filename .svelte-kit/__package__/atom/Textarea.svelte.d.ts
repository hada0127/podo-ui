import type { HTMLTextareaAttributes } from 'svelte/elements';
import type { z } from 'zod';
interface Props extends HTMLTextareaAttributes {
    /** Textarea value */
    value?: string;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Element reference for bind:this */
    element?: HTMLTextAreaElement;
}
declare const Textarea: import("svelte").Component<Props, {}, "value" | "element">;
type Textarea = ReturnType<typeof Textarea>;
export default Textarea;
