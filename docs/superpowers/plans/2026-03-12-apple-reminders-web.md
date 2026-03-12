# Apple Reminders Web Clone Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apple Reminders(macOS)의 UI를 최대한 동일하게 재현한 웹 애플리케이션을 React + Spring Boot로 구축한다.

**Architecture:** Spring Boot 3.4 REST API 백엔드와 React 19 프론트엔드를 분리된 디렉토리로 구성. 백엔드를 먼저 완성한 뒤 프론트엔드를 연결한다. H2 파일 기반 DB로 데이터를 영속화한다.

**Tech Stack:** React 19, Vite 6, TypeScript, Zustand, CSS Modules, React Router v7 / Spring Boot 3.4, Spring Data JPA, H2, Java 21, Gradle

**Spec:** `docs/superpowers/specs/2026-03-12-apple-reminders-web-design.md`

---

## File Structure

### Backend (`backend/`)

```
backend/
├── build.gradle
├── settings.gradle
├── src/main/java/com/example/reminders/
│   ├── RemindersApplication.java
│   ├── config/
│   │   └── DataInitializer.java
│   ├── entity/
│   │   ├── Priority.java              # enum NONE/LOW/MEDIUM/HIGH
│   │   ├── ReminderList.java
│   │   ├── Reminder.java
│   │   └── Tag.java
│   ├── repository/
│   │   ├── ReminderListRepository.java
│   │   ├── ReminderRepository.java
│   │   └── TagRepository.java
│   ├── dto/
│   │   ├── ReminderListRequest.java
│   │   ├── ReminderListResponse.java
│   │   ├── ReminderRequest.java
│   │   ├── ReminderResponse.java
│   │   ├── TagRequest.java
│   │   ├── TagResponse.java
│   │   ├── PositionUpdateRequest.java
│   │   └── ErrorResponse.java
│   ├── service/
│   │   ├── ReminderListService.java
│   │   ├── ReminderService.java
│   │   └── TagService.java
│   ├── controller/
│   │   ├── ReminderListController.java
│   │   ├── ReminderController.java
│   │   └── TagController.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── ResourceNotFoundException.java
├── src/main/resources/
│   └── application.yml
└── src/test/java/com/example/reminders/
    ├── controller/
    │   ├── ReminderListControllerTest.java
    │   ├── ReminderControllerTest.java
    │   └── TagControllerTest.java
    └── RemindersApplicationTests.java
```

### Frontend (`frontend/`)

```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.module.css
    ├── types/
    │   └── index.ts
    ├── api/
    │   ├── client.ts
    │   ├── listApi.ts
    │   ├── reminderApi.ts
    │   └── tagApi.ts
    ├── stores/
    │   ├── listStore.ts
    │   ├── reminderStore.ts
    │   ├── tagStore.ts
    │   └── uiStore.ts
    ├── components/
    │   ├── Sidebar/
    │   │   ├── Sidebar.tsx & .module.css
    │   │   ├── SearchBar.tsx & .module.css
    │   │   ├── SmartListGroup.tsx & .module.css
    │   │   ├── SmartListItem.tsx & .module.css
    │   │   ├── UserListGroup.tsx & .module.css
    │   │   ├── UserListItem.tsx & .module.css
    │   │   └── AddListButton.tsx & .module.css
    │   ├── MainArea/
    │   │   ├── MainArea.tsx & .module.css
    │   │   ├── ListHeader.tsx & .module.css
    │   │   ├── ReminderList.tsx & .module.css
    │   │   ├── ReminderItem.tsx & .module.css
    │   │   ├── ReminderDetail.tsx & .module.css
    │   │   ├── SubtaskList.tsx & .module.css
    │   │   └── AddReminderButton.tsx & .module.css
    │   ├── Search/
    │   │   └── SearchResults.tsx & .module.css
    │   └── common/
    │       └── Toast.tsx & .module.css
    └── styles/
        ├── global.css
        └── variables.css
```

---

## Chunk 1: Backend Setup & Entity Layer

### Task 1: Spring Boot 프로젝트 스캐폴딩

**Files:**
- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/src/main/java/com/example/reminders/RemindersApplication.java`
- Create: `backend/src/main/resources/application.yml`

- [ ] **Step 1: Gradle 빌드 파일 생성**

`backend/build.gradle`:
```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.1'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    runtimeOnly 'com.h2database:h2'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

`backend/settings.gradle`:
```groovy
rootProject.name = 'reminders'
```

- [ ] **Step 2: Application 클래스 및 application.yml 생성**

`backend/src/main/java/com/example/reminders/RemindersApplication.java`:
```java
package com.example.reminders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RemindersApplication {
    public static void main(String[] args) {
        SpringApplication.run(RemindersApplication.class, args);
    }
}
```

`backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./data/reminders
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
  h2:
    console:
      enabled: true
      path: /h2-console
```

- [ ] **Step 3: 기본 테스트 클래스 생성**

`backend/src/test/java/com/example/reminders/RemindersApplicationTests.java`:
```java
package com.example.reminders;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RemindersApplicationTests {
    @Test
    void contextLoads() {}
}
```

- [ ] **Step 4: 빌드 확인**

Run: `cd backend && ./gradlew build`
Expected: BUILD SUCCESSFUL

- [ ] **Step 5: 커밋**

```bash
git add backend/
git commit -m "feat: scaffold Spring Boot project with H2 and JPA"
```

### Task 2: Entity 및 Enum 생성

**Files:**
- Create: `backend/src/main/java/com/example/reminders/entity/Priority.java`
- Create: `backend/src/main/java/com/example/reminders/entity/ReminderList.java`
- Create: `backend/src/main/java/com/example/reminders/entity/Tag.java`
- Create: `backend/src/main/java/com/example/reminders/entity/Reminder.java`

- [ ] **Step 1: Priority enum**

```java
package com.example.reminders.entity;

public enum Priority {
    NONE, LOW, MEDIUM, HIGH
}
```

- [ ] **Step 2: ReminderList 엔티티**

```java
package com.example.reminders.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reminder_list")
public class ReminderList {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 50)
    private String name;

    @NotBlank private String color;
    @NotBlank private String icon;

    @Column(nullable = false) private Integer position;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "list", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reminder> reminders = new ArrayList<>();

    @PrePersist
    protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Standard getters/setters for all fields
}
```

> **참고:** `@OneToMany(cascade = CascadeType.ALL)` 로 리스트 삭제 시 하위 리마인더가 cascade 삭제됨.

- [ ] **Step 3: Tag 엔티티**

```java
package com.example.reminders.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name = "tag")
public class Tag {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 50) @Column(unique = true)
    private String name;

    @ManyToMany(mappedBy = "tags")
    private Set<Reminder> reminders = new HashSet<>();

    // Getters/setters
}
```

> **참고:** 양방향 `@ManyToMany`로 태그 삭제 시 JPA가 `reminder_tag` join 테이블 행도 정리함. 삭제 전 `tag.getReminders()`에서 해당 태그를 제거해야 함.

- [ ] **Step 4: Reminder 엔티티** (자기참조, ManyToMany tags)

```java
package com.example.reminders.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;

@Entity @Table(name = "reminder")
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private ReminderList list;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Reminder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Reminder> subtasks = new ArrayList<>();

    @NotBlank @Size(max = 255) private String title;
    @Size(max = 2000) private String notes;
    @Column(nullable = false) private Boolean isCompleted = false;
    private LocalDateTime completedAt;
    private LocalDate dueDate;
    private LocalTime dueTime;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Priority priority = Priority.NONE;
    @Column(nullable = false) private Boolean isFlagged = false;
    @Column(nullable = false) private Integer position;

    @ManyToMany
    @JoinTable(name = "reminder_tag",
        joinColumns = @JoinColumn(name = "reminder_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();

    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Standard getters/setters for all fields
}
```

- [ ] **Step 5: 빌드 확인 후 커밋**

Run: `cd backend && ./gradlew build`

```bash
git add backend/src/main/java/com/example/reminders/entity/
git commit -m "feat: add JPA entities - ReminderList, Reminder, Tag, Priority"
```

### Task 3: Repository, Error Handling, DataInitializer

**Files:**
- Create: `backend/src/main/java/com/example/reminders/repository/ReminderListRepository.java`
- Create: `backend/src/main/java/com/example/reminders/repository/ReminderRepository.java`
- Create: `backend/src/main/java/com/example/reminders/repository/TagRepository.java`
- Create: `backend/src/main/java/com/example/reminders/exception/ResourceNotFoundException.java`
- Create: `backend/src/main/java/com/example/reminders/exception/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/example/reminders/dto/ErrorResponse.java`
- Create: `backend/src/main/java/com/example/reminders/config/DataInitializer.java`

- [ ] **Step 1: Repository 인터페이스 생성**

`ReminderListRepository.java`:
```java
public interface ReminderListRepository extends JpaRepository<ReminderList, Long> {
    List<ReminderList> findAllByOrderByPositionAsc();
    int countBy();
}
```

