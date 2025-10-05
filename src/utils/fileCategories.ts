// src/utils/fileCategories.ts

import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileVideo,
  FileAudio,
  Archive,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type FileCategory = {
  exts: string[];
  icon: LucideIcon | null;
  outputFormats: string[];
  mimeTypes: string[]; // Tambahan di sini
};

export const FILE_CATEGORIES: Record<string, FileCategory> = {
  document: {
    exts: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    icon: FileText,
    outputFormats: ['pdf', 'docx', 'txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ],
  },
  spreadsheet: {
    exts: ['xls', 'xlsx', 'csv'],
    icon: FileSpreadsheet,
    outputFormats: ['xlsx', 'csv'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
  },
  presentation: {
    exts: ['ppt', 'pptx'],
    icon: Presentation,
    outputFormats: ['pptx', 'pdf'],
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  },
  // NEW: For Deepl
   localization: {
    exts: ['xlf', 'xliff'],
    icon: FileText,
    outputFormats: ['xlf'],
    mimeTypes: [
      'application/xliff+xml',
      'application/xml',
      'text/xml',
    ],
  },
  // NEW: For Deepl
  subtitle: {
    exts: ['srt'],
    icon: FileText,
    outputFormats: ['srt'],
    mimeTypes: [
      'application/x-subrip',
      'text/plain',
    ],
  },
  archive: {
    exts: ['zip', 'rar', '7z', 'tar', 'gz'],
    icon: Archive,
    outputFormats: ['zip', 'rar'],
    mimeTypes: [
      'application/zip',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
  },
  video: {
    exts: ['mp4', 'mov', 'avi', 'mkv'],
    icon: FileVideo,
    outputFormats: ['mp4', 'webm'],
    mimeTypes: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
    ],
  },
  audio: {
    exts: ['mp3', 'wav', 'ogg', 'm4a'],
    icon: FileAudio,
    outputFormats: ['mp3', 'wav'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
    ],
  },
  image: {
    exts: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    icon: null,
    outputFormats: ['jpg', 'png', 'webp', 'gif'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
  },
  ebook: {
    exts: ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'lit', 'lrf', 'pdb', 'tcr'],
    icon: BookOpen,
    outputFormats: ['epub', 'mobi', 'azw3', 'pdf'],
    mimeTypes: [
      'application/epub+zip',
      'application/x-mobipocket-ebook',
      'application/vnd.amazon.ebook',
      'application/x-fictionbook+xml',
      'application/x-ms-lit',
      'application/x-sony-bbeb',
      'application/x-palm-database',
    ],
  },
};