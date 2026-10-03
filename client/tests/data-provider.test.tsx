import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'fake-indexeddb/auto';
import { DataProvider, useData, useStorageMode, useDataService } from '../src/api/data-context';
import { useActiveSchedule, useScheduleActions } from '../src/api/queries/useSchoolData';
import type { SavedScheduleRecord } from '../src/api/types';
import { db } from '../src/api/db';

describe('DataProvider and Mode Switching', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    localStorage.clear();
    await db.delete();
    await db.open();
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

  it('updates activeSchedule query cache immediately when saveSchedule is called without requiring reload', async () => {
    const { result } = renderHook(
      () => {
        const active = useActiveSchedule();
        const actions = useScheduleActions();
        return { active, actions };
      },
      { wrapper }
    );

    const initialSchedule: SavedScheduleRecord = {
      id: 'sched-1',
      name: 'Initial Schedule',
      createdAt: new Date().toISOString(),
      isActive: true,
      status: 'solved',
      solveTimeMs: 100,
      backtrackCount: 0,
      assignments: [
        { lectureId: 'l1', classId: 'c1', teacherId: 't1', subjectId: 's1', dayIndex: 0, periodIndex: 0, roomNumber: '101' },
      ],
    };

    await act(async () => {
      await result.current.actions.saveSchedule(initialSchedule);
    });

    expect(result.current.active.data?.assignments[0].dayIndex).toBe(0);

    const updatedSchedule: SavedScheduleRecord = {
      ...initialSchedule,
      assignments: [
        { lectureId: 'l1', classId: 'c1', teacherId: 't1', subjectId: 's1', dayIndex: 2, periodIndex: 3, roomNumber: '101' },
      ],
    };

    await act(async () => {
      await result.current.actions.saveSchedule(updatedSchedule);
    });

    // The query cache must immediately return the updated assignments without reload!
    expect(result.current.active.data?.assignments[0].dayIndex).toBe(2);
    expect(result.current.active.data?.assignments[0].periodIndex).toBe(3);
  });
});
