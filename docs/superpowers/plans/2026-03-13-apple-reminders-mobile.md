# Apple Reminders Mobile App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** iOS Apple Reminders 네이티브 앱 UI를 재현한 React Native Expo 모바일 앱. 기존 Spring Boot 백엔드를 웹과 공유.

**Architecture:** `mobile/` 디렉토리에 Expo 프로젝트 생성. 웹의 types, api, stores를 복사하여 재사용. UI 컴포넌트와 화면만 React Native로 새로 작성. React Navigation(Bottom Tabs + Stack)으로 네비게이션 구성.

**Tech Stack:** React Native (Expo SDK 52), TypeScript, Zustand, React Navigation 7, react-native-reanimated, react-native-gesture-handler, @expo/vector-icons, react-native-toast-message, @react-native-community/datetimepicker

---

## Chunk 1: Foundation — Project Setup, Shared Code, Constants, Navigation

### Task 1: Expo 프로젝트 초기화 및 설정 파일

**Files:**
- Create: `mobile/package.json`
- Create: `mobile/tsconfig.json`
- Create: `mobile/babel.config.js`
- Create: `mobile/app.json`
- Create: `mobile/App.tsx` (placeholder)

- [ ] **Step 1: Expo 프로젝트 생성**

```bash
cd /Users/seongyumin/Documents/company/example
npx create-expo-app@latest mobile --template blank-typescript
```

- [ ] **Step 2: 의존성 설치**

```bash
cd mobile
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens @react-native-community/datetimepicker
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack zustand react-native-toast-message
```

- [ ] **Step 3: babel.config.js 수정 — reanimated 플러그인 추가**

`mobile/babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 4: app.json 설정**

`mobile/app.json`:
```json
{
  "expo": {
    "name": "Apple Reminders",
    "slug": "apple-reminders-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.example.reminders.mobile"
    },
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#F2F2F7"
    }
  }
}
```

- [ ] **Step 5: App.tsx placeholder 작성**

`mobile/App.tsx`:
```typescript
import 'react-native-gesture-handler';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Apple Reminders Mobile</Text>
    </View>
  );
}
```

- [ ] **Step 6: 앱 실행 확인**

```bash
cd mobile
npx expo start
```

Expected: Expo Go에서 "Apple Reminders Mobile" 텍스트가 화면 중앙에 표시

- [ ] **Step 7: 커밋**

```bash
git add mobile/
git commit -m "feat: initialize Expo project with dependencies"
```

---

### Task 2: Backend CORS 설정 추가

**Files:**
- Create: `backend/src/main/java/com/example/reminders/config/CorsConfig.java`

- [ ] **Step 1: CorsConfig.java 생성**

`backend/src/main/java/com/example/reminders/config/CorsConfig.java`:
```java
package com.example.reminders.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .allowedHeaders("*");
    }
}
```

- [ ] **Step 2: 백엔드 재시작하여 확인**

```bash
cd backend
./gradlew bootRun
```

Expected: 정상 기동, 기존 API 정상 동작

- [ ] **Step 3: 커밋**

```bash
git add backend/src/main/java/com/example/reminders/config/CorsConfig.java
git commit -m "feat: add CORS configuration for mobile API access"
```

---

### Task 3: 공유 코드 복사 (types, api, stores) + 모바일 uiStore

**Files:**
- Create: `mobile/src/types/index.ts` (웹에서 복사)
- Create: `mobile/src/api/client.ts` (웹에서 복사, BASE_URL 변경)
- Create: `mobile/src/api/reminderApi.ts` (웹에서 복사)
- Create: `mobile/src/api/listApi.ts` (웹에서 복사)
- Create: `mobile/src/api/tagApi.ts` (웹에서 복사)
- Create: `mobile/src/stores/reminderStore.ts` (웹에서 복사)
- Create: `mobile/src/stores/listStore.ts` (웹에서 복사)
- Create: `mobile/src/stores/tagStore.ts` (웹에서 복사)
- Create: `mobile/src/stores/uiStore.ts` (새로 작성)

- [ ] **Step 1: 디렉토리 생성 및 types 복사**

```bash
cd /Users/seongyumin/Documents/company/example
mkdir -p mobile/src/{types,api,stores,screens,components,navigation,constants}
cp frontend/src/types/index.ts mobile/src/types/index.ts
```

- [ ] **Step 2: API 레이어 복사 및 client.ts BASE_URL 변경**

```bash
cp frontend/src/api/reminderApi.ts mobile/src/api/reminderApi.ts
cp frontend/src/api/listApi.ts mobile/src/api/listApi.ts
cp frontend/src/api/tagApi.ts mobile/src/api/tagApi.ts
```

`mobile/src/api/client.ts` (새로 작성 — BASE_URL만 다름):
```typescript
const BASE_URL = 'http://localhost:8080';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: unknown) => request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
```

> **참고:** 개발 시 실제 로컬 IP로 변경 필요 (예: `http://192.168.0.x:8080`). Expo Go의 iOS 시뮬레이터에서는 `localhost`로 접근 가능.

- [ ] **Step 3: Stores 복사 (reminderStore, listStore, tagStore)**

```bash
cp frontend/src/stores/reminderStore.ts mobile/src/stores/reminderStore.ts
cp frontend/src/stores/listStore.ts mobile/src/stores/listStore.ts
cp frontend/src/stores/tagStore.ts mobile/src/stores/tagStore.ts
```

이 파일들은 수정 없이 그대로 사용한다. Zustand과 fetch API는 React Native에서 동일하게 동작한다.

