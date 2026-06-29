import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

/** 푸터 버튼이 없는(비공개) 모달에서 본문이 바닥에 붙지 않도록 하단 여백 보정. */
export const bodyPadStyle = (theme: Theme) => css`
  padding-bottom: ${theme.spacing.lg};
`;

export const stateStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  text-align: center;
  color: ${theme.colors.fg.secondary};
  padding: ${theme.spacing.xl} 0;
  margin: 0;
`;

export const goButtonStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.primary};
  color: #ffffff;
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.92;
  }
`;
