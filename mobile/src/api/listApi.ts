import { api } from './client';
import type { ReminderList, ReminderListRequest } from '../types';

export const listApi = {
  getAll: () => api.get<ReminderList[]>('/api/lists'),
  create: (data: ReminderListRequest) => api.post<ReminderList>('/api/lists', data),
  update: (id: number, data: ReminderListRequest) => api.put<ReminderList>(`/api/lists/${id}`, data),
  updatePositions: (orderedIds: number[]) => api.patch<void>(`/api/lists/0/position`, { orderedIds }),
  delete: (id: number) => api.delete<void>(`/api/lists/${id}`),
};
