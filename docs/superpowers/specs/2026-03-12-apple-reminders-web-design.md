# Apple Reminders Web Clone - Design Spec

## Overview

Apple Reminders(macOS)의 UI를 최대한 동일하게 재현한 웹 애플리케이션.
개인 포트폴리오용 프로젝트로, 단일 사용자(인증 없음)를 대상으로 한다.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Zustand + CSS Modules + React Router v7
- **Backend**: Spring Boot 3.4 + Spring Data JPA + H2 Database
- **Communication**: REST API (JSON)

## Architecture

```
example/
├── frontend/                # React app (Vite)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── stores/          # Zustand stores
│   │   ├── api/             # API call functions
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # Global styles, CSS variables
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                 # Spring Boot app
│   ├── src/main/java/
│   │   └── com/example/reminders/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       └── dto/
│   └── build.gradle
└── README.md
```

- Frontend: `localhost:5173` / Backend: `localhost:8080`
- 개발 시 Vite proxy로 CORS 처리

## Features

1. 리마인더 CRUD (제목, 메모, 완료 체크)
2. 리스트(목록) 관리 (생성/삭제/편집, 색상/아이콘 지정)
3. 날짜/시간 기반 리마인더 설정
4. 우선순위 (없음/낮음/중간/높음)
5. 플래그(깃발) 표시
6. 하위 할 일 (서브태스크, 1단계 깊이)
7. 스마트 리스트 (오늘, 예정, 전체, 플래그 지정됨, 완료됨)
8. 태그 기능
9. 검색 (제목, 메모, 태그 대상)

## Data Model

### ReminderList
| Field     | Type     | Constraint        |
|-----------|----------|-------------------|
| id        | Long     | PK, auto          |
| name      | String   | NOT NULL          |
| color     | String   | NOT NULL          |
| icon      | String   | NOT NULL          |
| position  | Integer  | NOT NULL          |
| createdAt | DateTime | NOT NULL          |
| updatedAt | DateTime | NOT NULL          |

### Reminder
| Field       | Type      | Constraint                    |
|-------------|-----------|-------------------------------|
| id          | Long      | PK, auto                      |
| listId      | Long      | FK → ReminderList, NOT NULL   |
| parentId    | Long      | FK → Reminder, nullable       |
| title       | String    | NOT NULL                      |
| notes       | String    | nullable                      |
| isCompleted | Boolean   | NOT NULL, default false       |
| completedAt | DateTime  | nullable                      |
| dueDate     | LocalDate | nullable                      |
| dueTime     | LocalTime | nullable                      |
| priority    | Enum      | NONE/LOW/MEDIUM/HIGH          |
| isFlagged   | Boolean   | NOT NULL, default false       |
| position    | Integer   | NOT NULL                      |
| createdAt   | DateTime  | NOT NULL                      |
| updatedAt   | DateTime  | NOT NULL                      |

- `parentId` 자기참조로 서브태스크 구현 (1단계 깊이만 허용)
- `position` 필드로 드래그 앤 드롭 순서 유지

### Tag
| Field | Type   | Constraint       |
|-------|--------|------------------|
| id    | Long   | PK, auto         |
| name  | String | NOT NULL, UNIQUE |

### ReminderTag (Join Table)
| Field      | Type | Constraint          |
|------------|------|---------------------|
| reminderId | Long | FK → Reminder       |
| tagId      | Long | FK → Tag            |

## Smart Lists (Query-based)

별도 테이블 없이 동적 필터링으로 구현:

| Smart List  | 조건                                          |
|-------------|-----------------------------------------------|
| 오늘        | `dueDate = today AND isCompleted = false`     |
| 예정        | `dueDate IS NOT NULL AND isCompleted = false` |
| 전체        | `isCompleted = false`                         |
| 플래그 지정됨 | `isFlagged = true AND isCompleted = false`   |
| 완료됨      | `isCompleted = true`                          |

## REST API

