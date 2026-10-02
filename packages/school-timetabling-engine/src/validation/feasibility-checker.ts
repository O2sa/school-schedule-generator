import type { TimetableInput, DiagnosticViolation } from "../domain/types";

export interface FeasibilityResult {
  feasible: boolean;
  errors: DiagnosticViolation[];
}

export function checkFeasibility(input: TimetableInput): FeasibilityResult {
  const errors: DiagnosticViolation[] = [];
  const { days, periodsPerDay, classes, teachers, requirements } = input;

  const totalWorkingDays = days.length;

  // Compute total required class lectures
  let totalClassRequiredLectures = 0;
  for (const c of classes) {
    totalClassRequiredLectures += c.lecturesPerDay * totalWorkingDays;
  }

  // F6: Zero teachers check
  if (totalClassRequiredLectures > 0) {
    if (!teachers || teachers.length === 0 || !requirements || requirements.length === 0) {
      errors.push({
        code: "NO_TEACHERS_FOR_REQUIRED_LECTURES",
        message: `Classes require a total of ${totalClassRequiredLectures} lectures, but no teachers or requirements are provided.`
      });
      return { feasible: false, errors };
    }
  }

  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const classMap = new Map(classes.map(c => [c.id, c]));

  // Aggregate requirement sums by class and by teacher
  const reqSumByClass = new Map<string, number>();
  const reqSumByTeacher = new Map<string, number>();

  for (const r of requirements) {
    reqSumByClass.set(r.classId, (reqSumByClass.get(r.classId) ?? 0) + r.lecturesPerWeek);
    reqSumByTeacher.set(r.teacherId, (reqSumByTeacher.get(r.teacherId) ?? 0) + r.lecturesPerWeek);
  }

  // F1: Class lecture totals balance
  for (const c of classes) {
    const requiredForClass = c.lecturesPerDay * totalWorkingDays;
    const providedForClass = reqSumByClass.get(c.id) ?? 0;

    if (requiredForClass !== providedForClass) {
      errors.push({
        code: "CLASS_LECTURE_TOTAL_MISMATCH",
        message: `Class "${c.id}" requires ${requiredForClass} lectures (${totalWorkingDays} days × ${c.lecturesPerDay} lectures/day), but teacher requirements provide ${providedForClass}.`,
        classId: c.id,
        details: { required: requiredForClass, provided: providedForClass }
      });
    }
  }

  // F2: Teacher global slot capacity & F5: Teacher daily capacity sum
  for (const t of teachers) {
    const totalRequired = reqSumByTeacher.get(t.id) ?? 0;
    const maxDaily = t.maxLecturesPerDay ?? periodsPerDay;

    const blockedSet = new Set<string>();
    if (t.blockedSlots) {
      for (const slot of t.blockedSlots) {
        blockedSet.add(`${slot.day},${slot.period}`);
      }
    }

    let usableSlotsTotal = 0;
    let sumDailyCap = 0;

    for (const d of t.workingDays) {
      let usableOnDay = 0;
      for (let p = 0; p < periodsPerDay; p++) {
        if (!blockedSet.has(`${d},${p}`)) {
          usableOnDay++;
        }
      }
      usableSlotsTotal += usableOnDay;
      sumDailyCap += Math.min(usableOnDay, maxDaily);
    }

    if (totalRequired > usableSlotsTotal) {
      errors.push({
        code: "TEACHER_CAPACITY_EXCEEDED",
        message: `Teacher "${t.id}" requires ${totalRequired} weekly lectures, but only has ${usableSlotsTotal} usable slots across working days.`,
        teacherId: t.id,
        details: { totalRequired, usableSlots: usableSlotsTotal }
      });
    } else if (totalRequired > sumDailyCap) {
      errors.push({
        code: "TEACHER_DAILY_CAPACITY_DEFICIT",
        message: `Teacher "${t.id}" requires ${totalRequired} lectures, but maximum daily capacity limits restrict total lectures to ${sumDailyCap}.`,
        teacherId: t.id,
        details: { totalRequired, sumDailyCap }
      });
    }
  }

  // F3 & F4: Requirement vs class capacity & teacher-class overlap
  for (const r of requirements) {
    const c = classMap.get(r.classId);
    const t = teacherMap.get(r.teacherId);
    if (!c || !t) continue;

    const classTotalSlots = c.lecturesPerDay * totalWorkingDays;
    if (r.lecturesPerWeek > classTotalSlots) {
      errors.push({
        code: "REQUIREMENT_EXCEEDS_CLASS_CAPACITY",
        message: `Requirement for teacher "${t.id}" and class "${c.id}" requires ${r.lecturesPerWeek} lectures, exceeding class total capacity (${classTotalSlots}).`,
        teacherId: t.id,
        classId: c.id,
        details: { lecturesPerWeek: r.lecturesPerWeek, classTotalSlots }
      });
    }

    // Overlap calculation: count slots where teacher is available and class attends
    const classAllowed = new Set<number>(
      c.allowedPeriods ?? Array.from({ length: c.lecturesPerDay }, (_, i) => i)
    );
    const teacherWorkingDays = new Set<number>(t.workingDays);
    const teacherBlocked = new Set<string>(
      t.blockedSlots?.map(s => `${s.day},${s.period}`) ?? []
    );

    let overlapCount = 0;
    for (const d of teacherWorkingDays) {
      for (const p of classAllowed) {
        if (!teacherBlocked.has(`${d},${p}`)) {
          overlapCount++;
        }
      }
    }

    if (r.lecturesPerWeek > overlapCount) {
      errors.push({
        code: "INSUFFICIENT_TEACHER_CLASS_OVERLAP",
        message: `Teacher "${t.id}" requires ${r.lecturesPerWeek} lectures for class "${c.id}", but only ${overlapCount} overlapping valid slots exist in the timetable.`,
        teacherId: t.id,
        classId: c.id,
        details: { lecturesPerWeek: r.lecturesPerWeek, overlapCount }
      });
    }
  }

  return {
    feasible: errors.length === 0,
    errors
  };
}
