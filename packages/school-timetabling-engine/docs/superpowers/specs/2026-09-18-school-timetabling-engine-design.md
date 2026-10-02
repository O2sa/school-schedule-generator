# Design Specification: Production-Quality TypeScript School Timetabling Package

**Status:** Draft / Ready for Review  
**Date:** 2026-09-18  
**Topic:** Reusable Constraint-Satisfaction School Timetabling Engine  

---

## 1. Overview & Objectives

The goal of this package is to provide a clean, maintainable, strongly typed **Node.js + TypeScript npm package** that solves the school timetabling problem. It operates as an algorithmic engine that maps teaching requirements (teachers, classes, subjects, weekly lectures) into an conflict-free timetable across configurable working days and periods.

### Core Guarantees
1. **Hard-Constraint Correctness**: Zero violations of hard physical and organizational constraints under any circumstances.
2. **Deterministic Execution**: Given identical inputs and options, identical timetables are produced every single time.
3. **Backtracking & Complete Search**: Never relies on naive greedy heuristics that trap themselves in dead ends; uses complete CSP search with backtracking and forward checking.
4. **Honest Infeasibility & Explainability**: Impossible configurations are caught early by mathematical validation and feasibility checks, or by search exhaustiveness, and reported with structured diagnostics rather than false successes or silent constraint violations.
5. **High Performance**: $O(1)$ transactional undo-stack state management avoiding garbage collection spikes and heap bloat.
6. **Extensibility**: Clean decoupling between hard constraints, soft slot scoring heuristics, state management, and user-facing formatters.

---

## 2. Domain Models & Public API

### 2.1 Input Data Structures

```typescript
export interface SchoolDay {
  /** 0-indexed day identifier (e.g. 0, 1, 2, 3, 4) */
  id: number;
  /** Optional display name (e.g. "Saturday", "Sunday") */
  name?: string;
}

export interface BlockedSlot {
  day: number;
  period: number;
}

export interface ClassDefinition {
  id: string;
  name: string;
  /** Number of required lectures for this class per school working day */
  lecturesPerDay: number;
  /**
   * Optional custom period indices the class attends on each working day.
   * If omitted, defaults to [0, 1, ..., lecturesPerDay - 1].
   */
  allowedPeriods?: number[];
}

export interface TeacherDefinition {
  id: string;
  name: string;
  /** Explicit working day indices, e.g. [0, 1, 3, 4] */
  workingDays: number[];
  /** Specific timetable slots where the teacher is unavailable */
  blockedSlots?: BlockedSlot[];
  /** Maximum periods a teacher can teach in any single day (default: periodsPerDay) */
  maxLecturesPerDay?: number;
}

export interface TeachingRequirement {
  /** Unique requirement ID. Auto-generated if omitted: `${teacherId}__${classId}__${subjectId ?? 'default'}` */
  id?: string;
  teacherId: string;
  classId: string;
  /** Optional subject code or name (supports teachers teaching multiple subjects to the same class) */
  subjectId?: string;
  subjectName?: string;
  /** Exact number of lectures required for this teacher/class/subject combination per week */
  lecturesPerWeek: number;
}

export interface SolverOptions {
  /** Maximum wall-clock time in milliseconds (default: 10_000ms) */
  timeoutMs?: number;
  /** Maximum backtracks before aborting with TIMEOUT (default: 100_000) */
  maxBacktracks?: number;
  /** Maximum search iterations before aborting with TIMEOUT (default: 500_000) */
  maxIterations?: number;
  /** Enable lookahead forward checking to prune dead branches early (default: true) */
  enableForwardChecking?: boolean;
  /** Soft heuristic: prefer contiguous teaching blocks and minimize 1-period gaps (default: true) */
  minimizeGaps?: boolean;
  /** Soft heuristic: distribute daily teaching load evenly across working days (default: true) */
  balanceWorkload?: boolean;
  /** Optional deterministic seed for heuristic tie-breaking (default: 42) */
  seed?: number;
  /** Custom additional hard constraints to evaluate */
  customConstraints?: HardConstraint[];
}

export interface TimetableInput {
  days: SchoolDay[];
  periodsPerDay: number;
  classes: ClassDefinition[];
  teachers: TeacherDefinition[];
  requirements: TeachingRequirement[];
  options?: SolverOptions;
}
```

