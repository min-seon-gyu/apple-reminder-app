import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import SwipeActions from './SwipeActions';
import SubtaskRow from './SubtaskRow';
import type { Reminder, Priority } from '../types';

interface ReminderRowProps {
  reminder: Reminder;
  color: string;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onToggleFlag: () => void;
  onSubtaskPress: (subtask: Reminder) => void;
  onSubtaskToggle: (id: number) => void;
}

function priorityText(p: Priority): string | null {
  if (p === 'LOW') return '!';
  if (p === 'MEDIUM') return '!!';
  if (p === 'HIGH') return '!!!';
  return null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function ReminderRow({
  reminder, color, onPress, onToggleComplete, onDelete, onToggleFlag, onSubtaskPress, onSubtaskToggle,
}: ReminderRowProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleToggle = () => {
    if (!reminder.isCompleted) {
      opacity.value = withTiming(0.3, { duration: 800 }, () => {
        runOnJS(onToggleComplete)();
      });
    } else {
      onToggleComplete();
    }
  };

  const pText = priorityText(reminder.priority);

  return (
    <SwipeActions onDelete={onDelete} onFlag={onToggleFlag} isFlagged={reminder.isFlagged}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggle}>
            <View
              style={[
                styles.checkbox,
                { borderColor: color },
                reminder.isCompleted && { backgroundColor: color },
              ]}
            >
              {reminder.isCompleted && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text
              style={[styles.title, reminder.isCompleted && styles.titleCompleted]}
              numberOfLines={1}
            >
              {reminder.title}
            </Text>
            {(reminder.dueDate || pText || reminder.isFlagged || reminder.tags.length > 0) && (
              <View style={styles.meta}>
                {reminder.dueDate && <Text style={styles.metaText}>{formatDate(reminder.dueDate)}</Text>}
                {pText && <Text style={[styles.metaText, { color: '#FF9500' }]}>{pText}</Text>}
                {reminder.isFlagged && <Text style={styles.metaText}>🚩</Text>}
                {reminder.tags.map((tag) => (
                  <Text key={tag.id} style={styles.tagText}>#{tag.name}</Text>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        {reminder.subtasks?.map((subtask) => (
          <SubtaskRow
            key={subtask.id}
            subtask={subtask}
            color={color}
            onPress={() => onSubtaskPress(subtask)}
            onToggle={() => onSubtaskToggle(subtask.id)}
          />
        ))}
      </Animated.View>
    </SwipeActions>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: { paddingRight: 12, paddingTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 17, color: '#000' },
  titleCompleted: { textDecorationLine: 'line-through', color: '#8E8E93' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  metaText: { fontSize: 13, color: '#8E8E93' },
  tagText: { fontSize: 13, color: '#007AFF' },
});
