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

export type ToastVariant = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  id: string;
  header?: string;
  message: string;
  variant?: ToastVariant;
  type?: 'type01' | 'type02';
  long?: boolean;
  duration?: number;
  width?: string | number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  header,
  message,
  variant = 'default',
  type = 'type01',
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
    variant,
    type === 'type02' ? 'toast-border' : '',
    long ? 'toast-long' : '',
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
    switch (variant) {
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
      <div className="toast-icon">
        <i className={getIcon()}></i>
      </div>
      <div className="toast-content">
        {header && !long && <div className="toast-header">{header}</div>}
        <div className="toast-body">{message}</div>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <i className="icon-close"></i>
      </button>
    </div>
  );
};

export default Toast;
