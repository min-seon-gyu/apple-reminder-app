import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_ICONS } from '../constants/icons';
import type { ListIcon } from '../types';

interface IconPickerProps {
  selected: ListIcon;
  onSelect: (icon: ListIcon) => void;
  color: string;
}

const ICONS = Object.keys(LIST_ICONS) as ListIcon[];

export default function IconPicker({ selected, onSelect, color }: IconPickerProps) {
  return (
    <View style={styles.grid}>
      {ICONS.map((icon) => (
        <TouchableOpacity
          key={icon}
          style={[
            styles.item,
            selected === icon && { backgroundColor: color },
          ]}
          onPress={() => onSelect(icon)}
        >
          <Ionicons
            name={LIST_ICONS[icon] as any}
            size={24}
            color={selected === icon ? '#FFFFFF' : '#8E8E93'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  item: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
