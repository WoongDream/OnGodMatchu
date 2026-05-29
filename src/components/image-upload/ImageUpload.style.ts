import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const areaStyle =
  (hasPreview: boolean, invalid = false) =>
  (theme: Theme) => css`
    position: relative;
    width: 100%;
    aspect-ratio: ${hasPreview ? '16 / 9' : 'auto'};
    min-height: ${hasPreview ? 'auto' : '7rem'};
    border: 2px dashed ${invalid ? theme.colors.status.error : theme.colors.border.primary};
    border-radius: ${theme.borderRadius.lg};
    background-color: ${theme.colors.bg.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.15s;

    &:hover {
      border-color: ${invalid ? theme.colors.status.error : theme.colors.accent.primary};
    }
  `;

export const placeholderStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
`;

export const placeholderTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const previewImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const removeButtonStyle = (theme: Theme) => css`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${theme.borderRadius.full};
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  ${text({ size: 'sm', weight: 'bold' })({ theme })}
  z-index: 1;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

export const hiddenInputStyle = css`
  display: none;
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.status.error};
`;