`ReminderRepository.java` — 스마트 리스트 쿼리, 검색, 카운트 메서드 포함:
```java
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByListIdAndParentIsNullAndIsCompletedFalseOrderByPositionAsc(Long listId);
    List<Reminder> findByListIdAndParentIsNullOrderByPositionAsc(Long listId);

    // Smart lists
    List<Reminder> findByDueDateAndIsCompletedFalseAndParentIsNullOrderByPositionAsc(LocalDate date);
    List<Reminder> findByDueDateIsNotNullAndIsCompletedFalseAndParentIsNullOrderByDueDateAscPositionAsc();
    List<Reminder> findByIsCompletedFalseAndParentIsNullOrderByPositionAsc();
    List<Reminder> findByIsFlaggedTrueAndIsCompletedFalseAndParentIsNullOrderByPositionAsc();
    List<Reminder> findByIsCompletedTrueAndParentIsNullOrderByCompletedAtDesc();

    // Counts
    long countByDueDateAndIsCompletedFalse(LocalDate date);
    long countByDueDateIsNotNullAndIsCompletedFalse();
    long countByIsCompletedFalse();
    long countByIsFlaggedTrueAndIsCompletedFalse();
    long countByIsCompletedTrue();
    long countByListIdAndIsCompletedFalse(Long listId);

    // Search
    @Query("SELECT DISTINCT r FROM Reminder r LEFT JOIN r.tags t " +
           "WHERE r.isCompleted = false AND r.parent IS NULL " +
           "AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(r.notes) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Reminder> search(@Param("q") String query);

    List<Reminder> findByParentIdOrderByPositionAsc(Long parentId);
}
```

`TagRepository.java`:
```java
public interface TagRepository extends JpaRepository<Tag, Long> {}
```

- [ ] **Step 2: 예외 클래스 + 글로벌 핸들러 + ErrorResponse**

`ResourceNotFoundException.java`: `RuntimeException` 상속, message 생성자
`ErrorResponse.java`: `record ErrorResponse(int status, String message, LocalDateTime timestamp)`
`GlobalExceptionHandler.java`: `@RestControllerAdvice` — ResourceNotFoundException(404), IllegalArgumentException(400), MethodArgumentNotValidException(400) 처리

- [ ] **Step 3: DataInitializer** — `CommandLineRunner` 구현, 리스트 0개일 때 "미리 알림" (color:blue, icon:list, position:1) 자동 생성

- [ ] **Step 4: 빌드 확인 후 커밋**

Run: `cd backend && ./gradlew build`

```bash
git add backend/src/
git commit -m "feat: add repositories, error handling, and data initializer"
```

## Chunk 2: Backend List & Tag API

### Task 4: List API (DTOs + Service + Controller + Tests)

**Files:**
- Create: `backend/src/main/java/com/example/reminders/dto/ReminderListRequest.java`
- Create: `backend/src/main/java/com/example/reminders/dto/ReminderListResponse.java`
- Create: `backend/src/main/java/com/example/reminders/dto/PositionUpdateRequest.java`
- Create: `backend/src/main/java/com/example/reminders/service/ReminderListService.java`
- Create: `backend/src/main/java/com/example/reminders/controller/ReminderListController.java`
- Create: `backend/src/test/java/com/example/reminders/controller/ReminderListControllerTest.java`

- [ ] **Step 1: DTO 생성**

`ReminderListRequest.java`:
```java
public record ReminderListRequest(
    @NotBlank @Size(max = 50) String name,
    @NotBlank String color,
    @NotBlank String icon
) {}
```

`ReminderListResponse.java`:
```java
public record ReminderListResponse(
    Long id, String name, String color, String icon,
    Integer position, long incompleteCount,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```

`PositionUpdateRequest.java`:
```java
public record PositionUpdateRequest(
    @NotNull List<Long> orderedIds
) {}
```

- [ ] **Step 2: ReminderListService 구현**

허용 색상/아이콘 검증 포함. CRUD + position reorder.
- `getAllLists()` — position 순 정렬, 각 리스트마다 `reminderRepository.countByListIdAndIsCompletedFalse(listId)` 호출하여 incompleteCount 계산
- `createList(request)` — position은 현재 max+1 자동 할당
- `updateList(id, request)` — 이름/색상/아이콘 수정
- `updatePositions(request)` — orderedIds 순서로 position 1부터 재할당
- `deleteList(id)` — cascade 삭제 (JPA가 처리)

- [ ] **Step 3: ReminderListController 구현**

```
GET    /api/lists              → getAllLists()
POST   /api/lists              → createList(@Valid @RequestBody)
PUT    /api/lists/{id}         → updateList(@PathVariable, @Valid @RequestBody)
PATCH  /api/lists/{id}/position → updatePositions(@Valid @RequestBody)
DELETE /api/lists/{id}         → deleteList(@PathVariable)
```

- [ ] **Step 4: 통합 테스트 작성**