### 2.2 Output & Result Types

```typescript
export interface ScheduledLecture {
  day: number;
  period: number;
  classId: string;
  teacherId: string;
  subjectId?: string;
  subjectName?: string;
  requirementId: string;
}

export interface SolverStatistics {
  executionTimeMs: number;
  iterations: number;
  backtracks: number;
  forwardCheckingPrunes: number;
  maxSearchDepth: number;
}

export interface QualityMetrics {
  totalAssigned: number;
  teacherGapCount: number;
  teacherDailyLoadVariance: number;
  overallScore: number;
}

export interface DiagnosticViolation {
  code: string;
  message: string;
  teacherId?: string;
  classId?: string;
  day?: number;
  period?: number;
  details?: Record<string, unknown>;
}

export type TimetableResult =
  | {
      status: "SUCCESS";
      lectures: ScheduledLecture[];
      byClass: Map<string, ScheduledLecture[]>;
      byTeacher: Map<string, ScheduledLecture[]>;
      byDay: Map<number, ScheduledLecture[]>;
      statistics: SolverStatistics;
      quality: QualityMetrics;
    }
  | {
      status: "INFEASIBLE";
      diagnostics: DiagnosticViolation[];
      statistics: SolverStatistics;
    }
  | {
      status: "TIMEOUT";
      partialLectures: ScheduledLecture[];
      diagnostics: DiagnosticViolation[];
      statistics: SolverStatistics;
    };
```

---

## 3. Hard Constraints Specification

The following constraints are non-negotiable. An assignment $(T, C, d, p)$ is strictly invalid if any of these conditions are violated:

| Code | Constraint | Description |
|---|---|---|
| **H1** | One Teacher At a Time | Teacher $T$ cannot be assigned to more than one class during day $d$ and period $p$. |
| **H2** | One Class At a Time | Class $C$ cannot be assigned to more than one teacher/subject during day $d$ and period $p$. |
| **H3** | Teacher Working Days | Teacher $T$ cannot be scheduled on day $d$ if $d \notin T.\text{workingDays}$. |
| **H4** | Blocked Teacher Slots | Teacher $T$ cannot be scheduled on day $d$ at period $p$ if $(d, p) \in T.\text{blockedSlots}$. |
| **H5** | Exact Weekly Requirement | The total number of assignments for requirement $R(T, C, S)$ must equal $R.\text{lecturesPerWeek}$ upon completion. |
| **H6** | Full Class Schedule | Every class $C$ must receive exactly $C.\text{lecturesPerDay} \times |\text{days}|$ lectures. |
| **H7** | Class Daily Period Boundaries | Class $C$ can only receive lectures in $p \in C.\text{allowedPeriods}$. |
| **H8** | Teacher Daily Overload | Total lectures assigned to teacher $T$ on day $d$ must not exceed $T.\text{maxLecturesPerDay}$ (defaulting to $\text{periodsPerDay}$). |

---

## 4. Validation & Early Feasibility Layer

Validation is executed before entering the CSP search algorithm. It is split into two phases:

### Phase 1: Syntactic & Structural Validation (`validateInput`)
* Rejects duplicate IDs among `classes`, `teachers`, and `requirements`.
* Ensures referential integrity: all `teacherId` and `classId` in requirements must correspond to declared entities.
* Validates bounds: `days` must not be empty; `periodsPerDay` must be $\ge 1$; `lecturesPerDay` and `lecturesPerWeek` must be non-negative.
* Checks that teacher `workingDays` only contain valid day IDs.
* Checks that `blockedSlots` reside within valid day IDs and $0 \le \text{period} < \text{periodsPerDay}$.
* Checks that class `allowedPeriods` (if provided) matches `lecturesPerDay` in length and contains unique periods within $[0, \text{periodsPerDay} - 1]$.

