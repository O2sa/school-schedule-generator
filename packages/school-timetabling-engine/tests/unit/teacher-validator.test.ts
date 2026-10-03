import { describe, it, expect } from 'vitest';
import { validateTeacherCapacity } from '../../src/validation/teacher-validator';

describe('validateTeacherCapacity', () => {
  const defaultWorkingDays = [0, 1, 2, 3, 4]; // 5 days
  const defaultPeriodsPerDay = 7; // 35 total slots

  it('validates a teacher with sufficient available slots', () => {
    const result = validateTeacherCapacity({
      workingDays: defaultWorkingDays,
      periodsPerDay: defaultPeriodsPerDay,
      maxWeeklyPeriods: 18,
      maxDailyPeriods: 4,
      unavailableSlots: [
        { dayIndex: 0, periodIndex: 0 },
        { dayIndex: 0, periodIndex: 1 },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.totalWorkingSlots).toBe(35);
    expect(result.blockedSlotsCount).toBe(2);
    expect(result.availableSlotsCount).toBe(33);
    expect(result.neededLectures).toBe(18);
    expect(result.error).toBeUndefined();
  });

  it('rejects saving when needed lectures > actual available slots (CAPACITY_EXCEEDED)', () => {
    // 5 days * 7 periods = 35 slots. Block 20 slots => 15 available slots.
    const unavailableSlots = [];
    for (let p = 0; p < 4; p++) {
      for (const d of defaultWorkingDays) {
        unavailableSlots.push({ dayIndex: d, periodIndex: p });
      }
    }
    expect(unavailableSlots.length).toBe(20);

    const result = validateTeacherCapacity({
      workingDays: defaultWorkingDays,
      periodsPerDay: defaultPeriodsPerDay,
      maxWeeklyPeriods: 18, // 18 needed > 15 available
      unavailableSlots,
    });

    expect(result.valid).toBe(false);
    expect(result.code).toBe('CAPACITY_EXCEEDED');
    expect(result.availableSlotsCount).toBe(15);
    expect(result.neededLectures).toBe(18);
    expect(result.error).toContain('18');
    expect(result.error).toContain('15');
  });

  it('supports engine slot format { day, period } as well as { dayIndex, periodIndex }', () => {
    const unavailableSlots = [
      { day: 0, period: 0 },
      { day: 0, period: 1 },
      { day: 1, period: 0 },
    ];

    const result = validateTeacherCapacity({
      workingDays: defaultWorkingDays,
      periodsPerDay: defaultPeriodsPerDay,
      maxWeeklyPeriods: 33, // 35 total - 3 blocked = 32 available < 33 needed
      unavailableSlots,
    });

    expect(result.valid).toBe(false);
    expect(result.code).toBe('CAPACITY_EXCEEDED');
    expect(result.blockedSlotsCount).toBe(3);
    expect(result.availableSlotsCount).toBe(32);
  });

  it('rejects when needed lectures exceed daily capacity limits (DAILY_CAPACITY_EXCEEDED)', () => {
    // 5 days, max 3 lectures per day => max 15 lectures possible even if 35 slots are free
    const result = validateTeacherCapacity({
      workingDays: defaultWorkingDays,
      periodsPerDay: defaultPeriodsPerDay,
      maxDailyPeriods: 3,
      maxWeeklyPeriods: 18, // 18 needed > 15 effective daily capacity
      unavailableSlots: [],
    });

    expect(result.valid).toBe(false);
    expect(result.code).toBe('DAILY_CAPACITY_EXCEEDED');
    expect(result.effectiveCapacity).toBe(15);
    expect(result.neededLectures).toBe(18);
  });

  it('takes assignedCurriculumPeriods into account when higher than maxWeeklyPeriods', () => {
    const result = validateTeacherCapacity({
      workingDays: defaultWorkingDays,
      periodsPerDay: defaultPeriodsPerDay,
      maxWeeklyPeriods: 12,
      assignedCurriculumPeriods: 20, // Assigned curriculum requires 20
      unavailableSlots: Array.from({ length: 18 }, (_, i) => ({
        dayIndex: Math.floor(i / 7),
        periodIndex: i % 7,
      })), // 18 blocked, leaving 17 available
    });

    expect(result.valid).toBe(false);
    expect(result.code).toBe('CAPACITY_EXCEEDED');
    expect(result.neededLectures).toBe(20);
    expect(result.availableSlotsCount).toBe(17);
  });
});
