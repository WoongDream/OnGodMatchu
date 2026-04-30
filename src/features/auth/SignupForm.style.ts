import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
`;

export const FormTitle = styled.h1`
  ${text({ size: 'xl', weight: 'bold' })}
  color: ${({ theme }) => theme.colors.fg.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const LinkRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LinkText = styled.span`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const ErrorText = styled.p`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.status.error};
`;

export const InfoText = styled.p`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const InlineLoginLink = styled.button`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;

export const NicknameStatusText = styled.p<{ $tone: 'positive' | 'negative' | 'neutral' }>`
  ${text({ size: 'sm' })}
  color: ${({ theme, $tone }) => {
    if ($tone === 'positive') {
      return theme.colors.status.success;
    }
    if ($tone === 'negative') {
      return theme.colors.status.error;
    }
    return theme.colors.fg.secondary;
  }};
  margin-top: -${({ theme }) => theme.spacing.xs};
`;

export const TimerText = styled.span<{ $expired?: boolean }>`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme, $expired }) =>
    $expired ? theme.colors.status.error : theme.colors.fg.secondary};
  font-variant-numeric: tabular-nums;
`;

export const VerifyButtonRow = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const LinkButton = styled.button`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;
