import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SummaryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>요약</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  title: { fontSize: 34, fontWeight: 'bold', padding: 16 },
});
