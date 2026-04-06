import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;

export const QuestionImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.bg.tertiary};
`;

export const QuestionText = styled.p`
  ${text({ size: 'xl', weight: 'semibold', lineHeight: 1.6 })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;
