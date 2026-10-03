import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { DataProvider } from '../src/api/data-context';
import { ClassTimetable } from '../src/components/timetable/ClassTimetable';
import { TeacherTimetable } from '../src/components/timetable/TeacherTimetable';
import { MasterMatrix } from '../src/components/timetable/MasterMatrix';
import type { ClassRecord, TeacherRecord, SubjectRecord, TimetableAssignment } from '../src/api/types';

describe('Timetable Views Rendering', () => {
  const dummyClass: ClassRecord = {
    id: 'c-1',
    gradeLevel: 1,
    roomNumber: '101',
    sectionName: 'الصف 1 / أ',
    periodsPerDay: 6,
  };

  const dummyTeacher: TeacherRecord = {
    id: 't-1',
    name: 'أحمد محمود',
    specialization: 'رياضيات',
    maxDailyPeriods: 4,
    maxWeeklyPeriods: 18,
    unavailableSlots: [],
  };

  const dummySubject: SubjectRecord = {
    id: 's-1',
    name: 'الرياضيات',
    code: 'MTH',
    category: 'core',
  };

  const dummyAssignments: TimetableAssignment[] = [
    {
      lectureId: 'l-1',
      classId: 'c-1',
      teacherId: 't-1',
      subjectId: 's-1',
      dayIndex: 0,
      periodIndex: 0,
      roomNumber: '101',
    },
  ];

  it('renders ClassTimetable with 5 days and period columns', () => {
    render(
      <MantineProvider>
        <ClassTimetable
          cls={dummyClass}
          assignments={dummyAssignments}
          teachers={[dummyTeacher]}
          subjects={[dummySubject]}
        />
      </MantineProvider>
    );

    expect(screen.getByText('الأحد')).toBeDefined();
    expect(screen.getByText('الخميس')).toBeDefined();
    expect(screen.getByText('الحصة 1')).toBeDefined();
    expect(screen.getByText('الحصة 6')).toBeDefined();
    expect(screen.getByText('الرياضيات')).toBeDefined();
  });

  it('renders TeacherTimetable with workload stats', () => {
    render(
      <MantineProvider>
        <TeacherTimetable
          teacher={dummyTeacher}
          assignments={dummyAssignments}
          classes={[dummyClass]}
          subjects={[dummySubject]}
        />
      </MantineProvider>
    );

    expect(screen.getByText('أحمد محمود')).toBeDefined();
    expect(screen.getByText('الصف 1 / أ')).toBeDefined();
  });


  it('renders ClassTimetable in edit mode with draggable and clickable slots', () => {
    const onSelectSlot = vi.fn();
    const onDropSlot = vi.fn();

    const { rerender } = render(
      <MantineProvider>
        <ClassTimetable
          cls={dummyClass}
          assignments={dummyAssignments}
          teachers={[dummyTeacher]}
          subjects={[dummySubject]}
          editorProps={{
            isEditing: true,
            selectedSlot: null,
            validTargets: new Set(['0__1']),
            onSelectSlot,
            onDropSlot,
            onClearSelection: vi.fn(),
          }}
        />
      </MantineProvider>
    );

    // Initial cell has draggable attribute
    const mathCell = screen.getByText('الرياضيات').closest('div');
    expect(mathCell?.getAttribute('draggable')).toBe('true');

    // Simulate selecting slot (0, 0)
    rerender(
      <MantineProvider>
        <ClassTimetable
          cls={dummyClass}
          assignments={dummyAssignments}
          teachers={[dummyTeacher]}
          subjects={[dummySubject]}
          editorProps={{
            isEditing: true,
            selectedSlot: { dayIndex: 0, periodIndex: 0 },
            validTargets: new Set(['0__1']),
            onSelectSlot,
            onDropSlot,
            onClearSelection: vi.fn(),
          }}
        />
      </MantineProvider>
    );

    // Cell at (0, 1) is a valid target
    const targetCell = screen.getByTestId('slot-0-1');
    expect(targetCell).toBeDefined();
    targetCell.click();
    expect(onDropSlot).toHaveBeenCalledWith(0, 1);
  });

  it('renders MasterMatrix with school day filter', () => {
    render(
      <MantineProvider>
        <MasterMatrix
          classes={[dummyClass]}
          teachers={[dummyTeacher]}
          subjects={[dummySubject]}
          assignments={dummyAssignments}
        />
      </MantineProvider>
    );

    expect(screen.getByText('الصف 1 / أ')).toBeDefined();
  });
});
