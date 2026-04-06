import styled from '@emotion/styled';
import { HEADER_HEIGHT } from '@/styles/constants';
import { text } from '@/styles/text';

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_HEIGHT};
  background-color: ${({ theme }) => theme.colors.bg.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  z-index: 100;
`;

export const HeaderInner = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.desktop};
  height: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing.xl};
  }
`;

export const Logo = styled.span`
  ${text({ size: 'lg', weight: 'bold' })}
  color: ${({ theme }) => theme.colors.accent.primary};
  cursor: pointer;
`;

export const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
