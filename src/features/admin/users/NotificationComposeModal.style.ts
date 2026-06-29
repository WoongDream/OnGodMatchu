import { css, type Theme } from '@emotion/react';
import type { NotificationType } from '@/types';

export const changeSummaryStyle = (theme: Theme) => css`
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const changeSummaryTitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.tertiary};
`;

export const changeItemStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xs} 0;
`;

export const changeItemLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const changeItemValueStyle = (theme: Theme, emphasize?: boolean) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${emphasize ? theme.colors.status.error : theme.colors.fg.primary};
`;

export const recipientStyle = (theme: Theme) => css`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const fieldLabelStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

/** 제목 입력창과 내용 사이 간격을 키운 라벨. */
export const contentLabelStyle = (theme: Theme) => css`
  margin: ${theme.spacing.lg} 0 ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const typeToggleStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

export const typeOptionStyle = (theme: Theme, selected: boolean, value: NotificationType) => {
  const accent = value === 'WARNING' ? theme.colors.status.error : theme.colors.accent.primary;
  const selectedBg = value === 'WARNING' ? '#fef2f2' : theme.colors.accent.subtle;
  return css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${selected ? accent : theme.colors.border.primary};
    border-radius: ${theme.borderRadius.md};
    background-color: ${selected ? selectedBg : theme.colors.bg.primary};
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${selected ? accent : theme.colors.fg.secondary};
    cursor: pointer;
  `;
};

export const contentTextareaStyle = (theme: Theme) => css`
  width: 100%;
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-family: inherit;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.primary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const infoNoteStyle = (theme: Theme) => css`
  margin: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.subtle};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.accent.active};
  line-height: 1.5;
`;

export const footerStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`;
