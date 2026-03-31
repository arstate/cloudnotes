'use client';

import Auth from '@/components/Auth';
import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { useState, useEffect } from 'react';
import { Note, subscribeToNotes, createNote, deleteNote, updateNote } from '@/lib/firebase-utils';
import { auth } from '@/firebase';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribeNotes = subscribeToNotes(user.uid, (fetchedNotes) => {
          setNotes(fetchedNotes);
          if (fetchedNotes.length > 0) {
            setSelectedNoteId((prev) => prev || fetchedNotes[0].id);
          } else if (fetchedNotes.length === 0) {
            setSelectedNoteId(null);
          }
        });
        return () => unsubscribeNotes();
      } else {
        setNotes([]);
        setSelectedNoteId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleCreateNote = async () => {
    if (!auth.currentUser) return;
    try {
      const newNote = await createNote(auth.currentUser.uid);
      setSelectedNoteId(newNote.id);
    } catch (error) {
      console.error("Failed to create note", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateNote(id, updates);
    } catch (error) {
      console.error("Failed to update note", error);
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || null;

  return (
    <Auth>
      <div className="flex h-screen w-full overflow-hidden bg-white text-gray-900">
        <Sidebar 
          notes={notes} 
          selectedNoteId={selectedNoteId} 
          onSelectNote={setSelectedNoteId} 
          onCreateNote={handleCreateNote}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          {selectedNote ? (
            <Editor 
              key={selectedNote.id}
              note={selectedNote} 
              onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)} 
              onDelete={() => handleDeleteNote(selectedNote.id)}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-white text-gray-400">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500">No Note Selected</p>
              <p className="mt-1 text-sm">Select a note from the sidebar or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </Auth>
  );
}
