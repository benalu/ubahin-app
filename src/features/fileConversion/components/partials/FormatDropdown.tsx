// src/features/fileConversion/components/partials/FormatDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { getOutputFormatOptionsByFile, getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FormatDropdownProps {
  file: File;
  selected: string;
  onChange: (value: string) => void;
}

export function FormatDropdown({ file, selected, onChange }: FormatDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const options = getOutputFormatOptionsByFile(file);
  const category = getFileCategory(file);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="bg-secondary text-white rounded-xl px-3 sm:px-4 md:px-5 py-1 text-[18px] flex items-center gap-4 cursor-pointer"
      >
        .{selected}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 bg-muted text-white rounded-lg shadow-lg py-3 min-w-[260px] space-y-2 w-max left-0 ml-2"
          >
            <div className="space-y-1">
              <div className="text-secondary font-semibold text-xl text-center">{categoryLabel}</div>
            </div>
            <div className="border-t border-secondary w-full" />

            <div className="grid grid-cols-3 gap-2 px-3">
              {options.map((format) => (
                <button
                  key={format}
                  onClick={() => {
                    onChange(format);
                    setOpen(false);
                  }}
                  className={`px-1 py-1.5 rounded-md text-[18px] text-center transition-all cursor-pointer ${
                    selected === format
                      ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
                      : 'bg-gray-700 hover:bg-gray-500'
                  }`}
                >
                  .{format}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
