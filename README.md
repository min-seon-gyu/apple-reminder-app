# Apple Reminders Clone

macOS/iOS Apple Reminders를 재현한 풀스택 웹 + 모바일 애플리케이션.

## 기술 스택

| 계층 | 기술 |
|------|------|
| **Backend** | Java 21, Spring Boot 3.4, Spring Data JPA, H2 Database |
| **Frontend (Web)** | React 19, TypeScript, Vite, Zustand, React Router 7, CSS Modules |
| **Frontend (Mobile)** | React Native 0.83, Expo SDK 55, TypeScript, Zustand, React Navigation 7 |

## 프로젝트 구조

```
├── backend/          # Spring Boot REST API 서버
├── frontend/         # React 웹 앱
├── mobile/           # React Native Expo 모바일 앱 (iOS)
└── docs/             # 설계 스펙 및 구현 계획
```

## 주요 기능

- 리마인더 CRUD (제목, 메모, 완료 체크)
- 목록 관리 (색상, 아이콘 커스터마이징)
- 날짜/시간 기반 마감일
- 우선순위 (없음 / 낮음 / 중간 / 높음)
- 플래그 표시
- 하위 항목 (서브태스크)
- 스마트 리스트 (오늘, 예정, 전체, 플래그 지정됨, 완료됨)
- 태그 시스템
- 검색 (제목, 메모, 태그 기반)

## 실행 방법

### 사전 요구사항

- Java 21+
- Node.js 18+
- Xcode (모바일 시뮬레이터 실행 시)

### Backend

```bash
cd backend
./gradlew bootRun
```

서버가 `http://localhost:8080`에서 실행됩니다.

### Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173`에서 웹 앱에 접근할 수 있습니다.

### Frontend (Mobile)

```bash
cd mobile
npm install

# iOS 시뮬레이터로 실행
npx expo run:ios

# 또는 Expo Go로 실행
npx expo start
```

> 실제 기기에서 실행 시 `mobile/src/api/client.ts`의 `BASE_URL`을 로컬 IP로 변경하세요.

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/lists` | 전체 목록 조회 |
| POST | `/api/lists` | 목록 생성 |
| PUT | `/api/lists/:id` | 목록 수정 |
| DELETE | `/api/lists/:id` | 목록 삭제 |
| GET | `/api/reminders/list/:listId` | 목록별 리마인더 조회 |
| POST | `/api/reminders` | 리마인더 생성 |
| PUT | `/api/reminders/:id` | 리마인더 수정 |
| PATCH | `/api/reminders/:id/toggle` | 완료 상태 토글 |
| DELETE | `/api/reminders/:id` | 리마인더 삭제 |
| GET | `/api/reminders/smart/:type` | 스마트 리스트 조회 |
| GET | `/api/reminders/smart/counts` | 스마트 리스트 카운트 |
| GET | `/api/reminders/search?q=` | 리마인더 검색 |
| GET | `/api/tags` | 전체 태그 조회 |
| POST | `/api/tags` | 태그 생성 |

## 아키텍처

```
┌──────────┐     ┌──────────┐
│  Web App │────▶│          │
│ (React)  │     │ Spring   │
└──────────┘     │ Boot API │──▶ H2 Database
┌──────────┐     │          │
│Mobile App│────▶│          │
│ (Expo)   │     └──────────┘
└──────────┘
```

- 웹과 모바일이 동일한 백엔드 API를 공유
- 웹과 모바일이 동일한 Zustand 스토어/API 클라이언트 코드를 공유
- 단일 사용자 앱 (인증 없음)
