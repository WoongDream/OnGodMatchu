import { css, type Theme } from '@emotion/react';
import type { NotificationType } from '@/types';

export const loadingStyle = (theme: Theme) => css`
  padding: ${theme.spacing['2xl']} 0;
  text-align: center;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const subtitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const gridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 18rem;
  gap: ${theme.spacing.md};
  align-items: start;

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const inquiryTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const authorRowStyle = (theme: Theme, clickable: boolean) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
  background: none;
  width: 100%;
  text-align: left;
  cursor: ${clickable ? 'pointer' : 'default'};

  &:disabled {
    cursor: default;
  }
`;

export const authorInfoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const authorNameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const authorDateStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const contentBoxStyle = (theme: Theme) => css`
  margin: 0;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.fg.primary};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const answersSectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.secondary};
`;

export const answersTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const answerItemStyle = (theme: Theme, type: NotificationType) => {
  const bg = type === 'WARNING' ? '#fefce8' : theme.colors.accent.subtle;
  return css`
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    background-color: ${bg};
  `;
};

export const answerHeadStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin: 0 0 ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.tertiary};
`;

export const answerTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const answerContentStyle = (theme: Theme) => css`
  margin: ${theme.spacing.xs} 0 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const panelTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const statusColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const statusButtonStyle = (theme: Theme, active: boolean) => css`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${active ? theme.colors.accent.primary : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${active ? theme.colors.accent.subtle : theme.colors.bg.primary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${active ? theme.colors.accent.active : theme.colors.fg.secondary};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const saveBarStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const saveHintStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

export const saveActionsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;
