import styled from '@emotion/styled';

export const FilterWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding: ${({ theme }) => theme.spacing.md} 0;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
