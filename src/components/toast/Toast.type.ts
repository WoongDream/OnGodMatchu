export type ToastVariant = 'success' | 'info' | 'error';

export type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};
