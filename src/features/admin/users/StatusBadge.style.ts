import { css, type Theme } from '@emotion/react';
import type { UserStatus } from '@/types';

const COLOR: Record<UserStatus, string> = {
  ACTIVE: '#22c55e',
  SUSPENDED: '#ef4444',
  WITHDRAWN: '#a1a1aa',
};

export const wrapperStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const dotStyle = (theme: Theme, status: UserStatus) => css`
  width: 6px;
  height: 6px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${COLOR[status]};
`;

export const labelStyle = (theme: Theme, status: UserStatus) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${status === 'ACTIVE' ? theme.colors.fg.secondary : COLOR[status]};
`;
