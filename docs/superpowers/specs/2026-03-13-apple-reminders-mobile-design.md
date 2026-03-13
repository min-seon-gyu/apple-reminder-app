# Apple Reminders Mobile App - Design Spec

## Overview

기존 Apple Reminders 웹 클론의 모바일 버전. iOS Apple Reminders 네이티브 앱의 UI를 최대한 재현한 React Native Expo 앱.
기존 Spring Boot 백엔드를 웹과 공유하며, 프론트엔드의 타입 정의/API 클라이언트/Zustand 스토어를 재사용한다.

## Tech Stack

- **Mobile**: React Native (Expo SDK 52, Managed workflow, Expo Go)
- **Language**: TypeScript
- **State Management**: Zustand (웹에서 복사)
- **Navigation**: React Navigation 7 (Bottom Tabs + Stack)
- **Animation**: react-native-reanimated
- **Gesture**: react-native-gesture-handler
- **Icons**: @expo/vector-icons (Ionicons)
- **Toast**: react-native-toast-message
- **SafeArea**: react-native-safe-area-context
- **Date/Time Picker**: @react-native-community/datetimepicker (Expo SDK 52 Expo Go 호환)
- **Backend**: 기존 Spring Boot 3.4 공유 (CORS 설정 추가)
- **Target Platform**: iOS 전용 (Android 미지원)

### 필수 설정

**babel.config.js**: `react-native-reanimated/plugin`을 마지막 플러그인으로 추가
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**App.tsx 엔트리**: `react-native-gesture-handler`를 최상단에 import
```typescript
import 'react-native-gesture-handler';
```

## Architecture

```
example/
├── frontend/          # 기존 웹 (React + Vite)
├── backend/           # 기존 백엔드 (Spring Boot) — 웹/모바일 공유
└── mobile/            # 신규 (Expo + React Native)
    ├── src/
    │   ├── api/       # 웹에서 복사, BASE_URL만 변경
    │   ├── types/     # 웹에서 그대로 복사
    │   ├── stores/    # 웹에서 복사 (Zustand 그대로 동작)
    │   ├── screens/   # React Native 화면들
    │   ├── components/# 재사용 가능한 네이티브 컴포넌트
    │   ├── navigation/# React Navigation 설정
    │   └── constants/ # 색상, 아이콘 매핑
    ├── App.tsx
    ├── app.json
    └── package.json
```

- 백엔드: `localhost:8080` (웹/모바일 공유)
- 모바일 개발 시: `http://<로컬IP>:8080`으로 접속

## Features

웹 버전과 동일한 전체 기능:

1. 리마인더 CRUD (제목, 메모, 완료 체크)
2. 리스트(목록) 관리 (생성/삭제/편집, 색상/아이콘 지정)
3. 날짜/시간 기반 리마인더 설정
4. 우선순위 (없음/낮음/중간/높음)
5. 플래그(깃발) 표시
6. 하위 할 일 (서브태스크, 1단계 깊이)
7. 스마트 리스트 (오늘, 예정, 전체, 플래그 지정됨, 완료됨)
8. 태그 기능
9. 검색 (제목, 메모, 태그 대상)

**모바일에서 제외하는 기능:**
- 드래그 앤 드롭 순서 변경 (리스트/리마인더) — 복잡도 대비 효과 낮음, 추후 추가 가능

**완료됨 스마트 리스트:**
- 완료된 리마인더는 취소선 텍스트로 표시
- 탭하면 ReminderDetailScreen으로 진입
- 체크박스 탭 시 완료 해제 (toggleComplete) 가능

## 코드 재사용

### 그대로 복사 (변경 없음)
- `frontend/src/types/index.ts` → `mobile/src/types/index.ts`

### 복사 후 최소 수정
- `frontend/src/api/client.ts` → `mobile/src/api/client.ts` (BASE_URL 변경)
- `frontend/src/api/reminderApi.ts` → 그대로 복사
- `frontend/src/api/listApi.ts` → 그대로 복사
- `frontend/src/api/tagApi.ts` → 그대로 복사
- `frontend/src/stores/reminderStore.ts` → 그대로 복사
- `frontend/src/stores/listStore.ts` → 그대로 복사
- `frontend/src/stores/tagStore.ts` → 그대로 복사
- `frontend/src/stores/uiStore.ts` → 새로 작성 (isSidebarOpen 제거, toast를 react-native-toast-message로 대체). `addToast(message: string)` 시그니처는 웹과 동일하게 유지하되 내부에서 `RNToast.show()`를 호출. 화면 레벨 에러 핸들러에서 호출용

