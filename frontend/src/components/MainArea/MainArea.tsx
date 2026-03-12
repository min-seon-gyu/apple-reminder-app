import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { SmartListType } from '../../types';
import { useReminderStore } from '../../stores/reminderStore';
import { useListStore } from '../../stores/listStore';
import ListHeader, { SMART_LIST_INFO } from './ListHeader';
import ReminderList from './ReminderList';
import AddReminderButton from './AddReminderButton';
import styles from './MainArea.module.css';

export default function MainArea() {
  const { id, type } = useParams<{ id?: string; type?: string }>();
  const { reminders, fetchReminders, fetchSmartList } = useReminderStore();
  const { lists } = useListStore();

  const isSmartList = !!type;
  const listId = id ? Number(id) : null;

  useEffect(() => {
    if (type) {
      fetchSmartList(type as SmartListType);
    } else if (listId) {
      fetchReminders(listId);
    }
  }, [type, listId, fetchReminders, fetchSmartList]);

  // Determine title and color
  let title = '';
  let color: string | undefined;

  if (isSmartList && type) {
    const info = SMART_LIST_INFO[type as SmartListType];
    title = info?.name ?? type;
    color = info?.color;
  } else if (listId) {
    const list = lists.find((l) => l.id === listId);
    title = list?.name ?? '';
    color = list ? `var(--color-${list.color})` : undefined;
  }

  // Top-level reminders (no parent)
  const topLevelReminders = reminders.filter((r) => r.parentId == null);
  const count = topLevelReminders.length;

  // Show AddReminderButton: all user lists + smart 'all'
  const showAddButton = !isSmartList || type === 'all';

  return (
    <div className={styles.mainArea}>
      <ListHeader title={title} count={count} color={color} />

      {topLevelReminders.length === 0 ? (
        <div className={styles.empty}>리마인더 없음</div>
      ) : (
        <ReminderList reminders={topLevelReminders} color={color} />
      )}

      {showAddButton && listId && (
        <AddReminderButton listId={listId} color={color} />
      )}
      {showAddButton && type === 'all' && (
        <AddReminderButton listId={lists[0]?.id ?? 1} color={color} />
      )}
    </div>
  );
}
