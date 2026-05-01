import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';
import type { OAuthProvider } from '@/types';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const consentNoticeStyle = (theme: Theme) => css`
  ${text({ size: 'xs', lineHeight: 1.5 })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  margin: ${theme.spacing.xs} 0 0;
`;

export const consentLinkStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.secondary};
  text-decoration: underline;

  &:hover {
    color: ${theme.colors.accent.primary};
  }
`;

export const dividerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.sm} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${theme.colors.border.primary};
  }
`;

export const dividerTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  white-space: nowrap;
`;

const providerColors: Record<OAuthProvider, { background: string; color: string; border: string }> =
  {
    google: { background: '#ffffff', color: '#374151', border: '' },
    naver: { background: '#03C75A', color: '#ffffff', border: '#03C75A' },
    kakao: { background: '#FEE500', color: '#191919', border: '#FEE500' },
  };

export const socialButtonStyle = (provider: OAuthProvider) => (theme: Theme) => {
  const palette = providerColors[provider];
  return css`
    ${text({ size: 'md', weight: 'medium' })({ theme })}
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    width: 100%;
    height: 2.75rem;
    border-radius: ${theme.borderRadius.md};
    border: 1px solid ${palette.border || theme.colors.border.primary};
    background-color: ${palette.background};
    color: ${palette.color};
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.85;
    }
  `;
};
