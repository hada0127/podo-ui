import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  /** Control visibility externally (overrides hover state) */
  isVisible?: boolean;
  /** Additional CSS class */
  className?: string;
  /**
   * 툴팁을 document.body에 Portal로 렌더링
   * overflow: hidden 컨테이너 내부에서 툴팁이 잘리는 문제 해결
   * 기본값: false
   */
  portal?: boolean;
}

// Portal 위치 타입
interface PortalPosition {
  top: number;
  left: number;
  triggerWidth: number;
  triggerHeight: number;
}

export default function Tooltip({
  children,
  content,
  variant = 'default',
  position = 'top',
  offset = 8,
  isVisible: controlledIsVisible,
  className = '',
  portal = false,
}: TooltipProps) {
  const [hoverIsVisible, setHoverIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [portalPosition, setPortalPosition] = useState<PortalPosition | null>(null);

  const variantClass = variant === 'default' ? styles.variantDefault : styles.variantInfo;

  // Show tooltip if controlled visibility is true OR hover state is true
  const shouldShowTooltip = controlledIsVisible === true || hoverIsVisible;

  // Portal 위치 계산 함수
  const updatePortalPosition = useCallback(() => {
    if (!portal || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    setPortalPosition({
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      triggerWidth: rect.width,
      triggerHeight: rect.height,
    });
  }, [portal]);

  // Portal 열릴 때 위치 계산
  useEffect(() => {
    if (shouldShowTooltip && portal) {
      updatePortalPosition();
    }
  }, [shouldShowTooltip, portal, updatePortalPosition]);

  // Portal 모드에서 스크롤/리사이즈 시 위치 재계산
  useEffect(() => {
    if (!portal || !shouldShowTooltip) return;

    const handleScrollResize = () => {
      updatePortalPosition();
    };

    window.addEventListener('scroll', handleScrollResize, true);
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, true);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [portal, shouldShowTooltip, updatePortalPosition]);

  // Portal 위치 스타일 계산
  const getPortalStyle = useCallback((): React.CSSProperties => {
    if (!portalPosition) return {};

    const { top, left, triggerWidth, triggerHeight } = portalPosition;
    const style: React.CSSProperties = {
      '--tooltip-offset': `${offset}px`,
    } as React.CSSProperties;

    // position에 따른 위치 계산
    switch (position) {
      // Top positions
      case 'top':
        style.bottom = `calc(100vh - ${top}px + ${offset}px)`;
        style.left = left + triggerWidth / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'topLeft':
        style.bottom = `calc(100vh - ${top}px + ${offset}px)`;
        style.left = left;
        break;
      case 'topRight':
        style.bottom = `calc(100vh - ${top}px + ${offset}px)`;
        style.left = left + triggerWidth;
        style.transform = 'translateX(-100%)';
        break;

      // Bottom positions
      case 'bottom':
        style.top = top + triggerHeight + offset;
        style.left = left + triggerWidth / 2;
        style.transform = 'translateX(-50%)';
        break;
      case 'bottomLeft':
        style.top = top + triggerHeight + offset;
        style.left = left;
        break;
      case 'bottomRight':
        style.top = top + triggerHeight + offset;
        style.left = left + triggerWidth;
        style.transform = 'translateX(-100%)';
        break;

      // Left positions
      case 'left':
        style.top = top + triggerHeight / 2;
        style.right = `calc(100vw - ${left}px + ${offset}px)`;
        style.transform = 'translateY(-50%)';
        break;
      case 'leftTop':
        style.top = top;
        style.right = `calc(100vw - ${left}px + ${offset}px)`;
        break;
      case 'leftBottom':
        style.top = top + triggerHeight;
        style.right = `calc(100vw - ${left}px + ${offset}px)`;
        style.transform = 'translateY(-100%)';
        break;

      // Right positions
      case 'right':
        style.top = top + triggerHeight / 2;
        style.left = left + triggerWidth + offset;
        style.transform = 'translateY(-50%)';
        break;
      case 'rightTop':
        style.top = top;
        style.left = left + triggerWidth + offset;
        break;
      case 'rightBottom':
        style.top = top + triggerHeight;
        style.left = left + triggerWidth + offset;
        style.transform = 'translateY(-100%)';
        break;
    }

    return style;
  }, [portalPosition, position, offset]);

  const tooltipClassNames = [
    styles.tooltipBox,
    variantClass,
    styles[position],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const portalTooltipClassNames = [
    styles.portalTooltip,
    variantClass,
    styles[`portal${position.charAt(0).toUpperCase()}${position.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 툴팁 콘텐츠 렌더링
  const renderTooltipContent = () => {
    if (!shouldShowTooltip) return null;

    // Portal 모드
    if (portal && typeof document !== 'undefined' && portalPosition) {
      return createPortal(
        <div className={portalTooltipClassNames} style={getPortalStyle()}>
          {content}
        </div>,
        document.body
      );
    }

    // 일반 모드
    return (
      <div
        className={tooltipClassNames}
        style={{ '--tooltip-offset': `${offset}px` } as React.CSSProperties}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      ref={triggerRef}
      className={styles.tooltipWrapper}
      onMouseEnter={() => setHoverIsVisible(true)}
      onMouseLeave={() => setHoverIsVisible(false)}
    >
      {children}
      {renderTooltipContent()}
    </div>
  );
}
