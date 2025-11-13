'use client';

import { useEffect, useState } from 'react';
import styles from './toast.module.scss';

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
      <button onClick={handleClose} aria-label="닫기" />
    </div>
  );
};

export default Toast;
