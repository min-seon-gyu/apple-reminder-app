package com.example.reminders.dto;

import com.example.reminders.entity.Priority;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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
