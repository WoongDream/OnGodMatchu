import styled from '@emotion/styled';

export const ListWrapper = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const EmptyMessage = styled.p`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  color: ${({ theme }) => theme.colors.fg.tertiary};
`;
