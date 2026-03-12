import { useState, useRef, useEffect } from 'react';
import type { ListColor } from '../../types';
import { useListStore } from '../../stores/listStore';
import styles from './AddListButton.module.css';

const COLORS: ListColor[] = [
  'red', 'orange', 'yellow', 'green', 'cyan', 'blue',
  'purple', 'pink', 'brown', 'gray', 'indigo', 'teal',
];

export default function AddListButton() {
  const { createList } = useListStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<ListColor>('blue');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setName('');
    setSelectedColor('blue');
  };

  const handleCancel = () => {
    setIsOpen(false);
    setName('');
  };

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createList({ name: trimmed, color: selectedColor, icon: 'list' });
    setIsOpen(false);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className={styles.container}>
      {!isOpen ? (
        <button className={styles.addButton} onClick={handleOpen}>
          <span className={styles.plusIcon}>+</span>
          목록 추가
        </button>
      ) : (
        <div className={styles.form}>
          <input
            ref={inputRef}
            type="text"
            className={styles.nameInput}
            placeholder="목록 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className={styles.colorLabel}>색상</span>
          <div className={styles.colorPicker}>
            {COLORS.map((color) => (
              <div
                key={color}
                className={`${styles.colorDot} ${selectedColor === color ? styles.colorDotSelected : ''}`}
                style={{ background: `var(--color-${color})` }}
                onClick={() => setSelectedColor(color)}
                role="button"
                aria-label={color}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedColor(color)}
              />
            ))}
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelButton} onClick={handleCancel}>취소</button>
            <button
              className={styles.confirmButton}
              onClick={handleConfirm}
              disabled={!name.trim()}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
