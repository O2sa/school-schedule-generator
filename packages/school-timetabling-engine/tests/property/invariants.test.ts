import { describe, it, expect } from "vitest";
import { solveTimetable } from "../../src/solver/scheduler";
import type { TimetableInput, TimetableResult } from "../../src/domain/types";

export function assertAllHardInvariants(input: TimetableInput, result: TimetableResult): void {
  expect(result.status).toBe("SUCCESS");
  if (result.status !== "SUCCESS") return;

  const { lectures, byClass, byTeacher } = result;

  // H1: No teacher collision (same teacher, same day, same period)
  const teacherOccupancy = new Set<string>();
  for (const lec of lectures) {
    const key = `${lec.teacherId}__${lec.day}__${lec.period}`;
    expect(teacherOccupancy.has(key), `Teacher collision detected for teacher ${lec.teacherId} at day ${lec.day}, period ${lec.period}`).toBe(false);
    teacherOccupancy.add(key);
  }

  // H2: No class collision (same class, same day, same period)
  const classOccupancy = new Set<string>();
  for (const lec of lectures) {
    const key = `${lec.classId}__${lec.day}__${lec.period}`;
    expect(classOccupancy.has(key), `Class collision detected for class ${lec.classId} at day ${lec.day}, period ${lec.period}`).toBe(false);
    classOccupancy.add(key);
  }

  // H3 & H4: Teacher working days and blocked slots
  const teacherMap = new Map(input.teachers.map(t => [t.id, t]));
  for (const lec of lectures) {
    const teacher = teacherMap.get(lec.teacherId);
    expect(teacher).toBeDefined();
    if (!teacher) continue;

    expect(
      teacher.workingDays.includes(lec.day),
      `Teacher ${teacher.id} scheduled on non-working day ${lec.day}`
    ).toBe(true);

    if (teacher.blockedSlots) {
      const isBlocked = teacher.blockedSlots.some(
        s => s.day === lec.day && s.period === lec.period
      );
      expect(isBlocked, `Teacher ${teacher.id} scheduled in blocked slot day ${lec.day}, period ${lec.period}`).toBe(false);
    }
  }

  // H5: Exact weekly requirement fulfilled
  const reqCounts = new Map<string, number>();
  for (const lec of lectures) {
    reqCounts.set(lec.requirementId, (reqCounts.get(lec.requirementId) ?? 0) + 1);
  }
  for (const req of input.requirements) {
    const reqId = req.id ?? `${req.teacherId}__${req.classId}__${req.subjectId ?? "default"}`;
    const assigned = reqCounts.get(reqId) ?? 0;
    expect(assigned, `Requirement ${reqId} expected ${req.lecturesPerWeek} lectures, but received ${assigned}`).toBe(req.lecturesPerWeek);
  }

  // H6: Every class has exact total lectures
  const totalDays = input.days.length;
  for (const c of input.classes) {
    const classLectures = byClass.get(c.id) ?? [];
    const expected = c.lecturesPerDay * totalDays;
    expect(classLectures.length, `Class ${c.id} expected ${expected} total lectures, got ${classLectures.length}`).toBe(expected);

    // H7: Class allowed periods
    const allowed = new Set(c.allowedPeriods ?? Array.from({ length: c.lecturesPerDay }, (_, i) => i));
    for (const lec of classLectures) {
      expect(allowed.has(lec.period), `Class ${c.id} scheduled outside allowed periods at period ${lec.period}`).toBe(true);
    }
  }

  // H8: Teacher daily limits
  for (const t of input.teachers) {
    const maxDaily = t.maxLecturesPerDay ?? input.periodsPerDay;
    const teacherLectures = byTeacher.get(t.id) ?? [];
    const loadByDay = new Map<number, number>();
    for (const lec of teacherLectures) {
      loadByDay.set(lec.day, (loadByDay.get(lec.day) ?? 0) + 1);
    }
    for (const [day, count] of loadByDay) {
      expect(count, `Teacher ${t.id} daily load (${count}) exceeded limit (${maxDaily}) on day ${day}`).toBeLessThanOrEqual(maxDaily);
    }
  }
}

describe("Property Invariant Verification Across Timetables", () => {
  it("satisfies all hard invariants on a 3-class, 6-teacher school", () => {
    const input: TimetableInput = {
      days: [
        { id: 0, name: "Day 0" },
        { id: 1, name: "Day 1" },
        { id: 2, name: "Day 2" },
        { id: 3, name: "Day 3" }
      ],
      periodsPerDay: 6,
      classes: [
        { id: "c1", name: "Class 1", lecturesPerDay: 6 },
        { id: "c2", name: "Class 2", lecturesPerDay: 6 },
        { id: "c3", name: "Class 3", lecturesPerDay: 6 }
      ],
      teachers: [
        { id: "t1", name: "T1", workingDays: [0, 1, 2, 3] },
        { id: "t2", name: "T2", workingDays: [0, 1, 2, 3] },
        { id: "t3", name: "T3", workingDays: [0, 1, 2, 3] },
        { id: "t4", name: "T4", workingDays: [0, 1, 2, 3] },
        { id: "t5", name: "T5", workingDays: [0, 1, 2, 3] },
        { id: "t6", name: "T6", workingDays: [0, 1, 2, 3] }
      ],
      requirements: [
        { teacherId: "t1", classId: "c1", lecturesPerWeek: 12 },
        { teacherId: "t2", classId: "c1", lecturesPerWeek: 12 },
        { teacherId: "t3", classId: "c2", lecturesPerWeek: 12 },
        { teacherId: "t4", classId: "c2", lecturesPerWeek: 12 },
        { teacherId: "t5", classId: "c3", lecturesPerWeek: 12 },
        { teacherId: "t6", classId: "c3", lecturesPerWeek: 12 }
      ]
    };

    const result = solveTimetable(input);
    assertAllHardInvariants(input, result);
  });

  it("satisfies all hard invariants when teachers are shared across multiple classes", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }, { id: 2 }],
      periodsPerDay: 4,
      classes: [
        { id: "c1", name: "Class 1", lecturesPerDay: 4 },
        { id: "c2", name: "Class 2", lecturesPerDay: 4 }
      ],
      teachers: [
        // t_shared teaches both c1 and c2
        { id: "t_shared", name: "Shared Teacher", workingDays: [0, 1, 2] },
        { id: "t_c1", name: "C1 Specialist", workingDays: [0, 1, 2] },
        { id: "t_c2", name: "C2 Specialist", workingDays: [0, 1, 2] }
      ],
      requirements: [
        { teacherId: "t_shared", classId: "c1", lecturesPerWeek: 6 },
        { teacherId: "t_shared", classId: "c2", lecturesPerWeek: 6 },
        { teacherId: "t_c1", classId: "c1", lecturesPerWeek: 6 },
        { teacherId: "t_c2", classId: "c2", lecturesPerWeek: 6 }
      ]
    };

    const result = solveTimetable(input);
    assertAllHardInvariants(input, result);
  });
});
