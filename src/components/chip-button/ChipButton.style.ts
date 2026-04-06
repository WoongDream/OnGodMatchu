import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const StyledChip = styled.button<{ $active: boolean }>`
  ${text({ size: 'sm', weight: 'medium' })}
  flex-shrink: 0;
  height: 2rem;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.accent.primary : theme.colors.border.primary)};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.bg.primary};
  color: ${({ $active, theme }) => ($active ? theme.colors.accent.fg : theme.colors.fg.secondary)};
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ $active, theme }) =>
      $active ? theme.colors.accent.fg : theme.colors.accent.primary};
  }
`;
