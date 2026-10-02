import { describe, it, expect } from "vitest";
import { validateInput } from "../../src/validation/input-validator";
import type { TimetableInput } from "../../src/domain/types";

function createValidInput(): TimetableInput {
  return {
    days: [
      { id: 0, name: "Monday" },
      { id: 1, name: "Tuesday" },
      { id: 2, name: "Wednesday" },
      { id: 3, name: "Thursday" },
      { id: 4, name: "Friday" }
    ],
    periodsPerDay: 8,
    classes: [
      { id: "c1", name: "Class 1", lecturesPerDay: 8 },
      { id: "c2", name: "Class 2", lecturesPerDay: 7, allowedPeriods: [0, 1, 2, 3, 4, 5, 6] }
    ],
    teachers: [
      { id: "t1", name: "Teacher 1", workingDays: [0, 1, 2, 3, 4], blockedSlots: [{ day: 0, period: 0 }] },
      { id: "t2", name: "Teacher 2", workingDays: [1, 2, 3] }
    ],
    requirements: [
      { id: "r1", teacherId: "t1", classId: "c1", lecturesPerWeek: 20 },
      { id: "r2", teacherId: "t2", classId: "c1", lecturesPerWeek: 20 }
    ]
  };
}

describe("Input Validator", () => {
  it("validates a well-formed input", () => {
    const input = createValidInput();
    const result = validateInput(input);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("detects duplicate class IDs", () => {
    const input = createValidInput();
    input.classes.push({ id: "c1", name: "Duplicate Class", lecturesPerDay: 8 });
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "DUPLICATE_CLASS_ID")).toBe(true);
  });

  it("detects duplicate teacher IDs", () => {
    const input = createValidInput();
    input.teachers.push({ id: "t1", name: "Duplicate Teacher", workingDays: [0, 1] });
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "DUPLICATE_TEACHER_ID")).toBe(true);
  });

  it("detects duplicate requirement IDs", () => {
    const input = createValidInput();
    input.requirements.push({ id: "r1", teacherId: "t1", classId: "c2", lecturesPerWeek: 5 });
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "DUPLICATE_REQUIREMENT_ID")).toBe(true);
  });

  it("detects missing teacher reference in requirements", () => {
    const input = createValidInput();
    input.requirements.push({ teacherId: "nonexistent", classId: "c1", lecturesPerWeek: 2 });
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "UNKNOWN_TEACHER_REFERENCE")).toBe(true);
  });

  it("detects missing class reference in requirements", () => {
    const input = createValidInput();
    input.requirements.push({ teacherId: "t1", classId: "nonexistent", lecturesPerWeek: 2 });
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "UNKNOWN_CLASS_REFERENCE")).toBe(true);
  });

  it("detects invalid day reference in teacher workingDays", () => {
    const input = createValidInput();
    input.teachers[0]!.workingDays.push(99);
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_WORKING_DAY")).toBe(true);
  });

  it("detects blocked slot outside timetable bounds", () => {
    const input = createValidInput();
    input.teachers[0]!.blockedSlots = [{ day: 0, period: 99 }]; // period > periodsPerDay
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_BLOCKED_SLOT_PERIOD")).toBe(true);
  });

  it("detects negative lecturesPerDay or lecturesPerWeek", () => {
    const input = createValidInput();
    input.classes[0]!.lecturesPerDay = -1;
    input.requirements[0]!.lecturesPerWeek = -5;
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "NEGATIVE_COUNT")).toBe(true);
  });

  it("detects mismatch between class allowedPeriods and lecturesPerDay", () => {
    const input = createValidInput();
    input.classes[0]!.allowedPeriods = [0, 1]; // length 2 but lecturesPerDay is 8
    const result = validateInput(input);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "ALLOWED_PERIODS_MISMATCH")).toBe(true);
  });
});
