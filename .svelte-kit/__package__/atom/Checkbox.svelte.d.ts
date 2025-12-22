import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Checked state */
    checked?: boolean;
    /** Indeterminate state (for select all pattern) */
    indeterminate?: boolean;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
}
declare const Checkbox: import("svelte").Component<Props, {}, "element" | "checked">;
type Checkbox = ReturnType<typeof Checkbox>;
export default Checkbox;
