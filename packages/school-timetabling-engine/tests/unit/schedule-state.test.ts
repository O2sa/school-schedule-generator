import { describe, it, expect } from "vitest";
import { ScheduleState } from "../../src/state/schedule-state";
import type { NormalizedTimetableContext, NormalizedRequirement } from "../../src/domain/models";

function createMockContext(): NormalizedTimetableContext {
  const days = [
    { id: 0, name: "Day 0" },
    { id: 1, name: "Day 1" },
    { id: 2, name: "Day 2" },
    { id: 3, name: "Day 3" },
    { id: 4, name: "Day 4" }
  ];
  const dayIndexMap = new Map(days.map((d, i) => [d.id, i]));

  const classes = new Map([
    ["c1", { id: "c1", name: "Class 1", lecturesPerDay: 4, allowedPeriods: new Set([0, 1, 2, 3]) }],
    ["c2", { id: "c2", name: "Class 2", lecturesPerDay: 4, allowedPeriods: new Set([0, 1, 2, 3]) }]
  ]);

  const teachers = new Map([
    [
      "t1",
      {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1, 2, 3, 4]),
        blockedSlots: new Set(["0,0"]),
        maxLecturesPerDay: 4
      }
    ],
    [
      "t2",
      {
        id: "t2",
        name: "Teacher 2",
        workingDays: new Set([1, 2, 3]),
        blockedSlots: new Set<string>(),
        maxLecturesPerDay: 3
      }
    ]
  ]);

  const requirements: NormalizedRequirement[] = [
    { id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 10, subjectId: "math" },
    { id: "r2", teacherId: "t2", classId: "c1", lecturesPerWeek: 10, subjectId: "science" }
  ];

  return {
    days,
    dayIndexMap,
    periodsPerDay: 4,
    classes,
    teachers,
    requirements
  };
}

describe("ScheduleState with Transactional Undo Stack", () => {
  it("initializes empty grids and full remaining requirements", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);

    expect(state.getRemaining("r1")).toBe(10);
    expect(state.getRemaining("r2")).toBe(10);
    expect(state.getTotalUnscheduled()).toBe(20);
    expect(state.isTeacherAssigned("t1", 0, 1)).toBe(false);
    expect(state.isClassAssigned("c1", 0, 1)).toBe(false);
    expect(state.getTeacherDailyLoad("t1", 0)).toBe(0);
  });

  it("assigns a lecture and updates grids, daily loads, and remaining counters", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const req = ctx.requirements[0]!;

    const lecture = state.assign(req, 0, 1);
    expect(lecture.day).toBe(0);
    expect(lecture.period).toBe(1);
    expect(lecture.teacherId).toBe("t1");
    expect(lecture.classId).toBe("c1");
    expect(lecture.subjectId).toBe("math");

    expect(state.isTeacherAssigned("t1", 0, 1)).toBe(true);
    expect(state.isClassAssigned("c1", 0, 1)).toBe(true);
    expect(state.getTeacherDailyLoad("t1", 0)).toBe(1);
    expect(state.getClassDailyLoad("c1", 0)).toBe(1);
    expect(state.getRemaining("r1")).toBe(9);
    expect(state.getTotalUnscheduled()).toBe(19);
  });

  it("undo() perfectly reverts the last assignment", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const req = ctx.requirements[0]!;

    state.assign(req, 0, 1);
    expect(state.isTeacherAssigned("t1", 0, 1)).toBe(true);

    state.undo();
    expect(state.isTeacherAssigned("t1", 0, 1)).toBe(false);
    expect(state.isClassAssigned("c1", 0, 1)).toBe(false);
    expect(state.getTeacherDailyLoad("t1", 0)).toBe(0);
    expect(state.getClassDailyLoad("c1", 0)).toBe(0);
    expect(state.getRemaining("r1")).toBe(10);
    expect(state.getTotalUnscheduled()).toBe(20);
  });

  it("maintains stack symmetry over multiple nested assign/undo operations", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const r1 = ctx.requirements[0]!;
    const r2 = ctx.requirements[1]!;

    state.assign(r1, 1, 1);
    state.assign(r2, 1, 2);
    state.assign(r1, 2, 0);

    expect(state.getTotalUnscheduled()).toBe(17);
    expect(state.getTeacherDailyLoad("t1", 1)).toBe(1);
    expect(state.getTeacherDailyLoad("t2", 1)).toBe(1);
    expect(state.getClassDailyLoad("c1", 1)).toBe(2);

    state.undo(); // undo r1 at (2,0)
    expect(state.isTeacherAssigned("t1", 2, 0)).toBe(false);
    expect(state.getRemaining("r1")).toBe(9);

    state.undo(); // undo r2 at (1,2)
    expect(state.isTeacherAssigned("t2", 1, 2)).toBe(false);
    expect(state.getRemaining("r2")).toBe(10);

    state.undo(); // undo r1 at (1,1)
    expect(state.isTeacherAssigned("t1", 1, 1)).toBe(false);
    expect(state.getTotalUnscheduled()).toBe(20);
  });

  it("filters candidate slots according to hard constraints and current occupancy", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const r1 = ctx.requirements[0]!; // t1, c1. t1 blocked at (0,0)

    const candidatesBefore = state.getCandidateSlots(r1);
    // Total class slots = 5 days * 4 periods = 20. Blocked at (0,0) -> 19
    expect(candidatesBefore.length).toBe(19);
    expect(candidatesBefore.some(s => s.day === 0 && s.period === 0)).toBe(false);

    // Assign another teacher to c1 at (0, 1)
    state.assign(ctx.requirements[1]!, 0, 1);
    const candidatesAfter = state.getCandidateSlots(r1);
    expect(candidatesAfter.length).toBe(18);
    expect(candidatesAfter.some(s => s.day === 0 && s.period === 1)).toBe(false);
  });

  it("handles 1000 assign/undo cycles without state drift", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const r1 = ctx.requirements[0]!;

    for (let i = 0; i < 1000; i++) {
      state.assign(r1, 1, 1);
      state.undo();
    }

    expect(state.getTotalUnscheduled()).toBe(20);
    expect(state.getRemaining("r1")).toBe(10);
    expect(state.isTeacherAssigned("t1", 1, 1)).toBe(false);
    expect(state.isClassAssigned("c1", 1, 1)).toBe(false);
    expect(state.getTeacherDailyLoad("t1", 1)).toBe(0);
    expect(state.getClassDailyLoad("c1", 1)).toBe(0);
  });
});
