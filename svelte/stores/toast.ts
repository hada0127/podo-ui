import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastTheme =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

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

const TOAST_KEY = Symbol('toast');

/**
 * Create toast context for ToastProvider
 * @returns Toast context with toasts store and methods
 */
export function createToastContext(): ToastContext {
  const toasts = writable<ToastData[]>([]);

  const showToast = (options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const position = options.position || 'top-right';

    toasts.update((items) => [...items, { id, position, ...options }]);

    return id;
  };

  const hideToast = (id: string) => {
    toasts.update((items) => items.filter((t) => t.id !== id));
  };

  const context = { toasts, showToast, hideToast };
  setContext(TOAST_KEY, context);

  return context;
}

/**
 * Get toast context from parent ToastProvider
 * @returns Toast context
 * @throws Error if used outside ToastProvider
 */
export function useToast(): ToastContext {
  const context = getContext<ToastContext>(TOAST_KEY);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export default { createToastContext, useToast };
