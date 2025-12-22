export interface RadioGroupOption {
    /** Option value */
    value: string;
    /** Option label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
}
import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'type' | 'name' | 'value'> {
    /** Checked state */
    checked?: boolean;
    /** Group name (required for grouping) */
    name: string;
    /** Radio value */
    value: string;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Element reference for bind:this */
    element?: HTMLInputElement;
}
declare const Radio: import("svelte").Component<Props, {}, "element" | "checked">;
type Radio = ReturnType<typeof Radio>;
export default Radio;