- [ ] **Step 4: 모바일 uiStore 작성**

`mobile/src/stores/uiStore.ts`:
```typescript
import { create } from 'zustand';
import Toast from 'react-native-toast-message';

interface UiState {
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToast: (message: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  isSearching: false,
  setSearchQuery: (query) => set({ searchQuery: query, isSearching: query.length > 0 }),
  setIsSearching: (isSearching) => set({ isSearching }),
  addToast: (message) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
}));
```

- [ ] **Step 5: TypeScript 컴파일 확인**

```bash
cd mobile
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add mobile/src/
git commit -m "feat: copy shared code (types, api, stores) and create mobile uiStore"
```

---

### Task 4: 상수 정의 (Colors, Icons)

**Files:**
- Create: `mobile/src/constants/colors.ts`
- Create: `mobile/src/constants/icons.ts`

- [ ] **Step 1: colors.ts 작성**

`mobile/src/constants/colors.ts`:
```typescript
import type { ListColor, SmartListType } from '../types';

export const LIST_COLORS: Record<ListColor, string> = {
  red: '#FF3B30',
  orange: '#FF9500',
  yellow: '#FFCC00',
  green: '#34C759',
  cyan: '#5AC8FA',
  blue: '#007AFF',
  purple: '#AF52DE',
  pink: '#FF2D55',
  brown: '#A2845E',
  gray: '#8E8E93',
  indigo: '#5856D6',
  teal: '#64D2A0',
};

export const SMART_LIST_COLORS: Record<SmartListType, string> = {
  today: '#007AFF',
  scheduled: '#FF3B30',
  all: '#8E8E93',
  flagged: '#FF9500',
  completed: '#8E8E93',
};

export const SMART_LIST_LABELS: Record<SmartListType, string> = {
  today: '오늘',
  scheduled: '예정',
  all: '전체',
  flagged: '플래그 지정됨',
  completed: '완료됨',
};

export const IOS_COLORS = {
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  separator: '#C6C6C8',
  label: '#000000',
  secondaryLabel: '#3C3C43',
  tertiaryLabel: '#8E8E93',
  systemBlue: '#007AFF',
  destructiveRed: '#FF3B30',
};
```

- [ ] **Step 2: icons.ts 작성**

`mobile/src/constants/icons.ts`:
```typescript
import type { ListIcon, SmartListType } from '../types';

export const LIST_ICONS: Record<ListIcon, string> = {
  list: 'list-outline',
  bookmark: 'bookmark-outline',
  pin: 'pin-outline',
  gift: 'gift-outline',
  birthday: 'happy-outline',
  work: 'briefcase-outline',
  school: 'school-outline',
  home: 'home-outline',
  shopping: 'cart-outline',
  health: 'heart-outline',
  travel: 'airplane-outline',
  finance: 'card-outline',
};

export const SMART_LIST_ICONS: Record<SmartListType, string> = {
  today: 'calendar-number-outline',
  scheduled: 'calendar-outline',
  all: 'file-tray-full-outline',
  flagged: 'flag',
  completed: 'checkmark-circle',
};
```

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/constants/
git commit -m "feat: add color and icon constant mappings"
```

---

### Task 5: Navigation 설정

**Files:**
- Create: `mobile/src/navigation/HomeStack.tsx`
- Create: `mobile/src/navigation/SearchStack.tsx`
- Create: `mobile/src/navigation/BottomTabNavigator.tsx`
- Modify: `mobile/App.tsx`

- [ ] **Step 1: HomeStack.tsx 작성**

`mobile/src/navigation/HomeStack.tsx`:
```typescript
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
        headerBackTitleVisible: false,
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
```

- [ ] **Step 2: SearchStack.tsx 작성**

`mobile/src/navigation/SearchStack.tsx`:
```typescript
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
```

- [ ] **Step 3: BottomTabNavigator.tsx 작성**

`mobile/src/navigation/BottomTabNavigator.tsx`:
```typescript
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
```

- [ ] **Step 4: placeholder 화면 생성**

각 화면의 placeholder를 생성한다. 이후 태스크에서 실제 구현으로 대체.

`mobile/src/screens/SummaryScreen.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
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
```

`mobile/src/screens/ReminderListScreen.tsx`:
```typescript
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
```

`mobile/src/screens/ReminderDetailScreen.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';

export default function ReminderDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>Reminder Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
});
```

`mobile/src/screens/SearchScreen.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>검색</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  title: { fontSize: 34, fontWeight: 'bold', padding: 16 },
});
```

`mobile/src/components/ListFormModal.tsx` (placeholder):
```typescript
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReminderList } from '../types';

interface ListFormModalProps {
  visible: boolean;
  onClose: () => void;
  initialList?: ReminderList;
}

export default function ListFormModal({ visible, onClose }: ListFormModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text>목록 추가 (구현 예정)</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '80%', alignItems: 'center' },
  close: { color: '#007AFF', marginTop: 16, fontSize: 17 },
});
```

- [ ] **Step 5: App.tsx 업데이트 — Navigation 통합**

`mobile/App.tsx`:
```typescript
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
```

- [ ] **Step 6: 앱 실행 확인 — 탭 네비게이션 동작 확인**

```bash
cd mobile
npx expo start
```

Expected: 하단에 "요약", "검색", "목록 추가" 탭 3개 표시. 각 탭 전환 동작. "목록 추가" 탭은 모달 표시.

- [ ] **Step 7: 커밋**

```bash
git add mobile/
git commit -m "feat: add navigation structure with placeholder screens"
```

---

## Chunk 2: Summary Screen — Smart List Grid, User List, List Form Modal

### Task 6: SmartListCard + SmartListGrid 컴포넌트

**Files:**
- Create: `mobile/src/components/SmartListCard.tsx`
- Create: `mobile/src/components/SmartListGrid.tsx`

- [ ] **Step 1: SmartListCard.tsx 작성**

`mobile/src/components/SmartListCard.tsx`:
```typescript
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
```

- [ ] **Step 2: SmartListGrid.tsx 작성**

`mobile/src/components/SmartListGrid.tsx`:
```typescript
import { View, StyleSheet } from 'react-native';
import SmartListCard from './SmartListCard';
import type { SmartListCounts, SmartListType } from '../types';

