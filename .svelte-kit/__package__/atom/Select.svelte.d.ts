import type { HTMLSelectAttributes } from 'svelte/elements';
export interface SelectOption {
    /** Option value */
    value: string;
    /** Option label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
}
interface Props extends Omit<HTMLSelectAttributes, 'children'> {
    /** Current value */
    value?: string;
    /** Option list */
    options: SelectOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Left icon class name */
    withIcon?: string;
    /** Element reference for bind:this */
    element?: HTMLSelectElement;
}
declare const Select: import("svelte").Component<Props, {}, "value" | "element">;
type Select = ReturnType<typeof Select>;
export default Select;
