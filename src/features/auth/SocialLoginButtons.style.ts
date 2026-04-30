import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { text } from '@/styles/text';
import type { OAuthProvider } from '@/types';

export const SocialWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ConsentNotice = styled.p`
  ${text({ size: 'xs', lineHeight: 1.5 })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
  text-align: center;
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
`;

export const ConsentLink = styled(Link)`
  color: ${({ theme }) => theme.colors.fg.secondary};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.sm} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border.primary};
  }
`;

export const DividerText = styled.span`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
  white-space: nowrap;
`;

export const SocialButton = styled.button<{ $provider: OAuthProvider }>`
  ${text({ size: 'md', weight: 'medium' })}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  height: 2.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: opacity 0.15s;

  ${({ $provider }) => {
    switch ($provider) {
      case 'google':
        return `background-color: #ffffff; color: #374151;`;
      case 'naver':
        return `background-color: #03C75A; color: #ffffff; border-color: #03C75A;`;
      case 'kakao':
        return `background-color: #FEE500; color: #191919; border-color: #FEE500;`;
    }
  }}

  &:hover {
    opacity: 0.85;
  }
`;
