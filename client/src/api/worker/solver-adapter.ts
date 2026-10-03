import type {
  TimetableInput,
  TimetableResult,
  SchoolDay,
  ClassDefinition,
  TeacherDefinition,
  TeachingRequirement,
} from "school-timetabling-engine";
import type {
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SavedScheduleRecord,
  TimetableAssignment,
  SolverOptions,
} from "../types";

export function buildTimetableInput(data: {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
  options?: SolverOptions;
}): TimetableInput {
  const dayNames = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const days: SchoolDay[] = data.config.workingDays.map((d) => ({
    id: d,
    name: dayNames[d] || `يوم ${d}`,
  }));

  const classes: ClassDefinition[] = data.classes.map((c) => ({
    id: c.id,
    name: c.sectionName,
    lecturesPerDay: c.periodsPerDay,
    allowedPeriods: Array.from({ length: c.periodsPerDay }, (_, i) => i),
  }));

  const teachers: TeacherDefinition[] = data.teachers.map((t) => ({
    id: t.id,
    name: t.name,
    workingDays: data.config.workingDays,
    maxLecturesPerDay: t.maxDailyPeriods,
    blockedSlots: t.unavailableSlots.map((s) => ({
      day: s.dayIndex,
      period: s.periodIndex,
    })),
  }));

  const subjectMap = new Map(data.subjects.map((s) => [s.id, s]));

  const requirements: TeachingRequirement[] = data.curriculum.map((c) => {
    const sub = subjectMap.get(c.subjectId);
    return {
      id: c.id,
      classId: c.classId,
      teacherId: c.teacherId,
      subjectId: c.subjectId,
      subjectName: sub?.name || "مادة غير معروفة",
      lecturesPerWeek: c.periodsPerWeek,
    };
  });

  return {
    days,
    periodsPerDay: data.config.periodsPerDayDefault,
    classes,
    teachers,
    requirements,
    options: {
      timeoutMs: data.options?.timeoutMs ?? 15000,
      seed: data.options?.randomSeed ?? 42,
      enableForwardChecking: true,
      minimizeGaps: true,
      balanceWorkload: true,
    },
  };
}

export function mapSolverResultToSavedSchedule(
  result: TimetableResult,
  data: {
    config: SchoolConfigRecord;
    classes: ClassRecord[];
    subjects: SubjectRecord[];
  },
): SavedScheduleRecord {
  const classMap = new Map(data.classes.map((c) => [c.id, c]));

  if (result.status === "SUCCESS") {
    const assignments: TimetableAssignment[] = result.lectures.map((l) => {
      const cls = classMap.get(l.classId);
      return {
        lectureId: `${l.classId}__${l.day}__${l.period}`,
        classId: l.classId,
        teacherId: l.teacherId,
        subjectId: l.subjectId || "",
        dayIndex: l.day,
        periodIndex: l.period,
        roomNumber: cls?.roomNumber || "قاعة 1",
      };
    });

    return {
      id: crypto.randomUUID(),
      name: `جدول مكتمل - ${new Date().toLocaleTimeString("ar-SA")}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      status: "solved",
      solveTimeMs: result.statistics.executionTimeMs,
      backtrackCount: result.statistics.backtracks,
      assignments,
    };
  }

  return {
    id: crypto.randomUUID(),
    name: `جدول غير مكتمل (${result.status}) - ${new Date().toLocaleTimeString("ar-SA")}`,
    createdAt: new Date().toISOString(),
    isActive: false,
    status: result.status === "INFEASIBLE" ? "unsat" : "timeout",
    solveTimeMs: result.statistics?.executionTimeMs ?? 0,
    backtrackCount: result.statistics?.backtracks ?? 0,
    assignments: [],
  };
}
