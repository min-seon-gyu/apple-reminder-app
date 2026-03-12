package com.example.reminders.controller;

import com.example.reminders.dto.PositionUpdateRequest;
import com.example.reminders.dto.ReminderListRequest;
import com.example.reminders.dto.ReminderListResponse;
import com.example.reminders.service.ReminderListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
public class ReminderListController {

    private final ReminderListService reminderListService;

    public ReminderListController(ReminderListService reminderListService) {
        this.reminderListService = reminderListService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderListResponse>> getAllLists() {
        return ResponseEntity.ok(reminderListService.getAllLists());
    }

    @PostMapping
    public ResponseEntity<ReminderListResponse> createList(@Valid @RequestBody ReminderListRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderListService.createList(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderListResponse> updateList(
            @PathVariable Long id,
            @Valid @RequestBody ReminderListRequest request) {
        return ResponseEntity.ok(reminderListService.updateList(id, request));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<Void> updatePositions(
            @PathVariable Long id,
            @Valid @RequestBody PositionUpdateRequest request) {
        reminderListService.updatePositions(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        reminderListService.deleteList(id);
        return ResponseEntity.noContent().build();
    }
}
