import { describe, it, expect } from "vitest";
import { checkFeasibility } from "../../src/validation/feasibility-checker";
import type { TimetableInput } from "../../src/domain/types";

function createFeasibleInput(): TimetableInput {
  return {
    days: [
      { id: 0, name: "Day 0" },
      { id: 1, name: "Day 1" },
      { id: 2, name: "Day 2" },
      { id: 3, name: "Day 3" },
      { id: 4, name: "Day 4" }
    ],
    periodsPerDay: 8,
    classes: [
      { id: "c1", name: "Class 1", lecturesPerDay: 8 } // 5 * 8 = 40 required
    ],
    teachers: [
      { id: "t1", name: "Teacher 1", workingDays: [0, 1, 2, 3, 4] },
      { id: "t2", name: "Teacher 2", workingDays: [0, 1, 2, 3, 4] }
    ],
    requirements: [
      { id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 20 },
      { id: "r2", teacherId: "t2", classId: "c1", lecturesPerWeek: 20 }
    ]
  };
}

describe("Feasibility Checker", () => {
  it("passes a balanced, feasible configuration", () => {
    const input = createFeasibleInput();
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("F1: detects class required lectures mismatch", () => {
    const input = createFeasibleInput();
    input.requirements[0]!.lecturesPerWeek = 18; // total 38 instead of 40
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "CLASS_LECTURE_TOTAL_MISMATCH")).toBe(true);
    const err = result.errors.find(e => e.code === "CLASS_LECTURE_TOTAL_MISMATCH");
    expect(err?.message).toContain("requires 40 lectures");
    expect(err?.message).toContain("38");
  });

  it("F2: detects teacher overall capacity deficit due to blocked slots", () => {
    const input = createFeasibleInput();
    // Teacher 1 needs 20 lectures, but has 4 days * 8 = 32 slots minus 15 blocked = 17 slots
    input.teachers[0]!.workingDays = [0, 1, 2, 3];
    input.teachers[0]!.blockedSlots = Array.from({ length: 15 }, (_, i) => ({ day: 0, period: i < 8 ? i : 0 }));
    // Better: block 15 distinct slots:
    input.teachers[0]!.blockedSlots = [
      { day: 0, period: 0 }, { day: 0, period: 1 }, { day: 0, period: 2 }, { day: 0, period: 3 },
      { day: 0, period: 4 }, { day: 0, period: 5 }, { day: 0, period: 6 }, { day: 0, period: 7 },
      { day: 1, period: 0 }, { day: 1, period: 1 }, { day: 1, period: 2 }, { day: 1, period: 3 },
      { day: 1, period: 4 }, { day: 1, period: 5 }, { day: 1, period: 6 }
    ];
    // 4 days * 8 = 32 slots - 15 blocked = 17 usable slots < 20 required
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "TEACHER_CAPACITY_EXCEEDED")).toBe(true);
  });

  it("F3: detects requirement exceeding class capacity", () => {
    const input = createFeasibleInput();
    // Class requires 40 lectures, requirement alone asks for 45
    input.requirements[0]!.lecturesPerWeek = 45;
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "REQUIREMENT_EXCEEDS_CLASS_CAPACITY")).toBe(true);
  });

  it("F4: detects teacher-class timetable overlap deficit", () => {
    const input = createFeasibleInput();
    // Class c1 attends periods 0..3 (4 periods/day * 5 days = 20 total)
    input.classes[0]!.lecturesPerDay = 4;
    input.classes[0]!.allowedPeriods = [0, 1, 2, 3];
    // Teacher 1 requires 20 lectures for c1
    input.requirements = [{ id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 20 }];
    // But Teacher 1 is blocked on period 0 for all 5 days -> only periods 1,2,3 available (3 * 5 = 15 < 20)
    input.teachers[0]!.blockedSlots = [
      { day: 0, period: 0 },
      { day: 1, period: 0 },
      { day: 2, period: 0 },
      { day: 3, period: 0 },
      { day: 4, period: 0 }
    ];
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "INSUFFICIENT_TEACHER_CLASS_OVERLAP")).toBe(true);
  });

  it("F5: detects teacher daily capacity sum deficit", () => {
    const input = createFeasibleInput();
    // Teacher 1 requires 20 lectures across 5 days, but maxLecturesPerDay is 3 (3 * 5 = 15 < 20)
    input.teachers[0]!.maxLecturesPerDay = 3;
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "TEACHER_DAILY_CAPACITY_DEFICIT")).toBe(true);
  });

  it("F6: detects 0 teachers when class requires lectures", () => {
    const input = createFeasibleInput();
    input.teachers = [];
    input.requirements = [];
    const result = checkFeasibility(input);
    expect(result.feasible).toBe(false);
    expect(result.errors.some(e => e.code === "NO_TEACHERS_FOR_REQUIRED_LECTURES")).toBe(true);
  });
});