`ReminderListControllerTest.java` — `@SpringBootTest` + `@AutoConfigureMockMvc`:
- `testGetAllLists` — 기본 리스트 "미리 알림" 반환 확인
- `testCreateList` — POST 후 201, name/color/icon 검증
- `testCreateListInvalidColor` — 잘못된 색상으로 400
- `testUpdateList` — PUT 후 이름 변경 확인
- `testDeleteList` — DELETE 후 GET에서 제외 확인
- `testUpdatePositions` — 순서 변경 후 position 값 검증

- [ ] **Step 5: 테스트 실행**

Run: `cd backend && ./gradlew test`
Expected: ALL PASS

- [ ] **Step 6: 커밋**

```bash
git add backend/src/
git commit -m "feat: implement List CRUD API with tests"
```

### Task 5: Tag API (DTOs + Service + Controller + Tests)

**Files:**
- Create: `backend/src/main/java/com/example/reminders/dto/TagRequest.java`
- Create: `backend/src/main/java/com/example/reminders/dto/TagResponse.java`
- Create: `backend/src/main/java/com/example/reminders/service/TagService.java`
- Create: `backend/src/main/java/com/example/reminders/controller/TagController.java`
- Create: `backend/src/test/java/com/example/reminders/controller/TagControllerTest.java`

- [ ] **Step 1: DTO 생성**

`TagRequest.java`: `record TagRequest(@NotBlank @Size(max = 50) String name) {}`
`TagResponse.java`: `record TagResponse(Long id, String name) {}`

- [ ] **Step 2: TagService** — CRUD (getAll, create, update, delete). delete 시 ReminderTag cascade는 JPA가 처리.

- [ ] **Step 3: TagController**

```
GET    /api/tags        → getAllTags()
POST   /api/tags        → createTag(@Valid @RequestBody)
PUT    /api/tags/{id}   → updateTag(@PathVariable, @Valid @RequestBody)
DELETE /api/tags/{id}   → deleteTag(@PathVariable)
```

- [ ] **Step 4: 통합 테스트 작성**

- `testCreateAndGetTags`
- `testUpdateTag`
- `testDeleteTag`
- `testDuplicateTagName` → 409 또는 400

- [ ] **Step 5: 테스트 실행 후 커밋**

Run: `cd backend && ./gradlew test`

```bash
git add backend/src/
git commit -m "feat: implement Tag CRUD API with tests"
```

## Chunk 3: Backend Reminder API

### Task 6: Reminder DTOs + Service (CRUD 기본)

**Files:**
- Create: `backend/src/main/java/com/example/reminders/dto/ReminderRequest.java`
- Create: `backend/src/main/java/com/example/reminders/dto/ReminderResponse.java`
- Create: `backend/src/main/java/com/example/reminders/service/ReminderService.java`

- [ ] **Step 1: DTO 생성**

`ReminderRequest.java`:
```java
public record ReminderRequest(
    @NotNull Long listId,
    Long parentId,
    @NotBlank @Size(max = 255) String title,
    @Size(max = 2000) String notes,
    LocalDate dueDate,
    LocalTime dueTime,
    Priority priority,
    Boolean isFlagged,
    List<Long> tagIds
) {}
```

`ReminderResponse.java`:
```java
public record ReminderResponse(
    Long id, Long listId, Long parentId,
    String title, String notes,
    Boolean isCompleted, LocalDateTime completedAt,
    LocalDate dueDate, LocalTime dueTime,
    Priority priority, Boolean isFlagged,
    Integer position,
    List<TagResponse> tags,
    List<ReminderResponse> subtasks,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
```

- [ ] **Step 2: ReminderService 구현**

핵심 로직:
- `create(request)` — dueTime without dueDate 검증, parentId 깊이 검증 (부모가 이미 서브태스크면 400), position 자동 할당, tagIds로 태그 연결
- `update(id, request)` — 필드 업데이트 + tagIds 교체
- `getById(id)` — 서브태스크 포함
- `getByListId(listId, includeCompleted)` — 리스트별 조회
- `toggleComplete(id)` — isCompleted 토글, completedAt 설정/해제
- `delete(id)` — cascade로 서브태스크 포함 삭제
- `updatePositions(request)` — orderedIds로 position 재할당

- [ ] **Step 3: 커밋**

```bash
git add backend/src/main/java/com/example/reminders/dto/Reminder*
git add backend/src/main/java/com/example/reminders/service/ReminderService.java
git commit -m "feat: add Reminder DTOs and service with validation"
```

### Task 7: Reminder Controller + Smart Lists + Search

**Files:**
- Create: `backend/src/main/java/com/example/reminders/controller/ReminderController.java`

- [ ] **Step 1: ReminderController 구현**

