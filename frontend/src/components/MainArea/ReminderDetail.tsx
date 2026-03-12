import { useState, useEffect } from 'react';
import type { Reminder, Priority } from '../../types';
import { useReminderStore } from '../../stores/reminderStore';
import { useTagStore } from '../../stores/tagStore';
import styles from './ReminderDetail.module.css';

interface ReminderDetailProps {
  reminder: Reminder;
  color?: string;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NONE', label: '없음' },
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '중간' },
  { value: 'HIGH', label: '높음' },
];

export default function ReminderDetail({ reminder, color }: ReminderDetailProps) {
  const { updateReminder, deleteReminder } = useReminderStore();
  const { tags: allTags, createTag } = useTagStore();

  const [title, setTitle] = useState(reminder.title);
  const [notes, setNotes] = useState(reminder.notes ?? '');
  const [dueDate, setDueDate] = useState(reminder.dueDate ?? '');
  const [dueTime, setDueTime] = useState(reminder.dueTime ?? '');
  const [priority, setPriority] = useState<Priority>(reminder.priority);
  const [isFlagged, setIsFlagged] = useState(reminder.isFlagged);
  const [tagIds, setTagIds] = useState<number[]>(reminder.tags.map((t) => t.id));
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Sync state if reminder changes
  useEffect(() => {
    setTitle(reminder.title);
    setNotes(reminder.notes ?? '');
    setDueDate(reminder.dueDate ?? '');
    setDueTime(reminder.dueTime ?? '');
    setPriority(reminder.priority);
    setIsFlagged(reminder.isFlagged);
    setTagIds(reminder.tags.map((t) => t.id));
  }, [reminder.id]);

  const save = (overrides?: Partial<{
    title: string;
    notes: string;
    dueDate: string;
    dueTime: string;
    priority: Priority;
    isFlagged: boolean;
    tagIds: number[];
  }>) => {
    const data = {
      listId: reminder.listId,
      title: overrides?.title ?? title,
      notes: (overrides?.notes ?? notes) || null,
      dueDate: overrides?.dueDate !== undefined ? (overrides.dueDate || null) : (dueDate || null),
      dueTime: overrides?.dueTime !== undefined ? (overrides.dueTime || null) : (dueTime || null),
      priority: overrides?.priority ?? priority,
      isFlagged: overrides?.isFlagged ?? isFlagged,
      tagIds: overrides?.tagIds ?? tagIds,
    };
    updateReminder(reminder.id, data);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as Priority;
    setPriority(newPriority);
    save({ priority: newPriority });
  };

  const handleFlagToggle = () => {
    const next = !isFlagged;
    setIsFlagged(next);
    save({ isFlagged: next });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    if (!newDate) {
      setDueTime('');
      save({ dueDate: '', dueTime: '' });
    } else {
      save({ dueDate: newDate });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setDueTime(newTime);
    save({ dueTime: newTime });
  };

  const handleTagToggle = (tagId: number) => {
    const next = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId];
    setTagIds(next);
    save({ tagIds: next });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    const next = [...tagIds, tag.id];
    setTagIds(next);
    setNewTagName('');
    save({ tagIds: next });
  };

  const handleDelete = async () => {
    if (window.confirm('이 리마인더를 삭제하시겠습니까?')) {
      await deleteReminder(reminder.id);
    }
  };

  const activeTags = reminder.tags.filter((t) => tagIds.includes(t.id));
  const inactiveTags = allTags.filter((t) => !tagIds.includes(t.id));

  return (
    <div className={styles.detail} style={color ? { '--detail-color': color } as React.CSSProperties : undefined}>
      {/* Title */}
      <div className={styles.row}>
        <span className={styles.label}>제목</span>
        <input
          className={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => save()}
          placeholder="제목"
        />
      </div>

      {/* Notes */}
      <div className={styles.row}>
        <span className={styles.label}>메모</span>
        <textarea
          className={styles.notesInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => save()}
          placeholder="메모"
          rows={2}
        />
      </div>

      {/* Date */}
      <div className={styles.row}>
        <span className={styles.label}>날짜</span>
        <input
          className={styles.dateInput}
          type="date"
          value={dueDate}
          onChange={handleDateChange}
        />
      </div>

      {/* Time - only if date is set */}
      {dueDate && (
        <div className={styles.row}>
          <span className={styles.label}>시간</span>
          <input
            className={styles.dateInput}
            type="time"
            value={dueTime}
            onChange={handleTimeChange}
          />
        </div>
      )}

      {/* Priority */}
      <div className={styles.row}>
        <span className={styles.label}>우선순위</span>
        <select className={styles.select} value={priority} onChange={handlePriorityChange}>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Flag */}
      <div className={styles.row}>
        <span className={styles.label}>플래그</span>
        <button
          className={`${styles.flagButton} ${isFlagged ? styles.flagActive : ''}`}
          onClick={handleFlagToggle}
          aria-label={isFlagged ? '플래그 해제' : '플래그 설정'}
        >
          🚩
        </button>
      </div>

      {/* Tags */}
      <div className={styles.row}>
        <span className={styles.label}>태그</span>
        <div className={styles.tagsArea}>
          {activeTags.map((tag) => (
            <button key={tag.id} className={styles.tagPill} onClick={() => handleTagToggle(tag.id)}>
              {tag.name} ×
            </button>
          ))}
          <div className={styles.tagDropdownWrapper}>
            <button
              className={styles.tagAddButton}
              onClick={() => setShowTagDropdown((v) => !v)}
            >
              +
            </button>
            {showTagDropdown && (
              <div className={styles.tagDropdown}>
                {inactiveTags.map((tag) => (
                  <button
                    key={tag.id}
                    className={styles.tagDropdownItem}
                    onClick={() => { handleTagToggle(tag.id); setShowTagDropdown(false); }}
                  >
                    {tag.name}
                  </button>
                ))}
                <div className={styles.tagCreateRow}>
                  <input
                    className={styles.tagCreateInput}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="새 태그 만들기"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { handleCreateTag(); setShowTagDropdown(false); }
                      if (e.key === 'Escape') setShowTagDropdown(false);
                    }}
                  />
                  <button className={styles.tagCreateConfirm} onClick={() => { handleCreateTag(); setShowTagDropdown(false); }}>
                    추가
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className={styles.deleteRow}>
        <button className={styles.deleteButton} onClick={handleDelete}>
          리마인더 삭제
        </button>
      </div>
    </div>
  );
}
