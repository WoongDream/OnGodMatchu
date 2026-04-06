import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const FeedbackWrapper = styled.div<{ $correct: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ $correct, theme }) =>
    $correct ? `${theme.colors.status.success}18` : `${theme.colors.status.error}18`};
  border: 1px solid
    ${({ $correct, theme }) => ($correct ? theme.colors.status.success : theme.colors.status.error)};
`;

export const FeedbackResult = styled.span<{ $correct: boolean }>`
  ${text({ size: 'md', weight: 'bold' })}
  color: ${({ $correct, theme }) =>
    $correct ? theme.colors.status.success : theme.colors.status.error};
`;

export const FeedbackAnswer = styled.span`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;
