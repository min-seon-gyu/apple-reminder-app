import { TouchableOpacity, Text, View, StyleSheet, ActionSheetIOS } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReminderList } from '../types';
import { LIST_COLORS } from '../constants/colors';
import { LIST_ICONS } from '../constants/icons';

interface UserListRowProps {
  list: ReminderList;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserListRow({ list, onPress, onEdit, onDelete }: UserListRowProps) {
  const color = LIST_COLORS[list.color];
  const iconName = LIST_ICONS[list.icon];

  const handleLongPress = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['취소', '편집', '삭제'],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) onEdit();
        if (buttonIndex === 2) onDelete();
      }
    );
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.6}
    >
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons name={iconName as any} size={18} color="#FFFFFF" />
      </View>
      <Text style={styles.name} numberOfLines={1}>{list.name}</Text>
      <View style={styles.right}>
        {list.incompleteCount > 0 && (
          <Text style={styles.count}>{list.incompleteCount}</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontSize: 17,
    color: '#8E8E93',
  },
});
