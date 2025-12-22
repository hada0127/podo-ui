export interface TabItem {
    /** Tab key */
    key: string;
    /** Tab label */
    label: string;
    /** Disabled state */
    disabled?: boolean;
}
interface Props {
    /** Tab items */
    items: TabItem[];
    /** Active tab key (controlled) */
    activeKey?: string;
    /** Default active tab key (uncontrolled) */
    defaultActiveKey?: string;
    /** Equal width tabs */
    fill?: boolean;
    /** Tab change callback */
    onchange?: (key: string) => void;
    /** Additional class name */
    class?: string;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Tab: import("svelte").Component<$$ComponentProps, {}, "">;
type Tab = ReturnType<typeof Tab>;
export default Tab;
