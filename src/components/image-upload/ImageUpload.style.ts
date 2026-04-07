import styled from '@emotion/styled';
import { text } from '@/styles/text';

export const UploadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

export const UploadLabel = styled.label`
  ${text({ size: 'sm', weight: 'medium' })}
  color: ${({ theme }) => theme.colors.fg.primary};
`;

export const UploadArea = styled.label<{ $hasPreview: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $hasPreview }) => ($hasPreview ? '16 / 9' : 'auto')};
  min-height: ${({ $hasPreview }) => ($hasPreview ? 'auto' : '7rem')};
  border: 2px dashed ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

export const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const UploadPlaceholderText = styled.span`
  ${text({ size: 'sm' })}
  color: ${({ theme }) => theme.colors.fg.tertiary};
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 1.75rem;
  height: 1.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: rgba(0, 0, 0, 0.5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  ${text({ size: 'sm', weight: 'bold' })}
  z-index: 1;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;
