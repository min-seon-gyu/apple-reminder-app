import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
}

interface UiState {
  isSidebarOpen: boolean;
  searchQuery: string;
  isSearching: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToast: (message: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  searchQuery: '',
  isSearching: false,
  toasts: [],
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query, isSearching: query.length > 0 }),
  setIsSearching: (isSearching) => set({ isSearching }),
  addToast: (message) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
