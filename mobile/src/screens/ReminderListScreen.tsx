import { useCallback, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReminderRow from '../components/ReminderRow';
import { useReminderStore } from '../stores/reminderStore';
import { useListStore } from '../stores/listStore';
import { useUiStore } from '../stores/uiStore';
import { LIST_COLORS, SMART_LIST_COLORS } from '../constants/colors';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { Reminder, SmartListType } from '../types';

type Nav = StackNavigationProp<HomeStackParamList, 'ReminderList'>;
type Route = RouteProp<HomeStackParamList, 'ReminderList'>;

export default function ReminderListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listId, smartListType, title, color: colorKey } = route.params;

  const reminders = useReminderStore((s) => s.reminders);
  const fetchReminders = useReminderStore((s) => s.fetchReminders);
  const fetchSmartList = useReminderStore((s) => s.fetchSmartList);
  const toggleComplete = useReminderStore((s) => s.toggleComplete);
  const deleteReminder = useReminderStore((s) => s.deleteReminder);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const lists = useListStore((s) => s.lists);
  const addToast = useUiStore((s) => s.addToast);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const listColor = colorKey
    ? LIST_COLORS[colorKey as keyof typeof LIST_COLORS] || '#007AFF'
    : smartListType
    ? SMART_LIST_COLORS[smartListType as SmartListType]
    : '#007AFF';

  const isCompleted = smartListType === 'completed';

  const loadData = useCallback(async () => {
    try {
      if (smartListType) {
        await fetchSmartList(smartListType as SmartListType);
      } else if (listId) {
        await fetchReminders(listId, isCompleted);
      }
    } catch {
      addToast('데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, [smartListType, listId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const topLevelReminders = reminders.filter((r) => r.parentId === null);

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
    await loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteReminder(id);
    await loadData();
  };

  const handleNewReminder = () => {
    const targetListId = listId ?? lists[0]?.id;
    if (!targetListId) return;
    navigation.navigate('ReminderDetail', { listId: targetListId, mode: 'create' });
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderRow
      reminder={item}
      color={listColor}
      onPress={() => navigation.navigate('ReminderDetail', { reminderId: item.id, mode: 'edit' })}
      onToggleComplete={() => toggleComplete(item.id)}
      onDelete={() => handleDelete(item.id)}
      onToggleFlag={() => handleToggleFlag(item)}
      onSubtaskPress={(sub) => navigation.navigate('ReminderDetail', { reminderId: sub.id, mode: 'edit' })}
      onSubtaskToggle={(id) => toggleComplete(id)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={listColor} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: listColor }]}>{title}</Text>
        <Text style={[styles.count, { color: listColor }]}>{topLevelReminders.length}</Text>
      </View>

      <FlatList
        data={topLevelReminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
        contentContainerStyle={topLevelReminders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>리마인더 없음</Text>
          </View>
        }
      />

      {!isCompleted && (
        <TouchableOpacity style={styles.addButton} onPress={handleNewReminder}>
          <Ionicons name="add-circle-outline" size={22} color={listColor} />
          <Text style={[styles.addText, { color: listColor }]}>새 리마인더</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 34, fontWeight: 'bold' },
  count: { fontSize: 34, fontWeight: 'bold' },
  list: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 50 },
  addButton: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 6 },
  addText: { fontSize: 17, fontWeight: '600' },
  emptyContainer: { flex: 1 },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 17, color: '#8E8E93' },
});
