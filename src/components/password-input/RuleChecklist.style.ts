import styled from '@emotion/styled';
import { text } from '@/styles/text';

export type RuleState = 'pending' | 'pass' | 'fail';

export const ChecklistWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const RuleItem = styled.li<{ $state: RuleState }>`
  ${text({ size: 'xs' })}
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ $state, theme }) => {
    if ($state === 'pass') {
      return theme.colors.status.success;
    }
    if ($state === 'fail') {
      return theme.colors.status.error;
    }
    return theme.colors.fg.tertiary;
  }};
`;

export const RuleIcon = styled.span<{ $state: RuleState }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ $state, theme }) => {
    if ($state === 'pass') {
      return theme.colors.status.success;
    }
    if ($state === 'fail') {
      return theme.colors.status.error;
    }
    return theme.colors.fg.tertiary;
  }};
`;
