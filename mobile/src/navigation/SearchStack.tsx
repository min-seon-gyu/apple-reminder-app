import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/SearchScreen';
import ReminderDetailScreen from '../screens/ReminderDetailScreen';

export type SearchStackParamList = {
  Search: undefined;
  ReminderDetail: {
    reminderId?: number;
    listId?: number;
    mode: 'create' | 'edit';
  };
};

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: '#F2F2F7' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReminderDetail"
        component={ReminderDetailScreen}
        options={{ title: '상세' }}
      />
    </Stack.Navigator>
  );
}
