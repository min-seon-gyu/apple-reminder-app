# Apple Reminders Web Clone - Design Spec

## Overview

Apple Reminders(macOS)의 UI를 최대한 동일하게 재현한 웹 애플리케이션.
개인 포트폴리오용 프로젝트로, 단일 사용자(인증 없음)를 대상으로 한다.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Zustand + CSS Modules + React Router v7
- **Backend**: Spring Boot 3.4 + Spring Data JPA + H2 Database (파일 기반 모드, 서버 재시작 시 데이터 유지)
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
| name      | String   | NOT NULL, max 50자 |
| color     | String   | NOT NULL (아래 허용 값 참조) |
| icon      | String   | NOT NULL (아래 허용 값 참조) |
| position  | Integer  | NOT NULL          |
| createdAt | DateTime | NOT NULL          |
| updatedAt | DateTime | NOT NULL          |

**허용 색상 (Apple System Colors):**
`red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`, `pink`, `brown`, `gray`, `indigo`, `teal`

**허용 아이콘:**
`list`, `bookmark`, `pin`, `gift`, `birthday`, `work`, `school`, `home`, `shopping`, `health`, `travel`, `finance`

**초기 데이터:** 앱 최초 실행 시 기본 리스트 "미리 알림" (color: blue, icon: list)을 자동 생성

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
  - API는 `parentId`가 이미 서브태스크인 리마인더를 가리키면 400 Bad Request 반환
- 부모 리마인더 삭제 시 하위 서브태스크도 cascade 삭제
- `position` 필드로 드래그 앤 드롭 순서 유지
  - 정수 기반 정렬. `PATCH .../position`은 `{ orderedIds: [3, 1, 2] }` 형태로 해당 스코프 내 전체 순서를 받아 일괄 갱신
- `dueTime`은 `dueDate`가 설정된 경우에만 설정 가능 (dueDate 없이 dueTime만 있으면 400 Bad Request)
- 필드 길이 제약: `title` 최대 255자, `notes` 최대 2000자

### Tag
| Field | Type   | Constraint       |
|-------|--------|------------------|
| id    | Long   | PK, auto         |
| name  | String | NOT NULL, UNIQUE, max 50자 |

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
| 완료됨      | `isCompleted = true` (completedAt DESC 정렬)   |

> 참고: 오늘 날짜의 리마인더는 "오늘"과 "예정" 모두에 표시된다 (Apple Reminders와 동일한 동작).

## REST API

### Reminders
| Method | Path                          | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/api/reminders?listId={id}&includeCompleted=false` | 특정 리스트의 리마인더 조회 (기본: 미완료만, includeCompleted=true로 완료 포함) |
| GET    | `/api/reminders/smart/{type}` | 스마트 리스트 조회           |
| GET    | `/api/reminders/{id}`         | 리마인더 상세 (서브태스크 포함) |
| POST   | `/api/reminders`              | 리마인더 생성               |
| PUT    | `/api/reminders/{id}`         | 리마인더 수정 (tagIds 포함)  |
| PATCH  | `/api/reminders/{id}/complete`| 완료 토글                   |
| PATCH  | `/api/reminders/{id}/position`| 순서 변경                   |
| DELETE | `/api/reminders/{id}`         | 리마인더 삭제 (서브태스크 cascade) |
| GET    | `/api/reminders/search?q={q}` | 검색 (아래 검색 규칙 참조)    |
| GET    | `/api/reminders/smart/counts` | 스마트 리스트 건수 ({today, scheduled, all, flagged, completed}) |

### Lists
| Method | Path                         | Description              |
|--------|------------------------------|--------------------------|
| GET    | `/api/lists`                 | 전체 리스트 (미완료 건수 포함) |
| POST   | `/api/lists`                 | 리스트 생성                |
| PUT    | `/api/lists/{id}`            | 리스트 수정                |
| PATCH  | `/api/lists/{id}/position`   | 리스트 순서 변경            |
| DELETE | `/api/lists/{id}`            | 리스트 삭제 (리마인더+ReminderTag cascade, 태그 자체는 보존) |

### Tags
| Method | Path            | Description |
|--------|-----------------|-------------|
| GET    | `/api/tags`     | 전체 태그 조회 |
| POST   | `/api/tags`     | 태그 생성     |
| PUT    | `/api/tags/{id}`| 태그 이름 수정 |
| DELETE | `/api/tags/{id}`| 태그 삭제 (ReminderTag cascade) |

### 검색 규칙
- 대소문자 무시 (case-insensitive), 부분 문자열 매칭 (contains)
- 검색 대상: `title`, `notes`, 연결된 `tag.name`
- 미완료 리마인더만 검색 (isCompleted = false)
- 빈 쿼리(`q`)는 빈 결과 반환

### 순서 변경 (Position) 규칙
- `PATCH .../position` 엔드포인트는 `{ orderedIds: [id1, id2, ...] }` 형태의 요청을 받음
- 해당 스코프(리스트 또는 전체) 내 모든 항목의 ID를 순서대로 포함해야 함
- 서버는 배열 순서대로 `position` 값을 1부터 재할당
- 서브태스크 정렬: 같은 `parentId`를 가진 형제 서브태스크 ID만 포함

### Frontend Routing
| Path              | Component      | Description          |
|-------------------|----------------|----------------------|
| `/`               | redirect       | `/smart/all`로 리다이렉트 |
| `/list/:id`       | MainArea       | 사용자 리스트 보기      |
| `/smart/:type`    | MainArea       | 스마트 리스트 보기      |
| `/search`         | SearchResults  | 검색 결과             |

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
- **완료 체크**: 원형 체크박스, 완료 시 부드러운 fade-out 애니메이션 (1초 후 활성 목록에서 제거)
- **색상 팔레트**: Apple 시스템 컬러 12색 (리스트 색상용)
- **반응형**: 768px 이하에서 사이드바 숨김, 햄버거 메뉴로 토글
- **빈 상태**: 리마인더가 없는 리스트는 "리마인더 없음" 안내 표시, 검색 결과 없을 시 "결과 없음" 표시

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
- Optimistic Update: 완료 체크, 순서 변경 등은 즉시 UI 반영 후 API 호출, 실패 시 롤백 + "업데이트 실패, 되돌렸습니다" 토스트 표시

## Testing

- **Backend**: Spring Boot 통합 테스트 (`@SpringBootTest` + `MockMvc`) — 주요 API 엔드포인트
- **Frontend**: Vitest + React Testing Library — 핵심 컴포넌트 및 스토어 단위 테스트
