import type {
  NormalizedTimetableContext,
  NormalizedRequirement,
  TimetableSlot
} from "../domain/models";
import type { ScheduledLecture } from "../domain/types";
import type { HardConstraint, ReadonlyScheduleState } from "../domain/constraints/constraint.interface";
import { defaultHardConstraints } from "../domain/constraints/built-in-constraints";
import { StateReadonlyAdapter } from "./readonly-state";

interface AssignmentStep {
  requirement: NormalizedRequirement;
  day: number;
  period: number;
  lecture: ScheduledLecture;
}

export class ScheduleState {
  readonly context: NormalizedTimetableContext;
  private readonly constraints: HardConstraint[];
  private readonly readonlyAdapter: ReadonlyScheduleState;

  // Direct occupancy grids: [dayIndex][period]
  private readonly teacherGrid = new Map<string, (ScheduledLecture | null)[][]>();
  private readonly classGrid = new Map<string, (ScheduledLecture | null)[][]>();

  // Daily counters: [dayIndex]
  private readonly teacherDailyLoad = new Map<string, Int32Array>();
  private readonly classDailyLoad = new Map<string, Int32Array>();

  // Requirement remaining counters
  private readonly remainingReqCount = new Map<string, number>();
  private totalUnscheduled = 0;

  // Transaction undo stack
  private readonly undoJournal: AssignmentStep[] = [];

  constructor(context: NormalizedTimetableContext, customConstraints?: HardConstraint[]) {
    this.context = context;
    this.constraints = customConstraints && customConstraints.length > 0
      ? [...defaultHardConstraints, ...customConstraints]
      : defaultHardConstraints;
    this.readonlyAdapter = new StateReadonlyAdapter(this);

    const numDays = context.days.length;
    const numPeriods = context.periodsPerDay;

    // Initialize teacher structures
    for (const [teacherId] of context.teachers) {
      const grid: (ScheduledLecture | null)[][] = [];
      for (let d = 0; d < numDays; d++) {
        grid.push(new Array<ScheduledLecture | null>(numPeriods).fill(null));
      }
      this.teacherGrid.set(teacherId, grid);
      this.teacherDailyLoad.set(teacherId, new Int32Array(numDays));
    }

    // Initialize class structures
    for (const [classId] of context.classes) {
      const grid: (ScheduledLecture | null)[][] = [];
      for (let d = 0; d < numDays; d++) {
        grid.push(new Array<ScheduledLecture | null>(numPeriods).fill(null));
      }
      this.classGrid.set(classId, grid);
      this.classDailyLoad.set(classId, new Int32Array(numDays));
    }

    // Initialize requirement counts
    for (const req of context.requirements) {
      this.remainingReqCount.set(req.id, req.lecturesPerWeek);
      this.totalUnscheduled += req.lecturesPerWeek;
    }
  }

  asReadonly(): ReadonlyScheduleState {
    return this.readonlyAdapter;
  }

  isTeacherAssigned(teacherId: string, day: number, period: number): boolean {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return false;
    const grid = this.teacherGrid.get(teacherId);
    return grid?.[dayIdx]?.[period] !== null && grid?.[dayIdx]?.[period] !== undefined;
  }

  isClassAssigned(classId: string, day: number, period: number): boolean {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return false;
    const grid = this.classGrid.get(classId);
    return grid?.[dayIdx]?.[period] !== null && grid?.[dayIdx]?.[period] !== undefined;
  }

  getTeacherDailyLoad(teacherId: string, day: number): number {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return 0;
    return this.teacherDailyLoad.get(teacherId)?.[dayIdx] ?? 0;
  }

  getClassDailyLoad(classId: string, day: number): number {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return 0;
    return this.classDailyLoad.get(classId)?.[dayIdx] ?? 0;
  }

  getRemaining(requirementId: string): number {
    return this.remainingReqCount.get(requirementId) ?? 0;
  }

  getTotalUnscheduled(): number {
    return this.totalUnscheduled;
  }

  isComplete(): boolean {
    return this.totalUnscheduled === 0;
  }

  canAssign(req: NormalizedRequirement, day: number, period: number): boolean {
    const candidate = {
      teacherId: req.teacherId,
      classId: req.classId,
      subjectId: req.subjectId,
      day,
      period
    };

    for (let i = 0; i < this.constraints.length; i++) {
      if (!this.constraints[i]!.isSatisfied(candidate, this.readonlyAdapter)) {
        return false;
      }
    }
    return true;
  }

