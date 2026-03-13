import { api } from './client';
import type { Reminder, ReminderRequest, SmartListCounts, SmartListType } from '../types';

export const reminderApi = {
  getByList: (listId: number, includeCompleted = false) =>
    api.get<Reminder[]>(`/api/reminders?listId=${listId}&includeCompleted=${includeCompleted}`),
  getSmartList: (type: SmartListType) => api.get<Reminder[]>(`/api/reminders/smart/${type}`),
  getSmartListCounts: () => api.get<SmartListCounts>('/api/reminders/smart/counts'),
  get: (id: number) => api.get<Reminder>(`/api/reminders/${id}`),
  create: (data: ReminderRequest) => api.post<Reminder>('/api/reminders', data),
  update: (id: number, data: ReminderRequest) => api.put<Reminder>(`/api/reminders/${id}`, data),
  toggleComplete: (id: number) => api.patch<Reminder>(`/api/reminders/${id}/complete`),
  updatePositions: (id: number, orderedIds: number[]) =>
    api.patch<void>(`/api/reminders/${id}/position`, { orderedIds }),
  delete: (id: number) => api.delete<void>(`/api/reminders/${id}`),
  search: (q: string) => api.get<Reminder[]>(`/api/reminders/search?q=${encodeURIComponent(q)}`),
};
