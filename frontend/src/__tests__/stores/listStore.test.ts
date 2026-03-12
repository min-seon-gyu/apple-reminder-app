import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useListStore } from '../../stores/listStore';

// Mock the listApi
vi.mock('../../api/listApi', () => ({
  listApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

import { listApi } from '../../api/listApi';

describe('listStore', () => {
  beforeEach(() => {
    useListStore.setState({ lists: [], selectedListId: null, selectedSmartList: 'all' });
    vi.clearAllMocks();
  });

  it('fetchLists populates lists', async () => {
    const mockLists = [{ id: 1, name: 'Test', color: 'blue', icon: 'list', position: 1, incompleteCount: 0, createdAt: '', updatedAt: '' }];
    (listApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockLists);

    await useListStore.getState().fetchLists();
    expect(useListStore.getState().lists).toEqual(mockLists);
  });

  it('selectList sets selectedListId and clears smartList', () => {
    useListStore.getState().selectList(5);
    expect(useListStore.getState().selectedListId).toBe(5);
    expect(useListStore.getState().selectedSmartList).toBeNull();
  });

  it('selectSmartList sets type and clears listId', () => {
    useListStore.getState().selectSmartList('today');
    expect(useListStore.getState().selectedSmartList).toBe('today');
    expect(useListStore.getState().selectedListId).toBeNull();
  });
});
