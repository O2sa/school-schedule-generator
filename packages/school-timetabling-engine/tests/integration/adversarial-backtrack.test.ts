import { describe, it, expect } from "vitest";
import { solveTimetable } from "../../src/solver/scheduler";
import type { TimetableInput } from "../../src/domain/types";

describe("Adversarial Backtracking Scenario", () => {
  it("recovers from a greedy trap via backtracking and forward checking", () => {
    // Scenario:
    // 1 Day, 2 Periods (0 and 1).
    // Class 1 (c1) attends periods 0 and 1 (lecturesPerDay = 2).
    // Class 2 (c2) attends only period 0 (lecturesPerDay = 1, allowedPeriods = [0]).
    //
    // Teachers:
    // - T1 (flexible): can work periods 0 and 1.
    // - T2 (restricted): can only work period 0 (blocked on period 1).
    //
    // Requirements:
    // - T1 -> C1: 1 lecture
    // - T2 -> C1: 1 lecture
    // - T1 -> C2: 1 lecture
    //
    // Trap: If T1 is assigned to C1 at Period 0:
    // Then T1 is busy at Period 0.
    // But C2 only attends Period 0 and requires T1!
    // This leaves C2 with 0 valid slots.
    // The solver must backtrack, schedule T1 for C1 at Period 1,
    // which allows T1 for C2 at Period 0, and T2 for C1 at Period 0.

    const input: TimetableInput = {
      days: [{ id: 0, name: "Monday" }],
      periodsPerDay: 2,
      classes: [
        { id: "c1", name: "Class 1", lecturesPerDay: 2 },
        { id: "c2", name: "Class 2", lecturesPerDay: 1, allowedPeriods: [0] }
      ],
      teachers: [
        {
          id: "t1",
          name: "Teacher 1",
          workingDays: [0],
          maxLecturesPerDay: 2
        },
        {
          id: "t2",
          name: "Teacher 2",
          workingDays: [0],
          blockedSlots: [{ day: 0, period: 1 }], // T2 cannot work period 1
          maxLecturesPerDay: 2
        }
      ],
      requirements: [
        { id: "r_c1_t1", teacherId: "t1", classId: "c1", lecturesPerWeek: 1 },
        { id: "r_c1_t2", teacherId: "t2", classId: "c1", lecturesPerWeek: 1 },
        { id: "r_c2_t1", teacherId: "t1", classId: "c2", lecturesPerWeek: 1 }
      ]
    };

    const result = solveTimetable(input);

    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") return;

    expect(result.lectures).toHaveLength(3);

    // Verify correct assignments
    const c2Lec = result.byClass.get("c2")?.[0];
    expect(c2Lec?.teacherId).toBe("t1");
    expect(c2Lec?.period).toBe(0);

    const c1Lectures = result.byClass.get("c1")!;
    const c1AtPeriod0 = c1Lectures.find(l => l.period === 0);
    const c1AtPeriod1 = c1Lectures.find(l => l.period === 1);

    expect(c1AtPeriod0?.teacherId).toBe("t2");
    expect(c1AtPeriod1?.teacherId).toBe("t1");
  });
});
