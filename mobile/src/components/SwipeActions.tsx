import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';

interface SwipeActionsProps {
  children: ReactNode;
  onDelete: () => void;
  onFlag: () => void;
  isFlagged: boolean;
}

export default function SwipeActions({ children, onDelete, onFlag, isFlagged }: SwipeActionsProps) {
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      <Text style={styles.actionText}>삭제</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity style={styles.flagAction} onPress={onFlag}>
      <Ionicons name={isFlagged ? 'flag' : 'flag-outline'} size={24} color="#FFFFFF" />
      <Text style={styles.actionText}>{isFlagged ? '해제' : '플래그'}</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  flagAction: {
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 2,
  },
});