### Phase 2: Mathematical Feasibility Verification (`checkFeasibility`)
* **F1 — Class Required Total Balance**:
  For each class $C$:
  $$\sum_{R \in \text{reqs}(C)} R.\text{lecturesPerWeek} = |\text{days}| \times C.\text{lecturesPerDay}$$
  If mismatched, fails with diagnostic code `CLASS_LECTURE_TOTAL_MISMATCH` specifying required vs actual sum.
* **F2 — Teacher Global Usable Slots**:
  For each teacher $T$, compute usable slots:
  $$\text{usable}(T) = \sum_{d \in T.\text{workingDays}} \left( \text{periodsPerDay} - |\{p \mid (d, p) \in T.\text{blockedSlots}\}| \right)$$
  If $\sum_{R \in \text{reqs}(T)} R.\text{lecturesPerWeek} > \text{usable}(T)$, fails with `TEACHER_CAPACITY_EXCEEDED`.
* **F3 — Class Total Capacity**:
  For each requirement $R(T, C)$, $R.\text{lecturesPerWeek} \le |\text{days}| \times C.\text{lecturesPerDay}$.
* **F4 — Teacher-Class Slot Overlap**:
  For each requirement $R(T, C)$, compute overlapping slots:
  $$\text{overlap}(T, C) = |\{ (d, p) \mid d \in T.\text{workingDays} \land (d, p) \notin T.\text{blockedSlots} \land p \in C.\text{allowedPeriods} \}|$$
  If $R.\text{lecturesPerWeek} > \text{overlap}(T, C)$, fails with `INSUFFICIENT_TEACHER_CLASS_OVERLAP`.
* **F5 — Teacher Daily Capacity Sum**:
  For each teacher $T$, $\sum_{R \in \text{reqs}(T)} R.\text{lecturesPerWeek} \le \sum_{d \in T.\text{workingDays}} \min(\text{usable}(T, d), T.\text{maxLecturesPerDay})$.
* **F6 — Zero Teachers Edge Case**:
  If classes require lectures ($> 0$) but no teachers are provided or teacher capacity is 0, reports `NO_TEACHERS_FOR_REQUIRED_LECTURES`.

---

## 5. Solver State & Transactional Undo Architecture

The solver maintains a compact, mutable `ScheduleState` backed by a transaction journal to avoid object allocations during recursion.

### 5.1 Internal State Representations
* **`teacherGrid: Map<TeacherId, (ScheduledLecture | null)[][]>`**: 2D lookup array `[day][period]` for $O(1)$ teacher availability checks.
* **`classGrid: Map<ClassId, (ScheduledLecture | null)[][]>`**: 2D lookup array `[day][period]` for $O(1)$ class availability checks.
* **`teacherDailyLoad: Map<TeacherId, Int32Array>`**: Counter of assigned lectures per teacher per day.
* **`classDailyLoad: Map<ClassId, Int32Array>`**: Counter of assigned lectures per class per day.
* **`remainingReqCount: Map<RequirementId, number>`**: Remaining lectures to be scheduled for each requirement.
* **`totalUnscheduled: number`**: Total remaining lectures across all requirements.
* **`undoJournal: AssignmentStep[]`**: Stack of performed assignments enabling instantaneous $O(1)$ rollback.

