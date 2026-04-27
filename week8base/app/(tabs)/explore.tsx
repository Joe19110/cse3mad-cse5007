import {
  StyleSheet,
  Image,
  Platform,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  Text,
  Alert,
  FlatList,
} from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addDocument,
  deleteDocument,
  updateDocument,
  FirestoreDocument,
} from '@/services/firestoreService';
import { useFirestoreDocuments } from '@/hooks/useFirestore';

const COLLECTION_NAME = 'notes';

export default function TabTwoScreen() {
  const { user } = useAuth();
  const { documents, loading, error } = useFirestoreDocuments(COLLECTION_NAME);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add notes');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDocument(COLLECTION_NAME, {
        title: title.trim(),
        content: content.trim(),
        userId: user.uid,
        userEmail: user.email,
      });
      Alert.alert('Success', 'Note added successfully');
      setTitle('');
      setContent('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (docId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteDocument(COLLECTION_NAME, docId);
            Alert.alert('Success', 'Note deleted successfully');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const renderNote = ({ item }: { item: FirestoreDocument }) => (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
      <Text style={styles.noteMeta}>
        By {item.userEmail} • {new Date(item.createdAt?.toDate?.()).toLocaleDateString()}
      </Text>
      {user?.uid === item.userId && (
        <Button
          title="Delete"
          onPress={() => handleDeleteNote(item.id)}
          color="#FF3B30"
        />
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>Please log in to view and create notes</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a New Note</Text>

        <TextInput
          style={styles.input}
          placeholder="Note title"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          editable={!isSubmitting}
        />

        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="Note content"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
        />

        <Button
          title={isSubmitting ? 'Adding...' : 'Add Note'}
          onPress={handleAddNote}
          disabled={isSubmitting}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Notes</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No notes yet. Create one to get started!</Text>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={renderNote}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  contentInput: {
    height: 100,
    paddingTop: 10,
  },
  noteCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  noteMeta: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  errorText: {
    color: '#c33',
    fontSize: 13,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
