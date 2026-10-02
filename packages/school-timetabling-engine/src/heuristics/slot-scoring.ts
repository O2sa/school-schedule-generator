import type { NormalizedRequirement, TimetableSlot } from "../domain/models";
import type { SolverOptions } from "../domain/types";
import type { ScheduleState } from "../state/schedule-state";

export function scoreCandidateSlots(
  slots: TimetableSlot[],
  req: NormalizedRequirement,
  state: ScheduleState,
  options?: SolverOptions
): TimetableSlot[] {
  if (slots.length <= 1) return [...slots];

  const teacher = state.context.teachers.get(req.teacherId);
  const maxDaily = teacher?.maxLecturesPerDay ?? state.context.periodsPerDay;
  const balanceWorkload = options?.balanceWorkload ?? true;
  const minimizeGaps = options?.minimizeGaps ?? true;

  const scored = slots.map(slot => {
    let score = 0;

    // 1. Workload balancing: penalize placing lectures on already loaded days for this teacher
    if (balanceWorkload) {
      const currentLoad = state.getTeacherDailyLoad(req.teacherId, slot.day);
      score -= (currentLoad / Math.max(1, maxDaily)) * 100;
    }

    // 2. Continuity & Gap Reduction
    if (minimizeGaps) {
      const hasAdjacentBefore = slot.period > 0 && state.isTeacherAssigned(req.teacherId, slot.day, slot.period - 1);
      const hasAdjacentAfter = slot.period < state.context.periodsPerDay - 1 && state.isTeacherAssigned(req.teacherId, slot.day, slot.period + 1);

      if (hasAdjacentBefore || hasAdjacentAfter) {
        score += 50; // Continuity bonus
      } else {
        // Check if there is an isolated gap (e.g. lecture at period - 2 but period - 1 empty)
        const gapBefore = slot.period >= 2 &&
          state.isTeacherAssigned(req.teacherId, slot.day, slot.period - 2) &&
          !state.isTeacherAssigned(req.teacherId, slot.day, slot.period - 1);
        const gapAfter = slot.period <= state.context.periodsPerDay - 3 &&
          state.isTeacherAssigned(req.teacherId, slot.day, slot.period + 2) &&
          !state.isTeacherAssigned(req.teacherId, slot.day, slot.period + 1);

        if (gapBefore || gapAfter) {
          score -= 40; // Gap penalty
        }
      }
    }

    // 3. Subject / Class Distribution across days
    const schoolClass = state.context.classes.get(req.classId);
    if (schoolClass) {
      let alreadyHasSubjectOnDay = false;
      for (const p of schoolClass.allowedPeriods) {
        const lecture = state.getLectureAt(req.classId, slot.day, p);
        if (lecture && (lecture.requirementId === req.id || (req.subjectId && lecture.subjectId === req.subjectId))) {
          alreadyHasSubjectOnDay = true;
          break;
        }
      }
      if (!alreadyHasSubjectOnDay) {
        score += 30; // Encourage spreading subject to new days
      }
    }

    return { slot, score };
  });

  // Sort descending by score, deterministic tie-breaking by day then period
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.slot.day !== b.slot.day) return a.slot.day - b.slot.day;
    return a.slot.period - b.slot.period;
  });

  return scored.map(s => s.slot);
}
