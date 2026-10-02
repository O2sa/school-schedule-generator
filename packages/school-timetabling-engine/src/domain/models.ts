import type { SchoolDay } from "./types";

export interface TimetableSlot {
  day: number;
  period: number;
}

export interface NormalizedClass {
  id: string;
  name: string;
  lecturesPerDay: number;
  allowedPeriods: Set<number>;
}

export interface NormalizedTeacher {
  id: string;
  name: string;
  workingDays: Set<number>;
  blockedSlots: Set<string>; // formatted as `${day},${period}`
  maxLecturesPerDay: number;
}

export interface NormalizedRequirement {
  id: string;
  teacherId: string;
  classId: string;
  subjectId?: string;
  subjectName?: string;
  lecturesPerWeek: number;
}

export interface NormalizedTimetableContext {
  days: SchoolDay[];
  dayIndexMap: Map<number, number>; // maps day.id to dense index 0..N-1
  periodsPerDay: number;
  classes: Map<string, NormalizedClass>;
  teachers: Map<string, NormalizedTeacher>;
  requirements: NormalizedRequirement[];
}
