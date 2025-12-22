import type { Snippet } from 'svelte';
type ChipTheme = 'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'red';
type ChipType = 'default' | 'fill' | 'border';
interface Props {
    /** Chip content */
    children: Snippet;
    /** Theme color */
    theme?: ChipTheme;
    /** Style type */
    type?: ChipType;
    /** Size */
    size?: 'sm' | 'md';
    /** Round corners */
    round?: boolean;
    /** Icon class name */
    icon?: string;
    /** Delete button handler */
    ondelete?: () => void;
    /** Additional class name */
    class?: string;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Chip: import("svelte").Component<$$ComponentProps, {}, "">;
type Chip = ReturnType<typeof Chip>;
export default Chip;
