'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps, ToastPosition, ToastTheme } from './toast';
import styles from './toast-container.module.scss';

interface ToastData extends Omit<ToastProps, 'id' | 'onClose'> {
  id: string;
  position: ToastPosition;
}

interface ToastOptions {
  header?: string;
  message: string;
  theme?: ToastTheme;
  border?: boolean;
  long?: boolean;
  duration?: number;
  width?: string | number;
  position?: ToastPosition;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const position = options.position || 'top-right';

    setToasts((prev) => [
      ...prev,
      {
        id,
        position,
        header: options.header,
        message: options.message,
        theme: options.theme,
        border: options.border,
        long: options.long,
        duration: options.duration,
        width: options.width,
      },
    ]);

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastsByPosition = useCallback((position: ToastPosition) => {
    return toasts.filter((toast) => toast.position === position);
  }, [toasts]);

  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'center-left',
    'center',
    'center-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {isMounted &&
        createPortal(
          <div className={styles.toastPortal}>
            {positions.map((position) => {
              const positionToasts = getToastsByPosition(position);
              if (positionToasts.length === 0) return null;

              return (
                <div key={position} className={`${styles.toastContainer} ${styles[position]}`}>
                  {positionToasts.map((toast) => (
                    <Toast
                      key={toast.id}
                      id={toast.id}
                      header={toast.header}
                      message={toast.message}
                      theme={toast.theme}
                      border={toast.border}
                      long={toast.long}
                      duration={toast.duration}
                      width={toast.width}
                      onClose={hideToast}
                    />
                  ))}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