### 5.2 Assignment & Rollback Mechanics
```typescript
interface AssignmentStep {
  requirement: NormalizedRequirement;
  day: number;
  period: number;
  lecture: ScheduledLecture;
}

public assign(req: NormalizedRequirement, day: number, period: number): ScheduledLecture {
  const lecture: ScheduledLecture = {
    day,
    period,
    classId: req.classId,
    teacherId: req.teacherId,
    subjectId: req.subjectId,
    subjectName: req.subjectName,
    requirementId: req.id
  };
  
  this.teacherGrid.get(req.teacherId)![day][period] = lecture;
  this.classGrid.get(req.classId)![day][period] = lecture;
  this.teacherDailyLoad.get(req.teacherId)![day]++;
  this.classDailyLoad.get(req.classId)![day]++;
  this.remainingReqCount.set(req.id, this.remainingReqCount.get(req.id)! - 1);
  this.totalUnscheduled--;
  
  this.undoJournal.push({ requirement: req, day, period, lecture });
  return lecture;
}

public undo(): void {
  const step = this.undoJournal.pop();
  if (!step) return;
  const { requirement, day, period } = step;
  
  this.teacherGrid.get(requirement.teacherId)![day][period] = null;
  this.classGrid.get(requirement.classId)![day][period] = null;
  this.teacherDailyLoad.get(requirement.teacherId)![day]--;
  this.classDailyLoad.get(requirement.classId)![day]--;
  this.remainingReqCount.set(requirement.id, this.remainingReqCount.get(requirement.id)! + 1);
  this.totalUnscheduled++;
}
```

---

## 6. Search Algorithm & Heuristics

The solver formulates timetabling as a Constraint Satisfaction Problem (CSP):
* **Variables**: Unassigned lecture units of `TeachingRequirement`s.
* **Domains**: Valid timetable coordinates $(d, p) \in \text{Days} \times \text{Periods}$.
* **Constraints**: Hard constraints H1 through H8.

### 6.1 Variable Selection: Minimum Remaining Values (MRV)
At each recursion step:
1. Identify all requirements with `remainingReqCount > 0`.
2. For each active requirement, generate all valid candidate slots using `getCandidateSlots(req, state)`.
3. **Dead-End Pruning**: If any requirement has $\text{candidateCount} < \text{remainingReqCount}$, the current branch cannot lead to a complete schedule. Prune and backtrack immediately!
4. **Selection**: Select the requirement with the minimum number of candidate slots (MRV).
5. **Deterministic Tie-Breaking**:
   * Descending order of `remainingReqCount`.
   * Ascending order of teacher working day count.
   * Lexicographical order of `requirement.id`.

### 6.2 Value Ordering: Composite Slot Scoring
Once a requirement $R(T, C)$ is selected, its candidate slots $(d, p)$ are sorted in descending order of a heuristic score:
$$\text{Score}(d, p) = S_{\text{balance}}(T, d) + S_{\text{continuity}}(T, d, p) + S_{\text{classSpread}}(C, R.\text{subjectId}, d)$$

1. **Teacher Workload Balance ($S_{\text{balance}}$)**:
   Penalizes scheduling on days where the teacher already has significant assignments:
   $$S_{\text{balance}} = - \frac{\text{teacherDailyLoad}[T][d]}{\text{maxLecturesPerDay}(T)} \times 100$$
2. **Teacher Gap Reduction ($S_{\text{continuity}}$)**:
   * $+50$ points if $(d, p)$ is directly adjacent to an already scheduled lecture for teacher $T$ on day $d$.
   * $-40$ points if $(d, p)$ creates an isolated single-period gap between existing lectures.
3. **Subject Distribution ($S_{\text{classSpread}}$)**:
   * $+30$ points if class $C$ does not already have this subject scheduled on day $d$, encouraging distribution across different days of the week.

### 6.3 Forward Checking (Lookahead)
After assigning $(d, p)$ to requirement $R$:
1. Query all other active requirements $R'$ that share teacher $T$ or class $C$.
2. For each affected requirement $R'$, verify that its remaining candidate count $\ge R'.\text{remainingReqCount}$.
3. If any affected requirement violates this condition, immediately undo the assignment and try the next candidate slot. This prunes exponential subtrees early.

### 6.4 Search Guards & Limits
* At each recursion step, check:
  * `iterations >= maxIterations` $\implies$ return `TIMEOUT`.
  * `backtracks >= maxBacktracks` $\implies$ return `TIMEOUT`.
  * `Date.now() - startTime >= timeoutMs` $\implies$ return `TIMEOUT`.
* On `TIMEOUT`, the solver packages the partial schedule assignments and statistics for diagnostics.

