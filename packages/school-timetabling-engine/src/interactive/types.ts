import type { TimetableAssignment } from '../domain/types';

export interface MoveSlotCoordinates {
  day: number;
  period: number;
}

export interface TimetableLectureReference {
  lectureId: string;
  classId: string;
  teacherId: string;
  subjectId?: string;
  day: number;
  period: number;
}

export interface MoveRequest {
  source: TimetableLectureReference;
  target: MoveSlotCoordinates;
}

export type MoveConflictCode =
  | 'TEACHER_DOUBLE_BOOKED'
  | 'TEACHER_UNAVAILABLE'
  | 'CLASS_DOUBLE_BOOKED'
  | 'MAX_DAILY_EXCEEDED'
  | 'INVALID_SOURCE';

export interface MoveConflict {
  code: MoveConflictCode;
  message: string;
  details?: {
    teacherId?: string;
    classId?: string;
    day: number;
    period: number;
  };
}

export interface MoveValidationResult {
  valid: boolean;
  isSwap: boolean;
  swappedLecture?: TimetableLectureReference;
  conflicts: MoveConflict[];
}
