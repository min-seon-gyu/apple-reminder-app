import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useTagStore } from '../stores/tagStore';

interface TagSelectorProps {
  selectedTagIds: number[];
  onToggle: (tagId: number) => void;
  onCreateAndSelect: (tagId: number) => void;
}

export default function TagSelector({ selectedTagIds, onToggle, onCreateAndSelect }: TagSelectorProps) {
  const { tags, createTag } = useTagStore();
  const [newTagName, setNewTagName] = useState('');

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await createTag(newTagName.trim());
      onCreateAndSelect(tag.id);
      setNewTagName('');
    } catch {
      // silently fail — store-level error handling applies
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {tags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => onToggle(tag.id)}
            >
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder="새 태그"
          placeholderTextColor="#8E8E93"
          onSubmitEditing={handleCreate}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleCreate} disabled={!newTagName.trim()}>
          <Text style={[styles.addText, !newTagName.trim() && styles.addTextDisabled]}>추가</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
  },
  tagSelected: { backgroundColor: '#007AFF' },
  tagText: { fontSize: 15, color: '#000' },
  tagTextSelected: { color: '#FFFFFF' },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 8, padding: 10, fontSize: 15 },
  addText: { fontSize: 15, color: '#007AFF', fontWeight: '600' },
  addTextDisabled: { color: '#C7C7CC' },
});
