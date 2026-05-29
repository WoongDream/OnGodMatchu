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
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.sm};
  gap: ${theme.spacing.sm};

  /* mobile: 카드 1행 가로 스크롤 */
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: hidden;
  & > * {
    flex: 0 0 8.5rem;
  }

  /* 아주 작은 primary 톤 스크롤바 (가로/세로 공용) */
  scrollbar-width: thin;
  scrollbar-color: ${theme.colors.accent.primary} transparent;
  &::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${theme.colors.accent.primary};
    border-radius: 9999px;
  }

  /* tablet+: 2열 grid + 카드 5.5 row 고정 높이 (11번째 카드부터 세로 스크롤) */
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: max-content;
    align-content: start;
    overflow-x: hidden;
    overflow-y: auto;
    /* card cell width = (22rem - 2*padding - gap) / 2
       card height = cell width * 9/16 (aspect 16:9)
       container height = 5.5 cards + 5 gaps + 2 paddings */
    height: calc(((22rem - ${theme.spacing.sm} * 3) / 2 * 0.5625) * 5.5 + ${theme.spacing.sm} * 7);
    & > * {
      flex: initial;
    }
  }
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
