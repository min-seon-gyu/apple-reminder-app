import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { useListStore } from './src/stores/listStore';
import { useReminderStore } from './src/stores/reminderStore';
import { useTagStore } from './src/stores/tagStore';

export default function App() {
  const fetchLists = useListStore((s) => s.fetchLists);
  const fetchSmartListCounts = useReminderStore((s) => s.fetchSmartListCounts);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const init = async () => {
    setLoading(true);
    setError(false);
    try {
      await Promise.all([fetchLists(), fetchSmartListCounts(), fetchTags()]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>서버에 연결할 수 없습니다</Text>
        <TouchableOpacity style={styles.retryButton} onPress={init}>
          <Text style={styles.retryText}>재시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <BottomTabNavigator />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  errorText: { fontSize: 17, color: '#8E8E93', marginBottom: 16 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: '#007AFF' },
  retryText: { fontSize: 17, color: '#FFFFFF', fontWeight: '600' },
});
