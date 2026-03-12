import { useUiStore } from '../../stores/uiStore';
import styles from './Toast.module.css';

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          <span className={styles.message}>{toast.message}</span>
          <button
            className={styles.closeButton}
            onClick={() => removeToast(toast.id)}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
