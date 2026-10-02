import type { NormalizedTeacher, NormalizedClass } from "../models";

export interface AssignmentCandidate {
  teacherId: string;
  classId: string;
  subjectId?: string | undefined;
  day: number;
  period: number;
}

export interface ReadonlyScheduleState {
  isTeacherAssigned(teacherId: string, day: number, period: number): boolean;
  isClassAssigned(classId: string, day: number, period: number): boolean;
  getTeacherDailyLoad(teacherId: string, day: number): number;
  getClassDailyLoad(classId: string, day: number): number;
  getTeacher(teacherId: string): NormalizedTeacher | undefined;
  getClass(classId: string): NormalizedClass | undefined;
  getRemainingRequirement(requirementId: string): number;
}

export interface HardConstraint {
  readonly id: string;
  readonly description: string;
  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean;
}
