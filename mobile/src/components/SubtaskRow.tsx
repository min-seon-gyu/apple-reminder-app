import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Reminder } from '../types';

interface SubtaskRowProps {
  subtask: Reminder;
  color: string;
  onPress: () => void;
  onToggle: () => void;
}

export default function SubtaskRow({ subtask, color, onPress, onToggle }: SubtaskRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        <View
          style={[
            styles.checkbox,
            { borderColor: color },
            subtask.isCompleted && { backgroundColor: color },
          ]}
        >
          {subtask.isCompleted && (
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
      <Text
        style={[styles.title, subtask.isCompleted && styles.titleCompleted]}
        numberOfLines={1}
      >
        {subtask.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 50,
    paddingRight: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: { paddingRight: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 15, color: '#000', flex: 1 },
  titleCompleted: { textDecorationLine: 'line-through', color: '#8E8E93' },
});
