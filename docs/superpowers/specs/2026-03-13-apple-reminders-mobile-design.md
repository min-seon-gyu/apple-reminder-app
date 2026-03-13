# Apple Reminders Mobile App - Design Spec

## Overview

기존 Apple Reminders 웹 클론의 모바일 버전. iOS Apple Reminders 네이티브 앱의 UI를 최대한 재현한 React Native Expo 앱.
기존 Spring Boot 백엔드를 웹과 공유하며, 프론트엔드의 타입 정의/API 클라이언트/Zustand 스토어를 재사용한다.

## Tech Stack

- **Mobile**: React Native (Expo, Managed workflow, Expo Go)
- **Language**: TypeScript
- **State Management**: Zustand (웹에서 복사)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Animation**: react-native-reanimated
- **Gesture**: react-native-gesture-handler
- **Icons**: @expo/vector-icons
- **Toast**: react-native-toast-message
- **Backend**: 기존 Spring Boot 3.4 공유 (CORS 설정 추가)

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
- `frontend/src/stores/uiStore.ts` → 복사 후 `isSidebarOpen` 제거, Toast를 react-native-toast-message로 변경

### 새로 작성
- 모든 화면 (screens/)
- 모든 UI 컴포넌트 (components/)
- 네비게이션 설정 (navigation/)
- 색상/아이콘 상수 (constants/)

## Backend 변경: CORS 설정 추가

모바일은 Vite 프록시 없이 직접 API를 호출하므로 CORS 설정 필요:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE");
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
- 리스트 행 길게 누르면 편집/삭제 컨텍스트 메뉴
- 카드 또는 리스트 행 탭 → ReminderListScreen으로 이동

**ReminderListScreen**
- 상단: 리스트 제목 + 미완료 건수 (리스트 색상으로 표시)
- 리마인더 목록 (FlatList)
  - 각 행: 원형 체크박스 + 제목 + 메타 정보 (날짜, 우선순위, 플래그, 태그)
  - 서브태스크: 부모 아래 들여쓰기하여 표시
  - 좌측 스와이프 → 삭제
  - 우측 스와이프 → 플래그 토글
  - 행 탭 → ReminderDetailScreen으로 이동
- 하단: "새 리마인더" 입력 버튼

**ReminderDetailScreen**
- 전체 화면 편집 (웹의 인라인 확장과 달리 별도 화면)
- 편집 가능 필드: 제목, 메모, 날짜, 시간, 우선순위, 플래그, 태그
- 서브태스크 목록 + 추가
- 삭제 버튼
- 뒤로 가기 시 자동 저장

**SearchScreen**
- 상단: 검색 입력 필드 (300ms 디바운스)
- 결과: FlatList로 매칭된 리마인더 표시
- 결과 행 탭 → ReminderDetailScreen으로 이동
- 빈 쿼리: 빈 상태 표시

**AddListModal**
- 모달로 표시 (전체 화면 아님)
- 리스트 이름 입력
- 12색 ColorPicker
- 12개 IconPicker
- 생성/취소 버튼

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
├── AddReminderInput.tsx       # 새 리마인더 입력
├── AddListModal.tsx           # 리스트 생성 모달
├── ColorPicker.tsx            # 12색 선택
├── IconPicker.tsx             # 12개 아이콘 선택
├── TagSelector.tsx            # 태그 선택/생성
├── PriorityPicker.tsx         # 우선순위 선택
└── SwipeActions.tsx           # 스와이프로 삭제/플래그

navigation/
├── BottomTabNavigator.tsx
├── HomeStack.tsx
└── SearchStack.tsx
```

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

**아이콘 매핑:**
`@expo/vector-icons`의 `Ionicons` 사용:

| 앱 아이콘 | Ionicons 이름 |
|-----------|--------------|
| list | list-outline |
| bookmark | bookmark-outline |
| pin | pin-outline |
| gift | gift-outline |
| birthday | balloon-outline |
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
| 오늘 | today-outline | #007AFF |
| 예정 | calendar-outline | #FF3B30 |
| 전체 | tray-full-outline | #8E8E93 |
| 플래그 지정됨 | flag-fill | #FF9500 |
| 완료됨 | checkmark-circle-fill | #8E8E93 |

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
import Toast from 'react-native-toast-message';

interface UiState {
  searchQuery: string;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}
```

## iOS 네이티브 UX 요소

- **스와이프 액션**: 리마인더 행 좌측 스와이프 → 삭제 (빨간색), 우측 스와이프 → 플래그 토글 (주황색)
- **완료 체크**: 원형 체크박스, 완료 시 체크마크 애니메이션 + 0.8초 후 fade-out
- **리스트 롱프레스**: 길게 누르면 편집/삭제 컨텍스트 메뉴 (iOS ActionSheet 스타일)
- **키보드 회피**: `KeyboardAvoidingView`로 입력 필드 가림 방지
- **SafeArea**: `react-native-safe-area-context`로 노치/홈 인디케이터 대응
- **FlatList**: 리마인더/검색 결과에 `FlatList` 사용하여 대량 데이터 성능 확보
- **Pull to Refresh**: FlatList의 `refreshControl`로 당겨서 새로고침

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
