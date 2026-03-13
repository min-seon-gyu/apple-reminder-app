import { useCallback, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import SmartListGrid from '../components/SmartListGrid';
import UserListRow from '../components/UserListRow';
import ListFormModal from '../components/ListFormModal';
import { useReminderStore } from '../stores/reminderStore';
import { useListStore } from '../stores/listStore';
import { SMART_LIST_LABELS } from '../constants/colors';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { SmartListType, ReminderList } from '../types';

type Nav = StackNavigationProp<HomeStackParamList, 'Summary'>;

export default function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const smartListCounts = useReminderStore((s) => s.smartListCounts);
  const fetchSmartListCounts = useReminderStore((s) => s.fetchSmartListCounts);
  const lists = useListStore((s) => s.lists);
  const fetchLists = useListStore((s) => s.fetchLists);
  const deleteList = useListStore((s) => s.deleteList);
  const [refreshing, setRefreshing] = useState(false);
  const [editingList, setEditingList] = useState<ReminderList | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchSmartListCounts();
      fetchLists();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSmartListCounts(), fetchLists()]);
    setRefreshing(false);
  };

  const handleSmartListPress = (type: SmartListType) => {
    navigation.navigate('ReminderList', {
      smartListType: type,
      title: SMART_LIST_LABELS[type],
    });
  };

  const handleListPress = (list: ReminderList) => {
    navigation.navigate('ReminderList', {
      listId: list.id,
      title: list.name,
      color: list.color,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.headerTitle}>요약</Text>
        <SmartListGrid counts={smartListCounts} onPress={handleSmartListPress} />

        <Text style={styles.sectionTitle}>나의 목록</Text>
        <View style={styles.listSection}>
          {lists.map((list, index) => (
            <View key={list.id}>
              {index > 0 && <View style={styles.separator} />}
              <UserListRow
                list={list}
                onPress={() => handleListPress(list)}
                onEdit={() => setEditingList(list)}
                onDelete={() => {
                  Alert.alert('삭제', `"${list.name}" 목록을 삭제하시겠습니까?\n포함된 모든 리마인더도 삭제됩니다.`, [
                    { text: '취소', style: 'cancel' },
                    { text: '삭제', style: 'destructive', onPress: () => deleteList(list.id) },
                  ]);
                }}
              />
            </View>
          ))}
          {lists.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>목록 없음</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ListFormModal
        visible={editingList !== null}
        onClose={() => setEditingList(null)}
        initialList={editingList ?? undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerTitle: { fontSize: 34, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  listSection: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 60 },
  emptyRow: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#8E8E93' },
});
