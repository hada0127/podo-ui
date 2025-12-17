import type { RadioGroupOption } from './Radio.svelte';
interface Props {
    /** Group name */
    name: string;
    /** Current selected value */
    value?: string;
    /** Option list */
    options: RadioGroupOption[];
    /** Vertical layout */
    vertical?: boolean;
    /** Additional class name */
    class?: string;
}
declare const RadioGroup: import("svelte").Component<Props, {}, "value">;
type RadioGroup = ReturnType<typeof RadioGroup>;
export default RadioGroup;
