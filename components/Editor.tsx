'use client';

import { Note } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Pin, Trash2, PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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
    <div className="flex h-full flex-col bg-white">
      {/* Toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-gray-500 hover:text-gray-900">
            {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePin}
            className={cn("hover:text-gray-900", note.isPinned ? "text-[#F2C94C]" : "text-gray-500")}
          >
            <Pin className="h-5 w-5" />
          </Button>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("hover:text-gray-900", note.deadline ? "text-red-500" : "text-gray-500")}
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
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-gray-500 hover:text-red-600">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-xs font-medium text-gray-400">{formattedDate}</p>
          
          {note.deadline && (
            <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              <CalendarIcon className="h-4 w-4" />
              <span>Deadline: {format(note.deadline.toDate(), 'MMMM d, yyyy')}</span>
            </div>
          )}

          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            className="mb-4 h-auto border-none bg-transparent px-0 text-3xl font-bold shadow-none focus-visible:ring-0 placeholder:text-gray-300"
          />
          <Textarea
            placeholder="Start typing..."
            value={content}
            onChange={handleContentChange}
            className="min-h-[500px] resize-none border-none bg-transparent px-0 text-base leading-relaxed shadow-none focus-visible:ring-0 placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
