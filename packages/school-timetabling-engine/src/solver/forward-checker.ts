import type { NormalizedRequirement } from "../domain/models";
import type { ScheduleState } from "../state/schedule-state";

/**
 * Forward checking: evaluates whether active requirements that share the assigned
 * teacher or class still have enough valid candidate slots to be fulfilled.
 */
export function checkForwardLookahead(
  state: ScheduleState,
  assignedReq: NormalizedRequirement,
  requirements: NormalizedRequirement[]
): boolean {
  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i]!;
    const remaining = state.getRemaining(req.id);
    if (remaining <= 0) continue;

    // Only inspect affected requirements (sharing teacher or class)
    if (req.teacherId === assignedReq.teacherId || req.classId === assignedReq.classId) {
      const candidates = state.getCandidateSlots(req);
      if (candidates.length < remaining) {
        return false; // Prune branch immediately
      }
    }
  }

  return true;
}
