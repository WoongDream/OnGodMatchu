import { css, type Theme } from '@emotion/react';

export type BadgeRole = 'OWNER' | 'ADMIN';

const PALETTE: Record<BadgeRole, { bg: string; fg: string }> = {
  OWNER: { bg: '#ede9fe', fg: '#7c3aed' },
  ADMIN: { bg: '#e0f2fe', fg: '#0284c7' },
};

export const LABEL: Record<BadgeRole, string> = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
};

export const badgeStyle = (theme: Theme, role: BadgeRole) => css`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  width: fit-content;
  padding: 2px ${theme.spacing.sm};
  border-radius: 9999px;
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.bold};
  letter-spacing: 0.04em;
  background-color: ${PALETTE[role].bg};
  color: ${PALETTE[role].fg};

  svg {
    display: block;
    flex-shrink: 0;
  }
`;
