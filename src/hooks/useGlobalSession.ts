// src/hooks/useGlobalSession.ts
// Global hook untuk session state yang bisa diakses dari mana saja

'use client';

import { useState, useEffect } from 'react';
import type { UploadedFile } from '@/types/type';

interface SessionState {
  fileCount: number;
  isRestoring: boolean;
  convertedCount: number;
  processingCount: number;
  files: UploadedFile[];
}

// Global state untuk session
let globalSessionState: SessionState = {
  fileCount: 0,
  isRestoring: false,
  convertedCount: 0,
  processingCount: 0,
  files: [],
};

// Subscribers untuk state changes
let subscribers: ((state: SessionState) => void)[] = [];

// Function untuk update global state
export function updateGlobalSession(newState: Partial<SessionState>) {
  globalSessionState = { ...globalSessionState, ...newState };
  subscribers.forEach(callback => callback(globalSessionState));
}

// Hook untuk subscribe ke global session state
export function useGlobalSession() {
  const [sessionState, setSessionState] = useState(globalSessionState);

  useEffect(() => {
    // Subscribe to global state changes
    const unsubscribe = (newState: SessionState) => {
      setSessionState(newState);
    };
    
    subscribers.push(unsubscribe);

    // Cleanup on unmount
    return () => {
      subscribers = subscribers.filter(sub => sub !== unsubscribe);
    };
  }, []);

  return sessionState;
}