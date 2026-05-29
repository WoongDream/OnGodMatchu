import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const breadcrumbStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;

  span[aria-current='page'] {
    color: ${theme.colors.fg.secondary};
  }
`;

/* === Top grid: thumbnail + meta panel === */

export const topGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 3fr 2fr;
    align-items: stretch;
  }
`;

export const thumbnailStyle = (theme: Theme) => css`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.borderRadius.lg};
  background: repeating-linear-gradient(
    45deg,
    ${theme.colors.bg.secondary} 0 12px,
    ${theme.colors.bg.tertiary} 12px 24px
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.fg.tertiary};
  font-size: ${theme.fontSize.sm};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const metaPanelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  height: 100%;
`;

export const metaHeaderRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const metaActionsRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  /* 만든이와 거의 붙도록 metaPanel gap 상쇄 */
  margin-bottom: calc(-1 * ${theme.spacing.md} + ${theme.spacing.xs});
`;

export const metaCategoryStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.accent.primary};
`;

export const metaPlayCountStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  margin-right: auto;
  line-height: 1;

  svg {
    display: block;
    flex-shrink: 0;
  }

  span {
    line-height: 1;
  }
`;

export const metaActionsStyle = (theme: Theme) => css`
  margin-left: auto;
  display: flex;
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`;

export const titleBlockStyle = (theme: Theme) => css`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  /* 카테고리와 가까이 — metaPanel gap(md) 일부 상쇄 */
  margin-top: calc(-1 * ${theme.spacing.sm});
`;

export const titleStyle = (theme: Theme) => css`
  font-size: 1.5rem;
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
  margin: 0;
  line-height: 1.3;
`;

export const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  line-height: 1.6;
  margin: 0;
`;

/* === Author block === */

export const authorBlockStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.xs};
  padding-bottom: 0;
  border-top: 1px solid ${theme.colors.border.secondary};
`;

export const authorLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const authorDividerStyle = (theme: Theme) => css`
  width: 1px;
  height: 1.25rem;
  background-color: ${theme.colors.border.primary};
`;

export const authorProfileButtonStyle = (theme: Theme) => css`
  appearance: none;
  background: transparent;
  border: none;
  padding: 2px ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.fg.primary};
  line-height: 1;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const authorNameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const authorDateStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

/* === Comments section === */

export const commentsSectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: calc(${theme.spacing['2xl']} * 3);
`;

export const commentsHeaderStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};

  span {
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.fg.tertiary};
    font-weight: ${theme.fontWeight.regular};
  }
`;
