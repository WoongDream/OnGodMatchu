import { memo } from 'react';
import type { BadgeProps } from './Badge.type';
import { badgeStyle } from './Badge.style';

const Badge = memo(({ variant = 'info', children }: BadgeProps) => {
  return <span css={badgeStyle(variant)}>{children}</span>;
});

Badge.displayName = 'Badge';
export default Badge;