```
GET    /api/reminders?listId={id}&includeCompleted=false → getByList()
GET    /api/reminders/smart/{type}                       → getSmartList()
GET    /api/reminders/{id}                               → getById()
POST   /api/reminders                                    → create()
PUT    /api/reminders/{id}                               → update()
PATCH  /api/reminders/{id}/complete                      → toggleComplete()
PATCH  /api/reminders/{id}/position                      → updatePositions() ({id}는 리스트ID 또는 parentID를 스코프 힌트로 사용, 실제 재배치는 body의 orderedIds로 수행)
DELETE /api/reminders/{id}                               → delete()
GET    /api/reminders/search?q={q}                       → search()
GET    /api/reminders/smart/counts                       → getSmartListCounts() (각 스마트 리스트 건수 반환: {today, scheduled, all, flagged, completed})
```

스마트 리스트 type: `today`, `scheduled`, `all`, `flagged`, `completed`
검색: q가 빈 문자열이면 빈 배열 반환

`getSmartListCounts()` — `Map<String, Long>` 반환:
```java
@GetMapping("/smart/counts")
public Map<String, Long> getSmartListCounts() {
    return reminderService.getSmartListCounts();
}
```
Service에서 repository의 각 countBy* 메서드를 호출하여 맵으로 구성.

> **참고:** `IllegalArgumentException`을 validation 용도로 사용. 스펙의 `ValidationException` 대신 표준 예외를 활용하여 별도 클래스 불필요.

- [ ] **Step 2: 커밋**

```bash
git add backend/src/main/java/com/example/reminders/controller/ReminderController.java
git commit -m "feat: add Reminder controller with smart lists and search"
```

### Task 8: Reminder 통합 테스트

**Files:**
- Create: `backend/src/test/java/com/example/reminders/controller/ReminderControllerTest.java`

- [ ] **Step 1: 테스트 작성**

`@SpringBootTest` + `@AutoConfigureMockMvc`, 각 테스트 전 DB 초기화:

- `testCreateReminder` — POST 201, 필드 검증
- `testCreateReminderDueTimeWithoutDate` — 400 검증
- `testCreateSubtask` — parentId 지정, 성공 확인
- `testCreateNestedSubtask` — 서브태스크의 서브태스크 시도 → 400
- `testGetByListId` — 리스트별 조회, 미완료만
- `testGetByListIdIncludeCompleted` — includeCompleted=true
- `testToggleComplete` — PATCH 후 isCompleted/completedAt 변경 확인
- `testSmartListToday` — dueDate=today인 항목만 반환
- `testSmartListFlagged` — isFlagged=true인 항목만 반환
- `testSearch` — title/notes/tag.name 검색 확인
- `testSearchEmptyQuery` — 빈 결과
- `testDeleteCascadesSubtasks` — 부모 삭제 시 서브태스크 삭제 확인
- `testUpdateWithTags` — tagIds 교체 확인

- [ ] **Step 2: 테스트 실행**

Run: `cd backend && ./gradlew test`
Expected: ALL PASS

- [ ] **Step 3: 커밋**

```bash
git add backend/src/test/
git commit -m "feat: add comprehensive Reminder API integration tests"
```

## Chunk 4: Frontend Setup & Foundation

### Task 9: React 프로젝트 스캐폴딩

**Files:**
- Create: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, `frontend/tsconfig.node.json`, `frontend/index.html`, `frontend/src/main.tsx`

- [ ] **Step 1: Vite React TypeScript 프로젝트 생성**

```bash
cd /Users/seongyumin/Documents/company/example
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: vite.config.ts에 proxy 설정**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

- [ ] **Step 3: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add frontend/
git commit -m "feat: scaffold React frontend with Vite, Zustand, React Router"
```

### Task 10: TypeScript 타입 + API 클라이언트

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/listApi.ts`
- Create: `frontend/src/api/reminderApi.ts`
- Create: `frontend/src/api/tagApi.ts`

- [ ] **Step 1: TypeScript 타입 정의**

`frontend/src/types/index.ts`:
```typescript
export type Priority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type SmartListType = 'today' | 'scheduled' | 'all' | 'flagged' | 'completed';
export type ListColor = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray' | 'indigo' | 'teal';
export type ListIcon = 'list' | 'bookmark' | 'pin' | 'gift' | 'birthday' | 'work' | 'school' | 'home' | 'shopping' | 'health' | 'travel' | 'finance';

export interface ReminderList {
  id: number; name: string; color: ListColor; icon: ListIcon;
  position: number; incompleteCount: number;
  createdAt: string; updatedAt: string;
}

