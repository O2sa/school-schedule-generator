# School Timetabling Engine

A clean, maintainable, strongly typed **Node.js + TypeScript npm package** designed as a reusable constraint-satisfaction scheduling engine for schools, universities, and training academies.

It maps teaching requirements (teachers, classes, subjects, weekly lectures) into conflict-free timetables across configurable working days and periods using:
* **Constraint Satisfaction Problem (CSP)** formulation
* **Minimum Remaining Values (MRV)** dynamic variable selection
* **Lookahead Forward Checking** to prune dead-end branches early
* **Modular Heuristic Slot Scoring** (workload balance, continuity, subject distribution)
* **Transactional $O(1)$ Undo-Stack Backtracking** (zero garbage-collection churn)
* **Mathematical Validation & Feasibility Checks** with structured diagnostic codes

---

## Table of Contents
1. [Key Features](#key-features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Input API & Options](#input-api--options)
5. [Output & Diagnostics](#output--diagnostics)
6. [Hard Constraints (H1 – H8)](#hard-constraints-h1--h8)
7. [Feasibility Analysis (F1 – F6)](#feasibility-analysis-f1--f6)
8. [Soft Constraints & Heuristics](#soft-constraints--heuristics)
9. [Backtracking & CSP Strategy](#backtracking--csp-strategy)
10. [Custom Hard Constraints](#custom-hard-constraints)
11. [Formatters & Visualizers](#formatters--visualizers)
12. [Runnable Examples](#runnable-examples)
13. [Architecture & Design Principles](#architecture--design-principles)

---

## Key Features

* **100% Deterministic**: Guaranteed identical output for identical inputs (no uncontrolled random states).
* **Guaranteed Hard Invariants**: Never places a teacher in two places at once, never schedules outside working days or during blocked periods, and always fulfills exact lecture quotas.
* **No False Successes**: If a schedule is mathematically or combinatorially impossible, the engine reports `status: "INFEASIBLE"` with rich, structured explanations rather than truncating assignments or violating constraints.
* **Flexible Day & Period Modeling**: Supports arbitrary day sequences (e.g. Saturday–Wednesday, Sunday–Thursday) and classes with differing daily lecture counts.
* **Dual ESM & CommonJS**: Full support for `import` and `require` with first-class TypeScript `.d.ts` declaration maps.

---

## Installation

```bash
npm install school-timetabling-engine
```

Requires Node.js `>= 18.0.0`.

---

## Quick Start

```typescript
import { solveTimetable, formatTimetableByClass } from "school-timetabling-engine";

const result = solveTimetable({
  days: [
    { id: 0, name: "Monday" },
    { id: 1, name: "Tuesday" },
    { id: 2, name: "Wednesday" },
    { id: 3, name: "Thursday" },
    { id: 4, name: "Friday" }
  ],
  periodsPerDay: 4,
  classes: [
    { id: "grade_10a", name: "Grade 10A", lecturesPerDay: 4 } // 20 lectures
  ],
  teachers: [
    { id: "t_math", name: "Dr. Euler", workingDays: [0, 1, 2, 3, 4] },
    { id: "t_eng", name: "Ms. Austen", workingDays: [0, 1, 2, 3, 4] }
  ],
  requirements: [
    { teacherId: "t_math", classId: "grade_10a", subjectName: "Math", lecturesPerWeek: 10 },
    { teacherId: "t_eng", classId: "grade_10a", subjectName: "English", lecturesPerWeek: 10 }
  ]
});

if (result.status === "SUCCESS") {
  console.log("Timetable created!");
  console.log(formatTimetableByClass(result, { ... }));
} else {
  console.error("Infeasible:", result.diagnostics);
}
```

---

## Input API & Options

### `TimetableInput`

```typescript
export interface TimetableInput {
  /** Configurable school working days */
  days: SchoolDay[];
  /** Maximum number of periods in a school day */
  periodsPerDay: number;
  /** Classes / sections to schedule */
  classes: ClassDefinition[];
  /** Teachers, their working days, and blocked slots */
  teachers: TeacherDefinition[];
  /** Weekly lecture allocations between teachers and classes */
  requirements: TeachingRequirement[];
  /** Optional solver parameters and heuristic toggles */
  options?: SolverOptions;
}
```

### Entity Definitions

#### `SchoolDay`
```typescript
interface SchoolDay {
  id: number;           // 0-indexed integer (e.g. 0, 1, 2, ...)
  name?: string;        // Human-readable label (e.g. "Sunday", "Monday")
}
```

#### `ClassDefinition`
```typescript
interface ClassDefinition {
  id: string;
  name: string;
  /** Daily lecture count for this class */
  lecturesPerDay: number;
  /**
   * Optional custom period indices this class attends.
   * Defaults to [0, 1, ..., lecturesPerDay - 1].
   */
  allowedPeriods?: number[];
}
```

#### `TeacherDefinition`
```typescript
interface TeacherDefinition {
  id: string;
  name: string;
  /** Working day indices, e.g. [0, 1, 3, 4] */
  workingDays: number[];
  /** Specific slots where this teacher cannot teach */
  blockedSlots?: BlockedSlot[];
  /** Max lectures the teacher can teach in one day (default: periodsPerDay) */
  maxLecturesPerDay?: number;
}
```

#### `TeachingRequirement`
```typescript
interface TeachingRequirement {
  id?: string;          // Auto-generated if omitted
  teacherId: string;
  classId: string;
  subjectId?: string;   // Optional course identifier
  subjectName?: string; // Optional course display name
  lecturesPerWeek: number;
}
```

#### `SolverOptions`
```typescript
interface SolverOptions {
  timeoutMs?: number;              // Max wall-clock time in ms (default: 10_000ms)
  maxBacktracks?: number;          // Max backtracks before stopping (default: 100_000)
  maxIterations?: number;          // Max search steps (default: 500_000)
  enableForwardChecking?: boolean; // Enable forward pruning (default: true)
  minimizeGaps?: boolean;          // Soft preference for contiguous periods (default: true)
  balanceWorkload?: boolean;       // Soft preference for balanced daily loads (default: true)
  seed?: number;                   // Tie-breaker seed (default: 42)
  customConstraints?: HardConstraint[]; // Custom hard constraints
}
```

---

## Output & Diagnostics

`solveTimetable` returns a discriminated union:

```typescript
type TimetableResult =
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

### `ScheduledLecture`
```typescript
interface ScheduledLecture {
  day: number;
  period: number;
  classId: string;
  teacherId: string;
  subjectId?: string;
  subjectName?: string;
  requirementId: string;
}
```

### `SolverStatistics`
```typescript
interface SolverStatistics {
  executionTimeMs: number;
  iterations: number;
  backtracks: number;
  forwardCheckingPrunes: number;
  maxSearchDepth: number;
}
```

---

## Hard Constraints (H1 – H8)

The engine enforces all hard constraints with mathematical strictness. A candidate slot is rejected if any hard constraint fails:

| Code | Name | Description |
|---|---|---|
| **H1** | One Teacher At a Time | A teacher can teach at most one class in any given `(day, period)`. |
| **H2** | One Class At a Time | A class can receive at most one lecture in any given `(day, period)`. |
| **H3** | Teacher Working Days | A teacher cannot be scheduled on a day not in their `workingDays`. |
| **H4** | Blocked Slots | A teacher cannot be scheduled in any slot in `blockedSlots`. |
| **H5** | Exact Weekly Requirement | The final count of assigned lectures for a requirement must exactly match `lecturesPerWeek`. |
| **H6** | Full Class Schedule | Every class receives exactly `schoolDays × lecturesPerDay` lectures. |
| **H7** | Class Period Boundaries | Class lectures must occur only in `allowedPeriods` (defaulting to `0..lecturesPerDay - 1`). |
| **H8** | Teacher Daily Overload | A teacher cannot exceed `maxLecturesPerDay` on any day. |

---

## Feasibility Analysis (F1 – F6)

Before starting the search, `checkFeasibility` validates global mathematical invariants. If a conflict is discovered, it immediately returns `status: "INFEASIBLE"` with explanatory diagnostics:

* **F1 — Class Required Lecture Balance (`CLASS_LECTURE_TOTAL_MISMATCH`)**:
  Ensures $\sum \text{reqs}(C) = |\text{days}| \times C.\text{lecturesPerDay}$.
* **F2 — Teacher Global Capacity (`TEACHER_CAPACITY_EXCEEDED`)**:
  Ensures a teacher is not asked to teach more lectures than their available unblocked periods across their working days.
* **F3 — Requirement Capacity (`REQUIREMENT_EXCEEDS_CLASS_CAPACITY`)**:
  Ensures a single requirement does not exceed the total timetable slots of the target class.
* **F4 — Teacher-Class Overlap (`INSUFFICIENT_TEACHER_CLASS_OVERLAP`)**:
  Computes the exact intersection between teacher availability (working days minus blocked slots) and class attendance periods. If intersection $< \text{lecturesPerWeek}$, the engine rejects early.
* **F5 — Daily Capacity Sum (`TEACHER_DAILY_CAPACITY_DEFICIT`)**:
  Verifies that teacher requirements do not exceed $\sum_{d} \min(\text{usableSlots}(d), \text{maxLecturesPerDay})$.
* **F6 — Zero Teachers (`NO_TEACHERS_FOR_REQUIRED_LECTURES`)**:
  Catches configurations where classes require lectures but no teachers or requirements are provided.

---

## Soft Constraints & Heuristics

Soft constraints never alter validity; they only prioritize which valid candidate slot should be attempted first:

1. **Teacher Workload Balancing**:
   Favors assigning lectures to days where the teacher currently has a lower teaching load, spreading requirements across the week.
2. **Teacher Gap Minimization & Continuity**:
   Grants a $+50$ bonus if a slot is adjacent to an already scheduled lecture for that teacher, and penalizes slots that introduce an isolated 1-period idle window.
3. **Subject Distribution**:
   Prefers scheduling lectures across different days of the week so a class does not receive all weekly lectures for a subject in a single day (unless required).

---

## Backtracking & CSP Strategy

Rather than naive sequential scheduling (`Class A -> Class B -> ...`) which frequently traps itself in dead ends:

1. **Minimum Remaining Values (MRV)**:
   At every search step, the solver dynamically computes candidate slots for all active requirements and selects the most constrained requirement (fewest remaining valid slots).
2. **Forward Checking**:
   Immediately after making an assignment, the solver validates whether affected requirements sharing that teacher or class still retain sufficient candidate slots. If any drops below its remaining quota, the solver immediately undoes the assignment and tries the next candidate.
3. **Deterministic Search Journal**:
   Backtracking uses an $O(1)$ stack-based journal to revert grid assignments and counters without cloning objects or stressing the V8 garbage collector.

---

## Custom Hard Constraints

You can extend the solver with custom hard constraints (e.g. room limits, lunch breaks, max consecutive lectures):

```typescript
import { solveTimetable, type HardConstraint, type AssignmentCandidate, type ReadonlyScheduleState } from "school-timetabling-engine";

class NoLastPeriodOnFridayConstraint implements HardConstraint {
  readonly id = "NO_LAST_PERIOD_ON_FRIDAY";
  readonly description = "Teachers cannot teach period 7 on Friday (day 4)";

  isSatisfied(candidate: AssignmentCandidate, state: ReadonlyScheduleState): boolean {
    if (candidate.day === 4 && candidate.period === 7) {
      return false; // Reject slot
    }
    return true;
  }
}

const result = solveTimetable({
  ...input,
  options: {
    customConstraints: [new NoLastPeriodOnFridayConstraint()]
  }
});
```

---

## Formatters & Visualizers

The package includes built-in Markdown / ASCII grid formatters:

```typescript
import { formatTimetableByClass, formatTimetableByTeacher } from "school-timetabling-engine";

// Render class timetable tables
console.log(formatTimetableByClass(result, input));

// Render teacher timetable tables (including OFF and BLOCKED marks)
console.log(formatTimetableByTeacher(result, input));
```

---

## Runnable Examples

Four ready-to-run example scripts are included in the `examples/` directory:

```bash
# 1. Real-World Arabic K-12 Complex School (12 grades, 24 classrooms, 54 teachers, 800 lectures)
# Demonstrates 6 vs 7 daily periods, Sunday-Thursday calendar, and realistic curriculum
npm run example:arabic
# or: npx tsx examples/arabic-k12-school.ts

# 2. Standard balanced school baseline
npm run example:basic
# or: npx tsx examples/basic.ts

# 3. Highly restricted teachers with blocked slots
npx tsx examples/restricted-teacher.ts

# 4. Impossible configuration with structured diagnostics
npx tsx examples/impossible.ts
```

---

## Architecture & Design Principles

* **Separation of Concerns**:
  * `src/domain/`: Pure data models and pluggable constraint interfaces.
  * `src/validation/`: Syntactic validation and mathematical feasibility verification.
  * `src/state/`: Fast 2D lookup grids with transactional undo stack.
  * `src/heuristics/`: MRV selection, candidate scoring, and quality metrics.
  * `src/solver/`: Forward checking, recursive search, and scheduling coordinator.
  * `src/formatters/`: Output visualization.
* **Extensibility**: Search heuristics, constraints, and formatters are fully modular and can be extended without refactoring the core solver.
* **Robust Testing**: Over 60 unit, integration, adversarial backtracking, and property-based invariant test suites ensuring correctness across edge cases.

---

## License

MIT
