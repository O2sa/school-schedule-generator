# School Timetabling Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, strongly typed Node.js + TypeScript school timetabling npm package that solves timetables using CSP, MRV variable selection, forward checking, slot scoring heuristics, transactional O(1) backtracking, and comprehensive feasibility checks.

**Architecture:** Transactional state CSP solver with indexed direct grids, deterministic MRV variable ordering, forward checking pruning, modular slot scoring, and decoupled validation/feasibility checking.

**Tech Stack:** TypeScript (strict mode), Node.js (18+), tsup (dual ESM/CommonJS build), Vitest (unit, integration & property tests), ESLint, Prettier.

**Spec:** [docs/superpowers/specs/2026-09-18-school-timetabling-engine-design.md](file:///c:/Users/msii/Documents/class_scheduling/docs/superpowers/specs/2026-09-18-school-timetabling-engine-design.md)

## Global Constraints

- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`).
- Zero heavy external runtime solver dependencies; pure, fast, self-contained TypeScript.
- Dual package exports (ESM `.mjs` and CJS `.cjs` with `.d.ts` declarations).
- Complete hard constraint satisfaction (H1-H8) with zero violations.
- Transparent reporting: impossible schedules must return `status: "INFEASIBLE"` with structured diagnostic codes, never false successes or truncated assignments.
- Backtracking must recover from greedy dead ends.

---

### Task 1: Project Scaffolding & Toolchain Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`
- Create: `.prettierrc`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Test: `tests/sanity.test.ts`

**Interfaces:**
- Produces: Working npm project structure, test runner (`npm test`), build runner (`npm run build`), typechecker (`npm run typecheck`).

- [ ] **Step 1: Create package.json and configuration files**

```json
{
  "name": "school-timetabling-engine",
  "version": "1.0.0",
  "description": "Production-quality constraint-satisfaction school timetabling engine in TypeScript",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsup": "^8.0.0",
    "vitest": "^1.6.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create tsconfig.json, tsup.config.ts, vitest.config.ts, .gitignore**

Configure TypeScript for strict type checking and target ES2022. Set up tsup for dual entry and declaration maps.

- [ ] **Step 3: Install dependencies**

Run: `npm install` in `c:\Users\msii\Documents\class_scheduling`.

- [ ] **Step 4: Create sanity test to verify Vitest**

Create `tests/sanity.test.ts` and run `npm test`.

- [ ] **Step 5: Commit scaffolding**

```bash
git add package.json tsconfig.json tsup.config.ts vitest.config.ts .gitignore tests/sanity.test.ts
git commit -m "chore: scaffold TypeScript project with Vitest and tsup"
```

---

### Task 2: Core Domain Types, Internal Models & Hard Constraints

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/models.ts`
- Create: `src/domain/constraints/constraint.interface.ts`
- Create: `src/domain/constraints/built-in-constraints.ts`
- Create: `tests/unit/constraints.test.ts`

**Interfaces:**
- Produces: `SchoolDay`, `ClassDefinition`, `TeacherDefinition`, `TeachingRequirement`, `TimetableInput`, `TimetableResult`, `ScheduledLecture`, `DiagnosticViolation`, `HardConstraint`, `BuiltInConstraints`.

- [ ] **Step 1: Write unit tests for built-in constraints**

In `tests/unit/constraints.test.ts`, test:
- `TeacherNoCollisionConstraint` returns false when teacher already has lecture at (day, period).
- `ClassNoCollisionConstraint` returns false when class already has lecture at (day, period).
- `TeacherWorkingDaysConstraint` returns false when day not in teacher workingDays.
- `TeacherBlockedSlotsConstraint` returns false when (day, period) is blocked.
- `TeacherDailyOverloadConstraint` returns false when day count >= teacher maxLecturesPerDay.
- `ClassAllowedPeriodsConstraint` returns false when period not in class allowedPeriods.

- [ ] **Step 2: Verify test fails**

Run `npm test` and verify failure because constraint files do not exist yet.

- [ ] **Step 3: Implement domain types and built-in constraints**

Implement `src/domain/types.ts`, `src/domain/models.ts`, `src/domain/constraints/constraint.interface.ts`, and `src/domain/constraints/built-in-constraints.ts`.

- [ ] **Step 4: Verify tests pass**

Run `npm test tests/unit/constraints.test.ts`.

- [ ] **Step 5: Commit domain models and constraints**

```bash
git add src/domain/ tests/unit/constraints.test.ts
git commit -m "feat(domain): implement core domain models and hard constraints"
```

---

### Task 3: Input Validation & Feasibility Checker

**Files:**
- Create: `src/validation/input-validator.ts`
- Create: `src/validation/feasibility-checker.ts`
- Create: `tests/unit/validator.test.ts`
- Create: `tests/unit/feasibility.test.ts`

**Interfaces:**
- Consumes: `TimetableInput`, `DiagnosticViolation`.
- Produces:
  `validateInput(input: TimetableInput): { valid: boolean; errors: DiagnosticViolation[] }`
  `checkFeasibility(input: TimetableInput): { feasible: boolean; errors: DiagnosticViolation[] }`

- [ ] **Step 1: Write unit tests for input validator**

Test in `tests/unit/validator.test.ts`:
- Duplicate class IDs, teacher IDs, requirement IDs.
- Non-existent teacherId or classId referenced in requirements.
- Negative lecturesPerDay, lecturesPerWeek.
- Invalid days (workingDays or blockedSlots with day not in days).
- Blocked slots with period >= periodsPerDay or < 0.
- Class allowedPeriods with invalid length or out-of-range periods.

- [ ] **Step 2: Write unit tests for feasibility checker**

Test in `tests/unit/feasibility.test.ts`:
- F1: Class requirement total mismatch (e.g. 5 days * 8 periods = 40 required, sum of teacher reqs = 37).
- F2: Teacher global usable slot deficit (teacher requires 20 lectures, has only 15 usable slots).
- F3: Teacher required lectures > class total capacity.
- F4: Teacher-class overlap deficit (teacher blocked for all periods attended by class).
- F5: Teacher daily capacity sum check.
- F6: 0 teachers when class requires lectures.

- [ ] **Step 3: Run tests to verify failure**

Run `npm test tests/unit/validator.test.ts tests/unit/feasibility.test.ts`.

- [ ] **Step 4: Implement input-validator.ts and feasibility-checker.ts**

Implement validation rules and detailed diagnostic messages with violation codes.

- [ ] **Step 5: Run tests to verify they pass**

Run `npm test tests/unit/validator.test.ts tests/unit/feasibility.test.ts`.

- [ ] **Step 6: Commit validation and feasibility layers**

```bash
git add src/validation/ tests/unit/validator.test.ts tests/unit/feasibility.test.ts
git commit -m "feat(validation): implement input validator and feasibility checker"
```

---

### Task 4: ScheduleState with Transactional Undo Stack

**Files:**
- Create: `src/state/schedule-state.ts`
- Create: `src/state/readonly-state.ts`
- Create: `tests/unit/schedule-state.test.ts`

**Interfaces:**
- Consumes: `NormalizedClass`, `NormalizedTeacher`, `NormalizedRequirement`.
- Produces: `ScheduleState` class exposing:
  - `assign(req, day, period): ScheduledLecture`
  - `undo(): void`
  - `canAssign(req, day, period): boolean`
  - `getCandidateSlots(req): TimetableSlot[]`
  - `isComplete(): boolean`
  - `getRemaining(reqId): number`
  - `asReadonly(): ReadonlyScheduleState`

- [ ] **Step 1: Write unit tests for schedule state & undo symmetry**

Test in `tests/unit/schedule-state.test.ts`:
- Basic assignment updates teacher grid, class grid, daily loads, and decrements remaining requirements.
- `undo()` cleanly restores all values to exact prior state.
- Multiple sequential assignments followed by sequential undos restores original state.
- `canAssign()` returns true for empty slot within bounds, false after assignment.
- `getCandidateSlots()` correctly filters out blocked slots and occupied periods.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test tests/unit/schedule-state.test.ts`.

- [ ] **Step 3: Implement ScheduleState and ReadonlyScheduleState**

Implement indexed 2D grids, typed arrays for daily counters, and `undoJournal` stack.

- [ ] **Step 4: Run tests to verify they pass**

Run `npm test tests/unit/schedule-state.test.ts`.

- [ ] **Step 5: Commit schedule state**

```bash
git add src/state/ tests/unit/schedule-state.test.ts
git commit -m "feat(state): implement transactional ScheduleState with undo journal"
```

---

### Task 5: Search Heuristics (MRV, Candidate Slot Scoring & Quality Metrics)

**Files:**
- Create: `src/heuristics/mrv.ts`
- Create: `src/heuristics/slot-scoring.ts`
- Create: `src/heuristics/quality-metrics.ts`
- Create: `tests/unit/mrv.test.ts`
- Create: `tests/unit/slot-scoring.test.ts`
- Create: `tests/unit/quality-metrics.test.ts`

**Interfaces:**
- Produces:
  `selectNextRequirement(state: ScheduleState, requirements: NormalizedRequirement[]): { requirement: NormalizedRequirement | null; candidateSlots: TimetableSlot[]; isDeadEnd: boolean }`
  `scoreCandidateSlots(slots: TimetableSlot[], req: NormalizedRequirement, state: ScheduleState, options: SolverOptions): TimetableSlot[]`
  `calculateQualityMetrics(lectures: ScheduledLecture[], teachers: NormalizedTeacher[], classes: NormalizedClass[], days: SchoolDay[]): QualityMetrics`

- [ ] **Step 1: Write unit tests for MRV, slot scoring and quality metrics**

Test in `tests/unit/mrv.test.ts`:
- Requirement with 2 candidate slots is picked before requirement with 10 candidate slots.
- Tie breaking prefers higher remaining lecture count, then fewer teacher working days, then stable ID.
- Detects dead-end when active requirement has fewer candidates than remaining lectures.
Test in `tests/unit/slot-scoring.test.ts`:
- Slot on day with 0 lectures scored higher than day with 4 lectures for the same teacher.
- Adjacent slot scores higher than isolated gap slot.
Test in `tests/unit/quality-metrics.test.ts`:
- Accurately counts teacher 1-period gaps and daily load variance.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test tests/unit/mrv.test.ts tests/unit/slot-scoring.test.ts tests/unit/quality-metrics.test.ts`.

- [ ] **Step 3: Implement MRV, slot scoring, and quality metrics**

- [ ] **Step 4: Run tests to verify they pass**

Run `npm test tests/unit/mrv.test.ts tests/unit/slot-scoring.test.ts tests/unit/quality-metrics.test.ts`.

- [ ] **Step 5: Commit heuristics**

```bash
git add src/heuristics/ tests/unit/mrv.test.ts tests/unit/slot-scoring.test.ts tests/unit/quality-metrics.test.ts
git commit -m "feat(heuristics): implement MRV selection, slot scoring, and quality metrics"
```

---

### Task 6: CSP Solver Engine (Candidate Generation, Forward Checking & Backtracking)

**Files:**
- Create: `src/solver/candidate-generator.ts`
- Create: `src/solver/forward-checker.ts`
- Create: `src/solver/search.ts`
- Create: `src/solver/scheduler.ts`
- Create: `tests/integration/scheduler.test.ts`

**Interfaces:**
- Consumes: `ScheduleState`, `MRV`, `SlotScoring`, `ForwardChecker`, `BuiltInConstraints`.
- Produces: `solveTimetable(input: TimetableInput): TimetableResult`

- [ ] **Step 1: Write integration tests for standard timetabling**

In `tests/integration/scheduler.test.ts`:
- Solve standard school (5 days, 8 periods, 3 classes, 8 teachers). Assert `status === "SUCCESS"`.
- Verify byClass, byTeacher, byDay index maps are properly populated.
- Test class with fewer periods (e.g. 6 periods/day vs 8 school periods).
- Test teacher with blocked periods.
- Test teacher teaching multiple subjects to the same class.
- Verify deterministic result across repeated runs.

- [ ] **Step 2: Run tests to verify failure**

Run `npm test tests/integration/scheduler.test.ts`.

- [ ] **Step 3: Implement candidate generator, forward checker, recursive search, and scheduler coordinator**

Implement:
- `candidate-generator.ts`: tests hard constraints to find valid slots for a requirement.
- `forward-checker.ts`: lookahead check on affected requirements sharing teacher or class.
- `search.ts`: recursive backtracking loop with search counters (`iterations`, `backtracks`, `timeoutMs`).
- `scheduler.ts`: runs `validateInput`, then `checkFeasibility`, initializes `ScheduleState`, executes `search`, and assembles `TimetableResult`.

- [ ] **Step 4: Run tests to verify they pass**

Run `npm test tests/integration/scheduler.test.ts`.

- [ ] **Step 5: Commit solver engine**

```bash
git add src/solver/ tests/integration/scheduler.test.ts
git commit -m "feat(solver): implement CSP backtracking engine with forward checking"
```

---

### Task 7: Adversarial Backtracking, Edge Cases & Property Invariants

**Files:**
- Create: `tests/integration/adversarial-backtrack.test.ts`
- Create: `tests/integration/edge-cases.test.ts`
- Create: `tests/property/invariants.test.ts`

**Interfaces:**
- Validates: System robustness under traps, edge cases (E1-E14), and property invariant checks.

- [ ] **Step 1: Write adversarial backtracking tests**

In `tests/integration/adversarial-backtrack.test.ts`:
- Create a timetable setup where greedy heuristic would assign Teacher 1 to Day 0 Period 0, but that leaves Teacher 2 (who can only work Day 0 Period 0) with 0 valid slots.
- Verify that solver backtracks, undoes Teacher 1's assignment, assigns Teacher 2 to Day 0 Period 0, and succeeds!

- [ ] **Step 2: Write edge cases tests (E1-E14)**

In `tests/integration/edge-cases.test.ts`:
- E1: Zero classes -> returns SUCCESS with empty schedule.
- E2: Zero teachers with classes requiring lectures -> returns INFEASIBLE.
- E3: Class with `lecturesPerDay = 0` -> handled gracefully.
- E4: Teacher with zero working days -> INFEASIBLE if lectures > 0, SUCCESS if lectures = 0.
- E5: Teacher with all slots blocked -> INFEASIBLE if lectures > 0.
- E6: Teacher working fewer days than school.
- E7: Teacher blocked on an entire working day.
- E8: Multiple teachers required by same class.
- E9: Multiple classes sharing the same teacher.
- E10: Class has more teachers than periods per day.
- E11: Teacher has total capacity but not on required days -> INFEASIBLE.
- E12: Timeout limit exceeded returns `status: "TIMEOUT"`.

- [ ] **Step 3: Write property-based invariant test**

In `tests/property/invariants.test.ts`:
- Create helper `verifyAllInvariants(result, input)`.
- Assert:
  - No teacher collision: for any (day, period), teacher appears at most once.
  - No class collision: for any (day, period), class appears at most once.
  - No teacher scheduled on non-working day.
  - No teacher scheduled on blocked slot.
  - Every class has exactly `days.length * lecturesPerDay` lectures.
  - Every requirement has exactly `lecturesPerWeek` lectures.
  - No teacher exceeds `maxLecturesPerDay`.

- [ ] **Step 4: Run all tests and fix any discovered issues**

Run `npm test`.

- [ ] **Step 5: Commit adversarial and property tests**

```bash
git add tests/integration/adversarial-backtrack.test.ts tests/integration/edge-cases.test.ts tests/property/invariants.test.ts
git commit -m "test: add adversarial backtracking, edge cases E1-E14, and property invariant tests"
```

---

### Task 8: Formatters, Examples & Public API Exports

**Files:**
- Create: `src/formatters/timetable-formatter.ts`
- Create: `src/index.ts`
- Create: `examples/basic.ts`
- Create: `examples/restricted-teacher.ts`
- Create: `examples/impossible.ts`
- Create: `tests/unit/formatters.test.ts`

**Interfaces:**
- Produces:
  - `formatTimetableByClass(result: TimetableResult): string`
  - `formatTimetableByTeacher(result: TimetableResult): string`
  - Clean barrel export `src/index.ts` exposing all public APIs and types.

- [ ] **Step 1: Write formatter tests**

In `tests/unit/formatters.test.ts`:
- Verify ASCII/Markdown table formatting for class and teacher views.

- [ ] **Step 2: Implement formatters and src/index.ts**

Export `solveTimetable`, `validateInput`, `checkFeasibility`, `formatTimetableByClass`, `formatTimetableByTeacher`, types, and built-in constraint interfaces.

- [ ] **Step 3: Create executable example scripts**

In `examples/basic.ts`, `examples/restricted-teacher.ts`, and `examples/impossible.ts`.

- [ ] **Step 4: Run tests**

Run `npm test`.

- [ ] **Step 5: Commit formatters and examples**

```bash
git add src/formatters/ src/index.ts examples/ tests/unit/formatters.test.ts
git commit -m "feat: add timetable formatters, public barrel export, and runnable examples"
```

---

### Task 9: Build Verification, Packaging & Documentation

**Files:**
- Modify: `package.json`
- Create: `README.md`

- [ ] **Step 1: Run build with tsup**

Run `npm run build` and verify that `dist/index.mjs`, `dist/index.cjs`, and `dist/index.d.ts` are generated without errors.

- [ ] **Step 2: Run typecheck**

Run `npm run typecheck` to ensure zero TypeScript errors under strict mode.

- [ ] **Step 3: Run full test suite**

Run `npm test` and verify 100% test pass rate.

- [ ] **Step 4: Write comprehensive README.md**

Document overview, installation, quickstart, full API reference, hard constraints, soft heuristics, feasibility diagnostics, examples, extension guide, and performance benchmarks.

- [ ] **Step 5: Final commit**

```bash
git add README.md package.json dist/
git commit -m "docs: complete comprehensive README and verify dual ESM/CJS build"
```
