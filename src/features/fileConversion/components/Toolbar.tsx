// src/features/fileConversion/components/Toolbar.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { getFileCategory } from '../lib/fileUtils';
import { FILE_CATEGORIES } from '../lib/fileCategories';
import type { UploadedFile } from '../type';

import { FileToolbarActions } from './partials/FileToolbarActions';
import { FileToolbarDropdown } from './partials/FileToolbarDropdown';
import { FileToolbarDropdownMenu } from './partials/FileToolbarDropdownMenu';

// === Utility Functions ===

function getAvailableFormats(files: UploadedFile[], allSameCategory: boolean): string[] {
  if (!allSameCategory || files.length === 0) return [];
  const firstFile = files[0].file;
  const category = getFileCategory(firstFile);
  return FILE_CATEGORIES[category].outputFormats;
}

function getCurrentCategoryName(files: UploadedFile[], allSameCategory: boolean): string {
  if (!allSameCategory || files.length === 0) return '';
  const category = getFileCategory(files[0].file);
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getButtonText(format: string | null, allSameCategory: boolean, available: string[]): string {
  if (!allSameCategory || available.length === 0) return 'Select format';
  if (format) return `.${format.toUpperCase()}`;
  return 'Select format';
}

// === Component ===

interface ToolbarProps {
  onConvertAll: () => void;
  onRemoveAll?: () => void;
  hasFiles: boolean;
  disabledDownload?: boolean;
  allSameCategory: boolean;
  files: UploadedFile[];
  onSetAllFormats: (format: string) => void;
}

export default function Toolbar({
  onConvertAll,
  onRemoveAll,
  disabledDownload,
  hasFiles,
  allSameCategory,
  files,
  onSetAllFormats,
}: ToolbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const availableFormats = getAvailableFormats(files, allSameCategory);

  // Mount + Reset format
  useEffect(() => {
    setMounted(true);
    if (!allSameCategory || files.length === 0) {
      setSelectedFormat(null);
    }
  }, [allSameCategory, files.length]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Toggle + calculate dropdown position
  const toggleDropdown = () => {
    if (!allSameCategory) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition({
        top: spaceBelow < 200 ? rect.top - 10 : rect.bottom + 8,
        left: rect.left,
      });
    }
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle format selection
  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    onSetAllFormats(format);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="w-full rounded-2xl border border-white/10 bg-muted/70 backdrop-blur-md p-4 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FileToolbarActions
            hasFiles={hasFiles}
            disabledDownload={disabledDownload}
            onConvertAll={onConvertAll}
            onRemoveAll={onRemoveAll}
          />

          <div className="border-t border-white/10 sm:hidden" />

          <FileToolbarDropdown
            selectedFormat={selectedFormat}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            buttonRef={buttonRef}
            getButtonText={() => getButtonText(selectedFormat, allSameCategory, availableFormats)}
            allSameCategory={allSameCategory}
            availableFormats={availableFormats}
          />
        </div>
      </div>

      <FileToolbarDropdownMenu
        isOpen={isDropdownOpen}
        mounted={mounted}
        dropdownRef={dropdownRef}
        availableFormats={availableFormats}
        selectedFormat={selectedFormat}
        handleFormatSelect={handleFormatSelect}
        dropdownPosition={dropdownPosition}
        currentCategoryName={getCurrentCategoryName(files, allSameCategory)}
      />
    </>
  );
}
