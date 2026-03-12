import type { SmartListType } from '../../types';
import styles from './ListHeader.module.css';

interface ListHeaderProps {
  title: string;
  count: number;
  color?: string;
}

export default function ListHeader({ title, count, color }: ListHeaderProps) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title} style={color ? { color } : undefined}>
        {title}
      </h1>
      {count > 0 && (
        <span className={styles.count} style={color ? { color } : undefined}>
          {count}
        </span>
      )}
    </div>
  );
}

export const SMART_LIST_INFO: Record<SmartListType, { name: string; color: string }> = {
  today: { name: '오늘', color: '#007AFF' },
  scheduled: { name: '예정', color: '#FF3B30' },
  all: { name: '전체', color: '#8E8E93' },
  flagged: { name: '플래그 지정됨', color: '#FF9500' },
  completed: { name: '완료됨', color: '#34C759' },
};
