import styled from '@emotion/styled';

export const Article = styled.article`
  width: 100%;
  max-width: 48rem;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.lg} 0 ${theme.spacing['2xl']}`};
  color: ${({ theme }) => theme.colors.fg.primary};
  word-break: keep-all;
  overflow-wrap: break-word;

  h1 {
    font-size: ${({ theme }) => theme.fontSize.xl};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    line-height: 1.4;
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSize.lg};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    line-height: 1.4;
    margin: ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.sm};
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    line-height: 1.5;
    margin: ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.sm};
  }

  p {
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.fg.secondary};
    margin: 0 0 ${({ theme }) => theme.spacing.md};
  }

  strong {
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.fg.primary};
  }

  ul,
  ol {
    margin: 0 0 ${({ theme }) => theme.spacing.md};
    padding-left: ${({ theme }) => theme.spacing.lg};
  }

  li {
    font-size: ${({ theme }) => theme.fontSize.md};
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.fg.secondary};
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
  }

  li > p {
    margin: 0;
  }

  blockquote {
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border-left: 3px solid ${({ theme }) => theme.colors.border.primary};
    color: ${({ theme }) => theme.colors.fg.secondary};
    background-color: ${({ theme }) => theme.colors.bg.secondary};
  }

  code {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: ${({ theme }) => theme.fontSize.sm};
    padding: 0 ${({ theme }) => theme.spacing.xs};
    background-color: ${({ theme }) => theme.colors.bg.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  hr {
    border: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border.secondary};
    margin: ${({ theme }) => theme.spacing.xl} 0;
  }

  a {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.accent.hover};
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 ${({ theme }) => theme.spacing.md};
  }

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border.primary};
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    font-size: ${({ theme }) => theme.fontSize.sm};
    line-height: 1.6;
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.colors.bg.secondary};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  }
`;
