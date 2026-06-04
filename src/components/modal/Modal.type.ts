import type { ReactNode } from 'react';

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
};
