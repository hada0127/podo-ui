import { type Writable } from 'svelte/store';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ToastTheme = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
export interface ToastData {
    id: string;
    position: ToastPosition;
    header?: string;
    message: string;
    theme?: ToastTheme;
    border?: boolean;
    long?: boolean;
    duration?: number;
    width?: string | number;
}
export interface ToastOptions {
    header?: string;
    message: string;
    theme?: ToastTheme;
    border?: boolean;
    long?: boolean;
    duration?: number;
    width?: string | number;
    position?: ToastPosition;
}
export interface ToastContext {
    toasts: Writable<ToastData[]>;
    showToast: (options: ToastOptions) => string;
    hideToast: (id: string) => void;
}
/**
 * Create toast context for ToastProvider
 * @returns Toast context with toasts store and methods
 */
export declare function createToastContext(): ToastContext;
/**
 * Get toast context from parent ToastProvider
 * @returns Toast context
 * @throws Error if used outside ToastProvider
 */
export declare function useToast(): ToastContext;
declare const _default: {
    createToastContext: typeof createToastContext;
    useToast: typeof useToast;
};
export default _default;
