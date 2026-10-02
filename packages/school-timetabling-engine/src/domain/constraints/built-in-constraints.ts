import type {
  AssignmentCandidate,
  HardConstraint,
  ReadonlyScheduleState
} from "./constraint.interface";

/**
 * H1 — One teacher cannot teach two classes simultaneously.
 */
export class TeacherNoCollisionConstraint implements HardConstraint {
  readonly id = "H1_TEACHER_NO_COLLISION";
  readonly description = "A teacher cannot teach two classes simultaneously in the same period";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    return !state.isTeacherAssigned(candidate.teacherId, candidate.day, candidate.period);
  }
}

/**
 * H2 — A class cannot have two teachers simultaneously.
 */
export class ClassNoCollisionConstraint implements HardConstraint {
  readonly id = "H2_CLASS_NO_COLLISION";
  readonly description = "A class cannot have more than one teacher simultaneously in the same period";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    return !state.isClassAssigned(candidate.classId, candidate.day, candidate.period);
  }
}

/**
 * H3 — Teacher cannot teach when not working.
 */
export class TeacherWorkingDaysConstraint implements HardConstraint {
  readonly id = "H3_TEACHER_WORKING_DAYS";
  readonly description = "A teacher cannot be scheduled on a non-working day";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    const teacher = state.getTeacher(candidate.teacherId);
    if (!teacher) return false;
    return teacher.workingDays.has(candidate.day);
  }
}

/**
 * H4 — Teacher cannot teach blocked slots.
 */
export class TeacherBlockedSlotsConstraint implements HardConstraint {
  readonly id = "H4_TEACHER_BLOCKED_SLOTS";
  readonly description = "A teacher cannot be scheduled in a blocked slot";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    const teacher = state.getTeacher(candidate.teacherId);
    if (!teacher) return false;
    const slotKey = `${candidate.day},${candidate.period}`;
    return !teacher.blockedSlots.has(slotKey);
  }
}

/**
 * H7 — Class daily period boundaries.
 */
export class ClassAllowedPeriodsConstraint implements HardConstraint {
  readonly id = "H7_CLASS_ALLOWED_PERIODS";
  readonly description = "A class cannot receive lectures outside its allowed daily periods";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    const schoolClass = state.getClass(candidate.classId);
    if (!schoolClass) return false;
    return schoolClass.allowedPeriods.has(candidate.period);
  }
}

/**
 * H8 — Teacher daily overload.
 */
export class TeacherDailyOverloadConstraint implements HardConstraint {
  readonly id = "H8_TEACHER_DAILY_OVERLOAD";
  readonly description = "A teacher cannot exceed their maximum allowed lectures on a single day";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    const teacher = state.getTeacher(candidate.teacherId);
    if (!teacher) return false;
    const currentLoad = state.getTeacherDailyLoad(candidate.teacherId, candidate.day);
    return currentLoad < teacher.maxLecturesPerDay;
  }
}

export const defaultHardConstraints: HardConstraint[] = [
  new TeacherNoCollisionConstraint(),
  new ClassNoCollisionConstraint(),
  new TeacherWorkingDaysConstraint(),
  new TeacherBlockedSlotsConstraint(),
  new ClassAllowedPeriodsConstraint(),
  new TeacherDailyOverloadConstraint()
];
