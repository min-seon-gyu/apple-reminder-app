import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_COLORS } from '../constants/colors';
import type { ListColor } from '../types';

interface ColorPickerProps {
  selected: ListColor;
  onSelect: (color: ListColor) => void;
}

const COLORS = Object.keys(LIST_COLORS) as ListColor[];

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.circle, { backgroundColor: LIST_COLORS[color] }]}
          onPress={() => onSelect(color)}
        >
          {selected === color && (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
