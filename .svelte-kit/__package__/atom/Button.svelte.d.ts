import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type ButtonTheme = 'default' | 'primary' | 'default-deep' | 'info' | 'link' | 'success' | 'warning' | 'danger';
type ButtonVariant = 'solid' | 'fill' | 'border' | 'text';
type ButtonSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
interface Props extends HTMLButtonAttributes {
    /** Theme color */
    theme?: ButtonTheme;
    /** Style variant */
    variant?: ButtonVariant;
    /** Size */
    size?: ButtonSize;
    /** Left icon class name */
    icon?: string;
    /** Right icon class name */
    rightIcon?: string;
    /** Loading state */
    loading?: boolean;
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right';
    /** Children content */
    children?: Snippet;
}
declare const Button: import("svelte").Component<Props, {}, "">;
type Button = ReturnType<typeof Button>;
export default Button;
