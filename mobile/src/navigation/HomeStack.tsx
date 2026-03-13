import { createStackNavigator } from '@react-navigation/stack';
import SummaryScreen from '../screens/SummaryScreen';
import ReminderListScreen from '../screens/ReminderListScreen';
import ReminderDetailScreen from '../screens/ReminderDetailScreen';

export type HomeStackParamList = {
  Summary: undefined;
  ReminderList: {
    listId?: number;
    smartListType?: string;
    title: string;
    color?: string;
  };
  ReminderDetail: {
    reminderId?: number;
    listId?: number;
    mode: 'create' | 'edit';
  };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: '#F2F2F7' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReminderList"
        component={ReminderListScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="ReminderDetail"
        component={ReminderDetailScreen}
        options={{ title: '상세' }}
      />
    </Stack.Navigator>
  );
}
