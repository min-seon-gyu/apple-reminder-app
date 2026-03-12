package com.example.reminders.repository;

import com.example.reminders.entity.ReminderList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderListRepository extends JpaRepository<ReminderList, Long> {
    List<ReminderList> findAllByOrderByPositionAsc();
    int countBy();
}
