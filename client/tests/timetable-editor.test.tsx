import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimetableEditor } from '../src/hooks/useTimetableEditor';
import type { TimetableInput, TimetableAssignment } from 'school-timetabling-engine';

const mockInput: TimetableInput = {
  days: [
    { id: 0, name: 'الأحد' },
    { id: 1, name: 'الإثنين' },
  ],
  periodsPerDay: 4,
  classes: [
    { id: 'cls_1', name: 'الصف 10أ', periodsPerDay: 4 },
  ],
  teachers: [
    { id: 't_1', name: 'أحمد', maxPeriodsPerDay: 3, blockedSlots: [{ day: 0, period: 3 }] },
    { id: 't_2', name: 'سارة', maxPeriodsPerDay: 4, blockedSlots: [] },
  ],
  requirements: [
    { id: 'req_1', classId: 'cls_1', teacherId: 't_1', lecturesPerWeek: 2 },
    { id: 'req_2', classId: 'cls_1', teacherId: 't_2', lecturesPerWeek: 2 },
  ],
};

const initialAssignments: TimetableAssignment[] = [
  { lectureId: 'cls_1__0__0', classId: 'cls_1', teacherId: 't_1', dayIndex: 0, periodIndex: 0, roomNumber: '101' },
  { lectureId: 'cls_1__0__1', classId: 'cls_1', teacherId: 't_2', dayIndex: 0, periodIndex: 1, roomNumber: '101' },
];

describe('useTimetableEditor hook', () => {
  it('initializes with default non-editing state', () => {
    const { result } = renderHook(() =>
      useTimetableEditor({ input: mockInput, initialAssignments })
    );

    expect(result.current.isEditing).toBe(false);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.draftAssignments.length).toBe(2);
  });

  it('selects a slot and populates validTargets', () => {
    const { result } = renderHook(() =>
      useTimetableEditor({ input: mockInput, initialAssignments })
    );

    act(() => {
      result.current.toggleEditMode();
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.selectSlot(0, 0, initialAssignments[0]);
    });

    expect(result.current.selectedSlot?.assignment.lectureId).toBe('cls_1__0__0');
    expect(result.current.validTargets.size).toBeGreaterThan(0);
    // Blocked slot (0, 3) must NOT be valid
    expect(result.current.validTargets.has('0__3')).toBe(false);
  });

  it('executes a valid move, pushes to history, and enables undo', () => {
    const { result } = renderHook(() =>
      useTimetableEditor({ input: mockInput, initialAssignments })
    );

    act(() => {
      result.current.toggleEditMode();
    });
    act(() => {
      result.current.selectSlot(0, 0, initialAssignments[0]);
    });

    let success = false;
    act(() => {
      success = result.current.executeMoveOrSwap(1, 0);
    });

    expect(success).toBe(true);
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.changeCount).toBe(1);

    const moved = result.current.draftAssignments.find((a) => a.lectureId === 'cls_1__0__0');
    expect(moved?.dayIndex).toBe(1);
    expect(moved?.periodIndex).toBe(0);

    // Undo move
    act(() => {
      result.current.undo();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
    const restored = result.current.draftAssignments.find((a) => a.lectureId === 'cls_1__0__0');
    expect(restored?.dayIndex).toBe(0);
    expect(restored?.periodIndex).toBe(0);

    // Redo move
    act(() => {
      result.current.redo();
    });
    expect(result.current.canUndo).toBe(true);
    const redone = result.current.draftAssignments.find((a) => a.lectureId === 'cls_1__0__0');
    expect(redone?.dayIndex).toBe(1);
  });

  it('rejects an invalid move violating constraints', () => {
    const { result } = renderHook(() =>
      useTimetableEditor({ input: mockInput, initialAssignments })
    );

    act(() => {
      result.current.toggleEditMode();
    });
    act(() => {
      result.current.selectSlot(0, 0, initialAssignments[0]);
    });

    let success = true;
    act(() => {
      success = result.current.executeMoveOrSwap(0, 3); // Teacher 1 is blocked on slot (0, 3)
    });

    expect(success).toBe(false);
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.canUndo).toBe(false);
  });

  it('discards changes and restores initial assignments', () => {
    const { result } = renderHook(() =>
      useTimetableEditor({ input: mockInput, initialAssignments })
    );

    act(() => {
      result.current.toggleEditMode();
    });
    act(() => {
      result.current.selectSlot(0, 0, initialAssignments[0]);
    });
    act(() => {
      result.current.executeMoveOrSwap(1, 0);
    });

    expect(result.current.hasChanges).toBe(true);

    act(() => {
      result.current.discardChanges();
    });

    expect(result.current.hasChanges).toBe(false);
    expect(result.current.isEditing).toBe(false);
    expect(result.current.draftAssignments[0].dayIndex).toBe(0);
  });
});
