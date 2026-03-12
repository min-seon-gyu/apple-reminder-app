import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useUiStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      navigate('/search');
    } else {
      navigate(-1);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    navigate(-1);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="검색"
          value={searchQuery}
          onChange={handleChange}
        />
        {searchQuery && (
          <button className={styles.clearButton} onClick={handleClear} aria-label="검색 지우기">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
