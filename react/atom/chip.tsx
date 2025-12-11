import React, { memo } from 'react';

export interface ChipProps {
  children: React.ReactNode;
  theme?: 'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'red';
  type?: 'default' | 'fill' | 'border';
  size?: 'sm' | 'md';
  round?: boolean;
  icon?: string;
  onDelete?: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = memo(({
  children,
  theme = 'default',
  type = 'default',
  size = 'md',
  round = false,
  icon,
  onDelete,
  className = '',
}) => {
  const chipClasses = [
    'chip',
    theme !== 'default' && theme,
    type !== 'default' && type,
    size !== 'md' && size,
    round && 'round',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={chipClasses}>
      {icon && <i className={`icon ${icon}`} />}
      {children}
      {onDelete && <button aria-label="삭제" onClick={onDelete} />}
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip;
