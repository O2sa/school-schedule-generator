import { describe, it, expect } from 'vitest';
import { generateArabicK12DemoData } from '../src/api/demo-data';
import { buildTimetableInput, mapSolverResultToSavedSchedule } from '../src/api/worker/solver-adapter';
import { solveTimetable } from 'school-timetabling-engine';

describe('Solver Adapter & Engine Integration', () => {
  it('converts domain models to TimetableInput correctly', () => {
    const demo = generateArabicK12DemoData();
    const input = buildTimetableInput(demo);

    expect(input.days.length).toBe(5);
    expect(input.periodsPerDay).toBe(7);
    expect(input.classes.length).toBe(24);
    expect(input.teachers.length).toBeGreaterThan(20);
    expect(input.requirements.length).toBeGreaterThan(0);

    // Verify Grade 1 class has 6 lecturesPerDay
    const grade1Class = input.classes.find((c) => c.name.includes('الصف 1 / أ'));
    expect(grade1Class?.lecturesPerDay).toBe(6);

    // Verify Grade 12 class has 7 lecturesPerDay
    const grade12Class = input.classes.find((c) => c.name.includes('الصف 12 / أ'));
    expect(grade12Class?.lecturesPerDay).toBe(7);
  });

  it('solves Arabic K-12 school problem and produces SavedScheduleRecord', () => {
    const demo = generateArabicK12DemoData();
    const input = buildTimetableInput(demo);

    const result = solveTimetable(input);

    expect(result.status).toBe('SUCCESS');
    if (result.status !== 'SUCCESS') return;

    const saved = mapSolverResultToSavedSchedule(result, demo);
    expect(saved.status).toBe('solved');
    expect(saved.assignments.length).toBe(result.lectures.length);
    expect(saved.assignments.length).toBeGreaterThan(600);

    // Check no teacher double-booking
    const teacherSlots = new Set<string>();
    for (const a of saved.assignments) {
      const key = `${a.teacherId}__${a.dayIndex}__${a.periodIndex}`;
      expect(teacherSlots.has(key)).toBe(false);
      teacherSlots.add(key);
    }
  });
});
