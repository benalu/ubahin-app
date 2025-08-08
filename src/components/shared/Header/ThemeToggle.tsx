// src/components/shared/Header/ThemeToggle.tsx
'use client';

import { Moon } from 'lucide-react';

export default function ThemeToggle() {
  return (
    <button
      type="button"
      className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
      aria-label="Toggle dark mode"
    >
      <Moon className="w-5 h-5 text-black" />
    </button>
  );
}
