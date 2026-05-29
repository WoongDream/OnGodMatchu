import type { ReactNode } from 'react';

export type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: ReactNode;
  labelTrailing?: ReactNode;
  type?: 'text' | 'email' | 'password';
};