interface SmartListGridProps {
  counts: SmartListCounts;
  onPress: (type: SmartListType) => void;
}

const SMART_LIST_TYPES: SmartListType[] = ['today', 'scheduled', 'all', 'flagged', 'completed'];

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
```

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/components/SmartListCard.tsx mobile/src/components/SmartListGrid.tsx
git commit -m "feat: add SmartListCard and SmartListGrid components"
```

---

### Task 7: UserListRow 컴포넌트

**Files:**
- Create: `mobile/src/components/UserListRow.tsx`

- [ ] **Step 1: UserListRow.tsx 작성**

`mobile/src/components/UserListRow.tsx`:
```typescript
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
```

- [ ] **Step 2: 커밋**

```bash
git add mobile/src/components/UserListRow.tsx
git commit -m "feat: add UserListRow component with long-press context menu"
```

---

### Task 8: SummaryScreen 구현

**Files:**
- Modify: `mobile/src/screens/SummaryScreen.tsx`

- [ ] **Step 1: SummaryScreen.tsx 전체 구현**

`mobile/src/screens/SummaryScreen.tsx`:
```typescript
import { useCallback, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import SmartListGrid from '../components/SmartListGrid';
import UserListRow from '../components/UserListRow';
import ListFormModal from '../components/ListFormModal';
import { useReminderStore } from '../stores/reminderStore';
import { useListStore } from '../stores/listStore';
import { SMART_LIST_LABELS } from '../constants/colors';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { SmartListType, ReminderList } from '../types';

type Nav = StackNavigationProp<HomeStackParamList, 'Summary'>;

export default function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const smartListCounts = useReminderStore((s) => s.smartListCounts);
  const fetchSmartListCounts = useReminderStore((s) => s.fetchSmartListCounts);
  const lists = useListStore((s) => s.lists);
  const fetchLists = useListStore((s) => s.fetchLists);
  const deleteList = useListStore((s) => s.deleteList);
  const [refreshing, setRefreshing] = useState(false);
  const [editingList, setEditingList] = useState<ReminderList | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchSmartListCounts();
      fetchLists();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSmartListCounts(), fetchLists()]);
    setRefreshing(false);
  };

  const handleSmartListPress = (type: SmartListType) => {
    navigation.navigate('ReminderList', {
      smartListType: type,
      title: SMART_LIST_LABELS[type],
    });
  };

  const handleListPress = (list: ReminderList) => {
    navigation.navigate('ReminderList', {
      listId: list.id,
      title: list.name,
      color: list.color,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.headerTitle}>요약</Text>
        <SmartListGrid counts={smartListCounts} onPress={handleSmartListPress} />

        <Text style={styles.sectionTitle}>나의 목록</Text>
        <View style={styles.listSection}>
          {lists.map((list, index) => (
            <View key={list.id}>
              {index > 0 && <View style={styles.separator} />}
              <UserListRow
                list={list}
                onPress={() => handleListPress(list)}
                onEdit={() => setEditingList(list)}
                onDelete={() => {
                  Alert.alert('삭제', `"${list.name}" 목록을 삭제하시겠습니까?\n포함된 모든 리마인더도 삭제됩니다.`, [
                    { text: '취소', style: 'cancel' },
                    { text: '삭제', style: 'destructive', onPress: () => deleteList(list.id) },
                  ]);
                }}
              />
            </View>
          ))}
          {lists.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>목록 없음</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ListFormModal
        visible={editingList !== null}
        onClose={() => setEditingList(null)}
        initialList={editingList ?? undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerTitle: { fontSize: 34, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  listSection: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 60 },
  emptyRow: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#8E8E93' },
});
```

- [ ] **Step 2: 앱에서 SummaryScreen 확인**

Expected: 스마트 리스트 그리드 카드 5개 표시 (카운트 포함). "나의 목록" 섹션에 리스트 행 표시. Pull to refresh 동작.

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/screens/SummaryScreen.tsx
git commit -m "feat: implement SummaryScreen with smart list grid and user lists"
```

---

### Task 9: ListFormModal + ColorPicker + IconPicker 완성

**Files:**
- Create: `mobile/src/components/ColorPicker.tsx`
- Create: `mobile/src/components/IconPicker.tsx`
- Modify: `mobile/src/components/ListFormModal.tsx`

- [ ] **Step 1: ColorPicker.tsx 작성**

`mobile/src/components/ColorPicker.tsx`:
```typescript
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_COLORS } from '../constants/colors';
import type { ListColor } from '../types';

interface ColorPickerProps {
  selected: ListColor;
  onSelect: (color: ListColor) => void;
}

