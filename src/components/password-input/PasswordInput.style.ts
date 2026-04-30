import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

export const Label = styled.label`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const InputBox = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input<{ $hasError: boolean }>`
  ${text({ size: 'md' })}
  width: 100%;
  height: 2.75rem;
  padding: 0 2.75rem 0 0.875rem;
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

export const ToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.fg.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.fg.primary};
    background-color: ${({ theme }) => theme.colors.bg.secondary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent.primary};
    outline-offset: 1px;
  }
`;

export const ErrorMessage = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.status.error};
`;

export const HintBox = styled.div`
  ${text({ size: 'xs' })}
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const HintTitle = styled.strong`
  ${text({ size: 'xs', weight: 'semibold' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const HintList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin: 0;
  padding-left: 1rem;
`;
