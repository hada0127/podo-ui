import type { Snippet } from 'svelte';
interface Props {
    /** Tab key (must match Tab item key) */
    tabKey: string;
    /** Current active key */
    activeKey?: string;
    /** Panel content */
    children: Snippet;
    /** Additional class name */
    class?: string;
}
declare const TabPanel: import("svelte").Component<Props, {}, "">;
type TabPanel = ReturnType<typeof TabPanel>;
export default TabPanel;
