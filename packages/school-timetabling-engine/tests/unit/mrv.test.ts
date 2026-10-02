import { describe, it, expect } from "vitest";
import { selectNextRequirement } from "../../src/heuristics/mrv";
import { ScheduleState } from "../../src/state/schedule-state";
import type { NormalizedTimetableContext, NormalizedRequirement } from "../../src/domain/models";

function createMockContext(): NormalizedTimetableContext {
  const days = [
    { id: 0, name: "Day 0" },
    { id: 1, name: "Day 1" },
    { id: 2, name: "Day 2" }
  ];
  const dayIndexMap = new Map(days.map((d, i) => [d.id, i]));

  const classes = new Map([
    ["c1", { id: "c1", name: "Class 1", lecturesPerDay: 3, allowedPeriods: new Set([0, 1, 2]) }]
  ]);

  const teachers = new Map([
    [
      "t1",
      {
        id: "t1",
        name: "Restricted Teacher",
        workingDays: new Set([0]), // only 1 day = 3 slots max
        blockedSlots: new Set<string>(),
        maxLecturesPerDay: 3
      }
    ],
    [
      "t2",
      {
        id: "t2",
        name: "Flexible Teacher",
        workingDays: new Set([0, 1, 2]), // 3 days = 9 slots
        blockedSlots: new Set<string>(),
        maxLecturesPerDay: 3
      }
    ]
  ]);

  const requirements: NormalizedRequirement[] = [
    { id: "r_flexible", teacherId: "t2", classId: "c1", lecturesPerWeek: 3 },
    { id: "r_restricted", teacherId: "t1", classId: "c1", lecturesPerWeek: 2 }
  ];

  return {
    days,
    dayIndexMap,
    periodsPerDay: 3,
    classes,
    teachers,
    requirements
  };
}

describe("MRV (Minimum Remaining Values) Variable Selection", () => {
  it("selects the most constrained requirement (fewest candidate slots) first", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);

    const selection = selectNextRequirement(state, ctx.requirements);
    expect(selection.isDeadEnd).toBe(false);
    expect(selection.requirement).not.toBeNull();
    // r_restricted has only 3 candidate slots (Day 0), while r_flexible has 9 candidate slots
    expect(selection.requirement?.id).toBe("r_restricted");
    expect(selection.candidateSlots.length).toBe(3);
  });

  it("detects a dead end when available candidate slots < remaining required lectures", () => {
    const ctx = createMockContext();
    // Teacher 1 requires 4 lectures, but can only ever work 3 slots
    ctx.requirements.push({
      id: "r_impossible",
      teacherId: "t1",
      classId: "c1",
      lecturesPerWeek: 4
    });

    const state = new ScheduleState(ctx);
    const selection = selectNextRequirement(state, ctx.requirements);
    expect(selection.isDeadEnd).toBe(true);
  });

  it("breaks ties deterministically by higher remaining count, then teacher constraint, then ID", () => {
    const ctx = createMockContext();
    // Both t2, same candidates (9 slots each), but r1 has 4 lectures and r2 has 2 lectures
    const reqs: NormalizedRequirement[] = [
      { id: "r_low", teacherId: "t2", classId: "c1", lecturesPerWeek: 2 },
      { id: "r_high", teacherId: "t2", classId: "c1", lecturesPerWeek: 4 }
    ];
    ctx.requirements = reqs;

    const state = new ScheduleState(ctx);
    const selection = selectNextRequirement(state, reqs);
    expect(selection.requirement?.id).toBe("r_high");
  });

  it("returns null when all requirements are fully scheduled", () => {
    const ctx = createMockContext();
    ctx.requirements = [{ id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 1 }];
    const state = new ScheduleState(ctx);
    state.assign(ctx.requirements[0]!, 0, 0);

    const selection = selectNextRequirement(state, ctx.requirements);
    expect(selection.requirement).toBeNull();
    expect(selection.candidateSlots.length).toBe(0);
    expect(selection.isDeadEnd).toBe(false);
  });
});
