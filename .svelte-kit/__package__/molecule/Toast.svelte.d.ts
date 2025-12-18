type ToastTheme = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
interface Props {
    /** Toast ID */
    id: string;
    /** Toast header */
    header?: string;
    /** Toast message */
    message: string;
    /** Toast theme */
    theme?: ToastTheme;
    /** Show border */
    border?: boolean;
    /** Long style (no header) */
    long?: boolean;
    /** Auto close duration in ms (0 = no auto close) */
    duration?: number;
    /** Toast width */
    width?: string | number;
    /** Close callback */
    onclose: (id: string) => void;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Toast: import("svelte").Component<$$ComponentProps, {}, "">;
type Toast = ReturnType<typeof Toast>;
export default Toast;