### 새로 작성
- 모든 화면 (screens/)
- 모든 UI 컴포넌트 (components/)
- 네비게이션 설정 (navigation/)
- 색상/아이콘 상수 (constants/)

## Backend 변경: CORS 설정 추가

React Native의 `fetch()`는 네이티브 HTTP 클라이언트이므로 브라우저 CORS 정책이 적용되지 않는다.
하지만 웹 프론트엔드가 Vite 프록시 없이 직접 API를 호출하는 시나리오를 위해 CORS 설정을 추가한다:

```java
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

파일 위치: `backend/src/main/java/com/example/reminders/config/CorsConfig.java`

## Navigation Structure

```
BottomTab Navigator
├── Tab 1: "요약" (홈)
│   └── Stack Navigator
│       ├── SummaryScreen        # 스마트 리스트 그리드 + 나의 목록
│       ├── ReminderListScreen   # 리마인더 목록 (스마트/사용자 리스트 공용)
│       └── ReminderDetailScreen # 리마인더 상세 편집
│
├── Tab 2: "검색"
│   └── Stack Navigator
│       ├── SearchScreen         # 검색 입력 + 결과
│       └── ReminderDetailScreen # 검색 결과에서 상세 진입
│
└── Tab 3: "목록 추가" (탭이 아닌 모달)
    └── Modal: AddListModal      # 리스트 생성 (이름, 색상, 아이콘)
```

### 화면별 역할

**SummaryScreen**
- iOS Reminders 메인 화면과 동일
- 상단: 스마트 리스트 2열 그리드 카드 (오늘/예정/전체/플래그/완료됨)
- 하단: "나의 목록" 섹션 — 리스트 행 (색상 도트 + 이름 + 미완료 건수)
- 리스트 행 길게 누르면 편집/삭제 컨텍스트 메뉴 → 편집 선택 시 EditListModal 표시
- 카드 또는 리스트 행 탭 → ReminderListScreen으로 이동

**ReminderListScreen**
- 상단: 리스트 제목 + 미완료 건수 (리스트 색상으로 표시)
- 리마인더 목록 (FlatList)
  - 각 행: 원형 체크박스 + 제목 + 메타 정보 (날짜, 우선순위, 플래그, 태그)
  - 서브태스크: 부모 아래 들여쓰기하여 표시
  - 좌측으로 스와이프 (trailing action 노출) → 삭제 (빨간색)
  - 우측으로 스와이프 (leading action 노출) → 플래그 토글 (주황색)
  - 행 탭 → ReminderDetailScreen으로 이동
- 하단: "새 리마인더" 버튼 (완료됨 스마트 리스트에서는 숨김) → 탭 시 ReminderDetailScreen(생성 모드)로 이동
  - 사용자 리스트에서 진입: 해당 listId로 생성
  - 스마트 리스트에서 진입: 기본 리스트(첫 번째 사용자 리스트)의 listId로 생성
- Pull to Refresh: 당겨서 리마인더 목록 새로고침

**ReminderDetailScreen**
- 전체 화면 편집 (웹의 인라인 확장과 달리 별도 화면)
- 생성 모드와 편집 모드 겸용: 파라미터로 `reminderId`가 있으면 편집, 없으면 생성
- 생성 모드: `listId` 파라미터 필수, 저장 시 `createReminder` 호출
- 편집 가능 필드: 제목, 메모, 날짜(`@react-native-community/datetimepicker`), 시간, 우선순위, 플래그, 태그
- 서브태스크 목록 + 추가
- 삭제 버튼 (편집 모드만)
- 생성 모드: 네비게이션 헤더 우측에 "추가" 버튼 → `createReminder` 호출 후 이전 화면으로 pop. 뒤로 가기(취소)는 입력 내용 폐기
- 편집 모드: 뒤로 가기 시 자동 저장 (`updateReminder` 호출)

**SearchScreen**
- 상단: 검색 입력 필드 (300ms 디바운스)
- 결과: FlatList로 매칭된 리마인더 표시
- 결과 행 탭 → ReminderDetailScreen으로 이동
- 빈 쿼리: 빈 상태 표시

**AddListModal / EditListModal**
- 모달로 표시 (전체 화면 아님)
- `ListFormModal` 컴포넌트 하나로 생성/편집 모드 겸용
- `initialList?: ReminderList` prop으로 모드 구분: 값이 있으면 편집 모드(필드 사전 입력, `updateList` 호출), 없으면 생성 모드(`createList` 호출)
- 리스트 이름 입력
- 12색 ColorPicker
- 12개 IconPicker
- 생성(또는 저장)/취소 버튼
- Tab 3("목록 추가")은 실제 탭이 아닌 모달 트리거: `listeners={{ tabPress: (e) => { e.preventDefault(); showModal(); } }}`로 구현

## Component Structure

```
screens/
├── SummaryScreen.tsx
├── ReminderListScreen.tsx
├── ReminderDetailScreen.tsx
└── SearchScreen.tsx

