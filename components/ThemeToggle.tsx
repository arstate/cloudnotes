'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { auth } from '@/firebase';
import { updateUserTheme } from '@/lib/firebase-utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (auth.currentUser) {
      await updateUserTheme(auth.currentUser.uid, newTheme);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      {theme === 'light' ? (
        <Moon className="mr-2 h-4 w-4" />
      ) : (
        <Sun className="mr-2 h-4 w-4" />
      )}
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </Button>
  );
}
