import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { I18nProvider } from '../src/i18n';
import { TeacherAvailabilityGrid } from '../src/components/teachers/TeacherAvailabilityGrid';
import { ClassTimetable } from '../src/components/timetable/ClassTimetable';
import { TeacherTimetable } from '../src/components/timetable/TeacherTimetable';
import { MasterMatrix } from '../src/components/timetable/MasterMatrix';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../src/api/types';

describe('Dark Mode Table & Matrix UI Enhancements', () => {
  it('renders TeacherAvailabilityGrid with dark comfortable cell and header colors in dark mode', () => {
    const { container } = render(
      <MantineProvider forceColorScheme="dark">
        <I18nProvider initialLocale="en">
          <TeacherAvailabilityGrid
            value={[{ dayIndex: 0, periodIndex: 0 }]}
            workingDays={[0, 1, 2, 3, 4]}
            periodsPerDay={7}
          />
        </I18nProvider>
      </MantineProvider>
    );

    const blockedCell = container.querySelector('[data-blocked="true"]') as HTMLElement;
    expect(blockedCell).toBeDefined();
    expect(blockedCell.style.background).not.toContain('var(--mantine-color-red-1)');
    expect(blockedCell.style.background).toContain('rgba(235, 87, 87, 0.22)');

    const availableCell = container.querySelector('[data-blocked="false"]') as HTMLElement;
    expect(availableCell).toBeDefined();
    expect(availableCell.style.background).not.toContain('var(--mantine-color-teal-0)');
    expect(availableCell.style.background).toContain('rgba(32, 201, 151, 0.16)');

    const theadRow = container.querySelector('thead tr') as HTMLElement;
    expect(theadRow.style.background).not.toContain('var(--mantine-color-gray-1)');
    expect(theadRow.style.background).toContain('var(--mantine-color-dark-6)');
  });

  it('renders ClassTimetable with dark background for header, day column, and assigned lecture cards in dark mode', () => {
    const mockClass: ClassRecord = {
      id: 'c1',
      gradeLevel: 1,
      sectionName: '1-A',
      roomNumber: '101',
      periodsPerDay: 7,
    };
    const mockTeacher: TeacherRecord = {
      id: 't1',
      name: 'Teacher 1',
      specialization: 'Math',
      maxWeeklyPeriods: 20,
      maxDailyPeriods: 5,
      unavailableSlots: [],
    };
    const mockSubject: SubjectRecord = {
      id: 's1',
      name: 'Mathematics',
      code: 'MATH101',
      category: 'core',
    };
    const mockAssignment: TimetableAssignment = {
      lectureId: 'l1',
      classId: 'c1',
      teacherId: 't1',
      subjectId: 's1',
      dayIndex: 0,
      periodIndex: 0,
      roomNumber: '101',
    };

    const { container } = render(
      <MantineProvider forceColorScheme="dark">
        <I18nProvider initialLocale="en">
          <ClassTimetable
            cls={mockClass}
            assignments={[mockAssignment]}
            teachers={[mockTeacher]}
            subjects={[mockSubject]}
            workingDays={[0, 1, 2, 3, 4]}
          />
        </I18nProvider>
      </MantineProvider>
    );

    const theadRow = container.querySelector('thead tr') as HTMLElement;
    expect(theadRow.style.background).not.toContain('var(--mantine-color-gray-1)');
    expect(theadRow.style.background).toContain('var(--mantine-color-dark-6)');

    const slotCard = container.querySelector('[data-testid="slot-0-0"] .mantine-Card-root') as HTMLElement;
    expect(slotCard).toBeDefined();
    expect(slotCard.style.background).not.toContain('var(--mantine-color-indigo-0)');
    expect(slotCard.style.background).toContain('rgba(92, 124, 250, 0.18)');
  });

  it('renders TeacherTimetable with dark background in dark mode', () => {
    const mockClass: ClassRecord = {
      id: 'c1',
      gradeLevel: 1,
      sectionName: '1-A',
      roomNumber: '101',
      periodsPerDay: 7,
    };
    const mockTeacher: TeacherRecord = {
      id: 't1',
      name: 'Teacher 1',
      specialization: 'Math',
      maxWeeklyPeriods: 20,
      maxDailyPeriods: 5,
      unavailableSlots: [{ dayIndex: 0, periodIndex: 1 }],
    };
    const mockSubject: SubjectRecord = {
      id: 's1',
      name: 'Mathematics',
      code: 'MATH101',
      category: 'core',
    };
    const mockAssignment: TimetableAssignment = {
      lectureId: 'l1',
      classId: 'c1',
      teacherId: 't1',
      subjectId: 's1',
      dayIndex: 0,
      periodIndex: 0,
      roomNumber: '101',
    };

    const { container } = render(
      <MantineProvider forceColorScheme="dark">
        <I18nProvider initialLocale="en">
          <TeacherTimetable
            teacher={mockTeacher}
            assignments={[mockAssignment]}
            classes={[mockClass]}
            subjects={[mockSubject]}
            workingDays={[0, 1, 2, 3, 4]}
          />
        </I18nProvider>
      </MantineProvider>
    );

    const theadRow = container.querySelector('thead tr') as HTMLElement;
    expect(theadRow.style.background).toContain('var(--mantine-color-dark-6)');

    const blockedTd = container.querySelector('[data-testid="teacher-slot-0-1"]') as HTMLElement;
    expect(blockedTd).toBeDefined();
    expect(blockedTd.style.background).toContain('var(--mantine-color-dark-8)');

    const slotCard = container.querySelector('[data-testid="teacher-slot-0-0"] .mantine-Card-root') as HTMLElement;
    expect(slotCard).toBeDefined();
    expect(slotCard.style.background).toContain('rgba(32, 201, 151, 0.18)');
  });

  it('renders MasterMatrix with dark background in dark mode', () => {
    const mockClass: ClassRecord = {
      id: 'c1',
      gradeLevel: 1,
      sectionName: '1-A',
      roomNumber: '101',
      periodsPerDay: 7,
    };
    const mockTeacher: TeacherRecord = {
      id: 't1',
      name: 'Teacher 1',
      specialization: 'Math',
      maxWeeklyPeriods: 20,
      maxDailyPeriods: 5,
      unavailableSlots: [],
    };
    const mockSubject: SubjectRecord = {
      id: 's1',
      name: 'Mathematics',
      code: 'MATH101',
      category: 'core',
    };
    const mockAssignment: TimetableAssignment = {
      lectureId: 'l1',
      classId: 'c1',
      teacherId: 't1',
      subjectId: 's1',
      dayIndex: 0,
      periodIndex: 0,
      roomNumber: '101',
    };

    const { container } = render(
      <MantineProvider forceColorScheme="dark">
        <I18nProvider initialLocale="en">
          <MasterMatrix
            classes={[mockClass]}
            teachers={[mockTeacher]}
            subjects={[mockSubject]}
            assignments={[mockAssignment]}
            workingDays={[0, 1, 2, 3, 4]}
          />
        </I18nProvider>
      </MantineProvider>
    );

    const theadRow = container.querySelector('thead tr') as HTMLElement;
    expect(theadRow.style.background).toContain('var(--mantine-color-dark-6)');

    const card = container.querySelector('tbody tr td .mantine-Card-root') as HTMLElement;
    expect(card).toBeDefined();
    expect(card.style.background).toContain('rgba(92, 124, 250, 0.18)');
  });
});
