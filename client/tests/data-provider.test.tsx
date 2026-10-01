import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, useData, useStorageMode, useDataService } from '../src/api/data-context';

describe('DataProvider and Mode Switching', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );

  it('initializes in client mode by default', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.mode).toBe('client');
    expect(result.current.service.mode).toBe('client');
  });

  it('switches seamlessly to server mode and updates localStorage', () => {
    const { result } = renderHook(
      () => {
        const [mode, setMode] = useStorageMode();
        const service = useDataService();
        return { mode, setMode, service };
      },
      { wrapper }
    );

    expect(result.current.mode).toBe('client');

    act(() => {
      result.current.setMode('server');
    });

    expect(result.current.mode).toBe('server');
    expect(result.current.service.mode).toBe('server');
    expect(localStorage.getItem('app_storage_mode')).toBe('server');
  });
});
