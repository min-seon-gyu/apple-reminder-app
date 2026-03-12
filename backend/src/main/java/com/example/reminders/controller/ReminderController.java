package com.example.reminders.controller;

import com.example.reminders.dto.PositionUpdateRequest;
import com.example.reminders.dto.ReminderRequest;
import com.example.reminders.dto.ReminderResponse;
import com.example.reminders.service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getByList(
            @RequestParam Long listId,
            @RequestParam(defaultValue = "false") boolean includeCompleted) {
        return ResponseEntity.ok(reminderService.getByListId(listId, includeCompleted));
    }

    @GetMapping("/smart/counts")
    public ResponseEntity<Map<String, Long>> getSmartListCounts() {
        return ResponseEntity.ok(reminderService.getSmartListCounts());
    }

    @GetMapping("/smart/{type}")
    public ResponseEntity<List<ReminderResponse>> getSmartList(@PathVariable String type) {
        return ResponseEntity.ok(reminderService.getSmartList(type));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ReminderResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(reminderService.search(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReminderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> create(@Valid @RequestBody ReminderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ReminderRequest request) {
        return ResponseEntity.ok(reminderService.update(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ReminderResponse> toggleComplete(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.toggleComplete(id));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<Void> updatePositions(
            @PathVariable Long id,
            @Valid @RequestBody PositionUpdateRequest request) {
        reminderService.updatePositions(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reminderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
