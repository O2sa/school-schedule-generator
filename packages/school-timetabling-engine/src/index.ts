// Package version
export const VERSION = "1.0.0";

// Core API functions
export { solveTimetable } from "./solver/scheduler";
export { validateInput, type ValidationResult } from "./validation/input-validator";
export { checkFeasibility, type FeasibilityResult } from "./validation/feasibility-checker";

// Formatters
export { formatTimetableByClass, formatTimetableByTeacher } from "./formatters/timetable-formatter";

// Public Domain Types
export type {
  SchoolDay,
  BlockedSlot,
  ClassDefinition,
  TeacherDefinition,
  TeachingRequirement,
  SolverOptions,
  TimetableInput,
  ScheduledLecture,
  SolverStatistics,
  QualityMetrics,
  DiagnosticViolation,
  TimetableResult
} from "./domain/types";

// Extensible Constraint Interface & Built-in Hard Constraints
export type {
  HardConstraint,
  AssignmentCandidate,
  ReadonlyScheduleState
} from "./domain/constraints/constraint.interface";

export {
  TeacherNoCollisionConstraint,
  ClassNoCollisionConstraint,
  TeacherWorkingDaysConstraint,
  TeacherBlockedSlotsConstraint,
  ClassAllowedPeriodsConstraint,
  TeacherDailyOverloadConstraint,
  defaultHardConstraints
} from "./domain/constraints/built-in-constraints";

// Interactive Editing
export * from "./interactive/types";
export * from "./interactive/move-validator";