const COLORS = Object.keys(LIST_COLORS) as ListColor[];

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[styles.circle, { backgroundColor: LIST_COLORS[color] }]}
          onPress={() => onSelect(color)}
        >
          {selected === color && (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

- [ ] **Step 2: IconPicker.tsx 작성**

`mobile/src/components/IconPicker.tsx`:
```typescript
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_ICONS } from '../constants/icons';
import type { ListIcon } from '../types';

interface IconPickerProps {
  selected: ListIcon;
  onSelect: (icon: ListIcon) => void;
  color: string;
}

const ICONS = Object.keys(LIST_ICONS) as ListIcon[];

export default function IconPicker({ selected, onSelect, color }: IconPickerProps) {
  return (
    <View style={styles.grid}>
      {ICONS.map((icon) => (
        <TouchableOpacity
          key={icon}
          style={[
            styles.item,
            selected === icon && { backgroundColor: color },
          ]}
          onPress={() => onSelect(icon)}
        >
          <Ionicons
            name={LIST_ICONS[icon] as any}
            size={24}
            color={selected === icon ? '#FFFFFF' : '#8E8E93'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  item: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});
```

- [ ] **Step 3: ListFormModal.tsx 완성**

`mobile/src/components/ListFormModal.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ColorPicker from './ColorPicker';
import IconPicker from './IconPicker';
import { useListStore } from '../stores/listStore';
import { LIST_COLORS } from '../constants/colors';
import { LIST_ICONS } from '../constants/icons';
import type { ReminderList, ListColor, ListIcon } from '../types';

interface ListFormModalProps {
  visible: boolean;
  onClose: () => void;
  initialList?: ReminderList;
}

export default function ListFormModal({ visible, onClose, initialList }: ListFormModalProps) {
  const { createList, updateList } = useListStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<ListColor>('blue');
  const [icon, setIcon] = useState<ListIcon>('list');

  const isEdit = !!initialList;

  useEffect(() => {
    if (initialList) {
      setName(initialList.name);
      setColor(initialList.color);
      setIcon(initialList.icon);
    } else {
      setName('');
      setColor('blue');
      setIcon('list');
    }
  }, [initialList, visible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (isEdit && initialList) {
      await updateList(initialList.id, { name: name.trim(), color, icon });
    } else {
      await createList({ name: name.trim(), color, icon });
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEdit ? '목록 편집' : '새로운 목록'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
              <Text style={[styles.saveText, !name.trim() && styles.disabledText]}>
                {isEdit ? '저장' : '생성'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.previewCircle, { backgroundColor: LIST_COLORS[color] }]}>
            <Ionicons name={LIST_ICONS[icon] as any} size={36} color="#FFFFFF" />
          </View>

          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="목록 이름"
            placeholderTextColor="#8E8E93"
            maxLength={50}
          />

          <Text style={styles.sectionLabel}>색상</Text>
          <ColorPicker selected={color} onSelect={setColor} />

          <Text style={styles.sectionLabel}>아이콘</Text>
          <IconPicker selected={icon} onSelect={setIcon} color={LIST_COLORS[color]} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  cancelText: { fontSize: 17, color: '#007AFF' },
  saveText: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  disabledText: { color: '#C7C7CC' },
  previewCircle: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nameInput: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, fontSize: 17, textAlign: 'center', marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginTop: 12 },
});
```

- [ ] **Step 4: 앱에서 확인**

Expected: "목록 추가" 탭 → 모달 표시 → 이름 입력, 색상/아이콘 선택 후 생성. 리스트 롱프레스 → 편집 → 기존 값 사전 입력.

- [ ] **Step 5: 커밋**

```bash
git add mobile/src/components/ColorPicker.tsx mobile/src/components/IconPicker.tsx mobile/src/components/ListFormModal.tsx
git commit -m "feat: implement ListFormModal with ColorPicker and IconPicker"
```

---

## Chunk 3: Reminder List Screen — Swipe Actions, Reminder Row, List Screen

### Task 10: SwipeActions + ReminderRow + SubtaskRow

**Files:**
- Create: `mobile/src/components/SwipeActions.tsx`
- Create: `mobile/src/components/ReminderRow.tsx`
- Create: `mobile/src/components/SubtaskRow.tsx`

- [ ] **Step 1: SwipeActions.tsx 작성**

`mobile/src/components/SwipeActions.tsx`:
```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
```

- [ ] **Step 2: ReminderRow.tsx 작성**

`mobile/src/components/ReminderRow.tsx`:
```typescript
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import SwipeActions from './SwipeActions';
import SubtaskRow from './SubtaskRow';
import type { Reminder, Priority } from '../types';

interface ReminderRowProps {
  reminder: Reminder;
  color: string;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onToggleFlag: () => void;
  onSubtaskPress: (subtask: Reminder) => void;
  onSubtaskToggle: (id: number) => void;
}

function priorityText(p: Priority): string | null {
  if (p === 'LOW') return '!';
  if (p === 'MEDIUM') return '!!';
  if (p === 'HIGH') return '!!!';
  return null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === -1) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function ReminderRow({
  reminder, color, onPress, onToggleComplete, onDelete, onToggleFlag, onSubtaskPress, onSubtaskToggle,
}: ReminderRowProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleToggle = () => {
    if (!reminder.isCompleted) {
      opacity.value = withTiming(0.3, { duration: 800 }, () => {
        runOnJS(onToggleComplete)();
      });
    } else {
      onToggleComplete();
    }
  };

  const pText = priorityText(reminder.priority);

  return (
    <SwipeActions onDelete={onDelete} onFlag={onToggleFlag} isFlagged={reminder.isFlagged}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
          <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggle}>
            <View
              style={[
                styles.checkbox,
                { borderColor: color },
                reminder.isCompleted && { backgroundColor: color },
              ]}
            >
              {reminder.isCompleted && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <Text
              style={[styles.title, reminder.isCompleted && styles.titleCompleted]}
              numberOfLines={1}
            >
              {reminder.title}
            </Text>
            {(reminder.dueDate || pText || reminder.isFlagged || reminder.tags.length > 0) && (
              <View style={styles.meta}>
                {reminder.dueDate && <Text style={styles.metaText}>{formatDate(reminder.dueDate)}</Text>}
                {pText && <Text style={[styles.metaText, { color: '#FF9500' }]}>{pText}</Text>}
                {reminder.isFlagged && <Text style={styles.metaText}>🚩</Text>}
                {reminder.tags.map((tag) => (
                  <Text key={tag.id} style={styles.tagText}>#{tag.name}</Text>
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>

        {reminder.subtasks?.map((subtask) => (
          <SubtaskRow
            key={subtask.id}
            subtask={subtask}
            color={color}
            onPress={() => onSubtaskPress(subtask)}
            onToggle={() => onSubtaskToggle(subtask.id)}
          />
        ))}
      </Animated.View>
    </SwipeActions>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: { paddingRight: 12, paddingTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 17, color: '#000' },
  titleCompleted: { textDecorationLine: 'line-through', color: '#8E8E93' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  metaText: { fontSize: 13, color: '#8E8E93' },
  tagText: { fontSize: 13, color: '#007AFF' },
});
```

- [ ] **Step 3: SubtaskRow.tsx 작성**

`mobile/src/components/SubtaskRow.tsx`:
```typescript
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Reminder } from '../types';

interface SubtaskRowProps {
  subtask: Reminder;
  color: string;
  onPress: () => void;
  onToggle: () => void;
}

export default function SubtaskRow({ subtask, color, onPress, onToggle }: SubtaskRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        <View
          style={[
            styles.checkbox,
            { borderColor: color },
            subtask.isCompleted && { backgroundColor: color },
          ]}
        >
          {subtask.isCompleted && (
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
      <Text
        style={[styles.title, subtask.isCompleted && styles.titleCompleted]}
        numberOfLines={1}
      >
        {subtask.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 50,
    paddingRight: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: { paddingRight: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 15, color: '#000', flex: 1 },
  titleCompleted: { textDecorationLine: 'line-through', color: '#8E8E93' },
});
```

- [ ] **Step 4: 커밋**

```bash
git add mobile/src/components/SwipeActions.tsx mobile/src/components/ReminderRow.tsx mobile/src/components/SubtaskRow.tsx
git commit -m "feat: add ReminderRow with swipe actions and SubtaskRow"
```

---

### Task 11: ReminderListScreen 구현

**Files:**
- Modify: `mobile/src/screens/ReminderListScreen.tsx`

- [ ] **Step 1: ReminderListScreen.tsx 전체 구현**

`mobile/src/screens/ReminderListScreen.tsx`:
```typescript
import { useCallback, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReminderRow from '../components/ReminderRow';
import { useReminderStore } from '../stores/reminderStore';
import { useListStore } from '../stores/listStore';
import { useUiStore } from '../stores/uiStore';
import { LIST_COLORS, SMART_LIST_COLORS } from '../constants/colors';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { Reminder, SmartListType } from '../types';

type Nav = StackNavigationProp<HomeStackParamList, 'ReminderList'>;
type Route = RouteProp<HomeStackParamList, 'ReminderList'>;

export default function ReminderListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listId, smartListType, title, color: colorKey } = route.params;

  const reminders = useReminderStore((s) => s.reminders);
  const fetchReminders = useReminderStore((s) => s.fetchReminders);
  const fetchSmartList = useReminderStore((s) => s.fetchSmartList);
  const toggleComplete = useReminderStore((s) => s.toggleComplete);
  const deleteReminder = useReminderStore((s) => s.deleteReminder);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const lists = useListStore((s) => s.lists);
  const addToast = useUiStore((s) => s.addToast);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const listColor = colorKey
    ? LIST_COLORS[colorKey as keyof typeof LIST_COLORS] || '#007AFF'
    : smartListType
    ? SMART_LIST_COLORS[smartListType as SmartListType]
    : '#007AFF';

  const isCompleted = smartListType === 'completed';

  const loadData = useCallback(async () => {
    try {
      if (smartListType) {
        await fetchSmartList(smartListType as SmartListType);
      } else if (listId) {
        await fetchReminders(listId, isCompleted);
      }
    } catch {
      addToast('데이터를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, [smartListType, listId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const topLevelReminders = reminders.filter((r) => r.parentId === null);

  const handleToggleFlag = async (reminder: Reminder) => {
    await updateReminder(reminder.id, {
      listId: reminder.listId,
      title: reminder.title,
      notes: reminder.notes,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      priority: reminder.priority,
      isFlagged: !reminder.isFlagged,
      tagIds: reminder.tags.map((t) => t.id),
    });
    await loadData();
  };

  const handleDelete = async (id: number) => {
    await deleteReminder(id);
    await loadData();
  };

  const handleNewReminder = () => {
    const targetListId = listId ?? lists[0]?.id;
    if (!targetListId) return;
    navigation.navigate('ReminderDetail', { listId: targetListId, mode: 'create' });
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderRow
      reminder={item}
      color={listColor}
      onPress={() => navigation.navigate('ReminderDetail', { reminderId: item.id, mode: 'edit' })}
      onToggleComplete={() => toggleComplete(item.id)}
      onDelete={() => handleDelete(item.id)}
      onToggleFlag={() => handleToggleFlag(item)}
      onSubtaskPress={(sub) => navigation.navigate('ReminderDetail', { reminderId: sub.id, mode: 'edit' })}
      onSubtaskToggle={(id) => toggleComplete(id)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={listColor} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: listColor }]}>{title}</Text>
        <Text style={[styles.count, { color: listColor }]}>{topLevelReminders.length}</Text>
      </View>

      <FlatList
        data={topLevelReminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.list}
        contentContainerStyle={topLevelReminders.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>리마인더 없음</Text>
          </View>
        }
      />

      {!isCompleted && (
        <TouchableOpacity style={styles.addButton} onPress={handleNewReminder}>
          <Ionicons name="add-circle-outline" size={22} color={listColor} />
          <Text style={[styles.addText, { color: listColor }]}>새 리마인더</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 34, fontWeight: 'bold' },
  count: { fontSize: 34, fontWeight: 'bold' },
  list: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 50 },
  addButton: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 6 },
  addText: { fontSize: 17, fontWeight: '600' },
  emptyContainer: { flex: 1 },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 17, color: '#8E8E93' },
});
```

- [ ] **Step 2: 앱에서 확인**

Expected: SummaryScreen에서 리스트/스마트 리스트 탭 → ReminderListScreen 표시. 리마인더 목록, 서브태스크, 스와이프 동작 확인. Pull to refresh 동작.

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/screens/ReminderListScreen.tsx
git commit -m "feat: implement ReminderListScreen with swipe actions"
```

---

## Chunk 4: Detail Screen, Search, Final Integration

### Task 12: PriorityPicker + TagSelector

**Files:**
- Create: `mobile/src/components/PriorityPicker.tsx`
- Create: `mobile/src/components/TagSelector.tsx`

- [ ] **Step 1: PriorityPicker.tsx 작성**

`mobile/src/components/PriorityPicker.tsx`:
```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Priority } from '../types';

interface PriorityPickerProps {
  selected: Priority;
  onSelect: (priority: Priority) => void;
}

const OPTIONS: { value: Priority; label: string }[] = [
  { value: 'NONE', label: '없음' },
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '중간' },
  { value: 'HIGH', label: '높음' },
];

