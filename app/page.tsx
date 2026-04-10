'use client';

import Auth from '@/components/Auth';
import { Sidebar } from '@/components/Sidebar';
import { Editor } from '@/components/Editor';
import { useState, useEffect } from 'react';
import { Note, subscribeToNotes, createNote, deleteNote, updateNote, subscribeToUserTheme } from '@/lib/firebase-utils';
import { auth } from '@/firebase';
import { useTheme } from 'next-themes';

import { motion, useMotionValue, animate } from 'motion/react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to false on mobile, we can handle desktop via CSS or effect
  const { setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(true);

  const sidebarWidth = 288; // w-72 is 18rem = 288px
  const x = useMotionValue(-sidebarWidth);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      animate(x, isSidebarOpen ? 0 : -sidebarWidth, { type: 'spring', bounce: 0, duration: 0.3 });
    } else {
      x.set(0);
    }
  }, [isSidebarOpen, isMobile, x, sidebarWidth]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    const delta = currentX - touchStart;
    
    // Only allow opening from the left edge (e.g., within 30px)
    if (!isSidebarOpen && touchStart > 30) return;

    let newX = isSidebarOpen ? delta : -sidebarWidth + delta;
    newX = Math.max(-sidebarWidth, Math.min(0, newX));
    x.set(newX);
  };

  const onTouchEndHandler = () => {
    if (!isMobile || touchStart === null) return;
    const currentX = x.get();
    
    if (currentX > -sidebarWidth / 2) {
      setIsSidebarOpen(true);
      animate(x, 0, { type: 'spring', bounce: 0, duration: 0.3 });
    } else {
      setIsSidebarOpen(false);
      animate(x, -sidebarWidth, { type: 'spring', bounce: 0, duration: 0.3 });
    }
    setTouchStart(null);
  };

  useEffect(() => {
    // Open sidebar by default on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSidebarOpen(true);
    }
  }, []);

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
        
        const unsubscribeTheme = subscribeToUserTheme(user.uid, (theme) => {
          setTheme(theme);
        });
        
        return () => {
          unsubscribeNotes();
          unsubscribeTheme();
        };
      } else {
        setNotes([]);
        setSelectedNoteId(null);
      }
    });

    return () => unsubscribeAuth();
  }, [setTheme]);

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
      <div 
        className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndHandler}
      >
        <Sidebar 
          notes={notes} 
          selectedNoteId={selectedNoteId} 
          onSelectNote={setSelectedNoteId} 
          onCreateNote={handleCreateNote}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          x={x}
          isMobile={isMobile}
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
            <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-400 dark:text-gray-500">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
                <svg className="h-8 w-8 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No Note Selected</p>
              <p className="mt-1 text-sm">Select a note from the sidebar or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </Auth>
  );
}
