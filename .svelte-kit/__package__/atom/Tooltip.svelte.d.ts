import type { Snippet } from 'svelte';
type TooltipVariant = 'default' | 'info';
type TooltipPosition = 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight' | 'left' | 'leftTop' | 'leftBottom' | 'right' | 'rightTop' | 'rightBottom';
interface Props {
    /** Trigger element (button, icon, etc.) */
    children: Snippet;
    /** Tooltip content (can include any JSX) */
    content: Snippet;
    /** Tooltip visual variant */
    variant?: TooltipVariant;
    /** Arrow position */
    position?: TooltipPosition;
    /** Distance from trigger element in pixels */
    offset?: number;
    /** Control visibility externally (overrides hover state) */
    isVisible?: boolean;
    /** Additional CSS class */
    class?: string;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Tooltip: import("svelte").Component<$$ComponentProps, {}, "">;
type Tooltip = ReturnType<typeof Tooltip>;
export default Tooltip;