export default function PriorityPicker({ selected, onSelect }: PriorityPickerProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, selected === opt.value && styles.optionSelected]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[styles.label, selected === opt.value && styles.labelSelected]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  optionSelected: { backgroundColor: '#007AFF' },
  label: { fontSize: 15, color: '#000' },
  labelSelected: { color: '#FFFFFF', fontWeight: '600' },
});
```

- [ ] **Step 2: TagSelector.tsx 작성**

`mobile/src/components/TagSelector.tsx`:
```typescript
import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useTagStore } from '../stores/tagStore';

interface TagSelectorProps {
  selectedTagIds: number[];
  onToggle: (tagId: number) => void;
  onCreateAndSelect: (tagId: number) => void;
}

export default function TagSelector({ selectedTagIds, onToggle, onCreateAndSelect }: TagSelectorProps) {
  const { tags, createTag } = useTagStore();
  const [newTagName, setNewTagName] = useState('');

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    onCreateAndSelect(tag.id);
    setNewTagName('');
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => onToggle(tag.id)}
            >
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder="새 태그"
          placeholderTextColor="#8E8E93"
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleCreate} disabled={!newTagName.trim()}>
          <Text style={[styles.addText, !newTagName.trim() && styles.addTextDisabled]}>추가</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  tagSelected: { backgroundColor: '#007AFF' },
  tagText: { fontSize: 15, color: '#000' },
  tagTextSelected: { color: '#FFFFFF' },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 8, padding: 10, fontSize: 15 },
  addText: { fontSize: 15, color: '#007AFF', fontWeight: '600' },
  addTextDisabled: { color: '#C7C7CC' },
});
```

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/components/PriorityPicker.tsx mobile/src/components/TagSelector.tsx
git commit -m "feat: add PriorityPicker and TagSelector components"
```

