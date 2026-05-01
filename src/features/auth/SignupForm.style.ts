import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const formStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin-bottom: ${theme.spacing.sm};
`;

export const linkRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

export const linkTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.status.error};
`;

export const infoTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const inlineLoginLinkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;

type NicknameTone = 'positive' | 'negative' | 'neutral';

export const nicknameStatusTextStyle = (tone: NicknameTone) => (theme: Theme) => {
  const color =
    tone === 'positive'
      ? theme.colors.status.success
      : tone === 'negative'
        ? theme.colors.status.error
        : theme.colors.fg.secondary;
  return css`
    ${text({ size: 'sm' })({ theme })}
    color: ${color};
    margin-top: -${theme.spacing.xs};
  `;
};

export const timerTextStyle = (expired?: boolean) => (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${expired ? theme.colors.status.error : theme.colors.fg.secondary};
  font-variant-numeric: tabular-nums;
`;

export const verifyButtonRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: ${theme.spacing.sm};
`;

export const linkButtonStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;
