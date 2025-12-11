import React, { memo, useCallback } from 'react';
import styles from './avatar.module.scss';

export interface AvatarProps {
  /**
   * Avatar type
   * - image: Display user uploaded image
   * - icon: Display system provided icon with background
   * - text: Display user name or initials with background
   */
  type?: 'image' | 'icon' | 'text';

  /**
   * Image source URL (for type='image')
   */
  src?: string;

  /**
   * Icon class name (for type='icon')
   * @default 'icon-user'
   */
  icon?: string;

  /**
   * Text content (for type='text')
   * Will display first 2 characters if longer
   * @example 'AB' or '보라'
   */
  text?: string;

  /**
   * Avatar size in pixels
   * @default 56
   */
  size?: 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56;

  /**
   * Show activity ring (indicates user is active)
   * @default false
   */
  activityRing?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Alt text for image
   */
  alt?: string;

  /**
   * Click handler
   */
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = memo(({
  type = 'icon',
  src,
  icon = 'icon-user',
  text,
  size = 56,
  activityRing = false,
  className = '',
  alt = 'Avatar',
  onClick,
}) => {
  const wrapperClasses = [
    styles.wrapper,
    activityRing && styles.activityRing,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const avatarClasses = [
    styles.avatar,
    styles[`size-${size}`],
    styles[`type-${type}`],
  ]
    .filter(Boolean)
    .join(' ');

  // Calculate wrapper size for activity ring
  const wrapperSize = activityRing ? size + 10 : size;

  // Format text to show only first 2 characters
  const displayText = text ? text.slice(0, 2) : '';

  // Calculate font size based on avatar size and type
  const getFontSize = useCallback((contentType: 'icon' | 'text') => {
    if (contentType === 'icon') {
      // 아이콘: size={56}일 때 44px 기준 (약 78.5%)
      const iconRatio = 0.785;
      return Math.round(size * iconRatio);
    } else {
      // 텍스트: size={56}일 때 display6(24px) 기준 (약 43%)
      const textRatio = 0.43;
      return Math.round(size * textRatio);
    }
  }, [size]);

  const renderContent = () => {
    if (type === 'image' && src) {
      return <img src={src} alt={alt} className={styles.image} />;
    }

    if (type === 'icon') {
      return <i className={icon} style={{ fontSize: getFontSize('icon') }} />;
    }

    if (type === 'text' && displayText) {
      return <span style={{ fontSize: getFontSize('text') }}>{displayText}</span>;
    }

    // Fallback to icon
    return <i className={icon} style={{ fontSize: getFontSize('icon') }} />;
  };

  return (
    <div
      className={wrapperClasses}
      style={{ width: wrapperSize, height: wrapperSize }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={avatarClasses}
        style={{
          width: size,
          height: size,
          fontSize: type === 'text' ? getFontSize('text') : getFontSize('icon')
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;