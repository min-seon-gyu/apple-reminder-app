package com.example.reminders.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReminderListRequest(
    @NotBlank @Size(max = 50) String name,
    @NotBlank String color,
    @NotBlank String icon
) {}
