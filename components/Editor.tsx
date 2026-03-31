'use client';

import { Note } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Pin, Trash2, PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Editor({ note, onUpdate, onDelete, onToggleSidebar, isSidebarOpen }: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = (updates: Partial<Note>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(updates);
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedUpdate({ title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedUpdate({ content: e.target.value });
  };

  const handleTogglePin = () => {
    onUpdate({ isPinned: !note.isPinned });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onUpdate({ deadline: Timestamp.fromDate(date) });
    } else {
      onUpdate({ deadline: null });
    }
  };

  const formattedDate = note.updatedAt ? format(note.updatedAt.toDate(), "MMMM d, yyyy 'at' h:mm a") : '';

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#121212]">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePin}
            className={cn("hover:text-gray-900 dark:hover:text-gray-100", note.isPinned ? "text-[#F2C94C]" : "text-gray-500 dark:text-gray-400")}
          >
            <Pin className="h-5 w-5" />
          </Button>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("hover:text-gray-900 dark:hover:text-gray-100", note.deadline ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400")}
                />
              }
            >
              <Clock className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={note.deadline ? note.deadline.toDate() : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger className="flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400">
              <Trash2 className="h-5 w-5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 lg:px-12 lg:py-10 bg-white dark:bg-transparent">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-xs font-medium text-gray-400 dark:text-gray-500">{formattedDate}</p>
          
          {note.deadline && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <CalendarIcon className="h-4 w-4" />
              <span>Deadline: {format(note.deadline.toDate(), 'MMMM d, yyyy')}</span>
            </div>
          )}

          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            className="mb-4 h-auto border-none bg-transparent px-0 text-3xl font-bold shadow-none focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 dark:bg-transparent dark:border-none"
          />
          <Textarea
            placeholder="Start typing..."
            value={content}
            onChange={handleContentChange}
            className="min-h-[500px] resize-none border-none bg-transparent px-0 text-base leading-relaxed shadow-none focus-visible:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 dark:bg-transparent dark:border-none"
          />
        </div>
      </div>
    </div>
  );
}
