import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReminderList } from '../../types';
import { useListStore } from '../../stores/listStore';
import styles from './UserListItem.module.css';

interface UserListItemProps {
  list: ReminderList;
}

export default function UserListItem({ list }: UserListItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectList, deleteList } = useListStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const isSelected = location.pathname === `/list/${list.id}`;

  const handleClick = () => {
    selectList(list.id);
    navigate(`/list/${list.id}`);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = async () => {
    setContextMenu(null);
    if (window.confirm(`"${list.name}" 목록을 삭제하시겠습니까?`)) {
      await deleteList(list.id);
      if (isSelected) {
        navigate('/smart/all');
      }
    }
  };

  const handleEdit = () => {
    setContextMenu(null);
    // Edit functionality will be implemented in a later task
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  return (
    <>
      <div
        className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        <span
          className={styles.colorDot}
          style={{ background: `var(--color-${list.color})` }}
        />
        <span className={styles.name}>{list.name}</span>
        {list.incompleteCount > 0 && (
          <span className={styles.countBadge}>{list.incompleteCount}</span>
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className={styles.contextMenuItem} onClick={handleEdit}>
            편집
          </div>
          <div
            className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
            onClick={handleDelete}
          >
            삭제
          </div>
        </div>
      )}
    </>
  );
}
