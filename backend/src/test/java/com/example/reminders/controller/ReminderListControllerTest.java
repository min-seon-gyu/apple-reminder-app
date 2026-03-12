package com.example.reminders.controller;

import com.example.reminders.entity.ReminderList;
import com.example.reminders.repository.ReminderListRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReminderListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReminderListRepository reminderListRepository;

    @Test
    void testGetAllLists() throws Exception {
        mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
            .andExpect(jsonPath("$[0].name", is("미리 알림")))
            .andExpect(jsonPath("$[0].incompleteCount", is(0)));
    }

    @Test
    void testCreateList() throws Exception {
        Map<String, String> body = Map.of(
            "name", "Work",
            "color", "red",
            "icon", "work"
        );

        mockMvc.perform(post("/api/lists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("Work")))
            .andExpect(jsonPath("$.color", is("red")))
            .andExpect(jsonPath("$.icon", is("work")))
            .andExpect(jsonPath("$.id", notNullValue()));
    }

    @Test
    void testCreateListInvalidColor() throws Exception {
        Map<String, String> body = Map.of(
            "name", "Test",
            "color", "invalid",
            "icon", "list"
        );

        mockMvc.perform(post("/api/lists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateList() throws Exception {
        // Get the default list id
        MvcResult result = mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andReturn();

        List<?> lists = objectMapper.readValue(result.getResponse().getContentAsString(), List.class);
        Map<?, ?> first = (Map<?, ?>) lists.get(0);
        Long id = ((Number) first.get("id")).longValue();

        Map<String, String> updateBody = Map.of(
            "name", "Updated Name",
            "color", "green",
            "icon", "home"
        );

        mockMvc.perform(put("/api/lists/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Updated Name")))
            .andExpect(jsonPath("$.color", is("green")))
            .andExpect(jsonPath("$.icon", is("home")));
    }

    @Test
    void testDeleteList() throws Exception {
        // Create a list to delete
        Map<String, String> body = Map.of(
            "name", "To Delete",
            "color", "pink",
            "icon", "bookmark"
        );

        MvcResult createResult = mockMvc.perform(post("/api/lists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andReturn();

        Map<?, ?> created = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        Long id = ((Number) created.get("id")).longValue();

        mockMvc.perform(delete("/api/lists/" + id))
            .andExpect(status().isNoContent());

        // Verify it's gone
        mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", not(hasItem(id.intValue()))));
    }

    @Test
    void testUpdatePositions() throws Exception {
        // Create two additional lists
        Map<String, String> body1 = Map.of("name", "List A", "color", "red", "icon", "work");
        Map<String, String> body2 = Map.of("name", "List B", "color", "blue", "icon", "home");

        MvcResult result1 = mockMvc.perform(post("/api/lists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body1)))
            .andExpect(status().isCreated())
            .andReturn();

        MvcResult result2 = mockMvc.perform(post("/api/lists")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body2)))
            .andExpect(status().isCreated())
            .andReturn();

        Map<?, ?> created1 = objectMapper.readValue(result1.getResponse().getContentAsString(), Map.class);
        Map<?, ?> created2 = objectMapper.readValue(result2.getResponse().getContentAsString(), Map.class);
        Long id1 = ((Number) created1.get("id")).longValue();
        Long id2 = ((Number) created2.get("id")).longValue();

        // Get all lists and get the default list id
        MvcResult allResult = mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andReturn();
        List<?> allLists = objectMapper.readValue(allResult.getResponse().getContentAsString(), List.class);
        Map<?, ?> defaultList = (Map<?, ?>) allLists.get(0);
        Long defaultId = ((Number) defaultList.get("id")).longValue();

        // Reorder: put list B first, list A second, default last
        Map<String, List<Long>> positionBody = Map.of("orderedIds", List.of(id2, id1, defaultId));

        mockMvc.perform(patch("/api/lists/" + id1 + "/position")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(positionBody)))
            .andExpect(status().isOk());

        // Verify new order
        mockMvc.perform(get("/api/lists"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id", is(id2.intValue())))
            .andExpect(jsonPath("$[1].id", is(id1.intValue())));
    }
}
