import { create } from 'zustand';
import type { ToastItem, ToastVariant } from './Toast.type';

type ShowOptions = {
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastStore = {
  toasts: ToastItem[];
  show: (message: string, options?: ShowOptions) => number;
  dismiss: (id: number) => void;
};

let nextId = 1;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, options) => {
    const id = nextId++;
    const item: ToastItem = {
      id,
      message,
      variant: options?.variant ?? 'success',
      durationMs: options?.durationMs ?? 3000,
    };
    set((state) => ({ toasts: [...state.toasts, item] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useToastStore;
