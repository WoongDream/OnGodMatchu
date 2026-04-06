import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

export const Label = styled.label`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const StyledInput = styled.input<{ $hasError: boolean }>`
  ${text({ size: 'md' })}
  width: 100%;
  height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.status.error : theme.colors.border.primary};
  background-color: ${({ theme }) => theme.colors.bg.primary};
  color: ${({ theme }) => theme.colors.fg.primary};
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ $hasError, theme }) =>
      $hasError ? theme.colors.status.error : theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.fg.tertiary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.status.error};
`;
