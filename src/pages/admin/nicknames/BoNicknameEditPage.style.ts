import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

export const headerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const headerTitleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const headerSubtitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;

export const layoutStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 22rem;
  gap: ${theme.spacing.lg};
  align-items: start;

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const fieldStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const labelRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const hintStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const textareaStyle = (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  width: 100%;
  min-height: 7rem;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  resize: vertical;
  line-height: 1.6;
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const panelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const panelTitleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

const segmentedBase = (theme: Theme) => css`
  display: grid;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const segmentTwoStyle = (theme: Theme) => css`
  ${segmentedBase(theme)}
  grid-template-columns: 1fr 1fr;
`;

export const segmentThreeStyle = (theme: Theme) => css`
  ${segmentedBase(theme)}
  grid-template-columns: repeat(3, 1fr);
`;

export const segmentButtonStyle = (theme: Theme, active: boolean) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  padding: ${theme.spacing.sm} 0;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  background-color: ${active ? theme.colors.bg.primary : 'transparent'};
  color: ${active ? theme.colors.fg.primary : theme.colors.fg.secondary};
  box-shadow: ${active ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none'};
  transition:
    background-color 0.15s,
    color 0.15s;
`;

export const matchDescStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  margin: 0;
`;

export const actionBarStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const actionBarTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;

export const actionsStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;
