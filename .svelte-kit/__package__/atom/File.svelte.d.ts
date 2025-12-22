import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Accepted file types (e.g., "image/*", ".pdf") */
    accept?: string;
    /** Allow multiple file selection */
    multiple?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
}
declare const File: import("svelte").Component<Props, {}, "element">;
type File = ReturnType<typeof File>;
export default File;
