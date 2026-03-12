import { create } from 'zustand';
import type { Reminder, ReminderRequest, SmartListType, SmartListCounts } from '../types';
import { reminderApi } from '../api/reminderApi';

interface ReminderState {
  reminders: Reminder[];
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
    // Re-fetch will be handled by the component
  },
  updateReminder: async (id, data) => {
    const updated = await reminderApi.update(id, data);
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? updated : r)),
    }));
  },
  toggleComplete: async (id) => {
    // Optimistic update
    const prev = get().reminders;
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      ),
    }));
    try {
      await reminderApi.toggleComplete(id);
    } catch {
      set({ reminders: prev }); // Rollback
    }
  },
  deleteReminder: async (id) => {
    await reminderApi.delete(id);
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
      selectedReminderId: state.selectedReminderId === id ? null : state.selectedReminderId,
    }));
  },
  searchReminders: async (query) => {
    if (!query.trim()) {
      set({ reminders: [] });
      return;
    }
    const reminders = await reminderApi.search(query);
    set({ reminders });
  },
  selectReminder: (id) => set({ selectedReminderId: id }),
}));
