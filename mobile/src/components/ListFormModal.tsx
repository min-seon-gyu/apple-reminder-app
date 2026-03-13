import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';
import { useListStore } from '../stores/listStore';
import { LIST_COLORS } from '../constants/colors';
import { LIST_ICONS } from '../constants/icons';
import type { ReminderList, ListColor, ListIcon } from '../types';

interface ListFormModalProps {
  visible: boolean;
  onClose: () => void;
  initialList?: ReminderList;
}

export default function ListFormModal({ visible, onClose, initialList }: ListFormModalProps) {
  const { createList, updateList } = useListStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<ListColor>('blue');
  const [icon, setIcon] = useState<ListIcon>('list');

  const isEdit = !!initialList;

  useEffect(() => {
    if (initialList) {
      setName(initialList.name);
      setColor(initialList.color);
      setIcon(initialList.icon);
    } else {
      setName('');
      setColor('blue');
      setIcon('list');
    }
  }, [initialList, visible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isEdit && initialList) {
      await updateList(initialList.id, { name: name.trim(), color, icon });
    } else {
      await createList({ name: name.trim(), color, icon });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? '목록 편집' : '새로운 목록'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
              <Text style={[styles.saveText, !name.trim() && styles.disabledText]}>
                {isEdit ? '저장' : '생성'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.previewCircle, { backgroundColor: LIST_COLORS[color] }]}>
            <Ionicons name={LIST_ICONS[icon] as any} size={36} color="#FFFFFF" />
          </View>

          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="목록 이름"
            placeholderTextColor="#8E8E93"
            maxLength={50}
          />

          <Text style={styles.sectionLabel}>색상</Text>
          <ColorPicker selected={color} onSelect={setColor} />

          <Text style={styles.sectionLabel}>아이콘</Text>
          <IconPicker selected={icon} onSelect={setIcon} color={LIST_COLORS[color]} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  cancelText: { fontSize: 17, color: '#007AFF' },
  saveText: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  disabledText: { color: '#C7C7CC' },
  previewCircle: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nameInput: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, fontSize: 17, textAlign: 'center', marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 12 },
});
