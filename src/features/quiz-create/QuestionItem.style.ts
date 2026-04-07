import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.bg.primary};
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ItemNumber = styled.span`
  ${text({ size: 'sm', weight: 'semibold' })}
  color: ${({ theme }) => theme.colors.accent.primary};
`;

export const ItemActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const IconButton = styled.button`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.fg.secondary};
    background-color: ${({ theme }) => theme.colors.bg.secondary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
