import type {
  TimetableInput,
  TimetableResult,
  ScheduledLecture,
  SolverStatistics
} from "../domain/types";
import type {
  NormalizedTimetableContext,
  NormalizedClass,
  NormalizedTeacher,
  NormalizedRequirement
} from "../domain/models";
import { validateInput } from "../validation/input-validator";
import { checkFeasibility } from "../validation/feasibility-checker";
import { ScheduleState } from "../state/schedule-state";
import { calculateQualityMetrics } from "../heuristics/quality-metrics";
import { executeBacktrackingSearch } from "./search";

export function solveTimetable(input: TimetableInput): TimetableResult {
  const startTime = Date.now();

  const statistics: SolverStatistics = {
    executionTimeMs: 0,
    iterations: 0,
    backtracks: 0,
    forwardCheckingPrunes: 0,
    maxSearchDepth: 0
  };

  // 1. Syntactic & structural validation
  const validation = validateInput(input);
  if (!validation.valid) {
    statistics.executionTimeMs = Date.now() - startTime;
    return {
      status: "INFEASIBLE",
      diagnostics: validation.errors,
      statistics
    };
  }

  // 2. Fast edge case: 0 classes
  if (input.classes.length === 0) {
    statistics.executionTimeMs = Date.now() - startTime;
    return {
      status: "SUCCESS",
      lectures: [],
      byClass: new Map(),
      byTeacher: new Map(),
      byDay: new Map(),
      statistics,
      quality: {
        totalAssigned: 0,
        teacherGapCount: 0,
        teacherDailyLoadVariance: 0,
        overallScore: 1000
      }
    };
  }

  // 3. Mathematical capacity & feasibility checks
  const feasibility = checkFeasibility(input);
  if (!feasibility.feasible) {
    statistics.executionTimeMs = Date.now() - startTime;
    return {
      status: "INFEASIBLE",
      diagnostics: feasibility.errors,
      statistics
    };
  }

  // 4. Build normalized context
  const dayIndexMap = new Map<number, number>();
  input.days.forEach((d, idx) => dayIndexMap.set(d.id, idx));

  const classesMap = new Map<string, NormalizedClass>();
  for (const c of input.classes) {
    const allowed = c.allowedPeriods
      ? new Set(c.allowedPeriods)
      : new Set(Array.from({ length: c.lecturesPerDay }, (_, i) => i));

    classesMap.set(c.id, {
      id: c.id,
      name: c.name,
      lecturesPerDay: c.lecturesPerDay,
      allowedPeriods: allowed
    });
  }

  const teachersMap = new Map<string, NormalizedTeacher>();
  for (const t of input.teachers) {
    const blocked = new Set<string>();
    if (t.blockedSlots) {
      for (const b of t.blockedSlots) {
        blocked.add(`${b.day},${b.period}`);
      }
    }
    teachersMap.set(t.id, {
      id: t.id,
      name: t.name,
      workingDays: new Set(t.workingDays),
      blockedSlots: blocked,
      maxLecturesPerDay: t.maxLecturesPerDay ?? input.periodsPerDay
    });
  }

  const requirements: NormalizedRequirement[] = input.requirements.map(r => ({
    id: r.id ?? `${r.teacherId}__${r.classId}__${r.subjectId ?? "default"}`,
    teacherId: r.teacherId,
    classId: r.classId,
    ...(r.subjectId !== undefined ? { subjectId: r.subjectId } : {}),
    ...(r.subjectName !== undefined ? { subjectName: r.subjectName } : {}),
    lecturesPerWeek: r.lecturesPerWeek
  }));

  const context: NormalizedTimetableContext = {
    days: input.days,
    dayIndexMap,
    periodsPerDay: input.periodsPerDay,
    classes: classesMap,
    teachers: teachersMap,
    requirements
  };

  // 5. Initialize search state
  const state = new ScheduleState(context, input.options?.customConstraints);

  // 6. Execute recursive CSP search
  const outcome = executeBacktrackingSearch(
    state,
    requirements,
    input.options,
    statistics,
    startTime
  );

  statistics.executionTimeMs = Date.now() - startTime;

  if (outcome.status === "SUCCESS") {
    const lectures = state.getAllScheduledLectures();

    const byClass = new Map<string, ScheduledLecture[]>();
    for (const c of input.classes) byClass.set(c.id, []);

    const byTeacher = new Map<string, ScheduledLecture[]>();
    for (const t of input.teachers) byTeacher.set(t.id, []);

    const byDay = new Map<number, ScheduledLecture[]>();
    for (const d of input.days) byDay.set(d.id, []);

    for (const lec of lectures) {
      byClass.get(lec.classId)?.push(lec);
      byTeacher.get(lec.teacherId)?.push(lec);
      byDay.get(lec.day)?.push(lec);
    }

    const quality = calculateQualityMetrics(
      lectures,
      teachersMap,
      input.days,
      input.periodsPerDay
    );

    return {
      status: "SUCCESS",
      lectures,
      byClass,
      byTeacher,
      byDay,
      statistics,
      quality
    };
  }

  if (outcome.status === "TIMEOUT") {
    return {
      status: "TIMEOUT",
      partialLectures: state.getAllScheduledLectures(),
      diagnostics: [
        {
          code: "SOLVER_TIMEOUT",
          message: "The search limits (timeoutMs, maxIterations, or maxBacktracks) were exceeded before a complete timetable was found."
        }
      ],
      statistics
    };
  }

  // Exhaustive search completed without finding a valid assignment
  return {
    status: "INFEASIBLE",
    diagnostics: [
      {
        code: "NO_FEASIBLE_SCHEDULE",
        message: "No timetable exists that satisfies all hard constraints. The problem space was exhaustively searched without finding a conflict-free solution."
      }
    ],
    statistics
  };
}
