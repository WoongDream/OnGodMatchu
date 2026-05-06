import { css, type Theme } from '@emotion/react';
import type { ProfileImageSize } from './ProfileImage.type';

const SIZE_PX: Record<ProfileImageSize, string> = {
  sm: '2rem',
  md: '3rem',
  lg: '5rem',
  xl: '8rem',
};

const INITIAL_FONT_SIZE: Record<ProfileImageSize, string> = {
  sm: '0.875rem',
  md: '1.25rem',
  lg: '2rem',
  xl: '3rem',
};

const baseStyle = (size: ProfileImageSize) => css`
  width: ${SIZE_PX[size]};
  height: ${SIZE_PX[size]};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

export const imageStyle = (size: ProfileImageSize) => css`
  ${baseStyle(size)};
  object-fit: cover;
`;

export const fallbackStyle =
  (size: ProfileImageSize, backgroundColor: string) => (theme: Theme) => css`
    ${baseStyle(size)};
    background-color: ${backgroundColor};
    color: ${theme.colors.fg.inverse};
    font-weight: ${theme.fontWeight.semibold};
    font-size: ${INITIAL_FONT_SIZE[size]};
    user-select: none;
  `;
