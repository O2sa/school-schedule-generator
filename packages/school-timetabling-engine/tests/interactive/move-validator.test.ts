import { describe, it, expect } from 'vitest';
import {
  validateMoveOrSwap,
  computeValidSlotsForLecture,
  applyMoveOrSwap,
  type TimetableInput,
  type TimetableAssignment,
  type MoveRequest
} from '../../src/index';

const mockInput: TimetableInput = {
  days: [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
  ],
  periodsPerDay: 4,
  classes: [
    { id: 'cls_1', name: 'الصف 10أ', periodsPerDay: 4 },
    { id: 'cls_2', name: 'الصف 10ب', periodsPerDay: 4 },
  ],
  teachers: [
    { id: 't_1', name: 'أحمد', maxPeriodsPerDay: 3, blockedSlots: [{ day: 0, period: 3 }] },
    { id: 't_2', name: 'سارة', maxPeriodsPerDay: 4, blockedSlots: [] },
  ],
  requirements: [
    { id: 'req_1', classId: 'cls_1', teacherId: 't_1', lecturesPerWeek: 2 },
    { id: 'req_2', classId: 'cls_1', teacherId: 't_2', lecturesPerWeek: 2 },
    { id: 'req_3', classId: 'cls_2', teacherId: 't_1', lecturesPerWeek: 2 },
  ],
};

const initialAssignments: TimetableAssignment[] = [
  { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', subjectId: 'sub_1', dayIndex: 0, periodIndex: 0, roomNumber: '101' },
  { lectureId: 'cls_1__0__1', classId: 'cls_1', teacherId: 't_2', subjectId: 'sub_2', dayIndex: 0, periodIndex: 1, roomNumber: '101' },
  { lectureId: 'cls_2__1__2', classId: 'cls_2', teacherId: 't_1', subjectId: 'sub_1', dayIndex: 1, periodIndex: 2, roomNumber: '102' },
];

describe('Interactive Move Validator', () => {
  it('allows moving a lecture to an empty, valid slot', () => {
    const request: MoveRequest = {
      source: { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', day: 0, period: 0 },
      target: { day: 1, period: 0 },
    };
    const result = validateMoveOrSwap(mockInput, initialAssignments, request);
    expect(result.valid).toBe(true);
    expect(result.isSwap).toBe(false);
  });

  it('rejects moving when teacher is blocked on that slot', () => {
    const request: MoveRequest = {
      source: { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', day: 0, period: 0 },
      target: { day: 0, period: 3 }, // t_1 is blocked on day 0, period 3
    };
    const result = validateMoveOrSwap(mockInput, initialAssignments, request);
    expect(result.valid).toBe(false);
    expect(result.conflicts[0]?.code).toBe('TEACHER_UNAVAILABLE');
  });

  it('rejects moving when teacher is double-booked with another class', () => {
    const request: MoveRequest = {
      source: { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', day: 0, period: 0 },
      target: { day: 1, period: 2 }, // t_1 is already teaching cls_2 on day 1, period 2
    };
    const result = validateMoveOrSwap(mockInput, initialAssignments, request);
    expect(result.valid).toBe(false);
    expect(result.conflicts[0]?.code).toBe('TEACHER_DOUBLE_BOOKED');
  });

  it('allows swapping two valid lectures of the same class', () => {
    const request: MoveRequest = {
      source: { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', day: 0, period: 0 },
      target: { day: 0, period: 1 }, // occupied by t_2 in cls_1
    };
    const result = validateMoveOrSwap(mockInput, initialAssignments, request);
    expect(result.valid).toBe(true);
    expect(result.isSwap).toBe(true);
    expect(result.swappedLecture?.teacherId).toBe('t_2');
  });

  it('computes all valid slots correctly', () => {
    const validSlots = computeValidSlotsForLecture(mockInput, initialAssignments, 'cls_1__0__0');
    // Blocked slot (0, 3) must NOT be included
    const hasBlocked = validSlots.some((s) => s.day === 0 && s.period === 3);
    expect(hasBlocked).toBe(false);
    // Double booked slot (1, 2) must NOT be included
    const hasDoubleBooked = validSlots.some((s) => s.day === 1 && s.period === 2);
    expect(hasDoubleBooked).toBe(false);
    expect(validSlots.length).toBeGreaterThan(0);
  });

  it('applies move or swap immutably', () => {
    const request: MoveRequest = {
      source: { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', day: 0, period: 0 },
      target: { day: 1, period: 0 },
    };
    const updated = applyMoveOrSwap(initialAssignments, request);
    expect(updated).not.toBe(initialAssignments);
    const moved = updated.find((a) => a.classId === 'cls_1' && a.teacherId === 't_1' && a.lectureId === 'cls_1__0__0');
    expect(moved?.dayIndex).toBe(1);
    expect(moved?.periodIndex).toBe(0);
  });
});
