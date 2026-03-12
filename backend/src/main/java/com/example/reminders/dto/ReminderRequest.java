package com.example.reminders.dto;

import com.example.reminders.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
