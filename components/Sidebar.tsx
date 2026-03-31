'use client';

import { Note } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ notes, selectedNoteId, onSelectNote, onCreateNote, isOpen, onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
    const preview = note.content ? note.content.substring(0, 40) + '...' : 'No additional text';
    const date = note.updatedAt ? format(note.updatedAt.toDate(), 'M/d/yy') : '';

    return (
      <button
        key={note.id}
        onClick={() => onSelectNote(note.id)}
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-[#F5F5F4] dark:border-gray-800 dark:bg-[#1C1C1E]">
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
      <ScrollArea className="flex-1 px-2">
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
      </ScrollArea>
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
    </div>
  );
}
