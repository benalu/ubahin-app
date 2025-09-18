// src/features/fileConversion/components/partials/FileToolbarDropdown.tsx

'use client';

import { ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { RefObject, useId, KeyboardEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';


interface FileToolbarDropdownProps {
  selectedFormat: string | null;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  getButtonText: () => string;
  allSameCategory: boolean;
  availableFormats: string[];
}

export function FileToolbarDropdown({
  selectedFormat,
  isDropdownOpen,
  toggleDropdown,
  buttonRef,
  getButtonText,
  allSameCategory,
  availableFormats,
}: FileToolbarDropdownProps) {
  const dropdownId = useId();
  const lastPointerTypeRef = useRef<'' | 'mouse' | 'pen' | 'touch'>('');
  

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement> | null) => {
    if (!event || !event.currentTarget) return;

    const pointerType = event.pointerType as 'mouse' | 'pen' | 'touch';

    lastPointerTypeRef.current = pointerType;

    // Untuk mouse/pen, toggle di pointerdown
    if (pointerType !== 'touch') {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown();
    }
    // Untuk touch, jangan lakukan apapun di pointerdown
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    // Untuk touch, toggle di pointerup
    if (event.pointerType === 'touch') {
      event.preventDefault();
      event.stopPropagation();
      toggleDropdown();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape' && isDropdownOpen) {
      e.preventDefault();
      toggleDropdown();
    }
  };

  const disabled = !allSameCategory || availableFormats.length === 0;

  const baseBtnClass =
    'w-full sm:w-auto sm:min-w-[100px] rounded-full px-4 py-6 text-sm font-medium cursor-pointer ' +
    'inline-flex items-center gap-2 justify-between shadow-sm hover:shadow-md';

  const stateClass = disabled
    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
    : selectedFormat
    ? 'bg-muted-foreground text-white'
    : 'bg-secondary hover:bg-secondary/90 text-white';

  return (
    <div className="flex items-center justify-between sm:justify-normal gap-2 text-sm font-semibold text-gray-800 w-full sm:w-auto">
      <span className="hidden sm:inline text-gray-800 text-[16px]">Set all to</span>
      <Button
        id={dropdownId}
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
        aria-controls={isDropdownOpen ? `${dropdownId}-menu` : undefined}
        variant="default"
        className={`${baseBtnClass} ${stateClass}`}
      >
        {selectedFormat ? (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white" />
            <span className="lowercase text-[18px] leading-[22px]">
              {getButtonText().toLowerCase()}
            </span>
          </div>
        ) : (
          <>
            <span className="sm:hidden">Set to all</span>
            <span className="hidden sm:inline">Select format</span>
          </>
        )}
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </motion.div>
      </Button>
    </div>
  );
}

