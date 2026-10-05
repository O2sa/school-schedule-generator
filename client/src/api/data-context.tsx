import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IDataService } from './types';
import { LocalDataService } from './local-service';
import { RemoteDataService } from './remote-service';

export type StorageMode = 'client' | 'server';

interface DataContextValue {
  mode: StorageMode;
  setMode: (mode: StorageMode) => void;
  service: IDataService;
}

export const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEY = 'app_storage_mode';

export function DataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [mode, setModeState] = useState<StorageMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as StorageMode | null;
      if (saved === 'client' || saved === 'server') return saved;
    }
    return 'client';
  });

  const localService = useMemo(() => new LocalDataService(), []);
  const remoteService = useMemo(() => new RemoteDataService(), []);

  const service = mode === 'client' ? localService : remoteService;

  const setMode = (newMode: StorageMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    queryClient.resetQueries();
  };

  return (
    <DataContext.Provider value={{ mode, setMode, service }}>
      {children}
    </DataContext.Provider>
  );
}

export function useOptionalData(): DataContextValue | null {
  return useContext(DataContext);
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}

export function useDataService(): IDataService {
  return useData().service;
}

export function useStorageMode(): [StorageMode, (mode: StorageMode) => void] {
  const { mode, setMode } = useData();
  return [mode, setMode];
}
