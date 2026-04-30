import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { text } from '@/styles/text';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  min-height: 50vh;
`;

export const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid ${({ theme }) => theme.colors.border.primary};
  border-top-color: ${({ theme }) => theme.colors.accent.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const Message = styled.p`
  ${text({ size: 'md' })}
  color: ${({ theme }) => theme.colors.fg.secondary};
  text-align: center;
`;

export const ErrorMessage = styled.p`
  ${text({ size: 'md', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.status.error};
  text-align: center;
`;
