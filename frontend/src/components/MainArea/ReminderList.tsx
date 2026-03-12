import type { Reminder } from '../../types';
import ReminderItem from './ReminderItem';
import styles from './ReminderList.module.css';

interface ReminderListProps {
  reminders: Reminder[];
  color?: string;
}

export default function ReminderList({ reminders, color }: ReminderListProps) {
  return (
    <div className={styles.list}>
      {reminders.map((reminder) => (
        <ReminderItem key={reminder.id} reminder={reminder} color={color} />
      ))}
    </div>
  );
}
