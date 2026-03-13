import { View, Text, StyleSheet } from 'react-native';

export default function ReminderListScreen() {
  return (
    <View style={styles.container}>
      <Text>Reminder List</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
});
