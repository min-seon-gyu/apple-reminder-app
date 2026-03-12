package com.example.reminders.service;

import com.example.reminders.dto.PositionUpdateRequest;
import com.example.reminders.dto.ReminderRequest;
import com.example.reminders.dto.ReminderResponse;
import com.example.reminders.dto.TagResponse;
import com.example.reminders.entity.Priority;
import com.example.reminders.entity.Reminder;
import com.example.reminders.entity.ReminderList;
import com.example.reminders.entity.Tag;
import com.example.reminders.exception.ResourceNotFoundException;
import com.example.reminders.repository.ReminderListRepository;
import com.example.reminders.repository.ReminderRepository;
import com.example.reminders.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderListRepository reminderListRepository;
    private final TagRepository tagRepository;

    public ReminderService(ReminderRepository reminderRepository,
                           ReminderListRepository reminderListRepository,
                           TagRepository tagRepository) {
        this.reminderRepository = reminderRepository;
        this.reminderListRepository = reminderListRepository;
        this.tagRepository = tagRepository;
    }

    public ReminderResponse create(ReminderRequest request) {
        if (request.dueTime() != null && request.dueDate() == null) {
            throw new IllegalArgumentException("dueTime requires dueDate");
        }

        ReminderList list = reminderListRepository.findById(request.listId())
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + request.listId()));

        Reminder reminder = new Reminder();
        reminder.setList(list);
        reminder.setTitle(request.title());
        reminder.setNotes(request.notes());
        reminder.setDueDate(request.dueDate());
        reminder.setDueTime(request.dueTime());
        reminder.setPriority(request.priority() != null ? request.priority() : Priority.NONE);
        reminder.setIsFlagged(request.isFlagged() != null ? request.isFlagged() : false);

        if (request.parentId() != null) {
            Reminder parent = reminderRepository.findById(request.parentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent reminder not found with id: " + request.parentId()));
            if (parent.getParent() != null) {
                throw new IllegalArgumentException("Subtasks cannot have subtasks");
            }
            reminder.setParent(parent);

            int maxPosition = reminderRepository.findByParentIdOrderByPositionAsc(request.parentId())
                .stream()
                .mapToInt(r -> r.getPosition() != null ? r.getPosition() : 0)
                .max()
                .orElse(0);
            reminder.setPosition(maxPosition + 1);
        } else {
            int maxPosition = reminderRepository.findByListIdAndParentIsNullOrderByPositionAsc(request.listId())
                .stream()
                .mapToInt(r -> r.getPosition() != null ? r.getPosition() : 0)
                .max()
                .orElse(0);
            reminder.setPosition(maxPosition + 1);
        }

        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> tags = tagRepository.findAllById(request.tagIds())
                .stream()
                .collect(Collectors.toSet());
            reminder.setTags(tags);
        }

        return toResponse(reminderRepository.save(reminder));
    }

    public ReminderResponse update(Long id, ReminderRequest request) {
        Reminder reminder = reminderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        if (request.dueTime() != null && request.dueDate() == null) {
            throw new IllegalArgumentException("dueTime requires dueDate");
        }

        reminder.setTitle(request.title());
        reminder.setNotes(request.notes());
        reminder.setDueDate(request.dueDate());
        reminder.setDueTime(request.dueTime());
        reminder.setPriority(request.priority() != null ? request.priority() : Priority.NONE);
        reminder.setIsFlagged(request.isFlagged() != null ? request.isFlagged() : false);

        reminder.getTags().clear();
        if (request.tagIds() != null && !request.tagIds().isEmpty()) {
            Set<Tag> tags = tagRepository.findAllById(request.tagIds())
                .stream()
                .collect(Collectors.toSet());
            reminder.getTags().addAll(tags);
        }

        return toResponse(reminderRepository.save(reminder));
    }

    @Transactional(readOnly = true)
    public ReminderResponse getById(Long id) {
        Reminder reminder = reminderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));
        return toResponse(reminder);
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> getByListId(Long listId, boolean includeCompleted) {
        List<Reminder> reminders;
        if (includeCompleted) {
            reminders = reminderRepository.findByListIdAndParentIsNullOrderByPositionAsc(listId);
        } else {
            reminders = reminderRepository.findByListIdAndParentIsNullAndIsCompletedFalseOrderByPositionAsc(listId);
        }
        return reminders.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> getSmartList(String type) {
        List<Reminder> reminders = switch (type) {
            case "today" -> reminderRepository.findByDueDateAndIsCompletedFalseAndParentIsNullOrderByPositionAsc(LocalDate.now());
            case "scheduled" -> reminderRepository.findByDueDateIsNotNullAndIsCompletedFalseAndParentIsNullOrderByDueDateAscPositionAsc();
            case "all" -> reminderRepository.findByIsCompletedFalseAndParentIsNullOrderByPositionAsc();
            case "flagged" -> reminderRepository.findByIsFlaggedTrueAndIsCompletedFalseAndParentIsNullOrderByPositionAsc();
            case "completed" -> reminderRepository.findByIsCompletedTrueAndParentIsNullOrderByCompletedAtDesc();
            default -> throw new IllegalArgumentException("Invalid smart list type: " + type);
        };
        return reminders.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getSmartListCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("today", reminderRepository.countByDueDateAndIsCompletedFalse(LocalDate.now()));
        counts.put("scheduled", reminderRepository.countByDueDateIsNotNullAndIsCompletedFalse());
        counts.put("all", reminderRepository.countByIsCompletedFalse());
        counts.put("flagged", reminderRepository.countByIsFlaggedTrueAndIsCompletedFalse());
        counts.put("completed", reminderRepository.countByIsCompletedTrue());
        return counts;
    }

    public ReminderResponse toggleComplete(Long id) {
        Reminder reminder = reminderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        boolean nowCompleted = !reminder.getIsCompleted();
        reminder.setIsCompleted(nowCompleted);
        reminder.setCompletedAt(nowCompleted ? LocalDateTime.now() : null);

        return toResponse(reminderRepository.save(reminder));
    }

    public void delete(Long id) {
        Reminder reminder = reminderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));
        // Explicitly delete subtasks by querying the repository directly,
        // as the lazy collection may not be populated in all transaction scenarios
        List<Reminder> subtasks = reminderRepository.findByParentIdOrderByPositionAsc(id);
        reminderRepository.deleteAll(subtasks);
        reminderRepository.delete(reminder);
    }

    public void updatePositions(PositionUpdateRequest request) {
        List<Long> orderedIds = request.orderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            Long reminderId = orderedIds.get(i);
            Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + reminderId));
            reminder.setPosition(i + 1);
            reminderRepository.save(reminder);
        }
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return reminderRepository.search(query).stream()
            .map(this::toResponse)
            .toList();
    }

    private ReminderResponse toResponse(Reminder reminder) {
        List<TagResponse> tagResponses = reminder.getTags().stream()
            .map(tag -> new TagResponse(tag.getId(), tag.getName()))
            .toList();

        List<ReminderResponse> subtaskResponses = reminder.getSubtasks().stream()
            .map(this::toResponse)
            .toList();

        return new ReminderResponse(
            reminder.getId(),
            reminder.getList() != null ? reminder.getList().getId() : null,
            reminder.getParent() != null ? reminder.getParent().getId() : null,
            reminder.getTitle(),
            reminder.getNotes(),
            reminder.getIsCompleted(),
            reminder.getCompletedAt(),
            reminder.getDueDate(),
            reminder.getDueTime(),
            reminder.getPriority(),
            reminder.getIsFlagged(),
            reminder.getPosition(),
            tagResponses,
            subtaskResponses,
            reminder.getCreatedAt(),
            reminder.getUpdatedAt()
        );
    }
}
