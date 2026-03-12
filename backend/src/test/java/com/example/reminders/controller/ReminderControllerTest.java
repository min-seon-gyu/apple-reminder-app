package com.example.reminders.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReminderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Helper: get the default list id
    private Long getDefaultListId() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andReturn();
        List<?> lists = objectMapper.readValue(result.getResponse().getContentAsString(), List.class);
        Map<?, ?> first = (Map<?, ?>) lists.get(0);
        return ((Number) first.get("id")).longValue();
    }

    // Helper: create a reminder and return response map
    private Map<?, ?> createReminder(Map<String, Object> body) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), Map.class);
    }

    @Test
    void testCreateReminder() throws Exception {
        Long listId = getDefaultListId();

        Map<String, Object> body = Map.of(
            "listId", listId,
            "title", "Buy groceries"
        );

        mockMvc.perform(post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", notNullValue()))
            .andExpect(jsonPath("$.title", is("Buy groceries")))
            .andExpect(jsonPath("$.listId", is(listId.intValue())))
            .andExpect(jsonPath("$.isCompleted", is(false)));
    }

    @Test
    void testCreateReminderDueTimeWithoutDate() throws Exception {
        Long listId = getDefaultListId();

        Map<String, Object> body = Map.of(
            "listId", listId,
            "title", "Invalid reminder",
            "dueTime", "10:00:00"
        );

        mockMvc.perform(post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateSubtask() throws Exception {
        Long listId = getDefaultListId();

        // Create parent reminder
        Map<?, ?> parent = createReminder(Map.of("listId", listId, "title", "Parent task"));
        Long parentId = ((Number) parent.get("id")).longValue();

        // Create subtask
        Map<String, Object> subtaskBody = Map.of(
            "listId", listId,
            "parentId", parentId,
            "title", "Subtask item"
        );

        mockMvc.perform(post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subtaskBody)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.parentId", is(parentId.intValue())))
            .andExpect(jsonPath("$.title", is("Subtask item")));
    }

    @Test
    void testCreateNestedSubtask() throws Exception {
        Long listId = getDefaultListId();

        // Create parent
        Map<?, ?> parent = createReminder(Map.of("listId", listId, "title", "Parent"));
        Long parentId = ((Number) parent.get("id")).longValue();

        // Create subtask (level 1)
        Map<?, ?> subtask = createReminder(Map.of("listId", listId, "parentId", parentId, "title", "Subtask"));
        Long subtaskId = ((Number) subtask.get("id")).longValue();

        // Attempt to create sub-subtask (level 2) — should fail with 400
        Map<String, Object> nestedBody = Map.of(
            "listId", listId,
            "parentId", subtaskId,
            "title", "Nested subtask"
        );

        mockMvc.perform(post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nestedBody)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testGetByListId() throws Exception {
        Long listId = getDefaultListId();

        // Create one reminder and complete it, one left incomplete
        Map<?, ?> r1 = createReminder(Map.of("listId", listId, "title", "Incomplete task"));
        Long r1Id = ((Number) r1.get("id")).longValue();

        Map<?, ?> r2 = createReminder(Map.of("listId", listId, "title", "Completed task"));
        Long r2Id = ((Number) r2.get("id")).longValue();

        // Complete the second reminder
        mockMvc.perform(patch("/api/reminders/" + r2Id + "/complete"))
            .andExpect(status().isOk());

        // GET without includeCompleted (default false) — only incomplete
        mockMvc.perform(get("/api/reminders").param("listId", listId.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(r1Id.intValue())))
            .andExpect(jsonPath("$[*].id", not(hasItem(r2Id.intValue()))));
    }

    @Test
    void testGetByListIdIncludeCompleted() throws Exception {
        Long listId = getDefaultListId();

        Map<?, ?> r1 = createReminder(Map.of("listId", listId, "title", "Incomplete task"));
        Long r1Id = ((Number) r1.get("id")).longValue();

        Map<?, ?> r2 = createReminder(Map.of("listId", listId, "title", "Completed task"));
        Long r2Id = ((Number) r2.get("id")).longValue();

        // Complete r2
        mockMvc.perform(patch("/api/reminders/" + r2Id + "/complete"))
            .andExpect(status().isOk());

        // GET with includeCompleted=true — both should appear
        mockMvc.perform(get("/api/reminders")
                .param("listId", listId.toString())
                .param("includeCompleted", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(r1Id.intValue())))
            .andExpect(jsonPath("$[*].id", hasItem(r2Id.intValue())));
    }

    @Test
    void testToggleComplete() throws Exception {
        Long listId = getDefaultListId();

        Map<?, ?> reminder = createReminder(Map.of("listId", listId, "title", "Toggle me"));
        Long reminderId = ((Number) reminder.get("id")).longValue();

        // Toggle to complete
        mockMvc.perform(patch("/api/reminders/" + reminderId + "/complete"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isCompleted", is(true)))
            .andExpect(jsonPath("$.completedAt", notNullValue()));

        // Toggle back to incomplete
        mockMvc.perform(patch("/api/reminders/" + reminderId + "/complete"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isCompleted", is(false)))
            .andExpect(jsonPath("$.completedAt", nullValue()));
    }

    @Test
    void testSmartListToday() throws Exception {
        Long listId = getDefaultListId();

        String today = LocalDate.now().toString();

        Map<?, ?> reminder = createReminder(Map.of(
            "listId", listId,
            "title", "Today's task",
            "dueDate", today
        ));
        Long reminderId = ((Number) reminder.get("id")).longValue();

        mockMvc.perform(get("/api/reminders/smart/today"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(reminderId.intValue())));
    }

    @Test
    void testSmartListFlagged() throws Exception {
        Long listId = getDefaultListId();

        Map<?, ?> reminder = createReminder(Map.of(
            "listId", listId,
            "title", "Flagged task",
            "isFlagged", true
        ));
        Long reminderId = ((Number) reminder.get("id")).longValue();

        mockMvc.perform(get("/api/reminders/smart/flagged"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(reminderId.intValue())));
    }

    @Test
    void testSearch() throws Exception {
        Long listId = getDefaultListId();

        Map<?, ?> r1 = createReminder(Map.of("listId", listId, "title", "Buy milk at the store"));
        Long r1Id = ((Number) r1.get("id")).longValue();

        Map<?, ?> r2 = createReminder(Map.of("listId", listId, "title", "Call dentist appointment"));
        Long r2Id = ((Number) r2.get("id")).longValue();

        // Search for "milk" should only return r1
        mockMvc.perform(get("/api/reminders/search").param("q", "milk"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", hasItem(r1Id.intValue())))
            .andExpect(jsonPath("$[*].id", not(hasItem(r2Id.intValue()))));
    }

    @Test
    void testSearchEmptyQuery() throws Exception {
        mockMvc.perform(get("/api/reminders/search").param("q", ""))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testDeleteCascadesSubtasks() throws Exception {
        Long listId = getDefaultListId();

        // Create parent
        Map<?, ?> parent = createReminder(Map.of("listId", listId, "title", "Parent to delete"));
        Long parentId = ((Number) parent.get("id")).longValue();

        // Create subtask
        Map<?, ?> subtask = createReminder(Map.of("listId", listId, "parentId", parentId, "title", "Child to delete"));
        Long subtaskId = ((Number) subtask.get("id")).longValue();

        // Delete parent
        mockMvc.perform(delete("/api/reminders/" + parentId))
            .andExpect(status().isNoContent());

        // Verify parent is gone — 404 from the API
        mockMvc.perform(get("/api/reminders/" + parentId))
            .andExpect(status().isNotFound());

        // Verify subtask is also gone — 404 from the API (cascade deleted)
        mockMvc.perform(get("/api/reminders/" + subtaskId))
            .andExpect(status().isNotFound());
    }

    @Test
    void testUpdateWithTags() throws Exception {
        Long listId = getDefaultListId();

        // Create two tags
        MvcResult tag1Result = mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "tag-alpha"))))
            .andExpect(status().isCreated())
            .andReturn();
        Map<?, ?> tag1 = objectMapper.readValue(tag1Result.getResponse().getContentAsString(), Map.class);
        Long tag1Id = ((Number) tag1.get("id")).longValue();

        MvcResult tag2Result = mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "tag-beta"))))
            .andExpect(status().isCreated())
            .andReturn();
        Map<?, ?> tag2 = objectMapper.readValue(tag2Result.getResponse().getContentAsString(), Map.class);
        Long tag2Id = ((Number) tag2.get("id")).longValue();

        // Create reminder with tag1
        Map<String, Object> createBody = new java.util.HashMap<>();
        createBody.put("listId", listId);
        createBody.put("title", "Tagged reminder");
        createBody.put("tagIds", List.of(tag1Id));

        Map<?, ?> created = createReminder(createBody);
        Long reminderId = ((Number) created.get("id")).longValue();

        // Verify tag1 is set
        mockMvc.perform(get("/api/reminders/" + reminderId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tags[*].id", hasItem(tag1Id.intValue())));

        // Update reminder with tag2 only
        Map<String, Object> updateBody = new java.util.HashMap<>();
        updateBody.put("listId", listId);
        updateBody.put("title", "Tagged reminder");
        updateBody.put("tagIds", List.of(tag2Id));

        mockMvc.perform(put("/api/reminders/" + reminderId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tags[*].id", hasItem(tag2Id.intValue())))
            .andExpect(jsonPath("$.tags[*].id", not(hasItem(tag1Id.intValue()))));
    }
}