export interface Reminder {
  id: number; listId: number; parentId: number | null;
  title: string; notes: string | null;
  isCompleted: boolean; completedAt: string | null;
  dueDate: string | null; dueTime: string | null;
  priority: Priority; isFlagged: boolean;
  position: number;
  tags: Tag[]; subtasks: Reminder[];
  createdAt: string; updatedAt: string;
}

export interface Tag { id: number; name: string; }

export interface ReminderListRequest { name: string; color: ListColor; icon: ListIcon; }
export interface ReminderRequest {
  listId: number; parentId?: number | null;
  title: string; notes?: string | null;
  dueDate?: string | null; dueTime?: string | null;
  priority?: Priority; isFlagged?: boolean;
  tagIds?: number[];
}
```

- [ ] **Step 2: API 클라이언트**

`client.ts`: fetch wrapper (base URL = '', JSON 변환, 에러 throw)
`listApi.ts`: `getLists()`, `createList()`, `updateList()`, `updateListPositions()`, `deleteList()`
`reminderApi.ts`: `getRemindersByList()`, `getSmartList()`, `getReminder()`, `createReminder()`, `updateReminder()`, `toggleComplete()`, `updatePositions()`, `deleteReminder()`, `searchReminders()`
`tagApi.ts`: `getTags()`, `createTag()`, `updateTag()`, `deleteTag()`

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/types/ frontend/src/api/
git commit -m "feat: add TypeScript types and API client layer"
```

### Task 11: Zustand 스토어

**Files:**
- Create: `frontend/src/stores/listStore.ts`
- Create: `frontend/src/stores/reminderStore.ts`
- Create: `frontend/src/stores/tagStore.ts`
- Create: `frontend/src/stores/uiStore.ts`

- [ ] **Step 1: listStore** — `lists[]`, `selectedListId`, `selectedSmartList`, `fetchLists()`, `createList()`, `updateList()`, `deleteList()`, `selectList(id)`, `selectSmartList(type)`

- [ ] **Step 2: reminderStore** — `reminders[]`, `selectedReminderId`, `fetchReminders()`, `fetchSmartList()`, `createReminder()`, `updateReminder()`, `toggleComplete()` (optimistic), `deleteReminder()`, `searchReminders()`

- [ ] **Step 3: tagStore** — `tags[]`, `fetchTags()`, `createTag()`, `updateTag()`, `deleteTag()`

- [ ] **Step 4: uiStore** — `isSidebarOpen`, `searchQuery`, `isSearching`, `toggleSidebar()`, `setSearchQuery()`, `toasts[]`, `addToast()`, `removeToast()`

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/stores/
git commit -m "feat: add Zustand stores for lists, reminders, tags, UI"
```

### Task 12: 글로벌 스타일 + CSS 변수 + App 레이아웃 + 라우팅

**Files:**
- Create: `frontend/src/styles/variables.css`
- Create: `frontend/src/styles/global.css`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/App.module.css`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: CSS 변수** — Apple 시스템 컬러 12색, 폰트 (SF Pro / system-ui), 사이드바 너비, 배경색, 그림자 등

- [ ] **Step 2: global.css** — reset, body 기본 스타일, 스크롤바 커스텀

- [ ] **Step 3: App.tsx + App.module.css** — BrowserRouter, 사이드바+메인 2단 레이아웃, 라우트 설정:
```
/ → redirect /smart/all
/list/:id → MainArea
/smart/:type → MainArea
/search → SearchResults
```

- [ ] **Step 4: 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 성공

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/
git commit -m "feat: add global styles, CSS variables, app layout and routing"
```

## Chunk 5: Frontend Sidebar Components

### Task 13: Sidebar 셸 + SearchBar

**Files:**
- Create: `frontend/src/components/Sidebar/Sidebar.tsx` & `.module.css`
- Create: `frontend/src/components/Sidebar/SearchBar.tsx` & `.module.css`

- [ ] **Step 1: Sidebar.tsx** — 반투명 배경 (backdrop-filter:blur), 내부에 SearchBar + SmartListGroup + 구분선 + UserListGroup + AddListButton 배치. 768px 이하 숨김 + 햄버거 메뉴 토글.

- [ ] **Step 2: SearchBar.tsx** — 돋보기 아이콘, input, uiStore.setSearchQuery 연동. 입력 시 `/search`로 navigate. 비우면 이전 라우트 복귀.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/Sidebar/Sidebar.* frontend/src/components/Sidebar/SearchBar.*
git commit -m "feat: add Sidebar shell and SearchBar component"
```

### Task 14: SmartListGroup + SmartListItem

**Files:**
- Create: `frontend/src/components/Sidebar/SmartListGroup.tsx` & `.module.css`
- Create: `frontend/src/components/Sidebar/SmartListItem.tsx` & `.module.css`

