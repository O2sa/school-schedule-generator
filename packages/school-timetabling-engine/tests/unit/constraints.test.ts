import { describe, it, expect } from "vitest";
import {
  TeacherNoCollisionConstraint,
  ClassNoCollisionConstraint,
  TeacherWorkingDaysConstraint,
  TeacherBlockedSlotsConstraint,
  TeacherDailyOverloadConstraint,
  ClassAllowedPeriodsConstraint
} from "../../src/domain/constraints/built-in-constraints";
import type { ReadonlyScheduleState } from "../../src/domain/constraints/constraint.interface";
import type { NormalizedTeacher, NormalizedClass } from "../../src/domain/models";

function createMockState(overrides: Partial<ReadonlyScheduleState> = {}): ReadonlyScheduleState {
  const defaultTeachers = new Map<string, NormalizedTeacher>();
  const defaultClasses = new Map<string, NormalizedClass>();

  return {
    isTeacherAssigned: () => false,
    isClassAssigned: () => false,
    getTeacherDailyLoad: () => 0,
    getClassDailyLoad: () => 0,
    getTeacher: (id: string) => defaultTeachers.get(id),
    getClass: (id: string) => defaultClasses.get(id),
    getRemainingRequirement: () => 0,
    ...overrides
  };
}

describe("Built-in Hard Constraints", () => {
  describe("TeacherNoCollisionConstraint (H1)", () => {
    const constraint = new TeacherNoCollisionConstraint();

    it("allows assignment when teacher is free", () => {
      const state = createMockState({ isTeacherAssigned: () => false });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 1 }, state)).toBe(true);
    });

    it("rejects assignment when teacher is already teaching another class in that slot", () => {
      const state = createMockState({
        isTeacherAssigned: (t, d, p) => t === "t1" && d === 0 && p === 1
      });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c2", day: 0, period: 1 }, state)).toBe(false);
    });
  });

  describe("ClassNoCollisionConstraint (H2)", () => {
    const constraint = new ClassNoCollisionConstraint();

    it("allows assignment when class slot is empty", () => {
      const state = createMockState({ isClassAssigned: () => false });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 1 }, state)).toBe(true);
    });

    it("rejects assignment when class slot already has a teacher", () => {
      const state = createMockState({
        isClassAssigned: (c, d, p) => c === "c1" && d === 0 && p === 1
      });
      expect(constraint.isSatisfied({ teacherId: "t2", classId: "c1", day: 0, period: 1 }, state)).toBe(false);
    });
  });

  describe("TeacherWorkingDaysConstraint (H3)", () => {
    const constraint = new TeacherWorkingDaysConstraint();

    it("allows assignment on teacher working day", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1, 2, 4]),
        blockedSlots: new Set(),
        maxLecturesPerDay: 8
      };
      const state = createMockState({ getTeacher: () => teacher });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 1, period: 0 }, state)).toBe(true);
    });

    it("rejects assignment on teacher non-working day", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1, 3, 4]),
        blockedSlots: new Set(),
        maxLecturesPerDay: 8
      };
      const state = createMockState({ getTeacher: () => teacher });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 2, period: 0 }, state)).toBe(false);
    });
  });

  describe("TeacherBlockedSlotsConstraint (H4)", () => {
    const constraint = new TeacherBlockedSlotsConstraint();

    it("allows assignment on unblocked slot", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1, 2]),
        blockedSlots: new Set(["0,2"]),
        maxLecturesPerDay: 8
      };
      const state = createMockState({ getTeacher: () => teacher });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 1 }, state)).toBe(true);
    });

    it("rejects assignment on blocked slot", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1, 2]),
        blockedSlots: new Set(["0,2"]),
        maxLecturesPerDay: 8
      };
      const state = createMockState({ getTeacher: () => teacher });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 2 }, state)).toBe(false);
    });
  });

  describe("TeacherDailyOverloadConstraint (H8)", () => {
    const constraint = new TeacherDailyOverloadConstraint();

    it("allows assignment when daily load is below maximum", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1]),
        blockedSlots: new Set(),
        maxLecturesPerDay: 4
      };
      const state = createMockState({
        getTeacher: () => teacher,
        getTeacherDailyLoad: () => 3
      });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 4 }, state)).toBe(true);
    });

    it("rejects assignment when daily load is already at maximum", () => {
      const teacher: NormalizedTeacher = {
        id: "t1",
        name: "Teacher 1",
        workingDays: new Set([0, 1]),
        blockedSlots: new Set(),
        maxLecturesPerDay: 4
      };
      const state = createMockState({
        getTeacher: () => teacher,
        getTeacherDailyLoad: () => 4
      });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 4 }, state)).toBe(false);
    });
  });

  describe("ClassAllowedPeriodsConstraint (H7)", () => {
    const constraint = new ClassAllowedPeriodsConstraint();

    it("allows assignment when period is in class allowedPeriods", () => {
      const schoolClass: NormalizedClass = {
        id: "c1",
        name: "Class 1",
        lecturesPerDay: 6,
        allowedPeriods: new Set([0, 1, 2, 3, 4, 5])
      };
      const state = createMockState({ getClass: () => schoolClass });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 5 }, state)).toBe(true);
    });

    it("rejects assignment when period is outside class allowedPeriods", () => {
      const schoolClass: NormalizedClass = {
        id: "c1",
        name: "Class 1",
        lecturesPerDay: 6,
        allowedPeriods: new Set([0, 1, 2, 3, 4, 5])
      };
      const state = createMockState({ getClass: () => schoolClass });
      expect(constraint.isSatisfied({ teacherId: "t1", classId: "c1", day: 0, period: 6 }, state)).toBe(false);
    });
  });
});
