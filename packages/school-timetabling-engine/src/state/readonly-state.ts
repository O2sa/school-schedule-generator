import type { ReadonlyScheduleState } from "../domain/constraints/constraint.interface";
import type { NormalizedTeacher, NormalizedClass } from "../domain/models";
import type { ScheduleState } from "./schedule-state";

export class StateReadonlyAdapter implements ReadonlyScheduleState {
  constructor(private readonly state: ScheduleState) {}

  isTeacherAssigned(teacherId: string, day: number, period: number): boolean {
    return this.state.isTeacherAssigned(teacherId, day, period);
  }

  isClassAssigned(classId: string, day: number, period: number): boolean {
    return this.state.isClassAssigned(classId, day, period);
  }

  getTeacherDailyLoad(teacherId: string, day: number): number {
    return this.state.getTeacherDailyLoad(teacherId, day);
  }

  getClassDailyLoad(classId: string, day: number): number {
    return this.state.getClassDailyLoad(classId, day);
  }

  getTeacher(teacherId: string): NormalizedTeacher | undefined {
    return this.state.context.teachers.get(teacherId);
  }

  getClass(classId: string): NormalizedClass | undefined {
    return this.state.context.classes.get(classId);
  }

  getRemainingRequirement(requirementId: string): number {
    return this.state.getRemaining(requirementId);
  }
}
