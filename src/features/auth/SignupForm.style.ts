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

export const LinkButton = styled.button`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;
