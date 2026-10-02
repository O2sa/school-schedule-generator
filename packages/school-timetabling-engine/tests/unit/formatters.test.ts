import { describe, it, expect } from "vitest";
import { formatTimetableByClass, formatTimetableByTeacher } from "../../src/formatters/timetable-formatter";
import { solveTimetable } from "../../src/solver/scheduler";
import type { TimetableInput } from "../../src/domain/types";

describe("Timetable Formatters", () => {
  const input: TimetableInput = {
    days: [
      { id: 0, name: "Monday" },
      { id: 1, name: "Tuesday" }
    ],
    periodsPerDay: 2,
    classes: [
      { id: "c1", name: "Grade 10A", lecturesPerDay: 2 }
    ],
    teachers: [
      { id: "t1", name: "Alice Smith", workingDays: [0, 1] },
      { id: "t2", name: "Bob Jones", workingDays: [0, 1] }
    ],
    requirements: [
      { teacherId: "t1", classId: "c1", subjectName: "Math", lecturesPerWeek: 2 },
      { teacherId: "t2", classId: "c1", subjectName: "English", lecturesPerWeek: 2 }
    ]
  };

  it("formats timetable grid for classes", () => {
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") return;

    const formatted = formatTimetableByClass(result, input);
    expect(formatted).toContain("Grade 10A");
    expect(formatted).toContain("Monday");
    expect(formatted).toContain("Tuesday");
    expect(formatted).toContain("Period 0");
    expect(formatted).toContain("Period 1");
  });

  it("formats timetable grid for teachers", () => {
    const result = solveTimetable(input);
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") return;

    const formatted = formatTimetableByTeacher(result, input);
    expect(formatted).toContain("Alice Smith");
    expect(formatted).toContain("Bob Jones");
    expect(formatted).toContain("Monday");
    expect(formatted).toContain("Grade 10A");
  });
});
