import type { Snippet } from 'svelte';
import type { HTMLLabelAttributes } from 'svelte/elements';
interface Props extends HTMLLabelAttributes {
    /** Label text content */
    children: Snippet;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Semibold font weight */
    semibold?: boolean;
    /** Show required indicator (*) */
    required?: boolean;
    /** Disabled style */
    disabled?: boolean;
    /** Associated input id */
    for?: string;
}
declare const Label: import("svelte").Component<Props, {}, "">;
type Label = ReturnType<typeof Label>;
export default Label;
