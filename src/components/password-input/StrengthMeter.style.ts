import styled from '@emotion/styled';
import type { Theme } from '@/styles/theme';
import { text } from '@/styles/text';
import type { PasswordStrengthScore } from './PasswordInput.type';

const STRENGTH_COLOR_KEYS: readonly (keyof Theme['colors']['strength'])[] = [
  'veryWeak',
  'weak',
  'fair',
  'good',
  'strong',
];

export const MeterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

export const BarRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const BarSegment = styled.span<{ $filled: boolean; $score: PasswordStrengthScore }>`
  height: 0.375rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ $filled, $score, theme }) =>
    $filled ? theme.colors.strength[STRENGTH_COLOR_KEYS[$score]] : theme.colors.border.primary};
  transition: background-color 0.15s;
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StrengthLabel = styled.span<{ $score: PasswordStrengthScore }>`
  ${text({ size: 'xs', weight: 'medium' })}
  color: ${({ $score, theme }) => theme.colors.strength[STRENGTH_COLOR_KEYS[$score]]};
`;

export const CrackTimeText = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
`;

export const FeedbackText = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.status.warning};
`;
