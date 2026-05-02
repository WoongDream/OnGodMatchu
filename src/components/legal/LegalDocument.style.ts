import { css, type Theme } from '@emotion/react';

export const articleStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: ${theme.spacing.lg} 0 ${theme.spacing['2xl']};
  color: ${theme.colors.fg.primary};
  word-break: keep-all;
  overflow-wrap: break-word;

  h1 {
    font-size: ${theme.fontSize.xl};
    font-weight: ${theme.fontWeight.bold};
    line-height: 1.4;
    margin: 0 0 ${theme.spacing.lg};
  }

  h2 {
    font-size: ${theme.fontSize.lg};
    font-weight: ${theme.fontWeight.semibold};
    line-height: 1.4;
    margin: ${theme.spacing.xl} 0 ${theme.spacing.sm};
  }

  h3 {
    font-size: ${theme.fontSize.md};
    font-weight: ${theme.fontWeight.semibold};
    line-height: 1.5;
    margin: ${theme.spacing.lg} 0 ${theme.spacing.sm};
  }

  p {
    font-size: ${theme.fontSize.md};
    line-height: 1.7;
    color: ${theme.colors.fg.secondary};
    margin: 0 0 ${theme.spacing.md};
  }

  strong {
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.fg.primary};
  }

  ul,
  ol {
    margin: 0 0 ${theme.spacing.md};
    padding-left: ${theme.spacing.lg};
  }

  li {
    font-size: ${theme.fontSize.md};
    line-height: 1.7;
    color: ${theme.colors.fg.secondary};
    margin: 0 0 ${theme.spacing.xs};
  }

  li > p {
    margin: 0;
  }

  blockquote {
    margin: ${theme.spacing.md} 0;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-left: 3px solid ${theme.colors.border.primary};
    color: ${theme.colors.fg.secondary};
    background-color: ${theme.colors.bg.secondary};
  }

  code {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: ${theme.fontSize.sm};
    padding: 0 ${theme.spacing.xs};
    background-color: ${theme.colors.bg.tertiary};
    border-radius: ${theme.borderRadius.sm};
  }

  hr {
    border: 0;
    height: 1px;
    background-color: ${theme.colors.border.secondary};
    margin: ${theme.spacing.xl} 0;
  }

  a {
    color: ${theme.colors.accent.primary};
    text-decoration: underline;

    &:hover {
      color: ${theme.colors.accent.hover};
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 ${theme.spacing.md};
  }

  th,
  td {
    border: 1px solid ${theme.colors.border.primary};
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.fontSize.sm};
    line-height: 1.6;
    text-align: left;
  }

  th {
    background-color: ${theme.colors.bg.secondary};
    font-weight: ${theme.fontWeight.semibold};
  }
`;
