import { describe, it, expect } from "vitest";
import { solveTimetable } from "../../src/solver/scheduler";
import type { TimetableInput } from "../../src/domain/types";

describe("CSP Timetable Scheduler Integration", () => {
  it("solves a standard school timetable successfully", () => {
    const input: TimetableInput = {
      days: [
        { id: 0, name: "Monday" },
        { id: 1, name: "Tuesday" },
        { id: 2, name: "Wednesday" },
        { id: 3, name: "Thursday" },
        { id: 4, name: "Friday" }
      ],
      periodsPerDay: 6,
      classes: [
        { id: "c1", name: "Grade 10A", lecturesPerDay: 6 }, // 30 total
        { id: "c2", name: "Grade 10B", lecturesPerDay: 6 }  // 30 total
      ],
      teachers: [
        { id: "t_math", name: "Math Teacher", workingDays: [0, 1, 2, 3, 4] },
        { id: "t_eng", name: "English Teacher", workingDays: [0, 1, 2, 3, 4] },
        { id: "t_sci", name: "Science Teacher", workingDays: [0, 1, 2, 3, 4] }
      ],
      requirements: [
        { teacherId: "t_math", classId: "c1", subjectId: "math", lecturesPerWeek: 10 },
        { teacherId: "t_eng", classId: "c1", subjectId: "english", lecturesPerWeek: 10 },
        { teacherId: "t_sci", classId: "c1", subjectId: "science", lecturesPerWeek: 10 },
        { teacherId: "t_math", classId: "c2", subjectId: "math", lecturesPerWeek: 10 },
        { teacherId: "t_eng", classId: "c2", subjectId: "english", lecturesPerWeek: 10 },
        { teacherId: "t_sci", classId: "c2", subjectId: "science", lecturesPerWeek: 10 }
      ]
    };

    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") return;

    expect(result.lectures).toHaveLength(60);
    expect(result.byClass.get("c1")?.length).toBe(30);
    expect(result.byClass.get("c2")?.length).toBe(30);
    expect(result.byTeacher.get("t_math")?.length).toBe(20);
    expect(result.statistics.iterations).toBeGreaterThan(0);
    expect(result.quality.totalAssigned).toBe(60);
  });

  it("handles classes with unequal lecturesPerDay and restricted allowedPeriods", () => {
    const input: TimetableInput = {
      days: [
        { id: 0, name: "Day 0" },
        { id: 1, name: "Day 1" },
        { id: 2, name: "Day 2" }
      ],
      periodsPerDay: 5,
      classes: [
        { id: "c_full", name: "Full Class", lecturesPerDay: 5 }, // 3 * 5 = 15
        { id: "c_part", name: "Partial Class", lecturesPerDay: 3, allowedPeriods: [0, 1, 2] } // 3 * 3 = 9
      ],
      teachers: [
        { id: "t1", name: "Teacher 1", workingDays: [0, 1, 2] },
        { id: "t2", name: "Teacher 2", workingDays: [0, 1, 2] }
      ],
      requirements: [
        { teacherId: "t1", classId: "c_full", lecturesPerWeek: 8 },
        { teacherId: "t2", classId: "c_full", lecturesPerWeek: 7 },
        { teacherId: "t1", classId: "c_part", lecturesPerWeek: 4 },
        { teacherId: "t2", classId: "c_part", lecturesPerWeek: 5 }
      ]
    };

    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") return;

    expect(result.lectures).toHaveLength(24);
    // Every lecture of c_part must be in period 0, 1, or 2
    for (const lec of result.byClass.get("c_part")!) {
      expect([0, 1, 2]).toContain(lec.period);
    }
  });

  it("respects teacher blocked slots", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }],
      periodsPerDay: 2,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 2 }],
      teachers: [
        {
          id: "t1",
          name: "Teacher 1",
          workingDays: [0, 1],
          blockedSlots: [{ day: 0, period: 0 }]
        }
      ],
      requirements: [
        // 2 days * 2 periods = 4 total, but t1 is blocked at (0,0) -> 3 slots max
        // If requirements need 4, it should be INFEASIBLE
        { teacherId: "t1", classId: "c1", lecturesPerWeek: 4 }
      ]
    };

    const result = solveTimetable(input);
    expect(result.status).toBe("INFEASIBLE");
  });

  it("produces byte-for-byte deterministic results across repeated runs", () => {
    const input: TimetableInput = {
      days: [{ id: 0 }, { id: 1 }, { id: 2 }],
      periodsPerDay: 3,
      classes: [{ id: "c1", name: "C1", lecturesPerDay: 3 }],
      teachers: [
        { id: "t1", name: "Teacher 1", workingDays: [0, 1, 2] },
        { id: "t2", name: "Teacher 2", workingDays: [0, 1, 2] }
      ],
      requirements: [
        { teacherId: "t1", classId: "c1", lecturesPerWeek: 5 },
        { teacherId: "t2", classId: "c1", lecturesPerWeek: 4 }
      ]
    };

    const res1 = solveTimetable(input);
    const res2 = solveTimetable(input);

    expect(res1.status).toBe("SUCCESS");
    expect(res2.status).toBe("SUCCESS");

    if (res1.status === "SUCCESS" && res2.status === "SUCCESS") {
      expect(res1.lectures).toEqual(res2.lectures);
    }
  });
});
