import type { TimetableInput, TimetableAssignment } from '../domain/types';
import type {
  MoveRequest,
  MoveValidationResult,
  MoveSlotCoordinates,
  MoveConflict,
  TimetableLectureReference,
} from './types';

export function validateMoveOrSwap(
  input: TimetableInput,
  assignments: TimetableAssignment[],
  request: MoveRequest
): MoveValidationResult {
  const conflicts: MoveConflict[] = [];
  const { source, target } = request;

  const teacherMap = new Map(input.teachers.map((t) => [t.id, t]));
  const sourceTeacher = teacherMap.get(source.teacherId);
  if (!sourceTeacher) {
    return {
      valid: false,
      isSwap: false,
      conflicts: [{ code: 'INVALID_SOURCE', message: `المعلم غير موجود: ${source.teacherId}` }],
    };
  }

  // 1. Check if source teacher is unavailable on target slot
  if (sourceTeacher.blockedSlots?.some((b) => b.day === target.day && b.period === target.period)) {
    conflicts.push({
      code: 'TEACHER_UNAVAILABLE',
      message: `المعلم ${sourceTeacher.name} غير متاح في هذا التوقيت (اليوم ${target.day}، الحصة ${target.period + 1})`,
      details: { teacherId: source.teacherId, day: target.day, period: target.period },
    });
  }

  // Check if target is currently occupied for this class
  const targetClassAssignment = assignments.find(
    (a) =>
      a.classId === source.classId &&
      a.dayIndex === target.day &&
      a.periodIndex === target.period &&
      a.lectureId !== source.lectureId
  );

  const isSwap = Boolean(targetClassAssignment);
  let swappedLecture: TimetableLectureReference | undefined;

  if (isSwap && targetClassAssignment) {
    swappedLecture = {
      lectureId: targetClassAssignment.lectureId,
      classId: targetClassAssignment.classId,
      teacherId: targetClassAssignment.teacherId,
      subjectId: targetClassAssignment.subjectId,
      day: targetClassAssignment.dayIndex,
      period: targetClassAssignment.periodIndex,
    };

    const targetTeacher = teacherMap.get(targetClassAssignment.teacherId);
    if (targetTeacher) {
      // Check if target teacher is blocked at source slot
      if (targetTeacher.blockedSlots?.some((b) => b.day === source.day && b.period === source.period)) {
        conflicts.push({
          code: 'TEACHER_UNAVAILABLE',
          message: `المعلم ${targetTeacher.name} غير متاح في التوقيت البديل (اليوم ${source.day}، الحصة ${source.period + 1})`,
          details: { teacherId: targetTeacher.id, day: source.day, period: source.period },
        });
      }

      // Check if target teacher is already teaching another class at source slot
      const otherClassConflictForTarget = assignments.find(
        (a) =>
          a.teacherId === targetTeacher.id &&
          a.classId !== source.classId &&
          a.dayIndex === source.day &&
          a.periodIndex === source.period &&
          a.lectureId !== source.lectureId
      );
      if (otherClassConflictForTarget) {
        conflicts.push({
          code: 'TEACHER_DOUBLE_BOOKED',
          message: `المعلم ${targetTeacher.name} مرتبط بحصة أخرى مع فصل آخر في التوقيت البديل`,
          details: {
            teacherId: targetTeacher.id,
            classId: otherClassConflictForTarget.classId,
            day: source.day,
            period: source.period,
          },
        });
      }
    }
  }

  // Check if source teacher is already teaching another class at target slot
  const otherClassConflictForSource = assignments.find(
    (a) =>
      a.teacherId === source.teacherId &&
      a.classId !== source.classId &&
      a.dayIndex === target.day &&
      a.periodIndex === target.period &&
      a.lectureId !== source.lectureId
  );
  if (otherClassConflictForSource) {
    conflicts.push({
      code: 'TEACHER_DOUBLE_BOOKED',
      message: `المعلم ${sourceTeacher.name} مرتبط بحصة أخرى مع فصل آخر في هذا التوقيت`,
      details: {
        teacherId: source.teacherId,
        classId: otherClassConflictForSource.classId,
        day: target.day,
        period: target.period,
      },
    });
  }

  return {
    valid: conflicts.length === 0,
    isSwap,
    swappedLecture,
    conflicts,
  };
}

export function computeValidSlotsForLecture(
  input: TimetableInput,
  assignments: TimetableAssignment[],
  lectureId: string
): MoveSlotCoordinates[] {
  const current = assignments.find((a) => a.lectureId === lectureId);
  if (!current) return [];

  const source: TimetableLectureReference = {
    lectureId: current.lectureId,
    classId: current.classId,
    teacherId: current.teacherId,
    subjectId: current.subjectId,
    day: current.dayIndex,
    period: current.periodIndex,
  };

  const validSlots: MoveSlotCoordinates[] = [];

  for (const day of input.days) {
    for (let period = 0; period < input.periodsPerDay; period++) {
      if (day.id === source.day && period === source.period) {
        continue; // Skip same slot
      }
      const validation = validateMoveOrSwap(input, assignments, {
        source,
        target: { day: day.id, period },
      });
      if (validation.valid) {
        validSlots.push({ day: day.id, period });
      }
    }
  }

  return validSlots;
}

export function applyMoveOrSwap(
  assignments: TimetableAssignment[],
  request: MoveRequest
): TimetableAssignment[] {
  const { source, target } = request;

  return assignments.map((a) => {
    if (a.lectureId === source.lectureId) {
      return {
        ...a,
        dayIndex: target.day,
        periodIndex: target.period,
      };
    }
    if (a.classId === source.classId && a.dayIndex === target.day && a.periodIndex === target.period) {
      return {
        ...a,
        dayIndex: source.day,
        periodIndex: source.period,
      };
    }
    return a;
  });
}
