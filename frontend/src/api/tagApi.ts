import { api } from './client';
import type { Tag } from '../types';

export const tagApi = {
  getAll: () => api.get<Tag[]>('/api/tags'),
  create: (name: string) => api.post<Tag>('/api/tags', { name }),
  update: (id: number, name: string) => api.put<Tag>(`/api/tags/${id}`, { name }),
  delete: (id: number) => api.delete<void>(`/api/tags/${id}`),
};
