// VENDORED VERBATIM from main `react/atom/chip.tsx` (v1 component). Only the
// CSS-module import is swapped for an identity map so `styles.x` -> class `x`,
// matching the scoped v1 CSS in v1-components.generated.css under `.podo-v1-stage`.
// Do not hand-edit; re-vendor from main.
// @ts-nocheck
/* eslint-disable */
import React, { memo } from 'react';
import { useT } from '../i18n/context.js';

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
  const t = useT();
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
      {onDelete && <button aria-label={t('v1Chip.deleteAriaLabel')} onClick={onDelete} />}
    </div>
  );
});

Chip.displayName = 'Chip';

export default Chip;