components/
├── SmartListCard.tsx          # 스마트 리스트 카드 (아이콘 + 숫자)
├── SmartListGrid.tsx          # 2열 그리드 컨테이너
├── UserListRow.tsx            # 나의 목록 행 (색상 도트 + 이름 + 건수)
├── ReminderRow.tsx            # 리마인더 행 (체크박스 + 제목 + 메타)
├── SubtaskRow.tsx             # 서브태스크 행 (들여쓰기)
├── ListFormModal.tsx          # 리스트 생성/편집 모달 (initialList? prop으로 모드 구분)
├── ColorPicker.tsx            # 12색 선택
├── IconPicker.tsx             # 12개 아이콘 선택
├── TagSelector.tsx            # 태그 선택/생성
├── PriorityPicker.tsx         # 우선순위 선택
└── SwipeActions.tsx           # 스와이프로 삭제/플래그

navigation/
├── BottomTabNavigator.tsx
├── HomeStack.tsx              # SummaryScreen → ReminderListScreen → ReminderDetailScreen
└── SearchStack.tsx            # SearchScreen → ReminderDetailScreen
```

> **참고:** `ReminderDetailScreen`은 HomeStack과 SearchStack 양쪽에 등록된다. 같은 컴포넌트를 두 네비게이터에서 공유한다.

## Styling

### iOS 네이티브 디자인 시스템

`StyleSheet.create()` 사용 (외부 스타일 라이브러리 없음)

**배경/카드:**
- 시스템 그룹 배경: `#F2F2F7`
- 카드/섹션 배경: `#FFFFFF`, `borderRadius: 12`
- 구분선: `#C6C6C8`, 높이 `StyleSheet.hairlineWidth`

**폰트:**
- 시스템 기본 (iOS에서 SF Pro 자동 적용)
- 제목: 17pt, 세부: 15pt, 메타: 13pt

**Apple System Colors 매핑:**

| 이름 | HEX |
|------|-----|
| red | #FF3B30 |
| orange | #FF9500 |
| yellow | #FFCC00 |
| green | #34C759 |
| cyan | #5AC8FA |
| blue | #007AFF |
| purple | #AF52DE |
| pink | #FF2D55 |
| brown | #A2845E |
| gray | #8E8E93 |
| indigo | #5856D6 |
| teal | #64D2A0 |

> **참고:** teal 색상은 웹 버전과 동일한 값 사용. Apple의 공식 시스템 teal(`#30B0C7`)과 다르지만 웹/모바일 간 일관성을 우선한다.

**아이콘 매핑:**
`@expo/vector-icons`의 `Ionicons` 사용:

| 앱 아이콘 | Ionicons 이름 |
|-----------|--------------|
| list | list-outline |
| bookmark | bookmark-outline |
| pin | pin-outline |
| gift | gift-outline |
| birthday | happy-outline |
| work | briefcase-outline |
| school | school-outline |
| home | home-outline |
| shopping | cart-outline |
| health | heart-outline |
| travel | airplane-outline |
| finance | card-outline |

**스마트 리스트 아이콘:**

| 스마트 리스트 | 아이콘 | 색상 |
|-------------|--------|------|
| 오늘 | calendar-number-outline | #007AFF |
| 예정 | calendar-outline | #FF3B30 |
| 전체 | file-tray-full-outline | #8E8E93 |
| 플래그 지정됨 | flag | #FF9500 |
| 완료됨 | checkmark-circle | #8E8E93 |

