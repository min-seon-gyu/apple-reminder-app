import { useReminderStore } from '../../stores/reminderStore';
import type { SmartListType } from '../../types';
import SmartListItem from './SmartListItem';
import styles from './SmartListGroup.module.css';

const SMART_LISTS: { type: SmartListType; name: string; iconColor: string }[] = [
  { type: 'today', name: '오늘', iconColor: 'var(--color-blue)' },
  { type: 'scheduled', name: '예정', iconColor: 'var(--color-red)' },
  { type: 'all', name: '전체', iconColor: 'var(--color-gray)' },
  { type: 'flagged', name: '플래그 지정됨', iconColor: 'var(--color-orange)' },
  { type: 'completed', name: '완료됨', iconColor: 'var(--color-green)' },
];

export default function SmartListGroup() {
  const { smartListCounts } = useReminderStore();

  return (
    <div className={styles.grid}>
      {SMART_LISTS.map(({ type, name, iconColor }) => (
        <SmartListItem
          key={type}
          type={type}
          name={name}
          iconColor={iconColor}
          count={smartListCounts[type]}
        />
      ))}
    </div>
  );
}
