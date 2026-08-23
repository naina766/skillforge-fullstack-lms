import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
}));
