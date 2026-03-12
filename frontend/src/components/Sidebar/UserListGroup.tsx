import { useListStore } from '../../stores/listStore';
import UserListItem from './UserListItem';
import styles from './UserListGroup.module.css';

export default function UserListGroup() {
  const { lists } = useListStore();

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>나의 목록</div>
      <div className={styles.listItems}>
        {lists.map((list) => (
          <UserListItem key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}
