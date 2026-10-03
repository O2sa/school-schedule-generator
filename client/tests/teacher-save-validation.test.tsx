import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeacherAvailabilityDrawer } from '../src/components/teachers/TeacherAvailabilityDrawer';
import { TeacherModal } from '../src/components/forms/TeacherModal';
import type { TeacherRecord } from '../src/api/types';

// Mock school config
vi.mock('../src/api/queries/useSchoolData', () => ({
  useSchoolConfig: () => ({
    data: {
      schoolName: 'مدرسة تجريبية',
      academicYear: '2026-2027',
      term: 'الأول',
      workingDays: [0, 1, 2, 3, 4], // 5 days
      periodsPerDayDefault: 7, // 35 total slots
      gradePeriodsConfig: {},
    },
    isLoading: false,
  }),
}));

describe('Teacher Save Capacity Validation UI', () => {
  const queryClient = new QueryClient();

  const mockTeacher: TeacherRecord = {
    id: 't-test',
    name: 'أحمد العتيبي',
    specialization: 'فيزياء',
    maxDailyPeriods: 4,
    maxWeeklyPeriods: 20,
    unavailableSlots: [],
  };

  it('prevents saving in TeacherAvailabilityDrawer when available slots < maxWeeklyPeriods', () => {
    const onSave = vi.fn().mockResolvedValue(mockTeacher);

    // Block 25 slots -> 35 - 25 = 10 available slots < 20 needed
    const heavyBlockedSlots = [];
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < 5; p++) {
        heavyBlockedSlots.push({ dayIndex: d, periodIndex: p });
      }
    }

    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <TeacherAvailabilityDrawer
            opened={true}
            onClose={vi.fn()}
            teacher={{
              ...mockTeacher,
              unavailableSlots: heavyBlockedSlots,
            }}
            onSave={onSave}
          />
        </MantineProvider>
      </QueryClientProvider>
    );

    // Check that error alert is visible
    expect(screen.getByText('لا يمكن حفظ أوقات التوفر')).toBeDefined();

    // Check that save button is disabled
    const saveButton = screen.getByRole('button', { name: /حفظ أوقات التوفر/i });
    expect(saveButton.hasAttribute('disabled')).toBe(true);

    // Fire click anyway
    fireEvent.click(saveButton);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('prevents saving in TeacherModal when available slots < maxWeeklyPeriods', () => {
    const onSave = vi.fn().mockResolvedValue(mockTeacher);

    // Block 20 slots -> 15 available slots < 18 default maxWeeklyPeriods
    const blockedSlots = [];
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < 4; p++) {
        blockedSlots.push({ dayIndex: d, periodIndex: p });
      }
    }

    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <TeacherModal
            opened={true}
            onClose={vi.fn()}
            onSave={onSave}
            teacher={{
              ...mockTeacher,
              maxWeeklyPeriods: 18,
              unavailableSlots: blockedSlots,
            }}
          />
        </MantineProvider>
      </QueryClientProvider>
    );

    // Check that error alert is displayed
    expect(screen.getByText(/تجاوز سعة المعلم/i)).toBeDefined();

    // Save button must be disabled
    const submitBtn = screen.getByRole('button', { name: /^حفظ$/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    // Click submit
    fireEvent.click(submitBtn);
    expect(onSave).not.toHaveBeenCalled();
  });
});
