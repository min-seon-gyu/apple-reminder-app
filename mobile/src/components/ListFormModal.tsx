import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReminderList } from '../types';

interface ListFormModalProps {
  visible: boolean;
  onClose: () => void;
  initialList?: ReminderList;
}

export default function ListFormModal({ visible, onClose }: ListFormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text>목록 추가 (구현 예정)</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%', alignItems: 'center' },
  close: { color: '#007AFF', marginTop: 16, fontSize: 17 },
});
