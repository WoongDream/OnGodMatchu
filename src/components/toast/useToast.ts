import { useCallback } from 'react';
import useToastStore from './toastStore';
import type { ToastVariant } from './Toast.type';

type ShowOptions = {
  variant?: ToastVariant;
  durationMs?: number;
};

type UseToastReturn = {
  show: (message: string, options?: ShowOptions) => void;
  success: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
};

const useToast = (): UseToastReturn => {
  const storeShow = useToastStore((s) => s.show);

  const show = useCallback(
    (message: string, options?: ShowOptions) => {
      storeShow(message, options);
    },
    [storeShow],
  );
  const success = useCallback(
    (message: string, durationMs?: number) => {
      storeShow(message, { variant: 'success', durationMs });
    },
    [storeShow],
  );
  const info = useCallback(
    (message: string, durationMs?: number) => {
      storeShow(message, { variant: 'info', durationMs });
    },
    [storeShow],
  );
  const error = useCallback(
    (message: string, durationMs?: number) => {
      storeShow(message, { variant: 'error', durationMs });
    },
    [storeShow],
  );

  return { show, success, info, error };
};

export default useToast;
