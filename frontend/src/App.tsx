import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useListStore } from './stores/listStore';
import { useReminderStore } from './stores/reminderStore';
import { useTagStore } from './stores/tagStore';
import { useUiStore } from './stores/uiStore';
import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import SearchResults from './components/Search/SearchResults';
import Toast from './components/common/Toast';
import styles from './App.module.css';

function App() {
  const { fetchLists } = useListStore();
  const { fetchSmartListCounts } = useReminderStore();
  const { fetchTags } = useTagStore();
  const { toggleSidebar } = useUiStore();

  useEffect(() => {
    fetchLists();
    fetchSmartListCounts();
    fetchTags();
  }, [fetchLists, fetchSmartListCounts, fetchTags]);

  return (
    <BrowserRouter>
      <div className={styles.app}>
        <button className={styles.hamburger} onClick={toggleSidebar}>
          ☰
        </button>
        <Sidebar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="/smart/all" replace />} />
            <Route path="/list/:id" element={<MainArea />} />
            <Route path="/smart/:type" element={<MainArea />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>
        <Toast />
      </div>
    </BrowserRouter>
  );
}

export default App;
