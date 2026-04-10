'use client';

import { Note } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Search, Pin, Calendar, FileText, ChevronLeft, ChevronRight, LogOut, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { format } from 'date-fns';
import { logout } from '@/firebase';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { motion, MotionValue, useTransform, useMotionValue } from 'motion/react';

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  isOpen: boolean;
  onToggle: () => void;
  x?: MotionValue<number>;
}

export function Sidebar({ notes, selectedNoteId, onSelectNote, onCreateNote, isOpen, onToggle, x }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const fallbackX = useMotionValue(0);
  const activeX = x || fallbackX;
  
  // Transform x (-288 to 0) to opacity (0 to 1)
  const overlayOpacity = useTransform(activeX, [-288, 0], [0, 1]);
  const pointerEvents = useTransform(activeX, (val) => val > -280 ? 'auto' : 'none');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const renderNoteItem = (note: Note) => {
    const isSelected = note.id === selectedNoteId;
    const title = note.title || 'New Note';
    
    // Strip HTML tags and decode common entities for preview
    const plainText = note.content 
      ? note.content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim() 
      : '';
    const preview = plainText ? plainText.substring(0, 40) + '...' : 'No additional text';
    const date = note.updatedAt ? format(note.updatedAt.toDate(), 'M/d/yy') : '';

    return (
      <button
        key={note.id}
        onClick={() => {
          onSelectNote(note.id);
          // Auto-close sidebar on mobile when a note is selected
          if (window.innerWidth < 768) {
            onToggle();
          }
        }}
        className={cn(
          'flex w-full flex-col items-start gap-1 rounded-lg px-4 py-3 text-left transition-colors',
          isSelected ? 'bg-[#F2C94C]/20 dark:bg-[#F2C94C]/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <div className="flex w-full items-center justify-between">
          <span className="truncate font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          {note.deadline && (
            <Calendar className="h-3 w-3 shrink-0 text-red-500 dark:text-red-400" />
          )}
        </div>
        <div className="flex w-full items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="shrink-0 font-medium">{date}</span>
          <span className="truncate">{preview}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      <motion.div 
        style={{ opacity: x ? overlayOpacity : (isOpen ? 1 : 0), pointerEvents: x ? pointerEvents : (isOpen ? 'auto' : 'none') }}
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 md:hidden" 
        onClick={onToggle}
      />
      <motion.div 
        style={x ? { x } : undefined}
        className={cn(
          "absolute inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-[#F5F5F4] dark:border-gray-800 dark:bg-[#1C1C1E] md:relative md:translate-x-0 md:!transform-none",
          !x && (isOpen ? "translate-x-0" : "-translate-x-full md:hidden")
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">All Notes</h2>
        <Button variant="ghost" size="icon" onClick={onCreateNote} className="h-8 w-8 text-[#F2C94C] hover:bg-gray-200 hover:text-[#E2B93C] dark:hover:bg-gray-800">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            className="h-9 w-full rounded-md border-none bg-gray-200/60 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-[#F2C94C] dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {pinnedNotes.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pinned</h3>
            <div className="space-y-1">{pinnedNotes.map(renderNoteItem)}</div>
          </div>
        )}
        {unpinnedNotes.length > 0 && (
          <div>
            <h3 className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes</h3>
            <div className="space-y-1">{unpinnedNotes.map(renderNoteItem)}</div>
          </div>
        )}
        {filteredNotes.length === 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">No notes found</div>
        )}
      </div>
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <ThemeToggle />
        <AlertDialog>
          <AlertDialogTrigger className="flex w-full items-center justify-start rounded-md px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will sign you out of your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
    </>
  );
}
