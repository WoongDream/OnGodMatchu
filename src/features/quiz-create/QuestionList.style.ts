import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const ListSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SectionTitle = styled.h2`
  ${text({ size: 'lg', weight: 'bold' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const QuestionListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;