### 애니메이션

`react-native-reanimated` 사용:
- 완료 체크: 체크마크 애니메이션 + 0.8초 후 FadeOut + 목록에서 제거
- 스와이프 액션: spring 애니메이션으로 자연스러운 제스처
- 화면 전환: React Navigation 기본 iOS 스타일 트랜지션

## Data Flow

### 재사용 레이어

```
[Mobile UI] → [Zustand Stores] → [API Client] → [Spring Boot Backend]
                (웹과 동일)        (BASE_URL만 변경)    (웹과 동일)
```

### API Client 변경

```typescript
// mobile/src/api/client.ts
const BASE_URL = 'http://192.168.x.x:8080';  // 개발 시 로컬 IP
```

`fetch()`는 React Native에서 네이티브 지원되므로 나머지 코드 변경 없음.

### uiStore 조정

웹의 `uiStore`에서 모바일에 맞게 조정:
- `isSidebarOpen` → 제거 (모바일에 사이드바 없음)
- `searchQuery`, `isSearching` → 그대로 유지
- `toasts[]` → `react-native-toast-message`로 대체

```typescript
// mobile/src/stores/uiStore.ts
import RNToast from 'react-native-toast-message';

interface UiState {
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToast: (message: string) => void; // 웹과 동일한 시그니처, 내부에서 RNToast.show() 호출
}
```

`addToast` 내부에서 `RNToast.show({ type, text1: message })`를 호출하여 웹 스토어와의 호환성을 유지한다.

**App.tsx 루트에 `<Toast />` 컴포넌트 배치 필수:**
```typescript
import Toast from 'react-native-toast-message';
// ...
return (
  <NavigationContainer>
    {/* ... navigators */}
    <Toast />
  </NavigationContainer>
);
```

## iOS 네이티브 UX 요소

- **스와이프 액션**: 좌측으로 스와이프(trailing action) → 삭제 (빨간색), 우측으로 스와이프(leading action) → 플래그 토글 (주황색)
- **완료 체크**: 원형 체크박스, 완료 시 체크마크 애니메이션 + 0.8초 후 fade-out
- **리스트 롱프레스**: 길게 누르면 편집/삭제 컨텍스트 메뉴 (iOS ActionSheet 스타일)
- **키보드 회피**: `KeyboardAvoidingView`로 입력 필드 가림 방지
- **SafeArea**: `react-native-safe-area-context`로 노치/홈 인디케이터 대응
- **FlatList**: 리마인더/검색 결과에 `FlatList` 사용하여 대량 데이터 성능 확보
- **Pull to Refresh**: FlatList의 `refreshControl`로 당겨서 새로고침

## Empty States

- 리마인더가 없는 리스트: 화면 중앙에 "리마인더 없음" 텍스트 표시
- 검색 결과 없음: "결과 없음" 텍스트 표시
- 사용자 리스트가 없는 경우: SummaryScreen에서 스마트 리스트 그리드만 표시, "나의 목록" 섹션은 빈 상태로 표시

## Loading States

- **초기 로딩**: 앱 시작 시 `ActivityIndicator` 표시 (리스트, 스마트 리스트 카운트 로딩)
- **화면 전환**: ReminderListScreen 진입 시 리마인더 로딩 중 `ActivityIndicator` 표시
- **백엔드 미연결**: 초기 데이터 로딩 실패 시 "서버에 연결할 수 없습니다" 메시지 + 재시도 버튼

## Error Handling

- API 호출 실패: `react-native-toast-message`로 에러 메시지 표시
- Optimistic Update: 완료 토글 시 즉시 UI 반영, 실패 시 롤백 + 토스트 (웹과 동일 로직)
- 네트워크 미연결: "네트워크 연결을 확인해주세요" 토스트

## Testing

- **Framework**: Jest + React Native Testing Library
- **스토어 테스트**: 웹 테스트 재활용 가능 (Zustand 로직 동일)
- **컴포넌트 테스트**: 주요 화면 렌더링 + 인터랙션 테스트

## REST API

기존 웹 스펙과 동일. 변경 없음. `docs/superpowers/specs/2026-03-12-apple-reminders-web-design.md` 참조.