- [ ] **Step 1: SmartListItem** — 원형 아이콘 (고유 색상), 이름, 건수 배지. 클릭 → `/smart/{type}`. 선택된 항목 하이라이트.

각 스마트 리스트 정의:
```typescript
const SMART_LISTS = [
  { type: 'today', name: '오늘', icon: '📅', color: '#007AFF' },
  { type: 'scheduled', name: '예정', icon: '📆', color: '#FF3B30' },
  { type: 'all', name: '전체', icon: '📋', color: '#5856D6' },
  { type: 'flagged', name: '플래그 지정됨', icon: '🚩', color: '#FF9500' },
  { type: 'completed', name: '완료됨', icon: '✅', color: '#34C759' },
];
```

- [ ] **Step 2: SmartListGroup** — 2열 카드 그리드로 SmartListItem 5개 렌더링. 사이드바 카운트는 별도 API 호출 또는 reminderStore에서.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/Sidebar/SmartList*
git commit -m "feat: add SmartListGroup and SmartListItem components"
```

### Task 15: UserListGroup + UserListItem + AddListButton

**Files:**
- Create: `frontend/src/components/Sidebar/UserListGroup.tsx` & `.module.css`
- Create: `frontend/src/components/Sidebar/UserListItem.tsx` & `.module.css`
- Create: `frontend/src/components/Sidebar/AddListButton.tsx` & `.module.css`

- [ ] **Step 1: UserListItem** — 색상 원형 아이콘 + 이름 + 미완료 건수. 클릭 → `/list/{id}`. 우클릭 컨텍스트 메뉴 (편집/삭제).

- [ ] **Step 2: UserListGroup** — "나의 목록" 헤더 + listStore.lists 순회하여 UserListItem 렌더링.

- [ ] **Step 3: AddListButton** — "목록 추가" 버튼 + 모달/인라인 입력 (이름, 색상 팔레트 12색, 아이콘 선택).

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/components/Sidebar/UserList* frontend/src/components/Sidebar/AddList*
git commit -m "feat: add UserListGroup, UserListItem, AddListButton"
```

## Chunk 6: Frontend Main Area Components

### Task 16: MainArea + ListHeader

**Files:**
- Create: `frontend/src/components/MainArea/MainArea.tsx` & `.module.css`
- Create: `frontend/src/components/MainArea/ListHeader.tsx` & `.module.css`

- [ ] **Step 1: MainArea** — URL 파라미터(listId 또는 smartListType) 에 따라 reminderStore.fetchReminders() 또는 fetchSmartList() 호출. 리마인더 목록 + 헤더 + 추가 버튼 렌더링. 빈 상태("리마인더 없음") 처리.

- [ ] **Step 2: ListHeader** — 리스트 이름(크게, 색상 적용) + 건수 표시. 스마트 리스트일 때는 해당 이름/아이콘 표시.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/MainArea/MainArea.* frontend/src/components/MainArea/ListHeader.*
git commit -m "feat: add MainArea and ListHeader components"
```

### Task 17: ReminderList + ReminderItem

**Files:**
- Create: `frontend/src/components/MainArea/ReminderList.tsx` & `.module.css`
- Create: `frontend/src/components/MainArea/ReminderItem.tsx` & `.module.css`

- [ ] **Step 1: ReminderItem** — 원형 체크박스 (리스트 색상 테두리) + 제목 텍스트. 완료 체크 시 fade-out 1초 애니메이션 → optimistic update. 클릭 시 selectedReminderId 설정 → 인라인 확장.

- [ ] **Step 2: ReminderList** — reminders 배열 순회, 각 ReminderItem + 하위 SubtaskList 렌더링.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/MainArea/ReminderList.* frontend/src/components/MainArea/ReminderItem.*
git commit -m "feat: add ReminderList and ReminderItem with completion animation"
```

### Task 18: ReminderDetail (인라인 편집)

**Files:**
- Create: `frontend/src/components/MainArea/ReminderDetail.tsx` & `.module.css`

- [ ] **Step 1: ReminderDetail** — selectedReminderId 항목 아래에 확장 표시. 편집 필드들:
- 제목 (텍스트 입력)
- 메모 (textarea)
- 날짜/시간 (date/time input)
- 우선순위 (드롭다운 NONE/LOW/MEDIUM/HIGH)
- 플래그 (토글)
- 태그 (다중 선택, 기존 태그 목록 + 새 태그 생성)
- 서브태스크 목록 + 추가

