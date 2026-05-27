import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'info' | 'warning' | 'neutral' | 'danger';

export type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
};
