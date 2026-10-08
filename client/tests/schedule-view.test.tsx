import 'fake-indexeddb/auto';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { DataProvider } from '../src/api/data-context';
import { ScheduleView } from '../src/pages/ScheduleView';
import { LocalDataService } from '../src/api/local-service';
import { db } from '../src/api/db';

describe('ScheduleView Page & Hook Lifecycle', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    await db.delete();
    await db.open();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  it('renders without throwing "Maximum update depth exceeded" when no active schedule exists', async () => {
    const errorSpy = vi.spyOn(console, 'error');
    const warnSpy = vi.spyOn(console, 'warn');

    render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <MantineProvider>
            <MemoryRouter>
              <ScheduleView />
            </MemoryRouter>
          </MantineProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    // Verify title is rendered
    expect(await screen.findByText(/استعراض وتعديل الجداول المدرسية|School Timetable/i)).toBeDefined();

    // Verify no infinite loop warnings
    const hasMaxDepthWarning = [...errorSpy.mock.calls, ...warnSpy.mock.calls].some(
      (call) => call.some((arg) => typeof arg === 'string' && arg.includes('Maximum update depth exceeded'))
    );
    expect(hasMaxDepthWarning).toBe(false);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('renders active schedule with tabs and interactive edit button without render loop', async () => {
    const errorSpy = vi.spyOn(console, 'error');
    const warnSpy = vi.spyOn(console, 'warn');

    // Preload demo data and set active schedule
    const service = new LocalDataService();
    await service.preloadDemoData({ preset: 'primary', language: 'en' });
    
    // Create a mock active schedule
    const scheduleId = 'test_sched_1';
    await db.schedules.put({
      id: scheduleId,
      name: 'Autumn Term 2026',
      createdAt: new Date().toISOString(),
      isActive: true,
      status: 'solved',
      solveTimeMs: 120,
      backtrackCount: 0,
      assignments: [
        {
          lectureId: 'lec_1',
          classId: 'pri_g1',
          teacherId: 't_1',
          subjectId: 'sub_lang_1',
          dayIndex: 0,
          periodIndex: 0,
          roomNumber: '101',
        },
      ],
    });
    await service.setActiveSchedule(scheduleId);

    render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <MantineProvider>
            <MemoryRouter>
              <ScheduleView />
            </MemoryRouter>
          </MantineProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    // Wait for the schedule view to load
    expect(await screen.findByText(/Autumn Term 2026/i)).toBeDefined();

    // Verify edit button is present and clickable
    const editBtn = await screen.findByRole('button', { name: /تعديل الجدول يدوياً|Edit Timetable/i });
    expect(editBtn).toBeDefined();

    await userEvent.click(editBtn);

    // Verify exit edit button appears
    expect(await screen.findByRole('button', { name: /إنهاء التعديل|Exit/i })).toBeDefined();

    // Verify no infinite update loop occurred
    const hasMaxDepthWarning = [...errorSpy.mock.calls, ...warnSpy.mock.calls].some(
      (call) => call.some((arg) => typeof arg === 'string' && arg.includes('Maximum update depth exceeded'))
    );
    expect(hasMaxDepthWarning).toBe(false);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
