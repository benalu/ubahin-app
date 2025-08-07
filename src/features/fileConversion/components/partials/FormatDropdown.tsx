'use client';

import { useState, useRef, useEffect } from 'react';
import { getOutputFormatOptionsByFile, getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

interface FormatDropdownProps {
  file: File;
  selected: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
}

export function FormatDropdown({ file, selected, onChange, disabled = false }: FormatDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const options = getOutputFormatOptionsByFile(file);
  const category = getFileCategory(file);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  // ✅ Mount detection for SSR safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Enhanced position calculation with mobile-first approach
  const calculatePosition = (): DropdownPosition | null => {
    if (!buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 640; // sm breakpoint

    // ✅ Mobile: Full-width dropdown at bottom of screen
    if (isMobile) {
      return {
        top: viewportHeight - 280, // Fixed height from bottom
        left: 16, // 16px margin from edges
        width: viewportWidth - 32, // Full width minus margins
        maxHeight: 260,
        placement: 'bottom'
      };
    }

    // ✅ Desktop: Smart positioning relative to button
    const dropdownHeight = 280;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    const placement = spaceBelow >= dropdownHeight ? 'bottom' : 'top';
    
    // Calculate horizontal position
    let left = buttonRect.left;
    const dropdownWidth = 260;
    
    // ✅ Prevent overflow on right edge
    if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16;
    }
    
    // ✅ Prevent overflow on left edge
    if (left < 16) {
      left = 16;
    }

    return {
      top: placement === 'bottom' 
        ? buttonRect.bottom + 8 
        : buttonRect.top - dropdownHeight - 8,
      left,
      width: dropdownWidth,
      maxHeight: Math.min(dropdownHeight, 
        placement === 'bottom' ? spaceBelow - 20 : spaceAbove - 20
      ),
      placement
    };
  };

  // ✅ Handle dropdown open/close with position calculation
  const toggleDropdown = () => {
    if (disabled) return;
    
    if (!open) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
    
    setOpen(prev => !prev);
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // ✅ Handle window resize
  useEffect(() => {
    function handleResize() {
      if (open) {
        const newPosition = calculatePosition();
        setPosition(newPosition);
      }
    }

    if (open) {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [open]);

  // ✅ Close on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <>
      {/* ✅ Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`rounded-xl px-3 sm:px-4 md:px-5 py-1 text-[18px] flex items-center gap-4 transition-all ${
          disabled
            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
            : 'bg-secondary text-white cursor-pointer hover:bg-secondary/90'
        }`}
      >
        .{selected}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* ✅ Mobile Overlay */}
      {mounted && open && window.innerWidth < 640 && (
        createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] sm:hidden"
            onClick={() => setOpen(false)}
          />,
          document.body
        )
      )}

      {/* ✅ Enhanced Dropdown Menu */}
      {mounted && open && position && (
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ 
                opacity: 0, 
                scale: 0.95,
                y: position.placement === 'bottom' ? -8 : 8
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.95,
                y: position.placement === 'bottom' ? -8 : 8
              }}
              transition={{ duration: 0.15 }}
              className="fixed z-[110] bg-muted text-white rounded-lg shadow-2xl border border-white/10"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
              }}
            >
              {/* ✅ Mobile: Header with close button */}
              <div className="sm:hidden flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-secondary">
                  Pilih Format {categoryLabel}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              {/* ✅ Desktop: Category title */}
              <div className="hidden sm:block p-3 border-b border-white/10">
                <div className="text-secondary font-semibold text-xl text-center">
                  {categoryLabel}
                </div>
              </div>

              {/* ✅ Format Options Grid */}
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className={`grid gap-2 ${
                  window.innerWidth < 640 ? 'grid-cols-4' : 'grid-cols-3'
                }`}>
                  {options.map((format) => (
                    <motion.button
                      key={format}
                      onClick={() => {
                        onChange(format);
                        setOpen(false);
                      }}
                      className={`px-3 py-2 rounded-md text-base font-medium text-center transition-all cursor-pointer ${
                        selected === format
                          ? 'bg-gradient-to-r from-secondary to-indigo-600 text-white font-semibold'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      .{format}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ✅ Mobile: Action buttons */}
              <div className="sm:hidden p-4 border-t border-white/10">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-secondary text-white py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      )}
    </>
  );
}