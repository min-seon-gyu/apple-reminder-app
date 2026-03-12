import { create } from 'zustand';
import type { ReminderList, ReminderListRequest, SmartListType } from '../types';
import { listApi } from '../api/listApi';

interface ListState {
  lists: ReminderList[];
  selectedListId: number | null;
  selectedSmartList: SmartListType | null;
  fetchLists: () => Promise<void>;
  createList: (data: ReminderListRequest) => Promise<void>;
  updateList: (id: number, data: ReminderListRequest) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  selectList: (id: number) => void;
  selectSmartList: (type: SmartListType) => void;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  selectedListId: null,
  selectedSmartList: 'all',
  fetchLists: async () => {
    const lists = await listApi.getAll();
    set({ lists });
  },
  createList: async (data) => {
    await listApi.create(data);
    const lists = await listApi.getAll();
    set({ lists });
  },
  updateList: async (id, data) => {
    await listApi.update(id, data);
    const lists = await listApi.getAll();
    set({ lists });
  },
  deleteList: async (id) => {
    await listApi.delete(id);
    const lists = await listApi.getAll();
    set({ lists });
  },
  selectList: (id) => set({ selectedListId: id, selectedSmartList: null }),
  selectSmartList: (type) => set({ selectedSmartList: type, selectedListId: null }),
}));
