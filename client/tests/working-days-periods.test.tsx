import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/api/data-context';
import { I18nProvider } from '../src/i18n';
import { ClassModal } from '../src/components/forms/ClassModal';
import { Settings } from '../src/pages/Settings';
import { ClassTimetable } from '../src/components/timetable/ClassTimetable';
import type { ClassRecord } from '../src/api/types';

describe('Custom Working Days & Class Lectures per Day', () => {
  it('allows entering custom periods per day (e.g. 8 periods) in ClassModal and submits it', async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <MantineProvider>
        <I18nProvider initialLocale="en">
          <ClassModal
            opened={true}
            onClose={handleClose}
            onSave={handleSave}
            classRecord={null}
          />
        </I18nProvider>
      </MantineProvider>
    );

    // Find the periods per day number input
    const periodsInput = screen.getByLabelText(/Daily Schedule Scheme|Daily Periods|Lectures per Day/i) as HTMLInputElement;
    expect(periodsInput).toBeDefined();

    // Change periods per day to 8
    fireEvent.change(periodsInput, { target: { value: '8' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        periodsPerDay: 8,
      })
    );
  });

  it('renders Settings with working days selector and default periods per day input', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <DataProvider>
          <MantineProvider>
            <I18nProvider initialLocale="en">
              <Settings />
            </I18nProvider>
          </MantineProvider>
        </DataProvider>
      </QueryClientProvider>
    );

    // Expect working days configuration and default periods input to exist in settings
    expect(screen.getByText(/Working Days/i)).toBeDefined();
    expect(screen.getByLabelText(/Default Daily Periods|Default Lectures per Day/i)).toBeDefined();
  });

  it('renders ClassTimetable with dynamic working days and custom period count', () => {
    const mockClass: ClassRecord = {
      id: 'class-test-1',
      gradeLevel: 10,
      sectionName: '10/A',
      roomNumber: '101',
      periodsPerDay: 8,
    };

    // 6 working days: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
    const workingDays = [6, 0, 1, 2, 3, 4];

    render(
      <MantineProvider>
        <I18nProvider initialLocale="en">
          <ClassTimetable
            cls={mockClass}
            assignments={[]}
            teachers={[]}
            subjects={[]}
            workingDays={workingDays}
          />
        </I18nProvider>
      </MantineProvider>
    );

    // Period 8 header should exist
    expect(screen.getByText('Period 8')).toBeDefined();
    // Saturday row should exist
    expect(screen.getByText('Saturday')).toBeDefined();
  });
});
