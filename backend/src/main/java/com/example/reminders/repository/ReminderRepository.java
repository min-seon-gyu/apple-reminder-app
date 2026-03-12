package com.example.reminders.repository;

import com.example.reminders.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByListIdAndParentIsNullAndIsCompletedFalseOrderByPositionAsc(Long listId);
    List<Reminder> findByListIdAndParentIsNullOrderByPositionAsc(Long listId);
    List<Reminder> findByDueDateAndIsCompletedFalseAndParentIsNullOrderByPositionAsc(LocalDate date);
    List<Reminder> findByDueDateIsNotNullAndIsCompletedFalseAndParentIsNullOrderByDueDateAscPositionAsc();
    List<Reminder> findByIsCompletedFalseAndParentIsNullOrderByPositionAsc();
    List<Reminder> findByIsFlaggedTrueAndIsCompletedFalseAndParentIsNullOrderByPositionAsc();
    List<Reminder> findByIsCompletedTrueAndParentIsNullOrderByCompletedAtDesc();
    long countByDueDateAndIsCompletedFalse(LocalDate date);
    long countByDueDateIsNotNullAndIsCompletedFalse();
    long countByIsCompletedFalse();
    long countByIsFlaggedTrueAndIsCompletedFalse();
    long countByIsCompletedTrue();
    long countByListIdAndIsCompletedFalse(Long listId);
    @Query("SELECT DISTINCT r FROM Reminder r LEFT JOIN r.tags t WHERE r.isCompleted = false AND r.parent IS NULL AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.notes) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Reminder> search(@Param("q") String query);
    List<Reminder> findByParentIdOrderByPositionAsc(Long parentId);
}
