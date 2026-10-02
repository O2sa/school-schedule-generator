import { describe, it, expect } from "vitest";
import { scoreCandidateSlots } from "../../src/heuristics/slot-scoring";
import { ScheduleState } from "../../src/state/schedule-state";
import type { NormalizedTimetableContext, NormalizedRequirement } from "../../src/domain/models";

function createMockContext(): NormalizedTimetableContext {
  const days = [
    { id: 0, name: "Day 0" },
    { id: 1, name: "Day 1" }
  ];
  const dayIndexMap = new Map([[0, 0], [1, 1]]);
  const classes = new Map([
    ["c1", { id: "c1", name: "Class 1", lecturesPerDay: 4, allowedPeriods: new Set([0, 1, 2, 3]) }]
  ]);
  const teachers = new Map([
    [
      "t1",
      {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1]),
        blockedSlots: new Set<string>(),
        maxLecturesPerDay: 4
      }
    ]
  ]);
  const requirements: NormalizedRequirement[] = [
    { id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 4, subjectId: "math" }
  ];

  return { days, dayIndexMap, periodsPerDay: 4, classes, teachers, requirements };
}

describe("Candidate Slot Scoring Heuristics", () => {
  it("prefers slots on days with lower teacher load (workload balancing)", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const req = ctx.requirements[0]!;

    // Assign 2 lectures on Day 0
    state.assign(req, 0, 0);
    state.assign(req, 0, 1);

    // Candidates: Day 0 (period 2, 3) vs Day 1 (periods 0, 1, 2, 3)
    const candidates = [
      { day: 0, period: 2 },
      { day: 1, period: 0 }
    ];

    const sorted = scoreCandidateSlots(candidates, req, state, { balanceWorkload: true });
    // Day 1 has 0 lectures, Day 0 has 2 lectures -> Day 1 should be preferred
    expect(sorted[0]!.day).toBe(1);
  });

  it("prefers slots contiguous with existing lectures to minimize gaps", () => {
    const ctx = createMockContext();
    const state = new ScheduleState(ctx);
    const req = ctx.requirements[0]!;

    // Teacher has lecture at Day 1, Period 1
    state.assign(req, 1, 1);

    // Compare Period 2 (adjacent, no gap) vs Period 3 (leaves period 2 as a gap)
    const candidates = [
      { day: 1, period: 3 },
      { day: 1, period: 2 }
    ];

    const sorted = scoreCandidateSlots(candidates, req, state, { minimizeGaps: true });
    expect(sorted[0]!.period).toBe(2);
  });
});
