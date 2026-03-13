import { View, StyleSheet } from 'react-native';
import SmartListCard from './SmartListCard';
import type { SmartListCounts, SmartListType } from '../types';

interface SmartListGridProps {
  counts: SmartListCounts;
  onPress: (type: SmartListType) => void;
}

export default function SmartListGrid({ counts, onPress }: SmartListGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <SmartListCard type="today" count={counts.today} onPress={() => onPress('today')} />
        <SmartListCard type="scheduled" count={counts.scheduled} onPress={() => onPress('scheduled')} />
      </View>
      <View style={styles.row}>
        <SmartListCard type="all" count={counts.all} onPress={() => onPress('all')} />
        <SmartListCard type="flagged" count={counts.flagged} onPress={() => onPress('flagged')} />
      </View>
      <View style={styles.row}>
        <SmartListCard type="completed" count={counts.completed} onPress={() => onPress('completed')} />
        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { paddingHorizontal: 12 },
  row: { flexDirection: 'row', marginBottom: 0 },
  placeholder: { flex: 1, margin: 4 },
});
