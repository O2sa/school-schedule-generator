import type { NormalizedRequirement, TimetableSlot } from "../domain/models";
import type { ScheduleState } from "../state/schedule-state";

export interface MRVSelection {
  requirement: NormalizedRequirement | null;
  candidateSlots: TimetableSlot[];
  isDeadEnd: boolean;
}

export function selectNextRequirement(
  state: ScheduleState,
  requirements: NormalizedRequirement[]
): MRVSelection {
  let selectedReq: NormalizedRequirement | null = null;
  let selectedCandidates: TimetableSlot[] = [];
  let minCandidatesCount = Infinity;

  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i]!;
    const remaining = state.getRemaining(req.id);
    if (remaining <= 0) continue;

    const candidates = state.getCandidateSlots(req);

    // Forward pruning / dead end: not enough available slots to satisfy remaining requirement
    if (candidates.length < remaining) {
      return {
        requirement: req,
        candidateSlots: candidates,
        isDeadEnd: true
      };
    }

    // Minimum Remaining Values comparison
    if (candidates.length < minCandidatesCount) {
      minCandidatesCount = candidates.length;
      selectedReq = req;
      selectedCandidates = candidates;
    } else if (candidates.length === minCandidatesCount && selectedReq !== null) {
      // Deterministic tie-breaking:
      // 1. More remaining lectures first
      const selectedRemaining = state.getRemaining(selectedReq.id);
      if (remaining > selectedRemaining) {
        selectedReq = req;
        selectedCandidates = candidates;
      } else if (remaining === selectedRemaining) {
        // 2. Teacher with fewer working days first
        const tNew = state.context.teachers.get(req.teacherId);
        const tCurr = state.context.teachers.get(selectedReq.teacherId);
        const daysNew = tNew?.workingDays.size ?? 0;
        const daysCurr = tCurr?.workingDays.size ?? 0;

        if (daysNew < daysCurr) {
          selectedReq = req;
          selectedCandidates = candidates;
        } else if (daysNew === daysCurr) {
          // 3. Stable requirement ID
          if (req.id.localeCompare(selectedReq.id) < 0) {
            selectedReq = req;
            selectedCandidates = candidates;
          }
        }
      }
    }
  }

  return {
    requirement: selectedReq,
    candidateSlots: selectedCandidates,
    isDeadEnd: false
  };
}
