import { solveTimetable } from 'school-timetabling-engine';
import { buildTimetableInput, mapSolverResultToSavedSchedule } from './solver-adapter';
import type {
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SolverOptions,
} from '../types';

export interface WorkerStartPayload {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
  options?: SolverOptions;
}

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  if (type === 'START_SOLVE') {
    try {
      const data = payload as WorkerStartPayload;
      const input = buildTimetableInput(data);
      const startTime = performance.now();

      const result = solveTimetable(input);
      const elapsedMs = Math.round(performance.now() - startTime);

      if (result.status === 'SUCCESS') {
        const saved = mapSolverResultToSavedSchedule(result, data);
        saved.solveTimeMs = elapsedMs;
        self.postMessage({ type: 'SUCCESS', payload: saved });
      } else if (result.status === 'INFEASIBLE') {
        self.postMessage({
          type: 'INFEASIBLE',
          payload: {
            diagnostics: result.diagnostics,
            statistics: result.statistics,
          },
        });
      } else {
        self.postMessage({
          type: 'TIMEOUT',
          payload: {
            statistics: result.statistics,
          },
        });
      }
    } catch (err: unknown) {
      self.postMessage({
        type: 'ERROR',
        payload: err instanceof Error ? err.message : String(err),
      });
    }
  }
};
