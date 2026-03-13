import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import PriorityPicker from '../components/PriorityPicker';
import TagSelector from '../components/TagSelector';
import SubtaskRow from '../components/SubtaskRow';
import { useReminderStore } from '../stores/reminderStore';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { Priority } from '../types';

type Route = RouteProp<HomeStackParamList, 'ReminderDetail'>;

export default function ReminderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { reminderId, listId, mode } = route.params;

  const { createReminder, updateReminder, deleteReminder, toggleComplete, fetchReminders } = useReminderStore();
  const reminders = useReminderStore((s) => s.reminders);
  const searchResults = useReminderStore((s) => s.searchResults);

  const isCreate = mode === 'create';
  const allItems = [...reminders, ...searchResults];
  const reminder = allItems.flatMap((r) => [r, ...(r.subtasks ?? [])]).find((r) => r.id === reminderId);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('NONE');
  const [isFlagged, setIsFlagged] = useState(false);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const savedRef = useRef(false);
  const buildRequestRef = useRef<() => any>(() => ({}));

  useEffect(() => {
    if (reminder && !isCreate) {
      setTitle(reminder.title);
      setNotes(reminder.notes ?? '');
      setDueDate(reminder.dueDate ? new Date(reminder.dueDate) : null);
      setDueTime(reminder.dueTime ? new Date(`2000-01-01T${reminder.dueTime}`) : null);
      setPriority(reminder.priority);
      setIsFlagged(reminder.isFlagged);
      setTagIds(reminder.tags.map((t) => t.id));
    }
  }, [reminder?.id]);

  const buildRequest = () => ({
    listId: reminder?.listId ?? listId!,
    title: title.trim(),
    notes: notes.trim() || null,
    dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
    dueTime: dueTime && dueDate
      ? `${String(dueTime.getHours()).padStart(2, '0')}:${String(dueTime.getMinutes()).padStart(2, '0')}:00`
      : null,
    priority,
    isFlagged,
    tagIds,
  });

  // Keep ref updated with latest buildRequest on every render
  useEffect(() => {
    buildRequestRef.current = buildRequest;
  });

  useEffect(() => {
    if (isCreate) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              const req = buildRequestRef.current();
              if (!req.title?.trim()) return;
              savedRef.current = true;
              await createReminder(req);
              navigation.goBack();
            }}
            style={{ marginRight: 16 }}
          >
            <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>추가</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isCreate]);

  const handleSave = useCallback(async () => {
    if (isCreate || !reminder || savedRef.current) return;
    const req = buildRequestRef.current();
    if (!req.title?.trim()) return;
    savedRef.current = true;
    await updateReminder(reminder.id, req);
  }, [isCreate, reminder]);

  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  useEffect(() => {
    if (!isCreate) {
      return navigation.addListener('beforeRemove', () => {
        handleSaveRef.current();
      });
    }
  }, [navigation, isCreate]);

  const handleDelete = () => {
    Alert.alert('삭제', '이 리마인더를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          savedRef.current = true;
          await deleteReminder(reminderId!);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim() || !reminder) return;
    await createReminder({
      listId: reminder.listId,
      parentId: reminder.id,
      title: subtaskTitle.trim(),
    });
    await fetchReminders(reminder.listId);
    setSubtaskTitle('');
  };

  const handleTagToggle = (tagId: number) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목"
            placeholderTextColor="#8E8E93"
            maxLength={255}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="메모"
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={2000}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(!showDatePicker)}>
            <Ionicons name="calendar-outline" size={22} color="#007AFF" />
            <Text style={styles.fieldLabel}>날짜</Text>
            <Text style={styles.fieldValue}>
              {dueDate ? `${dueDate.getMonth() + 1}월 ${dueDate.getDate()}일` : '없음'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="inline"
              onChange={(_, date) => {
                if (date) setDueDate(date);
                else { setDueDate(null); setDueTime(null); }
              }}
            />
          )}
          {dueDate && (
            <>
              <TouchableOpacity style={styles.fieldRow} onPress={() => setShowTimePicker(!showTimePicker)}>
                <Ionicons name="time-outline" size={22} color="#007AFF" />
                <Text style={styles.fieldLabel}>시간</Text>
                <Text style={styles.fieldValue}>
                  {dueTime
                    ? `${String(dueTime.getHours()).padStart(2, '0')}:${String(dueTime.getMinutes()).padStart(2, '0')}`
                    : '없음'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={dueTime ?? new Date()}
                  mode="time"
                  display="spinner"
                  onChange={(_, time) => { if (time) setDueTime(time); }}
                />
              )}
            </>
          )}
          {dueDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setDueDate(null); setDueTime(null); setShowDatePicker(false); setShowTimePicker(false); }}
            >
              <Text style={styles.clearText}>날짜 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>우선순위</Text>
          <PriorityPicker selected={priority} onSelect={setPriority} />
        </View>

        {/* Flag */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setIsFlagged(!isFlagged)}>
            <Ionicons name={isFlagged ? 'flag' : 'flag-outline'} size={22} color="#FF9500" />
            <Text style={styles.fieldLabel}>플래그</Text>
            <View style={[styles.toggle, isFlagged && styles.toggleActive]} />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <TagSelector
            selectedTagIds={tagIds}
            onToggle={handleTagToggle}
            onCreateAndSelect={(id) => setTagIds((prev) => [...prev, id])}
          />
        </View>

        {/* Subtasks (edit mode only) */}
        {!isCreate && reminder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>하위 항목</Text>
            {reminder.subtasks?.map((sub) => (
              <SubtaskRow
                key={sub.id}
                subtask={sub}
                color="#007AFF"
                onPress={() => (navigation as any).navigate('ReminderDetail', { reminderId: sub.id, mode: 'edit' })}
                onToggle={() => toggleComplete(sub.id)}
              />
            ))}
            <View style={styles.subtaskInput}>
              <TextInput
                style={styles.subtaskTextInput}
                value={subtaskTitle}
                onChangeText={setSubtaskTitle}
                placeholder="하위 항목 추가"
                placeholderTextColor="#8E8E93"
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
            </View>
          </View>
        )}

        {/* Delete button (edit mode only) */}
        {!isCreate && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>리마인더 삭제</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 16 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#8E8E93', marginBottom: 8 },
  titleInput: { fontSize: 17, color: '#000', padding: 0 },
  notesInput: { fontSize: 15, color: '#000', minHeight: 60, padding: 0, textAlignVertical: 'top' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldLabel: { flex: 1, fontSize: 17, color: '#000' },
  fieldValue: { fontSize: 17, color: '#8E8E93' },
  clearButton: { marginTop: 8, alignItems: 'center' },
  clearText: { color: '#FF3B30', fontSize: 15 },
  toggle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C7C7CC' },
  toggleActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  subtaskInput: { paddingTop: 8 },
  subtaskTextInput: { fontSize: 15, color: '#000', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', paddingVertical: 8 },
  deleteButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  deleteText: { color: '#FF3B30', fontSize: 17 },
});