---

### Task 13: ReminderDetailScreen 구현

**Files:**
- Modify: `mobile/src/screens/ReminderDetailScreen.tsx`

- [ ] **Step 1: ReminderDetailScreen.tsx 전체 구현**

`mobile/src/screens/ReminderDetailScreen.tsx`:
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import PriorityPicker from '../components/PriorityPicker';
import TagSelector from '../components/TagSelector';
import SubtaskRow from '../components/SubtaskRow';
import { useReminderStore } from '../stores/reminderStore';
import type { HomeStackParamList } from '../navigation/HomeStack';
import type { Priority, Reminder } from '../types';

type Route = RouteProp<HomeStackParamList, 'ReminderDetail'>;

export default function ReminderDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { reminderId, listId, mode } = route.params;

  const { createReminder, updateReminder, deleteReminder, toggleComplete } = useReminderStore();
  const reminders = useReminderStore((s) => s.reminders);

  const isCreate = mode === 'create';
  const reminder = reminders.flatMap((r) => [r, ...(r.subtasks ?? [])]).find((r) => r.id === reminderId);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('NONE');
  const [isFlagged, setIsFlagged] = useState(false);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const savedRef = useRef(false);
  const buildRequestRef = useRef<() => any>(() => ({}));

  useEffect(() => {
    if (reminder && !isCreate) {
      setTitle(reminder.title);
      setNotes(reminder.notes ?? '');
      setDueDate(reminder.dueDate ? new Date(reminder.dueDate) : null);
      setDueTime(reminder.dueTime ? new Date(`2000-01-01T${reminder.dueTime}`) : null);
      setPriority(reminder.priority);
      setIsFlagged(reminder.isFlagged);
      setTagIds(reminder.tags.map((t) => t.id));
    }
  }, [reminder?.id]);

  const buildRequest = () => ({
    listId: reminder?.listId ?? listId!,
    title: title.trim(),
    notes: notes.trim() || null,
    dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
    dueTime: dueTime && dueDate
      ? `${String(dueTime.getHours()).padStart(2, '0')}:${String(dueTime.getMinutes()).padStart(2, '0')}:00`
      : null,
    priority,
    isFlagged,
    tagIds,
  });

  // Keep ref updated with latest buildRequest on every render
  useEffect(() => {
    buildRequestRef.current = buildRequest;
  });

  useEffect(() => {
    if (isCreate) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              const req = buildRequestRef.current();
              if (!req.title?.trim()) return;
              savedRef.current = true;
              await createReminder(req);
              navigation.goBack();
            }}
            style={{ marginRight: 16 }}
          >
            <Text style={{ color: '#007AFF', fontSize: 17, fontWeight: '600' }}>추가</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isCreate]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    savedRef.current = true;
    await createReminder(buildRequest());
    navigation.goBack();
  };

  const handleSave = useCallback(async () => {
    if (isCreate || !reminder || savedRef.current) return;
    if (!title.trim()) return;
    savedRef.current = true;
    await updateReminder(reminder.id, buildRequest());
  }, [title, notes, dueDate, dueTime, priority, isFlagged, tagIds, reminder]);

  useEffect(() => {
    if (!isCreate) {
      const unsubscribe = navigation.addListener('beforeRemove', () => {
        handleSave();
      });
      return unsubscribe;
    }
  }, [navigation, handleSave, isCreate]);

  const handleDelete = () => {
    Alert.alert('삭제', '이 리마인더를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          savedRef.current = true;
          await deleteReminder(reminderId!);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim() || !reminder) return;
    await createReminder({
      listId: reminder.listId,
      parentId: reminder.id,
      title: subtaskTitle.trim(),
    });
    setSubtaskTitle('');
  };

  const handleTagToggle = (tagId: number) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목"
            placeholderTextColor="#8E8E93"
            maxLength={255}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="메모"
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={2000}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(!showDatePicker)}>
            <Ionicons name="calendar-outline" size={22} color="#007AFF" />
            <Text style={styles.fieldLabel}>날짜</Text>
            <Text style={styles.fieldValue}>
              {dueDate ? `${dueDate.getMonth() + 1}월 ${dueDate.getDate()}일` : '없음'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="inline"
              onChange={(_, date) => {
                if (date) setDueDate(date);
                else { setDueDate(null); setDueTime(null); }
              }}
            />
          )}
          {dueDate && (
            <>
              <TouchableOpacity style={styles.fieldRow} onPress={() => setShowTimePicker(!showTimePicker)}>
                <Ionicons name="time-outline" size={22} color="#007AFF" />
                <Text style={styles.fieldLabel}>시간</Text>
                <Text style={styles.fieldValue}>
                  {dueTime
                    ? `${String(dueTime.getHours()).padStart(2, '0')}:${String(dueTime.getMinutes()).padStart(2, '0')}`
                    : '없음'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={dueTime ?? new Date()}
                  mode="time"
                  display="spinner"
                  onChange={(_, time) => { if (time) setDueTime(time); }}
                />
              )}
            </>
          )}
          {dueDate && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setDueDate(null); setDueTime(null); setShowDatePicker(false); setShowTimePicker(false); }}
            >
              <Text style={styles.clearText}>날짜 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>우선순위</Text>
          <PriorityPicker selected={priority} onSelect={setPriority} />
        </View>

        {/* Flag */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.fieldRow} onPress={() => setIsFlagged(!isFlagged)}>
            <Ionicons name={isFlagged ? 'flag' : 'flag-outline'} size={22} color="#FF9500" />
            <Text style={styles.fieldLabel}>플래그</Text>
            <View style={[styles.toggle, isFlagged && styles.toggleActive]} />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <TagSelector
            selectedTagIds={tagIds}
            onToggle={handleTagToggle}
            onCreateAndSelect={(id) => setTagIds((prev) => [...prev, id])}
          />
        </View>

        {/* Subtasks (edit mode only) */}
        {!isCreate && reminder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>하위 항목</Text>
            {reminder.subtasks?.map((sub) => (
              <SubtaskRow
                key={sub.id}
                subtask={sub}
                color="#007AFF"
                onPress={() => {}}
                onToggle={() => toggleComplete(sub.id)}
              />
            ))}
            <View style={styles.subtaskInput}>
              <TextInput
                style={styles.subtaskTextInput}
                value={subtaskTitle}
                onChangeText={setSubtaskTitle}
                placeholder="하위 항목 추가"
                placeholderTextColor="#8E8E93"
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
              />
            </View>
          </View>
        )}

        {/* Delete button (edit mode only) */}
        {!isCreate && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>리마인더 삭제</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { padding: 16 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#8E8E93', marginBottom: 8 },
  titleInput: { fontSize: 17, color: '#000', padding: 0 },
  notesInput: { fontSize: 15, color: '#000', minHeight: 60, padding: 0, textAlignVertical: 'top' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldLabel: { flex: 1, fontSize: 17, color: '#000' },
  fieldValue: { fontSize: 17, color: '#8E8E93' },
  clearButton: { marginTop: 8, alignItems: 'center' },
  clearText: { color: '#FF3B30', fontSize: 15 },
  toggle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C7C7CC' },
  toggleActive: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  subtaskInput: { paddingTop: 8 },
  subtaskTextInput: { fontSize: 15, color: '#000', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', paddingVertical: 8 },
  deleteButton: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  deleteText: { color: '#FF3B30', fontSize: 17 },
});
```

- [ ] **Step 2: 앱에서 확인**

Expected:
- 리마인더 행 탭 → ReminderDetailScreen(편집 모드): 필드 사전 입력, 뒤로 가기 시 자동 저장
- "새 리마인더" 버튼 → ReminderDetailScreen(생성 모드): 헤더에 "추가" 버튼, 뒤로 가기 시 폐기
- 날짜/시간 피커, 우선순위, 플래그, 태그, 서브태스크 동작 확인

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/screens/ReminderDetailScreen.tsx
git commit -m "feat: implement ReminderDetailScreen with create/edit modes"
```

---

### Task 14: SearchScreen 구현

**Files:**
- Modify: `mobile/src/screens/SearchScreen.tsx`

- [ ] **Step 1: SearchScreen.tsx 전체 구현**

`mobile/src/screens/SearchScreen.tsx`:
```typescript
import { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import ReminderRow from '../components/ReminderRow';
import { useReminderStore } from '../stores/reminderStore';
import { useUiStore } from '../stores/uiStore';
import type { SearchStackParamList } from '../navigation/SearchStack';
import type { Reminder } from '../types';

type Nav = StackNavigationProp<SearchStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { searchReminders, toggleComplete, deleteReminder, updateReminder } = useReminderStore();
  const reminders = useReminderStore((s) => s.reminders);
  const addToast = useUiStore((s) => s.addToast);
  const [query, setQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await searchReminders(text);
      } catch {
        addToast('검색에 실패했습니다');
      }
    }, 300);
  }, []);

  const handleToggleFlag = async (reminder: Reminder) => {
    await updateReminder(reminder.id, {
      listId: reminder.listId,
      title: reminder.title,
      notes: reminder.notes,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      priority: reminder.priority,
      isFlagged: !reminder.isFlagged,
      tagIds: reminder.tags.map((t) => t.id),
    });
    searchReminders(query);
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderRow
      reminder={item}
      color="#007AFF"
      onPress={() => navigation.navigate('ReminderDetail', { reminderId: item.id, mode: 'edit' })}
      onToggleComplete={() => toggleComplete(item.id)}
      onDelete={() => deleteReminder(item.id)}
      onToggleFlag={() => handleToggleFlag(item)}
      onSubtaskPress={(sub) => navigation.navigate('ReminderDetail', { reminderId: sub.id, mode: 'edit' })}
      onSubtaskToggle={(id) => toggleComplete(id)}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>검색</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder="검색"
          placeholderTextColor="#8E8E93"
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={reminders.length === 0 && query ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          query ? (
            <View style={styles.emptyView}>
              <Text style={styles.emptyText}>결과 없음</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  headerTitle: { fontSize: 34, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchInput: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    color: '#000',
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 50 },
  emptyContainer: { flex: 1 },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 17, color: '#8E8E93' },
});
```

- [ ] **Step 2: 앱에서 확인**

Expected: 검색 탭 → 검색어 입력 → 300ms 디바운스 후 결과 표시. 결과 행 탭 → ReminderDetailScreen. 빈 결과 → "결과 없음".

- [ ] **Step 3: 커밋**

```bash
git add mobile/src/screens/SearchScreen.tsx
git commit -m "feat: implement SearchScreen with debounced search"
```

---

### Task 15: 최종 통합 확인

**Files:**
- 변경 없음 (전체 동작 확인)

- [ ] **Step 1: 백엔드 실행 확인**

```bash
cd /Users/seongyumin/Documents/company/example/backend
./gradlew bootRun
```

- [ ] **Step 2: 모바일 앱 실행 확인**

```bash
cd /Users/seongyumin/Documents/company/example/mobile
npx expo start
```

- [ ] **Step 3: 전체 기능 체크리스트**

- [ ] SummaryScreen: 스마트 리스트 카드 5개 + 카운트 표시
- [ ] SummaryScreen: 나의 목록 리스트 표시 + 미완료 건수
- [ ] 스마트 리스트 탭 → ReminderListScreen 이동
- [ ] 사용자 리스트 탭 → ReminderListScreen 이동
- [ ] 리마인더 완료 체크 → 체크 애니메이션 + 카운트 갱신
- [ ] 리마인더 좌측 스와이프 → 삭제
- [ ] 리마인더 우측 스와이프 → 플래그 토글
- [ ] 리마인더 탭 → ReminderDetailScreen(편집 모드) → 뒤로 가기 시 자동 저장
- [ ] "새 리마인더" 버튼 → ReminderDetailScreen(생성 모드) → "추가" 버튼으로 생성
- [ ] 완료됨 스마트 리스트 → "새 리마인더" 버튼 숨김, 완료된 항목 취소선 표시
- [ ] 날짜/시간 피커 동작
- [ ] 우선순위 선택 동작
- [ ] 플래그 토글 동작
- [ ] 태그 선택/생성 동작
- [ ] 서브태스크 표시 + 추가
- [ ] "목록 추가" 탭 → ListFormModal(생성 모드)
- [ ] 리스트 롱프레스 → 편집/삭제 컨텍스트 메뉴
- [ ] 검색 탭 → 검색어 입력 → 결과 표시 + 결과 없음 빈 상태
- [ ] Pull to Refresh 동작
- [ ] 리마인더 삭제 확인 다이얼로그

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "feat: complete Apple Reminders mobile app"
```
