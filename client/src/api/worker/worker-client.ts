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
  const runInline = (
    resolve: (res: SavedScheduleRecord) => void,
    reject: (err: unknown) => void
  ) => {
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
        reject(new Error('انتهت مهلة البحث دون العثور على حل متكامل'));
      }
    } catch (err) {
      reject(err);
    }
  };

  return new Promise((resolve, reject) => {
    // If running in browser environment with Web Worker support:
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        cancelActiveSolver();
        const worker = new Worker(
          new URL('./solver.worker.ts', import.meta.url),
          {
            type: 'module',
          }
        );
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
            const timeSec = Math.round((resPayload?.statistics?.executionTimeMs || 0) / 1000);
            const bt = resPayload?.statistics?.backtracks?.toLocaleString() || 0;
            const it = resPayload?.statistics?.iterations?.toLocaleString() || 0;
            const err = new Error(`انتهت مهلة البحث (${timeSec} ثانية) بعد ${bt} تراجع و ${it} محاولة دون حل كامل`);
            (err as any).statistics = resPayload?.statistics;
            (err as any).diagnostics = resPayload?.diagnostics;
            reject(err);
          } else if (type === 'PROGRESS') {
            onProgress?.(resPayload);
          } else if (type === 'ERROR') {
            activeWorker = null;
            reject(new Error(resPayload));
          }
        };

        worker.onerror = (err) => {
          activeWorker = null;
          console.warn('[runSolver] Worker execution failed, falling back to inline solver:', err);
          runInline(resolve, reject);
        };

        worker.postMessage({ type: 'START_SOLVE', payload });
        return;
      } catch (err) {
        console.warn('[runSolver] Worker creation failed, falling back to inline solver:', err);
      }
    }

    // Direct synchronous / microtask fallback (e.g. in Node/Vitest test runner or when worker is unsupported)
    runInline(resolve, reject);
  });
}
