import { create } from 'zustand';
import Toast from 'react-native-toast-message';

interface UiState {
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToast: (message: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  isSearching: false,
  setSearchQuery: (query) => set({ searchQuery: query, isSearching: query.length > 0 }),
  setIsSearching: (isSearching) => set({ isSearching }),
  addToast: (message) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
}));
