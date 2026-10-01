import type {
  SchoolConfigRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  CurriculumRequirementRecord,
  SavedScheduleRecord,
  SolverOptions,
  SolverProgress,
} from '../types';
import { solveTimetable } from 'school-timetabling-engine';
import { buildTimetableInput, mapSolverResultToSavedSchedule } from './solver-adapter';

export interface SolverClientPayload {
  config: SchoolConfigRecord;
  teachers: TeacherRecord[];
  classes: ClassRecord[];
  subjects: SubjectRecord[];
  curriculum: CurriculumRequirementRecord[];
  options?: SolverOptions;
}

let activeWorker: Worker | null = null;

export function cancelActiveSolver(): void {
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
}

export function runSolver(
  payload: SolverClientPayload,
  onProgress?: (progress: SolverProgress) => void
): Promise<SavedScheduleRecord> {
  return new Promise((resolve, reject) => {
    // If running in browser environment with Web Worker support:
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        cancelActiveSolver();
        const worker = new Worker(new URL('./solver.worker.ts', import.meta.url), {
          type: 'module',
        });
        activeWorker = worker;

        worker.onmessage = (e: MessageEvent) => {
          const { type, payload: resPayload } = e.data;
          if (type === 'SUCCESS') {
            activeWorker = null;
            resolve(resPayload);
          } else if (type === 'INFEASIBLE') {
            activeWorker = null;
            const err = new Error('الجدول غير قابل للحل بالقيود الحالية');
            (err as unknown as { diagnostics: unknown }).diagnostics = resPayload.diagnostics;
            reject(err);
          } else if (type === 'TIMEOUT') {
            activeWorker = null;
            reject(new Error('انتهى الوقت المحدد دون العثور على حل متكامل'));
          } else if (type === 'PROGRESS') {
            onProgress?.(resPayload);
          } else if (type === 'ERROR') {
            activeWorker = null;
            reject(new Error(resPayload));
          }
        };

        worker.onerror = (err) => {
          activeWorker = null;
          reject(err);
        };

        worker.postMessage({ type: 'START_SOLVE', payload });
        return;
      } catch {
        // Fallback to inline if worker creation fails
      }
    }

    // Direct synchronous / microtask fallback (e.g. in Node/Vitest test runner)
    try {
      const input = buildTimetableInput(payload);
      const result = solveTimetable(input);

      if (result.status === 'SUCCESS') {
        const saved = mapSolverResultToSavedSchedule(result, payload);
        resolve(saved);
      } else if (result.status === 'INFEASIBLE') {
        const err = new Error('الجدول غير قابل للحل بالقيود الحالية');
        (err as unknown as { diagnostics: unknown }).diagnostics = result.diagnostics;
        reject(err);
      } else {
        reject(new Error('انتهى الوقت المحدد دون العثور على حل متكامل'));
      }
    } catch (err) {
      reject(err);
    }
  });
}