### Reminders
| Method | Path                          | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/api/reminders?listId={id}`  | 특정 리스트의 리마인더 조회 |
| GET    | `/api/reminders/smart/{type}` | 스마트 리스트 조회           |
| GET    | `/api/reminders/{id}`         | 리마인더 상세 (서브태스크 포함) |
| POST   | `/api/reminders`              | 리마인더 생성               |
| PUT    | `/api/reminders/{id}`         | 리마인더 수정 (tagIds 포함)  |
| PATCH  | `/api/reminders/{id}/complete`| 완료 토글                   |
| PATCH  | `/api/reminders/{id}/position`| 순서 변경                   |
| DELETE | `/api/reminders/{id}`         | 리마인더 삭제               |
| GET    | `/api/reminders/search?q={q}` | 검색 (제목, 메모, 태그)      |

### Lists
| Method | Path                         | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/api/lists`                 | 전체 리스트 (미완료 건수 포함) |
| POST   | `/api/lists`                 | 리스트 생성                |
| PUT    | `/api/lists/{id}`            | 리스트 수정                |
| PATCH  | `/api/lists/{id}/position`   | 리스트 순서 변경            |
| DELETE | `/api/lists/{id}`            | 리스트 삭제 (cascade)       |

### Tags
| Method | Path            | Description |
|--------|-----------------|-------------|
| GET    | `/api/tags`     | 전체 태그 조회 |
| POST   | `/api/tags`     | 태그 생성     |
| DELETE | `/api/tags/{id}`| 태그 삭제     |

## Frontend UI Structure

### Layout (macOS Reminders Style)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────┐ │
│  │   Sidebar    │  │           Main Area                  │ │
│  │              │  │                                      │ │
│  │ 검색바       │  │  리스트 제목 + 건수                    │ │
│  │              │  │  ──────────────────────               │ │
│  │ 스마트 리스트 │  │  리마인더 항목들                       │ │
│  │ (카드 그리드) │  │    └ 서브태스크                       │ │
│  │              │  │                                      │ │
│  │ ─────────── │  │                                      │ │
│  │ 나의 목록    │  │                                      │ │
│  │ (리스트 항목) │  │  + 리마인더 추가                      │ │
│  │              │  │                                      │ │
│  │ + 목록 추가  │  │                                      │ │
│  └──────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Tree

```
App
├── Sidebar
│   ├── SearchBar
│   ├── SmartListGroup
│   │   └── SmartListItem (오늘/예정/전체/플래그/완료됨)
│   ├── UserListGroup
│   │   └── UserListItem (편집/삭제 컨텍스트 메뉴)
│   └── AddListButton
├── MainArea
│   ├── ListHeader
│   ├── ReminderList
│   │   └── ReminderItem (체크, 제목, 인라인 편집)
│   │       ├── ReminderDetail (메모, 날짜, 우선순위, 플래그, 태그)
│   │       └── SubtaskList
│   │           └── ReminderItem (재사용)
│   └── AddReminderButton
└── SearchResults (검색 시 MainArea 대체)
```

### Apple Style UI Key Elements

- **사이드바**: 반투명 배경 (`backdrop-filter: blur`), 부드러운 선택 하이라이트
- **스마트 리스트 아이콘**: 각각 고유 색상의 원형 아이콘 (2x2 또는 3x2 카드 그리드)
- **리마인더 항목**: 클릭 시 인라인 확장하여 상세 편집 (별도 모달 없음)
- **완료 체크**: 원형 체크박스, 완료 시 부드러운 fade-out 애니메이션
- **색상 팔레트**: Apple 시스템 컬러 12색 (리스트 색상용)
- **반응형**: 768px 이하에서 사이드바 숨김, 햄버거 메뉴로 토글

### Zustand Stores

```
reminderStore: reminders[], selectedReminderId, CRUD actions
listStore: lists[], selectedListId, selectedSmartList, CRUD actions
tagStore: tags[], CRUD actions
uiStore: isSidebarOpen, searchQuery, isSearching
```

## Error Handling

### Backend
- `@RestControllerAdvice`로 글로벌 예외 처리
- 표준 에러 응답: `{ status, message, timestamp }`
- 주요 예외: `ResourceNotFoundException` (404), `ValidationException` (400)
- Bean Validation (`@NotBlank`, `@Size` 등)으로 입력 검증

### Frontend
- API 호출 실패 시 토스트 알림
- Optimistic Update: 완료 체크, 순서 변경 등은 즉시 UI 반영 후 API 호출, 실패 시 롤백

## Testing

- **Backend**: Spring Boot 통합 테스트 (`@SpringBootTest` + `MockMvc`) — 주요 API 엔드포인트
- **Frontend**: Vitest + React Testing Library — 핵심 컴포넌트 및 스토어 단위 테스트
