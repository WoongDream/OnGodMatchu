import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const sectionStyle = (theme: Theme) => css`
  display: grid;
  gap: ${theme.spacing.lg};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 22rem 1fr;
  }
`;

export const leftPaneStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  min-width: 0;
`;

export const leftHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const leftTitleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const leftCaptionStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const cardsGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-content: start;
  gap: ${theme.spacing.sm};
  padding-right: ${theme.spacing.xs};
  max-height: 32rem;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const rightPaneStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: ${theme.spacing.md};
`;

export const emptyHintStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.lg};
  border: 1px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  text-align: center;
`;
