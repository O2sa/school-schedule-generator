import { describe, it, expect } from "vitest";
import { solveTimetable } from "../../src/solver/scheduler";
import type { TimetableInput } from "../../src/domain/types";

describe("Edge Cases (E1 - E14)", () => {
  it("E1: handles zero classes with empty schedule", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }],
      periodsPerDay: 4,
      classes: [],
      teachers: [{ id: "t1", name: "T1", workingDays: [0, 1] }],
      requirements: []
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status === "SUCCESS") {
      expect(result.lectures).toHaveLength(0);
    }
  });

  it("E2: handles zero teachers when classes require lectures", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }],
      teachers: [],
      requirements: []
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("INFEASIBLE");
  });

  it("E3: handles class with lecturesPerDay = 0", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 0, allowedPeriods: [] }],
      teachers: [{ id: "t1", name: "T1", workingDays: [0] }],
      requirements: []
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status === "SUCCESS") {
      expect(result.lectures).toHaveLength(0);
    }
  });

  it("E4: teacher with zero working days is valid if requirement is 0", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }],
      periodsPerDay: 1,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 1 }],
      teachers: [
        { id: "t_inactive", name: "T Inactive", workingDays: [] },
        { id: "t_active", name: "T Active", workingDays: [0] }
      ],
      requirements: [
        { teacherId: "t_active", classId: "c1", lecturesPerWeek: 1 }
      ]
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
  });

  it("E5: teacher with all slots blocked fails if requiring lectures", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }],
      teachers: [
        {
          id: "t1",
          name: "Blocked Teacher",
          workingDays: [0],
          blockedSlots: [{ day: 0, period: 0 }, { day: 0, period: 1 }]
        }
      ],
      requirements: [{ teacherId: "t1", classId: "c1", lecturesPerWeek: 2 }]
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("INFEASIBLE");
  });

  it("E6: teacher works fewer days than school", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }], // 10 lectures
      teachers: [
        { id: "t_part_time", name: "Part Time", workingDays: [0, 1] }, // works only 2 days
        { id: "t_full_time", name: "Full Time", workingDays: [0, 1, 2, 3, 4] }
      ],
      requirements: [
        { teacherId: "t_part_time", classId: "c1", lecturesPerWeek: 4 }, // 2 periods/day * 2 days
        { teacherId: "t_full_time", classId: "c1", lecturesPerWeek: 6 }
      ]
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status === "SUCCESS") {
      // Ensure t_part_time is ONLY scheduled on Day 0 and Day 1
      const ptLectures = result.byTeacher.get("t_part_time")!;
      expect(ptLectures).toHaveLength(4);
      for (const lec of ptLectures) {
        expect([0, 1]).toContain(lec.day);
      }
    }
  });

  it("E10: class has more teachers than daily periods", () => {
    // 5 days, 2 periods/day = 10 total lectures.
    // 4 teachers, each teaching 2 or 3 lectures a week.
    // Since periodsPerDay = 2, all 4 teachers cannot appear on the same day,
    // but they can easily be scheduled across the 5 days.
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }],
      teachers: [
        { id: "t1", name: "T1", workingDays: [0, 1, 2, 3, 4] },
        { id: "t2", name: "T2", workingDays: [0, 1, 2, 3, 4] },
        { id: "t3", name: "T3", workingDays: [0, 1, 2, 3, 4] },
        { id: "t4", name: "T4", workingDays: [0, 1, 2, 3, 4] }
      ],
      requirements: [
        { teacherId: "t1", classId: "c1", lecturesPerWeek: 3 },
        { teacherId: "t2", classId: "c1", lecturesPerWeek: 3 },
        { teacherId: "t3", classId: "c1", lecturesPerWeek: 2 },
        { teacherId: "t4", classId: "c1", lecturesPerWeek: 2 }
      ]
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status === "SUCCESS") {
      expect(result.lectures).toHaveLength(10);
    }
  });

  it("E12: timeout limits are enforced cleanly", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }],
      teachers: [{ id: "t1", name: "T1", workingDays: [0, 1] }],
      requirements: [{ teacherId: "t1", classId: "c1", lecturesPerWeek: 4 }],
      options: {
        timeoutMs: 0 // Immediate timeout
      }
    };
    const result = solveTimetable(input);
    expect(result.status).toBe("TIMEOUT");
  });
});
