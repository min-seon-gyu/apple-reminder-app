import { useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import { useReminderStore } from '../../stores/reminderStore';
import ReminderItem from '../MainArea/ReminderItem';
import styles from './SearchResults.module.css';

export default function SearchResults() {
  const { searchQuery } = useUiStore();
  const { reminders, searchReminders } = useReminderStore();

  useEffect(() => {
    if (!searchQuery.trim()) {
      searchReminders('');
      return;
    }
    const timer = setTimeout(() => {
      searchReminders(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchReminders]);

  const topLevelReminders = reminders.filter((r) => r.parentId == null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>검색 결과</h1>
        {searchQuery.trim() && (
          <span className={styles.count}>{topLevelReminders.length}</span>
        )}
      </div>

      {!searchQuery.trim() ? (
        <div className={styles.emptyState}>검색어를 입력하세요</div>
      ) : topLevelReminders.length === 0 ? (
        <div className={styles.emptyState}>결과 없음</div>
      ) : (
        <div className={styles.results}>
          {topLevelReminders.map((reminder) => (
            <ReminderItem key={reminder.id} reminder={reminder} />
          ))}
        </div>
      )}
    </div>
  );
}
