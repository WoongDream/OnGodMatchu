import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const subtitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0 0 ${theme.spacing.md};
`;

export const cropAreaStyle = (theme: Theme) => css`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.bg.secondary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  min-height: 12rem;

  /* react-image-crop 의 대상 이미지 — 모달 안에 맞도록 제한 */
  & img {
    display: block;
    max-width: 100%;
    max-height: 60vh;
  }
`;

export const fileLabelStyle = (theme: Theme) => css`
  display: block;
  margin-top: ${theme.spacing.sm};
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const dimensionBadgeStyle = (theme: Theme) => css`
  position: absolute;
  bottom: ${theme.spacing.sm};
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  padding: 0.125rem 0.625rem;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.accent.primary};
  color: #ffffff;
  ${text({ size: 'xs', weight: 'bold' })({ theme })}
  pointer-events: none;
`;

export const loadingStyle = (theme: Theme) => css`
  padding: ${theme.spacing.lg};
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const toolbarStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

export const toolButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.secondary};
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;

  &:hover {
    border-color: ${theme.colors.accent.primary};
    color: ${theme.colors.accent.primary};
  }

  & svg {
    width: 1rem;
    height: 1rem;
  }
`;

// 「이미지 교체」 — accent 톤 강조 (툴바 좌측).
export const replaceButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${theme.colors.accent.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.subtle};
  color: ${theme.colors.accent.primary};
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  cursor: pointer;

  & svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const footerActionsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

// 「이미지 삭제」 — 빨강 outline (footer 좌측).
export const deleteButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.md};
  background-color: transparent;
  color: ${theme.colors.status.error};
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  cursor: pointer;

  & svg {
    width: 1rem;
    height: 1rem;
  }
`;

export const footerRightStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-left: auto;
`;

export const confirmMessageStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;

export const hiddenInputStyle = css`
  display: none;
`;
