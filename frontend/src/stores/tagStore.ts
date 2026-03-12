import { create } from 'zustand';
import type { Tag } from '../types';
import { tagApi } from '../api/tagApi';

interface TagState {
  tags: Tag[];
  fetchTags: () => Promise<void>;
  createTag: (name: string) => Promise<Tag>;
  updateTag: (id: number, name: string) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  fetchTags: async () => {
    const tags = await tagApi.getAll();
    set({ tags });
  },
  createTag: async (name) => {
    const tag = await tagApi.create(name);
    set((state) => ({ tags: [...state.tags, tag] }));
    return tag;
  },
  updateTag: async (id, name) => {
    await tagApi.update(id, name);
    set((state) => ({ tags: state.tags.map((t) => (t.id === id ? { ...t, name } : t)) }));
  },
  deleteTag: async (id) => {
    await tagApi.delete(id);
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
  },
}));
