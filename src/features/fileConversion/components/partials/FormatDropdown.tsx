'use client';

import { useState, useRef, useEffect } from 'react';
import { getOutputFormatOptionsByFile, getFileCategory } from '@/features/fileConversion/lib/fileUtils';
import { ChevronDown} from 'lucide-react';
import {  motion } from 'framer-motion';
import { DropdownMenu } from './DropdownMenu';

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
      {/* Trigger Button */}
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

      {/* DropdownMenu */}
      <DropdownMenu
        isOpen={open}
        mounted={mounted}
        dropdownRef={dropdownRef}
        options={[...options]}
        selected={selected}
        onSelect={format => {
          onChange(format);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
        dropdownPosition={position || { top: 0, left: 0 }}
        header={
          <h3 className="text-lg font-semibold text-secondary mx-auto text-center">
            {categoryLabel}
          </h3>
        }
        isMobile={typeof window !== 'undefined' && window.innerWidth < 640}
      />
    </>
  );
}