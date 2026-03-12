import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReminderStore } from '../../stores/reminderStore';

vi.mock('../../api/reminderApi', () => ({
  reminderApi: {
    getByList: vi.fn(),
    getSmartList: vi.fn(),
    getSmartListCounts: vi.fn(),
    toggleComplete: vi.fn(),
    search: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { reminderApi } from '../../api/reminderApi';

describe('reminderStore', () => {
  beforeEach(() => {
    useReminderStore.setState({
      reminders: [],
      selectedReminderId: null,
      smartListCounts: { today: 0, scheduled: 0, all: 0, flagged: 0, completed: 0 },
    });
    vi.clearAllMocks();
  });

  it('fetchReminders populates reminders', async () => {
    const mockReminders = [{ id: 1, title: 'Test', isCompleted: false, listId: 1, parentId: null, notes: null, completedAt: null, dueDate: null, dueTime: null, priority: 'NONE' as const, isFlagged: false, position: 1, tags: [], subtasks: [], createdAt: '', updatedAt: '' }];
    (reminderApi.getByList as ReturnType<typeof vi.fn>).mockResolvedValue(mockReminders);

    await useReminderStore.getState().fetchReminders(1);
    expect(useReminderStore.getState().reminders).toEqual(mockReminders);
  });

  it('toggleComplete optimistically updates', async () => {
    const reminder = { id: 1, title: 'Test', isCompleted: false, listId: 1, parentId: null, notes: null, completedAt: null, dueDate: null, dueTime: null, priority: 'NONE' as const, isFlagged: false, position: 1, tags: [], subtasks: [], createdAt: '', updatedAt: '' };
    useReminderStore.setState({ reminders: [reminder] });
    (reminderApi.toggleComplete as ReturnType<typeof vi.fn>).mockResolvedValue({ ...reminder, isCompleted: true });

    await useReminderStore.getState().toggleComplete(1);
    expect(useReminderStore.getState().reminders[0].isCompleted).toBe(true);
  });

  it('searchReminders with empty query returns empty', async () => {
    await useReminderStore.getState().searchReminders('');
    expect(useReminderStore.getState().reminders).toEqual([]);
    expect(reminderApi.search).not.toHaveBeenCalled();
  });

  it('searchReminders calls API', async () => {
    const results = [{ id: 2, title: 'Found', isCompleted: false, listId: 1, parentId: null, notes: null, completedAt: null, dueDate: null, dueTime: null, priority: 'NONE' as const, isFlagged: false, position: 1, tags: [], subtasks: [], createdAt: '', updatedAt: '' }];
    (reminderApi.search as ReturnType<typeof vi.fn>).mockResolvedValue(results);

    await useReminderStore.getState().searchReminders('Found');
    expect(reminderApi.search).toHaveBeenCalledWith('Found');
    expect(useReminderStore.getState().reminders).toEqual(results);
  });
});