---

## 7. Quality Metrics & Formatting Utilities

After reaching a valid complete schedule:
* **Teacher Gap Count**: Total number of vacant periods sandwiched between scheduled lectures for each teacher across all days.
* **Teacher Daily Load Variance**: Statistical variance of lectures per day for each teacher over their working days.
* **Formatters**:
  * `formatTimetableByClass(result: TimetableResult): string`: Markdown/ASCII grid table per class.
  * `formatTimetableByTeacher(result: TimetableResult): string`: Markdown/ASCII grid table per teacher.
  * `formatTimetableGrid(lectures: ScheduledLecture[], days: SchoolDay[], periodsPerDay: number): string`.

---

## 8. Testing Strategy

The test suite will be implemented using **Vitest** across unit, integration, and property-based test suites:

### 8.1 Validation & Feasibility Tests (`tests/unit/`)
* **`validator.test.ts`**:
  * Duplicate class, teacher, or requirement IDs.
  * Missing references (requirement pointing to unknown teacher or class).
  * Out-of-range days and periods.
  * Negative numbers for counts.
  * Disallowed periods outside timetable dimensions.
* **`feasibility.test.ts`**:
  * Class total requirement mismatch (e.g. 40 required, 38 provided).
  * Teacher slot deficit (teacher requires 25 lectures, but has only 20 unblocked periods).
  * Teacher-class overlap deficit (teacher blocked for all periods attended by the class).
  * Teacher daily overload (required lectures exceed sum of daily caps).
  * 0 teachers with non-empty classes.

### 8.2 State & Constraint Tests (`tests/unit/`)
* **`schedule-state.test.ts`**:
  * Unit test for `assign()` and `undo()` symmetry.
  * Verified state invariants after 1,000 random assign/undo cycles.
* **`slot-scoring.test.ts`**:
  * Verify deterministic ordering of candidate slots.
  * Verify teacher gap penalties and continuity bonuses.

### 8.3 Integration & Backtracking Tests (`tests/integration/`)
* **`scheduler.test.ts`**:
  * Standard school: 5 days, 8 periods/day, 4 classes, 10 teachers.
  * Complex school: Classes with unequal `lecturesPerDay` (6, 7, 8).
  * Restricted teachers: Teachers working only 1 or 2 days, teachers with heavy blocked slots.
  * Teachers teaching multiple subjects to the same class.
* **`adversarial-backtrack.test.ts`**:
  * Constructed scenarios where greedy assignment inevitably blocks a critical teacher in later periods, proving the backtracking search unwinds the dead end and discovers the valid schedule.
* **`edge-cases.test.ts`**:
  * Zero classes (returns SUCCESS with empty lectures).
  * Classes with `lecturesPerDay = 0`.
  * Teacher with 0 working days and 0 requirements.
  * Class having more teachers than periods per day.
  * Timeout limit enforcement.

### 8.4 Property-Based Invariant Tests (`tests/property/`)
* For every generated schedule, programmatically verify:
  1. No teacher is scheduled in 2 classes in the same $(d, p)$.
  2. No class has 2 teachers in the same $(d, p)$.
  3. No teacher is scheduled on a day not in `workingDays`.
  4. No teacher is scheduled in a `blockedSlots` position.
  5. Every class has exactly $C.\text{lecturesPerDay} \times |\text{days}|$ lectures.
  6. Every requirement has exactly $R.\text{lecturesPerWeek}$ lectures.
  7. No teacher exceeds their daily maximum.

---

## 9. Build, Packaging & Dependencies

* **Runtime**: Node.js 18+ / 20+ / 22+
* **Compiler / Bundler**: `tsup` targeting dual ESM (`dist/index.mjs`) and CommonJS (`dist/index.cjs`) with TypeScript declaration files (`dist/index.d.ts`).
* **TypeScript**: Strict mode enabled (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`).
* **Test Runner**: Vitest.
* **Zero Heavy Dependencies**: The solver is self-contained without external heavy constraint packages.
