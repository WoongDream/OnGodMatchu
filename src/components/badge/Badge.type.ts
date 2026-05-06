import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'info' | 'warning';

export type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};
