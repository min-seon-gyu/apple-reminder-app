package com.example.reminders.dto;

import java.time.LocalDateTime;

public record ReminderListResponse(
    Long id, String name, String color, String icon,
    Integer position, long incompleteCount,
    LocalDateTime createdAt, LocalDateTime updatedAt
) {}
