import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

/** 정지 시 비활성화되는 조작 영역 (필터/목록/더보기) 묶음. */
export const interactiveAreaStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const headerRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  margin: 0;
  color: ${theme.colors.fg.primary};

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const newButtonWrapperStyle = (theme: Theme) => css`
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;

    & > button {
      width: 100%;
    }
  }
`;

export const filterRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const chipsStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

export const moreRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: center;
  padding-top: ${theme.spacing.sm};
`;

export const errorStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.status.error};
  text-align: center;
  padding: ${theme.spacing.md};
`;

export const loadingStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-align: center;
  padding: ${theme.spacing.md};
`;

export const emptyActionRowStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border: 1px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
`;

export const emptyTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;
