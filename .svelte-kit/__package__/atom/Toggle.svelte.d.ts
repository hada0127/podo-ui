import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'type'> {
    /** Checked state */
    checked?: boolean;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
}
declare const Toggle: import("svelte").Component<Props, {}, "element" | "checked">;
type Toggle = ReturnType<typeof Toggle>;
export default Toggle;
