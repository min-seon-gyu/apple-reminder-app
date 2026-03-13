import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Priority } from '../types';

interface PriorityPickerProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

const OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NONE', label: '없음' },
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '중간' },
  { value: 'HIGH', label: '높음' },
];

export default function PriorityPicker({ selected, onSelect }: PriorityPickerProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, selected === opt.value && styles.optionSelected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.label, selected === opt.value && styles.labelSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  optionSelected: { backgroundColor: '#007AFF' },
  label: { fontSize: 15, color: '#000' },
  labelSelected: { color: '#FFFFFF', fontWeight: '600' },
});
