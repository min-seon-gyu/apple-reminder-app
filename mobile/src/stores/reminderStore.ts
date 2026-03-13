import { create } from 'zustand';
import type { Reminder, ReminderRequest, SmartListType, SmartListCounts } from '../types';
import { reminderApi } from '../api/reminderApi';
import { useListStore } from './listStore';

interface ReminderState {
  reminders: Reminder[];
  searchResults: Reminder[];
  selectedReminderId: number | null;
  smartListCounts: SmartListCounts;
  fetchReminders: (listId: number, includeCompleted?: boolean) => Promise<void>;
  fetchSmartList: (type: SmartListType) => Promise<void>;
  fetchSmartListCounts: () => Promise<void>;
  createReminder: (data: ReminderRequest) => Promise<void>;
  updateReminder: (id: number, data: ReminderRequest) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  searchReminders: (query: string) => Promise<void>;
  selectReminder: (id: number | null) => void;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  searchResults: [],
  selectedReminderId: null,
  smartListCounts: { today: 0, scheduled: 0, all: 0, flagged: 0, completed: 0 },
  fetchReminders: async (listId, includeCompleted = false) => {
    const reminders = await reminderApi.getByList(listId, includeCompleted);
    set({ reminders });
  },
  fetchSmartList: async (type) => {
    const reminders = await reminderApi.getSmartList(type);
    set({ reminders });
  },
  fetchSmartListCounts: async () => {
    const smartListCounts = await reminderApi.getSmartListCounts();
    set({ smartListCounts });
  },
  createReminder: async (data) => {
    await reminderApi.create(data);
    get().fetchSmartListCounts();
    useListStore.getState().fetchLists();
  },
  updateReminder: async (id, data) => {
    const updated = await reminderApi.update(id, data);
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? updated : r)),
      searchResults: state.searchResults.map((r) => (r.id === id ? updated : r)),
    }));
    get().fetchSmartListCounts();
    useListStore.getState().fetchLists();
  },
  toggleComplete: async (id) => {
    // Optimistic update (top-level + nested subtasks)
    const prevReminders = get().reminders;
    const prevSearch = get().searchResults;
    const toggleInList = (list: Reminder[]) =>
      list.map((r) =>
        r.id === id
          ? { ...r, isCompleted: !r.isCompleted }
          : r.subtasks?.length
            ? { ...r, subtasks: r.subtasks.map((s) => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s) }
            : r
      );
    set((state) => ({
      reminders: toggleInList(state.reminders),
      searchResults: toggleInList(state.searchResults),
    }));
    try {
      await reminderApi.toggleComplete(id);
      get().fetchSmartListCounts();
      useListStore.getState().fetchLists();
    } catch {
      set({ reminders: prevReminders, searchResults: prevSearch });
    }
  },
  deleteReminder: async (id) => {
    await reminderApi.delete(id);
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
      searchResults: state.searchResults.filter((r) => r.id !== id),
      selectedReminderId: state.selectedReminderId === id ? null : state.selectedReminderId,
    }));
    get().fetchSmartListCounts();
    useListStore.getState().fetchLists();
  },
  searchReminders: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    const searchResults = await reminderApi.search(query);
    set({ searchResults });
  },
  selectReminder: (id) => set({ selectedReminderId: id }),
}));
