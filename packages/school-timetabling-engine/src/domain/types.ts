import type { HardConstraint } from "./constraints/constraint.interface";

export interface SchoolDay {
  /** 0-indexed day identifier (e.g. 0, 1, 2, 3, 4) */
  id: number;
  /** Optional display name (e.g. "Saturday", "Sunday") */
  name?: string;
}

export interface BlockedSlot {
  day: number;
  period: number;
}

export interface ClassDefinition {
  id: string;
  name: string;
  /** Number of required lectures for this class per school working day */
  lecturesPerDay: number;
  /**
   * Optional custom period indices the class attends on each working day.
   * If omitted, defaults to [0, 1, ..., lecturesPerDay - 1].
   */
  allowedPeriods?: number[];
}

export interface TeacherDefinition {
  id: string;
  name: string;
  /** Explicit working day indices, e.g. [0, 1, 3, 4] */
  workingDays: number[];
  /** Specific timetable slots where the teacher is unavailable */
  blockedSlots?: BlockedSlot[];
  /** Maximum periods a teacher can teach in any single day (default: periodsPerDay) */
  maxLecturesPerDay?: number;
}

export interface TeachingRequirement {
  /** Unique requirement ID. Auto-generated if omitted: `${teacherId}__${classId}__${subjectId ?? 'default'}` */
  id?: string;
  teacherId: string;
  classId: string;
  /** Optional subject code or name (supports teachers teaching multiple subjects to the same class) */
  subjectId?: string;
  subjectName?: string;
  /** Exact number of lectures required for this teacher/class/subject combination per week */
  lecturesPerWeek: number;
}

export interface SolverOptions {
  /** Maximum wall-clock time in milliseconds (default: 10_000ms) */
  timeoutMs?: number;
  /** Maximum backtracks before aborting with TIMEOUT (default: 100_000) */
  maxBacktracks?: number;
  /** Maximum search iterations before aborting with TIMEOUT (default: 500_000) */
  maxIterations?: number;
  /** Enable lookahead forward checking to prune dead branches early (default: true) */
  enableForwardChecking?: boolean;
  /** Soft heuristic: prefer contiguous teaching blocks and minimize 1-period gaps (default: true) */
  minimizeGaps?: boolean;
  /** Soft heuristic: distribute daily teaching load evenly across working days (default: true) */
  balanceWorkload?: boolean;
  /** Optional deterministic seed for heuristic tie-breaking (default: 42) */
  seed?: number;
  /** Custom additional hard constraints to evaluate */
  customConstraints?: HardConstraint[];
}

export interface TimetableInput {
  days: SchoolDay[];
  periodsPerDay: number;
  classes: ClassDefinition[];
  teachers: TeacherDefinition[];
  requirements: TeachingRequirement[];
  options?: SolverOptions;
}

export interface ScheduledLecture {
  day: number;
  period: number;
  classId: string;
  teacherId: string;
  subjectId?: string;
  subjectName?: string;
  requirementId: string;
}

export interface SolverStatistics {
  executionTimeMs: number;
  iterations: number;
  backtracks: number;
  forwardCheckingPrunes: number;
  maxSearchDepth: number;
}

export interface QualityMetrics {
  totalAssigned: number;
  teacherGapCount: number;
  teacherDailyLoadVariance: number;
  overallScore: number;
}

export interface DiagnosticViolation {
  code: string;
  message: string;
  teacherId?: string;
  classId?: string;
  day?: number;
  period?: number;
  details?: Record<string, unknown>;
}

export type TimetableResult =
  | {
      status: "SUCCESS";
      lectures: ScheduledLecture[];
      byClass: Map<string, ScheduledLecture[]>;
      byTeacher: Map<string, ScheduledLecture[]>;
      byDay: Map<number, ScheduledLecture[]>;
      statistics: SolverStatistics;
      quality: QualityMetrics;
    }
  | {
      status: "INFEASIBLE";
      diagnostics: DiagnosticViolation[];
      statistics: SolverStatistics;
    }
  | {
      status: "TIMEOUT";
      partialLectures: ScheduledLecture[];
      diagnostics: DiagnosticViolation[];
      statistics: SolverStatistics;
    };
