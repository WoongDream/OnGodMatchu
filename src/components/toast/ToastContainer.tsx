import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useToastStore from './toastStore';
import type { ToastItem } from './Toast.type';
import { containerStyle, toastStyle } from './ToastContainer.style';

const ToastEntry = memo(
  ({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) => {
    useEffect(() => {
      const t = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);
      return () => window.clearTimeout(t);
    }, [toast.id, toast.durationMs, onDismiss]);

    return (
      <div css={toastStyle(toast.variant)} role="status" aria-live="polite">
        {toast.message}
      </div>
    );
  },
);
ToastEntry.displayName = 'ToastEntry';

const ToastContainer = memo(() => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (typeof document === 'undefined') {
    return null;
  }
  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div css={containerStyle}>
      {toasts.map((toast) => (
        <ToastEntry key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>,
    document.body,
  );
});

ToastContainer.displayName = 'ToastContainer';
export default ToastContainer;
