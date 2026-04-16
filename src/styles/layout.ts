import styled from '@emotion/styled';
import type { Theme } from '@/styles/theme';
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

export const PageWrapper = styled.div<{ gap?: keyof Theme['spacing'] }>`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  gap: ${({ gap, theme }) => (gap ? theme.spacing[gap] : 0)};
`;
