import React, { useState } from 'react';
import styles from './tooltip.module.scss';

export type TooltipVariant = 'default' | 'info';

export type TooltipPosition =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'leftTop'
  | 'leftBottom'
  | 'right'
  | 'rightTop'
  | 'rightBottom';

export interface TooltipProps {
  /** Trigger element (button, icon, etc.) */
  children: React.ReactNode;
  /** Tooltip content (can include any JSX) */
  content: React.ReactNode;
  /** Tooltip visual variant */
  variant?: TooltipVariant;
  /** Arrow position */
  position?: TooltipPosition;
  /** Distance from trigger element in pixels */
  offset?: number;
  /** Additional CSS class */
  className?: string;
}

export default function Tooltip({
  children,
  content,
  variant = 'default',
  position = 'top',
  offset = 8,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const variantClass = variant === 'default' ? styles.variantDefault : styles.variantInfo;

  const tooltipClassNames = [
    styles.tooltipBox,
    variantClass,
    styles[position],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={tooltipClassNames}
          style={{ '--tooltip-offset': `${offset}px` } as React.CSSProperties}
        >
          {content}
        </div>
      )}
    </div>
  );
}
