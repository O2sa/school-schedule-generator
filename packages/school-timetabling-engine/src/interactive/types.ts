export interface MoveSlotCoordinates {
  day: number;
  period: number;
}

export interface TimetableLectureReference {
  lectureId: string;
  classId: string;
  teacherId: string;
  subjectId?: string | undefined;
  day: number;
  period: number;
}

export interface TimetableAssignment {
  lectureId: string;
  classId: string;
  teacherId: string;
  subjectId: string;
  dayIndex: number;
  periodIndex: number;
  roomNumber: string;
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
    teacherId?: string | undefined;
    classId?: string | undefined;
    day: number;
    period: number;
  } | undefined;
}

export interface MoveValidationResult {
  valid: boolean;
  isSwap: boolean;
  swappedLecture?: TimetableLectureReference | undefined;
  conflicts: MoveConflict[];
}
