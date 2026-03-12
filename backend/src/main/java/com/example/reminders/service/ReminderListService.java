package com.example.reminders.service;

import com.example.reminders.dto.PositionUpdateRequest;
import com.example.reminders.dto.ReminderListRequest;
import com.example.reminders.dto.ReminderListResponse;
import com.example.reminders.entity.ReminderList;
import com.example.reminders.exception.ResourceNotFoundException;
import com.example.reminders.repository.ReminderListRepository;
import com.example.reminders.repository.ReminderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class ReminderListService {

    private static final Set<String> VALID_COLORS = Set.of(
        "red", "orange", "yellow", "green", "cyan", "blue",
        "purple", "pink", "brown", "gray", "indigo", "teal"
    );

    private static final Set<String> VALID_ICONS = Set.of(
        "list", "bookmark", "pin", "gift", "birthday", "work",
        "school", "home", "shopping", "health", "travel", "finance"
    );

    private final ReminderListRepository reminderListRepository;
    private final ReminderRepository reminderRepository;

    public ReminderListService(ReminderListRepository reminderListRepository,
                               ReminderRepository reminderRepository) {
        this.reminderListRepository = reminderListRepository;
        this.reminderRepository = reminderRepository;
    }

    @Transactional(readOnly = true)
    public List<ReminderListResponse> getAllLists() {
        return reminderListRepository.findAllByOrderByPositionAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    public ReminderListResponse createList(ReminderListRequest request) {
        validateColor(request.color());
        validateIcon(request.icon());

        int maxPosition = reminderListRepository.findAllByOrderByPositionAsc().stream()
            .mapToInt(ReminderList::getPosition)
            .max()
            .orElse(0);

        ReminderList list = new ReminderList();
        list.setName(request.name());
        list.setColor(request.color());
        list.setIcon(request.icon());
        list.setPosition(maxPosition + 1);

        return toResponse(reminderListRepository.save(list));
    }

    public ReminderListResponse updateList(Long id, ReminderListRequest request) {
        ReminderList list = reminderListRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + id));

        validateColor(request.color());
        validateIcon(request.icon());

        list.setName(request.name());
        list.setColor(request.color());
        list.setIcon(request.icon());

        return toResponse(reminderListRepository.save(list));
    }

    public void updatePositions(PositionUpdateRequest request) {
        List<Long> orderedIds = request.orderedIds();
        for (int i = 0; i < orderedIds.size(); i++) {
            Long listId = orderedIds.get(i);
            ReminderList list = reminderListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + listId));
            list.setPosition(i + 1);
            reminderListRepository.save(list);
        }
    }

    public void deleteList(Long id) {
        ReminderList list = reminderListRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("List not found with id: " + id));
        reminderListRepository.delete(list);
    }

    private ReminderListResponse toResponse(ReminderList list) {
        long incompleteCount = reminderRepository.countByListIdAndIsCompletedFalse(list.getId());
        return new ReminderListResponse(
            list.getId(),
            list.getName(),
            list.getColor(),
            list.getIcon(),
            list.getPosition(),
            incompleteCount,
            list.getCreatedAt(),
            list.getUpdatedAt()
        );
    }

    private void validateColor(String color) {
        if (!VALID_COLORS.contains(color)) {
            throw new IllegalArgumentException("Invalid color: " + color);
        }
    }

    private void validateIcon(String icon) {
        if (!VALID_ICONS.contains(icon)) {
            throw new IllegalArgumentException("Invalid icon: " + icon);
        }
    }
}
