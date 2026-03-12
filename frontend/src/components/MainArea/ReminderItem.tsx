import { useState } from 'react';
import type { Reminder, Priority } from '../../types';
import { useReminderStore } from '../../stores/reminderStore';
import ReminderDetail from './ReminderDetail';
import SubtaskList from './SubtaskList';
import styles from './ReminderItem.module.css';

interface ReminderItemProps {
  reminder: Reminder;
  color?: string;
  isSubtask?: boolean;
}

function priorityIndicator(priority: Priority): React.ReactNode {
  switch (priority) {
    case 'LOW':
      return <span className={`${styles.priority} ${styles.priorityLow}`}>!</span>;
    case 'MEDIUM':
      return <span className={`${styles.priority} ${styles.priorityMedium}`}>!!</span>;
    case 'HIGH':
      return <span className={`${styles.priority} ${styles.priorityHigh}`}>!!!</span>;
    default:
      return null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function ReminderItem({ reminder, color, isSubtask = false }: ReminderItemProps) {
  const { selectedReminderId, selectReminder, toggleComplete } = useReminderStore();
  const [completing, setCompleting] = useState(false);

  const isSelected = selectedReminderId === reminder.id;
  const listColor = color ?? 'var(--color-blue)';

  const handleCheckbox = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    await toggleComplete(reminder.id);
    // After animation (1s), the store will update
    setTimeout(() => setCompleting(false), 1100);
  };

  const handleRowClick = () => {
    if (isSelected) {
      selectReminder(null);
    } else {
      selectReminder(reminder.id);
    }
  };

  const hasSubtasks = reminder.subtasks && reminder.subtasks.length > 0;

  return (
    <div className={`${styles.wrapper} ${isSubtask ? styles.subtaskWrapper : ''}`}>
      <div
        className={`${styles.item} ${isSelected ? styles.itemSelected : ''} ${completing ? styles.completing : ''}`}
        style={isSubtask ? { paddingLeft: '28px' } : undefined}
      >
        {/* Checkbox */}
        <button
          className={`${styles.checkbox} ${reminder.isCompleted ? styles.checkboxCompleted : ''}`}
          style={{
            borderColor: reminder.isCompleted ? listColor : listColor,
            backgroundColor: reminder.isCompleted ? listColor : 'transparent',
          }}
          onClick={handleCheckbox}
          aria-label={reminder.isCompleted ? '완료 취소' : '완료'}
        >
          {reminder.isCompleted && (
            <svg className={styles.checkmark} viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className={styles.content} onClick={handleRowClick}>
          <span className={`${styles.title} ${reminder.isCompleted ? styles.titleCompleted : ''}`}>
            {reminder.title}
          </span>

          {/* Metadata line */}
          {(reminder.dueDate || reminder.priority !== 'NONE' || reminder.isFlagged || reminder.tags.length > 0) && (
            <div className={styles.meta}>
              {reminder.dueDate && (
                <span className={styles.metaDate}>{formatDate(reminder.dueDate)}</span>
              )}
              {priorityIndicator(reminder.priority)}
              {reminder.isFlagged && <span className={styles.metaFlag}>🚩</span>}
              {reminder.tags.map((tag) => (
                <span key={tag.id} className={styles.metaTag}>{tag.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline detail when selected */}
      {isSelected && (
        <ReminderDetail reminder={reminder} color={color} />
      )}

      {/* Subtasks */}
      {(hasSubtasks || isSelected) && (
        <SubtaskList
          parentId={reminder.id}
          subtasks={reminder.subtasks ?? []}
          parentListId={reminder.listId}
          color={color}
        />
      )}
    </div>
  );
}
