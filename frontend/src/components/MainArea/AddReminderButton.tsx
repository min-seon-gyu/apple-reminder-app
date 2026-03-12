import { useState, useRef } from 'react';
import { useReminderStore } from '../../stores/reminderStore';
import styles from './AddReminderButton.module.css';

interface AddReminderButtonProps {
  listId: number;
  color?: string;
}

export default function AddReminderButton({ listId, color }: AddReminderButtonProps) {
  const { createReminder, fetchReminders } = useReminderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    setIsAdding(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleConfirm = async () => {
    if (inputValue.trim()) {
      await createReminder({ listId, title: inputValue.trim() });
      await fetchReminders(listId);
    }
    setInputValue('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') {
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleBlur = () => {
    if (!inputValue.trim()) {
      setIsAdding(false);
    } else {
      handleConfirm();
    }
  };

  if (isAdding) {
    return (
      <div className={styles.addRow}>
        <div
          className={styles.checkboxPlaceholder}
          style={color ? { borderColor: color } : undefined}
        />
        <input
          ref={inputRef}
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="새 리마인더"
        />
      </div>
    );
  }

  return (
    <button
      className={styles.button}
      onClick={handleButtonClick}
      style={color ? { color } : undefined}
    >
      <span className={styles.icon}>+</span>
      <span>리마인더 추가</span>
    </button>
  );
}
