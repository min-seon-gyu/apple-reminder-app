package com.example.reminders.config;

import com.example.reminders.entity.ReminderList;
import com.example.reminders.repository.ReminderListRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(ReminderListRepository reminderListRepository) {
        return args -> {
            if (reminderListRepository.countBy() == 0) {
                ReminderList defaultList = new ReminderList();
                defaultList.setName("미리 알림");
                defaultList.setColor("blue");
                defaultList.setIcon("list");
                defaultList.setPosition(1);
                reminderListRepository.save(defaultList);
            }
        };
    }
}
