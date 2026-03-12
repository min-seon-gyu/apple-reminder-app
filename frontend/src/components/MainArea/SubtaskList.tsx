import { useState, useRef } from 'react';
import type { Reminder } from '../../types';
import { useReminderStore } from '../../stores/reminderStore';
import ReminderItem from './ReminderItem';
import styles from './SubtaskList.module.css';

interface SubtaskListProps {
  parentId: number;
  subtasks: Reminder[];
  parentListId: number;
  color?: string;
}

export default function SubtaskList({ parentId, subtasks, parentListId, color }: SubtaskListProps) {
  const { createReminder, fetchReminders } = useReminderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef(false);

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleConfirm = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    if (inputValue.trim()) {
      await createReminder({
        listId: parentListId,
        parentId,
        title: inputValue.trim(),
      });
      await fetchReminders(parentListId);
    }
    setInputValue('');
    setIsAdding(false);
    isSubmitting.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleBlur = () => {
    if (isSubmitting.current) return;
    if (!inputValue.trim()) {
      setIsAdding(false);
    } else {
      handleConfirm();
    }
  };

  return (
    <div className={styles.subtaskList}>
      {subtasks.map((subtask) => (
        <ReminderItem key={subtask.id} reminder={subtask} color={color} isSubtask />
      ))}

      {isAdding ? (
        <div className={styles.addRow}>
          <span className={styles.addIndent} />
          <input
            ref={inputRef}
            className={styles.addInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="하위 항목"
          />
        </div>
      ) : (
        <button className={styles.addSubtaskButton} onClick={handleAdd} style={color ? { color } : undefined}>
          <span className={styles.addIcon}>+</span>
          <span>하위 항목 추가</span>
        </button>
      )}
    </div>
  );
}
