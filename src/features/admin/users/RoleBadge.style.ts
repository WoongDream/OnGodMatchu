import { css, type Theme } from '@emotion/react';
import type { Role } from '@/types';

const PALETTE: Record<Role, { bg: string; fg: string }> = {
  OWNER: { bg: '#ede9fe', fg: '#7c3aed' },
  ADMIN: { bg: '#e0f2fe', fg: '#0284c7' },
  USER: { bg: '#f4f4f5', fg: '#71717a' },
};

export const roleBadgeStyle = (theme: Theme, role: Role) => css`
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: fit-content;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.bold};
  letter-spacing: 0.02em;
  background-color: ${PALETTE[role].bg};
  color: ${PALETTE[role].fg};
`;
