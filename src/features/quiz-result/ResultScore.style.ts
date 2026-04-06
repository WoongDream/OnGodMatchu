import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const ScoreWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
`;

export const ScoreLabel = styled.p`
  ${text({ size: 'md', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const ScoreNumber = styled.p`
  ${text({ size: 'xl', weight: 'bold' })}
  color: ${({ theme }) => theme.colors.accent.primary};
  font-size: 4rem;
`;

export const ScoreTotal = styled.p`
  ${text({ size: 'lg', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const ScoreMessage = styled.p`
  ${text({ size: 'md' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;
