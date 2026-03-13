import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SMART_LIST_COLORS, SMART_LIST_LABELS } from '../constants/colors';
import { SMART_LIST_ICONS } from '../constants/icons';
import type { SmartListType } from '../types';

interface SmartListCardProps {
  type: SmartListType;
  count: number;
  onPress: () => void;
}

export default function SmartListCard({ type, count, onPress }: SmartListCardProps) {
  const color = SMART_LIST_COLORS[type];
  const iconName = SMART_LIST_ICONS[type];
  const label = SMART_LIST_LABELS[type];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Ionicons name={iconName as any} size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.count}>{count}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    margin: 4,
    minHeight: 80,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
  },
});
