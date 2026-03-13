import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import SearchStack from './SearchStack';
import ListFormModal from '../components/ListFormModal';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [showListModal, setShowListModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#F2F2F7', borderTopColor: '#C6C6C8' },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: '요약',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchStack}
          options={{
            tabBarLabel: '검색',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AddListTab"
          component={HomeStack}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowListModal(true);
            },
          }}
          options={{
            tabBarLabel: '목록 추가',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <ListFormModal
        visible={showListModal}
        onClose={() => setShowListModal(false)}
      />
    </>
  );
}