변경 시 onBlur 또는 디바운스로 PUT /api/reminders/{id} 호출.

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/components/MainArea/ReminderDetail.*
git commit -m "feat: add ReminderDetail inline editing component"
```

### Task 19: AddReminderButton + 서브태스크

**Files:**
- Create: `frontend/src/components/MainArea/AddReminderButton.tsx` & `.module.css`

- [ ] **Step 1: AddReminderButton** — 하단 "+" 버튼, 클릭 시 빈 ReminderItem을 목록 끝에 추가하고 자동 포커스. Enter로 생성 완료, Escape로 취소.

- [ ] **Step 2: SubtaskList 컴포넌트 생성**

`frontend/src/components/MainArea/SubtaskList.tsx` & `.module.css`:
- 부모 리마인더의 subtasks 배열을 받아 ReminderItem을 들여쓰기(padding-left)하여 렌더링
- 서브태스크 추가 버튼 (+ 하위 항목) 포함
- 새 서브태스크 생성 시 `parentId`를 현재 리마인더의 id로 설정

ReminderDetail 내에서 SubtaskList를 import하여 하단에 렌더링.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/MainArea/AddReminderButton.* frontend/src/components/MainArea/SubtaskList.*
git commit -m "feat: add AddReminderButton, SubtaskList components"
```

## Chunk 7: Frontend Search, Toast, Polish

### Task 20: SearchResults + Toast

**Files:**
- Create: `frontend/src/components/Search/SearchResults.tsx` & `.module.css`
- Create: `frontend/src/components/common/Toast.tsx` & `.module.css`

- [ ] **Step 1: SearchResults** — uiStore.searchQuery를 디바운스(300ms)로 `/api/reminders/search?q=` 호출. 결과를 ReminderItem으로 렌더링. 빈 결과 시 "결과 없음" 표시.

- [ ] **Step 2: Toast** — 화면 우상단, 자동 3초 후 사라짐. uiStore.toasts 배열. API 실패 시 "업데이트 실패, 되돌렸습니다" 등 메시지 표시.

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/Search/ frontend/src/components/common/
git commit -m "feat: add SearchResults and Toast notification components"
```

### Task 21: 반응형 디자인 + Apple 스타일 폴리시

**Files:**
- Modify: `frontend/src/App.module.css`
- Modify: `frontend/src/components/Sidebar/Sidebar.module.css`
- Modify: various component CSS files

- [ ] **Step 1: 반응형** — 768px 이하에서 사이드바 숨김, 햄버거 아이콘으로 토글 (uiStore.isSidebarOpen). 오버레이 형태로 사이드바 표시.

- [ ] **Step 2: Apple 스타일 디테일**
- SF Pro / system-ui 폰트 패밀리
- 사이드바 backdrop-filter: blur(20px)
- 선택 항목 하이라이트 애니메이션 (transition 0.2s)
- 완료 체크 fade-out (opacity 1→0, 1초)
- 부드러운 호버 효과
- 리스트 색상 원형 아이콘

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/
git commit -m "feat: add responsive design and Apple-style UI polish"
```

### Task 22: 프론트엔드 통합 확인

- [ ] **Step 1: 백엔드 실행** — `cd backend && ./gradlew bootRun`
- [ ] **Step 2: 프론트엔드 실행** — `cd frontend && npm run dev`
- [ ] **Step 3: 브라우저에서 전체 기능 수동 테스트**
- 기본 리스트 "미리 알림" 표시 확인
- 리마인더 CRUD (생성/수정/삭제/완료)
- 스마트 리스트 5종 확인
- 태그 추가/편집/삭제
- 검색 동작
- 서브태스크 추가/완료
- 반응형 사이드바 토글
- [ ] **Step 4: 최종 커밋**

```bash
git add .
git commit -m "feat: complete Apple Reminders web clone - full stack integration"
```

### Task 23: 프론트엔드 테스트

**Files:**
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/setupTests.ts`
- Create: `frontend/src/__tests__/stores/listStore.test.ts`
- Create: `frontend/src/__tests__/stores/reminderStore.test.ts`
- Create: `frontend/src/__tests__/components/ReminderItem.test.tsx`
- Create: `frontend/src/__tests__/components/SmartListItem.test.tsx`

- [ ] **Step 1: Vitest 설정**

`frontend/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
```

`frontend/src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 2: 스토어 테스트**

`listStore.test.ts`: fetch mock으로 fetchLists, createList, deleteList 동작 확인
`reminderStore.test.ts`: fetchReminders, toggleComplete (optimistic update + rollback), searchReminders 동작 확인

- [ ] **Step 3: 컴포넌트 테스트**

`ReminderItem.test.tsx`: 렌더링, 체크박스 클릭 시 toggleComplete 호출 확인
`SmartListItem.test.tsx`: 렌더링, 클릭 시 navigate 확인, 건수 배지 표시 확인

- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/vitest.config.ts frontend/src/setupTests.ts frontend/src/__tests__/
git commit -m "feat: add frontend tests for stores and key components"
```
