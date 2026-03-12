package com.example.reminders.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PositionUpdateRequest(
    @NotNull List<Long> orderedIds
) {}
