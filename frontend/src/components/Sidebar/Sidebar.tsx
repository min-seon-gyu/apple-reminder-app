import { useUiStore } from '../../stores/uiStore';
import SearchBar from './SearchBar';
import SmartListGroup from './SmartListGroup';
import UserListGroup from './UserListGroup';
import AddListButton from './AddListButton';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <SearchBar />
        <SmartListGroup />
        <div className={styles.divider} />
        <UserListGroup />
        <AddListButton />
      </aside>
    </>
  );
}
