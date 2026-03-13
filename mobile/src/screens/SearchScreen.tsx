import { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import ReminderRow from '../components/ReminderRow';
import { useReminderStore } from '../stores/reminderStore';
import { useUiStore } from '../stores/uiStore';
import type { SearchStackParamList } from '../navigation/SearchStack';
import type { Reminder } from '../types';

type Nav = StackNavigationProp<SearchStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { searchReminders, toggleComplete, deleteReminder, updateReminder } = useReminderStore();
  const reminders = useReminderStore((s) => s.reminders);
  const addToast = useUiStore((s) => s.addToast);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await searchReminders(text);
      } catch {
        addToast('검색에 실패했습니다');
      }
    }, 300);
  }, []);

  const handleToggleFlag = async (reminder: Reminder) => {
    await updateReminder(reminder.id, {
      listId: reminder.listId,
      title: reminder.title,
      notes: reminder.notes,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      priority: reminder.priority,
      isFlagged: !reminder.isFlagged,
      tagIds: reminder.tags.map((t) => t.id),
    });
    searchReminders(query);
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderRow
      reminder={item}
      color="#007AFF"
      onPress={() => navigation.navigate('ReminderDetail', { reminderId: item.id, mode: 'edit' })}
      onToggleComplete={() => toggleComplete(item.id)}
      onDelete={() => deleteReminder(item.id)}
      onToggleFlag={() => handleToggleFlag(item)}
      onSubtaskPress={(sub) => navigation.navigate('ReminderDetail', { reminderId: sub.id, mode: 'edit' })}
      onSubtaskToggle={(id) => toggleComplete(id)}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>검색</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="검색"
          placeholderTextColor="#8E8E93"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={reminders.length === 0 && query ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          query ? (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>결과 없음</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerTitle: { fontSize: 34, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    color: '#000',
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 50 },
  emptyContainer: { flex: 1 },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 17, color: '#8E8E93' },
});
