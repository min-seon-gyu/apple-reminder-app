package com.example.reminders.service;

import com.example.reminders.dto.TagRequest;
import com.example.reminders.dto.TagResponse;
import com.example.reminders.entity.Reminder;
import com.example.reminders.entity.Tag;
import com.example.reminders.exception.ResourceNotFoundException;
import com.example.reminders.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public TagResponse createTag(TagRequest request) {
        Tag tag = new Tag();
        tag.setName(request.name());
        return toResponse(tagRepository.save(tag));
    }

    public TagResponse updateTag(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
        tag.setName(request.name());
        return toResponse(tagRepository.save(tag));
    }

    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));

        for (Reminder reminder : tag.getReminders()) {
            reminder.getTags().remove(tag);
        }

        tagRepository.delete(tag);
    }

    private TagResponse toResponse(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName());
    }
}
