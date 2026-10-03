import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  validateMoveOrSwap,
  computeValidSlotsForLecture,
  applyMoveOrSwap,
  type TimetableInput,
  type TimetableAssignment,
  type MoveRequest,
  type MoveValidationResult,
} from 'school-timetabling-engine';

export interface SelectedSlotInfo {
  dayIndex: number;
  periodIndex: number;
  assignment: TimetableAssignment;
}

export interface UseTimetableEditorProps {
  input: TimetableInput | null;
  initialAssignments: TimetableAssignment[];
  onSave?: (updated: TimetableAssignment[]) => Promise<void>;
  onConflict?: (validation: MoveValidationResult) => void;
}

export interface UseTimetableEditorReturn {
  isEditing: boolean;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  changeCount: number;
  draftAssignments: TimetableAssignment[];
  selectedSlot: SelectedSlotInfo | null;
  validTargets: Set<string>;
  lastConflict: MoveValidationResult | null;

  toggleEditMode: () => void;
  selectSlot: (dayIndex: number, periodIndex: number, assignment: TimetableAssignment) => void;
  clearSelection: () => void;
  executeMoveOrSwap: (targetDay: number, targetPeriod: number) => boolean;
  undo: () => void;
  redo: () => void;
  discardChanges: () => void;
  saveChanges: () => Promise<void>;
}

export function useTimetableEditor({
  input,
  initialAssignments,
  onSave,
  onConflict,
}: UseTimetableEditorProps): UseTimetableEditorReturn {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftAssignments, setDraftAssignments] = useState<TimetableAssignment[]>(initialAssignments);
  const [history, setHistory] = useState<TimetableAssignment[][]>([]);
  const [future, setFuture] = useState<TimetableAssignment[][]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);
  const [lastConflict, setLastConflict] = useState<MoveValidationResult | null>(null);

  // Sync with initialAssignments if not currently editing
  useEffect(() => {
    if (!isEditing) {
      setDraftAssignments(initialAssignments);
      setHistory([]);
      setFuture([]);
      setSelectedSlot(null);
      setLastConflict(null);
    }
  }, [initialAssignments, isEditing]);

  const hasChanges = history.length > 0;
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const changeCount = history.length;

  // Compute valid targets whenever a slot is selected
  const validTargets = useMemo<Set<string>>(() => {
    if (!isEditing || !selectedSlot || !input) {
      return new Set();
    }
    const slots = computeValidSlotsForLecture(
      input,
      draftAssignments,
      selectedSlot.assignment.lectureId
    );
    return new Set(slots.map((s) => `${s.day}__${s.period}`));
  }, [isEditing, selectedSlot, input, draftAssignments]);

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => {
      const next = !prev;
      if (!next) {
        // Discard edits when toggled off
        setDraftAssignments(initialAssignments);
        setHistory([]);
        setFuture([]);
        setSelectedSlot(null);
        setLastConflict(null);
      }
      return next;
    });
  }, [initialAssignments]);

  const selectSlot = useCallback(
    (dayIndex: number, periodIndex: number, assignment: TimetableAssignment) => {
      if (!isEditing) return;
      setSelectedSlot({ dayIndex, periodIndex, assignment });
      setLastConflict(null);
    },
    [isEditing]
  );

  const clearSelection = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const executeMoveOrSwap = useCallback(
    (targetDay: number, targetPeriod: number): boolean => {
      if (!isEditing || !selectedSlot || !input) {
        return false;
      }

      const request: MoveRequest = {
        source: {
          lectureId: selectedSlot.assignment.lectureId,
          classId: selectedSlot.assignment.classId,
          teacherId: selectedSlot.assignment.teacherId,
          subjectId: selectedSlot.assignment.subjectId,
          day: selectedSlot.dayIndex,
          period: selectedSlot.periodIndex,
        },
        target: {
          day: targetDay,
          period: targetPeriod,
        },
      };

      const validation = validateMoveOrSwap(input, draftAssignments, request);

      if (!validation.valid) {
        setLastConflict(validation);
        onConflict?.(validation);
        return false;
      }

      // Valid move or swap
      setHistory((prev) => [...prev, draftAssignments]);
      setFuture([]); // clear redo stack

      const nextAssignments = applyMoveOrSwap(draftAssignments, request);
      setDraftAssignments(nextAssignments);
      setSelectedSlot(null);
      setLastConflict(null);
      return true;
    },
    [isEditing, selectedSlot, input, draftAssignments, onConflict]
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [draftAssignments, ...prev]);
    setDraftAssignments(previous);
    setSelectedSlot(null);
    setLastConflict(null);
  }, [history, draftAssignments]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, draftAssignments]);
    setDraftAssignments(next);
    setSelectedSlot(null);
    setLastConflict(null);
  }, [future, draftAssignments]);

  const discardChanges = useCallback(() => {
    setDraftAssignments(initialAssignments);
    setHistory([]);
    setFuture([]);
    setSelectedSlot(null);
    setLastConflict(null);
    setIsEditing(false);
  }, [initialAssignments]);

  const saveChanges = useCallback(async () => {
    if (!onSave) return;
    await onSave(draftAssignments);
    setHistory([]);
    setFuture([]);
    setSelectedSlot(null);
    setLastConflict(null);
    setIsEditing(false);
  }, [draftAssignments, onSave]);

  return {
    isEditing,
    hasChanges,
    canUndo,
    canRedo,
    changeCount,
    draftAssignments,
    selectedSlot,
    validTargets,
    lastConflict,
    toggleEditMode,
    selectSlot,
    clearSelection,
    executeMoveOrSwap,
    undo,
    redo,
    discardChanges,
    saveChanges,
  };
}
