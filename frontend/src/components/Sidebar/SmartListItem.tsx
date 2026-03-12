import { useNavigate, useLocation } from 'react-router-dom';
import type { SmartListType } from '../../types';
import styles from './SmartListItem.module.css';

interface SmartListItemProps {
  type: SmartListType;
  name: string;
  iconColor: string;
  count: number;
}

const ICON_MAP: Record<SmartListType, string> = {
  today: '☀',
  scheduled: '📅',
  all: '☰',
  flagged: '⚑',
  completed: '✓',
};

export default function SmartListItem({ type, name, iconColor, count }: SmartListItemProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSelected = location.pathname === `/smart/${type}`;

  const handleClick = () => {
    navigate(`/smart/${type}`);
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className={styles.topRow}>
        <div className={styles.iconCircle} style={{ background: iconColor }}>
          <span className={styles.iconText}>{ICON_MAP[type]}</span>
        </div>
        <span className={styles.count}>{count}</span>
      </div>
      <span className={styles.name}>{name}</span>
    </div>
  );
}
