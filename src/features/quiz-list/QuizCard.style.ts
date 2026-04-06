import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const CardWrapper = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.bg.primary};
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const Thumbnail = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.bg.tertiary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CardTitle = styled.h3`
  ${text({ size: 'md', weight: 'semibold', ellipsis: 2 })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const CardDescription = styled.p`
  ${text({ size: 'sm', ellipsis: 1 })}
  color: ${({ theme }) => theme.colors.fg.secondary};
`;

export const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const Category = styled.span`
  ${text({ size: 'xs', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.accent.primary};
`;

export const PlayCount = styled.span`
  ${text({ size: 'xs' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
`;
