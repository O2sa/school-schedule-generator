# Unified Application Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire scheduling application suite (`/app/*`) design language to achieve 100% aesthetic parity with the modern multilingual landing page, including glassmorphic headers, floating sidebar, gradient highlights, telemetry counters, and elevated cards across all 7 views.

**Architecture:** Centralize brand tokens and Mantine component style overrides in `client/src/theme/theme.ts`. Re-architect `AppLayout.tsx` with translucent glassmorphic header and floating pill sidebar. Create reusable `DashboardMetricCard` and enhanced `PageHeader` components. Progressively restyle all views (`Dashboard`, `Generator`, `ScheduleView`, `Teachers`, `Classes`, `Subjects`, `Curriculum`, `Settings`) while preserving all existing data and solver business logic.

**Tech Stack:** React 18, TypeScript 5, Vite, Mantine UI v7, Tabler Icons, TanStack Query, Vitest, Testing Library.

**Spec:** [docs/superpowers/specs/2026-10-08-unified-app-design-system.md](file:///c:/Users/msii/Documents/school-schedule-generator/docs/superpowers/specs/2026-10-08-unified-app-design-system.md)

## Global Constraints

- Preserve all existing data structures, query hooks, and solver algorithms.
- Full bilingual Arabic (RTL) and English (LTR) layout symmetry.
- High-contrast, polished Dark and Light mode support across all screens.
- 100% test pass rate across the monorepo test suites (`pnpm test`).
- Clean TypeScript compilation with 0 errors (`pnpm typecheck`) and successful bundle (`pnpm build`).

---

### Task 1: Design Tokens, Theme Overrides & Shared Components

**Files:**
- Modify: `client/src/theme/theme.ts`
- Modify: `client/src/components/common/PageHeader.tsx`
- Create: `client/src/components/common/DashboardMetricCard.tsx`
- Test: `client/tests/theme.test.tsx`

**Interfaces:**
- Consumes: Mantine UI `createTheme`, Tabler Icons
- Produces: `BRAND_GRADIENT`, `BRAND_GRADIENT_HORIZONTAL`, `SUCCESS_GRADIENT`, `PageHeader`, `DashboardMetricCard`

- [ ] **Step 1: Write test for enhanced theme tokens and DashboardMetricCard**

Add test cases in `client/tests/theme.test.tsx` verifying theme tokens and `DashboardMetricCard` rendering with gradient icon chip, title, value, and badge.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter client test tests/theme.test.tsx`
Expected: FAIL due to missing `DashboardMetricCard`.

- [ ] **Step 3: Implement enhanced theme tokens in `theme.ts`**

Update `client/src/theme/theme.ts` with brand gradient definitions, card defaults, rounded button overrides, and table styling.

- [ ] **Step 4: Enhance `PageHeader.tsx` & create `DashboardMetricCard.tsx`**

- In `PageHeader.tsx`, add support for category badge, subtitle, and styled action containers.
- In `DashboardMetricCard.tsx`, create the landing-style metric card with 44px gradient icon chip, bold metric typography, hover lift, and secondary status badge.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter client test tests/theme.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit Task 1**

```bash
git add client/src/theme/theme.ts client/src/components/common/PageHeader.tsx client/src/components/common/DashboardMetricCard.tsx client/tests/theme.test.tsx
git commit -m "feat(theme): define brand design tokens, enhanced PageHeader, and DashboardMetricCard"
```

---

### Task 2: Application Shell Revamp (`AppLayout.tsx`)

**Files:**
- Modify: `client/src/layouts/AppLayout.tsx`
- Test: `client/tests/layout.test.tsx`

**Interfaces:**
- Consumes: `BRAND_GRADIENT`, `useTranslation`, `useMantineColorScheme`
- Produces: Polished glassmorphic header, floating pill sidebar, active gradient indicator, and Home link

- [ ] **Step 1: Update layout tests to assert glassmorphic header and sidebar pills**

In `client/tests/layout.test.tsx`, assert that the brand header contains the logo icon badge, home link, mode toggles, and all navigation items.

- [ ] **Step 2: Run test to verify expected behavior**

Run: `pnpm --filter client test tests/layout.test.tsx`

- [ ] **Step 3: Implement glassmorphic AppLayout**

- Header: Glassmorphism (`backdrop-filter: blur(12px)`, `rgba(255,255,255,0.85)` / `rgba(18,20,29,0.85)`), 38px calendar icon badge, Home button with IconHome.
- Sidebar: Floating glassmorphic rail with rounded nav pills (`radius="md"`), active indicator with soft indigo background, colored icon accents, and bottom dataset status.

- [ ] **Step 4: Run test to verify passes**

Run: `pnpm --filter client test tests/layout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add client/src/layouts/AppLayout.tsx client/tests/layout.test.tsx
git commit -m "feat(layout): revamp AppLayout with glassmorphic header and floating pill sidebar"
```

---

### Task 3: Modernized Dashboard & AI Generator Cockpit

**Files:**
- Modify: `client/src/pages/Dashboard.tsx`
- Modify: `client/src/pages/Generator.tsx`
- Test: `client/tests/generator.test.tsx`
- Test: `client/tests/management-pages.test.tsx`

**Interfaces:**
- Consumes: `DashboardMetricCard`, `PageHeader`, `useTeachers`, `useClasses`, `useSubjects`, `useActiveSchedule`, solver worker hooks
- Produces: Elevated Dashboard and high-telemetry Generator cockpit

- [ ] **Step 1: Run baseline generator and management tests**

Run: `pnpm --filter client test tests/generator.test.tsx tests/management-pages.test.tsx`

- [ ] **Step 2: Revamp `Dashboard.tsx`**

- Add Hero Welcome banner with gradient mesh background, status summary, and primary "Generate Timetable" CTA.
- Replace basic stat cards with 4 `DashboardMetricCard` components (Teachers, Classes, Subjects, Timetable status) matching the landing stats ribbon.
- Restyle the 4 quick action cards with gradient icon chips, hover lift, and directional arrow animation.

- [ ] **Step 3: Revamp `Generator.tsx`**

- Style configuration card with glassmorphic border and prominent rocket CTA button.
- Integrate landing-style telemetry progress bar with indigo-to-cyan gradient.
- Display live metric counters (Lectures, Conflicts with 0-clash green pulse, Elapsed Time) and phase indicator chips.
- Add celebratory emerald outcome card when generation succeeds.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter client test tests/generator.test.tsx tests/management-pages.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add client/src/pages/Dashboard.tsx client/src/pages/Generator.tsx
git commit -m "feat(views): overhaul Dashboard and Generator views with landing page telemetry and cards"
```

---

### Task 4: Interactive Timetable Schedule & Data Management Views

**Files:**
- Modify: `client/src/pages/ScheduleView.tsx`
- Modify: `client/src/pages/Teachers.tsx`
- Modify: `client/src/pages/Classes.tsx`
- Modify: `client/src/pages/Subjects.tsx`
- Modify: `client/src/pages/Curriculum.tsx`
- Modify: `client/src/pages/Settings.tsx`
- Test: `client/tests/schedule-view.test.tsx`
- Test: `client/tests/timetable-views.test.tsx`

**Interfaces:**
- Consumes: Timetable matrix components, data management hooks
- Produces: Polished interactive timetable and data management tables

- [ ] **Step 1: Run baseline timetable tests**

Run: `pnpm --filter client test tests/schedule-view.test.tsx tests/timetable-views.test.tsx`

- [ ] **Step 2: Revamp `ScheduleView.tsx`**

- Restyle view selector pills and export action toolbar with sleek buttons.
- Elevate timetable slot blocks with clean subject color chips, teacher icons, and room badges matching `TimetablePreviewCard`.
- Add zero-conflict validation badge card.

- [ ] **Step 3: Revamp Data Management Views (`Teachers`, `Classes`, `Subjects`, `Curriculum`, `Settings`)**

- Wrap data tables in elevated cards with glassmorphic filter/search toolbar.
- Add workload capacity pills and gradient action buttons.
- Categorize Settings into clean grouped cards with switch rows.

- [ ] **Step 4: Run tests to verify all pass**

Run: `pnpm --filter client test tests/schedule-view.test.tsx tests/timetable-views.test.tsx tests/management-pages.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 4**

```bash
git add client/src/pages/ScheduleView.tsx client/src/pages/Teachers.tsx client/src/pages/Classes.tsx client/src/pages/Subjects.tsx client/src/pages/Curriculum.tsx client/src/pages/Settings.tsx
git commit -m "feat(views): modernize Timetable matrix and data management screens"
```

---

### Task 5: End-to-End Monorepo Verification & Visual Polish Check

**Files:**
- Review: all modified client files
- Test: Entire repository

**Interfaces:**
- Consumes: All packages and test suites
- Produces: 100% verified production-ready application suite

- [ ] **Step 1: Run full test suite across all monorepo packages**

Run: `pnpm test`
Expected: PASS (all 35 test files, 160+ tests passing)

- [ ] **Step 2: Run TypeScript typecheck**

Run: `pnpm typecheck`
Expected: PASS with 0 errors

- [ ] **Step 3: Run production build**

Run: `pnpm build`
Expected: PASS (successful bundle and assets generation)

- [ ] **Step 4: Commit and finalize**

```bash
git commit -m "chore(release): complete application suite design unification"
```