  getCandidateSlots(req: NormalizedRequirement): TimetableSlot[] {
    const schoolClass = this.context.classes.get(req.classId);
    const teacher = this.context.teachers.get(req.teacherId);
    if (!schoolClass || !teacher) return [];

    const candidates: TimetableSlot[] = [];

    for (const dayObj of this.context.days) {
      const day = dayObj.id;
      // Fast pre-filter: check teacher working days
      if (!teacher.workingDays.has(day)) continue;

      // Fast pre-filter: check teacher daily overload
      const currentTeacherLoad = this.getTeacherDailyLoad(teacher.id, day);
      if (currentTeacherLoad >= teacher.maxLecturesPerDay) continue;

      for (const period of schoolClass.allowedPeriods) {
        // Fast pre-filter: check teacher blocked slot
        if (teacher.blockedSlots.has(`${day},${period}`)) continue;

        // Check full constraint satisfaction
        if (this.canAssign(req, day, period)) {
          candidates.push({ day, period });
        }
      }
    }

    return candidates;
  }

  assign(req: NormalizedRequirement, day: number, period: number): ScheduledLecture {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) {
      throw new Error(`Invalid day ID: ${day}`);
    }

    const lecture: ScheduledLecture = {
      day,
      period,
      classId: req.classId,
      teacherId: req.teacherId,
      requirementId: req.id,
      ...(req.subjectId ? { subjectId: req.subjectId } : {}),
      ...(req.subjectName ? { subjectName: req.subjectName } : {})
    };

    const tGrid = this.teacherGrid.get(req.teacherId);
    const cGrid = this.classGrid.get(req.classId);
    const tDay = tGrid?.[dayIdx];
    const cDay = cGrid?.[dayIdx];
    if (tDay) tDay[period] = lecture;
    if (cDay) cDay[period] = lecture;

    const tLoad = this.teacherDailyLoad.get(req.teacherId);
    if (tLoad && tLoad[dayIdx] !== undefined) tLoad[dayIdx]++;
    const cLoad = this.classDailyLoad.get(req.classId);
    if (cLoad && cLoad[dayIdx] !== undefined) cLoad[dayIdx]++;

    this.remainingReqCount.set(req.id, (this.remainingReqCount.get(req.id) ?? 0) - 1);
    this.totalUnscheduled--;

    this.undoJournal.push({ requirement: req, day, period, lecture });
    return lecture;
  }

  undo(): void {
    const step = this.undoJournal.pop();
    if (!step) return;

    const { requirement, day, period } = step;
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return;

    const tGrid = this.teacherGrid.get(requirement.teacherId);
    const cGrid = this.classGrid.get(requirement.classId);
    const tDay = tGrid?.[dayIdx];
    const cDay = cGrid?.[dayIdx];
    if (tDay) tDay[period] = null;
    if (cDay) cDay[period] = null;

    const tLoad = this.teacherDailyLoad.get(requirement.teacherId);
    if (tLoad && tLoad[dayIdx] !== undefined) tLoad[dayIdx]--;
    const cLoad = this.classDailyLoad.get(requirement.classId);
    if (cLoad && cLoad[dayIdx] !== undefined) cLoad[dayIdx]--;

    this.remainingReqCount.set(requirement.id, (this.remainingReqCount.get(requirement.id) ?? 0) + 1);
    this.totalUnscheduled++;
  }

  getAllScheduledLectures(): ScheduledLecture[] {
    const lectures: ScheduledLecture[] = [];
    for (const step of this.undoJournal) {
      lectures.push(step.lecture);
    }
    return lectures;
  }

  getLectureAt(classId: string, day: number, period: number): ScheduledLecture | null {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return null;
    return this.classGrid.get(classId)?.[dayIdx]?.[period] ?? null;
  }

  getTeacherLectureAt(teacherId: string, day: number, period: number): ScheduledLecture | null {
    const dayIdx = this.context.dayIndexMap.get(day);
    if (dayIdx === undefined) return null;
    return this.teacherGrid.get(teacherId)?.[dayIdx]?.[period] ?? null;
  }
}
