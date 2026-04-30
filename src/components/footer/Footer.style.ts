import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { text } from '@/styles/text';

export const FooterWrapper = styled.footer`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

export const FooterInner = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.xl}`};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

export const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const BrandName = styled.span`
  ${text({ size: 'sm', weight: 'semibold' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const CopyText = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
`;

export const MetaColumn = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const FooterLink = styled(Link)`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.fg.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: underline;
  }
`;

export const PrivacyLink = styled(Link)`
  ${text({ size: 'xs', weight: 'bold' })}
  color: ${({ theme }) => theme.colors.fg.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: underline;
  }
`;

export const ContactLink = styled.a`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.fg.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.accent.primary};
    text-decoration: underline;
  }
`;
