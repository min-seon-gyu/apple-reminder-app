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

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TagControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateAndGetTags() throws Exception {
        Map<String, String> body = Map.of("name", "urgent");

        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("urgent")))
            .andExpect(jsonPath("$.id", notNullValue()));

        mockMvc.perform(get("/api/tags"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].name", hasItem("urgent")));
    }

    @Test
    void testUpdateTag() throws Exception {
        // Create a tag first
        Map<String, String> createBody = Map.of("name", "work");
        MvcResult createResult = mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isCreated())
            .andReturn();

        Map<?, ?> created = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        Long id = ((Number) created.get("id")).longValue();

        // Update the tag
        Map<String, String> updateBody = Map.of("name", "personal");
        mockMvc.perform(put("/api/tags/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("personal")))
            .andExpect(jsonPath("$.id", is(id.intValue())));
    }

    @Test
    void testDeleteTag() throws Exception {
        // Create a tag
        Map<String, String> body = Map.of("name", "to-delete");
        MvcResult createResult = mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andReturn();

        Map<?, ?> created = objectMapper.readValue(createResult.getResponse().getContentAsString(), Map.class);
        Long id = ((Number) created.get("id")).longValue();

        // Delete the tag
        mockMvc.perform(delete("/api/tags/" + id))
            .andExpect(status().isNoContent());

        // Verify it's gone from the list
        mockMvc.perform(get("/api/tags"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].id", not(hasItem(id.intValue()))));
    }

    @Test
    void testDuplicateTagName() throws Exception {
        Map<String, String> body = Map.of("name", "duplicate-tag");

        // Create first tag
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated());

        // Attempt to create duplicate — expect 409 Conflict
        mockMvc.perform(post("/api/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isConflict());
    }
}
