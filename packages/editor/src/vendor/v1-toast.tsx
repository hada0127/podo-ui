// VENDORED VERBATIM from main `react/molecule/toast.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useT } from '../i18n/context.js';
const styles: Record<string, string> = new Proxy({}, { get: (_t, key) => (typeof key === 'string' ? key : '') });

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

export type ToastTheme = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  id: string;
  header?: string;
  message: string;
  theme?: ToastTheme;
  border?: boolean;
  long?: boolean;
  duration?: number;
  width?: string | number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  header,
  message,
  theme = 'default',
  border = false,
  long = false,
  duration = 3000,
  width,
  onClose,
}) => {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // 0.2s fade out
  };

  const toastClasses = [
    'toast',
    theme,
    border ? 'border' : '',
    long ? 'long' : '',
    styles.toastAnimation,
    isVisible && !isClosing ? styles.fadeIn : '',
    isClosing ? styles.fadeOut : '',
  ]
    .filter(Boolean)
    .join(' ');

  const toastStyle: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
  };

  const getIcon = () => {
    switch (theme) {
      case 'success':
        return 'icon-check';
      case 'warning':
        return 'icon-warning';
      case 'danger':
        return 'icon-danger';
      case 'primary':
      case 'info':
      case 'default':
      default:
        return 'icon-info';
    }
  };

  return (
    <div className={toastClasses} style={toastStyle}>
      <i className={getIcon()}></i>
      <div className="toast-content">
        {header && !long && <div className="toast-header">{header}</div>}
        <div className="toast-body">{message}</div>
      </div>
      <button onClick={handleClose} aria-label={t('v1Toast.closeAriaLabel')} />
    </div>
  );
};

export default Toast;
