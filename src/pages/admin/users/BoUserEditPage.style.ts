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

export const rowBoxStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
`;

export const profileRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const mutedStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

export const fieldLabelStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const fieldValueStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.fg.primary};
`;

export const metaRowStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 ${theme.spacing.xs};
`;

export const statsRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
`;

export const statBlockStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const statLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const panelTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const hintStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const toggleRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.xs};
`;

export const toggleButtonStyle = (theme: Theme, active: boolean) => css`
  flex: 1;
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

export const toggleDangerStyle = (theme: Theme, active: boolean) => css`
  flex: 1;
  padding: ${theme.spacing.sm};
  border: 1px solid ${active ? theme.colors.status.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${active ? '#fef2f2' : theme.colors.bg.primary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${active ? theme.colors.status.error : theme.colors.fg.secondary};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const suspendBoxStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.md};
  background-color: #fef2f2;
`;

export const suspendLabelStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.status.error};
`;

export const dateInputStyle = (theme: Theme) => css`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-family: inherit;
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

export const saveActionsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;

export const historySectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const historyHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

export const historyTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const historyItemStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.secondary};
`;

export const historyActorStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const historyActorNameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const historyDateStyle = (theme: Theme) => css`
  margin-left: auto;
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const historyChangeStyle = (theme: Theme) => css`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const historyChangeLabelStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const historyChangeTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const historyChangeDetailStyle = (theme: Theme) => css`
  margin: ${theme.spacing.xs} 0 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  white-space: pre-wrap;
`;

export const historyNotiStyle = (theme: Theme, type?: NotificationType) => {
  const bg =
    type === 'WARNING'
      ? '#fefce8'
      : type === 'INFO'
        ? theme.colors.accent.subtle
        : theme.colors.bg.secondary;
  return css`
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    background-color: ${bg};
  `;
};

export const historyNotiHeadStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.tertiary};
`;

export const historyNotiTitleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const historyNotiContentStyle = (theme: Theme) => css`
  margin: ${theme.spacing.xs} 0 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  white-space: pre-wrap;
`;
