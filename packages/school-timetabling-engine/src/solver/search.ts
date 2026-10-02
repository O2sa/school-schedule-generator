import type { NormalizedRequirement } from "../domain/models";
import type { SolverOptions, SolverStatistics } from "../domain/types";
import type { ScheduleState } from "../state/schedule-state";
import { selectNextRequirement } from "../heuristics/mrv";
import { scoreCandidateSlots } from "../heuristics/slot-scoring";
import { checkForwardLookahead } from "./forward-checker";

export type SearchOutcome =
  | { status: "SUCCESS" }
  | { status: "TIMEOUT" }
  | { status: "DEAD_END" };

export function executeBacktrackingSearch(
  state: ScheduleState,
  requirements: NormalizedRequirement[],
  options: SolverOptions | undefined,
  stats: SolverStatistics,
  startTime: number,
  currentDepth = 0
): SearchOutcome {
  stats.iterations++;
  if (currentDepth > stats.maxSearchDepth) {
    stats.maxSearchDepth = currentDepth;
  }

  const timeoutMs = options?.timeoutMs ?? 10_000;
  const maxIterations = options?.maxIterations ?? 500_000;
  const maxBacktracks = options?.maxBacktracks ?? 100_000;
  const enableForwardChecking = options?.enableForwardChecking !== false;

  // Search limits check
  if (Date.now() - startTime >= timeoutMs) {
    return { status: "TIMEOUT" };
  }
  if (stats.iterations > maxIterations) {
    return { status: "TIMEOUT" };
  }
  if (stats.backtracks > maxBacktracks) {
    return { status: "TIMEOUT" };
  }

  // Termination condition: all required lectures scheduled
  if (state.isComplete()) {
    return { status: "SUCCESS" };
  }

  // Minimum Remaining Values variable selection
  const { requirement, candidateSlots, isDeadEnd } = selectNextRequirement(state, requirements);
  if (isDeadEnd || !requirement || candidateSlots.length === 0) {
    return { status: "DEAD_END" };
  }

  // Heuristic value ordering
  const orderedSlots = scoreCandidateSlots(candidateSlots, requirement, state, options);

  for (let i = 0; i < orderedSlots.length; i++) {
    const slot = orderedSlots[i]!;

    // Forward check before or right after assignment
    state.assign(requirement, slot.day, slot.period);

    if (enableForwardChecking) {
      const isViable = checkForwardLookahead(state, requirement, requirements);
      if (!isViable) {
        stats.forwardCheckingPrunes++;
        state.undo();
        stats.backtracks++;
        continue;
      }
    }

    const outcome = executeBacktrackingSearch(
      state,
      requirements,
      options,
      stats,
      startTime,
      currentDepth + 1
    );

    if (outcome.status === "SUCCESS" || outcome.status === "TIMEOUT") {
      return outcome;
    }

    // Dead end reached: backtrack
    state.undo();
    stats.backtracks++;
  }

  return { status: "DEAD_END" };
}
