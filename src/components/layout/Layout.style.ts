import styled from '@emotion/styled';
import { HEADER_HEIGHT } from '@/styles/constants';

export const AppShell = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.bg.primary};
`;

export const PageContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${HEADER_HEIGHT};
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.desktop};
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding-left: ${({ theme }) => theme.spacing.xl};
    padding-right: ${({ theme }) => theme.spacing.xl};
  }
`;
