import { describe, it, expect } from 'vitest';
import type {
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SchoolConfigRecord,
  SavedScheduleRecord,
  SchoolBackupPayload,
  IDataService
} from '../src/api/types';

describe('Domain Types & Contracts', () => {
  it('creates valid TeacherRecord', () => {
    const teacher: TeacherRecord = {
      id: 't-1',
      name: 'أحمد محمود',
      specialization: 'رياضيات',
      maxDailyPeriods: 4,
      maxWeeklyPeriods: 18,
      unavailableSlots: [{ dayIndex: 0, periodIndex: 0 }]
    };
    expect(teacher.name).toBe('أحمد محمود');
    expect(teacher.maxWeeklyPeriods).toBe(18);
  });

  it('creates valid ClassRecord with period counts', () => {
    const primaryClass: ClassRecord = {
      id: 'c-1',
      gradeLevel: 1,
      roomNumber: '101',
      sectionName: '1/أ',
      periodsPerDay: 6
    };
    const secondaryClass: ClassRecord = {
      id: 'c-12',
      gradeLevel: 12,
      roomNumber: '302',
      sectionName: '12/علمي',
      periodsPerDay: 7
    };
    expect(primaryClass.periodsPerDay).toBe(6);
    expect(secondaryClass.periodsPerDay).toBe(7);
  });

  it('validates SchoolConfigRecord defaults', () => {
    const config: SchoolConfigRecord = {
      schoolName: 'مدرسة الأمل النموذجية',
      academicYear: '2026/2027',
      term: 'الفصل الأول',
      workingDays: [0, 1, 2, 3, 4], // Sunday to Thursday
      periodsPerDayDefault: 7,
      gradePeriodsConfig: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 7, 6: 7, 7: 7, 8: 7, 9: 7, 10: 7, 11: 7, 12: 7 }
    };
    expect(config.workingDays).toEqual([0, 1, 2, 3, 4]);
    expect(config.gradePeriodsConfig[1]).toBe(6);
  });
});
