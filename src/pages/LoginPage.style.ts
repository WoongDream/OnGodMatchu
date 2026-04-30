import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const ErrorBanner = styled.div`
  ${text({ size: 'sm', weight: 'medium' })}
  width: 100%;
  max-width: 28rem;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.status.error};
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  text-align: center;
`;
