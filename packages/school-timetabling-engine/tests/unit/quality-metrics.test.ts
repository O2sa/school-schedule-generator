import { describe, it, expect } from "vitest";
import { calculateQualityMetrics } from "../../src/heuristics/quality-metrics";
import type { ScheduledLecture, SchoolDay } from "../../src/domain/types";
import type { NormalizedTeacher } from "../../src/domain/models";

describe("Quality Metrics Calculation", () => {
  const days: SchoolDay[] = [
    { id: 0, name: "Day 0" },
    { id: 1, name: "Day 1" }
  ];

  const teachers = new Map<string, NormalizedTeacher>([
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

  it("calculates 0 gaps for contiguous lectures", () => {
    const lectures: ScheduledLecture[] = [
      { day: 0, period: 0, classId: "c1", teacherId: "t1", requirementId: "r1" },
      { day: 0, period: 1, classId: "c1", teacherId: "t1", requirementId: "r1" }
    ];

    const metrics = calculateQualityMetrics(lectures, teachers, days, 4);
    expect(metrics.teacherGapCount).toBe(0);
    expect(metrics.totalAssigned).toBe(2);
  });

  it("detects an isolated empty period as a gap", () => {
    const lectures: ScheduledLecture[] = [
      { day: 0, period: 0, classId: "c1", teacherId: "t1", requirementId: "r1" },
      // period 1 is empty!
      { day: 0, period: 2, classId: "c1", teacherId: "t1", requirementId: "r1" }
    ];

    const metrics = calculateQualityMetrics(lectures, teachers, days, 4);
    expect(metrics.teacherGapCount).toBe(1);
  });

  it("computes daily load variance across working days", () => {
    // 2 lectures on Day 0, 0 lectures on Day 1: mean = 1, variance = ((2-1)^2 + (0-1)^2)/2 = 1.0
    const lectures: ScheduledLecture[] = [
      { day: 0, period: 0, classId: "c1", teacherId: "t1", requirementId: "r1" },
      { day: 0, period: 1, classId: "c1", teacherId: "t1", requirementId: "r1" }
    ];

    const metrics = calculateQualityMetrics(lectures, teachers, days, 4);
    expect(metrics.teacherDailyLoadVariance).toBe(1);
  });
});
